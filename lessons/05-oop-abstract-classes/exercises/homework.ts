// Lesson 5 – Homework: Release Gate – pluggable API checks and alert channels
// ------------------------------------------------------------
// Scenario:
//   Every night, before a release, the QA team runs a "release gate": a set of API checks
//   against the staging server. Each check produces a result, the results are sent to several
//   alert channels (Slack, e-mail, the on-call pager...), and the gate decides: GO or NO-GO.
//   The team keeps adding new kinds of checks and new channels – so the runner must work
//   ONLY through the base types (ApiCheck, AlertChannel) and never change when a new kind is added.
//
// Instructions:
//   1. The tasks build on each other – solve them in order. Fill in every  throw new Error("TODO")
//      (and, where a task says so, add the members that are missing).
//   2. Use only what we have learned so far: classes, inheritance, override, super,
//      abstract classes / abstract methods / abstract readonly properties, protected,
//      Template Method (a base-class method with a fixed flow that calls "hooks" the subclasses fill in),
//      and arrays typed as the base class (polymorphism).
//   3. No instanceof and no if/switch on the kind of check or channel – let polymorphism do the work.
//   4. Remember (noImplicitOverride): implementing an abstract member does not need override,
//      but overriding a regular member (a method or a property with a value) – does.
//   5. Check yourself: npm run exercise -- 05 hw (self-check at the end of the file)
// ------------------------------------------------------------

export type HttpMethod = "GET" | "POST" | "DELETE";
export type Severity = "blocker" | "major" | "minor";

export type ApiResponse = { status: number; body: Record<string, unknown>; durationMs: number };

/** The result of one check. check = the request line, e.g. "GET /users" */
export type CheckResult = {
  check: string;
  severity: Severity;
  status: "pass" | "fail" | "error";
  problems: string[];
};

/**
 * FakeApi – the "staging server" (already implemented, no need to change it).
 * Routes are keyed by "METHOD /path". A route can be a response, or an Error = a network failure
 * (then request() throws it). An unknown route returns { status: 404, body: {}, durationMs: 5 }.
 * Every request is recorded in calls, e.g. ["GET /health", "POST /users"].
 */
export class FakeApi {
  readonly calls: string[] = [];

  constructor(private routes: Record<string, ApiResponse | Error>) {}

  request(method: HttpMethod, path: string): ApiResponse {
    const key = `${method} ${path}`;
    this.calls.push(key);
    const route = this.routes[key];
    if (route instanceof Error) throw route;
    return route ?? { status: 404, body: {}, durationMs: 5 };
  }
}

/**
 * Task 1 – The abstract class ApiCheck (Template Method)
 * The abstract members are already declared. Implement:
 *
 *   requestLine()  => `${method} ${path}`, e.g. "GET /users"
 *
 *   run(api)       – the fixed flow that every check shares:
 *     1. send the request:  api.request(this.method, this.path)
 *     2. problems = what evaluate(response) returned (copy it into a new array)
 *     3. the shared timing rule: if response.durationMs > this.maxDurationMs, add the problem
 *          `slow: ${durationMs}ms > ${maxDurationMs}ms`        (exactly the limit is still ok)
 *     4. return { check: requestLine(), severity, status: "pass" if there are no problems else "fail", problems }
 *     If the request OR evaluate throws – return status "error" with problems = [the error message].
 *     run() itself never throws.
 *
 *   e.g. a check on a 1800ms endpoint whose evaluate returns ["x"]
 *     => { check: "GET /reports", severity: "major", status: "fail", problems: ["x", "slow: 1800ms > 1000ms"] }
 */
export abstract class ApiCheck {
  abstract readonly method: HttpMethod;
  abstract readonly path: string;
  protected readonly maxDurationMs: number = 1000;

  constructor(public readonly severity: Severity = "major") {}

  /** Returns the list of problems found in the response (an empty list = the check passed) */
  protected abstract evaluate(response: ApiResponse): string[];

  requestLine(): string {
    throw new Error("TODO");
  }

  run(api: FakeApi): CheckResult {
    throw new Error("TODO");
  }
}

