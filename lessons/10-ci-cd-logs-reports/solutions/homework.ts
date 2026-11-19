// Lesson 10 – Homework: Night-Shift Triage – Solutions
// Check yourself: npm run solution -- 10 hw (self-check at the end of the file)
export type Status = "passed" | "failed" | "skipped";

// ---------------- Sample data: the artifacts of last night's run ----------------

export const RAW_LOG = `> qa-course@1.0.0 test:nightly
> tsx tests/run-nightly.ts

[2026-11-09T02:00:00.000Z] [INFO ] [setup] Seeding staging database {"users":3}
[2026-11-09T02:00:00.500Z] [INFO ] [nightly] Starting nightly regression {"env":"staging","run":3}
[2026-11-09T02:00:00.600Z] [DEBUG] [nightly:auth.login-valid-user] POST /api/login {"status":200}
[2026-11-09T02:00:01.500Z] [INFO ] [nightly:auth.login-locked-user] POST /api/login {"status":200}
[2026-11-09T02:00:01.700Z] [ERROR] [nightly:auth.login-locked-user] expected 423 & "locked", got 200
[2026-11-09T02:00:01.750Z] [INFO ] [nightly:auth.login-locked-user] attachment: evidence/auth.login-locked-user.response.json
[2026-11-09T02:00:02.000Z] [WARN ] [nightly:cart.add-item] Response slower than expected {"durationMs":2900}
[2026-11-09T02:00:02.100Z] [TRACE] [nightly:cart.add-item] polling #cart-badge
[2026-11-09T02:00:05.100Z] [ERROR] [nightly:cart.add-item] Timeout 3000ms exceeded waiting for selector "#cart-badge | .badge"
    at Page.waitForSelector (page.ts:120:11)
    at addItem (cart.spec.ts:18:5)
[2026-11-09T02:00:05.150Z] [INFO ] [nightly:cart.add-item] attachment: evidence/cart.add-item.png
[2026-11-09T02:00:05.160Z] [INFO ] [nightly:cart.add-item] attachment: evidence/cart.add-item.html
[2026-11-09T02:00:05.900Z] [ERROR] [nightly:cart.apply-coupon] TypeError: Cannot read properties of undefined (reading 'discount')
    at applyCoupon (cart.spec.ts:44:19)
[2026-11-09T02:00:06.000Z] [ERROR] [nightly:cart.apply-coupon] test failed after 1 retry
[2026-11-09T02:00:06.050Z] [INFO ] [nightly:cart.apply-coupon] attachment: evidence/cart.apply-coupon.png
[2026-11-09T02:00:06.100Z] [WARN ] [nightly:checkout.pay-with-card] Retrying request (1/2) {"reason":"ECONNREFUSED"}
[2026-11-09T02:00:08.100Z] [WARN ] [nightly:checkout.pay-with-card] Retrying request (2/2) {"reason":"ECONNREFUSED"}
[2026-11-09T02:00:11.100Z] [ERROR] [nightly:checkout.pay-with-card] connect ECONNREFUSED 10.0.0.12:5432
[2026-11-09T02:00:11.150Z] [INFO ] [nightly:checkout.pay-with-card] attachment: evidence/checkout.pay-with-card.log
[2026-11-09T02:00:11.500Z] [INFO ] [nightly:search.search-by-name] GET /api/search?q=dana {"status":200,"count":1}
[2026-11-09T02:00:11.900Z] [INFO ] [nightly] Finished {"passed":2,"failed":4,"skipped":1}
`;

