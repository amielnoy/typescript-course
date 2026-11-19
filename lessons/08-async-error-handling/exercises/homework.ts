// Lesson 8 – Homework: An API smoke suite for the Users service
// Check yourself: npm run exercise -- 08 hw (self-check at the end of the file)
// ------------------------------------------------------------
// Scenario:
//   A new build of the Users service was deployed and you are asked for a quick "smoke" verdict before
//   the full regression starts: is the service up, do the basic endpoints answer correctly,
//   and does a full create → read → verify → delete → verify-404 flow work end to end?
//   You build it in layers, the same way a real API test framework is built:
//     typed errors → one request function (fetch + timeout) → retry with backoff → a typed API client
//     → a CRUD smoke flow with cleanup → a parallel suite runner with a report → the full smoke suite.
//   Every task uses the ones before it, so solve them in order.
//
// Instructions:
//   1. Fill in the body of each function / class in place of the line  throw new Error("TODO")
//      You may add your own small helper functions (e.g. a timeout helper you reuse in Tasks 2 and 6).
//   2. The self-check at the end of the file starts the course's Mock server (shared/mock-api) on a random port
//      and passes you its address in baseUrl (e.g. "http://127.0.0.1:54321"). No internet needed.
//   3. Endpoints that exist in the Mock server:
//        GET    /health      -> 200 { status: "ok" }
//        GET    /users       -> 200 [ ...users ]
//        GET    /users/:id   -> 200 user  |  404 { error: "User <id> not found" }
//        POST   /users       -> 201 user  |  400 { error: "name and email are required" }
//        DELETE /users/:id   -> 204 (no body)  |  404 { error: "User <id> not found" }
//        GET    /slow?ms=N   -> 200 { waited: N } after N milliseconds
//   4. Waiting is always done through an injected sleep(ms) function – so the self-check can count the waits
//      instead of measuring the clock.
// ------------------------------------------------------------
import type { User } from "../../../shared/mock-api/server.ts";

export type HttpMethod = "GET" | "POST" | "DELETE";

/**
 * Task 1 – Typed errors: HttpError, TimeoutError and isTransient
 * A test report that only says "Error: failed" is useless. Your errors must say exactly what failed.
 *
 * a. HttpError extends Error with:
 *      name = "HttpError"
 *      status: number, method: HttpMethod, path: string   (all public readonly)
 *      message: "<method> <path> -> <status>: <serverMessage>"
 *      Example: new HttpError(404, "GET", "/users/9", "User 9 not found").message
 *               === "GET /users/9 -> 404: User 9 not found"
 *
 * b. TimeoutError extends Error with:
 *      name = "TimeoutError",  ms: number (public readonly),  message: "Timed out after <ms>ms"
 *
 * c. isTransient(err) – is this failure worth a retry?
 *      TimeoutError                                       => true
 *      HttpError with status 0 (no response), 429 or >= 500 => true
 *      anything else (400, 404, a plain Error, a string...) => false
 */
export class HttpError extends Error {
  constructor(status: number, method: HttpMethod, path: string, serverMessage: string) {
    super("TODO");
    throw new Error("TODO");
  }

  get status(): number {
    throw new Error("TODO – you can replace the getters with parameter properties");
  }

  get method(): HttpMethod {
    throw new Error("TODO – you can replace the getters with parameter properties");
  }

  get path(): string {
    throw new Error("TODO – you can replace the getters with parameter properties");
  }
}

export class TimeoutError extends Error {
  constructor(ms: number) {
    super("TODO");
    throw new Error("TODO");
  }

  get ms(): number {
    throw new Error("TODO – you can replace the getter with a parameter property");
  }
}

export function isTransient(err: unknown): boolean {
  throw new Error("TODO");
}

/**
 * Task 2 – request: one function for every HTTP call
 * Send <method> to <baseUrl><path> with fetch.
 *   - If options.body is given: send it as JSON (header "Content-Type": "application/json", body: JSON.stringify(...)).
 *   - fetch itself throws (server unreachable)  => throw HttpError(0, method, path, "Network error")
 *   - no answer within options.timeoutMs (default 2000) => reject with TimeoutError(timeoutMs)
 *     (don't leave the timer running after the answer arrived – clearTimeout)
 *   - 204           => return undefined (there is no body – don't call res.json())
 *   - other 2xx     => return the JSON body
 *   - anything else => throw HttpError(res.status, method, path, <the error field of the JSON body>)
 * Example: request(baseUrl, "GET", "/users/999")  =>  HttpError: "GET /users/999 -> 404: User 999 not found"
 * Hint: be careful that the "Network error" catch wraps only the fetch call – not the status checks.
 */
export async function request<T>(
  baseUrl: string,
  method: HttpMethod,
  path: string,
  options: { body?: unknown; timeoutMs?: number } = {},
): Promise<T> {
  throw new Error("TODO");
}

/**
 * Task 3 – withRetry: retry with exponential backoff
 * Call fn(attempt) – attempt starts at 1 – up to options.attempts times:
 *   - succeeded                                => return its result
 *   - failed and shouldRetry(err) is false     => throw that error immediately (no more attempts)
 *   - failed and shouldRetry(err) is true      => await sleep(delay) and try again,
 *        where the delay doubles every time: baseDelayMs, baseDelayMs * 2, baseDelayMs * 4, ...
 *   - out of attempts                          => throw the LAST error (and don't sleep after the last attempt)
 * Example: baseDelayMs = 10, always fails, attempts = 4  =>  sleep is called with 10, 20, 40
 */
