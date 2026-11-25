// Lesson 3 – Homework 2: Checkout Smoke Suite – config objects, checks with a lifecycle, and a CI report
// ------------------------------------------------------------
// Scenario:
//   Before every deploy, CI runs a short smoke suite against the checkout service: a few API checks and
//   a couple of UI checks. Today it is a pile of copy-pasted scripts – every script builds its own config,
//   has its own retry loop (some forget to close the browser when they crash), and last week one of them
//   printed the API token straight into the CI report. The QA team is rebuilding it as a small, clean module:
//   config objects that never leak changes, one run context that guards the token, one base class that owns
//   the setup → attempts → teardown order, and a suite that sums it all up into a GREEN / YELLOW / RED verdict.
//
// Instructions:
//   1. The tasks build on each other – solve them in order. Fill in every  throw new Error("TODO")
//      (and, where a task says so, add the fields / members that are missing).
//   2. Use only what we have learned so far: objects (spread, destructuring, Object.keys / entries, JSON),
//      classes, public / private / protected / readonly, # fields, getters and setters,
//      extends / super / override, static members and factory methods, Error subclasses, try / catch.
//   3. Secrets stay secret: the token lives only in a # field – never in a public field, a TS private field,
//      a log line, an error message or the report.
//   4. Remember (noImplicitOverride): a method that replaces the parent's one needs override.
//   5. Check yourself: npm run exercise -- 03 hw2 (self-check at the end of the file)
// ------------------------------------------------------------

export type Env = "dev" | "staging" | "prod";
export type RunConfig = { env: Env; baseUrl: string; retries: number; timeoutMs: number; tags: string[] };
/** Like RunConfig, but every field is optional – only what you want to change */
export type ConfigOverrides = { env?: Env; baseUrl?: string; retries?: number; timeoutMs?: number; tags?: string[] };

export const DEFAULT_CONFIG: RunConfig = {
  env: "staging",
  baseUrl: "https://staging.shop.test",
  retries: 1,
  timeoutMs: 5000,
  tags: ["smoke"],
};

/**
 * Task 1 – SuiteError and config objects
 * a. SuiteError(code, message) extends Error – the one error class of the module
 *      message => `[${code}] ${message}`      code is stored as public readonly      name => "SuiteError"
 *        new SuiteError("BAD_CONFIG", "config is not valid JSON").message => "[BAD_CONFIG] config is not valid JSON"
 *
 * b. buildConfig(overrides = {}): RunConfig – DEFAULT_CONFIG with the overrides on top (spread!)
 *      - if env is overridden and baseUrl is not, baseUrl follows the env: `https://${env}.shop.test`
 *        ({ env: "prod" } => "https://prod.shop.test");  an explicit baseUrl always wins
 *      - the result must NOT share its tags array with DEFAULT_CONFIG or with the overrides –
 *        pushing a tag into the result must not change either of them
 *        Hint: {...DEFAULT_CONFIG} is a shallow copy – the tags array inside is the same array.
 *
 * c. withTags(config, extra): RunConfig – a NEW config with the extra tags added at the end, each tag once.
 *      The config it got does not change.   tags ["smoke"] + ["checkout", "smoke", "checkout"] => ["smoke", "checkout"]
 *
 * d. configSummary(config): string – one line for the CI log, built with Object.entries, in the keys' order:
 *      "env=staging | baseUrl=https://staging.shop.test | retries=1 | timeoutMs=5000 | tags=smoke,checkout"
 *      Hint: what does `${["smoke", "checkout"]}` print?
 *
 * e. parseConfig(json): RunConfig – reads overrides from a JSON string and returns buildConfig(those overrides)
 *      - not valid JSON          => SuiteError("BAD_CONFIG", "config is not valid JSON")
 *      - a key that RunConfig does not have (a typo like "retry") must not be silently ignored =>
 *          SuiteError("BAD_CONFIG", `unknown key(s): ${the unknown keys, joined with ", "}`)
 *        Hint: Object.keys(DEFAULT_CONFIG) is the list of the known keys.
 */
export class SuiteError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    throw new Error("TODO");
  }
}

export function buildConfig(overrides: ConfigOverrides = {}): RunConfig {
  throw new Error("TODO");
}

export function withTags(config: RunConfig, extra: string[]): RunConfig {
  throw new Error("TODO");
}

export function configSummary(config: RunConfig): string {
  throw new Error("TODO");
}

export function parseConfig(json: string): RunConfig {
  throw new Error("TODO");
}

