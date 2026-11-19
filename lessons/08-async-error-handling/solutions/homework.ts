// Lesson 8 – Homework: An API smoke suite for the Users service – Solution
// Check yourself: npm run solution -- 08 hw (self-check at the end of the file)
// ------------------------------------------------------------
// Scenario:
//   A new build of the Users service was deployed and you are asked for a quick "smoke" verdict before
//   the full regression starts: is the service up, do the basic endpoints answer correctly,
//   and does a full create → read → verify → delete → verify-404 flow work end to end?
//   You build it in layers, the same way a real API test framework is built:
//     typed errors → one request function (fetch + timeout) → retry with backoff → a typed API client
//     → a CRUD smoke flow with cleanup → a parallel suite runner with a report → the full smoke suite.
//   The self-check at the end of the file starts the course's Mock server (shared/mock-api) on a random port
//   and passes you its address in baseUrl (e.g. "http://127.0.0.1:54321"). No internet needed.
//   Endpoints that exist in the Mock server:
//     GET    /health      -> 200 { status: "ok" }
//     GET    /users       -> 200 [ ...users ]
//     GET    /users/:id   -> 200 user  |  404 { error: "User <id> not found" }
//     POST   /users       -> 201 user  |  400 { error: "name and email are required" }
//     DELETE /users/:id   -> 204 (no body)  |  404 { error: "User <id> not found" }
//     GET    /slow?ms=N   -> 200 { waited: N } after N milliseconds
// ------------------------------------------------------------
import type { User } from "../../../shared/mock-api/server.ts";

export type HttpMethod = "GET" | "POST" | "DELETE";

/**
 * Task 1 – Typed errors: HttpError, TimeoutError and isTransient
 */
export class HttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly method: HttpMethod,
    public readonly path: string,
    serverMessage: string,
  ) {
    super(`${method} ${path} -> ${status}: ${serverMessage}`);
    this.name = "HttpError";
  }
}

export class TimeoutError extends Error {
  constructor(public readonly ms: number) {
    super(`Timed out after ${ms}ms`);
    this.name = "TimeoutError";
  }
}

export function isTransient(err: unknown): boolean {
  if (err instanceof TimeoutError) return true;
  if (err instanceof HttpError) return err.status === 0 || err.status === 429 || err.status >= 500;
  return false;
}

// A small helper used by Task 2 and Task 6: race a promise against a timer that rejects with TimeoutError
async function raceWithTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new TimeoutError(ms)), ms);
  });
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    clearTimeout(timer); // otherwise the timer keeps the process alive
  }
}

/**
 * Task 2 – request: one function for every HTTP call
 */
export async function request<T>(
  baseUrl: string,
  method: HttpMethod,
  path: string,
  options: { body?: unknown; timeoutMs?: number } = {},
): Promise<T> {
  const { body, timeoutMs = 2000 } = options;

  const call = async (): Promise<T> => {
    let res: Response;
    try {
      res = await fetch(`${baseUrl}${path}`, {
        method,
        headers: body === undefined ? undefined : { "Content-Type": "application/json" },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
    } catch {
      // fetch itself failed – no response at all (like status 0 in the browser's DevTools)
      throw new HttpError(0, method, path, "Network error");
    }

    if (res.status === 204) return undefined as T; // 204 has no body
    const data = await res.json();
    if (!res.ok) throw new HttpError(res.status, method, path, data?.error ?? res.statusText);
    return data as T;
  };

  return raceWithTimeout(call(), timeoutMs);
}

/**
 * Task 3 – withRetry: retry with exponential backoff
 */
export interface RetryOptions {
  attempts: number;
  baseDelayMs: number;
  shouldRetry: (err: unknown) => boolean;
  sleep: (ms: number) => Promise<void>;
}

export async function withRetry<T>(fn: (attempt: number) => Promise<T>, options: RetryOptions): Promise<T> {
  const { attempts, baseDelayMs, shouldRetry, sleep } = options;
  let lastError: unknown;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await fn(attempt);
    } catch (err) {
      lastError = err;
      if (!shouldRetry(err)) throw err; // a real bug – no point in retrying
      if (attempt < attempts) await sleep(baseDelayMs * 2 ** (attempt - 1));
    }
  }
  throw lastError;
}

/**
 * Task 4 – createUsersApi: a typed client for the Users service
 */
