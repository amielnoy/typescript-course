// Lesson 3 – Topic 03: Getters and Setters – Solutions

// ---------- Warm-ups (in class, ~5 minutes each) ----------
// Two short exercises we solve during the lesson, right after the examples – before Exercise 1.

export class Duration {
  private _ms: number;

  constructor(ms: number) {
    this._ms = ms;
  }

  get ms(): number {
    return this._ms;
  }

  get seconds(): number {
    return this._ms / 1000; // computed from the one stored value
  }

  set seconds(value: number) {
    this._ms = value * 1000;
  }
}

export class Username {
  private _value = "";

  constructor(value: string) {
    this.value = value; // through the setter – the same validation on creation
  }

  get value(): string {
    return this._value;
  }

  set value(v: string) {
    const clean = v.trim().toLowerCase();
    if (clean === "") throw new Error("Username cannot be empty"); // before the assignment – nothing changes
    this._value = clean;
  }
}

// ---------- Exercises ----------

export class TestCase {
  private _name = "";

  constructor(name: string) {
    this.name = name; // goes through the setter => validation
  }

  get name(): string {
    return this._name;
  }

  set name(value: string) {
    const trimmed = value.trim();
    if (trimmed === "") {
      throw new Error("Test name cannot be empty");
    }
    this._name = trimmed;
  }

  // A computed getter – no setter, so it's "read-only"
  get slug(): string {
    return this._name.toLowerCase().split(/\s+/).join("-");
  }
}

export class Viewport {
  private _width = 0;
  private _height = 0;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  get width(): number {
    return this._width;
  }

  set width(value: number) {
    if (!Number.isInteger(value) || value < 320 || value > 3840) {
      throw new RangeError(`width must be an integer between 320 and 3840, got ${value}`);
    }
    this._width = value;
  }

  get height(): number {
    return this._height;
  }

  set height(value: number) {
    if (!Number.isInteger(value) || value < 240 || value > 2160) {
      throw new RangeError(`height must be an integer between 240 and 2160, got ${value}`);
    }
    this._height = value;
  }

  get label(): string {
    return `${this._width}x${this._height}`;
  }

  get isMobile(): boolean {
    return this._width < 768;
  }

  get orientation(): "landscape" | "portrait" | "square" {
    if (this._width > this._height) return "landscape";
    if (this._width < this._height) return "portrait";
    return "square";
  }
}

export class RetryPolicy {
  private _maxRetries = 0;
  private _delayMs = 1000;

  get maxRetries(): number {
    return this._maxRetries;
  }

  set maxRetries(value: number) {
    if (!Number.isInteger(value) || value < 0 || value > 5) {
      throw new RangeError(`maxRetries must be an integer between 0 and 5, got ${value}`);
    }
    this._maxRetries = value;
  }

  get delayMs(): number {
    return this._delayMs;
  }

  set delayMs(value: number) {
    if (value < 0) {
      throw new RangeError(`delayMs must be >= 0, got ${value}`);
    }
    this._delayMs = value;
  }

  get delaySeconds(): number {
    return this._delayMs / 1000;
  }

  set delaySeconds(value: number) {
    this.delayMs = value * 1000; // uses the delayMs setter – the validation lives in one place
  }

  get attempts(): number {
    return this._maxRetries + 1;
  }

  get totalWaitMs(): number {
    return this._maxRetries * this._delayMs;
  }
}

export class TestRunStats {
  private passedCount = 0;
  private failedNames: string[] = [];

  record(testName: string, passed: boolean): void {
    if (passed) {
      this.passedCount++;
    } else {
      this.failedNames.push(testName);
    }
  }

  get total(): number {
    return this.passed + this.failed;
  }

  get passed(): number {
    return this.passedCount;
  }

  get failed(): number {
    return this.failedNames.length;
  }

  get passRate(): number {
    if (this.total === 0) return 0;
    return Math.round((this.passed / this.total) * 100);
  }

  get status(): "NO_RUN" | "GREEN" | "RED" {
    if (this.total === 0) return "NO_RUN";
    return this.failed === 0 ? "GREEN" : "RED";
  }

