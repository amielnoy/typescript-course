// Lesson 3 – Homework 2: Checkout Smoke Suite – config objects, checks with a lifecycle, and a CI report – Solution
// Check yourself: npm run solution -- 03 hw2 (self-check at the end of the file)

export type Env = "dev" | "staging" | "prod";
export type RunConfig = { env: Env; baseUrl: string; retries: number; timeoutMs: number; tags: string[] };
export type ConfigOverrides = { env?: Env; baseUrl?: string; retries?: number; timeoutMs?: number; tags?: string[] };

export const DEFAULT_CONFIG: RunConfig = {
  env: "staging",
  baseUrl: "https://staging.shop.test",
  retries: 1,
  timeoutMs: 5000,
  tags: ["smoke"],
};

// ---------- Task 1 ----------
export class SuiteError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(`[${code}] ${message}`);
    this.code = code;
    this.name = "SuiteError";
  }
}

export function buildConfig(overrides: ConfigOverrides = {}): RunConfig {
  const env = overrides.env ?? DEFAULT_CONFIG.env;
  return {
    ...DEFAULT_CONFIG,
    ...overrides,
    baseUrl: overrides.baseUrl ?? `https://${env}.shop.test`,
    // A new array – {...DEFAULT_CONFIG} alone would share the same tags array (a shallow copy)
    tags: [...(overrides.tags ?? DEFAULT_CONFIG.tags)],
  };
}

export function withTags(config: RunConfig, extra: string[]): RunConfig {
  const tags = [...config.tags];
  for (const tag of extra) {
    if (!tags.includes(tag)) tags.push(tag);
  }
  return { ...config, tags };
}

export function configSummary(config: RunConfig): string {
  // `${value}` of an array joins it with "," – exactly the format we need for tags
  return Object.entries(config)
    .map(([key, value]) => `${key}=${value}`)
    .join(" | ");
}

export function parseConfig(json: string): RunConfig {
  let parsed: ConfigOverrides;
  try {
    parsed = JSON.parse(json) as ConfigOverrides;
  } catch {
    throw new SuiteError("BAD_CONFIG", "config is not valid JSON");
  }
  const known = Object.keys(DEFAULT_CONFIG);
  const unknown = Object.keys(parsed).filter((key) => !known.includes(key));
  if (unknown.length > 0) {
    throw new SuiteError("BAD_CONFIG", `unknown key(s): ${unknown.join(", ")}`);
  }
  return buildConfig(parsed);
}

// ---------- Task 2 ----------
export class RunContext {
  static readonly MAX_RETRIES = 3;
  #config: RunConfig;
  #token: string;
  private lines: string[] = [];

  constructor(config: RunConfig, token: string) {
    if (token.length < 8 || token.includes(" ")) {
      throw new SuiteError("BAD_TOKEN", "token must be at least 8 characters with no spaces"); // never the token itself
    }
    this.#token = token;
    this.#config = { ...config, tags: [...config.tags] }; // our own copy – later changes outside don't reach us
    this.retries = config.retries; // the same validation as the setter
  }

  get config(): RunConfig {
    return { ...this.#config, tags: [...this.#config.tags] };
  }

  get retries(): number {
    return this.#config.retries;
  }

  set retries(value: number) {
    if (!Number.isInteger(value) || value < 0 || value > RunContext.MAX_RETRIES) {
      throw new SuiteError("BAD_CONFIG", `retries must be an integer between 0 and ${RunContext.MAX_RETRIES}`);
    }
    this.#config.retries = value;
  }

  get maskedToken(): string {
    return `${this.#token.slice(0, 4)}****`;
  }

  authHeader(): string {
    return `Bearer ${this.#token}`;
  }

  url(path: string): string {
    return `${this.#config.baseUrl}${path}`;
  }

  log(line: string): void {
    this.lines.push(line);
  }

  get logs(): string[] {
    return [...this.lines];
  }
}

// ---------- Task 3 ----------
export type Status = "passed" | "failed" | "error" | "skipped";
export type CheckResult = { id: string; name: string; status: Status; attempts: number; message: string };

export class BaseCheck {
  private static created = 0;
  readonly id: string;
  readonly name: string;
  readonly tags: string[];
  protected readonly ctx: RunContext;

