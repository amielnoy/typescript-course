// Lesson 10 – Topic 01: Logger – levels, format, context and filtering – Exercises
// ------------------------------------------------------------
// Instructions:
//   1. Fill in the body of each function/method in place of the line  throw new Error("TODO")
//   2. It is recommended to keep the example  examples/01-logger.ts  open alongside this file
//   3. Note: here we don't write to the console or to a file – the time comes from outside (clock)
//      and the lines are collected into an array (sink). That way the logger can be tested deterministically.
//   4. Check yourself: npm run exercise -- 10 01 (self-check at the end of the file)
// ------------------------------------------------------------

export type Level = "debug" | "info" | "warn" | "error";

/** A log line after parsing */
export interface LogEntry {
  timestamp: string;
  level: Level;
  context: string;
  message: string;
}

/**
 * Exercise 1 – The context of a "child" logger
 * Like child() in the example: join the parent's context and the child's context with a colon.
 *   childContext("suite", "login")        => "suite:login"
 *   childContext("suite:login", "step-1") => "suite:login:step-1"
 * Edge cases:
 *   childContext("", "login")  => "login"     (no parent – no leading colon)
 *   childContext("suite", "")  => "suite"     (no child – the context doesn't change)
 */
export function childContext(parent: string, sub: string): string {
  throw new Error("TODO");
}

/**
 * Exercise 2 – How many lines of each level?
 * Useful for summarizing a run: "this run had 3 errors and 12 warnings".
 * The result must contain all four levels – even if their count is 0.
 *   countByLevel([{ level: "info", ... }, { level: "error", ... }, { level: "info", ... }])
 *     => { debug: 0, info: 2, warn: 0, error: 1 }
 *   countByLevel([]) => { debug: 0, info: 0, warn: 0, error: 0 }
 */
export function countByLevel(entries: LogEntry[]): Record<Level, number> {
  throw new Error("TODO");
}

/**
 * Exercise 3 – Parsing a log line
 * The format is exactly the format of the logger from the example (the level is padded with spaces to 5 characters):
 *   "[2026-11-08T10:00:00.000Z] [WARN ] [suite:cart] Response slower than expected {\"durationMs\":2300}"
 *     => {
 *          timestamp: "2026-11-08T10:00:00.000Z",
 *          level: "warn",                         (lowercase, without the spaces)
 *          context: "suite:cart",
 *          message: "Response slower than expected {\"durationMs\":2300}",
 *        }
 * Return null if:
 *   - the line is not in this format (e.g. "random text")
 *   - the level is not one of the four known levels (e.g. [TRACE])
 * Hint: a regular expression with groups – /^\[([^\]]+)\] \[(\w+)\s*\] \[([^\]]*)\] (.*)$/
 */
export function parseLogLine(line: string): LogEntry | null {
  throw new Error("TODO");
}

export interface LogFilter {
  /** The minimum level to show (default: "debug" – everything) */
  minLevel?: Level;
  /** Context: matches an identical context, or any "child" of it */
  context?: string;
}

/**
 * Exercise 4 – Filtering logs for investigation
 * When a test fails you want to see only what's relevant: a certain level and above, and only from a certain context.
 * - minLevel: the order is debug < info < warn < error
 * - context: "suite:login" matches "suite:login" and "suite:login:step-1",
 *            but not "suite:loginPage" and not "suite"
 * - keep the original order, don't change the array you received
 *   filterLogs(entries, { minLevel: "warn" })                   => only warn and error
 *   filterLogs(entries, { context: "suite:cart", minLevel: "info" })
 *   filterLogs(entries, {})                                      => everything
 */
export function filterLogs(entries: LogEntry[], filter: LogFilter): LogEntry[] {
  throw new Error("TODO");
}

