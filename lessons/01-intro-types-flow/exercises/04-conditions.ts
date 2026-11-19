// Lesson 1 – Topic 04: Conditions – Exercises
// ------------------------------------------------------------
// Instructions:
//   1. Complete the body of each function in place of the line  throw new Error("TODO")
//   2. Function syntax itself is taught in the next lesson – here, just write the code inside.
//   3. Use only what has been taught up to this topic (see examples/04-conditions.ts).
//   4. Check yourself: npm run exercise -- 01 04 (self-check at the end of the file)
// ------------------------------------------------------------

export enum Priority {
  P1 = 1,
  P2,
  P3,
  P4,
}

/**
 * Exercise 1 – Browser engine (switch)
 * Return the engine name based on the browser name, case-insensitively:
 *   "chromium" / "chrome" / "edge"  => "Blink"
 *   "firefox"                       => "Gecko"
 *   "webkit" / "safari"             => "WebKit"
 *   anything else                   => "unknown"
 * Examples: "Chrome" => "Blink",  "SAFARI" => "WebKit",  "opera" => "unknown"
 * Hints: browser.toLowerCase(),  several cases in a row for the same code.
 */
export function getBrowserEngine(browser: string): string {
  switch (browser.toLowerCase()) {
    case "chromium":
    case "chrome":
    case "edge":
      return "Blink";
    case "firefox":
      return "Gecko";
    case "webkit":
    case "safari":
      return "WebKit";
    default:
      return "unknown";
  }
}


/**
 * Exercise 2 – Rate a response time (if / else if / else)
 *   negative number  => "invalid"
 *   less than 200    => "fast"
 *   less than 1000   => "acceptable"
 *   1000 and above   => "slow"
 * Examples: 199 => "fast",  200 => "acceptable",  999 => "acceptable",  1000 => "slow",  -5 => "invalid"
 * Watch the boundaries!
 */
export function rateResponseTime(ms: number): string {
  if (ms < 0) {
    return "invalid";
  } else if (ms < 200) {
    return "fast";
  } else if (ms < 1000) {
    return "acceptable";
  } else {
    return "slow";
  }
}

/**
 * Exercise 3 – What to do with a bug based on its priority (switch on an enum)
 *   P1 => "fix-now"
 *   P2 => "fix-this-sprint"
 *   P3 => "backlog"
 *   P4 => "wont-fix"
 */
export function getPriorityAction(priority: Priority): string {
  switch (priority) {
    case Priority.P1:
      return "fix-now";
    case Priority.P2:
      return "fix-this-sprint";
    case Priority.P3:
      return "backlog";
    case Priority.P4:
      return "wont-fix";
  }
}

/**
 * Exercise 4 – Error message (truthy / falsy)
 * If message is "falsy" (empty string, null or undefined) – return "No error message".
 * Otherwise – return "Error: <message>".
 * Examples: "Timeout" => "Error: Timeout",  "" => "No error message",  null => "No error message"
 * Food for thought: what is returned for "0"? (a non-empty string is truthy!)
 */
export function formatErrorMessage(message: string | null | undefined): string {
  if (!message) {
    return "No error message";
  }
  return `Error: ${message}`;
}

/**
 * Exercise 5 – Should we retry the request?
 *   - If attempt has already reached maxAttempts (or more) => false (out of attempts)
 *   - Otherwise: retry (true) only for the codes 429, 502, 503, 504
 *   - Any other code => false (no point retrying, e.g. 404 or 400)
 * Examples: (503, 1, 3) => true,  (503, 3, 3) => false,  (404, 1, 3) => false
 * Hint: an if to check the attempts, then a switch with several cases in a row.
 */
export function shouldRetry(statusCode: number, attempt: number, maxAttempts: number): boolean {
  if (attempt >= maxAttempts) {
    return false;
  }
  switch (statusCode) {
    case 429:
    case 502:
    case 503:
    case 504:
      return true;
    default:
      return false;
  }
}

/**
 * Exercise 6 (Bonus) – Release decision (Go / No-Go)
 * The rules are checked in order:
 *   1. There is at least one open critical bug          => "BLOCKED"
 *   2. The pass rate (passRate) is lower than 95        => "BLOCKED"
 *   3. There are more than 2 open high-severity bugs    => "NEEDS_REVIEW"
 *   4. Otherwise                                        => "GO"
 * Examples: (0, 0, 100) => "GO",  (1, 0, 100) => "BLOCKED",  (0, 3, 99) => "NEEDS_REVIEW",  (0, 2, 95) => "GO"
 */
