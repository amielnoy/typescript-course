// Lesson 5 – Topic 02: Mini test framework – Solutions

export type Outcome = { name: string; passed: boolean; details: string };

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

// ---------- Exercise 1 ----------
export class GreaterThanCheck extends Check {
  constructor(
    name: string,
    private actual: number,
    private min: number,
  ) {
    super(name);
  }

  protected verify(): boolean {
    return this.actual > this.min;
  }

  protected describeFailure(): string {
    return `expected ${this.actual} to be greater than ${this.min}`;
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
    return this.pattern.test(this.text);
  }

  protected describeFailure(): string {
    return `"${this.text}" does not match ${this.pattern}`;
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
    // The error is not caught here – the base run already knows how to handle it
    if (this.min > this.max) throw new Error("invalid range");
    return this.value >= this.min && this.value <= this.max;
  }

  protected describeFailure(): string {
    return `${this.value} is not in [${this.min}, ${this.max}]`;
  }
}

// ---------- Exercise 2 ----------
export interface RunSummary {
  total: number;
  passed: number;
  failed: number;
  failedNames: string[];
}

export function runAll(checks: Check[]): RunSummary {
  const outcomes = checks.map((c) => c.run());
  const failedNames = outcomes.filter((o) => !o.passed).map((o) => o.name);
  return {
    total: outcomes.length,
    passed: outcomes.length - failedNames.length,
    failed: failedNames.length,
    failedNames,
  };
}

// ---------- Exercise 3 ----------
export type TestResult = { name: string; status: "passed" | "failed"; error?: string };

export abstract class BaseTest {
  constructor(public readonly name: string) {}

  protected setup(): void {}
  protected abstract execute(): void;
  protected teardown(): void {}

  // Template Method – the flow is fixed, only the steps differ between subclasses
  run(): TestResult {
    let error: string | undefined;
    try {
      this.setup();
      this.execute(); // not reached if setup threw
    } catch (err) {
      error = (err as Error).message;
    } finally {
      try {
        this.teardown(); // always runs – even after a failure
      } catch (err) {
        error ??= (err as Error).message; // keep the first error
      }
    }
    return error === undefined ? { name: this.name, status: "passed" } : { name: this.name, status: "failed", error };
  }
}

// ---------- Exercise 4 ----------
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
    this.app.reset();
  }

  protected execute(): void {
    this.app.login(this.user, this.password);
    if (this.app.currentUser !== this.user) {
      throw new Error(`expected "${this.user}" to be logged in`);
    }
  }

  protected override teardown(): void {
    this.app.logout();
  }
}

// ---------- Exercise 5 ----------
export abstract class Reporter {
  protected abstract formatResult(result: TestResult, index: number): string;

  render(results: TestResult[]): string {
    const lines = results.map((r, i) => this.formatResult(r, i));
    const passed = results.filter((r) => r.status === "passed").length;
    lines.push(`${passed}/${results.length} passed`);
    return lines.join("\n");
  }
}

export class SpecReporter extends Reporter {
  protected formatResult(result: TestResult, index: number): string {
    return result.status === "passed" ? `✔ ${result.name}` : `✘ ${result.name}: ${result.error}`;
  }
}

export class TapReporter extends Reporter {
  protected formatResult(result: TestResult, index: number): string {
    const prefix = result.status === "passed" ? "ok" : "not ok";
    return `${prefix} ${index + 1} - ${result.name}`;
  }
}

// ---------- Exercise 6 (Bonus) ----------
export class TestSuite {
  private tests: BaseTest[] = [];

  constructor(public readonly name: string) {}

  add(test: BaseTest): this {
    this.tests.push(test);
    return this; // allows chaining: suite.add(a).add(b)
  }

  run(reporter: Reporter): string {
    const results = this.tests.map((t) => t.run());
    return `# ${this.name}\n${reporter.render(results)}`;
  }
}

// ============================================================
// Self-check – run:  npm run solution -- 05 02
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
