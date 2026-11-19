// Lesson 7 – Topic 03: OOP summary practice – a mini API testing framework – Solutions

// ---------- Contracts ----------
export interface ApiResponse<T> {
  status: number;
  body: T;
}

export interface HttpClient {
  get<T>(path: string): ApiResponse<T>;
}

export type TestResult = { name: string; status: "passed" } | { name: string; status: "failed"; reason: string };

export interface Runnable {
  readonly name: string;
  run(): TestResult;
}

// ---------- Exercise 1 ----------
export function formatResult(result: TestResult): string {
  if (result.status === "failed") {
    return `✘ ${result.name} -> ${result.reason}`; // here TS knows there is a reason
  }
  return `✔ ${result.name}`;
}

// ---------- Exercise 2 ----------
export type Result<T, E = string> = { ok: true; value: T } | { ok: false; error: E };

export function mapResult<T, U, E>(result: Result<T, E>, fn: (value: T) => U): Result<U, E> {
  if (!result.ok) return result; // the failure is "passed on" as is
  return { ok: true, value: fn(result.value) };
}

export function combineResults<T, E>(results: Result<T, E>[]): Result<T[], E> {
  const values: T[] = [];
  for (const result of results) {
    if (!result.ok) return result; // the first failure stops everything
    values.push(result.value);
  }
  return { ok: true, value: values };
}

// ---------- Exercise 3 ----------
export class MockHttpClient implements HttpClient {
  private routes = new Map<string, ApiResponse<unknown>>();
  private callLog: string[] = [];

  when<T>(path: string, response: ApiResponse<T>): this {
    this.routes.set(path, response);
    return this;
  }

  get<T>(path: string): ApiResponse<T> {
    this.callLog.push(path);
    const response = this.routes.get(path);
    if (!response) return { status: 404, body: null as T };
    return response as ApiResponse<T>;
  }

  get calls(): string[] {
    return [...this.callLog]; // a copy – the log can't be changed from the outside
  }
}

// ---------- Exercise 4 ----------
export abstract class ApiCheck<T> implements Runnable {
  constructor(
    public readonly name: string,
    protected readonly client: HttpClient,
    protected readonly path: string,
  ) {}

  protected abstract verify(response: ApiResponse<T>): void;

  // Template Method: the skeleton is fixed, only verify changes between the subclasses
  run(): TestResult {
    try {
      const response = this.client.get<T>(this.path);
      this.verify(response);
      return { name: this.name, status: "passed" };
    } catch (err) {
      return { name: this.name, status: "failed", reason: err instanceof Error ? err.message : String(err) };
    }
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
    if (response.status !== this.expectedStatus) {
      throw new Error(`expected status ${this.expectedStatus}, got ${response.status}`);
    }
  }
}

// ---------- Exercise 5 ----------
export interface RunReport {
  results: TestResult[];
  total: number;
  passed: number;
  failed: number;
}

export class TestRunner {
  private tests: Runnable[] = [];

  add(...tests: Runnable[]): this {
    this.tests.push(...tests);
    return this;
  }

  run(grep?: string): RunReport {
    const selected = grep === undefined ? this.tests : this.tests.filter((t) => t.name.includes(grep));
    const results = selected.map((test) => this.runSafely(test));
    const passed = results.filter((r) => r.status === "passed").length;
    return { results, total: results.length, passed, failed: results.length - passed };
  }

  // A buggy test doesn't bring down the whole run
  private runSafely(test: Runnable): TestResult {
    try {
      return test.run();
    } catch (err) {
      return { name: test.name, status: "failed", reason: err instanceof Error ? err.message : String(err) };
    }
  }
}

// ---------- Exercise 6 (Bonus) ----------
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
    if (response.status !== 200) {
      throw new Error(`expected status 200, got ${response.status}`);
    }
    const actual = response.body[this.field];
    if (actual !== this.expected) {
      throw new Error(`expected ${String(this.field)} to be ${String(this.expected)}, got ${String(actual)}`);
    }
  }
}

// ============================================================
// Self-check – run:  npm run solution -- 07 03
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
