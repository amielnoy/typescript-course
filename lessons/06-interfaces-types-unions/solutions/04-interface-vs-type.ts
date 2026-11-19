// Lesson 6 – Topic 04: interface vs. type – Solutions

// ---------- Exercise 1 ----------
export interface BaseConfigI {
  baseUrl: string;
  timeoutMs: number;
}
export interface CiConfigI extends BaseConfigI {
  retries: number;
  workers: number;
}

export type BaseConfigT = { baseUrl: string; timeoutMs: number };
export type CiConfigT = BaseConfigT & { retries: number; workers: number };

export function toCiConfig(base: BaseConfigI, ci: { retries: number; workers: number }): CiConfigT {
  if (ci.workers < 1) {
    throw new Error("workers must be at least 1");
  }
  // base is a BaseConfigI but also matches BaseConfigT – exactly the same shape
  return { ...base, ...ci };
}

// ---------- Exercise 2 ----------
// The three declarations merge into one interface: { testName; startedAt; tags }
export interface TestContext {
  testName: string;
}
export interface TestContext {
  startedAt: number;
}
export interface TestContext {
  tags: string[];
}

export function createContext(testName: string, startedAt: number, tags: string[] = []): TestContext {
  return { testName, startedAt, tags };
}

export function describeContext(ctx: TestContext): string {
  const head = `${ctx.testName} @${ctx.startedAt}`;
  return ctx.tags.length === 0 ? head : `${head} [${ctx.tags.join(", ")}]`;
}

// ---------- Exercise 3 ----------
export type Outcome = "passed" | "failed" | "skipped" | "flaky";

export interface TestRecord {
  name: string;
  outcome: Outcome;
  attempts: number;
}

export function classifyAttempts(attempts: boolean[]): Outcome {
  if (attempts.length === 0) return "skipped";
  if (!attempts[attempts.length - 1]) return "failed";
  return attempts.every((passed) => passed) ? "passed" : "flaky";
}

export function toRecord(name: string, attempts: boolean[]): TestRecord {
  return { name, outcome: classifyAttempts(attempts), attempts: attempts.length };
}

// ---------- Exercise 4 ----------
export type Clock = { now(): number };

export interface Timer {
  start(): void;
  stop(): number;
}

// A class can implement a type – as long as it describes an object shape (not a union)
export class FakeClock implements Clock {
  constructor(private currentTime: number) {}

  now(): number {
    return this.currentTime;
  }

  advance(ms: number): void {
    this.currentTime += ms;
  }
}

export class StopWatch implements Timer {
  private startedAt: number | undefined;

  constructor(private readonly clock: Clock) {}

  start(): void {
    this.startedAt = this.clock.now();
  }

  stop(): number {
    if (this.startedAt === undefined) {
      throw new Error("StopWatch was not started");
    }
    const elapsed = this.clock.now() - this.startedAt;
    this.startedAt = undefined;
    return elapsed;
  }
}

// ---------- Exercise 5 (Bonus) ----------
export interface Paginated {
  items: string[];
  page: number;
  pageSize: number;
  total: number;
}

