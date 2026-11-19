// Lesson 5 – Topic 02: Mini test framework (Abstract + Polymorphism) – Exercises
// ------------------------------------------------------------
// Instructions:
//   1. Fill in the body of every method/function in place of the line  throw new Error("TODO")
//   2. Use only what we have learned so far: abstract class, protected abstract,
//      Template Method (a base-class method that defines a fixed flow and calls the subclasses' methods),
//      try/catch/finally, and arrays typed as the abstract class.
//   3. Note: implementing an abstract method does not require override,
//      but overriding a regular method (like setup/teardown) – does require override.
//   4. Check yourself: npm run exercise -- 05 02 (self-check at the end of the file)
// ------------------------------------------------------------

export type Outcome = { name: string; passed: boolean; details: string };

/**
 * The abstract class Check – exactly as in the example (already implemented, no need to change it).
 * run() is the Template Method: it calls verify, and if that fails – describeFailure.
 * If verify throws an error – the outcome fails with details = `error: ${message}`.
 */
export abstract class Check {
  constructor(public readonly name: string) {}

  protected abstract verify(): boolean;
  protected abstract describeFailure(): string;

  run(): Outcome {
    try {
      const passed = this.verify();
      return { name: this.name, passed, details: passed ? "ok" : this.describeFailure() };
    } catch (err) {
      return { name: this.name, passed: false, details: `error: ${(err as Error).message}` };
    }
  }
}

/**
 * Exercise 1 – New checks (subclasses of Check)
 * Implement verify and describeFailure in each class:
 *
 *   GreaterThanCheck(name, actual, min)
 *     passes if actual > min.            failure: `expected ${actual} to be greater than ${min}`
 *
 *   MatchesCheck(name, text, pattern)
 *     passes if pattern.test(text).      failure: `"${text}" does not match ${pattern}`
 *     (printing a RegExp inside a template string gives e.g. /^\d+$/)
 *
 *   InRangeCheck(name, value, min, max)
 *     passes if min <= value <= max.     failure: `${value} is not in [${min}, ${max}]`
 *     if min > max – verify throws Error("invalid range")
 *     (and then the base run returns details = "error: invalid range")
 *
 *   new GreaterThanCheck("items count", 0, 0).run()
 *     => { name: "items count", passed: false, details: "expected 0 to be greater than 0" }
 */
export class GreaterThanCheck extends Check {
  constructor(
    name: string,
    private actual: number,
    private min: number,
  ) {
    super(name);
  }

  protected verify(): boolean {
    throw new Error("TODO");
  }

  protected describeFailure(): string {
    throw new Error("TODO");
  }
}

export class MatchesCheck extends Check {
  constructor(
    name: string,
    private text: string,
    private pattern: RegExp,
  ) {
    super(name);
  }

  protected verify(): boolean {
    throw new Error("TODO");
  }

  protected describeFailure(): string {
    throw new Error("TODO");
  }
}

export class InRangeCheck extends Check {
  constructor(
    name: string,
    private value: number,
    private min: number,
    private max: number,
  ) {
    super(name);
  }

  protected verify(): boolean {
    throw new Error("TODO");
  }

  protected describeFailure(): string {
    throw new Error("TODO");
  }
}

/**
 * Exercise 2 – Running all the checks and summarizing
 * runAll(checks) calls run() on every check and returns a summary:
 *   { total, passed, failed, failedNames }
 * failedNames – the names of the checks that failed, in order.
 *
 *   runAll([]) => { total: 0, passed: 0, failed: 0, failedNames: [] }
 *
 * Note: runAll does not know (and does not need to know) which kinds of checks are in the array.
 */
export interface RunSummary {
  total: number;
  passed: number;
  failed: number;
  failedNames: string[];
}

export function runAll(checks: Check[]): RunSummary {
  throw new Error("TODO");
}

