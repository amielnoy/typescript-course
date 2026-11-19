// Lesson 10 – Summary exercises: logs, evidence and reports
// Check yourself: npm run exercise -- 10 (self-check at the end of the file)

export type Level = "debug" | "info" | "warn" | "error";

/**
 * Exercise 1 – A log line
 * formatLogLine("info", "Opening page", new Date("2026-11-08T10:00:00.000Z"))
 *   => "[2026-11-08T10:00:00.000Z] [INFO] Opening page"
 * With context:
 * formatLogLine("error", "Timeout", date, "login")
 *   => "[2026-11-08T10:00:00.000Z] [ERROR] [login] Timeout"
 */
export function formatLogLine(level: Level, message: string, date: Date, context?: string): string {
  throw new Error("TODO");
}

/**
 * Exercise 2 – Filtering by level
 * The order: debug < info < warn < error
 * shouldLog("warn", "error") => true    (error is more severe than warn)
 * shouldLog("warn", "info")  => false
 * shouldLog("info", "info")  => true
 */
export function shouldLog(minLevel: Level, level: Level): boolean {
  throw new Error("TODO");
}

export interface TestResult {
  name: string;
  status: "passed" | "failed" | "skipped";
  durationMs: number;
  error?: string;
}

export interface Summary {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  /** Percentage of the tests that ran (passed+failed), rounded. If no test ran – 0 */
  passRate: number;
  durationMs: number;
}

/**
 * Exercise 3 – A run summary
 */
export function summarize(results: TestResult[]): Summary {
  throw new Error("TODO");
}

/**
 * Exercise 4 – A Markdown summary for GitHub Actions ($GITHUB_STEP_SUMMARY)
 * The exact format (lines separated by \n):
 *
 *   ## Test Results: PASSED          (or FAILED if there is at least one failure)
 *   | Total | Passed | Failed | Skipped | Pass rate |
 *   |---|---|---|---|---|
 *   | 4 | 3 | 1 | 0 | 75% |
 *
 * And if there are failures – an empty line, and then:
 *   ### Failures
 *   - **<name>**: <error>
 *   - **<name>**: <error>
 */
export function toMarkdownSummary(results: TestResult[]): string {
  throw new Error("TODO");
}

/**
 * Exercise 5 – JUnit XML
 * The exact format:
 *
 * <testsuite name="<suiteName>" tests="3" failures="1" skipped="1">
 *   <testcase name="a" time="0.1"/>
 *   <testcase name="b" time="0.25"><failure message="boom"/></testcase>
 *   <testcase name="c" time="0"><skipped/></testcase>
 * </testsuite>
 *
 * - time in seconds (durationMs / 1000)
 * - lines separated by \n, each testcase indented by two spaces
 * - you must escape the characters: & < > "  (to &amp; &lt; &gt; &quot;) in names and messages
 */
export function toJUnitXml(suiteName: string, results: TestResult[]): string {
  throw new Error("TODO");
}

/**
 * Exercise 6 – A file name for evidence (screenshot)
 * evidenceFileName("Login with VALID user!", new Date("2026-11-08T10:00:00.000Z"), "png")
 *   => "login-with-valid-user_2026-11-08T10-00-00-000Z.png"
 * - lowercase letters, every run of characters that are not a-z/0-9 becomes a single hyphen, no hyphens at the start/end
 * - in the date (ISO) replace ":" and "." with a hyphen
 */
export function evidenceFileName(testName: string, date: Date, ext: string): string {
  throw new Error("TODO");
}

// ============================================================
// Self-check – run:  npm run exercise -- 10
// On every line, the value left of "=> expected:" must equal the value on its right.
// (No need to change the code below this line)
// Multi-line text (Markdown, XML) is printed as an array of lines – so it's easy to see which line differs.
// ============================================================

const sampleDate = new Date("2026-11-08T10:00:00.000Z");
const sampleResults: TestResult[] = [
  { name: "login", status: "passed", durationMs: 100 },
  { name: "search", status: "failed", durationMs: 250, error: "expected 3 got 2" },
  { name: "cart", status: "passed", durationMs: 50 },
  { name: "pay", status: "passed", durationMs: 100 },
];

console.log("\n--- Exercise 1: formatLogLine ---");
try {
  console.log(formatLogLine("info", "Opening page", sampleDate), "=> expected:", "[2026-11-08T10:00:00.000Z] [INFO] Opening page");
  console.log(
    formatLogLine("error", "Timeout", sampleDate, "login"),
    "=> expected:",
    "[2026-11-08T10:00:00.000Z] [ERROR] [login] Timeout",
  );
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 2: shouldLog ---");
try {
  console.log(shouldLog("warn", "error"), "=> expected:", true);
  console.log(shouldLog("warn", "info"), "=> expected:", false);
  console.log(shouldLog("info", "info"), "=> expected:", true);
  console.log(shouldLog("debug", "debug"), "=> expected:", true);
  console.log(shouldLog("error", "warn"), "=> expected:", false);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 3: summarize ---");
try {
  console.log(summarize(sampleResults), "=> expected:", {
    total: 4,
    passed: 3,
    failed: 1,
    skipped: 0,
    passRate: 75,
    durationMs: 500,
  });
  console.log(summarize([{ name: "x", status: "skipped", durationMs: 0 }]).passRate, "=> expected:", 0);
  console.log(summarize([]).total, "=> expected:", 0);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 4: toMarkdownSummary ---");
try {
  console.log(toMarkdownSummary(sampleResults).split("\n"), "=> expected:", [
    "## Test Results: FAILED",
    "| Total | Passed | Failed | Skipped | Pass rate |",
    "|---|---|---|---|---|",
    "| 4 | 3 | 1 | 0 | 75% |",
    "",
    "### Failures",
    "- **search**: expected 3 got 2",
  ]);
  const ok = toMarkdownSummary([sampleResults[0]]);
  console.log(ok.split("\n")[0], "=> expected:", "## Test Results: PASSED");
  console.log(ok.includes("Failures"), "=> expected:", false);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 5: toJUnitXml ---");
try {
  const xml = toJUnitXml("API", [
    { name: "a", status: "passed", durationMs: 100 },
    { name: "b", status: "failed", durationMs: 250, error: "boom" },
    { name: "c", status: "skipped", durationMs: 0 },
  ]);
  console.log(xml.split("\n"), "=> expected:", [
    '<testsuite name="API" tests="3" failures="1" skipped="1">',
    '  <testcase name="a" time="0.1"/>',
    '  <testcase name="b" time="0.25"><failure message="boom"/></testcase>',
    '  <testcase name="c" time="0"><skipped/></testcase>',
    "</testsuite>",
  ]);
  const escaped = toJUnitXml("A&B", [{ name: "<x>", status: "failed", durationMs: 0, error: 'say "hi"' }]);
  console.log(escaped.includes('name="A&amp;B"'), "=> expected:", true);
  console.log(escaped.includes('name="&lt;x&gt;"'), "=> expected:", true);
  console.log(escaped.includes('message="say &quot;hi&quot;"'), "=> expected:", true);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 6: evidenceFileName ---");
try {
  console.log(
    evidenceFileName("Login with VALID user!", sampleDate, "png"),
    "=> expected:",
    "login-with-valid-user_2026-11-08T10-00-00-000Z.png",
  );
  console.log(
    evidenceFileName("  GET /users/1  ", sampleDate, "json"),
    "=> expected:",
    "get-users-1_2026-11-08T10-00-00-000Z.json",
  );
} catch (e) {
  console.log("  ✋", (e as Error).message);
}