/**
 * Task 2 – Three kinds of checks (subclasses of ApiCheck)
 * Implement evaluate in each class. A wrong status is always reported as
 *   `status ${actual}, expected ${expected}`
 * and when the status is wrong, the body is not checked at all (only that one problem).
 *
 *   StatusCheck(path, expectedStatus)   GET.  Only the status.
 *
 *   ListCheck(path, minItems)           GET.  Expects status 200, and body.items must be:
 *                                         - an array, otherwise:          '"items" is not an array'
 *                                         - with at least minItems items:  `expected at least ${minItems} items, got ${n}`
 *                                       (hint: Array.isArray)
 *
 *   PostCreatesCheck(path)              POST. Expects status 201, and body.id must be a number,
 *                                       otherwise: '"id" is not a number'
 *                                       Writes are slower: this check allows up to 3000ms –
 *                                       add the member that changes the limit (only for this class!).
 *
 *   new ListCheck("/users", 5).run(api).problems   (the API returns 3 users)
 *     => ["expected at least 5 items, got 3"]
 */
export class StatusCheck extends ApiCheck {
  readonly method = "GET";

  constructor(
    readonly path: string,
    private expectedStatus: number,
    severity: Severity = "major",
  ) {
    super(severity);
  }

  protected evaluate(response: ApiResponse): string[] {
    throw new Error("TODO");
  }
}

export class ListCheck extends ApiCheck {
  readonly method = "GET";

  constructor(
    readonly path: string,
    private minItems: number,
    severity: Severity = "major",
  ) {
    super(severity);
  }

  protected evaluate(response: ApiResponse): string[] {
    throw new Error("TODO");
  }
}

export class PostCreatesCheck extends ApiCheck {
  readonly method = "POST";

  constructor(
    readonly path: string,
    severity: Severity = "major",
  ) {
    super(severity);
  }

  protected evaluate(response: ApiResponse): string[] {
    throw new Error("TODO");
  }
}

/**
 * Task 3 – The abstract class AlertChannel + two channels
 * a. Implement notify(results) in AlertChannel – a Template Method with two hooks:
 *      keep only the results for which shouldAlert(result) is true,
 *      and turn each one into a message with formatAlert(result). Return the messages, in order.
 *      shouldAlert is already implemented (default: alert on everything that did not pass) –
 *      a subclass may override it.
 * b. Implement formatAlert in the subclasses (problems are joined with "; "):
 *      SlackChannel("qa-alerts")
 *        => `[#qa-alerts] FAIL GET /orders - status 500, expected 200`      (the status in UPPER case)
 *      EmailChannel("qa@shop.test")
 *        => `To qa@shop.test: [major] GET /orders fail (1 problem(s))`
 *    The channel names (used as keys by the runner) are already set in the constructors.
 */
export abstract class AlertChannel {
  constructor(public readonly name: string) {}

  protected abstract formatAlert(result: CheckResult): string;

  protected shouldAlert(result: CheckResult): boolean {
    return result.status !== "pass";
  }

  notify(results: CheckResult[]): string[] {
    throw new Error("TODO");
  }
}

export class SlackChannel extends AlertChannel {
  constructor(private channel: string) {
    super(`slack:#${channel}`);
  }

  protected formatAlert(result: CheckResult): string {
    throw new Error("TODO");
  }
}

export class EmailChannel extends AlertChannel {
  constructor(private to: string) {
    super(`email:${to}`);
  }

  protected formatAlert(result: CheckResult): string {
    throw new Error("TODO");
  }
}

/**
 * Task 4 – PagerChannel: waking someone up at night must be rare
 * PagerChannel(onCall) – name: `pager:${onCall}` (already set).
 * It pages only when:
 *   - a check ended with status "error" (any severity – the environment itself is broken), or
 *   - a "blocker" check did not pass.
 * Message: `PAGE ${onCall}: ${check} is ${status} [${severity}]`
 *   e.g. "PAGE dana: GET /search is error [major]"
 *
 * Do not touch notify – change only what this channel needs (which methods do you write?).
 */
