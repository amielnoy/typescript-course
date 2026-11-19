// Lesson 1 – Summary exercises
// ------------------------------------------------------------
// Instructions:
//   1. Complete the body of each function in place of the line  throw new Error("TODO")
//   2. Function syntax itself is taught in the next lesson – here, just write the code inside.
//   3. Check yourself: npm run exercise -- 01 (self-check at the end of the file)
// ------------------------------------------------------------

export enum Severity {
  Low = "LOW",
  Medium = "MEDIUM",
  High = "HIGH",
  Critical = "CRITICAL",
}

/**
 * Exercise 1 – Classify an HTTP status code
 * Return:
 *   "success"       for 200-299
 *   "redirect"      for 300-399
 *   "client-error"  for 400-499
 *   "server-error"  for 500-599
 *   "unknown"       for any other value
 */
export function classifyStatus(code: number): string {
  if (code >= 200 && code <= 299) {
    return "success";
  } else if (code >= 300 && code <= 399) {
    return "redirect";
  } else if (code >= 400 && code <= 499) {
    return "client-error";
  } else if (code >= 500 && code <= 599) {
    return "server-error";
  } else {
    return "unknown";
  }

}

/**
 * Exercise 2 – Sum of run durations
 * Take an array of run durations (in milliseconds) and return their sum.
 * Empty array => 0. Use a for...of loop.
 */
export function totalDuration(durations: number[]): number {
  let sum = 0;
  for (const duration of durations) {
    sum += duration;
  }
  return sum;
}

/**
 * Exercise 3 – Count bugs by severity
 * Take an array of severities and return an object with a count for each severity.
 * Example: [High, Low, High] => { LOW: 1, MEDIUM: 0, HIGH: 2, CRITICAL: 0 }
 */
export function countBySeverity(bugs: Severity[]): Record<Severity, number> {
  const counts: Record<Severity, number> = {
    [Severity.Low]: 0,
    [Severity.Medium]: 0,
    [Severity.High]: 0,
    [Severity.Critical]: 0,
  };
  for (const severity of bugs) {
    counts[severity]++;
  }
  return counts;  
}

/**
 * Exercise 4 – Generate test IDs
 * For n=3 return ["TC-001", "TC-002", "TC-003"].
 * Hint: String(num).padStart(3, "0")
 */
export function buildTestIds(n: number): string[] {
  const testIds: string[] = [];
  for (let i = 1; i <= n; i++) {
    const paddedNumber = String(i).padStart(3, "0");
    testIds.push(`TC-${paddedNumber}`);
  }
  return testIds;
}

/**
 * Exercise 5 – Password validation
 * A password is valid if:
 *   - it is at least 8 characters long
 *   - it contains at least one digit
 *   - it contains at least one uppercase letter (A-Z)
 * Go over the characters in a loop. Hint: char >= "0" && char <= "9"
 */
export function isValidPassword(password: string): boolean {
  if (password.length < 8) {
    return false;
  }

  let hasDigit = false;
  let hasUppercase = false;

  for (const char of password) {
    if (char >= "0" && char <= "9") {
      hasDigit = true;
    } else if (char >= "A" && char <= "Z") {
      hasUppercase = true;
    }
  }

  return hasDigit && hasUppercase;
}

/**
 * Exercise 6 (Bonus) – Default value for timeout
 * If the given value is undefined or null – return 30000.
 * Otherwise return the value (even if it is 0!). Use the appropriate operator.
 */
export function resolveTimeout(value: number | null | undefined): number {
  throw new Error("TODO");
}

// ============================================================
// Self-check – run:  npm run exercise -- 01
// On every line, the value left of "=> expected:" must equal the value on its right.
// (No need to change the code below this line)
// ============================================================

console.log("\n--- Exercise 1: classifyStatus ---");
try {
  console.log(classifyStatus(200), "=> expected:", "success");
  console.log(classifyStatus(299), "=> expected:", "success");
  console.log(classifyStatus(301), "=> expected:", "redirect");
  console.log(classifyStatus(404), "=> expected:", "client-error");
  console.log(classifyStatus(503), "=> expected:", "server-error");
  console.log(classifyStatus(99), "=> expected:", "unknown");
  console.log(classifyStatus(600), "=> expected:", "unknown");
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 2: totalDuration ---");
try {
  console.log(totalDuration([]), "=> expected:", 0);
  console.log(totalDuration([100, 250, 50]), "=> expected:", 400);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 3: countBySeverity ---");
try {
  console.log(countBySeverity([Severity.High, Severity.Low, Severity.High]), "=> expected:", {
    LOW: 1,
    MEDIUM: 0,
    HIGH: 2,
    CRITICAL: 0,
  });
  console.log(countBySeverity([]), "=> expected:", { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 });
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 4: buildTestIds ---");
try {
  console.log(buildTestIds(3), "=> expected:", ["TC-001", "TC-002", "TC-003"]);
  console.log(buildTestIds(0), "=> expected:", []);
  console.log(buildTestIds(120)[119], "=> expected:", "TC-120");
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 5: isValidPassword ---");
try {
  console.log(isValidPassword("Secret123"), "=> expected:", true);
  console.log(isValidPassword("short1A"), "=> expected:", false); // too short
  console.log(isValidPassword("nouppercase1"), "=> expected:", false);
  console.log(isValidPassword("NoDigitsHere"), "=> expected:", false);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 6 (Bonus): resolveTimeout ---");
try {
  console.log(resolveTimeout(undefined), "=> expected:", 30000);
  console.log(resolveTimeout(null), "=> expected:", 30000);
  console.log(resolveTimeout(0), "=> expected:", 0);
  console.log(resolveTimeout(5000), "=> expected:", 5000);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}
