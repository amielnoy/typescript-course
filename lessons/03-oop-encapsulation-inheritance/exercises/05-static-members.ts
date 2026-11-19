// Lesson 3 – Topic 05: Static Members (static) and Factory Methods – Exercises
// ------------------------------------------------------------
// Instructions:
//   1. Fill in every constructor and method in place of the line  throw new Error("TODO")
//   2. Add the private static fields (counters, etc.) yourself.
//   3. Check yourself: npm run exercise -- 03 05 (self-check at the end of the file)
// ------------------------------------------------------------

// ---------- Warm-ups (in class, ~5 minutes each) ----------
// Two short exercises we solve during the lesson, right after the examples – before Exercise 1.

/**
 * Warm-up A – static helpers: no `new` needed
 * - DEFAULT_TIMEOUT_MS is ready (static readonly = a constant of the class)
 * - static msToSeconds(ms): number       – 1500 => 1.5
 * - static secondsToMs(seconds): number  – 2 => 2000
 * - static isTooSlow(ms): boolean        – true if ms is MORE than DEFAULT_TIMEOUT_MS
 *   Units.msToSeconds(Units.DEFAULT_TIMEOUT_MS) => 30
 * Hint: inside a static method, reach the constant through the class name – Units.DEFAULT_TIMEOUT_MS
 */
export class Units {
  static readonly DEFAULT_TIMEOUT_MS = 30000;

  static msToSeconds(ms: number): number {
    throw new Error("TODO");
  }

  static secondsToMs(seconds: number): number {
    throw new Error("TODO");
  }

  static isTooSlow(ms: number): boolean {
    throw new Error("TODO");
  }
}

/**
 * Warm-up B – a static counter shared by all the objects
 * Every new TestRun gets the next number: the first is 1, the second 2, ...
 * - Add a private static field created that starts at 0
 * - In the constructor: increment created and store the new value in number
 * - label(): string         – "#<number> <name>",  e.g. "#1 smoke"
 * - static total(): number  – how many runs were created so far
 * - static reset(): void    – back to 0 (handy between test suites)
 */
export class TestRun {
  readonly number: number;

  constructor(readonly name: string) {
    throw new Error("TODO");
  }

  label(): string {
    throw new Error("TODO");
  }

  static total(): number {
    throw new Error("TODO");
  }

  static reset(): void {
    throw new Error("TODO");
  }
}

// ---------- Exercises ----------

/**
 * Exercise 1 – Environment constants and static methods
 * The constants are already written. Complete:
 * - static urlFor(env: string): string
 *     "dev" / "staging" / "prod" (case-insensitive) => the matching constant
 *     any other value => throws Error(`Unknown env: <env>`)
 * - static isSafeForWrites(env: string): boolean
 *     true for every valid environment except prod (we don't write test data to production!)
 *     an invalid environment => throws the same error as urlFor
 * No need for new – call it directly: TestEnv.urlFor("staging")
 * Hint: inside a static method, access the constants through the class name – TestEnv.DEV
 */
export class TestEnv {
  static readonly DEV = "http://localhost:3000";
  static readonly STAGING = "https://staging.example.com";
  static readonly PROD = "https://example.com";

  static urlFor(env: string): string {
    throw new Error("TODO");
  }

  static isSafeForWrites(env: string): boolean {
    throw new Error("TODO");
  }
}

/**
 * Exercise 2 – An ID generator with a separate counter for each prefix
 * - static next(prefix = "TC"): string
 *     each prefix has its own counter, which starts at 1 and is padded to 3 digits:
 *     next("BUG") => "BUG-001", next("BUG") => "BUG-002", next() => "TC-001"
 * - static peek(prefix = "TC"): number – how many IDs have already been generated for the prefix (0 if none)
 * - static reset(): void – resets all the counters
 * Hint: a private static field of type Map<string, number>, and String(n).padStart(3, "0")
 */
export class SequenceIds {
  static next(prefix = "TC"): string {
    throw new Error("TODO");
  }

  static peek(prefix = "TC"): number {
    throw new Error("TODO");
  }

  static reset(): void {
    throw new Error("TODO");
  }
}

/**
 * Exercise 3 – Test sessions: combining static and instance fields
 * - every new TestSession(user) gets a running id (1, 2, 3...) from a shared static counter
 *     id and user are public readonly
 * - static activeCount(): number  – how many sessions are currently open
 * - static totalCreated(): number – how many sessions were created in total
 * - close(): void – closes the session. Closing it twice must not decrement activeCount twice!
 * - isOpen(): boolean
 * - static resetAll(): void – resets all the static counters (for use between tests)
 * Note: the counters belong to the class (static), but "is the session closed" belongs to each object separately.
 */
export class TestSession {
  readonly id: number;
  readonly user: string;

  constructor(user: string) {
    throw new Error("TODO");
  }

  close(): void {
    throw new Error("TODO");
  }

  isOpen(): boolean {
    throw new Error("TODO");
  }

  static activeCount(): number {
    throw new Error("TODO");
  }

