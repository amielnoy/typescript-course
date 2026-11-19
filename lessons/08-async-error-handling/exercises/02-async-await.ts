// Lesson 8 – Topic 02: async / await – Exercises
// ------------------------------------------------------------
// Instructions:
//   1. Fill in the body of each function in place of the line  throw new Error("TODO")
//   2. Write with async / await (and try / catch where needed). All the "servers" are injected as functions (see the self-check at the end of the file).
//   3. If you need to wait – write yourself a small sleep in the file (like in example 02).
//   4. Check yourself: npm run exercise -- 08 02 (self-check at the end of the file)
// ------------------------------------------------------------

export interface User {
  id: number;
  name: string;
  email: string;
}

/**
 * Exercise 1 – getUserLabel
 * Wait (await) for the user from fetchUser(id) and return a string in the format:
 *   "#<id> <name> <<email>>"
 * Example: { id: 2, name: "Yossi", email: "yossi@example.com" }  =>  "#2 Yossi <yossi@example.com>"
 * If fetchUser fails – the error simply propagates out (don't catch it here).
 */
export async function getUserLabel(fetchUser: (id: number) => Promise<User>, id: number): Promise<string> {
  throw new Error("TODO");
}

/**
 * Exercise 2 – runSequentially
 * Run the steps one after another – each step starts only after the previous one has finished
 * (like in a UI test: open browser -> log in -> add to cart -> pay).
 * Return an array with the results of all the steps, in order.
 * Hint: for...of + await (here you actually do want "await inside a loop").
 */
export async function runSequentially(steps: Array<() => Promise<string>>): Promise<string[]> {
  throw new Error("TODO");
}

/**
 * Exercise 3 – createAndVerifyUser: a dependent (sequential) flow
 *   1. Create a user:  const { id } = await api.createUser(name)
 *   2. Read it back from the server:  await api.getUser(id)
 *   3. If the returned name differs from name – throw an Error with the message:
 *        Expected name "<name>" but got "<actual name>"
 *   4. Otherwise – return the user returned by getUser.
 */
export interface UsersApi {
  createUser(name: string): Promise<{ id: number }>;
  getUser(id: number): Promise<User>;
}

export async function createAndVerifyUser(api: UsersApi, name: string): Promise<User> {
  throw new Error("TODO");
}

/**
 * Exercise 4 – waitFor: polling until a condition holds
 * Like expect.poll / waitForSelector in Playwright:
 *   - call condition() (it may return boolean or Promise<boolean> – await works on both)
 *   - if it returned true – return the number of attempts (how many times you called condition)
 *   - otherwise – if timeoutMs has passed since the start – throw Error: "Condition not met within <timeoutMs>ms"
 *   - otherwise – wait intervalMs and try again
 * Example: condition returns true on the 3rd call  =>  the result is 3
 * Hint: const start = Date.now();  ...  Date.now() - start >= timeoutMs
 */
export async function waitFor(
  condition: () => boolean | Promise<boolean>,
  timeoutMs: number,
  intervalMs: number,
): Promise<number> {
  throw new Error("TODO");
}

/**
 * Exercise 5 – fetchInBatches: parallel within a batch, sequential between batches
 * You want to check many ids against a server, but without "bombarding" it all at once.
 * Split ids into batches of size batchSize. Each batch runs in parallel (Promise.all),
 * and a new batch starts only after the previous one has finished.
 * Return all the results in the original order of the ids.
 * Example: ids=[1,2,3,4,5], batchSize=2  =>  [1,2] then [3,4] then [5]
 * Hint: for (let i = 0; i < ids.length; i += batchSize) { ids.slice(i, i + batchSize) ... }
 */
export async function fetchInBatches<T>(
  ids: number[],
  batchSize: number,
  fetchOne: (id: number) => Promise<T>,
): Promise<T[]> {
  throw new Error("TODO");
}

/**
 * Exercise 6 (Bonus) – runTests: a mini test runner
 * Run the tests one after another (sequentially). A test that threw an error does not stop the rest.
 * For each test return:
 *   passed => { name, status: "passed" }
 *   failed => { name, status: "failed", error: <error.message> }
 * Hint: try { await t.fn(); ... } catch (err) { ... }  inside for...of
 */
export interface TestCase {
  name: string;
  fn: () => Promise<void>;
}

export type TestResult = { name: string; status: "passed" } | { name: string; status: "failed"; error: string };

export async function runTests(tests: TestCase[]): Promise<TestResult[]> {
  throw new Error("TODO");
}

