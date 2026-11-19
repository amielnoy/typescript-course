// Lesson 6 – Topic 01: Interfaces – Solutions

// ---------- Exercise 1 ----------
export interface TestUser {
  readonly id: number;
  name: string;
  email: string;
  phone?: string;
}

export function createTestUser(id: number, name: string, phone?: string): TestUser {
  const user: TestUser = { id, name, email: `user${id}@test.local` };
  // Optional field: add it only if there's a value – so the key doesn't exist at all when there isn't one
  if (phone !== undefined) {
    user.phone = phone;
  }
  return user;
}

// ---------- Exercise 2 ----------
export interface RequestOptions {
  method?: string;
  timeoutMs?: number;
  retries?: number;
  headers?: Record<string, string>;
}

export interface ResolvedRequestOptions {
  method: string;
  timeoutMs: number;
  retries: number;
  headers: Record<string, string>;
}

export function resolveOptions(options: RequestOptions): ResolvedRequestOptions {
  // ?? replaces only undefined/null – so 0 is preserved
  return {
    method: options.method ?? "GET",
    timeoutMs: options.timeoutMs ?? 5000,
    retries: options.retries ?? 0,
    headers: options.headers ?? {},
  };
}

// ---------- Exercise 3 ----------
export interface ApiError {
  status: number;
  message: string;
}

export interface ValidationError extends ApiError {
  fieldErrors: Record<string, string>;
}

export function summarizeValidationError(err: ValidationError): string {
  const head = `${err.status} ${err.message}`;
  const parts = Object.entries(err.fieldErrors).map(([field, error]) => `${field} ${error}`);
  return parts.length === 0 ? head : `${head}: ${parts.join("; ")}`;
}

// ---------- Exercise 4 ----------
export interface Reporter {
  onTestStart(name: string): void;
  onTestEnd(name: string, passed: boolean): void;
  summary(): string;
}

export class CountingReporter implements Reporter {
  private passed = 0;
  private failed = 0;
  private running: string[] = [];

  onTestStart(name: string): void {
    this.running.push(name);
  }

  onTestEnd(name: string, passed: boolean): void {
    this.running = this.running.filter((n) => n !== name);
    if (passed) {
      this.passed++;
    } else {
      this.failed++;
    }
  }

  summary(): string {
    const total = this.passed + this.failed;
    return `${total} tests: ${this.passed} passed, ${this.failed} failed`;
  }

  // An extra method that isn't in the interface – allowed; the interface only defines the minimum
  inProgress(): string[] {
    return [...this.running];
  }
}

// ---------- Exercise 5 ----------
export interface Startable {
  start(): void;
  isRunning(): boolean;
}

export interface Closable {
  close(): void;
}

export class FakeBrowser implements Startable, Closable {
  private running = false;
  private readonly log: string[] = [];

  start(): void {
    if (this.running) {
      throw new Error("Browser already running");
    }
    this.running = true;
    this.log.push("start");
  }

  isRunning(): boolean {
    return this.running;
  }

  close(): void {
    if (!this.running) return;
    this.running = false;
    this.log.push("close");
  }

  history(): string[] {
    return [...this.log];
  }
}

// ---------- Exercise 6 (Bonus) ----------
export interface Logger {
  info(message: string): void;
  error(message: string): void;
}

export interface MemoryLogger extends Logger {
  readonly lines: string[];
  child(name: string): MemoryLogger;
}

// Helper function: every logger (parent or child) is built here – with a shared lines array
function buildLogger(prefix: string, lines: string[]): MemoryLogger {
  return {
    lines,
    info: (message) => {
      lines.push(`[${prefix}] INFO ${message}`);
    },
    error: (message) => {
      lines.push(`[${prefix}] ERROR ${message}`);
    },
    child: (name) => buildLogger(`${prefix}:${name}`, lines),
  };
}

export function createMemoryLogger(prefix: string): MemoryLogger {
  return buildLogger(prefix, []);
}

// ============================================================
// Self-check – run:  npm run solution -- 06 01
// On every line, the value left of "=> expected:" must equal the value on its right.
// (No need to change the code below this line)
// ============================================================