export interface RetryOptions {
  attempts: number;
  baseDelayMs: number;
  shouldRetry: (err: unknown) => boolean;
  sleep: (ms: number) => Promise<void>;
}

export async function withRetry<T>(fn: (attempt: number) => Promise<T>, options: RetryOptions): Promise<T> {
  throw new Error("TODO");
}

/**
 * Task 4 – createUsersApi: a typed client for the Users service
 * Return an object that implements UsersApi on top of request (Task 2), passing timeoutMs to every call:
 *   listUsers()       => GET    /users
 *   getUser(id)       => GET    /users/<id>
 *   deleteUser(id)    => DELETE /users/<id>
 *   createUser(input) => POST   /users  with input as the body
 * Retry rules (a real-life decision, not just a technicality):
 *   - GET and DELETE are idempotent (repeating them is harmless) => wrap them with withRetry (Task 3),
 *     using attempts, baseDelayMs, sleep from options and isTransient (Task 1) as shouldRetry.
 *   - POST is NOT idempotent – a retry might create the same user twice => call it exactly once, no retry.
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
  throw new Error("TODO");
}

/**
 * Task 5 – crudSmokeFlow: create → read → verify → delete → verify 404, with cleanup
 * Use only the api object (so the self-check can inject a "buggy" server). Collect the steps in an array:
 *   1. created = await api.createUser(input)                     => step "created #<id>"
 *   2. fetched = await api.getUser(id), and compare to the input, in this order: name, email, role
 *      (when input.role is missing, the expected role is "tester" – the server's default).
 *      The first field that differs => throw Error: '<field> mismatch: expected "<expected>" but got "<actual>"'
 *      All equal                                                    => step "verified #<id>"
 *   3. await api.deleteUser(id)                                  => step "deleted #<id>"
 *   4. api.getUser(id) must now fail with an HttpError with status 404 => step "confirmed 404 for #<id>"
 *        it succeeded instead => throw Error: "User <id> still exists after delete"
 *        it failed with any other error => rethrow it
 *   5. Return the steps array.
 * Cleanup: if the flow failed after the user was created and before it was deleted,
 *   the user must still be deleted (don't leave test data behind!). Errors of that cleanup delete are ignored,
 *   so the original error is the one that propagates out.
 * Hint: try { ... } finally { if (!deleted) ... }
 */
export async function crudSmokeFlow(api: UsersApi, input: UserInput): Promise<string[]> {
  throw new Error("TODO");
}

/**
 * Task 6 (Challenge) – runSmokeSuite: parallel checks, per-check timeout and a report
 * Run ALL the checks in parallel and wait until every one of them has finished (passed or failed).
 * A check that doesn't finish within timeoutMs is failed with a TimeoutError (reuse your timeout logic from Task 2).
 * Return a SuiteReport:
 *   results – one entry per check, in the order of the checks (not the order they finished):
 *       passed => { name, status: "passed" }                 (no reason field at all)
 *       failed => { name, status: "failed", reason }  where reason is:
 *            TimeoutError => "timeout after <ms>ms"
 *            HttpError    => "HTTP <status>"
 *            other Error  => its message
 *            anything else (e.g. a thrown string) => String(err)
 *   total, passed, failed – counts
 *   summary – "<passed>/<total> checks passed", and if anything failed add: "; failed: <name1>, <name2>, ..."
 *       Example: "2/3 checks passed; failed: login page"
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

export async function runSmokeSuite(checks: SmokeCheck[], timeoutMs: number): Promise<SuiteReport> {
  throw new Error("TODO");
}

/**
 * Task 7 (Challenge) – runApiSmokeSuite: wait until healthy, then run the real smoke suite
 * 1. Polling: call request(baseUrl, "GET", "/health", { timeoutMs }) up to healthAttempts times,
 *    with await sleep(intervalMs) between failed attempts (not after the last one).
 *    If it never succeeded => throw Error:
 *      "Service not healthy after <healthAttempts> attempts (last error: <message of the last error>)"
 * 2. Build api = createUsersApi(baseUrl, { timeoutMs, attempts: 2, baseDelayMs: intervalMs, sleep }).
 * 3. Run these 6 checks with runSmokeSuite(checks, timeoutMs) – names exactly as written, in this order:
 *      "health is ok"                     – GET /health returns { status: "ok" }
 *      "users list is not empty"          – api.listUsers() returns at least one user
 *      "unknown user returns 404"         – api.getUser(999999) fails with HttpError 404
 *      "create without email returns 400" – POST /users with body { name: "No Email" } fails with HttpError 400
 *      "CRUD flow"                        – crudSmokeFlow(api, { name: "Smoke User", email: "smoke@example.com", role: "developer" })
 *      "slow endpoint within budget"      – GET /slow?ms=10 answers within timeoutMs
 *    A check passes when its run() resolves and fails when it rejects. For the "expected 404 / 400" checks:
 *    if the request unexpectedly succeeded – throw an Error yourself; a different error – rethrow it.
 * 4. Return { healthAttempts: <the attempt on which /health succeeded>, report }.
 */
export interface SmokeSuiteOptions {
  healthAttempts: number;
  intervalMs: number;
  timeoutMs: number;
  sleep: (ms: number) => Promise<void>;
}

export async function runApiSmokeSuite(
  baseUrl: string,
  options: SmokeSuiteOptions,
): Promise<{ healthAttempts: number; report: SuiteReport }> {
  throw new Error("TODO");
}

// ============================================================
// Self-check – run:  npm run exercise -- 08 hw
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
