// Lesson 10 – Topic 04: Mini Runner – building reports from run results – Exercises
// ------------------------------------------------------------
// Instructions:
//   1. Fill in the body of each function in place of the line  throw new Error("TODO")
//   2. It is recommended to keep the example  examples/04-mini-runner-with-reports.ts  open alongside this file
//      (we already practiced the summary, Markdown and JUnit in exercises.ts – here we continue from there)
//   3. Check yourself: npm run exercise -- 10 04 (self-check at the end of the file)
// ------------------------------------------------------------

export type Status = "passed" | "failed" | "skipped";

/** The same structure as TestResult in example 04 */
export interface TestResult {
  name: string;
  tags: string[];
  status: Status;
  durationMs: number;
  error?: string;
}

/**
 * Exercise 1 – Exit code for the CI step
 * This is what decides whether the step in the Pipeline is green (0) or red (1):
 * - at least one test failed                              => 1
 * - no test ran at all (an empty run, or all were skipped) => 1   (a "green" run with no tests is a bug!)
 * - otherwise                                             => 0
 *   ciExitCode([passed, skipped]) => 0
 *   ciExitCode([passed, failed])  => 1
 *   ciExitCode([])                => 1
 *   ciExitCode([skipped])         => 1
 */
export function ciExitCode(results: TestResult[]): 0 | 1 {
  throw new Error("TODO");
}

/**
 * Exercise 2 – The slowest tests
 * Return the n slowest tests, from slowest to fastest, in the format { name, durationMs }.
 * - skipped tests are not included (they didn't run)
 * - equal time => by name in alphabetical order (a.name.localeCompare(b.name))
 * - n larger than the number of tests => all of them.  n = 0 => []
 * - you must not change the original array (sort changes it in place! copy it first)
 *   slowestTests(results, 2) => [{ name: "checkout", durationMs: 900 }, { name: "profile", durationMs: 400 }]
 */
export function slowestTests(results: TestResult[], n: number): { name: string; durationMs: number }[] {
  throw new Error("TODO");
}

export interface TagStats {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  /** Percentage of the tests that ran (passed+failed), rounded. If no test ran – 0 */
  passRate: number;
}

/**
 * Exercise 3 – Statistics by tag
 * Useful for answering "how many of the smoke tests passed?".
 * - a test with several tags is counted under each of them
 * - a test with no tags is counted under "untagged"
 *   statsByTag([
 *     { name: "a", tags: ["smoke", "api"], status: "passed", ... },
 *     { name: "b", tags: ["api"],          status: "failed", ... },
 *     { name: "c", tags: [],               status: "skipped", ... },
 *   ])
 *   => {
 *        smoke:    { total: 1, passed: 1, failed: 0, skipped: 0, passRate: 100 },
 *        api:      { total: 2, passed: 1, failed: 1, skipped: 0, passRate: 50 },
 *        untagged: { total: 1, passed: 0, failed: 0, skipped: 1, passRate: 0 },
 *      }
 */
export function statsByTag(results: TestResult[]): Record<string, TagStats> {
  throw new Error("TODO");
}

/**
 * Exercise 4 – A row in the HTML report table
 * The exact format (a single line, no extra spaces):
 *   <tr class="passed"><td>passed</td><td>login</td><td class="num">120 ms</td></tr>
 * And if the test failed and has an error – add it inside the name cell:
 *   <tr class="failed"><td>failed</td><td>search<div class="err">expected 3 got 2</div></td><td class="num">250 ms</td></tr>
 * - you must escape the characters & < > " (to &amp; &lt; &gt; &quot;) in the name and the error,
 *   otherwise a test name like "<script>" will break the report (or worse – run code!)
 */
export function htmlRow(result: TestResult): string {
  throw new Error("TODO");
}

/**
 * Exercise 5 – Detecting flaky tests
 * You get the results of several runs of the same suite (an array of runs).
 * A test is flaky if it passed in one of the runs and failed in another (skipped doesn't count).
 * Return the names of the flaky tests, sorted alphabetically, without duplicates.
 *   detectFlaky([
 *     [ login: passed, search: failed, pay: passed ],
 *     [ login: passed, search: passed, pay: passed ],
 *     [ login: failed, search: failed, pay: skipped ],
 *   ])
 *   => ["login", "search"]
 * Hint: Map<string, Set<Status>>
 */
