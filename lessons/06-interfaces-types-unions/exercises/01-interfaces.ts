// Lesson 6 – Topic 01: Interfaces – Exercises
// ------------------------------------------------------------
// Instructions:
//   1. Fill in the body of each function/method in place of the line  throw new Error("TODO")
//   2. The interfaces are already defined – your code must return objects
//      that match them exactly, and add implements to the classes where marked TODO.
//   3. Check yourself: npm run exercise -- 06 01 (self-check at the end of the file)
// ------------------------------------------------------------

/**
 * Exercise 1 – A factory that returns an object matching an interface (readonly + optional field)
 * Create a test user according to the TestUser interface:
 *   - id   – as received
 *   - name – as received
 *   - email – "user<id>@test.local"   (e.g. id=7  =>  "user7@test.local")
 *   - phone – only if it was passed! If it wasn't – the phone key must not appear on the object at all.
 *
 *   createTestUser(7, "Dana")               => { id: 7, name: "Dana", email: "user7@test.local" }
 *   createTestUser(8, "Avi", "050-1234567") => { id: 8, name: "Avi", email: "user8@test.local", phone: "050-1234567" }
 *
 * Hint: first build an object without phone, then add the field only inside an if.
 */
export interface TestUser {
  readonly id: number;
  name: string;
  email: string;
  phone?: string;
}

export function createTestUser(id: number, name: string, phone?: string): TestUser {
  throw new Error("TODO");
}

/**
 * Exercise 2 – Filling in defaults for optional fields
 * RequestOptions – all fields are optional (what the user passes in).
 * ResolvedRequestOptions – the same fields, but all required (what our code works with).
 * Return a ResolvedRequestOptions with these defaults:
 *   method: "GET",  timeoutMs: 5000,  retries: 0,  headers: {}
 *
 *   resolveOptions({})                               => { method: "GET", timeoutMs: 5000, retries: 0, headers: {} }
 *   resolveOptions({ method: "POST", retries: 2 })   => { method: "POST", timeoutMs: 5000, retries: 2, headers: {} }
 *   resolveOptions({ timeoutMs: 0 })                 => timeoutMs stays 0 (!)
 *
 * Hint: use ?? and not || – otherwise 0 gets replaced by the default.
 */
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
  throw new Error("TODO");
}

/**
 * Exercise 3 – Extending an interface (extends)
 * ValidationError extends ApiError and adds fieldErrors (field name -> message).
 * Return a summary line:
 *   "<status> <message>: <field1> <error1>; <field2> <error2>"
 * and if there are no field errors at all – just "<status> <message>".
 *
 *   { status: 422, message: "Validation failed", fieldErrors: { email: "is required", name: "is too short" } }
 *     => "422 Validation failed: email is required; name is too short"
 *   { status: 400, message: "Bad request", fieldErrors: {} }
 *     => "400 Bad request"
 *
 * Hint: Object.entries(err.fieldErrors) returns an array of [field, message].
 */
export interface ApiError {
  status: number;
  message: string;
}

export interface ValidationError extends ApiError {
  fieldErrors: Record<string, string>;
}

export function summarizeValidationError(err: ValidationError): string {
  throw new Error("TODO");
}

/**
 * Exercise 4 – A class that implements an interface (implements)
 * Implement CountingReporter, which implements Reporter:
 *   onTestStart(name)         – a test started running
 *   onTestEnd(name, passed)   – a test finished (passed / failed)
 *   summary()                 – "<total> tests: <passed> passed, <failed> failed"
 *                               (total = number of tests that have finished)
 * In addition (a method that isn't in the interface – a class may add its own!):
 *   inProgress()              – names of tests that started and haven't finished yet, in start order
 *
 *   r.onTestStart("login"); r.onTestStart("search"); r.onTestEnd("login", true);
 *   r.inProgress() => ["search"]
 *   r.summary()    => "1 tests: 1 passed, 0 failed"
 *
 * Hint: add private fields for the counters and for the list of running tests.
 */
export interface Reporter {
  onTestStart(name: string): void;
  onTestEnd(name: string, passed: boolean): void;
  summary(): string;
}

export class CountingReporter /* TODO: implements Reporter */ {
  onTestStart(name: string): void {
    throw new Error("TODO");
  }
  onTestEnd(name: string, passed: boolean): void {
    throw new Error("TODO");
  }
  summary(): string {
    throw new Error("TODO");
  }
  inProgress(): string[] {
    throw new Error("TODO");
  }
}

/**
 * Exercise 5 – A class that implements several interfaces
 * FakeBrowser implements both Startable and Closable (like a fake browser in tests).
 *   start()     – starts it. If already running – throws an Error with the message "Browser already running"
 *   isRunning() – true if it was started and hasn't been closed yet
 *   close()     – closes it. If not running – does nothing (and isn't logged either)
 *   history()   – a copy of the log: an array of "start" / "close" in the order they actually happened
 *
 *   b.start(); b.close(); b.close(); b.start();
 *   b.history()   => ["start", "close", "start"]
 *   b.isRunning() => true
 *
 * Hint: history() should return a copy ([...arr]) – so the log can't be changed from outside.
 */
export interface Startable {
  start(): void;
  isRunning(): boolean;
}

export interface Closable {
  close(): void;
}

export class FakeBrowser /* TODO: implements Startable, Closable */ {
  start(): void {
    throw new Error("TODO");
  }
  isRunning(): boolean {
    throw new Error("TODO");
  }
  close(): void {
    throw new Error("TODO");
  }
  history(): string[] {
    throw new Error("TODO");
  }
}

/**
 * Exercise 6 (Bonus) – Structural typing: an object that matches an interface without a class
 * createMemoryLogger(prefix) returns a plain object (no class!) that matches MemoryLogger:
 *   info(m)  – appends  "[<prefix>] INFO <m>"  to lines
 *   error(m) – appends  "[<prefix>] ERROR <m>"  to lines
 *   lines    – the array of lines
 *   child(name) – returns a new MemoryLogger with prefix  "<prefix>:<name>"
 *                 that writes to the exact same lines array (shared by parent and child)
 *
 *   const log = createMemoryLogger("suite");
 *   log.info("start");
 *   log.child("login").error("timeout");
 *   log.lines => ["[suite] INFO start", "[suite:login] ERROR timeout"]
 *
 * Hint: an inner helper function that takes (prefix, lines) and returns the object –
 *      and child calls it again with the same lines.
 */
export interface Logger {
  info(message: string): void;
  error(message: string): void;
}

export interface MemoryLogger extends Logger {
  readonly lines: string[];
  child(name: string): MemoryLogger;
}

export function createMemoryLogger(prefix: string): MemoryLogger {
  throw new Error("TODO");
}

// ============================================================
// Self-check – run:  npm run exercise -- 06 01
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
