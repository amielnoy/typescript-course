// Lesson 1 – Topic 03: Operators – Solutions

export function calcPassRate(passed: number, total: number): number {
  // The ternary guards against division by 0 (which would return NaN)
  return total === 0 ? 0 : Math.round((passed / total) * 100 * 100) / 100;
}

export function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60; // % = the remainder after dividing by 60
  return `${minutes}m ${seconds}s`;
}

export function backoffDelay(attempt: number, baseMs: number): number {
  return baseMs * 2 ** (attempt - 1);
}

export function checkStatus(expected: number, actual: number): string {
  return expected === actual ? "PASS" : `FAIL: expected ${expected}, got ${actual}`;
}

export function canRunAdminTests(isLoggedIn: boolean, isAdmin: boolean, isMaintenance: boolean): boolean {
  return isLoggedIn && isAdmin && !isMaintenance;
}

export function getUserName(response: { data?: { user?: { name: string } } }): string {
  // ?. stops and returns undefined if a part is missing; ?? replaces only null/undefined (so "" stays "")
  return response.data?.user?.name ?? "anonymous";
}

// ============================================================
// Self-check – run:  npm run solution -- 01 03
// On every line, the value left of "=> expected:" must equal the value on its right.
// (No need to change the code below this line)
// ============================================================

console.log("\n--- Exercise 1: calcPassRate ---");
try {
  console.log(calcPassRate(47, 50), "=> expected:", 94);
  console.log(calcPassRate(1, 3), "=> expected:", 33.33);
  console.log(calcPassRate(2, 3), "=> expected:", 66.67);
  console.log(calcPassRate(5, 5), "=> expected:", 100);
  console.log(calcPassRate(0, 10), "=> expected:", 0);
  console.log(calcPassRate(0, 0), "=> expected:", 0); // no division by 0 (not NaN)
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 2: formatDuration ---");
try {
  console.log(formatDuration(65000), "=> expected:", "1m 5s");
  console.log(formatDuration(0), "=> expected:", "0m 0s");
  console.log(formatDuration(999), "=> expected:", "0m 0s");
  console.log(formatDuration(59999), "=> expected:", "0m 59s");
  console.log(formatDuration(60000), "=> expected:", "1m 0s");
  console.log(formatDuration(125500), "=> expected:", "2m 5s");
  console.log(formatDuration(3600000), "=> expected:", "60m 0s");
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 3: backoffDelay ---");
try {
  console.log(backoffDelay(1, 500), "=> expected:", 500);
  console.log(backoffDelay(2, 500), "=> expected:", 1000);
  console.log(backoffDelay(3, 500), "=> expected:", 2000);
  console.log(backoffDelay(5, 100), "=> expected:", 1600);
  console.log(backoffDelay(4, 0), "=> expected:", 0);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 4: checkStatus ---");
try {
  console.log(checkStatus(200, 200), "=> expected:", "PASS");
  console.log(checkStatus(200, 404), "=> expected:", "FAIL: expected 200, got 404");
  console.log(checkStatus(201, 500), "=> expected:", "FAIL: expected 201, got 500");
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 5: canRunAdminTests ---");
try {
  console.log(canRunAdminTests(true, true, false), "=> expected:", true);
  console.log(canRunAdminTests(true, true, true), "=> expected:", false);
  console.log(canRunAdminTests(true, false, false), "=> expected:", false);
  console.log(canRunAdminTests(false, true, false), "=> expected:", false);
  console.log(canRunAdminTests(false, false, true), "=> expected:", false);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 6 (Bonus): getUserName ---");
try {
  console.log(getUserName({ data: { user: { name: "Dana" } } }), "=> expected:", "Dana");
  console.log(JSON.stringify(getUserName({ data: { user: { name: "" } } })), "=> expected:", JSON.stringify("")); // ?? not ||
  console.log(getUserName({ data: {} }), "=> expected:", "anonymous");
  console.log(getUserName({}), "=> expected:", "anonymous");
} catch (e) {
  console.log("  ✋", (e as Error).message);
}