export interface UserInput {
  name: string;
  email: string;
  role?: User["role"];
}

export interface UsersApi {
  listUsers(): Promise<User[]>;
  getUser(id: number): Promise<User>;
  createUser(input: UserInput): Promise<User>;
  deleteUser(id: number): Promise<void>;
}

export interface ClientOptions {
  timeoutMs: number;
  attempts: number;
  baseDelayMs: number;
  sleep: (ms: number) => Promise<void>;
}

export function createUsersApi(baseUrl: string, options: ClientOptions): UsersApi {
  const { timeoutMs, attempts, baseDelayMs, sleep } = options;

  // GET and DELETE are idempotent – safe to repeat on a transient failure
  const retried = <T>(method: HttpMethod, path: string): Promise<T> =>
    withRetry(() => request<T>(baseUrl, method, path, { timeoutMs }), {
      attempts,
      baseDelayMs,
      shouldRetry: isTransient,
      sleep,
    });

  return {
    listUsers: () => retried<User[]>("GET", "/users"),
    getUser: (id) => retried<User>("GET", `/users/${id}`),
    deleteUser: (id) => retried<void>("DELETE", `/users/${id}`),
    // POST is not idempotent – a retry could create the same user twice, so it runs only once
    createUser: (input) => request<User>(baseUrl, "POST", "/users", { body: input, timeoutMs }),
  };
}

/**
 * Task 5 – crudSmokeFlow: create → read → verify → delete → verify 404, with cleanup
 */
export async function crudSmokeFlow(api: UsersApi, input: UserInput): Promise<string[]> {
  const steps: string[] = [];
  const created = await api.createUser(input);
  const id = created.id;
  steps.push(`created #${id}`);

  let deleted = false;
  try {
    const fetched = await api.getUser(id);
    const expected = { name: input.name, email: input.email, role: input.role ?? "tester" };
    for (const field of ["name", "email", "role"] as const) {
      if (fetched[field] !== expected[field]) {
        throw new Error(`${field} mismatch: expected "${expected[field]}" but got "${fetched[field]}"`);
      }
    }
    steps.push(`verified #${id}`);

    await api.deleteUser(id);
    deleted = true;
    steps.push(`deleted #${id}`);

    try {
      await api.getUser(id);
    } catch (err) {
      if (err instanceof HttpError && err.status === 404) {
        steps.push(`confirmed 404 for #${id}`);
        return steps;
      }
      throw err; // any other error is a real problem – rethrow
    }
    throw new Error(`User ${id} still exists after delete`);
  } finally {
    // cleanup: never leave test data behind, even when the flow failed in the middle
    if (!deleted) await api.deleteUser(id).catch(() => {});
  }
}

/**
 * Task 6 (Challenge) – runSmokeSuite: parallel checks, per-check timeout and a report
 */
export interface SmokeCheck {
  name: string;
  run: () => Promise<unknown>;
}

export type CheckResult = { name: string; status: "passed" } | { name: string; status: "failed"; reason: string };

export interface SuiteReport {
  total: number;
  passed: number;
  failed: number;
  results: CheckResult[];
  summary: string;
}

function describeFailure(err: unknown): string {
  if (err instanceof TimeoutError) return `timeout after ${err.ms}ms`;
  if (err instanceof HttpError) return `HTTP ${err.status}`;
  if (err instanceof Error) return err.message;
  return String(err);
}

export async function runSmokeSuite(checks: SmokeCheck[], timeoutMs: number): Promise<SuiteReport> {
  const settled = await Promise.allSettled(checks.map((check) => raceWithTimeout(check.run(), timeoutMs)));

  const results: CheckResult[] = settled.map((outcome, i) => {
    const name = checks[i].name;
    return outcome.status === "fulfilled"
      ? { name, status: "passed" }
      : { name, status: "failed", reason: describeFailure(outcome.reason) };
  });

  const failedNames = results.filter((r) => r.status === "failed").map((r) => r.name);
  const passed = results.length - failedNames.length;
  let summary = `${passed}/${results.length} checks passed`;
  if (failedNames.length > 0) summary += `; failed: ${failedNames.join(", ")}`;

  return { total: results.length, passed, failed: failedNames.length, results, summary };
}

/**
 * Task 7 (Challenge) – runApiSmokeSuite: wait until healthy, then run the real smoke suite
 */
