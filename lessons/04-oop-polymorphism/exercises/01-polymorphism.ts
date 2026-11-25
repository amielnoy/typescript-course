// Lesson 4 – Topic 01: Polymorphism – Exercises
// ------------------------------------------------------------
// Instructions:
//   1. Fill in the body of every method/function in place of the line  throw new Error("TODO")
//   2. Use only what we have learned so far: classes, inheritance (extends), super,
//      method overrides, and arrays typed as the base class.
//      (Abstract classes come in lesson 5 – here every base class is a "regular" one)
//   3. In functions that receive an array typed as the base class – no instanceof and no if on the type!
//      Let polymorphism do the work: just call the method.
//   4. Check yourself: npm run exercise -- 04 01 (self-check at the end of the file)
// ------------------------------------------------------------

/**
 * Exercise 1 – A test logger: a basic override
 * The base class TestLogger is already implemented:  log("hi") => "LOG: hi"
 * Override log in each of the subclasses:
 *
 *   new ConsoleLogger().log("start")        => "[console] start"
 *   new UpperCaseLogger().log("start")      => "LOG: START"
 *   new PrefixLogger("api").log("start")    => "LOG: [api] start"
 *
 * Hint: in UpperCaseLogger and PrefixLogger use super.log(...)
 *       so you don't duplicate the base class's "LOG: " format.
 */
export class TestLogger {
  log(message: string): string {
    return `LOG: ${message}`;
  }
}

export class ConsoleLogger extends TestLogger {
  override log(message: string): string {
    return `[console] ${message}`;
  }
}

export class UpperCaseLogger extends TestLogger {
  override log(message: string): string {
    return super.log(message.toUpperCase());
  }
}

export class PrefixLogger extends TestLogger {
  constructor(private prefix: string) {
    super();
  }

  override log(message: string): string {
    return super.log(`[${this.prefix}] ${message}`);
  }
}

/**
 * Exercise 2 – Browser drivers
 * The base class BrowserDriver is already implemented:
 *   - name()              => "generic"
 *   - supports(feature)   => false  (a generic driver supports nothing)
 *   - launchCommand()     => `${this.name()} --start`   (note: it calls this.name()!)
 *
 * Override in the subclasses:
 *   ChromeDriver   name() => "chrome",   supports: "headless", "devtools", "pdf"
 *   FirefoxDriver  name() => "firefox",  supports: "headless"
 *   SafariDriver   name() => "safari"    (supports is not overridden – it inherits false)
 *
 * Then implement driversSupporting(drivers, feature) – returns the names (name())
 * of the drivers that support feature, in array order.
 *
 *   new ChromeDriver().launchCommand()                    => "chrome --start"
 *   driversSupporting([chrome, firefox, safari], "headless") => ["chrome", "firefox"]
 *
 * Hint: filter + map. launchCommand needs no change – it "gets" the right name on its own.
 */
export class BrowserDriver {
  name(): string {
    return "generic";
  }

  supports(feature: string): boolean {
    return false;
  }

  launchCommand(): string {
    return `${this.name()} --start`;
  }
}

export class ChromeDriver extends BrowserDriver {
  override name(): string {
    return "chrome";
  }

  override supports(feature: string): boolean {
    return ["headless", "devtools", "pdf"].includes(feature);
  }
}

export class FirefoxDriver extends BrowserDriver {
  override name(): string {
    return "firefox";
  }

  override supports(feature: string): boolean {
    return ["headless"].includes(feature);
  }
}

export class SafariDriver extends BrowserDriver {
  override name(): string {
    return "safari";
  }
}

export function driversSupporting(drivers: BrowserDriver[], feature: string): string[] {
  return drivers.filter(driver => driver.supports(feature)).map(driver => driver.name());
}

