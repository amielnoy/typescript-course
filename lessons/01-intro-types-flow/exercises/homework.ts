// Lesson 1 – Homework: Nightly Run Analyzer
// ------------------------------------------------------------
// Instructions:
//   1. Complete the body of each function in place of the line  throw new Error("TODO")
//   2. Function syntax itself is taught in the next lesson – here, just write the code inside.
//   3. Use only what you learned in this lesson: types and variables, operators, conditions, loops,
//      and reading options from argv / env.
//   4. The tasks build on each other – solve them in order. A later task may (and should!) call
//      the functions you wrote before it, e.g.  const outcome = classifyResult(result);
//   5. Check yourself: npm run exercise -- 01 hw (self-check at the end of the file)
// ------------------------------------------------------------
//
// Scenario:
//   Every night the CI server runs the regression suite and saves the results. Every morning someone
//   on the QA team reads them and answers the same questions: what broke? what is flaky? what is slow?
//   can we release today? Your job: write a small analyzer that answers them automatically.
//
//   The analyzer is started from the command line, for example:
//       npx tsx nightly.ts --suite=checkout --slow=3000 --strict
//   and it can also be configured with environment variables (SUITE, SLOW_MS, STRICT) – that's how CI
//   usually passes options. As in topic 06, the functions don't read process.argv / process.env themselves –
//   they receive them as parameters, so we can test them with any input we want.
// ------------------------------------------------------------

// ---------- Types and sample data (given – no need to change) ----------
// `type` gives a name to an object shape so we don't have to repeat it. You'll learn it properly in lesson 2 –
// for now just read  TestResult  as "an object with these fields".

/** One test from the nightly run, exactly as the test runner saved it. */
export type TestResult = {
  id: string;
  suite: string;
  status: string; // usually "passed" | "failed" | "skipped" – but the runner may also write something unexpected
  durationMs: number;
  retries: number; // how many times the runner re-ran the test after it failed
  error?: string; // the failure message, if the runner saved one
};

/** The analyzer's options, after reading the command line and the environment variables. */
export type RunOptions = {
  suite: string; // "all" = every suite
  slowMs: number; // a test that takes longer than this is "slow"
  strict: boolean; // strict mode: a flaky test blocks the release
};

/** What a single test result really means for us. */
export enum Outcome {
  Passed = "PASSED",
  Flaky = "FLAKY",
  Failed = "FAILED",
  Skipped = "SKIPPED",
}

/** Summary numbers of a run. */
export type RunStats = {
  total: number;
  passed: number;
  flaky: number;
  failed: number;
  skipped: number;
  passRate: number; // percent, rounded to 1 decimal place
  totalDurationMs: number;
};

/** Last night's results. */
export const nightlyRun: TestResult[] = [
  { id: "TC-101", suite: "auth", status: "passed", durationMs: 850, retries: 0 },
  { id: "TC-102", suite: "auth", status: "failed", durationMs: 1200, retries: 2, error: "Expected 200, got 401" },
  { id: "TC-103", suite: "auth", status: "passed", durationMs: 2600, retries: 1 },
  { id: "TC-201", suite: "cart", status: "passed", durationMs: 430, retries: 0 },
  { id: "TC-202", suite: "cart", status: "skipped", durationMs: 0, retries: 0 },
  { id: "TC-203", suite: "cart", status: "failed", durationMs: 3100, retries: 2, error: "" },
  { id: "TC-204", suite: "cart", status: "passed", durationMs: 1900, retries: 0 },
  { id: "TC-301", suite: "checkout", status: "passed", durationMs: 2050, retries: 0 },
  { id: "TC-302", suite: "checkout", status: "failed", durationMs: 5000, retries: 2, error: "Timeout after 5000ms" },
  { id: "TC-303", suite: "checkout", status: "skipped", durationMs: 0, retries: 0 },
];

// ---------- Tasks ----------

/**
 * Task 1 – Read the run options (argv + env + defaults)
 * argv is like process.argv: the first two elements are the node path and the file path – ignore them.
 * env is like process.env: every value is a string or undefined.
 * Return { suite, slowMs, strict }:
 *   suite  – from "--suite=<name>", otherwise env.SUITE, otherwise "all"
 *   slowMs – from "--slow=<ms>", otherwise env.SLOW_MS, otherwise 2000.
 *            Convert it to a number. If the chosen value is not a valid number (e.g. "abc") – use 2000.
 *            Careful: "0" is a valid value => 0.
 *   strict – true if the argument "--strict" was passed exactly, OR env.STRICT is exactly "true". Otherwise false.
 * Rules: the command line beats env, and env beats the default.
 *        If the same option appears twice on the command line – the last one wins.
 * Examples:
 *   (["node", "nightly.ts"], {})                                         => { suite: "all", slowMs: 2000, strict: false }
 *   (["node", "nightly.ts", "--suite=auth", "--strict"], { SLOW_MS: "1500" }) => { suite: "auth", slowMs: 1500, strict: true }
 *   (["node", "nightly.ts", "--suite=cart"], { SUITE: "auth" })          => { suite: "cart", slowMs: 2000, strict: false }
 * Hints: keep a variable per option (string | undefined) and fill it in a loop over the arguments;
 *        startsWith / slice;  ??  for "otherwise";  Number(...);  Number.isNaN(n) tells you "not a number".
 */