export class PagerChannel extends AlertChannel {
  constructor(private onCall: string) {
    super(`pager:${onCall}`);
  }

  protected formatAlert(result: CheckResult): string {
    throw new Error("TODO");
  }
}

/**
 * Task 5 – ReleaseGate: the runner
 * run() returns a GateReport:
 *   results  – the result of every check, run against this.api, in order
 *   alerts   – for every channel: alerts[channel.name] = channel.notify(results)   (no channels => {})
 *   summary  – `${passed}/${total} checks passed`
 *   verdict  – "NO-GO" if any result has status "error", or any "blocker" check did not pass;
 *              otherwise "GO"
 *
 * Validation: two channels with the same name would overwrite each other's alerts.
 * In that case run() throws Error(`duplicate channel: ${name}`) – BEFORE sending a single request.
 *
 * The runner knows only ApiCheck and AlertChannel – it must keep working, unchanged,
 * with every kind of check and channel that will ever be written.
 */
export type GateReport = {
  results: CheckResult[];
  alerts: Record<string, string[]>;
  summary: string;
  verdict: "GO" | "NO-GO";
};

export class ReleaseGate {
  constructor(
    private api: FakeApi,
    private checks: ApiCheck[],
    private channels: AlertChannel[],
  ) {}

  run(): GateReport {
    throw new Error("TODO");
  }
}

/**
 * Task 6 (Challenge) – DigestChannel: a new format, without touching the runner
 * Managers don't want one message per failure – they want ONE summary message.
 * DigestChannel(title) – name: `digest:${title}` (already set).
 *   notify(results) returns:
 *     - [] if there is nothing to alert about
 *     - otherwise one message:
 *       `${title}: ${n} of ${total} checks need attention - ${checks joined with ", "}`
 *       e.g. "Nightly: 2 of 5 checks need attention - GET /profile, GET /reports"
 *   It must still respect the shouldAlert hook (a subclass of DigestChannel may override it!).
 *
 * Hint: you may override notify itself – and reuse the base implementation with super.
 */
export class DigestChannel extends AlertChannel {
  constructor(private title: string) {
    super(`digest:${title}`);
  }

  protected formatAlert(result: CheckResult): string {
    throw new Error("TODO");
  }
}

/**
 * Task 7 (Challenge) – ContractCheck + building the real nightly gate
 * a. ContractCheck(path, contract) – GET, expects status 200, and checks the body against a "contract":
 *      contract = { id: "number", name: "string", active: "boolean" }
 *    For every field in the contract, in order:
 *      - missing from the body (undefined):  `missing field "${field}"`
 *      - a different type (hint: typeof):    `"${field}" should be ${expected} but was ${actualType}`
 *
 * b. buildNightlyGate(api) – returns a ReleaseGate on api with these checks, in this order:
 *      GET /health   status 200                                  blocker
 *      GET /users    a list with at least 1 item                 major
 *      POST /users   creates (201 + numeric id)                  blocker
 *      GET /profile  contract { id: number, name: string, active: boolean }   major
 *      GET /reports  a list with at least 1 item                 minor
 *    and these channels: Slack "qa-alerts", Pager "dana", Digest "Nightly".
 */
export type FieldType = "string" | "number" | "boolean";

export class ContractCheck extends ApiCheck {
  readonly method = "GET";

  constructor(
    readonly path: string,
    private contract: Record<string, FieldType>,
    severity: Severity = "major",
  ) {
    super(severity);
  }

  protected evaluate(response: ApiResponse): string[] {
    throw new Error("TODO");
  }
}

export function buildNightlyGate(api: FakeApi): ReleaseGate {
  throw new Error("TODO");
}

// ============================================================
// Self-check – run:  npm run exercise -- 05 hw
// On every line, the value left of "=> expected:" must equal the value on its right.
// (No need to change the code below this line)
// ============================================================

// ---------- Helpers for the self-check (they extend your abstract classes) ----------

