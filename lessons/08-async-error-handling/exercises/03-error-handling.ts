// Lesson 8 – Topic 03: Error handling – try / catch / finally, custom errors, rethrow – Exercises
// ------------------------------------------------------------
// Instructions:
//   1. Fill in the body of each function / class in place of the line  throw new Error("TODO")
//   2. Remember: in catch the type of err is unknown – check it (instanceof) before using it.
//   3. Check yourself: npm run exercise -- 08 03 (self-check at the end of the file)
// ------------------------------------------------------------

/**
 * Exercise 1 – the AssertionError class
 * AssertionError extends Error with:
 *   name = "AssertionError"
 *   message – the message it received, as is
 *   expected, actual – public readonly, the values that were compared
 * Example: new AssertionError("title mismatch", "Home", "Login")
 *   => e.message === "title mismatch", e.expected === "Home", e.actual === "Login", e instanceof Error
 */
export class AssertionError extends Error {
  constructor(message: string, expected: unknown, actual: unknown) {
    super("TODO");
    throw new Error("TODO");
  }

  get expected(): unknown {
    throw new Error("TODO – you can replace the getter with a parameter property");
  }

  get actual(): unknown {
    throw new Error("TODO – you can replace the getter with a parameter property");
  }
}

/**
 * Exercise 2 – assertEqual
 * If actual !== expected – throw an AssertionError (from Exercise 1) with the message:
 *   "Expected <expected> but got <actual>"          (the values via JSON.stringify)
 * and if a label was given – add it at the start:
 *   "<label>: Expected <expected> but got <actual>"
 * If they are equal – nothing happens (the function returns void).
 * Example: assertEqual(404, 200, "status")  =>  AssertionError: 'status: Expected 200 but got 404'
 *          assertEqual("a", "b")            =>  AssertionError: 'Expected "b" but got "a"'
 */
export function assertEqual<T>(actual: T, expected: T, label?: string): void {
  throw new Error("TODO");
}

/**
 * Exercise 3 – getErrorMessage: extracting a message from unknown
 * Inside catch you can get anything at all (even throw "string"). Return:
 *   Error (or a class that extends it) => err.message
 *   string                             => the string itself
 *   anything else                      => "Unknown error: " + String(err)
 * Example: getErrorMessage(new TypeError("x is undefined")) => "x is undefined"
 *          getErrorMessage(42)                              => "Unknown error: 42"
 */
export function getErrorMessage(err: unknown): string {
  throw new Error("TODO");
}

/**
 * Exercise 4 – runWithFixture: setup / test / teardown with finally
 * Like beforeEach / afterEach in tests:
 *   1. const fixture = await setup()          (e.g.: launching a browser / creating a temporary user)
 *   2. run test(fixture) and return its result
 *   3. teardown(fixture) must always run after test – even if test failed!
 *      (if test failed – after the teardown, test's error propagates out)
 *   4. If setup itself fails – there is no fixture, so teardown is not called (the error propagates out).
 * Hint: try { return await test(fixture); } finally { await teardown(fixture); }
 */
export async function runWithFixture<F, T>(
  setup: () => Promise<F>,
  test: (fixture: F) => Promise<T>,
  teardown: (fixture: F) => Promise<void>,
): Promise<T> {
  throw new Error("TODO");
}

/**
 * Exercise 5 – retryIf: retry only for "transient" errors (rethrow everything else)
 * Run fn(attempt) – attempt starts at 1 – up to attempts times:
 *   - succeeded => return the result
 *   - failed and shouldRetry(err) returns false => throw the error immediately (no more attempts)
 *   - failed and shouldRetry(err) returns true  => try again
 *   - out of attempts => throw the last error
 * Example: 503 => worth retrying, 400 => a real bug, no point in retrying.
 */
export async function retryIf<T>(
  fn: (attempt: number) => Promise<T>,
  attempts: number,
  shouldRetry: (err: unknown) => boolean,
): Promise<T> {
  throw new Error("TODO");
}

