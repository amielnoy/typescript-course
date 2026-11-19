// Lesson 2 – Topic 01: Functions – Solutions
export type Validator = (value: string) => boolean;

export function retryDelay(attempt: number, baseMs: number = 100): number {
  return baseMs * 2 ** (attempt - 1);
}

// void – we don't return a value, we only modify the array we received
export function addStep(steps: string[], description: string): void {
  steps.push(`${steps.length + 1}. ${description}`);
}

export function formatLogLine(
  message: string,
  level: "INFO" | "WARN" | "ERROR" = "INFO",
  testName?: string,
): string {
  const prefix = testName ? `[${level}] (${testName})` : `[${level}]`;
  return `${prefix} ${message}`;
}

// rest – codes is a regular array of number
export function summarizeStatuses(...codes: number[]): {
  success: number;
  clientErrors: number;
  serverErrors: number;
} {
  let success = 0;
  let clientErrors = 0;
  let serverErrors = 0;
  for (const code of codes) {
    if (code >= 200 && code <= 299) success++;
    else if (code >= 400 && code <= 499) clientErrors++;
    else if (code >= 500 && code <= 599) serverErrors++;
  }
  return { success, clientErrors, serverErrors };
}

export function countFailedChecks(value: string, ...checks: Validator[]): number {
  let failed = 0;
  for (const check of checks) {
    if (!check(value)) failed++;
  }
  return failed;
}

// The inner function "remembers" min and max even after the outer one has finished
export function createLengthValidator(min: number, max: number): Validator {
  return function (value) {
    const length = value.trim().length;
    return length >= min && length <= max;
  };
}

// ============================================================
// Self-check – run:  npm run solution -- 02 01
// On every line, the value left of "=> expected:" must equal the value on its right.
// (No need to change the code below this line)
// ============================================================

console.log("\n--- Exercise 1: retryDelay ---");
try {
  console.log(retryDelay(1), "=> expected:", 100);
  console.log(retryDelay(2), "=> expected:", 200);
  console.log(retryDelay(3), "=> expected:", 400);
  console.log(retryDelay(3, 50), "=> expected:", 200);
  console.log(retryDelay(1, 250), "=> expected:", 250);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 2: addStep ---");
try {
  const steps: string[] = [];
  const returned = addStep(steps, "Open /login");
  console.log(returned, "=> expected:", undefined);
  console.log(steps, "=> expected:", ["1. Open /login"]);
  addStep(steps, "Type username");
  addStep(steps, "Click Login");
  console.log(steps, "=> expected:", ["1. Open /login", "2. Type username", "3. Click Login"]);

  const existing = ["1. Already there"];
  addStep(existing, "Next");
  console.log(existing, "=> expected:", ["1. Already there", "2. Next"]);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 3: formatLogLine ---");
try {
  console.log(formatLogLine("Server started"), "=> expected:", "[INFO] Server started");
  console.log(formatLogLine("Slow response", "WARN"), "=> expected:", "[WARN] Slow response");
  console.log(formatLogLine("Timeout", "ERROR", "login"), "=> expected:", "[ERROR] (login) Timeout");
  console.log(formatLogLine("Page loaded", undefined, "search"), "=> expected:", "[INFO] (search) Page loaded");
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 4: summarizeStatuses ---");
try {
  console.log(summarizeStatuses(200, 201, 404, 500, 503), "=> expected:", {
    success: 2,
    clientErrors: 1,
    serverErrors: 2,
  });
  console.log(summarizeStatuses(), "=> expected:", { success: 0, clientErrors: 0, serverErrors: 0 });
  console.log(summarizeStatuses(301, 199, 299, 400, 499, 600), "=> expected:", {
    success: 1,
    clientErrors: 2,
    serverErrors: 0,
  });
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 5: countFailedChecks ---");
try {
  const notEmpty: Validator = function (v) {
    return v.trim().length > 0;
  };
  const hasAt: Validator = function (v) {
    return v.includes("@");
  };
  console.log(countFailedChecks("noa@example.com", notEmpty, hasAt), "=> expected:", 0);
  console.log(countFailedChecks("noa", notEmpty, hasAt), "=> expected:", 1);
  console.log(countFailedChecks("   ", notEmpty, hasAt), "=> expected:", 2);
  console.log(countFailedChecks("anything"), "=> expected:", 0);
  console.log(countFailedChecks("", notEmpty, notEmpty, notEmpty), "=> expected:", 3);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 6 (Bonus): createLengthValidator ---");
try {
  const usernameRule = createLengthValidator(3, 8);
  console.log(typeof usernameRule, "=> expected:", "function");
  console.log(usernameRule("noa"), "=> expected:", true);
  console.log(usernameRule("12345678"), "=> expected:", true);
  console.log(usernameRule("  ab  "), "=> expected:", false);
  console.log(usernameRule("verylongname"), "=> expected:", false);
  console.log(usernameRule(""), "=> expected:", false);

  const exact = createLengthValidator(4, 4);
  console.log(exact("1234"), "=> expected:", true);
  console.log(exact("123"), "=> expected:", false);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}