export const JUNIT_XML = `<?xml version="1.0" encoding="UTF-8"?>
<testsuites>
  <testsuite name="Nightly regression" tests="7" failures="4" skipped="1" time="11.95">
    <testcase classname="auth" name="login-valid-user" time="0.9"/>
    <testcase classname="auth" name="login-locked-user" time="1.15">
      <failure message="expected 423 &amp; &quot;locked&quot;, got 200">AssertionError at login.spec.ts:31:7</failure>
    </testcase>
    <testcase classname="cart" name="add-item" time="3.6">
      <failure message="Timeout 3000ms exceeded waiting for selector &quot;#cart-badge | .badge&quot;"/>
    </testcase>
    <testcase classname="cart" name="apply-coupon" time="0.85">
      <failure message="TypeError: Cannot read properties of undefined (reading &apos;discount&apos;)"/>
    </testcase>
    <testcase name="pay-with-card" classname="checkout" time="5.1"><failure type="uncaught"/></testcase>
    <testcase classname="search" name="search-by-name" time="0.4"/>
    <testcase classname="profile" name="upload-avatar" time="0"><skipped message="blocked by BUG-412"/></testcase>
  </testsuite>
</testsuites>
`;

export const PREVIOUS_TAPS: string[] = [
  // Night 1 (two nights ago)
  `TAP version 13
1..7
ok 1 - auth.login-valid-user
ok 2 - auth.login-locked-user
not ok 3 - cart.add-item
  ---
  error: Timeout 3000ms exceeded
  ...
not ok 4 - cart.apply-coupon
ok 5 - checkout.pay-with-card
not ok 6 - search.search-by-name
ok 7 - profile.upload-avatar # SKIP blocked by BUG-412
`,
  // Night 2 (the night before last) – upload-avatar was not in this run at all
  `TAP version 13
1..6
ok 1 - auth.login-valid-user
ok 2 - auth.login-locked-user
ok 3 - cart.add-item
not ok 4 - cart.apply-coupon
ok 5 - checkout.pay-with-card
not ok 6 - search.search-by-name
`,
];

// ---------------- Types ----------------

export interface TestLogInfo {
  warnings: number;
  firstError: string | null;
  attachments: string[];
}

export interface JUnitCase {
  id: string;
  status: Status;
  durationMs: number;
  message?: string;
}

export type Trend = "stable" | "fixed" | "new-failure" | "always-failing" | "flaky" | "not-run";

export type Category = "product-bug" | "test-bug" | "environment" | "flaky";

export interface TriagedFailure {
  id: string;
  category: Category;
  trend: Trend;
  message: string;
  evidence: string[];
}

export interface GateDecision {
  exitCode: 0 | 1 | 2;
  reason: string;
}

export const ENVIRONMENT_SIGNS = ["ECONNREFUSED", "ETIMEDOUT", "ENOTFOUND", "503 Service Unavailable"];
export const TEST_BUG_SIGNS = ["TypeError", "ReferenceError", "is not a function"];

// ---------------- Exercise 1 ----------------

const LOG_LINE_RE = /^\[([^\]]+)\] \[(\w+)\s*\] \[([^\]]*)\] (.*)$/;
const KNOWN_LEVELS = ["DEBUG", "INFO", "WARN", "ERROR"];
const ATTACHMENT_PREFIX = "attachment: ";

export function indexLogByTest(rawLog: string, root: string): Record<string, TestLogInfo> {
  const index: Record<string, TestLogInfo> = {};
  const prefix = `${root}:`;
  for (const line of rawLog.split(/\r?\n/)) {
    const match = LOG_LINE_RE.exec(line);
    if (!match) continue; // stack trace, npm output, empty line
    const [, , level, context, message] = match;
    if (!KNOWN_LEVELS.includes(level)) continue; // e.g. TRACE
    if (!context.startsWith(prefix)) continue; // the root itself, or another root
    const testId = context.slice(prefix.length);

    // create the entry the first time we meet the test
    index[testId] ??= { warnings: 0, firstError: null, attachments: [] };
    const info = index[testId];

    if (level === "WARN") info.warnings++;
    if (level === "ERROR" && info.firstError === null) info.firstError = message;
    if (message.startsWith(ATTACHMENT_PREFIX)) info.attachments.push(message.slice(ATTACHMENT_PREFIX.length).trim());
  }
  return index;
}