export interface SmokeSuiteOptions {
  healthAttempts: number;
  intervalMs: number;
  timeoutMs: number;
  sleep: (ms: number) => Promise<void>;
}

// Expects run() to fail with an HttpError with the given status
async function expectStatus(run: () => Promise<unknown>, status: number): Promise<void> {
  try {
    await run();
  } catch (err) {
    if (err instanceof HttpError && err.status === status) return;
    throw err;
  }
  throw new Error(`Expected HTTP ${status} but the request succeeded`);
}

export async function runApiSmokeSuite(
  baseUrl: string,
  options: SmokeSuiteOptions,
): Promise<{ healthAttempts: number; report: SuiteReport }> {
  const { healthAttempts, intervalMs, timeoutMs, sleep } = options;

  // 1. Polling: wait until the service answers /health
  let attemptsUsed = 0;
  let lastError: unknown;
  for (let attempt = 1; attempt <= healthAttempts; attempt++) {
    try {
      await request(baseUrl, "GET", "/health", { timeoutMs });
      attemptsUsed = attempt;
      break;
    } catch (err) {
      lastError = err;
      if (attempt < healthAttempts) await sleep(intervalMs);
    }
  }
  if (attemptsUsed === 0) {
    const message = lastError instanceof Error ? lastError.message : String(lastError);
    throw new Error(`Service not healthy after ${healthAttempts} attempts (last error: ${message})`);
  }

  // 2. The real checks – all of them run in parallel
  const api = createUsersApi(baseUrl, { timeoutMs, attempts: 2, baseDelayMs: intervalMs, sleep });
  const checks: SmokeCheck[] = [
    {
      name: "health is ok",
      run: async () => {
        const health = await request<{ status: string }>(baseUrl, "GET", "/health", { timeoutMs });
        if (health.status !== "ok") throw new Error(`Unexpected health status: ${health.status}`);
      },
    },
    {
      name: "users list is not empty",
      run: async () => {
        const users = await api.listUsers();
        if (users.length === 0) throw new Error("Users list is empty");
      },
    },
    { name: "unknown user returns 404", run: () => expectStatus(() => api.getUser(999999), 404) },
    {
      name: "create without email returns 400",
      run: () => expectStatus(() => request(baseUrl, "POST", "/users", { body: { name: "No Email" }, timeoutMs }), 400),
    },
    {
      name: "CRUD flow",
      run: () => crudSmokeFlow(api, { name: "Smoke User", email: "smoke@example.com", role: "developer" }),
    },
    { name: "slow endpoint within budget", run: () => request(baseUrl, "GET", "/slow?ms=10", { timeoutMs }) },
  ];

  const report = await runSmokeSuite(checks, timeoutMs);
  return { healthAttempts: attemptsUsed, report };
}

// ============================================================
// Self-check – run:  npm run solution -- 08 hw
// On every line, the value left of "=> expected:" must equal the value on its right.
// (No need to change the code below this line)
// ============================================================
import { startMockApi } from "../../../shared/mock-api/server.ts";

// Runs code that is supposed to fail and prints the error message it got next to the expected message
async function expectError(run: () => unknown, expectedMessage: string): Promise<unknown> {
  try {
    await run();
    console.log("did not throw", "=> expected:", "threw:", expectedMessage);
    return undefined;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.startsWith("TODO")) throw err; // task not solved yet – reported as ✋ TODO
    console.log("threw:", message, "=> expected:", "threw:", expectedMessage);
    return err;
  }
}

// A fake sleep that doesn't really wait – it only records how long it was asked to wait
function recordingSleep(): { sleep: (ms: number) => Promise<void>; calls: number[] } {
  const calls: number[] = [];
  return { calls, sleep: async (ms: number) => void calls.push(ms) };
}

const realSleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
const UNREACHABLE = "http://127.0.0.1:1"; // port 1 is closed => fetch fails (connection refused)