// ============================================================
// Self-check – run:  npm run exercise -- 08 02
// On every line, the value left of "=> expected:" must equal the value on its right.
// (No need to change the code below this line)
// ============================================================

const pause = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

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

console.log("\n--- Exercise 1: getUserLabel ---");
try {
  const fetchUser = async (id: number) => {
    await pause(5);
    return { id, name: "Yossi", email: "yossi@example.com" };
  };
  console.log(await getUserLabel(fetchUser, 2), "=> expected:", "#2 Yossi <yossi@example.com>");

  const broken = async (_id: number): Promise<User> => {
    throw new Error("User not found");
  };
  await expectError(() => getUserLabel(broken, 404), "User not found");
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 2: runSequentially ---");
try {
  const events: string[] = [];
  const step = (name: string, ms: number) => async () => {
    events.push(`start ${name}`);
    await pause(ms);
    events.push(`end ${name}`);
    return name;
  };
  console.log(await runSequentially([step("open", 15), step("login", 1), step("pay", 5)]), "=> expected:", [
    "open",
    "login",
    "pay",
  ]);
  // each step starts only after the previous one has finished
  console.log(events, "=> expected:", ["start open", "end open", "start login", "end login", "start pay", "end pay"]);
  console.log(await runSequentially([]), "=> expected:", []);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 3: createAndVerifyUser ---");
try {
  const calls: string[] = [];
  const api = {
    createUser: async (name: string) => {
      calls.push(`create ${name}`);
      await pause(5);
      return { id: 42 };
    },
    getUser: async (id: number) => {
      calls.push(`get ${id}`);
      return { id, name: "Avi", email: "avi@example.com" };
    },
  };
  console.log(await createAndVerifyUser(api, "Avi"), "=> expected:", { id: 42, name: "Avi", email: "avi@example.com" });
  console.log(calls, "=> expected:", ["create Avi", "get 42"]);

  await expectError(() => createAndVerifyUser(api, "Dana"), 'Expected name "Dana" but got "Avi"');
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 4: waitFor ---");
try {
  let calls = 0;
  console.log(await waitFor(() => ++calls >= 3, 500, 5), "=> expected:", 3);
  console.log(calls, "=> expected:", 3);

  // an async condition – it only holds after ~20ms, so more than one attempt is needed
  let ready = false;
  setTimeout(() => (ready = true), 20);
  console.log((await waitFor(async () => ready, 500, 5)) > 1, "=> expected:", true);

  // already holds – one attempt
  console.log(await waitFor(() => true, 100, 5), "=> expected:", 1);

  const start = Date.now();
  await expectError(() => waitFor(() => false, 30, 5), "Condition not met within 30ms");
  const elapsed = Date.now() - start;
  // gave up after ~30ms (not immediately, and not after a long time)?
  console.log(elapsed >= 25 && elapsed < 300, "=> expected:", true);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 5: fetchInBatches ---");
try {
  let inFlight = 0;
  let maxInFlight = 0;
  const startedBatches: number[][] = [];
  const fetchOne = async (id: number) => {
    inFlight++;
    maxInFlight = Math.max(maxInFlight, inFlight);
    if (startedBatches.length === 0 || inFlight === 1) startedBatches.push([]);
    startedBatches[startedBatches.length - 1].push(id);
    await pause(id === 1 ? 15 : 5);
    inFlight--;
    return `user-${id}`;
  };
  console.log(await fetchInBatches([1, 2, 3, 4, 5], 2, fetchOne), "=> expected:", [
    "user-1",
    "user-2",
    "user-3",
    "user-4",
    "user-5",
  ]);
  // at most batchSize requests at the same time
  console.log(maxInFlight, "=> expected:", 2);
  console.log(startedBatches, "=> expected:", [[1, 2], [3, 4], [5]]);
  console.log(await fetchInBatches([], 3, fetchOne), "=> expected:", []);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 6 (Bonus): runTests ---");
try {
  const order: string[] = [];
  const results = await runTests([
    {
      name: "login works",
      fn: async () => {
        await pause(5);
        order.push("login");
      },
    },
    {
      name: "cart total",
      fn: async () => {
        order.push("cart");
        throw new Error("expected 3 items, got 2");
      },
    },
    { name: "logout", fn: async () => void order.push("logout") },
  ]);
  console.log(results, "=> expected:", [
    { name: "login works", status: "passed" },
    { name: "cart total", status: "failed", error: "expected 3 items, got 2" },
    { name: "logout", status: "passed" },
  ]);
  console.log(order, "=> expected:", ["login", "cart", "logout"]);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}
