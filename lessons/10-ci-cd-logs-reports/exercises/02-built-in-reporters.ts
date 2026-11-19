// Lesson 10 – Topic 02: Reporters – spec, TAP and JUnit – Exercises
// ------------------------------------------------------------
// Instructions:
//   1. Fill in the body of each function in place of the line  throw new Error("TODO")
//   2. It is recommended to first run the example  examples/02-built-in-reporters.ts
//      and see what the real spec and junit outputs look like.
//   3. Check yourself: npm run exercise -- 10 02 (self-check at the end of the file)
// ------------------------------------------------------------

export type Status = "passed" | "failed" | "skipped";

export interface TestResult {
  name: string;
  status: Status;
  durationMs: number;
  error?: string;
}

/**
 * Exercise 1 – A single TAP line
 * TAP (Test Anything Protocol) is a simple text format: one line per test.
 *   tapLine(1, "GET /health", "passed")  => "ok 1 - GET /health"
 *   tapLine(2, "GET /users", "failed")   => "not ok 2 - GET /users"
 *   tapLine(3, "DELETE /users", "skipped") => "ok 3 - DELETE /users # SKIP"
 * (a skipped test counts as "ok" – it didn't fail – but it is marked with # SKIP)
 */
export function tapLine(index: number, name: string, status: Status): string {
  throw new Error("TODO");
}

/**
 * Exercise 2 – A line in the style of the spec reporter
 * This is how node --test shows a test in the terminal (spec reporter):
 *   { name: "login", status: "passed", durationMs: 12.4 }   => "✔ login (12ms)"
 *   { name: "search", status: "failed", durationMs: 250 }   => "✖ search (250ms)"
 *   { name: "pay", status: "skipped", durationMs: 0 }       => "﹣ pay (0ms) # SKIP"
 * - the time is rounded to a whole number (Math.round)
 * - the symbols: ✔  ✖  ﹣  (copy them from here)
 */
export function specLine(result: TestResult): string {
  throw new Error("TODO");
}

export interface ReporterConfig {
  /** The reporter name: "spec" | "tap" | "junit" | "dot" ... */
  name: string;
  /** Where to write: "stdout" or a file path. Default: "stdout" */
  destination?: string;
}

/**
 * Exercise 3 – Building the arguments for node --test
 * In example 02 we enabled two reporters at once. Write a function that builds the arguments from a config:
 *   reporterArgs([{ name: "spec" }, { name: "junit", destination: "reports/junit.xml" }])
 *     => [
 *          "--test-reporter=spec",
 *          "--test-reporter-destination=stdout",
 *          "--test-reporter=junit",
 *          "--test-reporter-destination=reports/junit.xml",
 *        ]
 *   reporterArgs([]) => []
 * Hint: flatMap
 */
export function reporterArgs(reporters: ReporterConfig[]): string[] {
  throw new Error("TODO");
}

/**
 * Exercise 4 – A full TAP document
 * Structure (lines separated by \n, no \n at the end):
 *   TAP version 13
 *   1..3                       (the "plan" – how many tests there are)
 *   ok 1 - a
 *   not ok 2 - b
 *     ---                      (only for a failed test that has an error – a diagnostic block indented by two spaces)
 *     error: boom
 *     ...
 *   ok 3 - c # SKIP
 *
 * An empty run => "TAP version 13\n1..0"
 * Hint: use tapLine from Exercise 1. Numbering starts at 1.
 */
export function toTap(results: TestResult[]): string {
  throw new Error("TODO");
}

export interface TapSummary {
  /** The number from the plan ("1..N"), or null if there is no plan line */
  planned: number | null;
  passed: number;
  failed: number;
  skipped: number;
  /** The names of the failed tests, in order */
  failedNames: string[];
}

