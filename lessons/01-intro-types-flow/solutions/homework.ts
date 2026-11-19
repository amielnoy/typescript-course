// Lesson 1 – Homework: Nightly Run Analyzer – Solutions
// Run (including the self-check):  npm run solution -- 01 hw
// Scenario: analyze last night's regression results – parse the run options from argv / env,
// classify every result, compute statistics, list slow tests and failures, and build the morning report.

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

export function readRunOptions(argv: string[], env: Record<string, string | undefined>): RunOptions {
  // Values from the command line – undefined until we find them
  let suiteArg: string | undefined;
  let slowArg: string | undefined;
  let strictFlag = false;

  // slice(2) skips the node path and the file path.
  // No break – if an option appears twice, the later one overwrites the earlier one (the last one wins).
  for (const arg of argv.slice(2)) {
    if (arg.startsWith("--suite=")) {
      suiteArg = arg.slice("--suite=".length);
    } else if (arg.startsWith("--slow=")) {
      slowArg = arg.slice("--slow=".length);
    } else if (arg === "--strict") {
      strictFlag = true;
    }
  }

  // command line ?? env ?? default
  const suite = suiteArg ?? env.SUITE ?? "all";

  const rawSlow = slowArg ?? env.SLOW_MS;
  let slowMs = rawSlow === undefined ? 2000 : Number(rawSlow);
  if (Number.isNaN(slowMs)) {
    slowMs = 2000;
  }

  const strict = strictFlag || env.STRICT === "true";

  return { suite, slowMs, strict };
}

export function classifyResult(result: TestResult): Outcome {
  switch (result.status) {
    case "passed":
      return result.retries > 0 ? Outcome.Flaky : Outcome.Passed;
    case "failed":
      return Outcome.Failed;
    case "skipped":
      return Outcome.Skipped;
    default:
      return Outcome.Failed; // an unknown result is never a pass
  }
}

export function computeStats(results: TestResult[]): RunStats {
  let passed = 0;
  let flaky = 0;
  let failed = 0;
  let skipped = 0;
  let totalDurationMs = 0;

  for (const result of results) {
    switch (classifyResult(result)) {
      case Outcome.Passed:
        passed++;
        break;
      case Outcome.Flaky:
        flaky++;
        break;
      case Outcome.Failed:
        failed++;
        break;
      case Outcome.Skipped:
        skipped++;
        break;
    }
    totalDurationMs += result.durationMs;
  }

  const total = results.length;
  const executed = total - skipped;
  const passRate = executed === 0 ? 0 : Math.round(((passed + flaky) / executed) * 100 * 10) / 10;

  return { total, passed, flaky, failed, skipped, passRate, totalDurationMs };
}

export function listSlowTests(results: TestResult[], slowMs: number): string[] {
  const slow: string[] = [];
  for (const result of results) {
    if (classifyResult(result) === Outcome.Skipped) continue; // a skipped test is never slow
    if (result.durationMs > slowMs) {
      slow.push(`${result.id} (${result.durationMs}ms)`);
    }
  }
  return slow;
}

export function groupFailuresBySuite(results: TestResult[]): Record<string, string[]> {
  const groups: Record<string, string[]> = {};
  for (const result of results) {
    if (classifyResult(result) !== Outcome.Failed) continue;

    // || and not ?? – an empty string "" should also become "no error message"
    const message = result.error || "no error message";

    if (groups[result.suite] === undefined) {
      groups[result.suite] = []; // the first failure of this suite
    }
    groups[result.suite].push(`${result.id}: ${message}`);
  }
  return groups;
}

export function runVerdict(stats: RunStats, strict: boolean): string {
  const executed = stats.total - stats.skipped;

  if (executed === 0) return "RED: nothing was executed";
  if (stats.failed > 0) return `RED: ${stats.failed} failed`;
  if (strict && stats.flaky > 0) return `RED: ${stats.flaky} flaky (strict mode)`;
  if (stats.flaky > 0) return `YELLOW: ${stats.flaky} flaky`;
  // "more than a quarter" without dividing: skipped / total > 1/4  <=>  skipped * 4 > total
  if (stats.skipped * 4 > stats.total) return `YELLOW: ${stats.skipped} of ${stats.total} skipped`;
  return "GREEN";
}

export function buildReport(results: TestResult[], argv: string[], env: Record<string, string | undefined>): string[] {
  const options = readRunOptions(argv, env);

  // Only the results of the requested suite
  const selected: TestResult[] = [];
  for (const result of results) {
    if (options.suite === "all" || result.suite === options.suite) {
      selected.push(result);
    }
  }

  const stats = computeStats(selected);
  const slow = listSlowTests(selected, options.slowMs);
  const failures = groupFailuresBySuite(selected);
  const seconds = Math.round(stats.totalDurationMs / 100) / 10;

  const lines: string[] = [];
  lines.push(`Nightly run | suite: ${options.suite}`);
  lines.push(
    `Total: ${stats.total} | Passed: ${stats.passed} | Flaky: ${stats.flaky} | Failed: ${stats.failed} | Skipped: ${stats.skipped}`,
  );
  lines.push(`Pass rate: ${stats.passRate}%`);
  lines.push(`Duration: ${seconds}s`);
  lines.push(`Slow (> ${options.slowMs}ms): ${slow.length > 0 ? slow.join(", ") : "none"}`);

  for (const suite in failures) {
    for (const failure of failures[suite]) {
      lines.push(`[${suite}] ${failure}`);
    }
  }

  lines.push(`Verdict: ${runVerdict(stats, options.strict)}`);
  return lines;
}

// ============================================================
// Self-check – run:  npm run solution -- 01 hw
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