/**
 * Task 2 – RunContext: what every check of one run shares
 * constructor(config, token) checks, in this order:
 *   token  – at least 8 characters and no spaces, otherwise
 *              SuiteError("BAD_TOKEN", "token must be at least 8 characters with no spaces")
 *            (never put the token itself in the message!)  Then it is stored in a # field.
 *   config – the context keeps its OWN copy: if the caller changes their config object (or its tags) later,
 *            the context must not change.  config.retries goes through the retries setter (below).
 *
 *   get config            – a copy of the current config (changing it changes nothing inside)
 *   get retries / set retries
 *                         – an integer from 0 to MAX_RETRIES (3), otherwise
 *                             SuiteError("BAD_CONFIG", "retries must be an integer between 0 and 3")
 *                           and the old value stays.  Use the static MAX_RETRIES in the check and in the message.
 *   get maskedToken       – the first 4 characters + "****"        "sk_live_9f8e7d6c" => "sk_l****"
 *   authHeader()          – `Bearer ${token}`   (the only way the real token leaves the object)
 *   url(path)             – baseUrl + path                         "/cart" => "https://staging.shop.test/cart"
 *   log(line)             – adds a line to the run's log
 *   get logs              – a copy of the log lines (pushing into it does not change the log)
 *
 * The token must not show up in JSON.stringify(ctx) or in Object.keys(ctx) – the checks verify this.
 * Add the # fields and the private fields you need yourself.
 */
export class RunContext {
  static readonly MAX_RETRIES = 3;

  constructor(config: RunConfig, token: string) {
    throw new Error("TODO");
  }

  get config(): RunConfig {
    throw new Error("TODO");
  }

  get retries(): number {
    throw new Error("TODO");
  }

  set retries(value: number) {
    throw new Error("TODO");
  }

  get maskedToken(): string {
    throw new Error("TODO");
  }

  authHeader(): string {
    throw new Error("TODO");
  }

  url(path: string): string {
    throw new Error("TODO");
  }

  log(line: string): void {
    throw new Error("TODO");
  }

  get logs(): string[] {
    throw new Error("TODO");
  }
}

export type Status = "passed" | "failed" | "error" | "skipped";
export type CheckResult = { id: string; name: string; status: Status; attempts: number; message: string };

/**
 * Task 3 – BaseCheck: ids and the template method
 * a. Ids: every check gets the next id when it is created – "CHK-001", "CHK-002", ...
 *      Keep the counter in a private static field and the "next id" logic in a private static method.
 *      static resetIds() – starts counting from 1 again (the self-check calls it before every task).
 *      Hint: String(7).padStart(3, "0") => "007"
 *    constructor(name, ctx, tags = ["smoke"]) – stores everything (tags: a copy of the array).
 *
 * b. The hooks (already written – a subclass overrides only these, Task 4):
 *      setup()      – logs `${name}: setup`
 *      attempt(n)   – one try of the check, n = 1, 2, 3...; returns true (passed) or false (failed).
 *                     BaseCheck itself has no steps – it throws SuiteError("NOT_IMPLEMENTED", ...)
 *      teardown()   – logs `${name}: teardown`
 *
 * c. execute(): CheckResult – the template method. The order is fixed, for every kind of check:
 *      1. setup()
 *      2. up to 1 + ctx.retries attempts (read the retries NOW – they may have changed since the check was created):
 *           attempt(n) returned true  => "passed", stop
 *           attempt(n) returned false => log `${name}: attempt ${n} failed`, and try again (if any attempts are left)
 *           attempt(n) threw          => "error", stop at once – a crash is not flakiness, so no more attempts
 *      3. teardown() – ALWAYS, even after an error (catch it – don't let it escape before teardown)
 *      4. log `${name}: ${STATUS}`  ("steady: PASSED", "broken: ERROR")
 *      5. return { id, name, status, attempts, message }
 *           attempts – how many times attempt() was called
 *           message  – passed: "ok" | failed: `failed after ${attempts} attempt(s)` | error: the error's message
 */
export class BaseCheck {
  readonly id: string;
  readonly name: string;
  readonly tags: string[];
  protected readonly ctx: RunContext;

  constructor(name: string, ctx: RunContext, tags: string[] = ["smoke"]) {
    throw new Error("TODO");
  }

  static resetIds(): void {
    throw new Error("TODO");
  }

  // ----- the hooks – a subclass overrides only these -----

  protected setup(): void {
    this.ctx.log(`${this.name}: setup`);
  }

  protected attempt(n: number): boolean {
    throw new SuiteError("NOT_IMPLEMENTED", `${this.name} has no steps`);
  }

  protected teardown(): void {
    this.ctx.log(`${this.name}: teardown`);
  }

  // ----- the template method – the order never changes -----

  execute(): CheckResult {
    throw new Error("TODO");
  }
}

