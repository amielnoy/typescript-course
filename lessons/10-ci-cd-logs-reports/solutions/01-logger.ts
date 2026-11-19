// Lesson 10 – Topic 01: Logger – Solutions
export type Level = "debug" | "info" | "warn" | "error";

export interface LogEntry {
  timestamp: string;
  level: Level;
  context: string;
  message: string;
}

const ORDER: Record<Level, number> = { debug: 0, info: 1, warn: 2, error: 3 };

// Object.hasOwn and not "in" – otherwise "constructor" would also count as a level (it comes from the prototype)
const isLevel = (value: string): value is Level => Object.hasOwn(ORDER, value);

export function childContext(parent: string, sub: string): string {
  if (!parent) return sub;
  if (!sub) return parent;
  return `${parent}:${sub}`;
}

export function countByLevel(entries: LogEntry[]): Record<Level, number> {
  const counts: Record<Level, number> = { debug: 0, info: 0, warn: 0, error: 0 };
  for (const e of entries) counts[e.level]++;
  return counts;
}

const LINE_RE = /^\[([^\]]+)\] \[(\w+)\s*\] \[([^\]]*)\] (.*)$/;

export function parseLogLine(line: string): LogEntry | null {
  const match = LINE_RE.exec(line);
  if (!match) return null;
  const [, timestamp, rawLevel, context, message] = match;
  const level = rawLevel.toLowerCase();
  if (!isLevel(level)) return null; // unknown level – not a valid log line
  return { timestamp, level, context, message };
}

export interface LogFilter {
  minLevel?: Level;
  context?: string;
}

export function filterLogs(entries: LogEntry[], filter: LogFilter): LogEntry[] {
  const min = ORDER[filter.minLevel ?? "debug"];
  const ctx = filter.context;
  return entries.filter(
    (e) =>
      ORDER[e.level] >= min &&
      // the ":" prevents matching "suite:loginPage" when searching for "suite:login"
      (ctx === undefined || e.context === ctx || e.context.startsWith(`${ctx}:`)),
  );
}

export class MemoryLogger {
  constructor(
    private context: string,
    private minLevel: Level,
    private clock: () => Date,
    private sink: string[],
  ) {}

  child(sub: string): MemoryLogger {
    // the same sink – all the "child" loggers write to the same destination
    return new MemoryLogger(childContext(this.context, sub), this.minLevel, this.clock, this.sink);
  }

  debug(message: string, data?: unknown): void {
    this.write("debug", message, data);
  }

  info(message: string, data?: unknown): void {
    this.write("info", message, data);
  }

  warn(message: string, data?: unknown): void {
    this.write("warn", message, data);
  }

  error(message: string, data?: unknown): void {
    this.write("error", message, data);
  }

  private write(level: Level, message: string, data?: unknown): void {
    if (ORDER[level] < ORDER[this.minLevel]) return;
    const extra = data !== undefined ? ` ${JSON.stringify(data)}` : "";
    this.sink.push(
      `[${this.clock().toISOString()}] [${level.toUpperCase().padEnd(5)}] [${this.context}] ${message}${extra}`,
    );
  }
}

export function redactSecrets(data: unknown, keys: string[] = ["password", "token", "authorization", "apikey"]): unknown {
  const secret = new Set(keys.map((k) => k.toLowerCase()));
  const walk = (value: unknown): unknown => {
    if (Array.isArray(value)) return value.map(walk);
    if (value !== null && typeof value === "object") {
      // build a new object – the original is not changed
      return Object.fromEntries(
        Object.entries(value).map(([k, v]) => [k, secret.has(k.toLowerCase()) ? "***" : walk(v)]),
      );
    }
    return value;
  };
  return walk(data);
}

// ============================================================
// Self-check – run:  npm run solution -- 10 01
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
