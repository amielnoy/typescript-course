// Lesson 10 – Homework: Night-Shift Triage – what broke in last night's CI run?
// Check yourself: npm run exercise -- 10 hw (self-check at the end of the file)
// ------------------------------------------------------------
// Scenario:
//   You are the QA on duty. The nightly regression pipeline ran at 02:00 and turned red.
//   Before the 09:30 stand-up you must answer four questions:
//     1. Which tests failed, and what evidence (screenshots, HTML, responses, logs) did they leave behind?
//     2. Is each failure a product bug, a test bug, an environment problem, or just a flaky test?
//     3. Should the pipeline really be red? (the quality gate decides the exit code)
//     4. What do we write in the run summary page ($GITHUB_STEP_SUMMARY) so the team sees it at a glance?
//
//   You have three artifacts from the CI run (sample data below):
//     - RAW_LOG          – the runner's console log (the logger format from example 01, plus some noise)
//     - JUNIT_XML        – last night's JUnit report (like node --test-reporter=junit)
//     - PREVIOUS_TAPS    – the TAP output of the two nights before (oldest first)
//
//   Each task builds on the previous ones; Task 7 puts everything together.
//
// Instructions:
//   1. Fill in the body of each function in place of the line  throw new Error("TODO")
//   2. You may add helper functions of your own (e.g. for escaping/decoding)
//   3. Everything here is pure: no console, no files, no new Date() – the time is passed in as a parameter
//   4. A test is identified everywhere by its id: "<classname>.<name>", e.g. "cart.add-item"
// ------------------------------------------------------------

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

/** What the log tells us about one test */
export interface TestLogInfo {
  /** How many WARN lines the test wrote */
  warnings: number;
  /** The message of the FIRST ERROR line of the test, or null if there was none */
  firstError: string | null;
  /** Evidence paths, in the order they appear in the log */
  attachments: string[];
}

/** One <testcase> from the JUnit report */
export interface JUnitCase {
  /** "<classname>.<name>" */
  id: string;
  status: Status;
  durationMs: number;
  /** Only for failed tests (decoded). A failed test whose <failure> has no message => "" */
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
  /** 0 = green, 1 = red (real failures), 2 = infrastructure problem (re-run) */
  exitCode: 0 | 1 | 2;
  reason: string;
}

/** If an error message contains one of these – the environment is to blame */
export const ENVIRONMENT_SIGNS = ["ECONNREFUSED", "ETIMEDOUT", "ENOTFOUND", "503 Service Unavailable"];
/** If an error message contains one of these – the test code itself crashed */
export const TEST_BUG_SIGNS = ["TypeError", "ReferenceError", "is not a function"];

/**
 * Exercise 1 – Index the raw log by test
 * The log lines have the format of the logger from example 01 (the level is padded to 5 characters):
 *   [<timestamp>] [<LEVEL>] [<context>] <message>
 * A line belongs to a test when its context is "<root>:<testId>" – e.g. with root "nightly":
 *   "[...] [WARN ] [nightly:cart.add-item] Response slower ..."  => test "cart.add-item"
 * Rules:
 * - lines that are not in the format are ignored (stack traces, npm output, empty lines)
 * - lines with an unknown level (not DEBUG/INFO/WARN/ERROR, e.g. TRACE) are ignored
 * - lines whose context is exactly the root, or belongs to another root (e.g. "setup"), are ignored
 * - every test that has at least one (valid) line gets an entry – even if it is only a DEBUG line
 * - WARN => warnings + 1;  ERROR => firstError (only the first one counts)
 * - a message that starts with "attachment: " => the rest of the message is an evidence path
 *   indexLogByTest(RAW_LOG, "nightly")["cart.add-item"]
 *     => { warnings: 1, firstError: 'Timeout 3000ms exceeded waiting for selector "#cart-badge | .badge"',
 *          attachments: ["evidence/cart.add-item.png", "evidence/cart.add-item.html"] }
 */
export function indexLogByTest(rawLog: string, root: string): Record<string, TestLogInfo> {
  throw new Error("TODO");
}

/**
 * Exercise 2 – Read every test case from the JUnit report
 * Return one JUnitCase per <testcase>, in the order of the file.
 * - id = "<classname>.<name>"  (the attributes may appear in any order!)
 * - durationMs = Math.round(time * 1000)
 * - status: contains <failure => "failed";  contains <skipped => "skipped";  otherwise "passed"
 * - message: only on failed cases – the decoded message attribute of <failure>, or "" if it has none.
 *   Passed/skipped cases must NOT have a message key at all.
 * - decode the entities &lt; &gt; &quot; &apos; and &amp; (decode &amp; last!)
 * Hint: /<testcase\b([^>]*?)(?:\/>|>([\s\S]*?)<\/testcase>)/g  captures the attributes and the body,
 *       and /\bname="([^"]*)"/ finds an attribute (\b makes sure "classname" does not match "name")
 */
export function parseJUnitCases(xml: string): JUnitCase[] {
  throw new Error("TODO");
}