/**
 * Exercise 5 – Parsing TAP output
 * You get TAP text (e.g. from the previous exercise, or from node --test --test-reporter=tap) and summarize it.
 * Rules:
 * - plan line: "1..N"  => planned = N
 * - "ok N - name"       => passed   (unless it contains "# SKIP" – then skipped. Case-insensitive)
 * - "not ok N - name"   => failed, and the name (without the "# ..." if present) goes into failedNames
 * - lines that start with a space/tab (diagnostic blocks, subtests) and "#" lines – ignore them
 * - lines may be separated by \n or by \r\n (Windows)
 *   parseTap("TAP version 13\n1..2\nok 1 - a\nnot ok 2 - b")
 *     => { planned: 2, passed: 1, failed: 1, skipped: 0, failedNames: ["b"] }
 * Hint: text.split(/\r?\n/) and a regular expression like /^(not )?ok \d+ - (.*)$/
 */
export function parseTap(text: string): TapSummary {
  throw new Error("TODO");
}

export interface JUnitFailure {
  name: string;
  message: string;
}

/**
 * Exercise 6 (Bonus) – Extracting failures from a JUnit XML file
 * This is what (in short) the file that node --test-reporter=junit produces looks like:
 *
 *   <testsuite name="Users API" tests="2" failures="1">
 *     <testcase name="GET /health returns ok" time="0.01" classname="test"/>
 *     <testcase name="GET /users/999 returns 404" time="0.02" classname="test">
 *       <failure type="testCodeFailure" message="Expected 404 &amp; got 200">
 *         ...stack...
 *       </failure>
 *     </testcase>
 *   </testsuite>
 *
 * Return an array of { name, message } for every testcase that contains a <failure>, in order.
 * - a testcase with <skipped/> or with no content – is not a failure
 * - if the failure has no message – return ""
 * - you must decode (unescape) the entities: &lt; &gt; &quot; &apos; &amp;
 *   and also numeric entities such as &#10; (=> "\n")  – hint: String.fromCharCode
 *   Note: &amp; is decoded last! (Why? Try "&amp;lt;")
 * Hint: a regular expression that captures a whole testcase:
 *   /<testcase\b([^>]*?)(?:\/>|>([\s\S]*?)<\/testcase>)/g   and then extract name and <failure ... message="..."> from it
 */
export function parseJUnitFailures(xml: string): JUnitFailure[] {
  throw new Error("TODO");
}

// ============================================================
// Self-check – run:  npm run exercise -- 10 02
// On every line, the value left of "=> expected:" must equal the value on its right.
// (No need to change the code below this line)
// Multi-line text (TAP) is printed as an array of lines – so it's easy to see which line differs.
// ============================================================

const sampleResults: TestResult[] = [
  { name: "a", status: "passed", durationMs: 100 },
  { name: "b", status: "failed", durationMs: 250, error: "boom" },
  { name: "c", status: "skipped", durationMs: 0 },
];

const junitSample = `<?xml version="1.0" encoding="utf-8"?>
<testsuites>
\t<testsuite name="Users API" time="0.05" disabled="0" errors="0" tests="5" failures="2" skipped="1" hostname="runner">
\t\t<testcase name="GET /health returns ok" time="0.01" classname="test"/>
\t\t<testcase name="GET /users/999 returns 404" time="0.02" classname="test">
\t\t\t<failure type="testCodeFailure" message="Expected values to be strictly equal:&#10;&#10;200 !== 404&#10;">
[Error [ERR_ASSERTION]: Expected values to be strictly equal:
    at TestContext.&lt;anonymous&gt; (users-api.test.ts:31:12)]
\t\t\t</failure>
\t\t</testcase>
\t\t<testcase name="POST &quot;No Email&quot; &amp; &lt;b&gt;" time="0.01" classname="test">
\t\t\t<failure type="testCodeFailure" message="got &apos;200&apos; &amp;amp; more">stack</failure>
\t\t</testcase>
\t\t<testcase name="DELETE /users/1 as non-admin" time="0" classname="test">
\t\t\t<skipped type="skipped" message="not implemented yet"/>
\t\t</testcase>
\t\t<testcase name="crash without message" time="0" classname="test"><failure type="uncaught"/></testcase>
\t</testsuite>
</testsuites>`;

