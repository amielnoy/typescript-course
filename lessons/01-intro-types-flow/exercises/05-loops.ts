// Lesson 1 – Topic 05: Loops – Exercises
// ------------------------------------------------------------
// Instructions:
//   1. Complete the body of each function in place of the line  throw new Error("TODO")
//   2. Function syntax itself is taught in the next lesson – here, just write the code inside.
//   3. Use only what has been taught up to this topic (see examples/05-loops.ts) – i.e. loops,
//      not methods like filter / map / indexOf.
//   4. Check yourself: npm run exercise -- 01 05 (self-check at the end of the file)
// ------------------------------------------------------------

/**
 * Exercise 1 – Count results by status (for...of)
 * Return how many times status appears in the results array.
 * Examples:
 *   (["passed", "failed", "passed"], "passed") => 2
 *   (["passed"], "skipped")                    => 0
 *   ([], "failed")                             => 0
 */
export function countByStatus(results: string[], status: string): number {
  for (const result of results) {
    if (result === status) {
      return results.filter((r) => r === status).length;
    }
  }
  return 0;
}

/**
 * Exercise 2 – The index of the first failure (classic for + break / return)
 * Return the index of the first "failed" in the array, or -1 if there are no failures.
 * Examples:
 *   ["passed", "failed", "failed"] => 1
 *   ["passed", "skipped"]          => -1
 *   []                             => -1
 */
export function findFirstFailure(results: string[]): number {
  for (let i = 0; i < results.length; i++) {
    if (results[i] === "failed") {
      return i;
    }
  }
  return -1;
}

/**
 * Exercise 3 – Print a configuration (for...in)
 * Go over the object's keys and return an array of strings in the format "key=value",
 * in the order of the keys in the object.
 * Example: { browser: "chromium", headless: true, retries: 2 }
 *        => ["browser=chromium", "headless=true", "retries=2"]
 * Empty object => []
 */
export function describeConfig(config: Record<string, string | number | boolean>): string[] {
  for(const key in config) {
    return Object.keys(config).map((key) => `${key}=${config[key]}`);
  }
  return [];  
}

/**
 * Exercise 4 – Retry until success (while)
 * outcomes[i] is the result of attempt number i+1 (true = succeeded).
 * Keep retrying as long as you haven't succeeded, haven't exceeded maxAttempts, and there are results left in the array.
 * Return the attempt number (starting from 1) that succeeded, or -1 if you didn't succeed.
 * Examples:
 *   ([false, false, true], 5) => 3
 *   ([false, false, true], 2) => -1   (success only on attempt 3, but only 2 are allowed)
 *   ([true], 3)               => 1
 *   ([false, false], 5)       => -1   (ran out of results)
 */
export function attemptsUntilSuccess(outcomes: boolean[], maxAttempts: number): number {
  let attempt = 0;
  while (attempt < outcomes.length && attempt < maxAttempts) {
    if (outcomes[attempt]) {
      return attempt + 1; // Return the attempt number (1-based)
    }
    attempt++;
  }
  return -1; // No success within the allowed attempts  
}

/**
 * Exercise 5 – Browser × operating system run matrix (nested loop)
 * Return all combinations in the format "browser/os", first by browser and then by operating system.
 * Example: (["chromium", "firefox"], ["windows", "linux"])
 *        => ["chromium/windows", "chromium/linux", "firefox/windows", "firefox/linux"]
 * If either array is empty => []
 */
export function buildRunMatrix(browsers: string[], systems: string[]): string[] {
  const matrix: string[] = [];
  for (const browser of browsers) {
    for (const system of systems) {
      matrix.push(`${browser}/${system}`);
    }
  }
  return matrix;
}

/**
 * Exercise 6 (Bonus) – The longest failure streak (continue)
 * Return the length of the longest streak of "failed" in the sequence of results.
 *   - "passed" breaks the streak (start counting again)
 *   - "skipped" doesn't count and doesn't break the streak – skip it with continue
 * Examples:
 *   ["failed", "failed", "passed", "failed"]            => 2
 *   ["failed", "skipped", "failed", "passed", "failed"] => 2
 *   ["passed", "skipped"]                               => 0
 */