/**
 * Exercise 3 – Build the history of each test across the nights
 * The result: for every test id – its statuses from the oldest night to last night
 * (previousTaps in order, and then `latest`). Every array has the length previousTaps.length + 1.
 * - TAP result lines: "ok N - <id>", "not ok N - <id>", "ok N - <id> # SKIP <reason>" (=> skipped)
 * - every other TAP line is ignored (header, plan, indented diagnostic blocks)
 * - a test that did not appear in some run => "skipped" in that position (it did not run)
 * - a test that appears in any of the runs must be in the result
 *   buildHistory(PREVIOUS_TAPS, parseJUnitCases(JUNIT_XML))["search.search-by-name"]
 *     => ["failed", "failed", "passed"]
 */
export function buildHistory(previousTaps: string[], latest: JUnitCase[]): Record<string, Status[]> {
  throw new Error("TODO");
}

/**
 * Exercise 4 – The trend of a test
 * Look only at the runs where the test actually ran (ignore "skipped").
 * A "flip" is a change between two consecutive executed runs (passed -> failed or failed -> passed).
 * - no executed run              => "not-run"
 * - 2 flips or more              => "flaky"
 * - 0 flips: all passed          => "stable";  all failed => "always-failing"
 * - exactly 1 flip: last failed  => "new-failure";  last passed => "fixed"
 *   trendOf(["passed", "passed", "failed"])  => "new-failure"
 *   trendOf(["failed", "passed", "failed"])  => "flaky"
 *   trendOf(["failed", "skipped", "failed"]) => "always-failing"
 */
export function trendOf(statuses: Status[]): Trend {
  throw new Error("TODO");
}

/**
 * Exercise 5 – Triage every failure
 * For each FAILED case (in JUnit order) return a TriagedFailure:
 * - message:  the JUnit message; if it is empty – the firstError from the log; if there is none either – "(no message)"
 * - evidence: the attachments from the log ([] if the test has no log entry)
 * - trend:    trendOf(history[id]);  a test with no history entry => "new-failure"
 * - category: the FIRST rule that matches:
 *     1. the message contains one of ENVIRONMENT_SIGNS => "environment"
 *     2. the message contains one of TEST_BUG_SIGNS    => "test-bug"
 *     3. the trend is "flaky"                          => "flaky"
 *     4. otherwise                                     => "product-bug"   (an assertion that really failed)
 */
export function triageFailures(
  cases: JUnitCase[],
  logs: Record<string, TestLogInfo>,
  history: Record<string, Status[]>,
): TriagedFailure[] {
  throw new Error("TODO");
}

/**
 * Exercise 6 – The quality gate: should the pipeline be red?
 * The first rule that matches decides:
 * 1. no test was executed (no cases, or all skipped)
 *      => { exitCode: 1, reason: "No tests were executed" }
 * 2. there are "product-bug" or "test-bug" failures (blocking)
 *      => { exitCode: 1, reason: "2 blocking failure(s): auth.login-locked-user, cart.apply-coupon" }
 *         (the ids in the order of `failures`)
 * 3. there are "environment" failures
 *      => { exitCode: 2, reason: "1 environment failure(s) – re-run the pipeline" }
 * 4. there are only "flaky" failures
 *      => { exitCode: 0, reason: "Passed – 1 flaky failure(s) ignored" }
 * 5. otherwise
 *      => { exitCode: 0, reason: "All executed tests passed" }
 */
export function qualityGate(cases: JUnitCase[], failures: TriagedFailure[]): GateDecision {
  throw new Error("TODO");
}

export interface NightlyInput {
  rawLog: string;
  junitXml: string;
  previousTaps: string[];
  /** The root context of the log, e.g. "nightly" */
  logRoot: string;
}

/**
 * Exercise 7 (Challenge) – The full triage: exit code + a Markdown page for $GITHUB_STEP_SUMMARY
 * Use Exercises 1–6 to triage the run, and return { exitCode, summary }.
 * The summary – lines joined with "\n" (no "\n" at the end):
 *
 *   ## 🌙 Nightly triage: FAILED (exit code 1)
 *   Generated: 2026-11-09T07:30:00.000Z
 *
 *   | Total | Passed | Failed | Skipped | Pass rate |
 *   |---|---|---|---|---|
 *   | 7 | 2 | 4 | 1 | 33% |
 *
 *   **Gate:** 2 blocking failure(s): auth.login-locked-user, cart.apply-coupon
 *
 *   ### Failures
 *   | Test | Category | Trend | Message | Evidence |
 *   |---|---|---|---|---|
 *   | auth.login-locked-user | product-bug | new-failure | expected 423 & "locked", got 200 | evidence/auth.login-locked-user.response.json |
 *   ...
 *
 * - the title word: exit code 0 => "PASSED", 1 => "FAILED", 2 => "INFRA ERROR"
 * - Generated: generatedAt.toISOString()
 * - Pass rate = passed / (passed + failed), rounded; 0 if nothing ran
 * - failure rows sorted by category: product-bug, test-bug, environment, flaky
 *   (inside the same category – keep the JUnit order)
 * - a "|" inside a message breaks a Markdown table – write it as "\|"
 * - evidence: the paths joined with "<br>", or "-" if there is none
 * - no failures => the summary ends after the Gate line (no empty line, no "### Failures")
 */
export function triageNightlyRun(input: NightlyInput, generatedAt: Date): { exitCode: 0 | 1 | 2; summary: string } {
  throw new Error("TODO");
}

// ============================================================
// Self-check – run:  npm run exercise -- 10 hw
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
