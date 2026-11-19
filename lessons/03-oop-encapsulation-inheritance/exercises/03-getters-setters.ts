// Lesson 3 – Topic 03: Getters and Setters – Exercises
// ------------------------------------------------------------
// Instructions:
//   1. Fill in every constructor, getter, setter and method in place of the line  throw new Error("TODO")
//   2. Add the private fields that hold the values (e.g. _width) yourself.
//   3. Check yourself: npm run exercise -- 03 03 (self-check at the end of the file)
// ------------------------------------------------------------

// ---------- Warm-ups (in class, ~5 minutes each) ----------
// Two short exercises we solve during the lesson, right after the examples – before Exercise 1.

/**
 * Warm-up A – Duration: one stored value, two "views"
 * - The constructor receives ms – store it in a private field _ms
 * - get ms(): number       – the value in milliseconds
 * - get seconds(): number  – the value in seconds (ms / 1000)
 * - set seconds(value)     – stores value * 1000 in _ms
 *   const d = new Duration(1500);
 *   d.seconds => 1.5;   d.seconds = 3;   d.ms => 3000
 * Note: no parentheses – d.seconds, not d.seconds()
 */
export class Duration {
  constructor(ms: number) {
    throw new Error("TODO");
  }

  get ms(): number {
    throw new Error("TODO");
  }

  get seconds(): number {
    throw new Error("TODO");
  }

  set seconds(value: number) {
    throw new Error("TODO");
  }
}

/**
 * Warm-up B – Username: a setter that cleans and validates
 * - Add a private field _value
 * - set value(v): trim the spaces and convert to lower case.
 *     If nothing is left – throw new Error("Username cannot be empty") and DON'T change the stored value.
 * - get value(): string
 * - The constructor stores the initial value THROUGH the setter (this.value = value),
 *   so the same rules apply when the object is created.
 *   new Username("  Dana ").value => "dana"
 */
export class Username {
  constructor(value: string) {
    throw new Error("TODO");
  }

  get value(): string {
    throw new Error("TODO");
  }

  set value(v: string) {
    throw new Error("TODO");
  }
}

// ---------- Exercises ----------

/**
 * Exercise 1 – A test case name
 * - getter/setter named name:
 *     The setter trim()s the value. If it is empty after the trim => throws Error("Test name cannot be empty")
 *     (the constructor must also go through the setter – write this.name = name)
 * - a getter only (no setter) named slug:
 *     the name in lowercase, with every run of whitespace replaced by "-"
 *     "Login With  Valid User" => "login-with-valid-user"
 *
 * Hint: value.toLowerCase().split(/\s+/).join("-")
 * Note: a getter without a setter is "read-only" – trying to assign a value to it throws a TypeError at runtime.
 */
export class TestCase {
  constructor(name: string) {
    throw new Error("TODO");
  }

  get name(): string {
    throw new Error("TODO");
  }

  set name(value: string) {
    throw new Error("TODO");
  }

  get slug(): string {
    throw new Error("TODO");
  }
}

/**
 * Exercise 2 – Screen size (Viewport) for UI tests
 * - getter/setter named width: an integer between 320 and 3840 (inclusive), otherwise throws a RangeError
 * - getter/setter named height: an integer between 240 and 2160 (inclusive), otherwise throws a RangeError
 *   (the constructor goes through both setters)
 * - computed getters (no setter):
 *     label       => "1280x720"
 *     isMobile    => true if width is less than 768
 *     orientation => "landscape" if width > height, "portrait" if width < height, otherwise "square"
 *
 * Hint: Number.isInteger(value)
 */
export class Viewport {
  constructor(width: number, height: number) {
    throw new Error("TODO");
  }

  get width(): number {
    throw new Error("TODO");
  }

  set width(value: number) {
    throw new Error("TODO");
  }

  get height(): number {
    throw new Error("TODO");
  }

  set height(value: number) {
    throw new Error("TODO");
  }

  get label(): string {
    throw new Error("TODO");
  }

  get isMobile(): boolean {
    throw new Error("TODO");
  }