export function releaseDecision(criticalBugs: number, highBugs: number, passRate: number): string {
  if(criticalBugs >= 1 )
    return "BLOCKED"
  else if(passRate<95)
    return "BLOCKED"
  else if (highBugs>2)
    return "NEEDS_REVIEW"
  else
    return "GO"  
}

// ============================================================
// Self-check – run:  npm run exercise -- 01 04
// On every line, the value left of "=> expected:" must equal the value on its right.
// (No need to change the code below this line)
// ============================================================

console.log("\n--- Exercise 1: getBrowserEngine ---");
try {
  console.log(getBrowserEngine("chromium"), "=> expected:", "Blink");
  console.log(getBrowserEngine("Chrome"), "=> expected:", "Blink");
  console.log(getBrowserEngine("edge"), "=> expected:", "Blink");
  console.log(getBrowserEngine("firefox"), "=> expected:", "Gecko");
  console.log(getBrowserEngine("webkit"), "=> expected:", "WebKit");
  console.log(getBrowserEngine("SAFARI"), "=> expected:", "WebKit");
  console.log(getBrowserEngine("opera"), "=> expected:", "unknown");
  console.log(getBrowserEngine(""), "=> expected:", "unknown");
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 2: rateResponseTime ---");
try {
  console.log(rateResponseTime(0), "=> expected:", "fast");
  console.log(rateResponseTime(199), "=> expected:", "fast");
  console.log(rateResponseTime(200), "=> expected:", "acceptable");
  console.log(rateResponseTime(999), "=> expected:", "acceptable");
  console.log(rateResponseTime(1000), "=> expected:", "slow");
  console.log(rateResponseTime(30000), "=> expected:", "slow");
  console.log(rateResponseTime(-5), "=> expected:", "invalid");
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 3: getPriorityAction ---");
try {
  console.log(getPriorityAction(Priority.P1), "=> expected:", "fix-now");
  console.log(getPriorityAction(Priority.P2), "=> expected:", "fix-this-sprint");
  console.log(getPriorityAction(Priority.P3), "=> expected:", "backlog");
  console.log(getPriorityAction(Priority.P4), "=> expected:", "wont-fix");
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 4: formatErrorMessage ---");
try {
  console.log(formatErrorMessage("Timeout"), "=> expected:", "Error: Timeout");
  console.log(formatErrorMessage("0"), "=> expected:", "Error: 0"); // a non-empty string = truthy
  console.log(formatErrorMessage(""), "=> expected:", "No error message");
  console.log(formatErrorMessage(null), "=> expected:", "No error message");
  console.log(formatErrorMessage(undefined), "=> expected:", "No error message");
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 5: shouldRetry ---");
try {
  console.log(shouldRetry(503, 1, 3), "=> expected:", true);
  console.log(shouldRetry(429, 2, 3), "=> expected:", true);
  console.log(shouldRetry(502, 1, 3), "=> expected:", true);
  console.log(shouldRetry(504, 1, 3), "=> expected:", true);
  console.log(shouldRetry(503, 3, 3), "=> expected:", false); // out of attempts
  console.log(shouldRetry(503, 4, 3), "=> expected:", false);
  console.log(shouldRetry(404, 1, 3), "=> expected:", false);
  console.log(shouldRetry(500, 1, 3), "=> expected:", false);
  console.log(shouldRetry(200, 1, 3), "=> expected:", false);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 6 (Bonus): releaseDecision ---");
try {
  console.log(releaseDecision(0, 0, 100), "=> expected:", "GO");
  console.log(releaseDecision(0, 2, 95), "=> expected:", "GO"); // boundaries: 95 passes, 2 bugs are still OK
  console.log(releaseDecision(1, 0, 100), "=> expected:", "BLOCKED");
  console.log(releaseDecision(0, 0, 94.9), "=> expected:", "BLOCKED");
  console.log(releaseDecision(2, 5, 50), "=> expected:", "BLOCKED"); // BLOCKED takes precedence over NEEDS_REVIEW
  console.log(releaseDecision(0, 3, 99), "=> expected:", "NEEDS_REVIEW");
} catch (e) {
  console.log("  ✋", (e as Error).message);
}