/**
 * Task 4 – ApiCheck and UiCheck: override only the hooks, never execute
 * a. ApiCheck(name, ctx, path, expectedStatus, responses, tags?) extends BaseCheck
 *      responses – the statuses the (simulated) server returns on attempt 1, 2, 3...
 *                  when the list runs out, the LAST status repeats.  [503, 200] = flaky once, then fine.
 *                  An empty list => SuiteError("BAD_CHECK", `${name}: responses must not be empty`)
 *      tags      – not given => the default of BaseCheck
 *      attempt(n): logs `${name}: GET ${ctx.url(path)} -> ${status}` and returns status === expectedStatus
 *      static health(ctx, responses = [200]) – a factory: name "health", path "/health", expects 200
 *
 * b. UiCheck(name, ctx, page, failFirst = 0, tags?) extends BaseCheck
 *      failFirst – the first failFirst attempts fail (a simulated flaky page), the rest pass
 *      setup()    – the parent's setup first, then log `${name}: open browser at ${ctx.url(page)}`
 *      attempt(n) – log `${name}: check ${page} (attempt ${n})`, then return whether it passed
 *      teardown() – log `${name}: close browser` FIRST, then the parent's teardown
 *      static login(ctx, failFirst = 0) – a factory: name "login-ui", page "/login", tags ["smoke", "ui"]
 *
 * Reuse the parent's code with super – don't copy it. Add the private fields you need yourself.
 */
export class ApiCheck extends BaseCheck {
  constructor(name: string, ctx: RunContext, path: string, expectedStatus: number, responses: number[], tags?: string[]) {
    super(name, ctx, tags);
    throw new Error("TODO");
  }

  protected override attempt(n: number): boolean {
    throw new Error("TODO");
  }

  static health(ctx: RunContext, responses: number[] = [200]): ApiCheck {
    throw new Error("TODO");
  }
}

export class UiCheck extends BaseCheck {
  constructor(name: string, ctx: RunContext, page: string, failFirst: number = 0, tags?: string[]) {
    super(name, ctx, tags);
    throw new Error("TODO");
  }

  protected override setup(): void {
    throw new Error("TODO");
  }

  protected override attempt(n: number): boolean {
    throw new Error("TODO");
  }

  protected override teardown(): void {
    throw new Error("TODO");
  }

  static login(ctx: RunContext, failFirst: number = 0): UiCheck {
    throw new Error("TODO");
  }
}

export type Summary = { total: number; passed: number; failed: number; errors: number; skipped: number; flaky: number };
export type Verdict = "GREEN" | "YELLOW" | "RED";

/**
 * Task 5 – SmokeSuite: run everything and sum it up
 *   add(check): this   – adds a check and returns the suite itself, so calls can be chained: suite.add(a).add(b)
 *                        A name that is already in the suite =>
 *                          SuiteError("DUPLICATE_CHECK", `"${name}" is already in the suite`)
 *   get size           – how many checks were added
 *   run(): CheckResult[] – executes every check in order, keeps the results, and returns them as a NEW array
 *   summary(): Summary – { total, passed, failed, errors, skipped, flaky } of the last run
 *                          flaky = checks that passed, but needed more than 1 attempt
 *                          skipped stays 0 until Task 7
 *   get verdict        – "RED"    if anything failed or crashed, or if nothing actually ran (an empty suite is not green!)
 *                        "YELLOW" if everything passed but some checks were flaky
 *                        "GREEN"  otherwise
 *   report(): string   – JSON for the CI dashboard: { env, baseUrl, token, verdict, summary, results }
 *                          token is the MASKED token – the real one must never reach the report
 *   summary, verdict and report before run() => SuiteError("NOT_RUN", "run the suite first")
 *
 * Add the private fields you need yourself (the checks, the results of the last run...).
 */
export class SmokeSuite {
  private readonly ctx: RunContext;

  constructor(ctx: RunContext) {
    this.ctx = ctx;
  }

  add(check: BaseCheck): this {
    throw new Error("TODO");
  }

  get size(): number {
    throw new Error("TODO");
  }

  run(): CheckResult[] {
    throw new Error("TODO");
  }

  summary(): Summary {
    throw new Error("TODO");
  }

  get verdict(): Verdict {
    throw new Error("TODO");
  }

  report(): string {
    throw new Error("TODO");
  }

  /**
   * Task 7 (Challenge) – tags decide what runs, and rerunFailed
   * a. Update run(): a check runs only if at least one of its tags is in ctx.config.tags.
   *    Any other check is NOT executed at all (no setup, no log lines) – its result is
   *      { id, name, status: "skipped", attempts: 0, message: `skipped (tags: ${its tags joined with ","})` }
   * b. rerunFailed(): CheckResult[] – runs again ONLY the checks whose last result was "failed" or "error"
   *    (with the same tag rule), puts each new result in the place of the old one, and returns just the new results.
   *    Before run() => the NOT_RUN error.  The summary, verdict and report now show the new results.
   *    Typical use: the team raises ctx.retries and gives the flaky checks a second chance.
   *
   * Hint: a private helper that runs (or skips) one check can serve both run() and rerunFailed().
   */
  rerunFailed(): CheckResult[] {
    throw new Error("TODO");
  }
}