  get failedTests(): string[] {
    return [...this.failedNames];
  }
}

export class EnvironmentConfig {
  private _baseUrl = "";
  private _env = "dev";

  constructor(baseUrl: string, env = "dev") {
    this.baseUrl = baseUrl;
    this.env = env;
  }

  get baseUrl(): string {
    return this._baseUrl;
  }

  set baseUrl(value: string) {
    if (!value.startsWith("http://") && !value.startsWith("https://")) {
      throw new Error(`baseUrl must start with http:// or https://, got ${value}`);
    }
    this._baseUrl = value.replace(/\/+$/, ""); // normalization – no trailing slashes
  }

  get env(): string {
    return this._env;
  }

  set env(value: string) {
    const normalized = value.toLowerCase();
    if (normalized !== "dev" && normalized !== "staging" && normalized !== "prod") {
      throw new Error(`Unknown env: ${value}`);
    }
    this._env = normalized;
  }

  get isProduction(): boolean {
    return this._env === "prod";
  }

  endpoint(path: string): string {
    return `${this._baseUrl}/${path.replace(/^\/+/, "")}`;
  }
}

// ============================================================
// Self-check – run:  npm run solution -- 03 03
// On every line, the value left of "=> expected:" must equal the value on its right.
// (No need to change the code below this line)
// ============================================================

// Trying to assign a value to a property that only has a getter – at runtime this throws a TypeError
const forceAssign = (target: object, key: string, value: unknown): void => {
  (target as Record<string, unknown>)[key] = value;
};

