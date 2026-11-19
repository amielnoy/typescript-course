// Lesson 2 – Topic 02: Arrow Functions and Array Methods – Exercises
// ------------------------------------------------------------
// Instructions:
//   1. Complete the body of each function in place of the line  throw new Error("TODO")
//   2. Write every solution with arrow functions and array methods
//      (map / filter / find / some / every / reduce / sort) – without for loops
//      (except for the bonus exercise, which is about a callback).
//   3. Check yourself: npm run exercise -- 02 02 (self-check at the end of the file)
// ------------------------------------------------------------

export interface RunResult {
  name: string;
  status: "passed" | "failed" | "skipped";
  durationMs: number;
}

/**
 * Exercise 1 – map: converting run times from milliseconds to seconds
 *   toSeconds([1500, 200, 3000])  => [1.5, 0.2, 3]
 *   toSeconds([])                 => []
 */
export const toSeconds = (durationsMs: number[]): number[] => {
  return durationsMs.map((ms) => ms / 1000);
};

/**
 * Exercise 2 – find: the name of the first slow test
 * Return the name of the first test (in array order) whose durationMs
 * is greater than thresholdMs. If there is none – return undefined.
 *
 *   firstSlowTest(results, 3000)  => "search"   (if search is the first one above 3000)
 *   firstSlowTest(results, 99999) => undefined
 *
 * Hint: ?. (optional chaining) from the example.
 */
export const firstSlowTest = (results: RunResult[], thresholdMs: number): string | undefined => {
  return results.find((r) => r.durationMs > thresholdMs)?.name;
};

/**
 * Exercise 3 – some / every: is the run "green"?
 * A run is green if:
 *   - no test failed (every / some), and
 *   - at least one test passed (passed) – a run that is all skipped (or empty) is not green.
 *
 *   [passed, skipped]  => true
 *   [passed, failed]   => false
 *   [skipped, skipped] => false
 *   []                 => false
 */
export const isRunGreen = (results: RunResult[]): boolean => {
  return results.every((r) => r.status !== "failed") && results.some((r) => r.status === "passed");
};

/**
 * Exercise 4 – reduce: counting by status
 * Return an object with the number of tests in each status.
 *   countByStatus([passed, failed, passed])  => { passed: 2, failed: 1, skipped: 0 }
 *   countByStatus([])                        => { passed: 0, failed: 0, skipped: 0 }
 *
 * Hint: the initial value of reduce can be an object:
 *      results.reduce((acc, r) => { ...; return acc; }, { passed: 0, failed: 0, skipped: 0 })
 */
export const countByStatus = (
  results: RunResult[],
): { passed: number; failed: number; skipped: number } => {
  return results.reduce((acc, r) => {
    acc[r.status]++;
    return acc;
  }, { passed: 0, failed: 0, skipped: 0 });
};

/**
 * Exercise 5 – sort + chaining: the slowest tests
 * Return the names of the limit slowest tests, from slowest to fastest.
 * Important: don't change the order of the original array (sort a copy!).
 *
 *   slowestTests([{a,100}, {b,900}, {c,500}], 2)  => ["b", "c"]
 *
 * Hint: [...results].sort(...).slice(0, limit).map(...)
 */
export const slowestTests = (results: RunResult[], limit: number): string[] => {
  return [...results].sort((a, b) => b.durationMs - a.durationMs).slice(0, limit).map((r) => r.name); 
};

/**
 * Exercise 6 (Bonus) – callback: retry until success
 * Call attempt with the attempt number (1, 2, 3, ...) until it returns true,
 * but at most maxAttempts times.
 * Return the number of the attempt that succeeded, or -1 if no attempt succeeded.
 * After a success – do not call attempt again!
 *
 *   retryUntil(5, (n) => n === 3)   => 3   (attempt was called exactly 3 times)
 *   retryUntil(2, () => false)      => -1
 *   retryUntil(0, () => true)       => -1
 *
 * Here it is allowed (and even convenient) to use a for loop.
 */
