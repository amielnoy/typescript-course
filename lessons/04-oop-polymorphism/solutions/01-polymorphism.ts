// Lesson 4 – Topic 01: Polymorphism – Solutions

// ---------- Exercise 1 ----------
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
  // Only the input changes – the format is left to the base class
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

// ---------- Exercise 2 ----------
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
    return feature === "headless";
  }
}

// supports is not overridden – false is inherited from the base class
export class SafariDriver extends BrowserDriver {
  override name(): string {
    return "safari";
  }
}

export function driversSupporting(drivers: BrowserDriver[], feature: string): string[] {
  // No if on the driver type here – each driver "knows" how to answer by itself
  return drivers.filter((d) => d.supports(feature)).map((d) => d.name());
}

// ---------- Exercise 3 ----------
export class FieldValidator {
  validate(value: string): string | null {
    return null;
  }
}

export class RequiredValidator extends FieldValidator {
  override validate(value: string): string | null {
    return value.trim() === "" ? "required" : null;
  }
}

export class MinLengthValidator extends FieldValidator {
  constructor(private min: number) {
    super();
  }

  override validate(value: string): string | null {
    return value.length < this.min ? `min length ${this.min}` : null;
  }
}

export class EmailValidator extends FieldValidator {
  override validate(value: string): string | null {
    const at = value.indexOf("@");
    if (at === -1 || value.indexOf(".", at) === -1) return "invalid email";
    return null;
  }
}

export function collectErrors(value: string, validators: FieldValidator[]): string[] {
  const errors: string[] = [];
  for (const v of validators) {
    const error = v.validate(value);
    if (error !== null) errors.push(error);
  }
  return errors;
}

// ---------- Exercise 4 ----------
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
    return Math.min(this.baseMs * 2 ** (attempt - 1), this.maxMs);
  }
}

export function totalWait(strategy: WaitStrategy, attempts: number): number {
  let total = 0;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    total += strategy.delayFor(attempt); // the right implementation is picked at runtime
  }
  return total;
}

// ---------- Exercise 5 (Bonus) ----------
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

// summary is not overridden – the base summary calls PassedTest's this.status()
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
// Self-check – run:  npm run solution -- 04 01
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