/**
 * Task 6 (Challenge) – ContractCheck: the status AND the shape of the body
 * The cart API answered 200 – but the front end crashed, because "total" was renamed to "amount".
 * A status check alone would never catch that.
 *   ContractCheck(name, ctx, path, body, requiredFields, responses = [200]) extends ApiCheck
 *     expects status 200;  body is the raw JSON text the (simulated) API returns
 *     requiredFields empty => SuiteError("BAD_CHECK", `${name}: requiredFields must not be empty`)
 *   attempt(n):
 *     1. first the status check of ApiCheck (use super – it also writes the GET log line).
 *        A wrong status => return false, so it can be retried like any API check.
 *     2. then the body:  not valid JSON  => throw SuiteError("CONTRACT", `${name}: body is not valid JSON`)
 *                        missing fields  => throw SuiteError("CONTRACT", `${name}: missing field(s) total, currency`)
 *                                           (the missing ones, in the order of requiredFields)
 *     3. all good => log `${name}: contract ok (${number of required fields} field(s))` and return true
 *   Why throw and not return false?  Look at what execute does with each – a broken contract is a bug,
 *   retrying it will not help. You get that behavior without changing execute at all.
 */
export class ContractCheck extends ApiCheck {
  constructor(name: string, ctx: RunContext, path: string, body: string, requiredFields: string[], responses: number[] = [200]) {
    super(name, ctx, path, 200, responses);
    throw new Error("TODO");
  }

  protected override attempt(n: number): boolean {
    throw new Error("TODO");
  }
}

// ============================================================
// Self-check – run:  npm run exercise -- 03 hw2
// On every line, the value left of "=> expected:" must equal the value on its right.
// (No need to change the code below this line)
// ============================================================

/** Runs fn and describes the result: "did not throw", or "threw: <error name>: <message>". A TODO is passed on. */
function thrown(fn: () => unknown): string {
  try {
    fn();
    return "did not throw";
  } catch (err) {
    if ((err as Error).message === "TODO") throw err;
    return `threw: ${(err as Error).name}: ${(err as Error).message}`;
  }
}

/** A check for the self-check only: every attempt follows a script – "pass", "fail" or "throw" */
class ScriptedCheck extends BaseCheck {
  private readonly script: string[];

  constructor(name: string, ctx: RunContext, script: string[]) {
    super(name, ctx);
    this.script = script;
  }

  protected override attempt(n: number): boolean {
    const step = this.script[n - 1];
    if (step === "throw") throw new SuiteError("BROKEN", `${this.name} crashed on attempt ${n}`);
    return step === "pass";
  }
}

const TOKEN = "sk_live_9f8e7d6c";

