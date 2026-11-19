// Lesson 5 – Homework: Release Gate – pluggable API checks and alert channels – Solution
// Check yourself: npm run solution -- 05 hw (self-check at the end of the file)

export type HttpMethod = "GET" | "POST" | "DELETE";
export type Severity = "blocker" | "major" | "minor";

export type ApiResponse = { status: number; body: Record<string, unknown>; durationMs: number };

export type CheckResult = {
  check: string;
  severity: Severity;
  status: "pass" | "fail" | "error";
  problems: string[];
};

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

// ---------- Task 1 ----------
export abstract class ApiCheck {
  abstract readonly method: HttpMethod;
  abstract readonly path: string;
  protected readonly maxDurationMs: number = 1000;

  constructor(public readonly severity: Severity = "major") {}

  protected abstract evaluate(response: ApiResponse): string[];

  requestLine(): string {
    return `${this.method} ${this.path}`;
  }

  // Template Method: the flow is fixed here, only evaluate() changes between subclasses
  run(api: FakeApi): CheckResult {
    const check = this.requestLine();
    try {
      const response = api.request(this.method, this.path);
      const problems = [...this.evaluate(response)];
      if (response.durationMs > this.maxDurationMs) {
        problems.push(`slow: ${response.durationMs}ms > ${this.maxDurationMs}ms`);
      }
      return { check, severity: this.severity, status: problems.length === 0 ? "pass" : "fail", problems };
    } catch (err) {
      return { check, severity: this.severity, status: "error", problems: [(err as Error).message] };
    }
  }
}

// ---------- Task 2 ----------
function statusProblem(response: ApiResponse, expected: number): string[] {
  return response.status === expected ? [] : [`status ${response.status}, expected ${expected}`];
}

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
    return statusProblem(response, this.expectedStatus);
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
    const statusProblems = statusProblem(response, 200);
    if (statusProblems.length > 0) return statusProblems;

    const items = response.body.items;
    if (!Array.isArray(items)) return ['"items" is not an array'];
    if (items.length < this.minItems) return [`expected at least ${this.minItems} items, got ${items.length}`];
    return [];
  }
}

export class PostCreatesCheck extends ApiCheck {
  readonly method = "POST";
  // Writes are allowed to be slower – overriding a regular (non-abstract) member needs override
  protected override readonly maxDurationMs = 3000;

  constructor(
    readonly path: string,
    severity: Severity = "major",
  ) {
    super(severity);
  }

  protected evaluate(response: ApiResponse): string[] {
    const statusProblems = statusProblem(response, 201);
    if (statusProblems.length > 0) return statusProblems;
    return typeof response.body.id === "number" ? [] : ['"id" is not a number'];
  }
}

// ---------- Task 3 ----------
export abstract class AlertChannel {
  constructor(public readonly name: string) {}

  protected abstract formatAlert(result: CheckResult): string;

  protected shouldAlert(result: CheckResult): boolean {
    return result.status !== "pass";
  }

  notify(results: CheckResult[]): string[] {
    return results.filter((r) => this.shouldAlert(r)).map((r) => this.formatAlert(r));
  }
}

export class SlackChannel extends AlertChannel {
  constructor(private channel: string) {
    super(`slack:#${channel}`);
  }

  protected formatAlert(result: CheckResult): string {
    return `[#${this.channel}] ${result.status.toUpperCase()} ${result.check} - ${result.problems.join("; ")}`;
  }
}

export class EmailChannel extends AlertChannel {
  constructor(private to: string) {
    super(`email:${to}`);
  }

  protected formatAlert(result: CheckResult): string {
    return `To ${this.to}: [${result.severity}] ${result.check} ${result.status} (${result.problems.length} problem(s))`;
  }
}

// ---------- Task 4 ----------
export class PagerChannel extends AlertChannel {
  constructor(private onCall: string) {
    super(`pager:${onCall}`);
  }

  protected override shouldAlert(result: CheckResult): boolean {
    if (result.status === "error") return true;
    return result.severity === "blocker" && result.status !== "pass";
  }

  protected formatAlert(result: CheckResult): string {
    return `PAGE ${this.onCall}: ${result.check} is ${result.status} [${result.severity}]`;
  }
}

// ---------- Task 5 ----------
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
    // Validate before sending a single request
    const names: string[] = [];
    for (const channel of this.channels) {
      if (names.includes(channel.name)) throw new Error(`duplicate channel: ${channel.name}`);
      names.push(channel.name);
    }

    const results = this.checks.map((c) => c.run(this.api));

    const alerts: Record<string, string[]> = {};
    for (const channel of this.channels) {
      alerts[channel.name] = channel.notify(results);
    }

    const passed = results.filter((r) => r.status === "pass").length;
    const blocked = results.some(
      (r) => r.status === "error" || (r.severity === "blocker" && r.status !== "pass"),
    );

    return {
      results,
      alerts,
      summary: `${passed}/${results.length} checks passed`,
      verdict: blocked ? "NO-GO" : "GO",
    };
  }
}

// ---------- Task 6 (Challenge) ----------
export class DigestChannel extends AlertChannel {
  constructor(private title: string) {
    super(`digest:${title}`);
  }

  protected formatAlert(result: CheckResult): string {
    return result.check;
  }

  // Overrides the template method itself – but reuses it through super (so the shouldAlert hook still works)
  override notify(results: CheckResult[]): string[] {
    const lines = super.notify(results);
    if (lines.length === 0) return [];
    return [`${this.title}: ${lines.length} of ${results.length} checks need attention - ${lines.join(", ")}`];
  }
}

// ---------- Task 7 (Challenge) ----------
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
    const statusProblems = statusProblem(response, 200);
    if (statusProblems.length > 0) return statusProblems;

    const problems: string[] = [];
    for (const field of Object.keys(this.contract)) {
      const expected = this.contract[field];
      const value = response.body[field];
      if (value === undefined) {
        problems.push(`missing field "${field}"`);
      } else if (typeof value !== expected) {
        problems.push(`"${field}" should be ${expected} but was ${typeof value}`);
      }
    }
    return problems;
  }
}

export function buildNightlyGate(api: FakeApi): ReleaseGate {
  const checks: ApiCheck[] = [
    new StatusCheck("/health", 200, "blocker"),
    new ListCheck("/users", 1),
    new PostCreatesCheck("/users", "blocker"),
    new ContractCheck("/profile", { id: "number", name: "string", active: "boolean" }),
    new ListCheck("/reports", 1, "minor"),
  ];
  const channels: AlertChannel[] = [new SlackChannel("qa-alerts"), new PagerChannel("dana"), new DigestChannel("Nightly")];
  return new ReleaseGate(api, checks, channels);
}

// ============================================================
// Self-check – run:  npm run solution -- 05 hw
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