// ---------------- Exercise 2 ----------------

const TESTCASE_RE = /<testcase\b([^>]*?)(?:\/>|>([\s\S]*?)<\/testcase>)/g;

function decodeXml(text: string): string {
  return text
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&"); // last – otherwise "&amp;lt;" would become "<"
}

function attr(attributes: string, name: string): string | undefined {
  const match = new RegExp(`\\b${name}="([^"]*)"`).exec(attributes);
  return match ? match[1] : undefined;
}

export function parseJUnitCases(xml: string): JUnitCase[] {
  const cases: JUnitCase[] = [];
  for (const match of xml.matchAll(TESTCASE_RE)) {
    const attributes = match[1];
    const body = match[2] ?? "";
    const id = `${decodeXml(attr(attributes, "classname") ?? "")}.${decodeXml(attr(attributes, "name") ?? "")}`;
    const durationMs = Math.round(Number(attr(attributes, "time") ?? 0) * 1000);

    const failure = /<failure\b([^>]*)/.exec(body);
    if (failure) {
      cases.push({ id, status: "failed", durationMs, message: decodeXml(attr(failure[1], "message") ?? "") });
    } else {
      cases.push({ id, status: /<skipped\b/.test(body) ? "skipped" : "passed", durationMs });
    }
  }
  return cases;
}

// ---------------- Exercise 3 ----------------

const TAP_RESULT_RE = /^(not )?ok \d+ - (.*)$/;

function parseTapStatuses(tap: string): Map<string, Status> {
  const statuses = new Map<string, Status>();
  for (const line of tap.split(/\r?\n/)) {
    const match = TAP_RESULT_RE.exec(line); // indented lines don't match (^ without spaces)
    if (!match) continue;
    const [, notOk, rest] = match;
    const skipAt = rest.indexOf(" # SKIP");
    const id = (skipAt === -1 ? rest : rest.slice(0, skipAt)).trim();
    statuses.set(id, notOk ? "failed" : skipAt === -1 ? "passed" : "skipped");
  }
  return statuses;
}

export function buildHistory(previousTaps: string[], latest: JUnitCase[]): Record<string, Status[]> {
  // every run becomes a Map<id, Status>, oldest first and last night at the end
  const runs = [...previousTaps.map(parseTapStatuses), new Map(latest.map((c) => [c.id, c.status] as const))];

  const allIds = new Set<string>();
  for (const run of runs) for (const id of run.keys()) allIds.add(id);

  const history: Record<string, Status[]> = {};
  for (const id of allIds) {
    history[id] = runs.map((run) => run.get(id) ?? "skipped"); // missing => did not run
  }
  return history;
}

// ---------------- Exercise 4 ----------------

export function trendOf(statuses: Status[]): Trend {
  const executed = statuses.filter((s) => s !== "skipped");
  if (executed.length === 0) return "not-run";

  let flips = 0;
  for (let i = 1; i < executed.length; i++) {
    if (executed[i] !== executed[i - 1]) flips++;
  }

  if (flips >= 2) return "flaky";
  const last = executed[executed.length - 1];
  if (flips === 1) return last === "failed" ? "new-failure" : "fixed";
  return last === "failed" ? "always-failing" : "stable";
}

// ---------------- Exercise 5 ----------------

function categorize(message: string, trend: Trend): Category {
  if (ENVIRONMENT_SIGNS.some((sign) => message.includes(sign))) return "environment";
  if (TEST_BUG_SIGNS.some((sign) => message.includes(sign))) return "test-bug";
  if (trend === "flaky") return "flaky";
  return "product-bug";
}

export function triageFailures(
  cases: JUnitCase[],
  logs: Record<string, TestLogInfo>,
  history: Record<string, Status[]>,
): TriagedFailure[] {
  return cases
    .filter((c) => c.status === "failed")
    .map((c) => {
      const log = logs[c.id];
      const message = c.message || log?.firstError || "(no message)";
      const trend = history[c.id] ? trendOf(history[c.id]) : "new-failure";
      return { id: c.id, category: categorize(message, trend), trend, message, evidence: log?.attachments ?? [] };
    });
}