/**
 * Exercise 3 – BaseTest with setup / execute / teardown (Template Method)
 * Implement run() in the abstract class BaseTest. The flow:
 *   1. setup()
 *   2. execute()          – only if setup succeeded
 *   3. teardown()         – always! even if setup or execute threw an error
 *
 * The result (TestResult):
 *   - everything passed                 => { name, status: "passed" }
 *   - setup or execute threw            => { name, status: "failed", error: the error message }
 *   - only teardown threw               => { name, status: "failed", error: teardown's error message }
 *   - both execute and teardown threw   => keep the first error (execute's)
 *   run() itself never throws.
 *
 * setup and teardown are already implemented as "empty" – a subclass overrides them only if needed.
 *
 * Hints: try { ... } catch (err) { ... } finally { ... },  (err as Error).message
 */
export type TestResult = { name: string; status: "passed" | "failed"; error?: string };

export abstract class BaseTest {
  constructor(public readonly name: string) {}

  protected setup(): void {}
  protected abstract execute(): void;
  protected teardown(): void {}

  run(): TestResult {
    throw new Error("TODO");
  }
}

/**
 * Exercise 4 – A real login test (a subclass of BaseTest)
 * FakeApp is "the application under test" – already implemented, no need to change it.
 *
 * Implement LoginTest(app, user, password) – the test name is `login as ${user}` (already in the constructor):
 *   setup()     => app.reset()
 *   execute()   => app.login(user, password), then make sure that app.currentUser === user.
 *                  If not – throw Error(`expected "${user}" to be logged in`)
 *   teardown()  => app.logout()
 *
 *   new LoginTest(app, "admin", "admin123").run() => { name: "login as admin", status: "passed" }
 *   new LoginTest(app, "admin", "wrong").run()
 *     => { name: "login as admin", status: "failed", error: 'expected "admin" to be logged in' }
 *   In both cases – after the run app.currentUser === null (teardown ran).
 */
export class FakeApp {
  currentUser: string | null = null;
  resets = 0;
  private users: Record<string, string> = { admin: "admin123", dana: "qa-pass" };

  reset(): void {
    this.currentUser = null;
    this.resets++;
  }

  login(user: string, password: string): void {
    if (this.users[user] === password) this.currentUser = user;
  }

  logout(): void {
    this.currentUser = null;
  }
}

export class LoginTest extends BaseTest {
  constructor(
    private app: FakeApp,
    private user: string,
    private password: string,
  ) {
    super(`login as ${user}`);
  }

  protected override setup(): void {
    throw new Error("TODO");
  }

  protected execute(): void {
    throw new Error("TODO");
  }

  protected override teardown(): void {
    throw new Error("TODO");
  }
}

/**
 * Exercise 5 – Reporters: the same results, different formats
 * a. Implement render(results) in the abstract class Reporter:
 *      one line per result – formatResult(result, index) (index starts at 0),
 *      and at the end a summary line: `${passed}/${total} passed`. The lines are joined with "\n".
 *      No results => just "0/0 passed".
 * b. Implement formatResult in the subclasses:
 *      SpecReporter   passed:  `✔ ${name}`                  failed: `✘ ${name}: ${error}`
 *      TapReporter    passed:  `ok ${index + 1} - ${name}`   failed: `not ok ${index + 1} - ${name}`
 *
 *   new TapReporter().render([{ name: "a", status: "passed" }, { name: "b", status: "failed", error: "x" }])
 *     => "ok 1 - a\nnot ok 2 - b\n1/2 passed"
 */
export abstract class Reporter {
  protected abstract formatResult(result: TestResult, index: number): string;

  render(results: TestResult[]): string {
    throw new Error("TODO");
  }
}

export class SpecReporter extends Reporter {
  protected formatResult(result: TestResult, index: number): string {
    throw new Error("TODO");
  }
}

export class TapReporter extends Reporter {
  protected formatResult(result: TestResult, index: number): string {
    throw new Error("TODO");
  }
}