/** The "nightly" fake API – a fresh copy every time, with optional route overrides */
function nightlyApi(overrides: Record<string, ApiResponse | Error> = {}): FakeApi {
  return new FakeApi({
    "GET /health": { status: 200, body: { ok: true }, durationMs: 40 },
    "GET /edge": { status: 200, body: {}, durationMs: 1000 },
    "GET /users": { status: 200, body: { items: [{ id: 1 }, { id: 2 }, { id: 3 }] }, durationMs: 120 },
    "GET /orders": { status: 500, body: { error: "db down" }, durationMs: 300 },
    "GET /reports": { status: 200, body: { items: [] }, durationMs: 1800 },
    "GET /profile": { status: 200, body: { id: "42", name: "Dana", active: true }, durationMs: 90 },
    "GET /search": new Error("ECONNRESET"),
    "POST /users": { status: 201, body: { id: 7, name: "Noa" }, durationMs: 2500 },
    "POST /orders": { status: 201, body: { id: "abc" }, durationMs: 100 },
    ...overrides,
  });
}

/** A GET check whose evaluate() returns a fixed list of problems */
class ScriptedCheck extends ApiCheck {
  readonly method = "GET";
  constructor(
    readonly path: string,
    private problems: string[],
    severity: Severity = "major",
  ) {
    super(severity);
  }
  protected evaluate(): string[] {
    return [...this.problems];
  }
}

/** A GET check whose evaluate() throws (e.g. the body could not be parsed) */
class ThrowingCheck extends ApiCheck {
  readonly method = "GET";
  constructor(readonly path: string) {
    super();
  }
  protected evaluate(): string[] {
    throw new Error("bad json");
  }
}

/** A channel that uses the default shouldAlert and only prints the check */
class NamesChannel extends AlertChannel {
  protected formatAlert(result: CheckResult): string {
    return result.check;
  }
}

/** A channel that overrides the shouldAlert hook – alerts on everything */
class EverythingChannel extends NamesChannel {
  protected override shouldAlert(): boolean {
    return true;
  }
}

/** A digest that only cares about blockers – checks that DigestChannel still uses the shouldAlert hook */
class BlockerDigest extends DigestChannel {
  protected override shouldAlert(result: CheckResult): boolean {
    return result.severity === "blocker" && result.status !== "pass";
  }
}

const sampleResults: CheckResult[] = [
  { check: "GET /health", severity: "blocker", status: "pass", problems: [] },
  { check: "GET /orders", severity: "major", status: "fail", problems: ["status 500, expected 200"] },
  {
    check: "GET /reports",
    severity: "minor",
    status: "fail",
    problems: ["expected at least 1 items, got 0", "slow: 1800ms > 1000ms"],
  },
  { check: "GET /search", severity: "major", status: "error", problems: ["ECONNRESET"] },
];