/**
 * Exercise 3 – Form field validators
 * The base class FieldValidator is already implemented: validate(value) returns null (= valid).
 * Each validator returns an error message (string), or null if the value is valid:
 *
 *   RequiredValidator      => "required"            if the value is empty or only spaces
 *   MinLengthValidator(n)  => "min length n"         if the value is shorter than n   (e.g. "min length 8")
 *   EmailValidator         => "invalid email"       if there is no "@", or no "." after the "@"
 *
 * Also implement collectErrors(value, validators) – runs all the validators on the same value
 * and returns only the error messages (without the nulls), in order.
 *
 *   collectErrors("ab", [new RequiredValidator(), new MinLengthValidator(3), new EmailValidator()])
 *     => ["min length 3", "invalid email"]
 *
 * Hint for Email: value.indexOf("@") and value.indexOf(".", atIndex)
 */
export class FieldValidator {
  validate(value: string): string | null {
    return null;
  }
}

export class RequiredValidator extends FieldValidator {
  override validate(value: string): string | null {
    if (value.trim() === "") {
      return "required";
    }
    return null;
  }
}

export class MinLengthValidator extends FieldValidator {
  constructor(private min: number) {
    super();
  }

  override validate(value: string): string | null {
    if (value.length < this.min) {
      return `min length ${this.min}`;
    }
    return null;  
  }
}

export class EmailValidator extends FieldValidator {
  override validate(value: string): string | null {
    if (!value.includes("@")) {
      return "invalid email";
    }
    const atIndex = value.indexOf("@");
    if (!value.includes(".", atIndex)) {
      return "invalid email";
    }
    return null;  
  }
}

export function collectErrors(value: string, validators: FieldValidator[]): string[] {
  return validators.map(v => v.validate(value)).filter((error): error is string => error !== null); 
}

/**
 * Exercise 4 – Wait strategies between attempts (retry)
 * The base class WaitStrategy is already implemented: delayFor(attempt) => 0 (no waiting).
 * attempt starts at 1. Override delayFor:
 *
 *   FixedWait(ms)                    => always ms
 *   LinearWait(stepMs)               => stepMs * attempt           (100, 200, 300, ...)
 *   ExponentialWait(baseMs, maxMs)   => baseMs * 2^(attempt - 1), but no more than maxMs
 *
 * Also implement totalWait(strategy, attempts) – the sum of the waits for attempts 1..attempts.
 * attempts less than or equal to 0 => 0.
 *
 *   totalWait(new LinearWait(100), 3)             => 100 + 200 + 300 = 600
 *   totalWait(new ExponentialWait(100, 300), 4)   => 100 + 200 + 300 + 300 = 900
 *
 * Note: totalWait receives a WaitStrategy – and it works with any kind of strategy, even one not written yet.
 * (There are no real timers here – we only calculate numbers)
 */
export class WaitStrategy {
  delayFor(attempt: number): number {
    return 0;
  }
}

export class FixedWait extends WaitStrategy {
  constructor(private ms: number) {
    super();
  }

  override delayFor(attempt: number): number {
    return this.ms;
  }
}

export class LinearWait extends WaitStrategy {
  constructor(private stepMs: number) {
    super();
  }

  override delayFor(attempt: number): number {
    return this.stepMs * attempt;
  }
}

export class ExponentialWait extends WaitStrategy {
  constructor(
    private baseMs: number,
    private maxMs: number,
  ) {
    super();
  }

  override delayFor(attempt: number): number {
    return Math.min(this.baseMs * Math.pow(2, attempt - 1), this.maxMs);
  }
}

export function totalWait(strategy: WaitStrategy, attempts: number): number {
  if (attempts <= 0) {
    return 0;
  }
  let total = 0;
  for (let i = 1; i <= attempts; i++) {
    total += strategy.delayFor(i);
  }
  return total;
}

