// Lesson 8 – Topic 01: Promise – Exercises
// ------------------------------------------------------------
// Instructions:
//   1. Fill in the body of each function in place of the line  throw new Error("TODO")
//   2. This topic works with new Promise, then / catch / finally and Promise.all / allSettled / race.
//      (async / await is the next topic – try to solve these without it)
//   3. Check yourself: npm run exercise -- 08 01 (self-check at the end of the file)
// ------------------------------------------------------------

/**
 * Exercise 1 – delayedValue
 * Return a Promise that resolves with value after ms milliseconds.
 * Example: delayedValue("ready", 20)  =>  after ~20ms you get "ready"
 * Useful in server "mocks": you return a response, just not immediately.
 * Hint: new Promise((resolve) => setTimeout(...))
 */
export function delayedValue<T>(value: T, ms: number): Promise<T> {
  throw new Error("TODO");
}

/**
 * Exercise 2 – runStep: then / catch / finally
 * Run step() (it returns Promise<string>) and record the outcome in the log array:
 *   success => log.push("PASS <name>: <result>")         and a promise that resolves with true
 *   failure => log.push("FAIL <name>: <error.message>")  and a promise that resolves with false (not rejected!)
 *   always, at the end => log.push("END <name>")
 * Example: step returns "logged in"  =>  log = ["PASS login: logged in", "END login"], value: true
 * Hint: step().then(...).catch(...).finally(...)
 */
export function runStep(name: string, step: () => Promise<string>, log: string[]): Promise<boolean> {
  throw new Error("TODO");
}

/**
 * Exercise 3 – loadDashboard: Promise.all
 * Before testing the Dashboard screen you need to load 3 independent things from the API:
 *   api.getUser(), api.getPermissions(), api.getNotifications()
 * Start all three in parallel (not one after the other!) and return:
 *   { user, permissions, notificationCount }   (notificationCount = length of the notifications array)
 * If any of the calls fails – the whole promise rejects with that same error.
 * Hint: Promise.all([...]).then(([user, permissions, notifications]) => ...)
 */
export interface DashboardApi {
  getUser(): Promise<{ id: number; name: string }>;
  getPermissions(): Promise<string[]>;
  getNotifications(): Promise<string[]>;
}

export function loadDashboard(
  api: DashboardApi,
): Promise<{ user: { id: number; name: string }; permissions: string[]; notificationCount: number }> {
  throw new Error("TODO");
}

/**
 * Exercise 4 – summarizeSuite: Promise.allSettled
 * You get a list of tests, each with a name and a run function that returns a Promise.
 * Run them all in parallel, wait for all of them to finish (including the ones that failed), and return:
 *   { passed: [names of the tests that passed], failed: [{ name, reason: <error.message> }] }
 * Keep the tests in the order they were given (not in the order they finished).
 * Hint: Promise.allSettled(tests.map((t) => t.run())) and then go over the results with the index.
 */
export interface SuiteTest {
  name: string;
  run: () => Promise<unknown>;
}

export function summarizeSuite(
  tests: SuiteTest[],
): Promise<{ passed: string[]; failed: { name: string; reason: string }[] }> {
  throw new Error("TODO");
}

/**
 * Exercise 5 – raceWithFallback: Promise.race
 * If primary resolves successfully within ms – return its value.
 * If ms have passed and it still hasn't finished – resolve (resolve!) with fallbackValue (not an error).
 * If primary rejects before ms – the promise rejects with that same error.
 * Important: clear the timer (clearTimeout) at the end, so no "dangling" timer is left holding the process.
 * Example: feature flags from the server – if it didn't answer within 50ms, carry on with the default.
 * Hint: Promise.race([primary, timerPromise]).finally(() => clearTimeout(timer))
 */
export function raceWithFallback<T>(primary: Promise<T>, fallbackValue: T, ms: number): Promise<T> {
  throw new Error("TODO");
}

/**
 * Exercise 6 (Bonus) – myPromiseAll: implement Promise.all yourself
 * Without using Promise.all / allSettled!
 *   - returns a Promise that resolves with the array of results – in the same order as the input (not the finishing order)
 *   - rejects immediately with the error of the first promise that failed
 *   - empty array => resolves immediately with []
 * Hint: new Promise((resolve, reject) => ...) + a counter of how many have finished + results[i] = value
 */
