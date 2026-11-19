// Lesson 7 – Topic 03: OOP summary practice – a mini API testing framework – Exercises
// ------------------------------------------------------------
// Instructions:
//   1. Complete the body of each function/method in place of the line  throw new Error("TODO")
//      (in classes – add your own private fields as needed).
//   2. Here you build a small "mini framework", just like in examples/03-oop-summary-mini-framework.ts,
//      that combines everything we've learned: interface + union, encapsulation, abstract class + inheritance,
//      polymorphism and generics.
//   3. Each exercise is checked separately (except the bonus, which relies on run() from Exercise 4) – it's best to solve them in order.
//   4. Check yourself: npm run exercise -- 07 03 (self-check at the end of the file)
// ------------------------------------------------------------

// ---------- Contracts (given – no need to change) ----------
export interface ApiResponse<T> {
  status: number;
  body: T;
}

/** Every "HTTP client" – real or mock – must implement this contract */
export interface HttpClient {
  get<T>(path: string): ApiResponse<T>;
}

export type TestResult = { name: string; status: "passed" } | { name: string; status: "failed"; reason: string };

/** Anything you can run and get a TestResult from */
export interface Runnable {
  readonly name: string;
  run(): TestResult;
}

/**
 * Exercise 1 – formatResult: a report line for a single result (union + narrowing)
 *   { name: "login", status: "passed" }                         =>  "✔ login"
 *   { name: "cart", status: "failed", reason: "expected 2" }    =>  "✘ cart -> expected 2"
 * Hint: after checking result.status === "failed", TS "knows" there is a reason.
 */
export function formatResult(result: TestResult): string {
  throw new Error("TODO");
}

/**
 * Exercise 2 – Result<T, E>: a typed result without throwing errors
 * (In exercises.ts there is a Result<T> where the error is always a string – here E is generic, with a default of string.)
 *
 * 2a. mapResult – if result succeeded, apply fn to the value and return a new success.
 *     If it failed – return the exact same error (without calling fn!).
 *       mapResult({ ok: true, value: 200 }, (s) => s === 200)    =>  { ok: true, value: true }
 *       mapResult({ ok: false, error: "timeout" }, (s) => ...)   =>  { ok: false, error: "timeout" }
 *
 * 2b. combineResults – merges an array of results into a single result:
 *     all of them succeeded  => { ok: true, value: [all the values, in order] }   (empty array => { ok: true, value: [] })
 *     there is a failure     => the first failure (in order)
 */
export type Result<T, E = string> = { ok: true; value: T } | { ok: false; error: E };

export function mapResult<T, U, E>(result: Result<T, E>, fn: (value: T) => U): Result<U, E> {
  throw new Error("TODO");
}

export function combineResults<T, E>(results: Result<T, E>[]): Result<T[], E> {
  throw new Error("TODO");
}

/**
 * Exercise 3 – MockHttpClient: a mock "server" that implements HttpClient (encapsulation + generics)
 *   when<T>(path, response): this – registers a fixed response for a path (registering again overrides). Returns this for chaining.
 *   get<T>(path)                  – returns the response registered for the path.
 *                                   An unregistered path => { status: 404, body: null }  (body: null as T)
 *                                   Every call is recorded in the call log – including 404s.
 *   calls (getter): string[]      – a copy of all the paths that were called, in order
 *                                   (changing the copy doesn't affect the internal log).
 *   const client = new MockHttpClient().when("/health", { status: 200, body: "ok" });
 *   client.get<string>("/health")  =>  { status: 200, body: "ok" }
 *   client.calls                   =>  ["/health"]
 * Hint: a private Map<string, ApiResponse<unknown>>, and when reading – a cast as ApiResponse<T>.
 */
export class MockHttpClient implements HttpClient {
  when<T>(path: string, response: ApiResponse<T>): this {
    throw new Error("TODO");
  }
  get<T>(path: string): ApiResponse<T> {
    throw new Error("TODO");
  }
  get calls(): string[] {
    throw new Error("TODO");
  }
}

/**
 * Exercise 4 – ApiCheck<T>: a generic abstract class + StatusCheck that inherits from it
 *
 * 4a. ApiCheck.run() – a "Template Method":
 *     1. Call this.client.get<T>(this.path)
 *     2. Pass the response to this.verify(response) – which each subclass implements differently
 *     3. If everything passed     => { name, status: "passed" }
 *        If an error was thrown  => { name, status: "failed", reason: the error message }
 *     Note: even if client.get itself throws (for example "network down") – that's a test failure,
 *     not a crash of the run.
 *
 * 4b. StatusCheck.verify – if response.status differs from expectedStatus, throw an Error with the exact message:
 *       "expected status 200, got 500"
 */
export abstract class ApiCheck<T> implements Runnable {
  constructor(
    public readonly name: string,
    protected readonly client: HttpClient,
    protected readonly path: string,
  ) {}

  protected abstract verify(response: ApiResponse<T>): void;

  run(): TestResult {
    throw new Error("TODO");
  }
}