/**
 * Exercise 5 (Bonus) – A base-class method that calls an overridden method
 * The base class TestCase is already implemented:
 *   - status()     => "pending"
 *   - isFailure()  => false
 *   - summary()    => `${this.name}: ${this.status()}`
 *
 * Override in the subclasses:
 *   PassedTest           status() => "passed"
 *   FailedTest(reason)   status() => `failed (${reason})`,  isFailure() => true
 *   SkippedTest          status() => "skipped",  and summary() => "~ " + the base class's regular summary
 *
 *   new PassedTest("login").summary()                 => "login: passed"
 *   new FailedTest("search", "timeout").summary()    => "search: failed (timeout)"
 *   new SkippedTest("export").summary()               => "~ export: skipped"
 *
 * Also implement failureSummaries(tests) – returns the summary() of the failed tests only, in order.
 *
 * Hints:
 *   - In PassedTest and FailedTest there is no need to override summary – the base summary calls
 *     this.status(), and at runtime that reaches the subclass's implementation.
 *   - In SkippedTest: super.summary()
 */
export class TestCase {
  constructor(public readonly name: string) {}

  status(): string {
    return "pending";
  }

  isFailure(): boolean {
    return false;
  }

  summary(): string {
    return `${this.name}: ${this.status()}`;
  }
}

export class PassedTest extends TestCase {
  override status(): string {
    return "passed";
  }
}

export class FailedTest extends TestCase {
  constructor(
    name: string,
    private reason: string,
  ) {
    super(name);
  }

  override status(): string {
    return `failed (${this.reason})`;
  }

  override isFailure(): boolean {
    return true;
  }
}

export class SkippedTest extends TestCase {
  override status(): string {
    return "skipped";
  }

  override summary(): string {
    return `~ ${super.summary()}`;
  }
}

export function failureSummaries(tests: TestCase[]): string[] {
  return tests.filter((t) => t.isFailure()).map((t) => t.summary());
}

// ============================================================
// Self-check – run:  npm run exercise -- 04 01
// On every line, the value left of "=> expected:" must equal the value on its right.
// (No need to change the code below this line)
// ============================================================