export function detectFlaky(runs: TestResult[][]): string[] {
  throw new Error("TODO");
}

export interface RunDiff {
  /** Failing now, and did not fail in the previous run (including new tests) */
  newFailures: string[];
  /** Failed in the previous run and pass now */
  fixed: string[];
  /** Failed in both runs */
  stillFailing: string[];
}

/**
 * Exercise 6 (Bonus) – Comparing with the previous run
 * In CI this is what answers the important question: "did my change break anything?"
 * Each list is sorted alphabetically.
 * - a test that failed before and is now skipped or no longer exists – does not count as "fixed"
 *   compareRuns(
 *     [ a: failed, b: failed, c: passed ],
 *     [ a: passed, b: failed, c: failed, d: failed ],
 *   )
 *   => { newFailures: ["c", "d"], fixed: ["a"], stillFailing: ["b"] }
 */
export function compareRuns(previous: TestResult[], current: TestResult[]): RunDiff {
  throw new Error("TODO");
}

// ============================================================
// Self-check – run:  npm run exercise -- 10 04
// On every line, the value left of "=> expected:" must equal the value on its right.
// (No need to change the code below this line)
// ============================================================

const makeResult = (name: string, status: Status, durationMs = 0, tags: string[] = [], error?: string): TestResult =>
  error === undefined ? { name, tags, status, durationMs } : { name, tags, status, durationMs, error };

const sampleResults: TestResult[] = [
  makeResult("login", "passed", 120, ["smoke", "auth"]),
  makeResult("search", "failed", 400, ["regression"], "expected 3 got 2"),
  makeResult("checkout", "passed", 900, ["regression", "smoke"]),
  makeResult("profile", "passed", 400, ["regression"]),
  makeResult("admin", "skipped", 5000, ["auth"]),
  makeResult("logout", "passed", 30),
];

