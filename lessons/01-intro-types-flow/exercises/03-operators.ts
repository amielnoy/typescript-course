// Lesson 1 – Topic 03: Operators – Exercises
// ------------------------------------------------------------
// Instructions:
//   1. Complete the body of each function in place of the line  throw new Error("TODO")
//   2. Function syntax itself is taught in the next lesson – here, just write the code inside.
//   3. Use only what has been taught up to this topic (see examples/03-operators.ts).
//      We haven't learned if yet – try to solve everything with operators (including the ternary ? :).
//   4. Check yourself: npm run exercise -- 01 03 (self-check at the end of the file)
// ------------------------------------------------------------

/**
 * Exercise 1 – Pass rate
 * Return the percentage of tests that passed, rounded to 2 decimal places.
 * If total is 0 – return 0 (no dividing by 0!).
 * Examples: (47, 50) => 94,  (1, 3) => 33.33,  (2, 3) => 66.67,  (0, 0) => 0
 * Hint: Math.round(x * 100) / 100  rounds to 2 decimal places. Use a ternary operator for total === 0.
 */
export function calcPassRate(passed: number, total: number): number {
  return total === 0 ? 0 : Math.round((passed / total) * 100 * 100) / 100;
}

/**
 * Exercise 2 – Display run duration in minutes and seconds
 * Take a duration in milliseconds and return text in the format "<minutes>m <seconds>s" (whole seconds only).
 * Examples: 65000 => "1m 5s",  999 => "0m 0s",  125500 => "2m 5s",  3600000 => "60m 0s"
 * Hints: Math.floor(...) to round down, and % for the remainder (60 seconds in a minute).
 */
export function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}m ${seconds}s`;
}

/**
 * Exercise 3 – Delay between retries (Exponential backoff)
 * Each attempt waits twice as long as the previous one: attempt 1 => baseMs, attempt 2 => baseMs*2, attempt 3 => baseMs*4 ...
 * Examples: (1, 500) => 500,  (3, 500) => 2000,  (5, 100) => 1600
 * Hint: the exponentiation operator **
 */
export function backoffDelay(attempt: number, baseMs: number): number {
  return baseMs * 2 ** (attempt - 1);
}

/**
 * Exercise 4 – Compare expected vs. actual status code
 * If they are equal – return "PASS".
 * Otherwise – return "FAIL: expected <expected>, got <actual>".
 * Examples: (200, 200) => "PASS",  (200, 404) => "FAIL: expected 200, got 404"
 * Hint: === and the ternary operator.
 */
export function checkStatus(expected: number, actual: number): string {
  return expected === actual ? "PASS" : `FAIL: expected ${expected}, got ${actual}`;
}

/**
 * Exercise 5 – Are we allowed to run the Admin tests?
 * Allowed only if the user is logged in, AND is an admin, AND the system is not in maintenance mode.
 * Examples: (true, true, false) => true,  (true, true, true) => false,  (false, true, false) => false
 * Hint: && and !
 */
export function canRunAdminTests(isLoggedIn: boolean, isAdmin: boolean, isMaintenance: boolean): boolean {
  return isLoggedIn && isAdmin && !isMaintenance;
}

/**
 * Exercise 6 (Bonus) – User name from an API response that may have missing parts
 * Return response.data.user.name. If any part along the way is missing – return "anonymous".
 * Note: an empty name "" is a valid value and must be returned as is (not "anonymous")!
 * Examples:
 *   { data: { user: { name: "Dana" } } } => "Dana"
 *   { data: {} }                         => "anonymous"
 *   {}                                   => "anonymous"
 *   { data: { user: { name: "" } } }     => ""
 * Hint: ?. and ?? (not ||)
 */
export function getUserName(response: { data?: { user?: { name: string } } }): string {
  return response.data?.user?.name ?? "anonymous";
}


// ============================================================
// Self-check – run:  npm run exercise -- 01 03
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