console.log("\n--- Exercise 1: TestLogger – basic override ---");
try {
  console.log(new ConsoleLogger().log("start"), "=> expected:", "[console] start");
  console.log(new UpperCaseLogger().log("start"), "=> expected:", "LOG: START");
  console.log(new PrefixLogger("api").log("start"), "=> expected:", "LOG: [api] start");
  console.log(new PrefixLogger("ui").log("click Save"), "=> expected:", "LOG: [ui] click Save");
  // The base class is unchanged
  console.log(new TestLogger().log("start"), "=> expected:", "LOG: start");

  // The same call – different results, through an array typed as the base class
  const loggers: TestLogger[] = [
    new TestLogger(),
    new ConsoleLogger(),
    new UpperCaseLogger(),
    new PrefixLogger("db"),
  ];
  console.log(
    loggers.map((l) => l.log("ok")),
    "=> expected:",
    ["LOG: ok", "[console] ok", "LOG: OK", "LOG: [db] ok"],
  );
  console.log(
    loggers.every((l) => l instanceof TestLogger),
    "=> expected:",
    true,
  );
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 2: BrowserDriver & driversSupporting ---");
try {
  const chrome = new ChromeDriver();
  const firefox = new FirefoxDriver();
  const safari = new SafariDriver();

  console.log(chrome.name(), "=> expected:", "chrome");
  console.log(firefox.name(), "=> expected:", "firefox");
  console.log(safari.name(), "=> expected:", "safari");
  // The base launchCommand calls the overridden name()
  console.log(chrome.launchCommand(), "=> expected:", "chrome --start");
  console.log(safari.launchCommand(), "=> expected:", "safari --start");
  console.log(new BrowserDriver().launchCommand(), "=> expected:", "generic --start");

  console.log(chrome.supports("pdf"), "=> expected:", true);
  console.log(chrome.supports("devtools"), "=> expected:", true);
  console.log(firefox.supports("pdf"), "=> expected:", false);
  console.log(safari.supports("headless"), "=> expected:", false);

  const drivers: BrowserDriver[] = [chrome, firefox, safari, new BrowserDriver()];
  console.log(driversSupporting(drivers, "headless"), "=> expected:", ["chrome", "firefox"]);
  console.log(driversSupporting(drivers, "devtools"), "=> expected:", ["chrome"]);
  console.log(driversSupporting(drivers, "video"), "=> expected:", []);
  console.log(driversSupporting([firefox, chrome], "headless"), "=> expected:", ["firefox", "chrome"]);
  console.log(driversSupporting([], "headless"), "=> expected:", []);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 3: FieldValidator & collectErrors ---");
try {
  const required = new RequiredValidator();
  console.log(required.validate(""), "=> expected:", "required");
  console.log(required.validate("   "), "=> expected:", "required");
  console.log(required.validate("dana"), "=> expected:", null);

  const min = new MinLengthValidator(8);
  console.log(min.validate("short"), "=> expected:", "min length 8");
  console.log(min.validate("12345678"), "=> expected:", null);

  const email = new EmailValidator();
  console.log(email.validate("qa@example.com"), "=> expected:", null);
  console.log(email.validate("qa.example.com"), "=> expected:", "invalid email");
  console.log(email.validate("qa@example"), "=> expected:", "invalid email");
  console.log(email.validate("first.last@site"), "=> expected:", "invalid email"); // a "." before the @ does not count

  console.log(
    collectErrors("ab", [new RequiredValidator(), new MinLengthValidator(3), new EmailValidator()]),
    "=> expected:",
    ["min length 3", "invalid email"],
  );
  console.log(
    collectErrors("", [new RequiredValidator(), new MinLengthValidator(1)]),
    "=> expected:",
    ["required", "min length 1"],
  );
  console.log(collectErrors("qa@example.com", [new EmailValidator(), new FieldValidator()]), "=> expected:", []);
  console.log(collectErrors("anything", []), "=> expected:", []);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 4: WaitStrategy & totalWait ---");
try {
  console.log(new FixedWait(250).delayFor(1), "=> expected:", 250);
  console.log(new FixedWait(250).delayFor(5), "=> expected:", 250);
  console.log(new LinearWait(100).delayFor(3), "=> expected:", 300);
  const exp = new ExponentialWait(100, 300);
  console.log([1, 2, 3, 4].map((a) => exp.delayFor(a)), "=> expected:", [100, 200, 300, 300]);
  console.log(new ExponentialWait(50, 10_000).delayFor(4), "=> expected:", 400);

  console.log(totalWait(new LinearWait(100), 3), "=> expected:", 600);
  console.log(totalWait(new ExponentialWait(100, 300), 4), "=> expected:", 900);
  console.log(totalWait(new FixedWait(200), 5), "=> expected:", 1000);
  console.log(totalWait(new WaitStrategy(), 10), "=> expected:", 0);
  console.log(totalWait(new FixedWait(200), 0), "=> expected:", 0);
  console.log(totalWait(new LinearWait(100), -2), "=> expected:", 0);

  const strategies: WaitStrategy[] = [new FixedWait(10), new LinearWait(10), new ExponentialWait(10, 1000)];
  console.log(
    strategies.map((s) => totalWait(s, 3)),
    "=> expected:",
    [30, 60, 70],
  );
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 5 (Bonus): TestCase & failureSummaries ---");
try {
  const passed = new PassedTest("login");
  const failed = new FailedTest("search", "timeout");
  const skipped = new SkippedTest("export");

  console.log(passed.summary(), "=> expected:", "login: passed");
  console.log(failed.summary(), "=> expected:", "search: failed (timeout)");
  console.log(skipped.summary(), "=> expected:", "~ export: skipped");
  console.log(new TestCase("draft").summary(), "=> expected:", "draft: pending");

  console.log(passed.isFailure(), "=> expected:", false);
  console.log(failed.isFailure(), "=> expected:", true);
  console.log(skipped.isFailure(), "=> expected:", false);
  console.log(failed instanceof TestCase, "=> expected:", true);

  const run: TestCase[] = [
    passed,
    failed,
    skipped,
    new FailedTest("checkout", "500 from /pay"),
    new TestCase("draft"),
  ];
  console.log(
    failureSummaries(run),
    "=> expected:",
    ["search: failed (timeout)", "checkout: failed (500 from /pay)"],
  );
  console.log(failureSummaries([passed, skipped]), "=> expected:", []);
  console.log(failureSummaries([]), "=> expected:", []);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}