export type PageInfo = Omit<Paginated, "items"> & {
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

export function pageInfo(response: Paginated): PageInfo {
  const { page, pageSize, total } = response;
  if (pageSize < 1 || page < 1) {
    throw new Error("Invalid pagination");
  }
  const totalPages = Math.ceil(total / pageSize);
  return { page, pageSize, total, totalPages, hasNext: page < totalPages, hasPrev: page > 1 };
}

// ============================================================
// Self-check – run:  npm run solution -- 06 04
// On every line, the value left of "=> expected:" must equal the value on its right.
// (No need to change the code below this line)
// ============================================================

console.log("\n--- Exercise 1: toCiConfig ---");
try {
  const base = { baseUrl: "http://localhost:3000", timeoutMs: 5000 };
  // CiConfigT stored in a variable of type CiConfigI – same shape, so it compiles
  const cfg: CiConfigI = toCiConfig(base, { retries: 2, workers: 4 });
  console.log(cfg, "=> expected:", { baseUrl: "http://localhost:3000", timeoutMs: 5000, retries: 2, workers: 4 });
  console.log(base, "=> expected:", { baseUrl: "http://localhost:3000", timeoutMs: 5000 }); // base must not change
  console.log(toCiConfig(base, { retries: 0, workers: 1 }).workers, "=> expected:", 1);
  try {
    toCiConfig(base, { retries: 0, workers: 0 });
    console.log("did not throw", "=> expected:", "threw:", "workers must be at least 1");
  } catch (err) {
    if ((err as Error).message === "TODO") throw err;
    console.log("threw:", (err as Error).message, "=> expected:", "threw:", "workers must be at least 1");
  }
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 2: createContext + describeContext ---");
try {
  const ctx = createContext("login", 1000, ["smoke", "ui"]);
  console.log(ctx, "=> expected:", { testName: "login", startedAt: 1000, tags: ["smoke", "ui"] });
  console.log(describeContext(ctx), "=> expected:", "login @1000 [smoke, ui]");
  const noTags = createContext("logout", 2000);
  console.log(noTags, "=> expected:", { testName: "logout", startedAt: 2000, tags: [] });
  console.log(describeContext(noTags), "=> expected:", "logout @2000");
  console.log(describeContext({ testName: "x", startedAt: 0, tags: ["api"] }), "=> expected:", "x @0 [api]");
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 3: classifyAttempts + toRecord ---");
try {
  console.log(classifyAttempts([]), "=> expected:", "skipped");
  console.log(classifyAttempts([true]), "=> expected:", "passed");
  console.log(classifyAttempts([true, true]), "=> expected:", "passed");
  console.log(classifyAttempts([false]), "=> expected:", "failed");
  console.log(classifyAttempts([true, false]), "=> expected:", "failed");
  console.log(classifyAttempts([false, true]), "=> expected:", "flaky");
  console.log(classifyAttempts([false, false, true]), "=> expected:", "flaky");
  console.log(toRecord("search", [false, false]), "=> expected:", { name: "search", outcome: "failed", attempts: 2 });
  console.log(toRecord("login", [false, true]), "=> expected:", { name: "login", outcome: "flaky", attempts: 2 });
  console.log(toRecord("pay", []), "=> expected:", { name: "pay", outcome: "skipped", attempts: 0 });
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 4: FakeClock + StopWatch ---");
try {
  const clock = new FakeClock(1000);
  console.log(clock.now(), "=> expected:", 1000);
  clock.advance(500);
  console.log(clock.now(), "=> expected:", 1500);

  const sw = new StopWatch(clock);
  const stopShouldThrow = (): void => {
    try {
      sw.stop();
      console.log("did not throw", "=> expected:", "threw:", "StopWatch was not started");
    } catch (err) {
      if ((err as Error).message === "TODO") throw err;
      console.log("threw:", (err as Error).message, "=> expected:", "threw:", "StopWatch was not started");
    }
  };
  stopShouldThrow(); // stop before start
  sw.start();
  clock.advance(250);
  console.log(sw.stop(), "=> expected:", 250);
  stopShouldThrow(); // after stop, a new start is required

  sw.start();
  clock.advance(10);
  clock.advance(20);
  console.log(sw.stop(), "=> expected:", 30);

  // StopWatch works with any object that matches Clock – even without a class
  let t = 0;
  const inlineClock = { now: () => t };
  const sw2 = new StopWatch(inlineClock);
  sw2.start();
  t = 42;
  console.log(sw2.stop(), "=> expected:", 42);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 5 (Bonus): pageInfo ---");
try {
  console.log(pageInfo({ items: ["a", "b"], page: 1, pageSize: 2, total: 5 }), "=> expected:", {
    page: 1,
    pageSize: 2,
    total: 5,
    totalPages: 3,
    hasNext: true,
    hasPrev: false,
  });
  console.log(pageInfo({ items: ["e"], page: 3, pageSize: 2, total: 5 }), "=> expected:", {
    page: 3,
    pageSize: 2,
    total: 5,
    totalPages: 3,
    hasNext: false,
    hasPrev: true,
  });
  console.log(pageInfo({ items: [], page: 1, pageSize: 10, total: 0 }), "=> expected:", {
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });
  console.log("items" in pageInfo({ items: ["a"], page: 1, pageSize: 1, total: 1 }), "=> expected:", false);
  const invalid: Paginated[] = [
    { items: [], page: 1, pageSize: 0, total: 3 },
    { items: [], page: 0, pageSize: 5, total: 3 },
  ];
  for (const bad of invalid) {
    try {
      pageInfo(bad);
      console.log("did not throw", "=> expected:", "threw:", "Invalid pagination");
    } catch (err) {
      if ((err as Error).message === "TODO") throw err;
      console.log("threw:", (err as Error).message, "=> expected:", "threw:", "Invalid pagination");
    }
  }
} catch (e) {
  console.log("  ✋", (e as Error).message);
}
