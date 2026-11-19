// Lesson 8 – Topic 02: async / await – Solutions

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export interface User {
  id: number;
  name: string;
  email: string;
}

export async function getUserLabel(fetchUser: (id: number) => Promise<User>, id: number): Promise<string> {
  const user = await fetchUser(id);
  return `#${user.id} ${user.name} <${user.email}>`;
}

export async function runSequentially(steps: Array<() => Promise<string>>): Promise<string[]> {
  const results: string[] = [];
  for (const step of steps) {
    results.push(await step()); // wait for each step before starting the next one
  }
  return results;
}

export interface UsersApi {
  createUser(name: string): Promise<{ id: number }>;
  getUser(id: number): Promise<User>;
}

export async function createAndVerifyUser(api: UsersApi, name: string): Promise<User> {
  const { id } = await api.createUser(name);
  const user = await api.getUser(id); // depends on the id from the previous step – hence sequential
  if (user.name !== name) {
    throw new Error(`Expected name "${name}" but got "${user.name}"`);
  }
  return user;
}

export async function waitFor(
  condition: () => boolean | Promise<boolean>,
  timeoutMs: number,
  intervalMs: number,
): Promise<number> {
  const start = Date.now();
  let attempts = 0;
  while (true) {
    attempts++;
    if (await condition()) return attempts;
    if (Date.now() - start >= timeoutMs) {
      throw new Error(`Condition not met within ${timeoutMs}ms`);
    }
    await sleep(intervalMs);
  }
}

export async function fetchInBatches<T>(
  ids: number[],
  batchSize: number,
  fetchOne: (id: number) => Promise<T>,
): Promise<T[]> {
  const results: T[] = [];
  for (let i = 0; i < ids.length; i += batchSize) {
    const batch = ids.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map((id) => fetchOne(id))); // in parallel within the batch
    results.push(...batchResults);
  }
  return results;
}

export interface TestCase {
  name: string;
  fn: () => Promise<void>;
}

export type TestResult = { name: string; status: "passed" } | { name: string; status: "failed"; error: string };

export async function runTests(tests: TestCase[]): Promise<TestResult[]> {
  const results: TestResult[] = [];
  for (const t of tests) {
    try {
      await t.fn(); // without await – the catch would not catch the failure!
      results.push({ name: t.name, status: "passed" });
    } catch (err) {
      results.push({ name: t.name, status: "failed", error: err instanceof Error ? err.message : String(err) });
    }
  }
  return results;
}

// ============================================================
// Self-check – run:  npm run solution -- 08 02
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