  constructor(name: string, ctx: RunContext, tags: string[] = ["smoke"]) {
    this.id = BaseCheck.nextId();
    this.name = name;
    this.ctx = ctx;
    this.tags = [...tags];
  }

  private static nextId(): string {
    BaseCheck.created++;
    return `CHK-${String(BaseCheck.created).padStart(3, "0")}`;
  }

  static resetIds(): void {
    BaseCheck.created = 0;
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
    this.setup();
    const maxAttempts = 1 + this.ctx.retries; // read now – the retries may have changed since the check was created
    let status: Status = "failed";
    let message = "";
    let attempts = 0;
    for (let n = 1; n <= maxAttempts; n++) {
      attempts = n;
      try {
        if (this.attempt(n)) {
          status = "passed";
          break;
        }
        this.ctx.log(`${this.name}: attempt ${n} failed`);
      } catch (err) {
        status = "error"; // a crash is not flakiness – don't try again
        message = (err as Error).message;
        break;
      }
    }
    this.teardown(); // always – also after an error
    if (status === "passed") message = "ok";
    if (status === "failed") message = `failed after ${attempts} attempt(s)`;
    this.ctx.log(`${this.name}: ${status.toUpperCase()}`);
    return { id: this.id, name: this.name, status, attempts, message };
  }
}

// ---------- Task 4 ----------
export class ApiCheck extends BaseCheck {
  private readonly path: string;
  private readonly expectedStatus: number;
  private readonly responses: number[];

  constructor(name: string, ctx: RunContext, path: string, expectedStatus: number, responses: number[], tags?: string[]) {
    super(name, ctx, tags); // undefined => the default ["smoke"] of BaseCheck
    if (responses.length === 0) {
      throw new SuiteError("BAD_CHECK", `${name}: responses must not be empty`);
    }
    this.path = path;
    this.expectedStatus = expectedStatus;
    this.responses = [...responses];
  }

  protected override attempt(n: number): boolean {
    const status = this.responses[Math.min(n, this.responses.length) - 1]; // the last response repeats
    this.ctx.log(`${this.name}: GET ${this.ctx.url(this.path)} -> ${status}`);
    return status === this.expectedStatus;
  }

  static health(ctx: RunContext, responses: number[] = [200]): ApiCheck {
    return new ApiCheck("health", ctx, "/health", 200, responses);
  }
}

export class UiCheck extends BaseCheck {
  private readonly page: string;
  private readonly failFirst: number;

  constructor(name: string, ctx: RunContext, page: string, failFirst: number = 0, tags?: string[]) {
    super(name, ctx, tags);
    this.page = page;
    this.failFirst = failFirst;
  }

  protected override setup(): void {
    super.setup();
    this.ctx.log(`${this.name}: open browser at ${this.ctx.url(this.page)}`);
  }

  protected override attempt(n: number): boolean {
    this.ctx.log(`${this.name}: check ${this.page} (attempt ${n})`);
    return n > this.failFirst;
  }

  protected override teardown(): void {
    this.ctx.log(`${this.name}: close browser`); // close the browser first, then the parent's cleanup
    super.teardown();
  }

  static login(ctx: RunContext, failFirst: number = 0): UiCheck {
    return new UiCheck("login-ui", ctx, "/login", failFirst, ["smoke", "ui"]);
  }
}

// ---------- Tasks 5 and 7 ----------
export type Summary = { total: number; passed: number; failed: number; errors: number; skipped: number; flaky: number };
export type Verdict = "GREEN" | "YELLOW" | "RED";

export class SmokeSuite {
  private readonly ctx: RunContext;
  private checks: BaseCheck[] = [];
  private results: CheckResult[] | undefined = undefined; // undefined = not run yet