console.log("\n--- Exercise 1: createTestUser ---");
try {
  const dana = createTestUser(7, "Dana");
  console.log(dana, "=> expected:", { id: 7, name: "Dana", email: "user7@test.local" });
  console.log("phone" in dana, "=> expected:", false);
  console.log(createTestUser(8, "Avi", "050-1234567"), "=> expected:", {
    id: 8,
    name: "Avi",
    email: "user8@test.local",
    phone: "050-1234567",
  });
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 2: resolveOptions ---");
try {
  console.log(resolveOptions({}), "=> expected:", { method: "GET", timeoutMs: 5000, retries: 0, headers: {} });
  console.log(resolveOptions({ method: "POST", retries: 2 }), "=> expected:", {
    method: "POST",
    timeoutMs: 5000,
    retries: 2,
    headers: {},
  });
  console.log(resolveOptions({ timeoutMs: 0 }).timeoutMs, "=> expected:", 0);
  console.log(resolveOptions({ headers: { Authorization: "Bearer x" } }).headers, "=> expected:", {
    Authorization: "Bearer x",
  });
  // Two calls don't share the same default headers object
  const a = resolveOptions({});
  a.headers["X-Test"] = "1";
  console.log(resolveOptions({}).headers, "=> expected:", {});
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 3: summarizeValidationError ---");
try {
  console.log(
    summarizeValidationError({
      status: 422,
      message: "Validation failed",
      fieldErrors: { email: "is required", name: "is too short" },
    }),
    "=> expected:",
    "422 Validation failed: email is required; name is too short",
  );
  console.log(
    summarizeValidationError({ status: 400, message: "Bad request", fieldErrors: {} }),
    "=> expected:",
    "400 Bad request",
  );
  console.log(
    summarizeValidationError({ status: 422, message: "Invalid", fieldErrors: { age: "must be positive" } }),
    "=> expected:",
    "422 Invalid: age must be positive",
  );
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 4: CountingReporter ---");
try {
  const r = new CountingReporter();
  console.log(r.summary(), "=> expected:", "0 tests: 0 passed, 0 failed");
  console.log(r.inProgress(), "=> expected:", []);
  r.onTestStart("login");
  r.onTestStart("search");
  r.onTestStart("checkout");
  console.log(r.inProgress(), "=> expected:", ["login", "search", "checkout"]);
  r.onTestEnd("search", false);
  r.onTestEnd("login", true);
  console.log(r.inProgress(), "=> expected:", ["checkout"]);
  console.log(r.summary(), "=> expected:", "2 tests: 1 passed, 1 failed");
  r.onTestEnd("checkout", true);
  console.log(r.summary(), "=> expected:", "3 tests: 2 passed, 1 failed");
  console.log(r.inProgress(), "=> expected:", []);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 5: FakeBrowser ---");
try {
  const b = new FakeBrowser();
  console.log(b.isRunning(), "=> expected:", false);
  b.close(); // closing when not running – does nothing
  console.log(b.history(), "=> expected:", []);
  b.start();
  console.log(b.isRunning(), "=> expected:", true);
  try {
    b.start();
    console.log("did not throw", "=> expected:", "threw:", "Browser already running");
  } catch (err) {
    if ((err as Error).message === "TODO") throw err;
    console.log("threw:", (err as Error).message, "=> expected:", "threw:", "Browser already running");
  }
  b.close();
  b.close();
  console.log(b.isRunning(), "=> expected:", false);
  b.start();
  console.log(b.history(), "=> expected:", ["start", "close", "start"]);
  // history returns a copy – changing it doesn't change the log
  b.history().push("hacked");
  console.log(b.history(), "=> expected:", ["start", "close", "start"]);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 6 (Bonus): createMemoryLogger ---");
try {
  const log = createMemoryLogger("suite");
  console.log(log.lines, "=> expected:", []);
  log.info("start");
  const login = log.child("login");
  login.error("timeout");
  login.child("retry").info("attempt 2");
  log.error("done with errors");
  const expected = [
    "[suite] INFO start",
    "[suite:login] ERROR timeout",
    "[suite:login:retry] INFO attempt 2",
    "[suite] ERROR done with errors",
  ];
  console.log(log.lines, "=> expected:", expected);
  console.log(login.lines, "=> expected:", expected); // the child shares the same lines array
  // Two separate loggers don't share lines
  const other = createMemoryLogger("other");
  other.info("x");
  console.log(log.lines.length, "=> expected:", 4);
  console.log(other.lines, "=> expected:", ["[other] INFO x"]);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}