/**
 * Exercise 6 (Bonus) – TestSuite: putting it all together
 *   add(test)       – adds a test to the suite and returns the suite itself (this),
 *                     so calls can be chained:  suite.add(a).add(b)
 *   run(reporter)   – runs all the tests in the order they were added (run() of each one),
 *                     and returns: `# ${name}` + "\n" + reporter.render(results)
 *
 *   new TestSuite("smoke").add(t1).add(t2).run(new TapReporter())
 *     => "# smoke\nok 1 - ...\nok 2 - ...\n2/2 passed"
 *
 * Note: the suite works with any BaseTest and any Reporter – that is the whole power of polymorphism.
 */
export class TestSuite {
  private tests: BaseTest[] = [];

  constructor(public readonly name: string) {}

  add(test: BaseTest): this {
    throw new Error("TODO");
  }

  run(reporter: Reporter): string {
    throw new Error("TODO");
  }
}

// ============================================================
// Self-check – run:  npm run exercise -- 05 02
// On every line, the value left of "=> expected:" must equal the value on its right.
// (No need to change the code below this line)
// ============================================================

// ---------- Helper classes for the self-check (they extend your abstract classes) ----------

/** A "fake" Check: returns a fixed result, or throws an error */
class StubCheck extends Check {
  constructor(
    name: string,
    private result: boolean | Error,
  ) {
    super(name);
  }
  protected verify(): boolean {
    if (this.result instanceof Error) throw this.result;
    return this.result;
  }
  protected describeFailure(): string {
    return "stub failed";
  }
}

/** A BaseTest that records the order of calls and can fail at any stage */
type FailAt = { setup?: boolean; execute?: boolean; teardown?: boolean };
class ScriptedTest extends BaseTest {
  readonly calls: string[] = [];
  constructor(
    name: string,
    private failAt: FailAt = {},
  ) {
    super(name);
  }
  protected override setup(): void {
    this.calls.push("setup");
    if (this.failAt.setup) throw new Error("setup boom");
  }
  protected execute(): void {
    this.calls.push("execute");
    if (this.failAt.execute) throw new Error("execute boom");
  }
  protected override teardown(): void {
    this.calls.push("teardown");
    if (this.failAt.teardown) throw new Error("teardown boom");
  }
}

/** A BaseTest that does not override setup/teardown – uses the empty defaults */
class MinimalTest extends BaseTest {
  protected execute(): void {}
}

/** A simple Reporter that overrides render – to check TestSuite independently of Exercise 5 */
class ListReporter extends Reporter {
  protected formatResult(result: TestResult): string {
    return `${result.name}=${result.status}`;
  }
  override render(results: TestResult[]): string {
    return results.map((r) => this.formatResult(r)).join(";");
  }
}

/** A FakeApp that records the calls made to it */
class SpyApp extends FakeApp {
  readonly log: string[] = [];
  override reset(): void {
    this.log.push("reset");
    super.reset();
  }
  override login(user: string, password: string): void {
    this.log.push(`login:${user}`);
    super.login(user, password);
  }
  override logout(): void {
    this.log.push("logout");
    super.logout();
  }
}