// Start the course's Mock server on a random free port, and close it at the end (otherwise the process doesn't exit)
const server = await startMockApi();
try {
  console.log("\n--- Task 1: HttpError, TimeoutError, isTransient ---");
  try {
    const e = new HttpError(404, "GET", "/users/9", "User 9 not found");
    console.log(e instanceof Error, "=> expected:", true);
    console.log(e.name, "=> expected:", "HttpError");
    console.log([e.status, e.method, e.path], "=> expected:", [404, "GET", "/users/9"]);
    console.log(e.message, "=> expected:", "GET /users/9 -> 404: User 9 not found");

    const t = new TimeoutError(250);
    console.log(t instanceof Error, "=> expected:", true);
    console.log(t.name, "=> expected:", "TimeoutError");
    console.log(t.ms, "=> expected:", 250);
    console.log(t.message, "=> expected:", "Timed out after 250ms");

    const samples: unknown[] = [
      new TimeoutError(10),
      new HttpError(0, "GET", "/health", "Network error"),
      new HttpError(429, "GET", "/users", "Too many requests"),
      new HttpError(500, "GET", "/users", "boom"),
      new HttpError(503, "DELETE", "/users/1", "maintenance"),
      new HttpError(400, "POST", "/users", "name and email are required"),
      new HttpError(404, "GET", "/users/9", "User 9 not found"),
      new Error("plain error"),
      "a string",
    ];
    console.log(samples.map(isTransient), "=> expected:", [true, true, true, true, true, false, false, false, false]);
  } catch (e) {
    console.log("  ✋", (e as Error).message);
  }

  console.log("\n--- Task 2: request ---");
  try {
    console.log(await request(server.url, "GET", "/health"), "=> expected:", { status: "ok" });
    console.log(await request(server.url, "GET", "/users/1"), "=> expected:", {
      id: 1,
      name: "Dana Levi",
      email: "dana@example.com",
      role: "admin",
    });

    const created = await request<User>(server.url, "POST", "/users", {
      body: { name: "Req User", email: "req@example.com" },
    });
    console.log([created.name, created.role], "=> expected:", ["Req User", "tester"]);
    console.log(await request(server.url, "DELETE", `/users/${created.id}`), "=> expected:", undefined);

    const notFound = await expectError(
      () => request(server.url, "GET", `/users/${created.id}`),
      `GET /users/${created.id} -> 404: User ${created.id} not found`,
    );
    console.log(notFound instanceof HttpError, "=> expected:", true);

    await expectError(
      () => request(server.url, "POST", "/users", { body: { name: "No email" } }),
      "POST /users -> 400: name and email are required",
    );

    const network = await expectError(() => request(UNREACHABLE, "GET", "/health"), "GET /health -> 0: Network error");
    console.log((network as HttpError | undefined)?.status, "=> expected:", 0);

    const timeout = await expectError(
      () => request(server.url, "GET", "/slow?ms=40", { timeoutMs: 5 }),
      "Timed out after 5ms",
    );
    console.log(timeout instanceof TimeoutError, "=> expected:", true);
    console.log(await request(server.url, "GET", "/slow?ms=5", { timeoutMs: 1000 }), "=> expected:", { waited: 5 });

    // the slow request is still "in the air" – let it finish so the server closes right away
    await realSleep(50);
  } catch (e) {
    console.log("  ✋", (e as Error).message);
  }

  console.log("\n--- Task 3: withRetry ---");
  try {
    // fails twice with 503, then succeeds
    {
      const { sleep, calls } = recordingSleep();
      const seen: number[] = [];
      const result = await withRetry(
        async (attempt) => {
          seen.push(attempt);
          if (attempt < 3) throw new HttpError(503, "GET", "/users", "maintenance");
          return "ok";
        },
        { attempts: 5, baseDelayMs: 10, shouldRetry: isTransient, sleep },
      );
      console.log(result, "=> expected:", "ok");
      console.log(seen, "=> expected:", [1, 2, 3]);
      console.log(calls, "=> expected:", [10, 20]);
    }

    // a 400 is a real bug – thrown immediately, no retry
    {
      const { sleep, calls } = recordingSleep();
      let count = 0;
      await expectError(
        () =>
          withRetry(
            async () => {
              count++;
              throw new HttpError(400, "POST", "/users", "name and email are required");
            },
            { attempts: 4, baseDelayMs: 10, shouldRetry: isTransient, sleep },
          ),
        "POST /users -> 400: name and email are required",
      );
      console.log(count, "=> expected:", 1);
      console.log(calls, "=> expected:", []);
    }

    // always fails => all the attempts are used, the LAST error is thrown, no sleep after the last attempt
    {
      const { sleep, calls } = recordingSleep();
      await expectError(
        () =>
          withRetry(
            async (attempt) => {
              throw new TimeoutError(attempt * 100);
            },
            { attempts: 4, baseDelayMs: 10, shouldRetry: isTransient, sleep },
          ),
        "Timed out after 400ms",
      );
      console.log(calls, "=> expected:", [10, 20, 40]);
    }
  } catch (e) {
    console.log("  ✋", (e as Error).message);
  }

  console.log("\n--- Task 4: createUsersApi ---");
  try {
    const { sleep, calls } = recordingSleep();
    const api = createUsersApi(server.url, { timeoutMs: 1000, attempts: 3, baseDelayMs: 5, sleep });

    const users = await api.listUsers();
    console.log(users.length >= 3, "=> expected:", true);
    console.log(users[0], "=> expected:", { id: 1, name: "Dana Levi", email: "dana@example.com", role: "admin" });
    console.log((await api.getUser(2)).name, "=> expected:", "Yossi Cohen");

    const created = await api.createUser({ name: "Api User", email: "api@example.com" });
    console.log([created.name, created.email, created.role], "=> expected:", ["Api User", "api@example.com", "tester"]);
    console.log(await api.getUser(created.id), "=> expected:", created);
    console.log(await api.deleteUser(created.id), "=> expected:", undefined);
    await expectError(() => api.getUser(created.id), `GET /users/${created.id} -> 404: User ${created.id} not found`);
    // 404 is not transient => no retries happened at all
    console.log(calls, "=> expected:", []);

    // server down: GET is retried with backoff, POST is not retried
    const down = recordingSleep();
    const deadApi = createUsersApi(UNREACHABLE, { timeoutMs: 1000, attempts: 3, baseDelayMs: 5, sleep: down.sleep });
    await expectError(() => deadApi.getUser(1), "GET /users/1 -> 0: Network error");
    console.log(down.calls, "=> expected:", [5, 10]);
    await expectError(
      () => deadApi.createUser({ name: "X", email: "x@example.com" }),
      "POST /users -> 0: Network error",
    );
    console.log(down.calls, "=> expected:", [5, 10]);
  } catch (e) {
    console.log("  ✋", (e as Error).message);
  }

  console.log("\n--- Task 5: crudSmokeFlow ---");
  try {
    const { sleep } = recordingSleep();
    const api = createUsersApi(server.url, { timeoutMs: 1000, attempts: 2, baseDelayMs: 5, sleep });

    // the happy path
    const steps = await crudSmokeFlow(api, { name: "Flow User", email: "flow@example.com", role: "admin" });
    const id = Number(steps[0]?.split("#")[1]);
    console.log(id > 3, "=> expected:", true);
    console.log(steps, "=> expected:", [`created #${id}`, `verified #${id}`, `deleted #${id}`, `confirmed 404 for #${id}`]);
    console.log((await fetch(`${server.url}/users/${id}`)).status, "=> expected:", 404);

    // a buggy server returns a wrong name => the flow fails, but the user is still cleaned up
    let buggyId = 0;
    let deleteCalls = 0;
    const buggyApi: UsersApi = {
      ...api,
      createUser: async (input) => {
        const user = await api.createUser(input);
        buggyId = user.id;
        return user;
      },
      getUser: async (userId) => ({ ...(await api.getUser(userId)), name: "Wrong" }),
      deleteUser: async (userId) => {
        deleteCalls++;
        return api.deleteUser(userId);
      },
    };
    await expectError(
      () => crudSmokeFlow(buggyApi, { name: "Bug Hunter", email: "bug@example.com" }),
      'name mismatch: expected "Bug Hunter" but got "Wrong"',
    );
    console.log(deleteCalls, "=> expected:", 1);
    console.log((await fetch(`${server.url}/users/${buggyId}`)).status, "=> expected:", 404);

    // a default role must be verified as "tester"
    const roleApi: UsersApi = { ...api, getUser: async (userId) => ({ ...(await api.getUser(userId)), role: "admin" }) };
    await expectError(
      () => crudSmokeFlow(roleApi, { name: "Role User", email: "role@example.com" }),
      'role mismatch: expected "tester" but got "admin"',
    );

    // DELETE answered 204 but did not really delete => the 404 verification catches it
    const ghostInput: UserInput = { name: "Ghost", email: "ghost@example.com" };
    const ghost = await api.createUser(ghostInput); // created up front, so its id is known
    const ghostApi: UsersApi = { ...api, createUser: async () => ghost, deleteUser: async () => {} };
    await expectError(() => crudSmokeFlow(ghostApi, ghostInput), `User ${ghost.id} still exists after delete`);
    await fetch(`${server.url}/users/${ghost.id}`, { method: "DELETE" }); // clean up after the ghost
  } catch (e) {
    console.log("  ✋", (e as Error).message);
  }

  console.log("\n--- Task 6 (Challenge): runSmokeSuite ---");
  try {
    let started = 0;
    let startedWhenFirstFinished = -1;
    const report = await runSmokeSuite(
      [
        {
          name: "fast pass",
          run: async () => {
            started++;
            await realSleep(5);
            startedWhenFirstFinished = started;
          },
        },
        {
          name: "not found",
          run: async () => {
            started++;
            throw new HttpError(404, "GET", "/users/9", "User 9 not found");
          },
        },
        {
          name: "hangs forever",
          run: () => {
            started++;
            return new Promise(() => {});
          },
        },
        {
          name: "wrong title",
          run: async () => {
            started++;
            throw new Error('Expected "Home" but got "Login"');
          },
        },
        {
          name: "throws a string",
          run: async () => {
            started++;
            throw "boom";
          },
        },
        {
          name: "second pass",
          run: async () => {
            started++;
            return 42;
          },
        },
      ],
      15,
    );
    // all 6 checks started before the first one finished => they ran in parallel
    console.log(startedWhenFirstFinished, "=> expected:", 6);
    console.log([report.total, report.passed, report.failed], "=> expected:", [6, 2, 4]);
    console.log(report.results, "=> expected:", [
      { name: "fast pass", status: "passed" },
      { name: "not found", status: "failed", reason: "HTTP 404" },
      { name: "hangs forever", status: "failed", reason: "timeout after 15ms" },
      { name: "wrong title", status: "failed", reason: 'Expected "Home" but got "Login"' },
      { name: "throws a string", status: "failed", reason: "boom" },
      { name: "second pass", status: "passed" },
    ]);
    console.log(report.summary, "=> expected:", "2/6 checks passed; failed: not found, hangs forever, wrong title, throws a string");

    const allGood = await runSmokeSuite([{ name: "only", run: async () => "ok" }], 50);
    console.log(allGood.summary, "=> expected:", "1/1 checks passed");
  } catch (e) {
    console.log("  ✋", (e as Error).message);
  }

  console.log("\n--- Task 7 (Challenge): runApiSmokeSuite ---");
  let lateServer: Awaited<ReturnType<typeof startMockApi>> | undefined;
  try {
    // the real suite against the running server
    const { healthAttempts, report } = await runApiSmokeSuite(server.url, {
      healthAttempts: 3,
      intervalMs: 5,
      timeoutMs: 1000,
      sleep: realSleep,
    });
    console.log(healthAttempts, "=> expected:", 1);
    console.log(report, "=> expected:", {
      total: 6,
      passed: 6,
      failed: 0,
      results: [
        { name: "health is ok", status: "passed" },
        { name: "users list is not empty", status: "passed" },
        { name: "unknown user returns 404", status: "passed" },
        { name: "create without email returns 400", status: "passed" },
        { name: "CRUD flow", status: "passed" },
        { name: "slow endpoint within budget", status: "passed" },
      ],
      summary: "6/6 checks passed",
    });

    // the service never comes up => polling gives up
    const down = recordingSleep();
    await expectError(
      () => runApiSmokeSuite(UNREACHABLE, { healthAttempts: 3, intervalMs: 5, timeoutMs: 1000, sleep: down.sleep }),
      "Service not healthy after 3 attempts (last error: GET /health -> 0: Network error)",
    );
    console.log(down.calls, "=> expected:", [5, 5]);

    // the service comes up only after the 2nd wait => healthy on the 3rd attempt
    const probe = await startMockApi(); // find a free port, then free it again
    await probe.close();
    let waits = 0;
    const late = await runApiSmokeSuite(probe.url, {
      healthAttempts: 5,
      intervalMs: 5,
      timeoutMs: 1000,
      sleep: async () => {
        waits++;
        if (waits === 2) lateServer = await startMockApi(probe.port);
      },
    });
    console.log(late.healthAttempts, "=> expected:", 3);
    console.log(late.report.summary, "=> expected:", "6/6 checks passed");
  } catch (e) {
    console.log("  ✋", (e as Error).message);
  } finally {
    await lateServer?.close();
  }
} finally {
  await server.close();
}