  get orientation(): "landscape" | "portrait" | "square" {
    throw new Error("TODO");
  }
}

/**
 * Exercise 3 – A retry policy for "flaky" tests
 * Default values: maxRetries = 0, delayMs = 1000
 * - getter/setter named maxRetries: an integer between 0 and 5, otherwise RangeError
 * - getter/setter named delayMs: a number >= 0, otherwise RangeError
 * - getter/setter named delaySeconds – the same value in different units:
 *     get => delayMs / 1000
 *     set => updates delayMs (seconds * 1000) **through the delayMs setter** so that the validation runs
 * - computed getters:
 *     attempts    => maxRetries + 1   (the first attempt + the retries)
 *     totalWaitMs => maxRetries * delayMs
 */
export class RetryPolicy {
  get maxRetries(): number {
    throw new Error("TODO");
  }

  set maxRetries(value: number) {
    throw new Error("TODO");
  }

  get delayMs(): number {
    throw new Error("TODO");
  }

  set delayMs(value: number) {
    throw new Error("TODO");
  }

  get delaySeconds(): number {
    throw new Error("TODO");
  }

  set delaySeconds(value: number) {
    throw new Error("TODO");
  }

  get attempts(): number {
    throw new Error("TODO");
  }

  get totalWaitMs(): number {
    throw new Error("TODO");
  }
}

/**
 * Exercise 4 – Test run statistics (computed getters only)
 * - record(testName, passed): void – stores a result (in private fields that you add)
 * - read-only getters:
 *     total       => the number of tests recorded
 *     passed      => how many passed
 *     failed      => how many failed
 *     passRate    => the pass percentage rounded to an integer (Math.round). If there are no tests => 0
 *     status      => "NO_RUN" if there are no tests, "GREEN" if there are no failures, otherwise "RED"
 *     failedTests => a **copy** of the array of failed test names, in the order they were recorded
 *
 * Example: 2 passed + 1 failed => total=3, passRate=67, status="RED"
 */
export class TestRunStats {
  record(testName: string, passed: boolean): void {
    throw new Error("TODO");
  }

  get total(): number {
    throw new Error("TODO");
  }

  get passed(): number {
    throw new Error("TODO");
  }

  get failed(): number {
    throw new Error("TODO");
  }

  get passRate(): number {
    throw new Error("TODO");
  }

  get status(): "NO_RUN" | "GREEN" | "RED" {
    throw new Error("TODO");
  }

  get failedTests(): string[] {
    throw new Error("TODO");
  }
}

/**
 * Exercise 5 (Bonus) – Environment config with setters that "normalize" the value
 * - getter/setter named baseUrl:
 *     must start with "http://" or "https://", otherwise Error
 *     trailing slashes are removed: "https://qa.example.com///" => "https://qa.example.com"
 * - getter/setter named env:
 *     the setter accepts any string, is case-insensitive and stores it in lowercase.
 *     only "dev" / "staging" / "prod" are allowed, otherwise Error
 * - a getter named isProduction => env === "prod"
 * - endpoint(path): string – joins baseUrl and path with exactly one slash:
 *     endpoint("/users") and endpoint("users") => "https://qa.example.com/users"
 * - constructor(baseUrl, env = "dev") – goes through the setters
 *
 * Hint: value.replace(/\/+$/, "") removes trailing slashes, and /^\/+/ removes leading ones.
 */
export class EnvironmentConfig {
  constructor(baseUrl: string, env = "dev") {
    throw new Error("TODO");
  }

  get baseUrl(): string {
    throw new Error("TODO");
  }

  set baseUrl(value: string) {
    throw new Error("TODO");
  }

  get env(): string {
    throw new Error("TODO");
  }

  set env(value: string) {
    throw new Error("TODO");
  }

  get isProduction(): boolean {
    throw new Error("TODO");
  }

  endpoint(path: string): string {
    throw new Error("TODO");
  }
}

// ============================================================
// Self-check – run:  npm run exercise -- 03 03
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
