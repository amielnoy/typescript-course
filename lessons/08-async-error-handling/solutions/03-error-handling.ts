// Lesson 8 – Topic 03: Error handling – Solutions

export class AssertionError extends Error {
  constructor(
    message: string,
    public readonly expected: unknown,
    public readonly actual: unknown,
  ) {
    super(message);
    this.name = "AssertionError";
  }
}

export function assertEqual<T>(actual: T, expected: T, label?: string): void {
  if (actual === expected) return;
  const details = `Expected ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}`;
  throw new AssertionError(label ? `${label}: ${details}` : details, expected, actual);
}

export function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message; // also catches TypeError, ApiError, etc.
  if (typeof err === "string") return err;
  return `Unknown error: ${String(err)}`;
}

export async function runWithFixture<F, T>(
  setup: () => Promise<F>,
  test: (fixture: F) => Promise<T>,
  teardown: (fixture: F) => Promise<void>,
): Promise<T> {
  const fixture = await setup(); // if it fails – we exit right here, before the try, so there is no teardown
  try {
    return await test(fixture); // the await matters: without it, finally would run before the test finished
  } finally {
    await teardown(fixture);
  }
}

export async function retryIf<T>(
  fn: (attempt: number) => Promise<T>,
  attempts: number,
  shouldRetry: (err: unknown) => boolean,
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await fn(attempt);
    } catch (err) {
      if (!shouldRetry(err)) throw err; // unknown / not transient – pass it on immediately
      lastError = err;
    }
  }
  throw lastError;
}

export class SoftAssertionError extends Error {
  constructor(
    public readonly failures: string[],
    total: number,
  ) {
    super(`${failures.length} of ${total} checks failed`);
    this.name = "SoftAssertionError";
  }
}

export async function softAssertAll(checks: Record<string, () => void | Promise<void>>): Promise<void> {
  const entries = Object.entries(checks);
  const failures: string[] = [];
  for (const [name, check] of entries) {
    try {
      await check(); // await on a non-Promise value simply returns it – works for regular functions too
    } catch (err) {
      failures.push(`${name}: ${getErrorMessage(err)}`);
    }
  }
  if (failures.length > 0) throw new SoftAssertionError(failures, entries.length);
}

// ============================================================
// Self-check – run:  npm run solution -- 08 03
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
