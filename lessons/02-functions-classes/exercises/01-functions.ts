// Lesson 2 – Topic 01: Functions, Parameters and Return Values – Exercises
// ------------------------------------------------------------
// Instructions:
//   1. Complete the body of each function in place of the line  throw new Error("TODO")
//   2. Use only what we have learned so far: types for parameters and the return value, void,
//      optional parameter (?), default value, rest (...), returning an object,
//      function expression and function types.
//   3. Check yourself: npm run exercise -- 02 01 (self-check at the end of the file)
// ------------------------------------------------------------

/** Type of a check function on a text value (as in the example) */
export type Validator = (value: string) => boolean;

/**
 * Exercise 1 – Delay between retries (default value)
 * When a check fails we try again, and each time we wait twice as long.
 * The delay for attempt number `attempt` is:  baseMs * 2^(attempt - 1)
 * If baseMs is not passed – the default is 100.
 *
 *   retryDelay(1)       => 100
 *   retryDelay(3)       => 400
 *   retryDelay(3, 50)   => 200
 *
 * Hint: 2 ** n  or  Math.pow(2, n)
 */
export function retryDelay(attempt: number, baseMs: number = 100): number {
  return baseMs * 2 ** (attempt - 1);
}

/**
 * Exercise 2 – A void function: adding a numbered step to a list of steps
 * The function returns nothing – it adds (push) to the end of the steps array
 * a string in the format "<number>. <description>", where the number is the step's position in the list (starting from 1).
 *
 *   const steps: string[] = [];
 *   addStep(steps, "Open /login");     // steps => ["1. Open /login"]
 *   addStep(steps, "Click Login");     // steps => ["1. Open /login", "2. Click Login"]
 */
export function addStep(steps: string[], description: string): void {
  const stepNumber = steps.length + 1;
  steps.push(`${stepNumber}. ${description}`);
}

/**
 * Exercise 3 – Log line: default value + optional parameter
 * - level defaults to "INFO"
 * - testName is optional – if passed, it appears in parentheses after the level
 *
 *   formatLogLine("Server started")                     => "[INFO] Server started"
 *   formatLogLine("Slow response", "WARN")              => "[WARN] Slow response"
 *   formatLogLine("Timeout", "ERROR", "login")          => "[ERROR] (login) Timeout"
 *
 * Hint: to pass testName without changing level you can write
 *      formatLogLine("msg", undefined, "login")  – and then level gets its default value.
 */
export function formatLogLine(
  message: string,
  level: "INFO" | "WARN" | "ERROR" = "INFO",
  testName?: string,
): string {
  return `[${level}]${testName ? ` (${testName})` : ""} ${message}`;
}

/**
 * Exercise 4 – rest + returning an object: summarizing API status codes
 * The function receives an unknown number of HTTP status codes and returns an object:
 *   success – how many codes are in the range 200-299
 *   clientErrors – how many codes are in the range 400-499
 *   serverErrors – how many codes are in the range 500-599
 * (Other codes, e.g. 301, are not counted in any group)
 *
 *   summarizeStatuses(200, 201, 404, 500, 503)
 *     => { success: 2, clientErrors: 1, serverErrors: 2 }
 *   summarizeStatuses()  => { success: 0, clientErrors: 0, serverErrors: 0 }
 */
export function summarizeStatuses(...codes: number[]): {
  success: number;
  clientErrors: number;
  serverErrors: number;
} {
  for (const code of codes) {
    if (code < 100 || code > 599) {
      throw new Error(`Invalid status code: ${code}`);
    }
  }

  const summary = {
    success: 0,
    clientErrors: 0,
    serverErrors: 0,
  };

  for (const code of codes) {
    if (code >= 200 && code <= 299) {
      summary.success++;
    } else if (code >= 400 && code <= 499) {
      summary.clientErrors++;
    } else if (code >= 500 && code <= 599) {
      summary.serverErrors++;
    }
  }
  
  return summary;
}

/**
 * Exercise 5 – Functions as parameters: how many validation checks failed?
 * value is a value entered into a form field, and checks are check functions (Validator).
 * Run each of them on value and return how many of them returned false.
 *
 *   const notEmpty: Validator = function (v) { return v.trim().length > 0; };
 *   const hasAt: Validator = function (v) { return v.includes("@"); };
 *   countFailedChecks("noa@example.com", notEmpty, hasAt)  => 0
 *   countFailedChecks("noa", notEmpty, hasAt)              => 1
 *   countFailedChecks("   ", notEmpty, hasAt)              => 2
 *   countFailedChecks("anything")                          => 0   (no checks)
 */
export function countFailedChecks(value: string, ...checks: Validator[]): number {
  let failedCount = 0;
  for (const check of checks) {
    if (!check(value)) {
      failedCount++;
    }
  }
  return failedCount;
}

/**
 * Exercise 6 (Bonus) – A function that returns a function
 * Return a new Validator that checks that the text length (after trim) is between min and max (inclusive).
 *
 *   const usernameRule = createLengthValidator(3, 8);
 *   usernameRule("noa")         => true
 *   usernameRule("  ab  ")      => false   (after trim the length is 2)
 *   usernameRule("verylongname") => false
 *
 * Hint: return function (value) { ... };   – exactly like the function expression from the example.
 */
export function createLengthValidator(min: number, max: number): Validator {
  return function (value: string): boolean {
    const length = value.trim().length;
    return length >= min && length <= max;
  }
}

// ============================================================
// Self-check – run:  npm run exercise -- 02 01
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
