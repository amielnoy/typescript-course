// Lesson 1 – Topic 04: Conditions – Solutions

export enum Priority {
  P1 = 1,
  P2,
  P3,
  P4,
}

export function getBrowserEngine(browser: string): string {
  switch (browser.toLowerCase()) {
    case "chromium":
    case "chrome":
    case "edge":
      return "Blink"; // return exits the function – no need for break
    case "firefox":
      return "Gecko";
    case "webkit":
    case "safari":
      return "WebKit";
    default:
      return "unknown";
  }
}

export function rateResponseTime(ms: number): string {
  // Order matters: first the special case, then from smallest to largest
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

export function formatErrorMessage(message: string | null | undefined): string {
  // !message catches "", null and undefined all at once
  if (!message) {
    return "No error message";
  }
  return `Error: ${message}`;
}

export function shouldRetry(statusCode: number, attempt: number, maxAttempts: number): boolean {
  if (attempt >= maxAttempts) {
    return false;
  }
  switch (statusCode) {
    case 429: // Too Many Requests
    case 502: // Bad Gateway
    case 503: // Service Unavailable
    case 504: // Gateway Timeout
      return true;
    default:
      return false;
  }
}

export function releaseDecision(criticalBugs: number, highBugs: number, passRate: number): string {
  if (criticalBugs > 0 || passRate < 95) {
    return "BLOCKED";
  } else if (highBugs > 2) {
    return "NEEDS_REVIEW";
  } else {
    return "GO";
  }
}

// ============================================================
// Self-check – run:  npm run solution -- 01 04
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