export class StatusCheck extends ApiCheck<unknown> {
  constructor(
    name: string,
    client: HttpClient,
    path: string,
    private readonly expectedStatus: number,
  ) {
    super(name, client, path);
  }

  protected verify(response: ApiResponse<unknown>): void {
    throw new Error("TODO");
  }
}

/**
 * Exercise 5 – TestRunner: runs any Runnable (polymorphism)
 * The runner doesn't know or care whether it's a StatusCheck, another check or a plain object – only that it has run().
 *   add(...tests): this      – adds tests (chaining)
 *   run(grep?): RunReport    – runs the tests in the order they were added and returns a report:
 *       results – a TestResult for each test that ran
 *       total / passed / failed – counts
 *     - grep (optional): run only tests whose name contains the string (like --grep in Playwright).
 *     - If a test's run() throws by itself (a bug in the test) – don't crash! Record
 *       { name: test.name, status: "failed", reason: the error message } and continue to the next test.
 */
export interface RunReport {
  results: TestResult[];
  total: number;
  passed: number;
  failed: number;
}

export class TestRunner {
  add(...tests: Runnable[]): this {
    throw new Error("TODO");
  }
  run(grep?: string): RunReport {
    throw new Error("TODO");
  }
}

/**
 * Exercise 6 (Bonus) – BodyFieldCheck<T, K>: a generic check for a field in the response body
 * Inherits from ApiCheck<T> and combines all the topics: abstract + generics + keyof.
 * verify should:
 *   1. Make sure the status is 200, otherwise throw: "expected status 200, got 404"
 *   2. Make sure response.body[field] === expected, otherwise throw:
 *        "expected name to be Dana, got Yossi"      (field=name, expected=Dana, actual=Yossi)
 *      Hint: String(this.field) – because keyof T can also be a symbol.
 *   new BodyFieldCheck<User, "name">("user 1 name", client, "/users/1", "name", "Dana")
 */
export class BodyFieldCheck<T, K extends keyof T> extends ApiCheck<T> {
  constructor(
    name: string,
    client: HttpClient,
    path: string,
    private readonly field: K,
    private readonly expected: T[K],
  ) {
    super(name, client, path);
  }

  protected verify(response: ApiResponse<T>): void {
    throw new Error("TODO");
  }
}

// ============================================================
// Self-check – run:  npm run exercise -- 07 03
// On every line, the value left of "=> expected:" must equal the value on its right.
// (No need to change the code below this line)
// ============================================================

interface User {
  id: number;
  name: string;
}

/** A simple mock HTTP client for the self-check – an unknown path "takes the network down" */
function stubClient(responses: Record<string, ApiResponse<unknown>>, log: string[] = []): HttpClient {
  return {
    get<T>(path: string): ApiResponse<T> {
      log.push(path);
      const response = responses[path];
      if (!response) throw new Error("network down");
      return response as ApiResponse<T>;
    },
  };
}

