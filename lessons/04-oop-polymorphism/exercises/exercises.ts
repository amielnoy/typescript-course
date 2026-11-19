// Lesson 4 – Summary exercises
// Encapsulation and Inheritance (review) + Polymorphism
// ------------------------------------------------------------
// Instructions:
//   1. Fill in every constructor and method in place of the line  throw new Error("TODO")
//      (in subclass constructors – keep the call to super and adjust its arguments as needed)
//   2. Exercises 1–2 review lesson 3 (solve them after the review part of the lesson),
//      Exercises 3–4 add polymorphism – no instanceof and no if on the type of the object.
//   3. Remember (noImplicitOverride): a method that replaces the parent's one needs override.
//   4. Check yourself: npm run exercise -- 04 (self-check at the end of the file)
// ------------------------------------------------------------

/**
 * Exercise 1 – Encapsulation: a test environment
 * - name: public and readonly (it never changes after the constructor)
 * - baseUrl: stored in the private field _baseUrl, read through a getter and written through a setter
 * - the setter:
 *     throws an Error if the value does not start with "http://" or "https://"
 *     removes one trailing "/" ("https://staging.shop.test/" => "https://staging.shop.test")
 *   The constructor must go through the same setter (don't duplicate the validation!)
 * - url(path) => baseUrl + path
 *   new Environment("staging", "https://staging.shop.test/").url("/api/users")
 *     => "https://staging.shop.test/api/users"
 */
export class Environment {
  private _baseUrl = "";

  constructor(
    readonly name: string,
    baseUrl: string,
  ) {
    throw new Error("TODO");
  }

  get baseUrl(): string {
    throw new Error("TODO");
  }

  set baseUrl(value: string) {
    throw new Error("TODO");
  }

  url(path: string): string {
    throw new Error("TODO");
  }
}

/**
 * Exercise 2 – Inheritance: HTTP requests
 * HttpRequest is already implemented. Complete the two subclasses:
 *
 * AuthorizedRequest extends HttpRequest
 * - constructor(path, token, method = "GET") – the token is private (nobody outside reads it)
 * - override describe() => the parent's describe() + " [token ***<last 4 characters of the token>]"
 *     new AuthorizedRequest("/users", "abcd-1234-wxyz").describe() => "GET /users [token ***wxyz]"
 *
 * JsonRequest extends AuthorizedRequest
 * - constructor(path, token, body: object) – always a "POST"
 * - override describe() => the parent's describe() + " body=" + JSON.stringify(body)
 *     new JsonRequest("/users", "abcd-1234-wxyz", { name: "Dana" }).describe()
 *       => 'POST /users [token ***wxyz] body={"name":"Dana"}'
 * Use super.describe() – each level adds only its own part.
 */
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
  private token: string;

  constructor(path: string, token: string, method = "GET") {
    super("", "");
    throw new Error("TODO");
  }

  override describe(): string {
    throw new Error("TODO");
  }
}

export class JsonRequest extends AuthorizedRequest {
  private body: object;

  constructor(path: string, token: string, body: object) {
    super("", "");
    throw new Error("TODO");
  }

  override describe(): string {
    throw new Error("TODO");
  }
}

/**
 * Exercise 3 – Polymorphism: scenario steps
 * FakePage and Step are already implemented. Every step changes the page and returns a line for the log:
 *
 *   NavigateStep(path)                    sets page.url = path            => "navigate to /login"
 *   TypeStep(field, text, secret = false) sets page.fields[field] = text  => 'type "dana@shop.test" into email'
 *                                         when secret is true the text is hidden in the log => "type *** into password"
 *   ClickStep(button)                     adds button to page.clicks      => "click Sign in"
 *
 * runScenario(page, steps) – runs the steps in order and returns the log lines, numbered from 1:
 *   ["1. navigate to /login", '2. type "dana@shop.test" into email', ...]
 * A plain Step (the base class) also works – it logs "nothing to do".
 */
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
  private path: string;

  constructor(path: string) {
    super();
    throw new Error("TODO");
  }

  override run(page: FakePage): string {
    throw new Error("TODO");
  }
}

export class TypeStep extends Step {
  private field: string;
  private text: string;
  private secret: boolean;

  constructor(field: string, text: string, secret = false) {
    super();
    throw new Error("TODO");
  }

  override run(page: FakePage): string {
    throw new Error("TODO");
  }
}

export class ClickStep extends Step {
  private button: string;

  constructor(button: string) {
    super();
    throw new Error("TODO");
  }

  override run(page: FakePage): string {
    throw new Error("TODO");
  }
}

export function runScenario(page: FakePage, steps: Step[]): string[] {
  throw new Error("TODO");
}

/**
 * Exercise 4 (Bonus) – All three together: a device farm
 * Device:
 * - the battery level lives in the # field #battery (starts at 100) – readable only through the getter battery
 * - protected cost(minutes) – how much battery a test of that length uses. In Device: minutes
 * - runTest(minutes):
 *     if cost(minutes) is more than the battery => "<name>: skipped (battery <battery>%)"
 *     otherwise drain the battery by cost(minutes) => "<name>: ran <minutes>m (battery <battery after>%)"
 * Subclasses – each one changes only what is different:
 * - Phone:    cost = minutes * 2
 * - Tablet:   nothing to change (uses the Device cost)
 * - Emulator: cost = 0, and runTest returns the parent's result + " [emulator]"  (super.runTest!)
 * runOnAll(devices, minutes) => the runTest result of every device, in order.
 *   runOnAll([new Phone("Pixel"), new Tablet("iPad"), new Emulator("Android-14")], 30) =>
 *     ["Pixel: ran 30m (battery 40%)", "iPad: ran 30m (battery 70%)", "Android-14: ran 30m (battery 100%) [emulator]"]
 * Note: runTest is written once in Device – but calls the cost() of the real object.
 */
export class Device {
  #battery = 100;

  constructor(readonly name: string) {}

  get battery(): number {
    throw new Error("TODO");
  }

  protected cost(minutes: number): number {
    throw new Error("TODO");
  }

  runTest(minutes: number): string {
    throw new Error("TODO");
  }
}

export class Phone extends Device {
  // TODO: override cost
}

export class Tablet extends Device {}

export class Emulator extends Device {
  // TODO: override cost and runTest
}

export function runOnAll(devices: Device[], minutes: number): string[] {
  throw new Error("TODO");
}

// ============================================================
// Self-check – run:  npm run exercise -- 04
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