console.log("\n--- Task 1: ApiCheck – the template method run() ---");
try {
  const api = nightlyApi();
  console.log(new ScriptedCheck("/health", []).requestLine(), "=> expected:", "GET /health");
  console.log(new ScriptedCheck("/health", [], "blocker").run(api), "=> expected:", {
    check: "GET /health",
    severity: "blocker",
    status: "pass",
    problems: [],
  });
  console.log(new ScriptedCheck("/health", ["title is wrong"], "minor").run(api), "=> expected:", {
    check: "GET /health",
    severity: "minor",
    status: "fail",
    problems: ["title is wrong"],
  });
  // The shared timing rule lives in the base class – every check gets it for free
  console.log(new ScriptedCheck("/reports", []).run(api).problems, "=> expected:", ["slow: 1800ms > 1000ms"]);
  console.log(new ScriptedCheck("/reports", ["x"]).run(api).problems, "=> expected:", [
    "x",
    "slow: 1800ms > 1000ms",
  ]);
  console.log(new ScriptedCheck("/edge", []).run(api).status, "=> expected:", "pass"); // exactly 1000ms is ok
  // Network error / a crash inside evaluate – run() never throws
  console.log(new ScriptedCheck("/search", []).run(api), "=> expected:", {
    check: "GET /search",
    severity: "major",
    status: "error",
    problems: ["ECONNRESET"],
  });
  console.log(new ThrowingCheck("/health").run(api), "=> expected:", {
    check: "GET /health",
    severity: "major",
    status: "error",
    problems: ["bad json"],
  });
  console.log(api.calls.length, "=> expected:", 7);
  console.log(api.calls[0], "=> expected:", "GET /health");
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Task 2: StatusCheck, ListCheck, PostCreatesCheck ---");
try {
  // A subclass may call evaluate (protected) directly – so we check it without run as well
  class StatusProbe extends StatusCheck {
    evaluateNow(response: ApiResponse): string[] {
      return this.evaluate(response);
    }
  }
  console.log(new StatusProbe("/x", 200).evaluateNow({ status: 200, body: {}, durationMs: 1 }), "=> expected:", []);
  console.log(new StatusProbe("/x", 200).evaluateNow({ status: 500, body: {}, durationMs: 1 }), "=> expected:", [
    "status 500, expected 200",
  ]);

  const api = nightlyApi();
  console.log(new StatusCheck("/orders", 200, "blocker").run(api), "=> expected:", {
    check: "GET /orders",
    severity: "blocker",
    status: "fail",
    problems: ["status 500, expected 200"],
  });
  console.log(new StatusCheck("/nope", 404).run(api).status, "=> expected:", "pass");

  console.log(new ListCheck("/users", 3).run(api).status, "=> expected:", "pass");
  console.log(new ListCheck("/users", 5).run(api).problems, "=> expected:", ["expected at least 5 items, got 3"]);
  console.log(new ListCheck("/health", 1).run(api).problems, "=> expected:", ['"items" is not an array']);
  console.log(new ListCheck("/orders", 1).run(api).problems, "=> expected:", ["status 500, expected 200"]);
  console.log(new ListCheck("/reports", 1, "minor").run(api), "=> expected:", {
    check: "GET /reports",
    severity: "minor",
    status: "fail",
    problems: ["expected at least 1 items, got 0", "slow: 1800ms > 1000ms"],
  });

  // 2500ms is fine for a POST – PostCreatesCheck allows up to 3000ms
  console.log(new PostCreatesCheck("/users").run(api), "=> expected:", {
    check: "POST /users",
    severity: "major",
    status: "pass",
    problems: [],
  });
  console.log(new PostCreatesCheck("/orders").run(api).problems, "=> expected:", ['"id" is not a number']);
  console.log(new PostCreatesCheck("/health").run(api).problems, "=> expected:", ["status 404, expected 201"]);
  const slowPost = nightlyApi({ "POST /users": { status: 201, body: { id: 8 }, durationMs: 3200 } });
  console.log(new PostCreatesCheck("/users").run(slowPost).problems, "=> expected:", ["slow: 3200ms > 3000ms"]);

  const checks: ApiCheck[] = [new StatusCheck("/a", 200), new ListCheck("/b", 1), new PostCreatesCheck("/c")];
  console.log(
    checks.map((c) => c.requestLine()),
    "=> expected:",
    ["GET /a", "GET /b", "POST /c"],
  );
  console.log(
    checks.every((c) => c instanceof ApiCheck),
    "=> expected:",
    true,
  );
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Task 3: AlertChannel.notify, SlackChannel, EmailChannel ---");
try {
  // The hooks: the default shouldAlert (only what did not pass) and an overridden one
  console.log(new NamesChannel("names").notify(sampleResults), "=> expected:", [
    "GET /orders",
    "GET /reports",
    "GET /search",
  ]);
  console.log(new EverythingChannel("all").notify(sampleResults), "=> expected:", [
    "GET /health",
    "GET /orders",
    "GET /reports",
    "GET /search",
  ]);
  console.log(new NamesChannel("names").notify([]), "=> expected:", []);

  const slack = new SlackChannel("qa-alerts");
  console.log(slack.name, "=> expected:", "slack:#qa-alerts");
  console.log(slack.notify(sampleResults), "=> expected:", [
    "[#qa-alerts] FAIL GET /orders - status 500, expected 200",
    "[#qa-alerts] FAIL GET /reports - expected at least 1 items, got 0; slow: 1800ms > 1000ms",
    "[#qa-alerts] ERROR GET /search - ECONNRESET",
  ]);

  const email = new EmailChannel("qa@shop.test");
  console.log(email.name, "=> expected:", "email:qa@shop.test");
  console.log(email.notify(sampleResults), "=> expected:", [
    "To qa@shop.test: [major] GET /orders fail (1 problem(s))",
    "To qa@shop.test: [minor] GET /reports fail (2 problem(s))",
    "To qa@shop.test: [major] GET /search error (1 problem(s))",
  ]);
  console.log(email.notify([sampleResults[0]]), "=> expected:", []);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Task 4: PagerChannel – page only what matters ---");
try {
  const pager = new PagerChannel("dana");
  console.log(pager.name, "=> expected:", "pager:dana");
  console.log(pager.notify(sampleResults), "=> expected:", ["PAGE dana: GET /search is error [major]"]);

  const withBlocker: CheckResult[] = [
    ...sampleResults,
    { check: "POST /checkout", severity: "blocker", status: "fail", problems: ["status 503, expected 201"] },
  ];
  console.log(pager.notify(withBlocker), "=> expected:", [
    "PAGE dana: GET /search is error [major]",
    "PAGE dana: POST /checkout is fail [blocker]",
  ]);
  console.log(pager.notify([sampleResults[0], sampleResults[1]]), "=> expected:", []); // a passing blocker is not paged

  // An array typed as the abstract class – the same call, a different behavior for each channel
  const channels: AlertChannel[] = [new SlackChannel("qa"), new EmailChannel("qa@shop.test"), pager];
  console.log(
    channels.map((c) => c.notify(withBlocker).length),
    "=> expected:",
    [4, 4, 2],
  );
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Task 5: ReleaseGate – the runner ---");
try {
  const api = nightlyApi();
  const gate = new ReleaseGate(
    api,
    [
      new ScriptedCheck("/health", [], "blocker"),
      new ScriptedCheck("/users", ["bad"]),
      new ScriptedCheck("/reports", [], "minor"),
    ],
    [new NamesChannel("names"), new EverythingChannel("all")],
  );
  const report = gate.run();
  console.log(
    report.results.map((r) => r.status),
    "=> expected:",
    ["pass", "fail", "fail"],
  );
  console.log(report.summary, "=> expected:", "1/3 checks passed");
  console.log(report.alerts, "=> expected:", {
    names: ["GET /users", "GET /reports"],
    all: ["GET /health", "GET /users", "GET /reports"],
  });
  console.log(report.verdict, "=> expected:", "GO"); // no blocker failed, nothing errored
  console.log(api.calls, "=> expected:", ["GET /health", "GET /users", "GET /reports"]);

  const blockerDown = new ReleaseGate(nightlyApi(), [new ScriptedCheck("/health", ["down"], "blocker")], []).run();
  console.log(blockerDown.verdict, "=> expected:", "NO-GO");
  console.log(blockerDown.alerts, "=> expected:", {});

  const minorError = new ReleaseGate(nightlyApi(), [new ScriptedCheck("/search", [], "minor")], []).run();
  console.log(minorError.verdict, "=> expected:", "NO-GO"); // an error means the environment can't be trusted

  console.log(new ReleaseGate(nightlyApi(), [], []).run(), "=> expected:", {
    results: [],
    alerts: {},
    summary: "0/0 checks passed",
    verdict: "GO",
  });

  // Two channels with the same name would overwrite each other's alerts – fail before sending any request
  const dupApi = nightlyApi();
  const dupGate = new ReleaseGate(
    dupApi,
    [new ScriptedCheck("/health", [])],
    [new NamesChannel("ops"), new EverythingChannel("ops")],
  );
  try {
    dupGate.run();
    console.log("did not throw", "=> expected:", "threw:", "duplicate channel: ops");
  } catch (err) {
    if ((err as Error).message === "TODO") throw err;
    console.log("threw:", (err as Error).message, "=> expected:", "threw:", "duplicate channel: ops");
  }
  console.log(dupApi.calls, "=> expected:", []);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Task 6 (Challenge): DigestChannel – a new format, the runner is untouched ---");
try {
  const digest = new DigestChannel("Nightly");
  console.log(digest.name, "=> expected:", "digest:Nightly");
  console.log(digest.notify(sampleResults), "=> expected:", [
    "Nightly: 3 of 4 checks need attention - GET /orders, GET /reports, GET /search",
  ]);
  console.log(digest.notify([sampleResults[0]]), "=> expected:", []);
  console.log(digest instanceof AlertChannel, "=> expected:", true);

  // A subclass changes only the hook – the digest must still respect it
  const blockers = new BlockerDigest("Blockers");
  console.log(blockers.notify(sampleResults), "=> expected:", []);
  console.log(
    blockers.notify([
      ...sampleResults,
      { check: "POST /checkout", severity: "blocker", status: "fail", problems: ["timeout"] },
    ]),
    "=> expected:",
    ["Blockers: 1 of 5 checks need attention - POST /checkout"],
  );

  // Plugged into the existing ReleaseGate – no change to the runner
  const report = new ReleaseGate(
    nightlyApi(),
    [new ScriptedCheck("/health", []), new ScriptedCheck("/users", ["empty name"])],
    [digest, new SlackChannel("qa")],
  ).run();
  console.log(report.alerts, "=> expected:", {
    "digest:Nightly": ["Nightly: 1 of 2 checks need attention - GET /users"],
    "slack:#qa": ["[#qa] FAIL GET /users - empty name"],
  });
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Task 7 (Challenge): ContractCheck + buildNightlyGate ---");
try {
  class ContractProbe extends ContractCheck {
    evaluateNow(response: ApiResponse): string[] {
      return this.evaluate(response);
    }
  }
  const probe = new ContractProbe("/profile", { id: "number", name: "string", active: "boolean" });
  console.log(
    probe.evaluateNow({ status: 200, body: { id: 1, name: "Noa", active: false }, durationMs: 1 }),
    "=> expected:",
    [],
  );
  console.log(probe.evaluateNow({ status: 200, body: { id: 1, name: "Noa" }, durationMs: 1 }), "=> expected:", [
    'missing field "active"',
  ]);
  console.log(
    probe.evaluateNow({ status: 200, body: { id: "1", name: "Noa", active: "yes" }, durationMs: 1 }),
    "=> expected:",
    ['"id" should be number but was string', '"active" should be boolean but was string'],
  );
  console.log(probe.evaluateNow({ status: 503, body: {}, durationMs: 1 }), "=> expected:", [
    "status 503, expected 200",
  ]);
  console.log(probe.requestLine(), "=> expected:", "GET /profile");

  // The whole nightly gate, end to end
  const api = nightlyApi();
  const nightly = buildNightlyGate(api).run();
  console.log(
    nightly.results.map((r) => `${r.check} ${r.severity} ${r.status}`),
    "=> expected:",
    [
      "GET /health blocker pass",
      "GET /users major pass",
      "POST /users blocker pass",
      "GET /profile major fail",
      "GET /reports minor fail",
    ],
  );
  console.log(nightly.summary, "=> expected:", "3/5 checks passed");
  console.log(nightly.verdict, "=> expected:", "GO");
  console.log(nightly.alerts, "=> expected:", {
    "slack:#qa-alerts": [
      '[#qa-alerts] FAIL GET /profile - "id" should be number but was string',
      "[#qa-alerts] FAIL GET /reports - expected at least 1 items, got 0; slow: 1800ms > 1000ms",
    ],
    "pager:dana": [],
    "digest:Nightly": ["Nightly: 2 of 5 checks need attention - GET /profile, GET /reports"],
  });
  console.log(api.calls.length, "=> expected:", 5);

  // A bad night: the health endpoint is unreachable
  const badNight = buildNightlyGate(nightlyApi({ "GET /health": new Error("ECONNREFUSED") })).run();
  console.log(badNight.verdict, "=> expected:", "NO-GO");
  console.log(badNight.summary, "=> expected:", "2/5 checks passed");
  console.log(badNight.alerts["pager:dana"], "=> expected:", ["PAGE dana: GET /health is error [blocker]"]);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}