export function readRunOptions(argv: string[], env: Record<string, string | undefined>): RunOptions {
  throw new Error("TODO");
}

/**
 * Task 2 – What does a single result really mean?
 * Return the Outcome of one test result:
 *   status "passed" and retries === 0   => Outcome.Passed
 *   status "passed" and retries > 0     => Outcome.Flaky    (it failed first and passed only on a retry)
 *   status "failed"                     => Outcome.Failed
 *   status "skipped"                    => Outcome.Skipped
 *   any other status ("timedOut", "PASSED", ...) => Outcome.Failed – an unknown result is never a pass!
 */
export function classifyResult(result: TestResult): Outcome {
  throw new Error("TODO");
}

/**
 * Task 3 – Run statistics
 * Return the RunStats of the given results:
 *   total                                – how many results there are
 *   passed / flaky / failed / skipped    – counted by the outcome from Task 2
 *   passRate        – (passed + flaky) out of the tests that actually ran (everything except skipped),
 *                     in percent, rounded to 1 decimal place. If no test actually ran – 0.
 *   totalDurationMs – the sum of durationMs of all the results
 * Example: nightlyRun => { total: 10, passed: 4, flaky: 1, failed: 3, skipped: 2, passRate: 62.5, totalDurationMs: 17130 }
 */
export function computeStats(results: TestResult[]): RunStats {
  throw new Error("TODO");
}

/**
 * Task 4 – Slow tests
 * Return the tests that took MORE than slowMs, in run order, each as "<id> (<durationMs>ms)".
 * Exactly slowMs is not slow. A skipped test is never slow, whatever its durationMs says.
 * Example: (nightlyRun, 3000) => ["TC-203 (3100ms)", "TC-302 (5000ms)"]
 */
export function listSlowTests(results: TestResult[], slowMs: number): string[] {
  throw new Error("TODO");
}

/**
 * Task 5 – Failures grouped by suite
 * Return an object: key = suite name, value = an array of "<id>: <error>" for every result whose
 * outcome (Task 2) is Failed, in run order.
 * If error is missing OR an empty string – write "no error message" instead.
 * A suite without failures does not appear in the object at all.
 * Example: nightlyRun => {
 *   auth: ["TC-102: Expected 200, got 401"],
 *   cart: ["TC-203: no error message"],
 *   checkout: ["TC-302: Timeout after 5000ms"],
 * }
 * Think: which operator treats "" as "missing" – ?? or || ?
 */
export function groupFailuresBySuite(results: TestResult[]): Record<string, string[]> {
  throw new Error("TODO");
}

/**
 * Task 6 (Challenge) – Can we release today?
 * Check these rules IN THIS ORDER and return the text of the first one that matches:
 *   1. no test actually ran (everything was skipped, or there are no tests)  => "RED: nothing was executed"
 *   2. at least one test failed                                               => "RED: <failed> failed"
 *   3. strict mode and at least one flaky test                                => "RED: <flaky> flaky (strict mode)"
 *   4. at least one flaky test                                                => "YELLOW: <flaky> flaky"
 *   5. MORE than a quarter of the tests were skipped                          => "YELLOW: <skipped> of <total> skipped"
 *   6. otherwise                                                              => "GREEN"
 * Examples:
 *   ({ total: 10, passed: 4, flaky: 1, failed: 3, skipped: 2, ... }, false) => "RED: 3 failed"
 *   ({ total: 8, passed: 5, flaky: 0, failed: 0, skipped: 3, ... }, false)  => "YELLOW: 3 of 8 skipped"
 *   ({ total: 8, passed: 6, flaky: 0, failed: 0, skipped: 2, ... }, false)  => "GREEN"   (exactly a quarter is OK)
 */
export function runVerdict(stats: RunStats, strict: boolean): string {
  throw new Error("TODO");
}