/**
 * Exercise 5 – A testable logger
 * Implement the logger from the example – but instead of the console and a file, every line is pushed into a sink array,
 * and instead of new Date() you use the clock() function.
 *
 *   const sink: string[] = [];
 *   const log = new MemoryLogger("suite", "info", () => new Date("2026-11-08T10:00:00.000Z"), sink);
 *   log.info("POST /api/login", { status: 200 });
 *   log.debug("not written");          // below the minimum level – not written
 *   log.child("cart").error("Boom");
 *   sink => [
 *     '[2026-11-08T10:00:00.000Z] [INFO ] [suite] POST /api/login {"status":200}',
 *     '[2026-11-08T10:00:00.000Z] [ERROR] [suite:cart] Boom',
 *   ]
 *
 * - the level is uppercase and padded to 5 characters: padEnd(5)
 * - data (if present) is appended after a space as JSON.stringify
 * - child(sub) returns a new logger with the context "parent:child" (Exercise 1), the same level, the same clock and the same sink
 * Hint: store the constructor parameters as (private) fields.
 */
export class MemoryLogger {
  constructor(context: string, minLevel: Level, clock: () => Date, sink: string[]) {
    throw new Error("TODO");
  }

  child(sub: string): MemoryLogger {
    throw new Error("TODO");
  }

  debug(message: string, data?: unknown): void {
    throw new Error("TODO");
  }

  info(message: string, data?: unknown): void {
    throw new Error("TODO");
  }

  warn(message: string, data?: unknown): void {
    throw new Error("TODO");
  }

  error(message: string, data?: unknown): void {
    throw new Error("TODO");
  }
}

/**
 * Exercise 6 (Bonus) – Hiding secrets before writing to the log
 * Logs are saved as artifacts in CI and many people can read them – passwords and tokens must never appear in them!
 * Return a deep copy of data in which the value of every key found in keys is replaced with "***".
 * - the comparison of key names is case-insensitive ("Authorization" = "authorization")
 * - it also goes into nested objects and arrays
 * - simple values (string, number, null...) are returned as they are
 * - you must not change the original object
 *   redactSecrets({ user: "dana", password: "1234", headers: { Authorization: "Bearer x" } })
 *     => { user: "dana", password: "***", headers: { Authorization: "***" } }
 *   redactSecrets([{ token: "abc" }, 5]) => [{ token: "***" }, 5]
 * Hint: recursion + Array.isArray + Object.entries
 */
export function redactSecrets(data: unknown, keys: string[] = ["password", "token", "authorization", "apikey"]): unknown {
  throw new Error("TODO");
}

// ============================================================
// Self-check – run:  npm run exercise -- 10 01
// On every line, the value left of "=> expected:" must equal the value on its right.
// (No need to change the code below this line)
// ============================================================

const CHECK_TS = "2026-11-08T10:00:00.000Z";
const sampleEntries: LogEntry[] = [
  { timestamp: CHECK_TS, level: "debug", context: "suite:login", message: "Filling username" },
  { timestamp: CHECK_TS, level: "info", context: "suite:login", message: "POST /api/login" },
  { timestamp: CHECK_TS, level: "warn", context: "suite:cart", message: "Slow response" },
  { timestamp: CHECK_TS, level: "error", context: "suite:cart:checkout", message: "Assertion failed" },
  { timestamp: CHECK_TS, level: "error", context: "suite:loginPage", message: "Element not found" },
  { timestamp: CHECK_TS, level: "info", context: "suite", message: "Starting" },
];