console.log("\n--- Exercise 1: ciExitCode ---");
try {
  console.log(ciExitCode([makeResult("a", "passed"), makeResult("b", "skipped")]), "=> expected:", 0);
  console.log(ciExitCode(sampleResults), "=> expected:", 1);
  console.log(ciExitCode([makeResult("a", "failed")]), "=> expected:", 1);
  console.log(ciExitCode([]), "=> expected:", 1);
  console.log(ciExitCode([makeResult("a", "skipped"), makeResult("b", "skipped")]), "=> expected:", 1);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 2: slowestTests ---");
try {
  const namesBefore = sampleResults.map((x) => x.name);
  console.log(slowestTests(sampleResults, 2), "=> expected:", [
    { name: "checkout", durationMs: 900 },
    { name: "profile", durationMs: 400 },
  ]);
  console.log(slowestTests(sampleResults, 3), "=> expected:", [
    { name: "checkout", durationMs: 900 },
    { name: "profile", durationMs: 400 },
    { name: "search", durationMs: 400 },
  ]);
  // Skipped tests are not included:
  console.log(slowestTests(sampleResults, 100).length, "=> expected:", 5);
  console.log(slowestTests(sampleResults, 0), "=> expected:", []);
  console.log(slowestTests([], 3), "=> expected:", []);
  // The original array was not changed (not sorted in place):
  console.log(sampleResults.map((x) => x.name), "=> expected:", namesBefore);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 3: statsByTag ---");
try {
  console.log(
    statsByTag([
      makeResult("a", "passed", 1, ["smoke", "api"]),
      makeResult("b", "failed", 1, ["api"]),
      makeResult("c", "skipped", 0, []),
    ]),
    "=> expected:",
    {
      smoke: { total: 1, passed: 1, failed: 0, skipped: 0, passRate: 100 },
      api: { total: 2, passed: 1, failed: 1, skipped: 0, passRate: 50 },
      untagged: { total: 1, passed: 0, failed: 0, skipped: 1, passRate: 0 },
    },
  );
  console.log(statsByTag(sampleResults), "=> expected:", {
    smoke: { total: 2, passed: 2, failed: 0, skipped: 0, passRate: 100 },
    auth: { total: 2, passed: 1, failed: 0, skipped: 1, passRate: 100 },
    regression: { total: 3, passed: 2, failed: 1, skipped: 0, passRate: 67 },
    untagged: { total: 1, passed: 1, failed: 0, skipped: 0, passRate: 100 },
  });
  console.log(statsByTag([]), "=> expected:", {});
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 4: htmlRow ---");
try {
  console.log(
    JSON.stringify(htmlRow(makeResult("login", "passed", 120))),
    "=> expected:",
    JSON.stringify('<tr class="passed"><td>passed</td><td>login</td><td class="num">120 ms</td></tr>'),
  );
  console.log(
    JSON.stringify(htmlRow(makeResult("search", "failed", 250, [], "expected 3 got 2"))),
    "=> expected:",
    JSON.stringify(
      '<tr class="failed"><td>failed</td><td>search<div class="err">expected 3 got 2</div></td><td class="num">250 ms</td></tr>',
    ),
  );
  console.log(
    JSON.stringify(htmlRow(makeResult("admin", "skipped", 0))),
    "=> expected:",
    JSON.stringify('<tr class="skipped"><td>skipped</td><td>admin</td><td class="num">0 ms</td></tr>'),
  );
  console.log(
    JSON.stringify(htmlRow(makeResult("<script>alert(1)</script> & co", "failed", 1, [], 'expected "a" < "b"'))),
    "=> expected:",
    JSON.stringify(
      '<tr class="failed"><td>failed</td><td>&lt;script&gt;alert(1)&lt;/script&gt; &amp; co' +
        '<div class="err">expected &quot;a&quot; &lt; &quot;b&quot;</div></td><td class="num">1 ms</td></tr>',
    ),
  );
  console.log(
    JSON.stringify(htmlRow(makeResult("no message", "failed", 3))),
    "=> expected:",
    JSON.stringify('<tr class="failed"><td>failed</td><td>no message</td><td class="num">3 ms</td></tr>'),
  );
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 5: detectFlaky ---");
try {
  console.log(
    detectFlaky([
      [makeResult("login", "passed"), makeResult("search", "failed"), makeResult("pay", "passed")],
      [makeResult("login", "passed"), makeResult("search", "passed"), makeResult("pay", "passed")],
      [makeResult("login", "failed"), makeResult("search", "failed"), makeResult("pay", "skipped")],
    ]),
    "=> expected:",
    ["login", "search"],
  );
  // Always failing / skipped+passed – that's not flaky:
  console.log(
    detectFlaky([
      [makeResult("x", "failed"), makeResult("y", "skipped")],
      [makeResult("x", "failed"), makeResult("y", "passed")],
    ]),
    "=> expected:",
    [],
  );
  console.log(detectFlaky([[makeResult("only-once", "failed")]]), "=> expected:", []);
  console.log(detectFlaky([]), "=> expected:", []);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 6 (Bonus): compareRuns ---");
try {
  console.log(
    compareRuns(
      [makeResult("a", "failed"), makeResult("b", "failed"), makeResult("c", "passed")],
      [makeResult("a", "passed"), makeResult("b", "failed"), makeResult("c", "failed"), makeResult("d", "failed")],
    ),
    "=> expected:",
    { newFailures: ["c", "d"], fixed: ["a"], stillFailing: ["b"] },
  );
  console.log(
    compareRuns(
      [
        makeResult("z", "failed"),
        makeResult("gone", "failed"),
        makeResult("skippedNow", "failed"),
        makeResult("m", "skipped"),
      ],
      [
        makeResult("skippedNow", "skipped"),
        makeResult("z", "passed"),
        makeResult("m", "failed"),
        makeResult("k", "failed"),
      ],
    ),
    "=> expected:",
    { newFailures: ["k", "m"], fixed: ["z"], stillFailing: [] },
  );
  console.log(compareRuns([], []), "=> expected:", { newFailures: [], fixed: [], stillFailing: [] });
} catch (e) {
  console.log("  ✋", (e as Error).message);
}
