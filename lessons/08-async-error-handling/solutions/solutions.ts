// Lesson 8 – Summary solutions
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    details: string,
  ) {
    super(`Request failed with status ${status}: ${details}`);
    this.name = "ApiError";
  }

  get isServerError(): boolean {
    return this.status >= 500;
  }
}

export function safeJsonParse(text: string): { ok: true; value: unknown } | { ok: false; error: string } {
  try {
    return { ok: true, value: JSON.parse(text) };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

export async function retry<T>(fn: () => Promise<T>, attempts: number, delayMs = 0): Promise<T> {
  let lastError: unknown;
  for (let i = 1; i <= attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (i < attempts && delayMs > 0) await sleep(delayMs);
    }
  }
  throw lastError;
}

export function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

export async function fetchAll<U>(
  ids: number[],
  getUser: (id: number) => Promise<U>,
): Promise<{ users: U[]; failedIds: number[] }> {
  const results = await Promise.allSettled(ids.map((id) => getUser(id)));
  const users: U[] = [];
  const failedIds: number[] = [];
  results.forEach((r, i) => {
    if (r.status === "fulfilled") users.push(r.value);
    else failedIds.push(ids[i]);
  });
  return { users, failedIds };
}

// ============================================================
// Self-check – run:  npm run solution -- 08
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