/**
 * Exercise 6 (Bonus) – soft assertions
 * A "soft" check does not stop at the first failure – it runs all the checks and reports all the failures together.
 *
 * a. SoftAssertionError extends Error with:
 *      name = "SoftAssertionError"
 *      failures: string[] (public readonly)
 *      message: "<failures.length> of <total> checks failed"
 *
 * b. softAssertAll(checks) – checks is an object { name: function } (a regular or async function).
 *    Run all the functions in order (await each one). For each one that failed, store:
 *      "<name>: <the error message>"   (use getErrorMessage from Exercise 3)
 *    At the end – if there were failures throw a SoftAssertionError, otherwise finish quietly.
 *    Hint: for (const [name, check] of Object.entries(checks))
 */
export class SoftAssertionError extends Error {
  constructor(failures: string[], total: number) {
    super("TODO");
    throw new Error("TODO");
  }

  get failures(): string[] {
    throw new Error("TODO – you can replace the getter with a parameter property");
  }
}

export async function softAssertAll(checks: Record<string, () => void | Promise<void>>): Promise<void> {
  throw new Error("TODO");
}

// ============================================================
// Self-check – run:  npm run exercise -- 08 03
// On every line, the value left of "=> expected:" must equal the value on its right.
// (No need to change the code below this line)
// ============================================================

const pause = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

class HttpStatusError extends Error {
  constructor(public readonly status: number) {
    super(`HTTP ${status}`);
  }
}

// Runs code that is supposed to fail and prints the error message it got next to the expected message
async function expectError(run: () => unknown, expectedMessage: string): Promise<unknown> {
  try {
    await run();
    console.log("did not throw", "=> expected:", "threw:", expectedMessage);
    return undefined;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.startsWith("TODO")) throw err; // exercise not solved yet – reported as ✋ TODO
    console.log("threw:", message, "=> expected:", "threw:", expectedMessage);
    return err;
  }
}

// Runs code that is supposed to pass without an error
async function expectNoError(run: () => unknown): Promise<void> {
  try {
    await run();
    console.log("did not throw", "=> expected:", "did not throw");
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.startsWith("TODO")) throw err;
    console.log("threw:", message, "=> expected:", "did not throw");
  }
}