// ---------------- Exercise 6 ----------------

export function qualityGate(cases: JUnitCase[], failures: TriagedFailure[]): GateDecision {
  if (!cases.some((c) => c.status !== "skipped")) return { exitCode: 1, reason: "No tests were executed" };

  const blocking = failures.filter((f) => f.category === "product-bug" || f.category === "test-bug");
  if (blocking.length > 0) {
    return { exitCode: 1, reason: `${blocking.length} blocking failure(s): ${blocking.map((f) => f.id).join(", ")}` };
  }

  const environment = failures.filter((f) => f.category === "environment");
  if (environment.length > 0) {
    return { exitCode: 2, reason: `${environment.length} environment failure(s) – re-run the pipeline` };
  }

  // what is left can only be flaky failures
  if (failures.length > 0) return { exitCode: 0, reason: `Passed – ${failures.length} flaky failure(s) ignored` };
  return { exitCode: 0, reason: "All executed tests passed" };
}

// ---------------- Exercise 7 (Challenge) ----------------

export interface NightlyInput {
  rawLog: string;
  junitXml: string;
  previousTaps: string[];
  logRoot: string;
}

const TITLE: Record<0 | 1 | 2, string> = { 0: "PASSED", 1: "FAILED", 2: "INFRA ERROR" };
const CATEGORY_ORDER: Category[] = ["product-bug", "test-bug", "environment", "flaky"];

const escapeCell = (text: string) => text.replace(/\|/g, "\\|");

export function triageNightlyRun(input: NightlyInput, generatedAt: Date): { exitCode: 0 | 1 | 2; summary: string } {
  // 1–6: the same pipeline we built step by step
  const cases = parseJUnitCases(input.junitXml);
  const logs = indexLogByTest(input.rawLog, input.logRoot);
  const history = buildHistory(input.previousTaps, cases);
  const failures = triageFailures(cases, logs, history);
  const gate = qualityGate(cases, failures);

  const count = (s: Status) => cases.filter((c) => c.status === s).length;
  const passed = count("passed");
  const failed = count("failed");
  const executed = passed + failed;
  const passRate = executed ? Math.round((passed / executed) * 100) : 0;

  const lines = [
    `## 🌙 Nightly triage: ${TITLE[gate.exitCode]} (exit code ${gate.exitCode})`,
    `Generated: ${generatedAt.toISOString()}`,
    "",
    "| Total | Passed | Failed | Skipped | Pass rate |",
    "|---|---|---|---|---|",
    `| ${cases.length} | ${passed} | ${failed} | ${count("skipped")} | ${passRate}% |`,
    "",
    `**Gate:** ${gate.reason}`,
  ];

  if (failures.length > 0) {
    // sort is stable – inside the same category the JUnit order is kept
    const sorted = [...failures].sort((a, b) => CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category));
    lines.push("", "### Failures", "| Test | Category | Trend | Message | Evidence |", "|---|---|---|---|---|");
    for (const f of sorted) {
      const evidence = f.evidence.length ? f.evidence.join("<br>") : "-";
      lines.push(`| ${f.id} | ${f.category} | ${f.trend} | ${escapeCell(f.message)} | ${evidence} |`);
    }
  }

  return { exitCode: gate.exitCode, summary: lines.join("\n") };
}

// ============================================================
// Self-check – run:  npm run solution -- 10 hw
// On every line, the value left of "=> expected:" must equal the value on its right.
// (No need to change the code below this line)
// Multi-line text (Markdown) is printed as an array of lines – so it's easy to see which line differs.
// ============================================================

