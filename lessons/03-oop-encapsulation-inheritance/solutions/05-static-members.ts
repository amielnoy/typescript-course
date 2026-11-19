// Lesson 3 – Topic 05: Static Members and Factory Methods – Solutions

// ---------- Warm-ups (in class, ~5 minutes each) ----------
// Two short exercises we solve during the lesson, right after the examples – before Exercise 1.

export class Units {
  static readonly DEFAULT_TIMEOUT_MS = 30000;

  static msToSeconds(ms: number): number {
    return ms / 1000;
  }

  static secondsToMs(seconds: number): number {
    return seconds * 1000;
  }

  static isTooSlow(ms: number): boolean {
    return ms > Units.DEFAULT_TIMEOUT_MS; // a static member – through the class name, not this
  }
}

export class TestRun {
  private static created = 0; // one counter for the whole class
  readonly number: number;

  constructor(readonly name: string) {
    TestRun.created++;
    this.number = TestRun.created; // every object keeps its own copy of the number
  }

  label(): string {
    return `#${this.number} ${this.name}`;
  }

  static total(): number {
    return TestRun.created;
  }

  static reset(): void {
    TestRun.created = 0;
  }
}

// ---------- Exercises ----------

export class TestEnv {
  static readonly DEV = "http://localhost:3000";
  static readonly STAGING = "https://staging.example.com";
  static readonly PROD = "https://example.com";

  static urlFor(env: string): string {
    switch (env.toLowerCase()) {
      case "dev":
        return TestEnv.DEV;
      case "staging":
        return TestEnv.STAGING;
      case "prod":
        return TestEnv.PROD;
      default:
        throw new Error(`Unknown env: ${env}`);
    }
  }

  static isSafeForWrites(env: string): boolean {
    // urlFor already checks that the environment is valid (and throws if not) – reusing a static method
    return TestEnv.urlFor(env) !== TestEnv.PROD;
  }
}

export class SequenceIds {
  private static counters = new Map<string, number>(); // shared by the whole class

  static next(prefix = "TC"): string {
    const n = SequenceIds.peek(prefix) + 1;
    SequenceIds.counters.set(prefix, n);
    return `${prefix}-${String(n).padStart(3, "0")}`;
  }

  static peek(prefix = "TC"): number {
    return SequenceIds.counters.get(prefix) ?? 0;
  }

  static reset(): void {
    SequenceIds.counters.clear();
  }
}

export class TestSession {
  private static lastId = 0;
  private static active = 0;

  readonly id: number;
  readonly user: string;
  private closed = false; // belongs to each object separately

  constructor(user: string) {
    TestSession.lastId++;
    TestSession.active++;
    this.id = TestSession.lastId;
    this.user = user;
  }

  close(): void {
    if (this.closed) return;
    this.closed = true;
    TestSession.active--;
  }

  isOpen(): boolean {
    return !this.closed;
  }

  static activeCount(): number {
    return TestSession.active;
  }

  static totalCreated(): number {
    return TestSession.lastId;
  }

  static resetAll(): void {
    TestSession.lastId = 0;
    TestSession.active = 0;
  }
}

export class MockResponse {
  private constructor(
    public readonly status: number,
    public readonly body: unknown,
  ) {}

  static ok(body: unknown): MockResponse {
    return new MockResponse(200, body); // inside the class it's allowed to call the private constructor
  }

  static created(body: unknown): MockResponse {
    return new MockResponse(201, body);
  }

  static notFound(resource = "resource"): MockResponse {
    return new MockResponse(404, { error: `${resource} not found` });
  }

  static serverError(message = "Internal Server Error"): MockResponse {
    return new MockResponse(500, { error: message });
  }

  isSuccess(): boolean {
    return this.status >= 200 && this.status <= 299;
  }
}

export class TestConfigStore {
  static readonly MAX_KEYS = 5;
  private static current: TestConfigStore | undefined;

  private values = new Map<string, string>();

  private constructor() {}

  static instance(): TestConfigStore {
    if (TestConfigStore.current === undefined) {
      TestConfigStore.current = new TestConfigStore();
    }
    return TestConfigStore.current;
  }

  static reset(): void {
    TestConfigStore.current = undefined;
  }

  set(key: string, value: string): void {
    const isNewKey = !this.values.has(key);
    if (isNewKey && this.size() >= TestConfigStore.MAX_KEYS) {
      throw new Error(`Config store is full (max ${TestConfigStore.MAX_KEYS})`);
    }
    this.values.set(key, value);
  }

  get(key: string): string | undefined {
    return this.values.get(key);
  }

  size(): number {
    return this.values.size;
  }
}

// ============================================================
// Self-check – run:  npm run solution -- 03 05
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
