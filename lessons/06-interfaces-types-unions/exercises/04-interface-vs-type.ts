// Lesson 6 – Topic 04: interface vs. type – Exercises
// ------------------------------------------------------------
// Instructions:
//   1. Fill in the body of each function/method in place of the line  throw new Error("TODO")
//   2. In each exercise, notice which tool was chosen (interface or type) and why –
//      and add implements to the classes where marked TODO.
//   3. Check yourself: npm run exercise -- 06 04 (self-check at the end of the file)
// ------------------------------------------------------------

/**
 * Exercise 1 – extends vs. & : two ways to the same shape
 * CiConfigI (interface + extends) and CiConfigT (type + &) describe exactly the same shape.
 * toCiConfig(base, ci) returns a new object that combines both parts.
 * If ci.workers is less than 1 – throw an Error with the message "workers must be at least 1".
 *
 *   toCiConfig({ baseUrl: "http://localhost:3000", timeoutMs: 5000 }, { retries: 2, workers: 4 })
 *     => { baseUrl: "http://localhost:3000", timeoutMs: 5000, retries: 2, workers: 4 }
 *
 * Note: the function declares that it returns CiConfigT, but in the checks the result is stored
 * in a variable of type CiConfigI – and that works, because TS compares shape, not name.
 */
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
  throw new Error("TODO");
}

/**
 * Exercise 2 – Declaration merging (interface only!)
 * TestContext is defined in three parts – TS merges them into one interface with all the fields.
 *   createContext(testName, startedAt, tags?) – returns a complete TestContext
 *       (tags not passed => an empty array)
 *   describeContext(ctx) – "<testName> @<startedAt>"  and if there are tags:  " [<tag1>, <tag2>]"
 *
 *   describeContext(createContext("login", 1000, ["smoke", "ui"])) => "login @1000 [smoke, ui]"
 *   describeContext(createContext("logout", 2000))                 => "logout @2000"
 *
 * Hint: try returning an object without tags from createContext – TS will complain, because the field came from the "third part".
 */
export interface TestContext {
  testName: string;
}
export interface TestContext {
  startedAt: number;
}
export interface TestContext {
  tags: string[];
}

export function createContext(testName: string, startedAt: number, tags?: string[]): TestContext {
  throw new Error("TODO");
}

export function describeContext(ctx: TestContext): string {
  throw new Error("TODO");
}

/**
 * Exercise 3 – type for a union, interface for an object – together
 * Outcome is a union of literals (only possible with type), and TestRecord is an interface that uses it.
 * classifyAttempts(attempts) takes a test's attempt results (true = passed), in order:
 *   []                                    => "skipped"   (didn't run at all)
 *   the last attempt failed               => "failed"
 *   everything passed                     => "passed"
 *   the last one passed but an earlier one failed => "flaky"
 * toRecord(name, attempts) => a TestRecord with name, outcome (from classifyAttempts) and attempts = the number of attempts
 *
 *   classifyAttempts([false, true])  => "flaky"
 *   toRecord("search", [false, false]) => { name: "search", outcome: "failed", attempts: 2 }
 */
export type Outcome = "passed" | "failed" | "skipped" | "flaky";

export interface TestRecord {
  name: string;
  outcome: Outcome;
  attempts: number;
}

export function classifyAttempts(attempts: boolean[]): Outcome {
  throw new Error("TODO");
}

export function toRecord(name: string, attempts: boolean[]): TestRecord {
  throw new Error("TODO");
}

/**
 * Exercise 4 – Classes that implement both a type and an interface
 * Clock is a type (an object shape), Timer is an interface – a class can implement both.
 *   FakeClock implements Clock – a fake clock for tests:
 *       now()       – the current time (starts at the value passed to the constructor)
 *       advance(ms) – moves the time forward by ms
 *   StopWatch implements Timer – takes a Clock in its constructor (any Clock – real or fake):
 *       start() – starts a measurement
 *       stop()  – returns how many ms have passed since start. If start wasn't called – throw an Error with the message
 *                 "StopWatch was not started". After stop, a new start is required.
 *
 *   const clock = new FakeClock(1000);
 *   const sw = new StopWatch(clock);
 *   sw.start(); clock.advance(250); sw.stop()  => 250
 *
 * Hint: StopWatch stores clock.now() at start time (or undefined when it's not running).
 */
export type Clock = { now(): number };

export interface Timer {
  start(): void;
  stop(): number;
}

export class FakeClock /* TODO: implements Clock */ {
  // parameter property – the private field currentTime is created and stored automatically
  constructor(private currentTime: number) {}
  now(): number {
    throw new Error("TODO");
  }
  advance(ms: number): void {
    throw new Error("TODO");
  }
}

export class StopWatch /* TODO: implements Timer */ {
  constructor(private readonly clock: Clock) {}
  start(): void {
    throw new Error("TODO");
  }
  stop(): number {
    throw new Error("TODO");
  }
}

/**
 * Exercise 5 (Bonus) – Choosing the right tool: interface for an API response, type for combining
 * Paginated is an interface for a paginated API response.
 * PageInfo is a type that combines (&) some of the fields (Omit without items) with computed fields.
 * Return a PageInfo:
 *   page, pageSize, total – as in the response
 *   totalPages – Math.ceil(total / pageSize)   (total = 0 => 0)
 *   hasNext    – page < totalPages
 *   hasPrev    – page > 1
 * If pageSize < 1 or page < 1 – throw an Error with the message "Invalid pagination".
 *
 *   pageInfo({ items: ["a", "b"], page: 1, pageSize: 2, total: 5 })
 *     => { page: 1, pageSize: 2, total: 5, totalPages: 3, hasNext: true, hasPrev: false }
 *
 * Hint: the result must not include items (Omit!) – build a new object field by field.
 */
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
  throw new Error("TODO");
}

// ============================================================
// Self-check – run:  npm run exercise -- 06 04
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