export const retryUntil = (maxAttempts: number, attempt: (attemptNumber: number) => boolean): number => {
  for (let i = 1; i <= maxAttempts; i++) {
    if (attempt(i)) {
      return i;
    }
  }
  return -1;
};

// ============================================================
// Self-check – run:  npm run exercise -- 02 02
// On every line, the value left of "=> expected:" must equal the value on its right.
// (No need to change the code below this line)
// ============================================================

const sampleRuns: RunResult[] = [
  { name: "login", status: "passed", durationMs: 1200 },
  { name: "search", status: "failed", durationMs: 3400 },
  { name: "cart", status: "skipped", durationMs: 0 },
  { name: "checkout", status: "passed", durationMs: 5100 },
  { name: "logout", status: "failed", durationMs: 500 },
];

/** Shortcut for creating a RunResult in the checks */
const run = (name: string, status: RunResult["status"], durationMs = 100): RunResult => ({
  name,
  status,
  durationMs,
});

console.log("\n--- Exercise 1: toSeconds ---");
try {
  console.log(toSeconds([1500, 200, 3000]), "=> expected:", [1.5, 0.2, 3]);
  console.log(toSeconds([0]), "=> expected:", [0]);
  console.log(toSeconds([]), "=> expected:", []);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 2: firstSlowTest ---");
try {
  console.log(firstSlowTest(sampleRuns, 3000), "=> expected:", "search");
  console.log(firstSlowTest(sampleRuns, 1000), "=> expected:", "login");
  console.log(firstSlowTest(sampleRuns, 5100), "=> expected:", undefined); // "greater than" – not "equal to"
  console.log(firstSlowTest([], 0), "=> expected:", undefined);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 3: isRunGreen ---");
try {
  console.log(isRunGreen([run("a", "passed"), run("b", "skipped")]), "=> expected:", true);
  console.log(isRunGreen([run("a", "passed"), run("b", "failed")]), "=> expected:", false);
  console.log(isRunGreen([run("a", "skipped"), run("b", "skipped")]), "=> expected:", false);
  console.log(isRunGreen([]), "=> expected:", false);
  console.log(isRunGreen(sampleRuns), "=> expected:", false);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 4: countByStatus ---");
try {
  console.log(countByStatus(sampleRuns), "=> expected:", { passed: 2, failed: 2, skipped: 1 });
  console.log(countByStatus([]), "=> expected:", { passed: 0, failed: 0, skipped: 0 });
  console.log(countByStatus([run("a", "skipped")]), "=> expected:", { passed: 0, failed: 0, skipped: 1 });
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 5: slowestTests ---");
try {
  const input = [run("a", "passed", 100), run("b", "failed", 900), run("c", "passed", 500)];
  console.log(slowestTests(input, 2), "=> expected:", ["b", "c"]);
  // The original array must not change (sort a copy!)
  console.log(input.map((x) => x.name), "=> expected:", ["a", "b", "c"]);
  console.log(slowestTests(sampleRuns, 3), "=> expected:", ["checkout", "search", "login"]);
  console.log(slowestTests(input, 10), "=> expected:", ["b", "c", "a"]);
  console.log(slowestTests(input, 0), "=> expected:", []);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 6 (Bonus): retryUntil ---");
try {
  const calls: number[] = [];
  const result = retryUntil(5, (n) => {
    calls.push(n);
    return n === 3;
  });
  console.log(result, "=> expected:", 3);
  // After the first success – attempt is not called again
  console.log(calls, "=> expected:", [1, 2, 3]);

  const neverCalls: number[] = [];
  const neverResult = retryUntil(2, (n) => {
    neverCalls.push(n);
    return false;
  });
  console.log(neverResult, "=> expected:", -1);
  console.log(neverCalls, "=> expected:", [1, 2]);

  console.log(retryUntil(0, () => true), "=> expected:", -1);
  console.log(retryUntil(3, () => true), "=> expected:", 1);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}