  constructor(ctx: RunContext) {
    this.ctx = ctx;
  }

  // ----- Task 5 -----

  add(check: BaseCheck): this {
    if (this.checks.some((c) => c.name === check.name)) {
      throw new SuiteError("DUPLICATE_CHECK", `"${check.name}" is already in the suite`);
    }
    this.checks.push(check);
    return this; // so calls can be chained: suite.add(a).add(b)
  }

  get size(): number {
    return this.checks.length;
  }

  run(): CheckResult[] {
    this.results = this.checks.map((check) => this.runOne(check));
    return [...this.results];
  }

  summary(): Summary {
    const results = this.requireResults();
    const count = (status: Status) => results.filter((r) => r.status === status).length;
    return {
      total: results.length,
      passed: count("passed"),
      failed: count("failed"),
      errors: count("error"),
      skipped: count("skipped"),
      flaky: results.filter((r) => r.status === "passed" && r.attempts > 1).length,
    };
  }

  get verdict(): Verdict {
    const s = this.summary();
    if (s.failed + s.errors > 0) return "RED";
    if (s.total - s.skipped === 0) return "RED"; // nothing ran – that is not green
    return s.flaky > 0 ? "YELLOW" : "GREEN";
  }

  report(): string {
    const config = this.ctx.config;
    return JSON.stringify({
      env: config.env,
      baseUrl: config.baseUrl,
      token: this.ctx.maskedToken, // never the real one
      verdict: this.verdict,
      summary: this.summary(),
      results: this.requireResults(),
    });
  }

  // ----- Task 7 -----

  rerunFailed(): CheckResult[] {
    const results = this.requireResults();
    const rerun: CheckResult[] = [];
    this.checks.forEach((check, i) => {
      if (results[i].status === "failed" || results[i].status === "error") {
        results[i] = this.runOne(check); // the new result takes the old one's place
        rerun.push(results[i]);
      }
    });
    return rerun;
  }

  private runOne(check: BaseCheck): CheckResult {
    const wanted = this.ctx.config.tags;
    if (!check.tags.some((tag) => wanted.includes(tag))) {
      return { id: check.id, name: check.name, status: "skipped", attempts: 0, message: `skipped (tags: ${check.tags.join(",")})` };
    }
    return check.execute();
  }

  private requireResults(): CheckResult[] {
    if (this.results === undefined) {
      throw new SuiteError("NOT_RUN", "run the suite first");
    }
    return this.results;
  }
}

// ---------- Task 6 ----------
export class ContractCheck extends ApiCheck {
  private readonly body: string;
  private readonly requiredFields: string[];

  constructor(name: string, ctx: RunContext, path: string, body: string, requiredFields: string[], responses: number[] = [200]) {
    super(name, ctx, path, 200, responses);
    if (requiredFields.length === 0) {
      throw new SuiteError("BAD_CHECK", `${name}: requiredFields must not be empty`);
    }
    this.body = body;
    this.requiredFields = [...requiredFields];
  }

  protected override attempt(n: number): boolean {
    if (!super.attempt(n)) return false; // a wrong status – ApiCheck already logged it, and it may be retried
    let parsed: object;
    try {
      parsed = JSON.parse(this.body) as object;
    } catch {
      throw new SuiteError("CONTRACT", `${this.name}: body is not valid JSON`);
    }
    const keys = Object.keys(parsed);
    const missing = this.requiredFields.filter((field) => !keys.includes(field));
    if (missing.length > 0) {
      // Thrown, not "return false": execute turns it into "error" and does not retry – a broken contract is a bug
      throw new SuiteError("CONTRACT", `${this.name}: missing field(s) ${missing.join(", ")}`);
    }
    this.ctx.log(`${this.name}: contract ok (${this.requiredFields.length} field(s))`);
    return true;
  }
}

// ============================================================
// Self-check – run:  npm run solution -- 03 hw2
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