const nightlyInput: NightlyInput = { rawLog: RAW_LOG, junitXml: JUNIT_XML, previousTaps: PREVIOUS_TAPS, logRoot: "nightly" };
const morning = new Date("2026-11-09T07:30:00.000Z");
const jc = (id: string, status: Status, message?: string): JUnitCase =>
  message === undefined ? { id, status, durationMs: 0 } : { id, status, durationMs: 0, message };
const tf = (id: string, category: Category): TriagedFailure => ({ id, category, trend: "new-failure", message: "x", evidence: [] });

console.log("\n--- Task 1: indexLogByTest ---");
try {
  console.log(indexLogByTest(RAW_LOG, "nightly"), "=> expected:", {
    "auth.login-valid-user": { warnings: 0, firstError: null, attachments: [] },
    "auth.login-locked-user": {
      warnings: 0,
      firstError: 'expected 423 & "locked", got 200',
      attachments: ["evidence/auth.login-locked-user.response.json"],
    },
    "cart.add-item": {
      warnings: 1,
      firstError: 'Timeout 3000ms exceeded waiting for selector "#cart-badge | .badge"',
      attachments: ["evidence/cart.add-item.png", "evidence/cart.add-item.html"],
    },
    "cart.apply-coupon": {
      warnings: 0,
      firstError: "TypeError: Cannot read properties of undefined (reading 'discount')",
      attachments: ["evidence/cart.apply-coupon.png"],
    },
    "checkout.pay-with-card": {
      warnings: 2,
      firstError: "connect ECONNREFUSED 10.0.0.12:5432",
      attachments: ["evidence/checkout.pay-with-card.log"],
    },
    "search.search-by-name": { warnings: 0, firstError: null, attachments: [] },
  });
  // Only "setup" lines – they belong to another root:
  console.log(Object.keys(indexLogByTest(RAW_LOG, "setup")), "=> expected:", []);
  console.log(indexLogByTest("", "nightly"), "=> expected:", {});
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Task 2: parseJUnitCases ---");
try {
  console.log(parseJUnitCases(JUNIT_XML), "=> expected:", [
    { id: "auth.login-valid-user", status: "passed", durationMs: 900 },
    { id: "auth.login-locked-user", status: "failed", durationMs: 1150, message: 'expected 423 & "locked", got 200' },
    {
      id: "cart.add-item",
      status: "failed",
      durationMs: 3600,
      message: 'Timeout 3000ms exceeded waiting for selector "#cart-badge | .badge"',
    },
    {
      id: "cart.apply-coupon",
      status: "failed",
      durationMs: 850,
      message: "TypeError: Cannot read properties of undefined (reading 'discount')",
    },
    { id: "checkout.pay-with-card", status: "failed", durationMs: 5100, message: "" },
    { id: "search.search-by-name", status: "passed", durationMs: 400 },
    { id: "profile.upload-avatar", status: "skipped", durationMs: 0 },
  ]);
  console.log(
    parseJUnitCases('<testcase classname="x" name="y" time="0.001"><failure message="&amp;lt;b&amp;gt;"/></testcase>'),
    "=> expected:",
    [{ id: "x.y", status: "failed", durationMs: 1, message: "&lt;b&gt;" }],
  );
  console.log(parseJUnitCases("<testsuites></testsuites>"), "=> expected:", []);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Task 3: buildHistory ---");
try {
  console.log(buildHistory(PREVIOUS_TAPS, parseJUnitCases(JUNIT_XML)), "=> expected:", {
    "auth.login-valid-user": ["passed", "passed", "passed"],
    "auth.login-locked-user": ["passed", "passed", "failed"],
    "cart.add-item": ["failed", "passed", "failed"],
    "cart.apply-coupon": ["failed", "failed", "failed"],
    "checkout.pay-with-card": ["passed", "passed", "failed"],
    "search.search-by-name": ["failed", "failed", "passed"],
    "profile.upload-avatar": ["skipped", "skipped", "skipped"],
  });
  // A test that existed before and was removed last night:
  console.log(
    buildHistory(["ok 1 - old.test\nok 2 - a.b"], [jc("a.b", "failed", "")]),
    "=> expected:",
    { "old.test": ["passed", "skipped"], "a.b": ["passed", "failed"] },
  );
  console.log(buildHistory([], [jc("a.b", "passed")]), "=> expected:", { "a.b": ["passed"] });
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Task 4: trendOf ---");
try {
  console.log(trendOf(["passed", "passed", "passed"]), "=> expected:", "stable");
  console.log(trendOf(["passed", "passed", "failed"]), "=> expected:", "new-failure");
  console.log(trendOf(["failed", "failed", "passed"]), "=> expected:", "fixed");
  console.log(trendOf(["failed", "passed", "failed"]), "=> expected:", "flaky");
  console.log(trendOf(["failed", "skipped", "failed"]), "=> expected:", "always-failing");
  console.log(trendOf(["passed", "skipped", "failed", "skipped"]), "=> expected:", "new-failure");
  console.log(trendOf(["skipped", "skipped"]), "=> expected:", "not-run");
  console.log(trendOf([]), "=> expected:", "not-run");
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Task 5: triageFailures ---");
try {
  const cases = parseJUnitCases(JUNIT_XML);
  const triaged = triageFailures(cases, indexLogByTest(RAW_LOG, "nightly"), buildHistory(PREVIOUS_TAPS, cases));
  console.log(triaged, "=> expected:", [
    {
      id: "auth.login-locked-user",
      category: "product-bug",
      trend: "new-failure",
      message: 'expected 423 & "locked", got 200',
      evidence: ["evidence/auth.login-locked-user.response.json"],
    },
    {
      id: "cart.add-item",
      category: "flaky",
      trend: "flaky",
      message: 'Timeout 3000ms exceeded waiting for selector "#cart-badge | .badge"',
      evidence: ["evidence/cart.add-item.png", "evidence/cart.add-item.html"],
    },
    {
      id: "cart.apply-coupon",
      category: "test-bug",
      trend: "always-failing",
      message: "TypeError: Cannot read properties of undefined (reading 'discount')",
      evidence: ["evidence/cart.apply-coupon.png"],
    },
    {
      id: "checkout.pay-with-card",
      category: "environment",
      trend: "new-failure",
      message: "connect ECONNREFUSED 10.0.0.12:5432",
      evidence: ["evidence/checkout.pay-with-card.log"],
    },
  ]);
  // No message anywhere, no log, no history:
  console.log(triageFailures([jc("x.ghost", "failed", "")], {}, {}), "=> expected:", [
    { id: "x.ghost", category: "product-bug", trend: "new-failure", message: "(no message)", evidence: [] },
  ]);
  // The environment rule wins over the test-bug rule, and over a flaky trend:
  console.log(
    triageFailures([jc("x.net", "failed", "TypeError: fetch failed (ETIMEDOUT)")], {}, { "x.net": ["failed", "passed", "failed"] })[0]
      .category,
    "=> expected:",
    "environment",
  );
  // Passed and skipped cases are not failures:
  console.log(triageFailures([jc("a.b", "passed"), jc("c.d", "skipped")], {}, {}), "=> expected:", []);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Task 6: qualityGate ---");
try {
  const passed = jc("a.ok", "passed");
  console.log(
    qualityGate([passed], [tf("auth.login-locked-user", "product-bug"), tf("cart.add-item", "flaky"), tf("cart.apply-coupon", "test-bug")]),
    "=> expected:",
    { exitCode: 1, reason: "2 blocking failure(s): auth.login-locked-user, cart.apply-coupon" },
  );
  console.log(qualityGate([passed], [tf("x.flaky", "flaky"), tf("x.db", "environment")]), "=> expected:", {
    exitCode: 2,
    reason: "1 environment failure(s) – re-run the pipeline",
  });
  console.log(qualityGate([passed], [tf("x.flaky", "flaky")]), "=> expected:", {
    exitCode: 0,
    reason: "Passed – 1 flaky failure(s) ignored",
  });
  console.log(qualityGate([passed, jc("a.skip", "skipped")], []), "=> expected:", {
    exitCode: 0,
    reason: "All executed tests passed",
  });
  // A "green" run where nothing ran is a lie:
  console.log(qualityGate([jc("a.skip", "skipped")], []), "=> expected:", { exitCode: 1, reason: "No tests were executed" });
  console.log(qualityGate([], []), "=> expected:", { exitCode: 1, reason: "No tests were executed" });
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Task 7 (Challenge): triageNightlyRun ---");
try {
  const result = triageNightlyRun(nightlyInput, morning);
  console.log(result.exitCode, "=> expected:", 1);
  console.log(result.summary.split("\n"), "=> expected:", [
    "## 🌙 Nightly triage: FAILED (exit code 1)",
    "Generated: 2026-11-09T07:30:00.000Z",
    "",
    "| Total | Passed | Failed | Skipped | Pass rate |",
    "|---|---|---|---|---|",
    "| 7 | 2 | 4 | 1 | 33% |",
    "",
    "**Gate:** 2 blocking failure(s): auth.login-locked-user, cart.apply-coupon",
    "",
    "### Failures",
    "| Test | Category | Trend | Message | Evidence |",
    "|---|---|---|---|---|",
    '| auth.login-locked-user | product-bug | new-failure | expected 423 & "locked", got 200 | evidence/auth.login-locked-user.response.json |',
    "| cart.apply-coupon | test-bug | always-failing | TypeError: Cannot read properties of undefined (reading 'discount') | evidence/cart.apply-coupon.png |",
    "| checkout.pay-with-card | environment | new-failure | connect ECONNREFUSED 10.0.0.12:5432 | evidence/checkout.pay-with-card.log |",
    '| cart.add-item | flaky | flaky | Timeout 3000ms exceeded waiting for selector "#cart-badge \\| .badge" | evidence/cart.add-item.png<br>evidence/cart.add-item.html |',
  ]);

  // A green night: no log, no history
  const green = triageNightlyRun(
    {
      rawLog: "",
      junitXml: '<testcase classname="a" name="one" time="0.1"/><testcase classname="a" name="two" time="0.2"/>',
      previousTaps: [],
      logRoot: "nightly",
    },
    morning,
  );
  console.log(green.exitCode, "=> expected:", 0);
  console.log(green.summary.split("\n"), "=> expected:", [
    "## 🌙 Nightly triage: PASSED (exit code 0)",
    "Generated: 2026-11-09T07:30:00.000Z",
    "",
    "| Total | Passed | Failed | Skipped | Pass rate |",
    "|---|---|---|---|---|",
    "| 2 | 2 | 0 | 0 | 100% |",
    "",
    "**Gate:** All executed tests passed",
  ]);

  // The database was down – only an environment failure:
  const infra = triageNightlyRun(
    {
      rawLog: "[2026-11-09T02:00:01.000Z] [INFO ] [nightly:db.read] attachment: evidence/db.read.log",
      junitXml: '<testcase classname="db" name="read" time="2"><failure message="getaddrinfo ENOTFOUND db.staging"/></testcase>',
      previousTaps: ["ok 1 - db.read"],
      logRoot: "nightly",
    },
    morning,
  );
  console.log(infra.exitCode, "=> expected:", 2);
  console.log(infra.summary.split("\n")[0], "=> expected:", "## 🌙 Nightly triage: INFRA ERROR (exit code 2)");
  console.log(
    infra.summary.split("\n").at(-1),
    "=> expected:",
    "| db.read | environment | new-failure | getaddrinfo ENOTFOUND db.staging | evidence/db.read.log |",
  );
} catch (e) {
  console.log("  ✋", (e as Error).message);
}
