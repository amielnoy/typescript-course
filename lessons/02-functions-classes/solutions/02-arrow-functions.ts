// Lesson 2 – Topic 02: Arrow Functions and Array Methods – Solutions
export interface RunResult {
  name: string;
  status: "passed" | "failed" | "skipped";
  durationMs: number;
}

export const toSeconds = (durationsMs: number[]): number[] => durationsMs.map((ms) => ms / 1000);

// find returns the element or undefined – hence ?.name
export const firstSlowTest = (results: RunResult[], thresholdMs: number): string | undefined =>
  results.find((r) => r.durationMs > thresholdMs)?.name;

export const isRunGreen = (results: RunResult[]): boolean =>
  results.every((r) => r.status !== "failed") && results.some((r) => r.status === "passed");

export const countByStatus = (
  results: RunResult[],
): { passed: number; failed: number; skipped: number } =>
  results.reduce(
    (acc, r) => {
      acc[r.status]++;
      return acc;
    },
    { passed: 0, failed: 0, skipped: 0 },
  );

// Sort a copy ([...results]) so the original array is not changed
export const slowestTests = (results: RunResult[], limit: number): string[] =>
  [...results]
    .sort((a, b) => b.durationMs - a.durationMs)
    .slice(0, limit)
    .map((r) => r.name);

export const retryUntil = (maxAttempts: number, attempt: (attemptNumber: number) => boolean): number => {
  for (let n = 1; n <= maxAttempts; n++) {
    if (attempt(n)) return n; // return exits immediately – attempt is not called again
  }
  return -1;
};

// ============================================================
// Self-check – run:  npm run solution -- 02 02
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
