// Lesson 8 – Summary exercises: async code and error handling
// Check yourself: npm run exercise -- 08 (self-check at the end of the file)

/**
 * Exercise 1 – sleep
 * Return a Promise that resolves after ms milliseconds.
 */
export function sleep(ms: number): Promise<void> {
  throw new Error("TODO");
}

/**
 * Exercise 2 – a custom error class
 * ApiError extends Error with:
 *   status: number (public readonly)
 *   name = "ApiError"
 *   message in the format: "Request failed with status <status>: <details>"
 *   a getter named isServerError – true if status >= 500
 */
export class ApiError extends Error {
  constructor(status: number, details: string) {
    super("TODO");
    throw new Error("TODO");
  }

  get status(): number {
    throw new Error("TODO – you can replace the getter with a parameter property");
  }

  get isServerError(): boolean {
    throw new Error("TODO");
  }
}

/**
 * Exercise 3 – safeJsonParse
 * Try to parse the text as JSON. If it succeeded – { ok: true, value }.
 * If it failed – { ok: false, error: <the error message> }. Don't let an error escape.
 */
export function safeJsonParse(text: string): { ok: true; value: unknown } | { ok: false; error: string } {
  throw new Error("TODO");
}

/**
 * Exercise 4 – retry
 * Run fn up to attempts times. Return the first result that succeeded.
 * If all the attempts failed – throw the error of the last attempt.
 * Between attempts wait delayMs (default 0).
 */
export async function retry<T>(fn: () => Promise<T>, attempts: number, delayMs = 0): Promise<T> {
  throw new Error("TODO");
}

/**
 * Exercise 5 – withTimeout
 * If promise settles before ms – return its result.
 * Otherwise – reject with an Error whose message is "Timeout after <ms>ms".
 * Hint: Promise.race
 */
export function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  throw new Error("TODO");
}

/**
 * Exercise 6 – fetchAll in parallel with reporting
 * getUser is an async function (injected by the self-check).
 * Run all the ids in parallel. Return:
 *   { users: [...the users that succeeded, in the order of the ids], failedIds: [...ids that failed] }
 * Hint: Promise.allSettled
 */
export async function fetchAll<U>(
  ids: number[],
  getUser: (id: number) => Promise<U>,
): Promise<{ users: U[]; failedIds: number[] }> {
  throw new Error("TODO");
}

// ============================================================
// Self-check – run:  npm run exercise -- 08
// On every line, the value left of "=> expected:" must equal the value on its right.
// (No need to change the code below this line)
// ============================================================

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

console.log("\n--- Exercise 1: sleep ---");
try {
  const start = Date.now();
  await sleep(60);
  // did it wait roughly 60ms?
  console.log(Date.now() - start >= 50, "=> expected:", true);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 2: ApiError ---");
try {
  const e = new ApiError(503, "maintenance");
  console.log(e instanceof Error, "=> expected:", true);
  console.log(e.name, "=> expected:", "ApiError");
  console.log(e.status, "=> expected:", 503);
  console.log(e.message, "=> expected:", "Request failed with status 503: maintenance");
  console.log(e.isServerError, "=> expected:", true);
  console.log(new ApiError(404, "nope").isServerError, "=> expected:", false);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 3: safeJsonParse ---");
try {
  console.log(safeJsonParse('{"a":1}'), "=> expected:", { ok: true, value: { a: 1 } });
  const bad = safeJsonParse("{oops");
  console.log(bad.ok, "=> expected:", false);
  // is there an error message (not empty)?
  console.log(!bad.ok && bad.error.length > 0, "=> expected:", true);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 4: retry ---");
try {
  // succeeds on the third attempt
  let calls = 0;
  const result = await retry(async () => {
    calls++;
    if (calls < 3) throw new Error(`fail ${calls}`);
    return "ok";
  }, 5);
  console.log(result, "=> expected:", "ok");
  console.log(calls, "=> expected:", 3);

  // all the attempts failed – the last error is thrown
  calls = 0;
  await expectError(
    () =>
      retry(async () => {
        calls++;
        throw new Error(`fail ${calls}`);
      }, 3),
    "fail 3",
  );
  console.log(calls, "=> expected:", 3);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 5: withTimeout ---");
try {
  console.log(await withTimeout(Promise.resolve("fast"), 100), "=> expected:", "fast");
  await expectError(() => withTimeout(new Promise((r) => setTimeout(r, 300)), 50), "Timeout after 50ms");
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 6: fetchAll ---");
try {
  const getUser = async (id: number) => {
    await new Promise((r) => setTimeout(r, 10 * (5 - id)));
    if (id % 2 === 0) throw new Error("not found");
    return { id };
  };
  console.log(await fetchAll([1, 2, 3, 4], getUser), "=> expected:", { users: [{ id: 1 }, { id: 3 }], failedIds: [2, 4] });
} catch (e) {
  console.log("  ✋", (e as Error).message);
}