/**
 * Task 7 (Challenge) – The morning report
 * Put everything together. You get the raw results, argv and env, and return the report lines.
 *   - Read the options (Task 1).
 *   - Keep only the results of options.suite (or all of them when the suite is "all").
 *   - Build these lines, in this order:
 *       "Nightly run | suite: <suite>"
 *       "Total: <total> | Passed: <passed> | Flaky: <flaky> | Failed: <failed> | Skipped: <skipped>"
 *       "Pass rate: <passRate>%"
 *       "Duration: <seconds>s"           – totalDurationMs in seconds, rounded to 1 decimal place (17130 => 17.1)
 *       "Slow (> <slowMs>ms): <the slow tests, separated by ", ">"   – or "none" if there are none
 *       one line per failure: "[<suite>] <id>: <error>"   – from Task 5, suite by suite
 *       "Verdict: <verdict>"             – from Task 6
 * Example: (nightlyRun, ["node", "nightly.ts", "--suite=cart", "--slow=3000", "--strict"], {}) =>
 *   [
 *     "Nightly run | suite: cart",
 *     "Total: 4 | Passed: 2 | Flaky: 0 | Failed: 1 | Skipped: 1",
 *     "Pass rate: 66.7%",
 *     "Duration: 5.4s",
 *     "Slow (> 3000ms): TC-203 (3100ms)",
 *     "[cart] TC-203: no error message",
 *     "Verdict: RED: 1 failed",
 *   ]
 */
export function buildReport(results: TestResult[], argv: string[], env: Record<string, string | undefined>): string[] {
  throw new Error("TODO");
}

// ============================================================
// Self-check – run:  npm run exercise -- 01 hw
// On every line, the value left of "=> expected:" must equal the value on its right.
// (No need to change the code below this line)
// ============================================================