console.log("\n--- Exercise 1: AssertionError ---");
try {
  const e = new AssertionError("title mismatch", "Home", "Login");
  console.log(e instanceof Error, "=> expected:", true);
  console.log(e instanceof AssertionError, "=> expected:", true);
  console.log(e.name, "=> expected:", "AssertionError");
  console.log(e.message, "=> expected:", "title mismatch");
  console.log(e.expected, "=> expected:", "Home");
  console.log(e.actual, "=> expected:", "Login");
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 2: assertEqual ---");
try {
  await expectNoError(() => assertEqual(200, 200, "status"));
  await expectNoError(() => assertEqual("ok", "ok"));

  const err = await expectError(() => assertEqual(404, 200, "status"), "status: Expected 200 but got 404");
  console.log(err instanceof AssertionError, "=> expected:", true);
  console.log((err as AssertionError | undefined)?.expected, "=> expected:", 200);
  console.log((err as AssertionError | undefined)?.actual, "=> expected:", 404);

  await expectError(() => assertEqual("Login", "Home"), 'Expected "Home" but got "Login"');
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 3: getErrorMessage ---");
try {
  console.log(getErrorMessage(new Error("boom")), "=> expected:", "boom");
  console.log(getErrorMessage(new TypeError("x is undefined")), "=> expected:", "x is undefined");
  console.log(getErrorMessage(new HttpStatusError(503)), "=> expected:", "HTTP 503");
  console.log(getErrorMessage("a string was thrown"), "=> expected:", "a string was thrown");
  console.log(getErrorMessage(42), "=> expected:", "Unknown error: 42");
  console.log(getErrorMessage(null), "=> expected:", "Unknown error: null");
  console.log(getErrorMessage(undefined), "=> expected:", "Unknown error: undefined");
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 4: runWithFixture ---");
try {
  const log: string[] = [];
  const setup = async () => {
    log.push("setup");
    return { browser: "chromium" };
  };
  const teardown = async (f: { browser: string }) => {
    await pause(5);
    log.push(`teardown ${f.browser}`);
  };

  const result = await runWithFixture(
    setup,
    async (f) => {
      log.push(`test on ${f.browser}`);
      return "passed";
    },
    teardown,
  );
  console.log(result, "=> expected:", "passed");
  console.log(log, "=> expected:", ["setup", "test on chromium", "teardown chromium"]);

  // test failed – teardown still runs, and the original error propagates out
  log.length = 0;
  await expectError(
    () =>
      runWithFixture(
        setup,
        async () => {
          throw new Error("element not visible");
        },
        teardown,
      ),
    "element not visible",
  );
  console.log(log, "=> expected:", ["setup", "teardown chromium"]);

  // setup failed – no teardown
  log.length = 0;
  await expectError(
    () =>
      runWithFixture(
        async (): Promise<{ browser: string }> => {
          throw new Error("browser failed to launch");
        },
        async () => "never",
        teardown,
      ),
    "browser failed to launch",
  );
  console.log(log, "=> expected:", []);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 5: retryIf ---");
try {
  const isServerError = (err: unknown) => err instanceof HttpStatusError && err.status >= 500;

  const attemptsSeen: number[] = [];
  const result = await retryIf(
    async (attempt) => {
      attemptsSeen.push(attempt);
      if (attempt < 3) throw new HttpStatusError(503);
      return "OK";
    },
    5,
    isServerError,
  );
  console.log(result, "=> expected:", "OK");
  console.log(attemptsSeen, "=> expected:", [1, 2, 3]);

  // 400 – don't retry, throw immediately
  let calls = 0;
  const err = await expectError(
    () =>
      retryIf(
        async () => {
          calls++;
          throw new HttpStatusError(400);
        },
        5,
        isServerError,
      ),
    "HTTP 400",
  );
  console.log(err instanceof HttpStatusError, "=> expected:", true);
  console.log((err as HttpStatusError | undefined)?.status, "=> expected:", 400);
  console.log(calls, "=> expected:", 1);

  // all attempts failed – the last error
  calls = 0;
  await expectError(
    () =>
      retryIf(
        async (attempt) => {
          calls++;
          throw new Error(`503 on attempt ${attempt}`);
        },
        3,
        () => true,
      ),
    "503 on attempt 3",
  );
  console.log(calls, "=> expected:", 3);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 6 (Bonus): SoftAssertionError + softAssertAll ---");
try {
  const e = new SoftAssertionError(["a: x", "b: y"], 5);
  console.log(e instanceof Error, "=> expected:", true);
  console.log(e.name, "=> expected:", "SoftAssertionError");
  console.log(e.message, "=> expected:", "2 of 5 checks failed");
  console.log(e.failures, "=> expected:", ["a: x", "b: y"]);

  const ran: string[] = [];
  await expectNoError(() =>
    softAssertAll({
      title: () => void ran.push("title"),
      status: async () => void ran.push("status"),
    }),
  );
  console.log(ran, "=> expected:", ["title", "status"]);

  ran.length = 0;
  const err = await expectError(
    () =>
      softAssertAll({
        title: () => {
          ran.push("title");
          throw new Error('Expected "Home" but got "Login"');
        },
        status: async () => {
          ran.push("status");
        },
        footer: async () => {
          ran.push("footer");
          await pause(1);
          throw "footer missing";
        },
      }),
    "2 of 3 checks failed",
  );
  console.log(err instanceof SoftAssertionError, "=> expected:", true);
  console.log((err as SoftAssertionError | undefined)?.failures, "=> expected:", [
    'title: Expected "Home" but got "Login"',
    "footer: footer missing",
  ]);
  // all the checks run – even after a failure
  console.log(ran, "=> expected:", ["title", "status", "footer"]);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}