console.log("\n--- Exercise 1: tapLine ---");
try {
  console.log(tapLine(1, "GET /health", "passed"), "=> expected:", "ok 1 - GET /health");
  console.log(tapLine(2, "GET /users", "failed"), "=> expected:", "not ok 2 - GET /users");
  console.log(tapLine(3, "DELETE /users", "skipped"), "=> expected:", "ok 3 - DELETE /users # SKIP");
  console.log(tapLine(10, "x", "passed"), "=> expected:", "ok 10 - x");
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 2: specLine ---");
try {
  console.log(specLine({ name: "login", status: "passed", durationMs: 12.4 }), "=> expected:", "✔ login (12ms)");
  console.log(specLine({ name: "search", status: "failed", durationMs: 250, error: "x" }), "=> expected:", "✖ search (250ms)");
  console.log(specLine({ name: "pay", status: "skipped", durationMs: 0 }), "=> expected:", "﹣ pay (0ms) # SKIP");
  console.log(specLine({ name: "slow", status: "passed", durationMs: 1999.5 }), "=> expected:", "✔ slow (2000ms)");
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 3: reporterArgs ---");
try {
  console.log(reporterArgs([{ name: "spec" }, { name: "junit", destination: "reports/junit.xml" }]), "=> expected:", [
    "--test-reporter=spec",
    "--test-reporter-destination=stdout",
    "--test-reporter=junit",
    "--test-reporter-destination=reports/junit.xml",
  ]);
  console.log(reporterArgs([{ name: "tap", destination: "out.tap" }]), "=> expected:", [
    "--test-reporter=tap",
    "--test-reporter-destination=out.tap",
  ]);
  console.log(reporterArgs([]), "=> expected:", []);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 4: toTap ---");
try {
  console.log(toTap(sampleResults).split("\n"), "=> expected:", [
    "TAP version 13",
    "1..3",
    "ok 1 - a",
    "not ok 2 - b",
    "  ---",
    "  error: boom",
    "  ...",
    "ok 3 - c # SKIP",
  ]);
  console.log(toTap([]).split("\n"), "=> expected:", ["TAP version 13", "1..0"]);
  console.log(toTap([{ name: "no message", status: "failed", durationMs: 1 }]).split("\n"), "=> expected:", [
    "TAP version 13",
    "1..1",
    "not ok 1 - no message",
  ]);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 5: parseTap ---");
try {
  console.log(parseTap("TAP version 13\n1..2\nok 1 - a\nnot ok 2 - b"), "=> expected:", {
    planned: 2,
    passed: 1,
    failed: 1,
    skipped: 0,
    failedNames: ["b"],
  });
  const nodeLike = [
    "TAP version 13",
    "# Subtest: Users API",
    "    ok 1 - inner subtest is ignored",
    "ok 1 - GET /health returns ok",
    "  ---",
    "  duration_ms: 12.3",
    "  ...",
    "not ok 2 - GET /users/999 returns 404 # time=12ms",
    "  ---",
    "  error: 'expected 404'",
    "  ...",
    "ok 3 - DELETE /users/1 # skip not implemented",
    "not ok 4 - POST /users",
    "1..4",
    "# tests 4",
  ].join("\r\n");
  console.log(parseTap(nodeLike), "=> expected:", {
    planned: 4,
    passed: 1,
    failed: 2,
    skipped: 1,
    failedNames: ["GET /users/999 returns 404", "POST /users"],
  });
  console.log(parseTap(""), "=> expected:", { planned: null, passed: 0, failed: 0, skipped: 0, failedNames: [] });
  // Whatever toTap writes, parseTap must be able to read
  console.log(parseTap(toTap(sampleResults)), "=> expected:", {
    planned: 3,
    passed: 1,
    failed: 1,
    skipped: 1,
    failedNames: ["b"],
  });
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 6 (Bonus): parseJUnitFailures ---");
try {
  console.log(parseJUnitFailures(junitSample), "=> expected:", [
    { name: "GET /users/999 returns 404", message: "Expected values to be strictly equal:\n\n200 !== 404\n" },
    { name: 'POST "No Email" & <b>', message: "got '200' &amp; more" },
    { name: "crash without message", message: "" },
  ]);
  console.log(parseJUnitFailures('<testsuite name="ok"><testcase name="a" time="0.1"/></testsuite>'), "=> expected:", []);
  console.log(parseJUnitFailures(""), "=> expected:", []);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}
