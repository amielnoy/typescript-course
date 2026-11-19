// Lesson 8 – Topic 01: Promise – Solutions

export function delayedValue<T>(value: T, ms: number): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export function runStep(name: string, step: () => Promise<string>, log: string[]): Promise<boolean> {
  return step()
    .then((result) => {
      log.push(`PASS ${name}: ${result}`);
      return true;
    })
    .catch((err: Error) => {
      // catch "repairs" the chain: from here on the promise resolves successfully with false
      log.push(`FAIL ${name}: ${err.message}`);
      return false;
    })
    .finally(() => {
      log.push(`END ${name}`);
    });
}

export interface DashboardApi {
  getUser(): Promise<{ id: number; name: string }>;
  getPermissions(): Promise<string[]>;
  getNotifications(): Promise<string[]>;
}

export function loadDashboard(
  api: DashboardApi,
): Promise<{ user: { id: number; name: string }; permissions: string[]; notificationCount: number }> {
  // all three calls already start here – in parallel
  return Promise.all([api.getUser(), api.getPermissions(), api.getNotifications()]).then(
    ([user, permissions, notifications]) => ({ user, permissions, notificationCount: notifications.length }),
  );
}

export interface SuiteTest {
  name: string;
  run: () => Promise<unknown>;
}

export function summarizeSuite(
  tests: SuiteTest[],
): Promise<{ passed: string[]; failed: { name: string; reason: string }[] }> {
  return Promise.allSettled(tests.map((t) => t.run())).then((results) => {
    const passed: string[] = [];
    const failed: { name: string; reason: string }[] = [];
    results.forEach((r, i) => {
      const name = tests[i].name;
      if (r.status === "fulfilled") passed.push(name);
      else failed.push({ name, reason: r.reason instanceof Error ? r.reason.message : String(r.reason) });
    });
    return { passed, failed };
  });
}

export function raceWithFallback<T>(primary: Promise<T>, fallbackValue: T, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const fallback = new Promise<T>((resolve) => {
    timer = setTimeout(() => resolve(fallbackValue), ms);
  });
  // finally runs no matter what – it clears the timer even when primary won
  return Promise.race([primary, fallback]).finally(() => clearTimeout(timer));
}

export function myPromiseAll<T>(promises: Promise<T>[]): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const results: T[] = new Array(promises.length);
    let done = 0;
    if (promises.length === 0) {
      resolve([]);
      return;
    }
    promises.forEach((p, i) => {
      p.then((value) => {
        results[i] = value; // by index – not by finishing order
        done++;
        if (done === promises.length) resolve(results);
      }, reject); // the first failure rejects everything (further calls to reject are simply ignored)
    });
  });
}

// ============================================================
// Self-check – run:  npm run solution -- 08 01
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