  static totalCreated(): number {
    throw new Error("TODO");
  }

  static resetAll(): void {
    throw new Error("TODO");
  }
}

/**
 * Exercise 4 – Mock API responses: a private constructor and factory methods
 * The constructor is private – from outside you can't write new MockResponse(...), only use the factories.
 * - status and body are public readonly
 * - static ok(body)        => status 200 with the given body
 * - static created(body)   => status 201
 * - static notFound(resource = "resource") => status 404, body: { error: "<resource> not found" }
 * - static serverError(message = "Internal Server Error") => status 500, body: { error: message }
 * - isSuccess(): boolean   => status between 200 and 299
 *   MockResponse.notFound("user") => { status: 404, body: { error: "user not found" } }
 */
export class MockResponse {
  readonly status: number;
  readonly body: unknown;

  private constructor(status: number, body: unknown) {
    throw new Error("TODO");
  }

  static ok(body: unknown): MockResponse {
    throw new Error("TODO");
  }

  static created(body: unknown): MockResponse {
    throw new Error("TODO");
  }

  static notFound(resource = "resource"): MockResponse {
    throw new Error("TODO");
  }

  static serverError(message = "Internal Server Error"): MockResponse {
    throw new Error("TODO");
  }

  isSuccess(): boolean {
    throw new Error("TODO");
  }
}

/**
 * Exercise 5 (Bonus) – Singleton: one config store for all the tests
 * - The constructor is private. A private static field holds the single instance (or undefined)
 * - static instance(): TestConfigStore – creates an instance the first time, and returns **the same instance** on every call
 * - static reset(): void – "forgets" the instance, so the next call to instance() creates a new, empty one
 * - set(key, value): void
 *     Updating an existing key – always allowed.
 *     A new key when there are already MAX_KEYS keys => throws Error(`Config store is full (max <MAX_KEYS>)`)
 * - get(key): string | undefined
 * - size(): number
 * Hint: TestConfigStore.MAX_KEYS
 */
export class TestConfigStore {
  static readonly MAX_KEYS = 5;

  private constructor() {
    throw new Error("TODO");
  }

  static instance(): TestConfigStore {
    throw new Error("TODO");
  }

  static reset(): void {
    throw new Error("TODO");
  }

  set(key: string, value: string): void {
    throw new Error("TODO");
  }

  get(key: string): string | undefined {
    throw new Error("TODO");
  }

  size(): number {
    throw new Error("TODO");
  }
}

// ============================================================
// Self-check – run:  npm run exercise -- 03 05
// On every line, the value left of "=> expected:" must equal the value on its right.
// (No need to change the code below this line)
// Note: static state persists for the whole run – that's why Exercises 2, 3 and 5 start with a reset.
// ============================================================