console.log("\n--- Exercise 1: Check subclasses ---");
try {
  // A subclass may call verify (protected) directly – so we check it without run as well
  class GreaterThanProbe extends GreaterThanCheck {
    verifyNow(): boolean {
      return this.verify();
    }
  }
  console.log(new GreaterThanProbe("probe", 2, 1).verifyNow(), "=> expected:", true);
  console.log(new GreaterThanProbe("probe", 1, 1).verifyNow(), "=> expected:", false);

  console.log(new GreaterThanCheck("users count", 5, 0).run(), "=> expected:", {
    name: "users count",
    passed: true,
    details: "ok",
  });
  console.log(new GreaterThanCheck("items count", 0, 0).run(), "=> expected:", {
    name: "items count",
    passed: false,
    details: "expected 0 to be greater than 0",
  });

  console.log(new MatchesCheck("order id", "12345", /^\d+$/).run().passed, "=> expected:", true);
  console.log(new MatchesCheck("order id", "ab-1", /^\d+$/).run(), "=> expected:", {
    name: "order id",
    passed: false,
    details: '"ab-1" does not match /^\\d+$/',
  });

  console.log(new InRangeCheck("status", 200, 200, 299).run().passed, "=> expected:", true);
  console.log(new InRangeCheck("status", 299, 200, 299).run().passed, "=> expected:", true);
  console.log(new InRangeCheck("status", 404, 200, 299).run(), "=> expected:", {
    name: "status",
    passed: false,
    details: "404 is not in [200, 299]",
  });
  console.log(new InRangeCheck("bad config", 5, 10, 1).run(), "=> expected:", {
    name: "bad config",
    passed: false,
    details: "error: invalid range",
  });

  const checks: Check[] = [
    new GreaterThanCheck("a", 2, 1),
    new MatchesCheck("b", "x", /y/),
    new InRangeCheck("c", 1, 0, 2),
  ];
  console.log(
    checks.map((c) => c.run().passed),
    "=> expected:",
    [true, false, true],
  );
  console.log(
    checks.every((c) => c instanceof Check),
    "=> expected:",
    true,
  );
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 2: runAll ---");
try {
  const summary = runAll([
    new StubCheck("status is 200", true),
    new StubCheck("title", false),
    new StubCheck("db", new Error("connection refused")),
    new StubCheck("footer", true),
  ]);
  console.log(summary, "=> expected:", { total: 4, passed: 2, failed: 2, failedNames: ["title", "db"] });

  console.log(runAll([]), "=> expected:", { total: 0, passed: 0, failed: 0, failedNames: [] });
  console.log(runAll([new StubCheck("only", true)]), "=> expected:", {
    total: 1,
    passed: 1,
    failed: 0,
    failedNames: [],
  });
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 3: BaseTest.run – setup / execute / teardown ---");
try {
  const ok = new ScriptedTest("happy path");
  const okResult = ok.run();
  console.log(okResult.name, "=> expected:", "happy path");
  console.log(okResult.status, "=> expected:", "passed");
  console.log(okResult.error, "=> expected:", undefined);
  console.log(ok.calls, "=> expected:", ["setup", "execute", "teardown"]);

  const execFails = new ScriptedTest("exec fails", { execute: true });
  const execResult = execFails.run();
  console.log(execResult.status, "=> expected:", "failed");
  console.log(execResult.error, "=> expected:", "execute boom");
  console.log(execFails.calls, "=> expected:", ["setup", "execute", "teardown"]); // teardown always runs

  const setupFails = new ScriptedTest("setup fails", { setup: true });
  const setupResult = setupFails.run();
  console.log(setupResult.status, "=> expected:", "failed");
  console.log(setupResult.error, "=> expected:", "setup boom");
  console.log(setupFails.calls, "=> expected:", ["setup", "teardown"]); // execute is skipped

  const teardownFails = new ScriptedTest("teardown fails", { teardown: true });
  const teardownResult = teardownFails.run();
  console.log(teardownResult.status, "=> expected:", "failed");
  console.log(teardownResult.error, "=> expected:", "teardown boom");

  const bothFail = new ScriptedTest("both fail", { execute: true, teardown: true });
  const bothResult = bothFail.run();
  console.log(bothResult.status, "=> expected:", "failed");
  console.log(bothResult.error, "=> expected:", "execute boom"); // the first error is kept
  console.log(bothFail.calls, "=> expected:", ["setup", "execute", "teardown"]);

  // The empty default setup/teardown
  const minimal = new MinimalTest("minimal").run();
  console.log(minimal.status, "=> expected:", "passed");
  console.log(minimal.name, "=> expected:", "minimal");
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 4: LoginTest ---");
try {
  const app = new SpyApp();
  const good = new LoginTest(app, "admin", "admin123");
  console.log(good.name, "=> expected:", "login as admin");
  console.log(good instanceof BaseTest, "=> expected:", true);

  const goodResult = good.run();
  console.log(goodResult.status, "=> expected:", "passed");
  console.log(goodResult.error, "=> expected:", undefined);
  console.log(app.log, "=> expected:", ["reset", "login:admin", "logout"]);
  console.log(app.currentUser, "=> expected:", null); // teardown logged out
  console.log(app.resets, "=> expected:", 1);

  const badResult = new LoginTest(app, "admin", "wrong").run();
  console.log(badResult.status, "=> expected:", "failed");
  console.log(badResult.error, "=> expected:", 'expected "admin" to be logged in');
  console.log(app.currentUser, "=> expected:", null);
  console.log(app.resets, "=> expected:", 2);

  const unknown = new LoginTest(new FakeApp(), "ghost", "x").run();
  console.log(unknown.status, "=> expected:", "failed");
  console.log(unknown.error, "=> expected:", 'expected "ghost" to be logged in');

  // If setup does not reset a previously logged-in user – the test does not really check logging in
  const dirty = new FakeApp();
  dirty.currentUser = "dana";
  console.log(new LoginTest(dirty, "dana", "wrong").run().status, "=> expected:", "failed");
  console.log(new LoginTest(dirty, "dana", "qa-pass").run().status, "=> expected:", "passed");
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 5: Reporters ---");
try {
  const results: TestResult[] = [
    { name: "login", status: "passed" },
    { name: "search", status: "failed", error: "timeout" },
    { name: "logout", status: "passed" },
  ];
  // JSON.stringify shows the line breaks as \n, so it is easy to compare
  console.log(
    JSON.stringify(new SpecReporter().render(results)),
    "=> expected:",
    JSON.stringify("✔ login\n✘ search: timeout\n✔ logout\n2/3 passed"),
  );
  console.log(
    JSON.stringify(new TapReporter().render(results)),
    "=> expected:",
    JSON.stringify("ok 1 - login\nnot ok 2 - search\nok 3 - logout\n2/3 passed"),
  );
  console.log(new SpecReporter().render([]), "=> expected:", "0/0 passed");
  console.log(
    JSON.stringify(new TapReporter().render([{ name: "x", status: "failed", error: "e" }])),
    "=> expected:",
    JSON.stringify("not ok 1 - x\n0/1 passed"),
  );

  const reporters: Reporter[] = [new SpecReporter(), new TapReporter()];
  console.log(
    reporters.map((r) => r.render([{ name: "a", status: "passed" }])),
    "=> expected:",
    ["✔ a\n1/1 passed", "ok 1 - a\n1/1 passed"],
  );
  console.log(
    reporters.every((r) => r instanceof Reporter),
    "=> expected:",
    true,
  );
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 6 (Bonus): TestSuite ---");
try {
  const suite = new TestSuite("smoke");
  const a = new ScriptedTest("a");
  const b = new ScriptedTest("b", { execute: true });
  console.log(suite.add(a) === suite, "=> expected:", true); // add returns the suite – so calls can be chained
  suite.add(b).add(new MinimalTest("c"));

  console.log(
    JSON.stringify(suite.run(new ListReporter())),
    "=> expected:",
    JSON.stringify("# smoke\na=passed;b=failed;c=passed"),
  );
  console.log(a.calls, "=> expected:", ["setup", "execute", "teardown"]);
  console.log(b.calls, "=> expected:", ["setup", "execute", "teardown"]);

  console.log(
    JSON.stringify(new TestSuite("empty").run(new ListReporter())),
    "=> expected:",
    JSON.stringify("# empty\n"),
  );

  // End to end – with the Reporters and LoginTest from the previous exercises
  const app = new FakeApp();
  const e2e = new TestSuite("login")
    .add(new LoginTest(app, "admin", "admin123"))
    .add(new LoginTest(app, "dana", "nope"));
  console.log(
    JSON.stringify(e2e.run(new TapReporter())),
    "=> expected:",
    JSON.stringify("# login\nok 1 - login as admin\nnot ok 2 - login as dana\n1/2 passed"),
  );
  console.log(
    JSON.stringify(new TestSuite("none").run(new SpecReporter())),
    "=> expected:",
    JSON.stringify("# none\n0/0 passed"),
  );
} catch (e) {
  console.log("  ✋", (e as Error).message);
}
