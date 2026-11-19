// Lesson 1 – Topic 05: Loops – Solutions

export function countByStatus(results: string[], status: string): number {
  let count = 0;
  for (const result of results) {
    if (result === status) count++;
  }
  return count;
}

export function findFirstFailure(results: string[]): number {
  // We need the index – so a classic for and not for...of
  for (let i = 0; i < results.length; i++) {
    if (results[i] === "failed") {
      return i; // return also stops the loop (like break)
    }
  }
  return -1;
}

export function describeConfig(config: Record<string, string | number | boolean>): string[] {
  const lines: string[] = [];
  for (const key in config) {
    lines.push(`${key}=${config[key]}`);
  }
  return lines;
}

export function attemptsUntilSuccess(outcomes: boolean[], maxAttempts: number): number {
  let attempt = 0;
  while (attempt < maxAttempts && attempt < outcomes.length) {
    attempt++;
    if (outcomes[attempt - 1]) {
      return attempt;
    }
  }
  return -1;
}

export function buildRunMatrix(browsers: string[], systems: string[]): string[] {
  const runs: string[] = [];
  for (const browser of browsers) {
    for (const os of systems) {
      runs.push(`${browser}/${os}`);
    }
  }
  return runs;
}

export function longestFailStreak(results: string[]): number {
  let longest = 0;
  let current = 0;
  for (const result of results) {
    if (result === "skipped") continue; // don't count it and don't break the streak
    if (result === "failed") {
      current++;
      if (current > longest) longest = current;
    } else {
      current = 0;
    }
  }
  return longest;
}

// ============================================================
// Self-check – run:  npm run solution -- 01 05
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