console.log("\n--- Warm-up A: Units ---");
try {
  console.log(Units.msToSeconds(1500), "=> expected:", 1.5);
  console.log(Units.secondsToMs(2), "=> expected:", 2000);
  console.log(Units.msToSeconds(Units.DEFAULT_TIMEOUT_MS), "=> expected:", 30);
  console.log(Units.isTooSlow(31000), "=> expected:", true);
  console.log(Units.isTooSlow(30000), "=> expected:", false); // exactly the limit is OK
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Warm-up B: TestRun ---");
try {
  TestRun.reset();
  const first = new TestRun("smoke");
  const second = new TestRun("regression");
  console.log(first.label(), "=> expected:", "#1 smoke");
  console.log(second.label(), "=> expected:", "#2 regression");
  console.log(TestRun.total(), "=> expected:", 2);
  TestRun.reset();
  console.log(TestRun.total(), "=> expected:", 0);
  console.log(new TestRun("e2e").label(), "=> expected:", "#1 e2e");
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 1: TestEnv ---");
try {
  console.log(TestEnv.urlFor("dev"), "=> expected:", "http://localhost:3000");
  console.log(TestEnv.urlFor("staging"), "=> expected:", "https://staging.example.com");
  console.log(TestEnv.urlFor("PROD"), "=> expected:", "https://example.com");
  try {
    TestEnv.urlFor("qa");
    console.log("did not throw", "=> expected:", "an error");
  } catch (err) {
    if ((err as Error).message === "TODO") throw err;
    console.log((err as Error).message, "=> expected:", "Unknown env: qa");
  }

  console.log(TestEnv.isSafeForWrites("dev"), "=> expected:", true);
  console.log(TestEnv.isSafeForWrites("Staging"), "=> expected:", true);
  console.log(TestEnv.isSafeForWrites("prod"), "=> expected:", false);
  console.log(TestEnv.isSafeForWrites("PROD"), "=> expected:", false);
  try {
    TestEnv.isSafeForWrites("local");
    console.log("did not throw", "=> expected:", "an error");
  } catch (err) {
    if ((err as Error).message === "TODO") throw err;
    console.log((err as Error).message, "=> expected:", "Unknown env: local");
  }
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 2: SequenceIds ---");
try {
  SequenceIds.reset();
  console.log(SequenceIds.peek("BUG"), "=> expected:", 0);
  console.log(SequenceIds.next("BUG"), "=> expected:", "BUG-001");
  console.log(SequenceIds.next("BUG"), "=> expected:", "BUG-002");
  console.log(SequenceIds.next(), "=> expected:", "TC-001");
  console.log(SequenceIds.next("TC"), "=> expected:", "TC-002");
  console.log(SequenceIds.next("BUG"), "=> expected:", "BUG-003");
  console.log(SequenceIds.peek("BUG"), "=> expected:", 3);
  console.log(SequenceIds.peek(), "=> expected:", 2);

  for (let i = 0; i < 997; i++) SequenceIds.next("BUG");
  console.log(SequenceIds.peek("BUG"), "=> expected:", 1000);
  console.log(SequenceIds.next("BUG"), "=> expected:", "BUG-1001");

  SequenceIds.reset();
  console.log(SequenceIds.peek("BUG"), "=> expected:", 0);
  console.log(SequenceIds.next("BUG"), "=> expected:", "BUG-001");
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 3: TestSession ---");
try {
  TestSession.resetAll();
  console.log(TestSession.activeCount(), "=> expected:", 0);

  const s1 = new TestSession("dana");
  const s2 = new TestSession("noa");
  const s3 = new TestSession("avi");
  console.log([s1.id, s2.id, s3.id], "=> expected:", [1, 2, 3]);
  console.log(s2.user, "=> expected:", "noa");
  console.log(TestSession.activeCount(), "=> expected:", 3);
  console.log(TestSession.totalCreated(), "=> expected:", 3);

  s2.close();
  s2.close(); // closing twice – changes nothing
  console.log(s2.isOpen(), "=> expected:", false);
  console.log(s1.isOpen(), "=> expected:", true);
  console.log(TestSession.activeCount(), "=> expected:", 2);
  console.log(TestSession.totalCreated(), "=> expected:", 3);

  const s4 = new TestSession("dana");
  console.log(s4.id, "=> expected:", 4); // ids are not "recycled" after closing
  console.log(TestSession.activeCount(), "=> expected:", 3);

  TestSession.resetAll();
  console.log(TestSession.activeCount(), "=> expected:", 0);
  console.log(TestSession.totalCreated(), "=> expected:", 0);
  console.log(new TestSession("x").id, "=> expected:", 1);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 4: MockResponse ---");
try {
  const ok = MockResponse.ok({ id: 1 });
  console.log(ok instanceof MockResponse, "=> expected:", true);
  console.log(ok.status, "=> expected:", 200);
  console.log(ok.body, "=> expected:", { id: 1 });
  console.log(ok.isSuccess(), "=> expected:", true);

  const created = MockResponse.created({ id: 2, name: "dana" });
  console.log(created.status, "=> expected:", 201);
  console.log(created.isSuccess(), "=> expected:", true);

  const missing = MockResponse.notFound("user");
  console.log(missing.status, "=> expected:", 404);
  console.log(missing.body, "=> expected:", { error: "user not found" });
  console.log(missing.isSuccess(), "=> expected:", false);
  console.log(MockResponse.notFound().body, "=> expected:", { error: "resource not found" });

  const boom = MockResponse.serverError();
  console.log(boom.status, "=> expected:", 500);
  console.log(boom.body, "=> expected:", { error: "Internal Server Error" });
  console.log(MockResponse.serverError("DB down").body, "=> expected:", { error: "DB down" });
  console.log(boom.isSuccess(), "=> expected:", false);

  // Compile-time check only – if you uncomment the lines below, you should get a compile error:
  // new MockResponse(200, {}); // ← compile error (the constructor is private – create only via ok/created/...)
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 5 (Bonus): TestConfigStore (singleton) ---");
try {
  TestConfigStore.reset();
  const a = TestConfigStore.instance();
  const b = TestConfigStore.instance();
  console.log(a === b, "=> expected:", true); // instance() always returns the same object

  a.set("browser", "chromium");
  console.log(b.get("browser"), "=> expected:", "chromium");
  console.log(b.get("missing"), "=> expected:", undefined);
  console.log(b.size(), "=> expected:", 1);

  for (let i = 1; i <= 4; i++) a.set(`key${i}`, String(i));
  console.log(a.size(), "=> expected:", 5);
  try {
    a.set("one-too-many", "x");
    console.log("did not throw", "=> expected:", "an error");
  } catch (err) {
    if ((err as Error).message === "TODO") throw err;
    console.log((err as Error).message, "=> expected:", "Config store is full (max 5)");
  }
  a.set("browser", "firefox"); // updating an existing key – allowed
  console.log(a.get("browser"), "=> expected:", "firefox");
  console.log(a.size(), "=> expected:", 5);

  TestConfigStore.reset();
  const fresh = TestConfigStore.instance();
  console.log(fresh === a, "=> expected:", false);
  console.log(fresh.size(), "=> expected:", 0);
  console.log(fresh.get("browser"), "=> expected:", undefined);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}