console.log("\n--- Warm-up A: Duration ---");
try {
  const d = new Duration(1500);
  console.log(d.ms, "=> expected:", 1500);
  console.log(d.seconds, "=> expected:", 1.5);
  d.seconds = 3;
  console.log(d.ms, "=> expected:", 3000);
  console.log(d.seconds, "=> expected:", 3);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Warm-up B: Username ---");
try {
  const user = new Username("  Dana ");
  console.log(user.value, "=> expected:", "dana");
  user.value = "AVI";
  console.log(user.value, "=> expected:", "avi");
  try {
    user.value = "   ";
    console.log("no error", "=> expected:", "Username cannot be empty");
  } catch (err) {
    console.log((err as Error).message, "=> expected:", "Username cannot be empty");
  }
  console.log(user.value, "=> expected:", "avi"); // the invalid value was not stored
  try {
    new Username("");
    console.log("no error", "=> expected:", "Username cannot be empty");
  } catch (err) {
    console.log((err as Error).message, "=> expected:", "Username cannot be empty"); // the constructor validates too
  }
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 1: TestCase ---");
try {
  const tc = new TestCase("  Login With  Valid User ");
  console.log(tc.name, "=> expected:", "Login With  Valid User");
  console.log(tc.slug, "=> expected:", "login-with-valid-user");

  tc.name = "Checkout as Guest";
  console.log(tc.name, "=> expected:", "Checkout as Guest");
  console.log(tc.slug, "=> expected:", "checkout-as-guest"); // recomputed on every read

  try {
    tc.name = "   ";
    console.log("did not throw", "=> expected:", "an error");
  } catch (err) {
    if ((err as Error).message === "TODO") throw err;
    console.log((err as Error).message, "=> expected:", "Test name cannot be empty");
  }
  console.log(tc.name, "=> expected:", "Checkout as Guest"); // an invalid value is not stored
  try {
    new TestCase("");
    console.log("did not throw", "=> expected:", "an error");
  } catch (err) {
    if ((err as Error).message === "TODO") throw err;
    console.log((err as Error).message, "=> expected:", "Test name cannot be empty");
  }

  // slug is a getter only – trying to assign a value to it throws a TypeError
  try {
    forceAssign(tc, "slug", "hacked");
    console.log("did not throw", "=> expected:", "TypeError");
  } catch (err) {
    console.log(err instanceof TypeError, "=> expected:", true);
  }
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 2: Viewport ---");
try {
  const desktop = new Viewport(1280, 720);
  console.log(desktop.label, "=> expected:", "1280x720");
  console.log(desktop.isMobile, "=> expected:", false);
  console.log(desktop.orientation, "=> expected:", "landscape");

  const phone = new Viewport(390, 844);
  console.log(phone.isMobile, "=> expected:", true);
  console.log(phone.orientation, "=> expected:", "portrait");

  phone.width = 844;
  console.log(phone.orientation, "=> expected:", "square");
  console.log(phone.isMobile, "=> expected:", false);
  console.log(phone.label, "=> expected:", "844x844");

  // Boundaries – these are valid and must not throw
  console.log(new Viewport(320, 240).label, "=> expected:", "320x240");
  console.log(new Viewport(3840, 2160).label, "=> expected:", "3840x2160");

  // Invalid values – each one should throw a RangeError
  try {
    new Viewport(319, 600);
    console.log("did not throw", "=> expected:", "RangeError");
  } catch (err) {
    if ((err as Error).message === "TODO") throw err;
    console.log(err instanceof RangeError, "=> expected:", true);
  }
  try {
    new Viewport(800, 2161);
    console.log("did not throw", "=> expected:", "RangeError");
  } catch (err) {
    if ((err as Error).message === "TODO") throw err;
    console.log(err instanceof RangeError, "=> expected:", true);
  }
  try {
    desktop.width = 1024.5;
    console.log("did not throw", "=> expected:", "RangeError");
  } catch (err) {
    if ((err as Error).message === "TODO") throw err;
    console.log(err instanceof RangeError, "=> expected:", true);
  }
  try {
    desktop.height = 100;
    console.log("did not throw", "=> expected:", "RangeError");
  } catch (err) {
    if ((err as Error).message === "TODO") throw err;
    console.log(err instanceof RangeError, "=> expected:", true);
  }
  console.log(desktop.label, "=> expected:", "1280x720"); // unchanged

  // label is a getter only
  try {
    forceAssign(desktop, "label", "1x1");
    console.log("did not throw", "=> expected:", "TypeError");
  } catch (err) {
    console.log(err instanceof TypeError, "=> expected:", true);
  }
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 3: RetryPolicy ---");
try {
  const p = new RetryPolicy();
  console.log(p.maxRetries, "=> expected:", 0);
  console.log(p.delayMs, "=> expected:", 1000);
  console.log(p.attempts, "=> expected:", 1);
  console.log(p.totalWaitMs, "=> expected:", 0);

  p.maxRetries = 3;
  p.delayMs = 500;
  console.log(p.attempts, "=> expected:", 4);
  console.log(p.totalWaitMs, "=> expected:", 1500);
  console.log(p.delaySeconds, "=> expected:", 0.5);

  p.delaySeconds = 2;
  console.log(p.delayMs, "=> expected:", 2000);
  console.log(p.totalWaitMs, "=> expected:", 6000);

  // Invalid values – each one should throw a RangeError
  const badValues: Array<[string, () => void]> = [
    ["maxRetries = 6", () => { p.maxRetries = 6; }],
    ["maxRetries = -1", () => { p.maxRetries = -1; }],
    ["maxRetries = 1.5", () => { p.maxRetries = 1.5; }],
    ["delayMs = -1", () => { p.delayMs = -1; }],
    ["delaySeconds = -0.1", () => { p.delaySeconds = -0.1; }], // delayMs's validation applies here too
  ];
  for (const [label, assign] of badValues) {
    try {
      assign();
      console.log(label, "- did not throw", "=> expected:", "RangeError");
    } catch (err) {
      if ((err as Error).message === "TODO") throw err;
      console.log(label, "- RangeError?", err instanceof RangeError, "=> expected:", true);
    }
  }
  console.log(p.maxRetries, "=> expected:", 3);
  console.log(p.delayMs, "=> expected:", 2000);

  p.maxRetries = 0;
  p.delayMs = 0;
  console.log(p.totalWaitMs, "=> expected:", 0);

  // attempts is a getter only
  try {
    forceAssign(p, "attempts", 10);
    console.log("did not throw", "=> expected:", "TypeError");
  } catch (err) {
    console.log(err instanceof TypeError, "=> expected:", true);
  }
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 4: TestRunStats ---");
try {
  const stats = new TestRunStats();
  console.log(stats.total, "=> expected:", 0);
  console.log(stats.passRate, "=> expected:", 0);
  console.log(stats.status, "=> expected:", "NO_RUN");
  console.log(stats.failedTests, "=> expected:", []);

  stats.record("login", true);
  stats.record("search", true);
  console.log(stats.status, "=> expected:", "GREEN");
  console.log(stats.passRate, "=> expected:", 100);

  stats.record("checkout", false);
  console.log(stats.total, "=> expected:", 3);
  console.log(stats.passed, "=> expected:", 2);
  console.log(stats.failed, "=> expected:", 1);
  console.log(stats.passRate, "=> expected:", 67);
  console.log(stats.status, "=> expected:", "RED");

  stats.record("logout", false);
  console.log(stats.failedTests, "=> expected:", ["checkout", "logout"]);
  console.log(stats.passRate, "=> expected:", 50);

  const copy: string[] = stats.failedTests;
  copy.push("fake");
  console.log(stats.failedTests, "=> expected:", ["checkout", "logout"]);

  // total and status are getters only
  try {
    forceAssign(stats, "total", 0);
    console.log("did not throw", "=> expected:", "TypeError");
  } catch (err) {
    console.log(err instanceof TypeError, "=> expected:", true);
  }
  try {
    forceAssign(stats, "status", "GREEN");
    console.log("did not throw", "=> expected:", "TypeError");
  } catch (err) {
    console.log(err instanceof TypeError, "=> expected:", true);
  }
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 5 (Bonus): EnvironmentConfig ---");
try {
  const cfg = new EnvironmentConfig("https://qa.example.com///");
  console.log(cfg.baseUrl, "=> expected:", "https://qa.example.com");
  console.log(cfg.env, "=> expected:", "dev");
  console.log(cfg.isProduction, "=> expected:", false);
  console.log(cfg.endpoint("/users"), "=> expected:", "https://qa.example.com/users");
  console.log(cfg.endpoint("users/5"), "=> expected:", "https://qa.example.com/users/5");
  console.log(cfg.endpoint("//health"), "=> expected:", "https://qa.example.com/health");

  cfg.env = "PROD";
  console.log(cfg.env, "=> expected:", "prod");
  console.log(cfg.isProduction, "=> expected:", true);
  cfg.env = "Staging";
  console.log(cfg.env, "=> expected:", "staging");

  try {
    cfg.env = "qa";
    console.log("did not throw", "=> expected:", "an error");
  } catch (err) {
    if ((err as Error).message === "TODO") throw err;
    console.log("threw:", (err as Error).message, "=> expected:", "an error");
  }
  console.log(cfg.env, "=> expected:", "staging");

  cfg.baseUrl = "http://localhost:3000/";
  console.log(cfg.endpoint("api"), "=> expected:", "http://localhost:3000/api");
  try {
    cfg.baseUrl = "localhost:3000";
    console.log("did not throw", "=> expected:", "an error");
  } catch (err) {
    if ((err as Error).message === "TODO") throw err;
    console.log("threw:", (err as Error).message, "=> expected:", "an error");
  }
  try {
    new EnvironmentConfig("ftp://files.example.com");
    console.log("did not throw", "=> expected:", "an error");
  } catch (err) {
    if ((err as Error).message === "TODO") throw err;
    console.log("threw:", (err as Error).message, "=> expected:", "an error");
  }
  try {
    new EnvironmentConfig("https://ok.example.com", "local");
    console.log("did not throw", "=> expected:", "an error");
  } catch (err) {
    if ((err as Error).message === "TODO") throw err;
    console.log("threw:", (err as Error).message, "=> expected:", "an error");
  }
  console.log(new EnvironmentConfig("https://ok.example.com", "PROD").isProduction, "=> expected:", true);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}