console.log("\n--- Exercise 1: formatResult ---");
try {
  console.log(formatResult({ name: "login", status: "passed" }), "=> expected:", "✔ login");
  console.log(formatResult({ name: "cart", status: "failed", reason: "expected 2" }), "=> expected:", "✘ cart -> expected 2");
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 2: mapResult & combineResults ---");
try {
  console.log(
    mapResult({ ok: true, value: 200 }, (s) => s === 200),
    "=> expected:",
    { ok: true, value: true },
  );
  let called = false;
  const failed: Result<number> = { ok: false, error: "timeout" };
  console.log(
    mapResult<number, number, string>(failed, (s) => {
      called = true;
      return s * 2;
    }),
    "=> expected:",
    { ok: false, error: "timeout" },
  );
  console.log("Was fn called on a failure?", called, "=> expected:", "Was fn called on a failure?", false);

  // Generic E – the error can also be an object (and the exact same object is passed on)
  const httpError = { code: 503 };
  const mapped = mapResult<number, string, { code: number }>({ ok: false, error: httpError }, String);
  console.log("Exact same error?", mapped.ok === false && mapped.error === httpError, "=> expected:", "Exact same error?", true);

  console.log(
    combineResults([
      { ok: true, value: 1 },
      { ok: true, value: 2 },
    ]),
    "=> expected:",
    { ok: true, value: [1, 2] },
  );
  console.log(combineResults([]), "=> expected:", { ok: true, value: [] });
  console.log(
    combineResults<number, string>([
      { ok: true, value: 1 },
      { ok: false, error: "first" },
      { ok: false, error: "second" },
    ]),
    "=> expected:",
    { ok: false, error: "first" },
  );
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 3: MockHttpClient ---");
try {
  const client = new MockHttpClient();
  const chained = client.when("/health", { status: 200, body: "ok" });
  console.log("Does when return this?", chained === client, "=> expected:", "Does when return this?", true);
  client.when<User>("/users/1", { status: 200, body: { id: 1, name: "Dana" } });

  console.log(client.get<string>("/health"), "=> expected:", { status: 200, body: "ok" });
  console.log(client.get<User>("/users/1").body.name, "=> expected:", "Dana");
  console.log(client.get("/nope"), "=> expected:", { status: 404, body: null });

  // Registering again overrides
  client.when("/health", { status: 503, body: "down" });
  console.log(client.get("/health").status, "=> expected:", 503);

  console.log(client.calls, "=> expected:", ["/health", "/users/1", "/nope", "/health"]);
  const copy = client.calls;
  copy.push("hacked");
  console.log("calls after changing the copy:", client.calls.length, "=> expected:", "calls after changing the copy:", 4);

  console.log(new MockHttpClient().calls, "=> expected:", []);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 4: ApiCheck & StatusCheck ---");
try {
  const log: string[] = [];
  const client = stubClient(
    {
      "/health": { status: 200, body: "ok" },
      "/broken": { status: 500, body: "error" },
      "/tags": { status: 200, body: [] },
    },
    log,
  );

  console.log(new StatusCheck("health is up", client, "/health", 200).run(), "=> expected:", {
    name: "health is up",
    status: "passed",
  });
  console.log("Paths called:", log, "=> expected:", "Paths called:", ["/health"]);

  console.log(new StatusCheck("broken returns 200", client, "/broken", 200).run(), "=> expected:", {
    name: "broken returns 200",
    status: "failed",
    reason: "expected status 200, got 500",
  });
  console.log(new StatusCheck("broken returns 500", client, "/broken", 500).run().status, "=> expected:", "passed");

  // A network error (client.get throws) => a failure, not a crash
  console.log(new StatusCheck("offline", client, "/offline", 200).run(), "=> expected:", {
    name: "offline",
    status: "failed",
    reason: "network down",
  });

  // polymorphism: a new subclass – the base class's run() works for it too
  class NonEmptyListCheck extends ApiCheck<string[]> {
    protected verify(response: ApiResponse<string[]>): void {
      if (response.body.length === 0) throw new Error("list is empty");
    }
  }
  console.log(new NonEmptyListCheck("tags not empty", client, "/tags").run(), "=> expected:", {
    name: "tags not empty",
    status: "failed",
    reason: "list is empty",
  });
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 5: TestRunner ---");
try {
  const pass = (name: string): Runnable => ({ name, run: () => ({ name, status: "passed" }) });
  const fail = (name: string, reason: string): Runnable => ({
    name,
    run: () => ({ name, status: "failed", reason }),
  });
  const crash: Runnable = {
    name: "buggy test",
    run: () => {
      throw new Error("oops");
    },
  };

  const runner = new TestRunner();
  console.log("Does add return this?", runner.add(pass("login works")) === runner, "=> expected:", "Does add return this?", true);
  runner.add(fail("cart total", "expected 2"), crash, pass("logout works"));

  console.log(runner.run(), "=> expected:", {
    results: [
      { name: "login works", status: "passed" },
      { name: "cart total", status: "failed", reason: "expected 2" },
      { name: "buggy test", status: "failed", reason: "oops" },
      { name: "logout works", status: "passed" },
    ],
    total: 4,
    passed: 2,
    failed: 2,
  });

  const filtered = runner.run("works");
  console.log(
    filtered.results.map((r) => r.name),
    "=> expected:",
    ["login works", "logout works"],
  );
  console.log("total/failed:", filtered.total, filtered.failed, "=> expected:", "total/failed:", 2, 0);

  console.log(runner.run("no-such-test"), "=> expected:", { results: [], total: 0, passed: 0, failed: 0 });
  console.log(new TestRunner().run(), "=> expected:", { results: [], total: 0, passed: 0, failed: 0 });
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 6 (Bonus): BodyFieldCheck ---");
try {
  const client = stubClient({
    "/users/1": { status: 200, body: { id: 1, name: "Dana" } },
    "/users/2": { status: 200, body: { id: 2, name: "Yossi" } },
    "/users/999": { status: 404, body: null },
  });

  console.log(new BodyFieldCheck<User, "name">("user 1 name", client, "/users/1", "name", "Dana").run(), "=> expected:", {
    name: "user 1 name",
    status: "passed",
  });
  console.log(new BodyFieldCheck<User, "id">("user 2 id", client, "/users/2", "id", 2).run().status, "=> expected:", "passed");
  console.log(new BodyFieldCheck<User, "name">("user 2 name", client, "/users/2", "name", "Dana").run(), "=> expected:", {
    name: "user 2 name",
    status: "failed",
    reason: "expected name to be Dana, got Yossi",
  });
  console.log(new BodyFieldCheck<User, "name">("missing user", client, "/users/999", "name", "Dana").run(), "=> expected:", {
    name: "missing user",
    status: "failed",
    reason: "expected status 200, got 404",
  });

  // Fits into TestRunner like any other Runnable
  const report = new TestRunner()
    .add(new BodyFieldCheck<User, "name">("ok", client, "/users/1", "name", "Dana"))
    .add(new StatusCheck("404", client, "/users/999", 404))
    .run();
  console.log("passed:", report.passed, "=> expected:", "passed:", 2);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}