export function myPromiseAll<T>(promises: Promise<T>[]): Promise<T[]> {
  throw new Error("TODO");
}

// ============================================================
// Self-check – run:  npm run exercise -- 08 01
// On every line, the value left of "=> expected:" must equal the value on its right.
// (No need to change the code below this line)
// ============================================================

const pause = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
const later = <T>(value: T, ms: number) => pause(ms).then(() => value);
const failLater = (message: string, ms: number) =>
  pause(ms).then(() => {
    throw new Error(message);
  });

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

console.log("\n--- Exercise 1: delayedValue ---");
try {
  const start = Date.now();
  const p = delayedValue("ready", 30);
  console.log(p instanceof Promise, "=> expected:", true);
  console.log(await p, "=> expected:", "ready");
  // did it wait roughly 30ms?
  console.log(Date.now() - start >= 25, "=> expected:", true);
  console.log(await delayedValue({ id: 1 }, 0), "=> expected:", { id: 1 });
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 2: runStep ---");
try {
  const log: string[] = [];
  console.log(await runStep("login", () => later("logged in", 5), log), "=> expected:", true);
  console.log(log, "=> expected:", ["PASS login: logged in", "END login"]);

  const log2: string[] = [];
  console.log(await runStep("checkout", () => failLater("button not found", 5), log2), "=> expected:", false);
  console.log(log2, "=> expected:", ["FAIL checkout: button not found", "END checkout"]);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 3: loadDashboard ---");
try {
  let inFlight = 0;
  let maxInFlight = 0;
  const track = <T>(value: T) => {
    inFlight++;
    maxInFlight = Math.max(maxInFlight, inFlight);
    return pause(10).then(() => {
      inFlight--;
      return value;
    });
  };
  const api = {
    getUser: () => track({ id: 7, name: "Dana" }),
    getPermissions: () => track(["read", "write"]),
    getNotifications: () => track(["a", "b", "c"]),
  };
  console.log(await loadDashboard(api), "=> expected:", {
    user: { id: 7, name: "Dana" },
    permissions: ["read", "write"],
    notificationCount: 3,
  });
  // how many calls ran at the same time? (3 = all in parallel)
  console.log(maxInFlight, "=> expected:", 3);

  await expectError(
    () => loadDashboard({ ...api, getPermissions: () => failLater("403 Forbidden", 5) }),
    "403 Forbidden",
  );
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 4: summarizeSuite ---");
try {
  const result = await summarizeSuite([
    { name: "login", run: () => later("ok", 20) },
    { name: "search", run: () => failLater("timeout", 5) },
    { name: "cart", run: () => later("ok", 1) },
    { name: "pay", run: () => failLater("500 from server", 10) },
  ]);
  console.log(result, "=> expected:", {
    passed: ["login", "cart"],
    failed: [
      { name: "search", reason: "timeout" },
      { name: "pay", reason: "500 from server" },
    ],
  });
  console.log(await summarizeSuite([]), "=> expected:", { passed: [], failed: [] });
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 5: raceWithFallback ---");
try {
  console.log(await raceWithFallback(later("from server", 5), "default", 50), "=> expected:", "from server");

  const start = Date.now();
  console.log(await raceWithFallback(later("too late", 120), "default", 20), "=> expected:", "default");
  // didn't wait for the slow promise?
  console.log(Date.now() - start < 100, "=> expected:", true);

  // a promise that never settles – you still get the fallback
  console.log(await raceWithFallback(new Promise<number>(() => {}), 0, 10), "=> expected:", 0);

  await expectError(() => raceWithFallback(failLater("boom", 5), "default", 50), "boom");
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 6 (Bonus): myPromiseAll ---");
try {
  console.log(await myPromiseAll([later("a", 20), later("b", 1), later("c", 10)]), "=> expected:", ["a", "b", "c"]);
  console.log(await myPromiseAll([]), "=> expected:", []);
  await expectError(() => myPromiseAll([later(1, 20), failLater("second failed", 5), later(3, 1)]), "second failed");
} catch (e) {
  console.log("  ✋", (e as Error).message);
}