console.log("\n--- Exercise 1: childContext ---");
try {
  console.log(childContext("suite", "login"), "=> expected:", "suite:login");
  console.log(childContext("suite:login", "step-1"), "=> expected:", "suite:login:step-1");
  console.log(childContext("", "login"), "=> expected:", "login");
  console.log(childContext("suite", ""), "=> expected:", "suite");
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 2: countByLevel ---");
try {
  console.log(countByLevel(sampleEntries), "=> expected:", { debug: 1, info: 2, warn: 1, error: 2 });
  console.log(countByLevel([]), "=> expected:", { debug: 0, info: 0, warn: 0, error: 0 });
  console.log(countByLevel([sampleEntries[2]]), "=> expected:", { debug: 0, info: 0, warn: 1, error: 0 });
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 3: parseLogLine ---");
try {
  console.log(
    parseLogLine(`[${CHECK_TS}] [WARN ] [suite:cart] Response slower than expected {"durationMs":2300}`),
    "=> expected:",
    {
      timestamp: CHECK_TS,
      level: "warn",
      context: "suite:cart",
      message: 'Response slower than expected {"durationMs":2300}',
    },
  );
  console.log(parseLogLine(`[${CHECK_TS}] [ERROR] [suite:login] Timeout [30s]`), "=> expected:", {
    timestamp: CHECK_TS,
    level: "error",
    context: "suite:login",
    message: "Timeout [30s]",
  });
  console.log(parseLogLine(`[${CHECK_TS}] [DEBUG] [x] a`)?.level, "=> expected:", "debug");
  console.log(parseLogLine("random text"), "=> expected:", null);
  console.log(parseLogLine(""), "=> expected:", null);
  console.log(parseLogLine(`[${CHECK_TS}] [TRACE] [suite] too detailed`), "=> expected:", null);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 4: filterLogs ---");
try {
  const allMessages = sampleEntries.map((e) => e.message);
  console.log(
    filterLogs(sampleEntries, { minLevel: "warn" }).map((e) => e.message),
    "=> expected:",
    ["Slow response", "Assertion failed", "Element not found"],
  );
  console.log(
    filterLogs(sampleEntries, { context: "suite:cart", minLevel: "info" }).map((e) => e.message),
    "=> expected:",
    ["Slow response", "Assertion failed"],
  );
  console.log(
    filterLogs(sampleEntries, { context: "suite:login" }).map((e) => e.message),
    "=> expected:",
    ["Filling username", "POST /api/login"],
  );
  console.log(filterLogs(sampleEntries, {}).length, "=> expected:", sampleEntries.length);
  console.log(filterLogs(sampleEntries, { context: "suite" }).length, "=> expected:", sampleEntries.length);
  console.log(filterLogs([], { minLevel: "error" }), "=> expected:", []);
  // The original array was not changed:
  console.log(sampleEntries.map((e) => e.message), "=> expected:", allMessages);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 5: MemoryLogger ---");
try {
  const sink: string[] = [];
  const clock = () => new Date(CHECK_TS);
  const log = new MemoryLogger("suite", "info", clock, sink);
  log.info("POST /api/login", { status: 200 });
  log.debug("not written");
  log.warn("Slow");
  const cart = log.child("cart");
  cart.error("Boom");
  cart.debug("also not written");
  cart.child("checkout").info("Paying", ["visa", 3]);
  console.log(sink, "=> expected:", [
    `[${CHECK_TS}] [INFO ] [suite] POST /api/login {"status":200}`,
    `[${CHECK_TS}] [WARN ] [suite] Slow`,
    `[${CHECK_TS}] [ERROR] [suite:cart] Boom`,
    `[${CHECK_TS}] [INFO ] [suite:cart:checkout] Paying ["visa",3]`,
  ]);

  const debugSink: string[] = [];
  new MemoryLogger("api", "debug", clock, debugSink).debug("verbose", null);
  console.log(debugSink, "=> expected:", [`[${CHECK_TS}] [DEBUG] [api] verbose null`]);

  const errorsOnly: string[] = [];
  const quiet = new MemoryLogger("q", "error", clock, errorsOnly);
  quiet.info("x");
  quiet.warn("y");
  console.log(errorsOnly, "=> expected:", []);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 6 (Bonus): redactSecrets ---");
try {
  const input = { user: "dana", password: "1234", headers: { Authorization: "Bearer x", accept: "json" } };
  console.log(redactSecrets(input), "=> expected:", {
    user: "dana",
    password: "***",
    headers: { Authorization: "***", accept: "json" },
  });
  // The original object was not changed:
  console.log(input.password, "=> expected:", "1234");
  console.log(input.headers.Authorization, "=> expected:", "Bearer x");
  console.log(redactSecrets([{ token: "abc" }, 5, { list: [{ ApiKey: "k" }] }]), "=> expected:", [
    { token: "***" },
    5,
    { list: [{ ApiKey: "***" }] },
  ]);
  console.log(redactSecrets({ pin: "0000", password: "p" }, ["PIN"]), "=> expected:", { pin: "***", password: "p" });
  console.log(redactSecrets("plain"), "=> expected:", "plain");
  console.log(redactSecrets(null), "=> expected:", null);
  console.log(redactSecrets(undefined), "=> expected:", undefined);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}