export function longestFailStreak(results: string[]): number {
  if (results.length === 0) {
    return 0;
  }

  let longestStreak = 0;
  let currentStreak = 0;

  for (const result of results) {
    if (result === "skipped") {
      continue; // Skip "skipped" results
    } else if (result === "failed") {
      currentStreak++;
      if (currentStreak > longestStreak) {
        longestStreak = currentStreak;
      }
    } else {
      currentStreak = 0; // Reset streak on "passed"
    }
  }
  return longestStreak;
}

// ============================================================
// Self-check – run:  npm run exercise -- 01 05
// On every line, the value left of "=> expected:" must equal the value on its right.
// (No need to change the code below this line)
// ============================================================

console.log("\n--- Exercise 1: countByStatus ---");
try {
  console.log(countByStatus(["passed", "failed", "passed"], "passed"), "=> expected:", 2);
  console.log(countByStatus(["passed", "failed", "passed"], "failed"), "=> expected:", 1);
  console.log(countByStatus(["passed"], "skipped"), "=> expected:", 0);
  console.log(countByStatus([], "failed"), "=> expected:", 0);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 2: findFirstFailure ---");
try {
  console.log(findFirstFailure(["passed", "failed", "failed"]), "=> expected:", 1);
  console.log(findFirstFailure(["failed"]), "=> expected:", 0);
  console.log(findFirstFailure(["passed", "skipped", "passed", "failed"]), "=> expected:", 3);
  console.log(findFirstFailure(["passed", "skipped"]), "=> expected:", -1);
  console.log(findFirstFailure([]), "=> expected:", -1);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 3: describeConfig ---");
try {
  console.log(describeConfig({ browser: "chromium", headless: true, retries: 2 }), "=> expected:", [
    "browser=chromium",
    "headless=true",
    "retries=2",
  ]);
  console.log(describeConfig({ workers: 0 }), "=> expected:", ["workers=0"]);
  console.log(describeConfig({}), "=> expected:", []);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 4: attemptsUntilSuccess ---");
try {
  console.log(attemptsUntilSuccess([false, false, true], 5), "=> expected:", 3);
  console.log(attemptsUntilSuccess([false, false, true], 3), "=> expected:", 3); // exactly at the boundary
  console.log(attemptsUntilSuccess([false, false, true], 2), "=> expected:", -1);
  console.log(attemptsUntilSuccess([true], 3), "=> expected:", 1);
  console.log(attemptsUntilSuccess([false, false], 5), "=> expected:", -1);
  console.log(attemptsUntilSuccess([], 5), "=> expected:", -1);
  console.log(attemptsUntilSuccess([true], 0), "=> expected:", -1);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 5: buildRunMatrix ---");
try {
  console.log(buildRunMatrix(["chromium", "firefox"], ["windows", "linux"]), "=> expected:", [
    "chromium/windows",
    "chromium/linux",
    "firefox/windows",
    "firefox/linux",
  ]);
  console.log(buildRunMatrix(["webkit"], ["macos"]), "=> expected:", ["webkit/macos"]);
  console.log(buildRunMatrix([], ["linux"]), "=> expected:", []);
  console.log(buildRunMatrix(["chromium"], []), "=> expected:", []);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 6 (Bonus): longestFailStreak ---");
try {
  console.log(longestFailStreak(["failed", "failed", "passed", "failed"]), "=> expected:", 2);
  console.log(longestFailStreak(["failed", "skipped", "failed", "passed", "failed"]), "=> expected:", 2);
  console.log(longestFailStreak(["passed", "failed", "failed", "skipped", "failed"]), "=> expected:", 3);
  console.log(longestFailStreak(["passed", "skipped"]), "=> expected:", 0);
  console.log(longestFailStreak([]), "=> expected:", 0);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}
