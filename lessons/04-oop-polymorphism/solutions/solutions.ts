// Lesson 4 – Summary exercises – Solutions
// Encapsulation and Inheritance (review) + Polymorphism
// Check yourself: npm run solution -- 04 (self-check at the end of the file)

// ---------- Exercise 1 – Encapsulation: a test environment ----------
export class Environment {
  private _baseUrl = "";

  constructor(
    readonly name: string,
    baseUrl: string,
  ) {
    this.baseUrl = baseUrl; // the same validation as the setter
  }

  get baseUrl(): string {
    return this._baseUrl;
  }

  set baseUrl(value: string) {
    if (!value.startsWith("http://") && !value.startsWith("https://")) {
      throw new Error(`Invalid base URL: ${value}`);
    }
    this._baseUrl = value.endsWith("/") ? value.slice(0, -1) : value;
  }

  url(path: string): string {
    return this._baseUrl + path;
  }
}

// ---------- Exercise 2 – Inheritance: HTTP requests ----------
export class HttpRequest {
  constructor(
    protected method: string,
    protected path: string,
  ) {}

  describe(): string {
    return `${this.method} ${this.path}`;
  }
}

export class AuthorizedRequest extends HttpRequest {
  constructor(
    path: string,
    private token: string,
    method = "GET",
  ) {
    super(method, path);
  }

  override describe(): string {
    return `${super.describe()} [token ***${this.token.slice(-4)}]`;
  }
}

export class JsonRequest extends AuthorizedRequest {
  constructor(
    path: string,
    token: string,
    private body: object,
  ) {
    super(path, token, "POST");
  }

  override describe(): string {
    return `${super.describe()} body=${JSON.stringify(this.body)}`;
  }
}

// ---------- Exercise 3 – Polymorphism: scenario steps ----------
export class FakePage {
  url = "";
  fields: Record<string, string> = {};
  clicks: string[] = [];
}

export class Step {
  run(page: FakePage): string {
    return "nothing to do";
  }
}

export class NavigateStep extends Step {
  constructor(private path: string) {
    super();
  }

  override run(page: FakePage): string {
    page.url = this.path;
    return `navigate to ${this.path}`;
  }
}

export class TypeStep extends Step {
  constructor(
    private field: string,
    private text: string,
    private secret = false,
  ) {
    super();
  }

  override run(page: FakePage): string {
    page.fields[this.field] = this.text;
    const shown = this.secret ? "***" : `"${this.text}"`;
    return `type ${shown} into ${this.field}`;
  }
}

export class ClickStep extends Step {
  constructor(private button: string) {
    super();
  }

  override run(page: FakePage): string {
    page.clicks.push(this.button);
    return `click ${this.button}`;
  }
}

export function runScenario(page: FakePage, steps: Step[]): string[] {
  return steps.map((step, i) => `${i + 1}. ${step.run(page)}`);
}

// ---------- Exercise 4 (Bonus) – All three together: a device farm ----------
export class Device {
  #battery = 100;

  constructor(readonly name: string) {}

  get battery(): number {
    return this.#battery;
  }

  protected cost(minutes: number): number {
    return minutes;
  }

  runTest(minutes: number): string {
    const needed = this.cost(minutes);
    if (needed > this.#battery) {
      return `${this.name}: skipped (battery ${this.#battery}%)`;
    }
    this.#battery -= needed;
    return `${this.name}: ran ${minutes}m (battery ${this.#battery}%)`;
  }
}

export class Phone extends Device {
  protected override cost(minutes: number): number {
    return minutes * 2;
  }
}

export class Tablet extends Device {}

export class Emulator extends Device {
  protected override cost(minutes: number): number {
    return 0;
  }

  override runTest(minutes: number): string {
    return `${super.runTest(minutes)} [emulator]`;
  }
}

export function runOnAll(devices: Device[], minutes: number): string[] {
  return devices.map((d) => d.runTest(minutes));
}

// ============================================================
// Self-check – run:  npm run solution -- 04
// (No need to change the code below this line)
// ============================================================

console.log("\n--- Exercise 1: Environment ---");
try {
  const staging = new Environment("staging", "https://staging.shop.test/");
  console.log(staging.baseUrl, "=> expected:", "https://staging.shop.test");
  console.log(staging.url("/api/users"), "=> expected:", "https://staging.shop.test/api/users");
  staging.baseUrl = "http://localhost:3000";
  console.log(staging.url("/health"), "=> expected:", "http://localhost:3000/health");
  try {
    staging.baseUrl = "localhost:3000";
    console.log("did not throw", "=> expected:", "an error");
  } catch (err) {
    if ((err as Error).message === "TODO") throw err;
    console.log("threw:", (err as Error).message, "=> expected:", "an error");
  }
  console.log(staging.baseUrl, "=> expected:", "http://localhost:3000"); // a rejected value changes nothing
  try {
    new Environment("prod", "ftp://shop.test");
    console.log("did not throw", "=> expected:", "an error");
  } catch (err) {
    if ((err as Error).message === "TODO") throw err;
    console.log("threw:", (err as Error).message, "=> expected:", "an error");
  }
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 2: HttpRequest hierarchy ---");
try {
  const plain = new HttpRequest("DELETE", "/users/7");
  const auth = new AuthorizedRequest("/users", "abcd-1234-wxyz");
  const json = new JsonRequest("/users", "abcd-1234-wxyz", { name: "Dana" });
  console.log(plain.describe(), "=> expected:", "DELETE /users/7");
  console.log(auth.describe(), "=> expected:", "GET /users [token ***wxyz]");
  console.log(json.describe(), "=> expected:", 'POST /users [token ***wxyz] body={"name":"Dana"}');
  console.log(json instanceof AuthorizedRequest, "=> expected:", true);
  console.log(json instanceof HttpRequest, "=> expected:", true);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 3: runScenario ---");
try {
  const page = new FakePage();
  const log = runScenario(page, [
    new NavigateStep("/login"),
    new TypeStep("email", "dana@shop.test"),
    new TypeStep("password", "Secret123", true),
    new ClickStep("Sign in"),
    new Step(),
  ]);
  console.log(log[0], "=> expected:", "1. navigate to /login");
  console.log(log[1], "=> expected:", '2. type "dana@shop.test" into email');
  console.log(log[2], "=> expected:", "3. type *** into password");
  console.log(log[3], "=> expected:", "4. click Sign in");
  console.log(log[4], "=> expected:", "5. nothing to do");
  console.log(page.url, "=> expected:", "/login");
  console.log(page.fields.password, "=> expected:", "Secret123");
  console.log(page.clicks.join(","), "=> expected:", "Sign in");
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 4 (Bonus): device farm ---");
try {
  const devices = [new Phone("Pixel"), new Tablet("iPad"), new Emulator("Android-14")];
  console.log(runOnAll(devices, 30), "=> expected:", [
    "Pixel: ran 30m (battery 40%)",
    "iPad: ran 30m (battery 70%)",
    "Android-14: ran 30m (battery 100%) [emulator]",
  ]);
  console.log(runOnAll(devices, 30), "=> expected:", [
    "Pixel: skipped (battery 40%)",
    "iPad: ran 30m (battery 40%)",
    "Android-14: ran 30m (battery 100%) [emulator]",
  ]);
  console.log(devices[0].battery, "=> expected:", 40);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}