console.log("\n--- Task 1: SuiteError and config objects ---");
try {
  const err = new SuiteError("BAD_CONFIG", "retries must be an integer between 0 and 3");
  console.log(err.message, "=> expected:", "[BAD_CONFIG] retries must be an integer between 0 and 3");
  console.log([err.code, err.name, err instanceof Error], "=> expected:", ["BAD_CONFIG", "SuiteError", true]);

  const base = buildConfig();
  console.log(base, "=> expected:", {
    env: "staging",
    baseUrl: "https://staging.shop.test",
    retries: 1,
    timeoutMs: 5000,
    tags: ["smoke"],
  });
  console.log([base === DEFAULT_CONFIG, base.tags === DEFAULT_CONFIG.tags], "=> expected:", [false, false]);

  const prod = buildConfig({ env: "prod", retries: 0 });
  console.log([prod.env, prod.baseUrl, prod.retries, prod.timeoutMs], "=> expected:", [
    "prod",
    "https://prod.shop.test",
    0,
    5000,
  ]);
  const local = buildConfig({ env: "dev", baseUrl: "http://localhost:3000" });
  console.log(local.baseUrl, "=> expected:", "http://localhost:3000"); // an explicit baseUrl wins

  // The shallow-copy trap: changing a result's tags must not change the defaults or the overrides
  const myTags = ["smoke", "checkout"];
  const tagged = buildConfig({ tags: myTags });
  tagged.tags.push("nightly");
  base.tags.push("oops");
  console.log([DEFAULT_CONFIG.tags, myTags], "=> expected:", [["smoke"], ["smoke", "checkout"]]);

  const wider = withTags(prod, ["checkout", "smoke", "checkout"]);
  console.log(wider.tags, "=> expected:", ["smoke", "checkout"]);
  console.log([prod.tags, wider.env], "=> expected:", [["smoke"], "prod"]); // the original config did not change

  console.log(
    configSummary(wider),
    "=> expected:",
    "env=prod | baseUrl=https://prod.shop.test | retries=0 | timeoutMs=5000 | tags=smoke,checkout",
  );

  const parsed = parseConfig('{"env":"dev","retries":2,"tags":["smoke","api"]}');
  console.log(
    configSummary(parsed),
    "=> expected:",
    "env=dev | baseUrl=https://dev.shop.test | retries=2 | timeoutMs=5000 | tags=smoke,api",
  );
  console.log(
    thrown(() => parseConfig('{"env":"dev",}')),
    "=> expected:",
    "threw: SuiteError: [BAD_CONFIG] config is not valid JSON",
  );
  // A typo in a config key must not be silently ignored
  console.log(
    thrown(() => parseConfig('{"env":"dev","retry":2,"hedless":true}')),
    "=> expected:",
    "threw: SuiteError: [BAD_CONFIG] unknown key(s): retry, hedless",
  );
  // err.code = "OTHER";   // ❌ readonly
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Task 2: RunContext – a private token, a validated setter, copies out ---");
try {
  const config = buildConfig({ tags: ["smoke", "checkout"] });
  const ctx = new RunContext(config, TOKEN);
  console.log([ctx.retries, ctx.maskedToken, ctx.authHeader()], "=> expected:", [1, "sk_l****", "Bearer sk_live_9f8e7d6c"]);
  console.log(ctx.url("/cart"), "=> expected:", "https://staging.shop.test/cart");

  ctx.retries = 3;
  console.log(ctx.retries, "=> expected:", 3);
  console.log(
    [4, 1.5, -1].map((n) => thrown(() => (ctx.retries = n))),
    "=> expected:",
    [
      "threw: SuiteError: [BAD_CONFIG] retries must be an integer between 0 and 3",
      "threw: SuiteError: [BAD_CONFIG] retries must be an integer between 0 and 3",
      "threw: SuiteError: [BAD_CONFIG] retries must be an integer between 0 and 3",
    ],
  );
  console.log([ctx.retries, ctx.config.retries], "=> expected:", [3, 3]); // a failed set keeps the old value

  // The config getter returns a copy – and the context keeps its own copy of what it was given
  ctx.config.tags.push("hacked");
  config.tags.push("changed-outside");
  config.env = "prod";
  console.log([ctx.config.env, ctx.config.tags], "=> expected:", ["staging", ["smoke", "checkout"]]);

  console.log(
    thrown(() => new RunContext(DEFAULT_CONFIG, "short")),
    "=> expected:",
    "threw: SuiteError: [BAD_TOKEN] token must be at least 8 characters with no spaces",
  );
  console.log(
    thrown(() => new RunContext(DEFAULT_CONFIG, "my secret token")),
    "=> expected:",
    "threw: SuiteError: [BAD_TOKEN] token must be at least 8 characters with no spaces",
  );
  console.log(
    thrown(() => new RunContext(buildConfig({ retries: 9 }), TOKEN)),
    "=> expected:",
    "threw: SuiteError: [BAD_CONFIG] retries must be an integer between 0 and 3",
  );

  ctx.log("first");
  ctx.log("second");
  ctx.logs.push("fake"); // a copy – the context's log does not change
  console.log(ctx.logs, "=> expected:", ["first", "second"]);

  // The token never leaves the object – not in JSON, not in the keys
  console.log(JSON.stringify(ctx).includes(TOKEN), "=> expected:", false);
  console.log(
    Object.keys(ctx).some((key) => key.toLowerCase().includes("token")),
    "=> expected:",
    false,
  );
  // ctx.maskedToken = "x";          // ❌ a getter without a setter – read only
  // ctx.lines;                      // ❌ private
  // RunContext.MAX_RETRIES = 10;    // ❌ static readonly
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Task 3: BaseCheck – ids and the template method ---");
try {
  BaseCheck.resetIds();
  const ctx = new RunContext(buildConfig({ retries: 2 }), TOKEN); // up to 3 attempts
  const steady = new ScriptedCheck("steady", ctx, ["pass"]);
  const flaky = new ScriptedCheck("flaky", ctx, ["fail", "fail", "pass"]);
  const broken = new ScriptedCheck("broken", ctx, ["fail", "throw", "pass"]);
  const failing = new ScriptedCheck("failing", ctx, ["fail", "fail", "fail", "pass"]); // the 4th is never reached
  console.log([steady.id, flaky.id, broken.id, failing.id], "=> expected:", ["CHK-001", "CHK-002", "CHK-003", "CHK-004"]);
  console.log(steady.tags, "=> expected:", ["smoke"]);

  console.log(steady.execute(), "=> expected:", { id: "CHK-001", name: "steady", status: "passed", attempts: 1, message: "ok" });
  console.log(ctx.logs, "=> expected:", ["steady: setup", "steady: teardown", "steady: PASSED"]);
  console.log(flaky.execute(), "=> expected:", { id: "CHK-002", name: "flaky", status: "passed", attempts: 3, message: "ok" });
  console.log(failing.execute(), "=> expected:", {
    id: "CHK-004",
    name: "failing",
    status: "failed",
    attempts: 3,
    message: "failed after 3 attempt(s)",
  });

  // A crash stops the attempts – and teardown still runs
  console.log(broken.execute(), "=> expected:", {
    id: "CHK-003",
    name: "broken",
    status: "error",
    attempts: 2,
    message: "[BROKEN] broken crashed on attempt 2",
  });
  console.log(ctx.logs.slice(-4), "=> expected:", [
    "broken: setup",
    "broken: attempt 1 failed",
    "broken: teardown",
    "broken: ERROR",
  ]);

  // execute reads the retries when it runs, not when the check was created
  ctx.retries = 0;
  const once = flaky.execute();
  console.log([once.status, once.attempts], "=> expected:", ["failed", 1]);

  // BaseCheck itself has no steps
  console.log(new BaseCheck("empty", ctx).execute(), "=> expected:", {
    id: "CHK-005",
    name: "empty",
    status: "error",
    attempts: 1,
    message: "[NOT_IMPLEMENTED] empty has no steps",
  });
  console.log(new BaseCheck("tagged", ctx, ["api", "smoke"]).tags, "=> expected:", ["api", "smoke"]);
  BaseCheck.resetIds();
  console.log(new BaseCheck("again", ctx).id, "=> expected:", "CHK-001");
  // steady.attempt(1);       // ❌ protected
  // steady.id = "CHK-999";   // ❌ readonly
  // BaseCheck.created = 0;   // ❌ private static – only resetIds may do it
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Task 4: ApiCheck and UiCheck – overriding the hooks, factory methods ---");
try {
  BaseCheck.resetIds();
  const ctx = new RunContext(buildConfig(), TOKEN); // retries: 1 => up to 2 attempts
  const users = new ApiCheck("users-api", ctx, "/users", 200, [200]);
  console.log(users.execute(), "=> expected:", { id: "CHK-001", name: "users-api", status: "passed", attempts: 1, message: "ok" });
  console.log(ctx.logs, "=> expected:", [
    "users-api: setup",
    "users-api: GET https://staging.shop.test/users -> 200",
    "users-api: teardown",
    "users-api: PASSED",
  ]);

  // A flaky endpoint: 503 first, then 200 – one retry saves it
  const cart = new ApiCheck("cart-api", ctx, "/cart", 200, [503, 200]);
  const cartResult = cart.execute();
  console.log([cartResult.status, cartResult.attempts], "=> expected:", ["passed", 2]);

  // The last response repeats on every attempt after it
  const orders = new ApiCheck("orders-api", ctx, "/orders", 201, [500]);
  console.log(orders.execute(), "=> expected:", {
    id: "CHK-003",
    name: "orders-api",
    status: "failed",
    attempts: 2,
    message: "failed after 2 attempt(s)",
  });
  console.log(
    ctx.logs.filter((line) => line.startsWith("orders-api: GET")),
    "=> expected:",
    ["orders-api: GET https://staging.shop.test/orders -> 500", "orders-api: GET https://staging.shop.test/orders -> 500"],
  );
  console.log(
    thrown(() => new ApiCheck("ghost-api", ctx, "/ghost", 200, [])),
    "=> expected:",
    "threw: SuiteError: [BAD_CHECK] ghost-api: responses must not be empty",
  );

  // UiCheck adds to setup and teardown with super – in the right order
  const uiCtx = new RunContext(buildConfig(), TOKEN);
  const uiResult = new UiCheck("cart-ui", uiCtx, "/cart", 1).execute();
  console.log([uiResult.status, uiResult.attempts], "=> expected:", ["passed", 2]);
  console.log(uiCtx.logs, "=> expected:", [
    "cart-ui: setup",
    "cart-ui: open browser at https://staging.shop.test/cart",
    "cart-ui: check /cart (attempt 1)",
    "cart-ui: attempt 1 failed",
    "cart-ui: check /cart (attempt 2)",
    "cart-ui: close browser",
    "cart-ui: teardown",
    "cart-ui: PASSED",
  ]);

  // Factory methods
  const health = ApiCheck.health(ctx);
  console.log([health instanceof ApiCheck, health.name, health.tags, health.execute().status], "=> expected:", [
    true,
    "health",
    ["smoke"],
    "passed",
  ]);
  console.log(ApiCheck.health(ctx, [503, 503]).execute().message, "=> expected:", "failed after 2 attempt(s)");
  const login = UiCheck.login(ctx);
  console.log([login instanceof UiCheck, login instanceof BaseCheck, login.name, login.tags], "=> expected:", [
    true,
    true,
    "login-ui",
    ["smoke", "ui"],
  ]);

  // An array typed as the base class – each check runs its own hooks inside the same execute
  const checks: BaseCheck[] = [ApiCheck.health(ctx), UiCheck.login(ctx, 5), new BaseCheck("todo", ctx)];
  console.log(
    checks.map((c) => c.execute().status),
    "=> expected:",
    ["passed", "failed", "error"],
  );
  // users.responses;      // ❌ private
  // users.attempt(1);     // ❌ protected
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Task 5: SmokeSuite – run, summary, verdict and a JSON report ---");
try {
  BaseCheck.resetIds();
  const ctx = new RunContext(buildConfig({ tags: ["smoke", "checkout"] }), TOKEN);
  const suite = new SmokeSuite(ctx);
  suite.add(ApiCheck.health(ctx)).add(new ApiCheck("cart-api", ctx, "/cart", 200, [503, 200])).add(UiCheck.login(ctx));
  console.log(suite.size, "=> expected:", 3);
  console.log(
    thrown(() => suite.add(ApiCheck.health(ctx))),
    "=> expected:",
    'threw: SuiteError: [DUPLICATE_CHECK] "health" is already in the suite',
  );
  console.log(suite.size, "=> expected:", 3);
  console.log(
    [thrown(() => suite.summary()), thrown(() => suite.verdict)],
    "=> expected:",
    ["threw: SuiteError: [NOT_RUN] run the suite first", "threw: SuiteError: [NOT_RUN] run the suite first"],
  );

  const results = suite.run();
  console.log(
    results.map((r) => `${r.id} ${r.name} ${r.status} x${r.attempts}`),
    "=> expected:",
    ["CHK-001 health passed x1", "CHK-002 cart-api passed x2", "CHK-003 login-ui passed x1"],
  );
  console.log(suite.summary(), "=> expected:", { total: 3, passed: 3, failed: 0, errors: 0, skipped: 0, flaky: 1 });
  console.log(suite.verdict, "=> expected:", "YELLOW"); // everything passed, but cart-api needed a retry

  const report = suite.report();
  const parsed = JSON.parse(report);
  console.log([parsed.env, parsed.baseUrl, parsed.token, parsed.verdict], "=> expected:", [
    "staging",
    "https://staging.shop.test",
    "sk_l****",
    "YELLOW",
  ]);
  console.log([parsed.summary.flaky, parsed.results.length, parsed.results[1].name], "=> expected:", [1, 3, "cart-api"]);
  console.log(report.includes(TOKEN), "=> expected:", false); // the real token never reaches the report

  // run returns a new array – emptying it does not touch the suite
  results.length = 0;
  console.log(suite.summary().total, "=> expected:", 3);

  const green = new SmokeSuite(ctx).add(ApiCheck.health(ctx));
  green.run();
  console.log(green.verdict, "=> expected:", "GREEN");
  const red = new SmokeSuite(ctx).add(ApiCheck.health(ctx)).add(new ApiCheck("orders-api", ctx, "/orders", 201, [500]));
  red.run();
  console.log([red.summary().failed, red.verdict], "=> expected:", [1, "RED"]);
  const crashed = new SmokeSuite(ctx).add(new BaseCheck("todo", ctx));
  crashed.run();
  console.log([crashed.summary().errors, crashed.verdict], "=> expected:", [1, "RED"]);
  const empty = new SmokeSuite(ctx);
  empty.run();
  console.log([empty.summary().total, empty.verdict], "=> expected:", [0, "RED"]); // nothing ran – that is not green
  // suite.verdict = "GREEN";   // ❌ a getter without a setter
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Task 6 (Challenge): ContractCheck – status first, then the shape of the body ---");
try {
  BaseCheck.resetIds();
  const ctx = new RunContext(buildConfig(), TOKEN); // retries: 1
  const contract = new ContractCheck("cart-contract", ctx, "/cart", '{"items":[],"total":0,"currency":"ILS"}', [
    "items",
    "total",
    "currency",
  ]);
  console.log([contract instanceof ApiCheck, contract.execute().status], "=> expected:", [true, "passed"]);
  console.log(ctx.logs, "=> expected:", [
    "cart-contract: setup",
    "cart-contract: GET https://staging.shop.test/cart -> 200",
    "cart-contract: contract ok (3 field(s))",
    "cart-contract: teardown",
    "cart-contract: PASSED",
  ]);

  // A missing field is a bug, not flakiness – error, and no second attempt
  const broken = new ContractCheck("cart-contract-v2", ctx, "/cart", '{"items":[],"amount":0}', [
    "items",
    "total",
    "currency",
  ]);
  console.log(broken.execute(), "=> expected:", {
    id: "CHK-002",
    name: "cart-contract-v2",
    status: "error",
    attempts: 1,
    message: "[CONTRACT] cart-contract-v2: missing field(s) total, currency",
  });

  // The status check comes from ApiCheck – a 503 is still retried, like any API check
  const orders = new ContractCheck("orders-contract", ctx, "/orders", '{"orders":[]}', ["orders"], [503, 200]);
  const ordersResult = orders.execute();
  console.log([ordersResult.status, ordersResult.attempts], "=> expected:", ["passed", 2]);

  const maintenance = new ContractCheck("home-contract", ctx, "/", "<html>maintenance</html>", ["status"]);
  console.log(maintenance.execute().message, "=> expected:", "[CONTRACT] home-contract: body is not valid JSON");
  console.log(
    thrown(() => new ContractCheck("empty-contract", ctx, "/", "{}", [])),
    "=> expected:",
    "threw: SuiteError: [BAD_CHECK] empty-contract: requiredFields must not be empty",
  );

  // To the suite it is just another check
  const suite = new SmokeSuite(ctx).add(contract).add(broken);
  suite.run();
  console.log([suite.summary().errors, suite.verdict], "=> expected:", [1, "RED"]);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Task 7 (Challenge): tags decide what runs, and rerunFailed ---");
try {
  BaseCheck.resetIds();
  const ctx = new RunContext(buildConfig({ retries: 0 }), TOKEN); // tags: ["smoke"]
  const suite = new SmokeSuite(ctx)
    .add(ApiCheck.health(ctx))
    .add(UiCheck.login(ctx, 1)) // fails once, then passes
    .add(new ApiCheck("search-api", ctx, "/search", 200, [200], ["nightly"]))
    .add(new UiCheck("checkout-ui", ctx, "/checkout", 0, ["nightly", "ui"]));
  console.log(thrown(() => suite.rerunFailed()), "=> expected:", "threw: SuiteError: [NOT_RUN] run the suite first");

  const first = suite.run();
  console.log(
    first.map((r) => `${r.name}: ${r.status}`),
    "=> expected:",
    ["health: passed", "login-ui: failed", "search-api: skipped", "checkout-ui: skipped"],
  );
  console.log(first[3], "=> expected:", {
    id: "CHK-004",
    name: "checkout-ui",
    status: "skipped",
    attempts: 0,
    message: "skipped (tags: nightly,ui)",
  });
  console.log(
    ctx.logs.some((line) => line.startsWith("search-api") || line.startsWith("checkout-ui")),
    "=> expected:",
    false,
  ); // a skipped check does not even set up
  console.log(suite.summary(), "=> expected:", { total: 4, passed: 1, failed: 1, errors: 0, skipped: 2, flaky: 0 });
  console.log(suite.verdict, "=> expected:", "RED");

  // Give flaky checks a second chance – and rerun only what failed
  ctx.retries = 1;
  const logsBefore = ctx.logs.length;
  const rerun = suite.rerunFailed();
  console.log(
    rerun.map((r) => `${r.name}: ${r.status} x${r.attempts}`),
    "=> expected:",
    ["login-ui: passed x2"],
  );
  console.log(
    ctx.logs.slice(logsBefore).some((line) => line.startsWith("health")),
    "=> expected:",
    false,
  ); // health passed – it did not run again
  console.log(suite.summary(), "=> expected:", { total: 4, passed: 2, failed: 0, errors: 0, skipped: 2, flaky: 1 });
  console.log([suite.verdict, JSON.parse(suite.report()).verdict], "=> expected:", ["YELLOW", "YELLOW"]);
  console.log(suite.rerunFailed(), "=> expected:", []); // nothing left to rerun

  // Everything skipped – nothing ran, so it is not green
  const nightlyOnly = new SmokeSuite(ctx).add(new ApiCheck("search-api", ctx, "/search", 200, [200], ["nightly"]));
  nightlyOnly.run();
  console.log([nightlyOnly.summary().skipped, nightlyOnly.verdict], "=> expected:", [1, "RED"]);

  // A nightly run picks the nightly checks instead
  const nightlyCtx = new RunContext(buildConfig({ tags: ["nightly"] }), TOKEN);
  const nightly = new SmokeSuite(nightlyCtx)
    .add(ApiCheck.health(nightlyCtx))
    .add(new ApiCheck("search-api", nightlyCtx, "/search", 200, [200], ["nightly"]));
  console.log(
    nightly.run().map((r) => r.status),
    "=> expected:",
    ["skipped", "passed"],
  );
} catch (e) {
  console.log("  ✋", (e as Error).message);
}
