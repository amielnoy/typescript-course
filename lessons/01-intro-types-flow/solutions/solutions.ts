// Lesson 1 – Summary solutions
export enum Severity {
  Low = "LOW",
  Medium = "MEDIUM",
  High = "HIGH",
  Critical = "CRITICAL",
}

export function classifyStatus(code: number): string {
  if (code >= 200 && code <= 299) return "success";
  if (code >= 300 && code <= 399) return "redirect";
  if (code >= 400 && code <= 499) return "client-error";
  if (code >= 500 && code <= 599) return "server-error";
  return "unknown";
}

export function totalDuration(durations: number[]): number {
  let sum = 0;
  for (const d of durations) {
    sum += d;
  }
  return sum;
}

export function countBySeverity(bugs: Severity[]): Record<Severity, number> {
  const counts: Record<Severity, number> = { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 } as Record<Severity, number>;
  for (const severity of bugs) {
    counts[severity]++;
  }
  return counts;
}

export function buildTestIds(n: number): string[] {
  const ids: string[] = [];
  for (let i = 1; i <= n; i++) {
    ids.push(`TC-${String(i).padStart(3, "0")}`);
  }
  return ids;
}

export function isValidPassword(password: string): boolean {
  if (password.length < 8) return false;
  let hasDigit = false;
  let hasUpper = false;
  for (const char of password) {
    if (char >= "0" && char <= "9") hasDigit = true;
    if (char >= "A" && char <= "Z") hasUpper = true;
  }
  return hasDigit && hasUpper;
}

export function resolveTimeout(value: number | null | undefined): number {
  return value ?? 30000; // ?? not || – so that 0 stays 0
}

// ============================================================
// Self-check – run:  npm run solution -- 01
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