console.log("\n--- Task 1: readRunOptions ---");
try {
  console.log(readRunOptions(["node", "nightly.ts"], {}), "=> expected:", { suite: "all", slowMs: 2000, strict: false });
  console.log(readRunOptions(["node", "nightly.ts", "--suite=auth", "--slow=1500", "--strict"], {}), "=> expected:", {
    suite: "auth",
    slowMs: 1500,
    strict: true,
  });
  console.log(readRunOptions(["node", "nightly.ts"], { SUITE: "cart", SLOW_MS: "3000", STRICT: "true" }), "=> expected:", {
    suite: "cart",
    slowMs: 3000,
    strict: true,
  });
  console.log(
    readRunOptions(["node", "nightly.ts", "--suite=checkout", "--slow=500"], { SUITE: "cart", SLOW_MS: "3000" }),
    "=> expected:",
    { suite: "checkout", slowMs: 500, strict: false },
  ); // the command line beats env
  console.log(readRunOptions(["node", "nightly.ts", "--suite=auth", "--suite=cart"], {}).suite, "=> expected:", "cart"); // the last one wins
  console.log(readRunOptions(["node", "nightly.ts", "--slow=0"], { SLOW_MS: "3000" }).slowMs, "=> expected:", 0); // 0 is a valid value
  console.log(readRunOptions(["node", "nightly.ts", "--slow=abc"], {}).slowMs, "=> expected:", 2000); // not a number
  console.log(readRunOptions(["node", "nightly.ts"], { STRICT: "yes" }).strict, "=> expected:", false);
  console.log(readRunOptions(["node", "nightly.ts", "--strict=true", "--suite-name=auth"], {}), "=> expected:", {
    suite: "all",
    slowMs: 2000,
    strict: false,
  }); // look-alike arguments are not our options
  console.log(readRunOptions(["node", "nightly.ts"], { SUITE: undefined }).suite, "=> expected:", "all");
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Task 2: classifyResult ---");
try {
  console.log(classifyResult(nightlyRun[0]), "=> expected:", Outcome.Passed); // TC-101
  console.log(classifyResult(nightlyRun[2]), "=> expected:", Outcome.Flaky); // TC-103 – passed on a retry
  console.log(classifyResult(nightlyRun[1]), "=> expected:", Outcome.Failed); // TC-102
  console.log(classifyResult(nightlyRun[4]), "=> expected:", Outcome.Skipped); // TC-202
  console.log(classifyResult({ id: "TC-900", suite: "x", status: "failed", durationMs: 10, retries: 0 }), "=> expected:", Outcome.Failed);
  console.log(classifyResult({ id: "TC-901", suite: "x", status: "timedOut", durationMs: 30000, retries: 0 }), "=> expected:", Outcome.Failed);
  console.log(classifyResult({ id: "TC-902", suite: "x", status: "PASSED", durationMs: 10, retries: 0 }), "=> expected:", Outcome.Failed);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Task 3: computeStats ---");
try {
  console.log(computeStats(nightlyRun), "=> expected:", {
    total: 10,
    passed: 4,
    flaky: 1,
    failed: 3,
    skipped: 2,
    passRate: 62.5,
    totalDurationMs: 17130,
  });
  console.log(computeStats([]), "=> expected:", {
    total: 0,
    passed: 0,
    flaky: 0,
    failed: 0,
    skipped: 0,
    passRate: 0,
    totalDurationMs: 0,
  });
  console.log(computeStats([nightlyRun[4], nightlyRun[9]]).passRate, "=> expected:", 0); // only skipped – nothing ran
  console.log(computeStats([nightlyRun[2]]).passRate, "=> expected:", 100); // a flaky test still passed
  console.log(computeStats(nightlyRun.slice(0, 3)).passRate, "=> expected:", 66.7); // 2 of 3
  console.log(
    computeStats([nightlyRun[0], { id: "TC-901", suite: "x", status: "timedOut", durationMs: 30000, retries: 0 }]),
    "=> expected:",
    { total: 2, passed: 1, flaky: 0, failed: 1, skipped: 0, passRate: 50, totalDurationMs: 30850 },
  );
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Task 4: listSlowTests ---");
try {
  console.log(listSlowTests(nightlyRun, 2000), "=> expected:", [
    "TC-103 (2600ms)",
    "TC-203 (3100ms)",
    "TC-301 (2050ms)",
    "TC-302 (5000ms)",
  ]);
  console.log(listSlowTests(nightlyRun, 3000), "=> expected:", ["TC-203 (3100ms)", "TC-302 (5000ms)"]);
  console.log(listSlowTests(nightlyRun, 2050), "=> expected:", ["TC-103 (2600ms)", "TC-203 (3100ms)", "TC-302 (5000ms)"]); // exactly 2050 is not slow
  console.log(listSlowTests(nightlyRun, 10000), "=> expected:", []);
  console.log(listSlowTests([], 1000), "=> expected:", []);
  console.log(listSlowTests([{ id: "TC-903", suite: "x", status: "skipped", durationMs: 9000, retries: 0 }], 1000), "=> expected:", []);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Task 5: groupFailuresBySuite ---");
try {
  console.log(groupFailuresBySuite(nightlyRun), "=> expected:", {
    auth: ["TC-102: Expected 200, got 401"],
    cart: ["TC-203: no error message"], // error is ""
    checkout: ["TC-302: Timeout after 5000ms"],
  });
  console.log(groupFailuresBySuite([]), "=> expected:", {});
  console.log(groupFailuresBySuite([nightlyRun[0], nightlyRun[2], nightlyRun[4]]), "=> expected:", {}); // no failures
  console.log(groupFailuresBySuite([{ id: "TC-601", suite: "search", status: "failed", durationMs: 900, retries: 0 }]), "=> expected:", {
    search: ["TC-601: no error message"],
  }); // error is missing
  console.log(
    groupFailuresBySuite([
      { id: "TC-602", suite: "search", status: "timedOut", durationMs: 30000, retries: 0, error: "Test timeout of 30000ms exceeded" },
      nightlyRun[0],
      { id: "TC-603", suite: "search", status: "failed", durationMs: 700, retries: 1, error: "Element not found" },
    ]),
    "=> expected:",
    { search: ["TC-602: Test timeout of 30000ms exceeded", "TC-603: Element not found"] },
  );
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Task 6 (Challenge): runVerdict ---");
try {
  console.log(
    runVerdict({ total: 10, passed: 4, flaky: 1, failed: 3, skipped: 2, passRate: 62.5, totalDurationMs: 17130 }, false),
    "=> expected:",
    "RED: 3 failed",
  );
  console.log(
    runVerdict({ total: 0, passed: 0, flaky: 0, failed: 0, skipped: 0, passRate: 0, totalDurationMs: 0 }, false),
    "=> expected:",
    "RED: nothing was executed",
  );
  console.log(
    runVerdict({ total: 3, passed: 0, flaky: 0, failed: 0, skipped: 3, passRate: 0, totalDurationMs: 0 }, false),
    "=> expected:",
    "RED: nothing was executed",
  ); // everything was skipped
  console.log(
    runVerdict({ total: 6, passed: 3, flaky: 1, failed: 2, skipped: 0, passRate: 66.7, totalDurationMs: 6000 }, true),
    "=> expected:",
    "RED: 2 failed",
  ); // failures come before flaky
  console.log(
    runVerdict({ total: 5, passed: 4, flaky: 1, failed: 0, skipped: 0, passRate: 100, totalDurationMs: 5000 }, true),
    "=> expected:",
    "RED: 1 flaky (strict mode)",
  );
  console.log(
    runVerdict({ total: 5, passed: 4, flaky: 1, failed: 0, skipped: 0, passRate: 100, totalDurationMs: 5000 }, false),
    "=> expected:",
    "YELLOW: 1 flaky",
  );
  console.log(
    runVerdict({ total: 8, passed: 4, flaky: 1, failed: 0, skipped: 3, passRate: 100, totalDurationMs: 5000 }, false),
    "=> expected:",
    "YELLOW: 1 flaky",
  ); // flaky is checked before skipped
  console.log(
    runVerdict({ total: 8, passed: 5, flaky: 0, failed: 0, skipped: 3, passRate: 100, totalDurationMs: 5000 }, false),
    "=> expected:",
    "YELLOW: 3 of 8 skipped",
  );
  console.log(
    runVerdict({ total: 8, passed: 6, flaky: 0, failed: 0, skipped: 2, passRate: 100, totalDurationMs: 5000 }, true),
    "=> expected:",
    "GREEN",
  ); // exactly a quarter skipped is still OK
  console.log(
    runVerdict({ total: 4, passed: 4, flaky: 0, failed: 0, skipped: 0, passRate: 100, totalDurationMs: 2000 }, false),
    "=> expected:",
    "GREEN",
  );
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Task 7 (Challenge): buildReport ---");
try {
  console.log(buildReport(nightlyRun, ["node", "nightly.ts"], {}), "=> expected:", [
    "Nightly run | suite: all",
    "Total: 10 | Passed: 4 | Flaky: 1 | Failed: 3 | Skipped: 2",
    "Pass rate: 62.5%",
    "Duration: 17.1s",
    "Slow (> 2000ms): TC-103 (2600ms), TC-203 (3100ms), TC-301 (2050ms), TC-302 (5000ms)",
    "[auth] TC-102: Expected 200, got 401",
    "[cart] TC-203: no error message",
    "[checkout] TC-302: Timeout after 5000ms",
    "Verdict: RED: 3 failed",
  ]);
  console.log(buildReport(nightlyRun, ["node", "nightly.ts", "--suite=cart", "--slow=3000", "--strict"], {}), "=> expected:", [
    "Nightly run | suite: cart",
    "Total: 4 | Passed: 2 | Flaky: 0 | Failed: 1 | Skipped: 1",
    "Pass rate: 66.7%",
    "Duration: 5.4s",
    "Slow (> 3000ms): TC-203 (3100ms)",
    "[cart] TC-203: no error message",
    "Verdict: RED: 1 failed",
  ]);
  console.log(buildReport(nightlyRun, ["node", "nightly.ts"], { SUITE: "auth", SLOW_MS: "1000" }), "=> expected:", [
    "Nightly run | suite: auth",
    "Total: 3 | Passed: 1 | Flaky: 1 | Failed: 1 | Skipped: 0",
    "Pass rate: 66.7%",
    "Duration: 4.7s",
    "Slow (> 1000ms): TC-102 (1200ms), TC-103 (2600ms)",
    "[auth] TC-102: Expected 200, got 401",
    "Verdict: RED: 1 failed",
  ]);
  console.log(buildReport(nightlyRun, ["node", "nightly.ts", "--suite=search"], {}), "=> expected:", [
    "Nightly run | suite: search",
    "Total: 0 | Passed: 0 | Flaky: 0 | Failed: 0 | Skipped: 0",
    "Pass rate: 0%",
    "Duration: 0s",
    "Slow (> 2000ms): none",
    "Verdict: RED: nothing was executed",
  ]); // a suite that doesn't exist
  const quietNight: TestResult[] = [
    { id: "TC-501", suite: "search", status: "passed", durationMs: 700, retries: 0 },
    { id: "TC-502", suite: "search", status: "passed", durationMs: 2400, retries: 1 },
  ];
  console.log(buildReport(quietNight, ["node", "nightly.ts"], {}), "=> expected:", [
    "Nightly run | suite: all",
    "Total: 2 | Passed: 1 | Flaky: 1 | Failed: 0 | Skipped: 0",
    "Pass rate: 100%",
    "Duration: 3.1s",
    "Slow (> 2000ms): TC-502 (2400ms)",
    "Verdict: YELLOW: 1 flaky",
  ]); // no failures => no failure lines
  const strictReport = buildReport(quietNight, ["node", "nightly.ts"], { STRICT: "true" });
  console.log(strictReport[strictReport.length - 1], "=> expected:", "Verdict: RED: 1 flaky (strict mode)");
} catch (e) {
  console.log("  ✋", (e as Error).message);
}
