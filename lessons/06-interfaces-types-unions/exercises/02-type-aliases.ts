// Lesson 6 – Topic 02: Type Aliases – Exercises
// ------------------------------------------------------------
// Instructions:
//   1. Fill in the body of each function in place of the line  throw new Error("TODO")
//   2. The types are already defined – read them carefully, they describe exactly what to return.
//   3. Check yourself: npm run exercise -- 06 02 (self-check at the end of the file)
// ------------------------------------------------------------

/**
 * Exercise 1 – A type for a function
 * NumberMatcher is "a function that takes a number and returns a boolean".
 * between(min, max) returns a NumberMatcher that checks whether the value is in range (inclusive).
 *
 *   const isFast = between(0, 200);
 *   isFast(150) => true
 *   isFast(200) => true
 *   isFast(201) => false
 *
 * Hint: the function returns a function:  return (value) => ...
 */
export type NumberMatcher = (value: number) => boolean;

export function between(min: number, max: number): NumberMatcher {
  throw new Error("TODO");
}

/**
 * Exercise 2 – Literal types + Record
 * Environment allows only "dev" | "staging" | "prod".
 * Build a full URL based on the environment:
 *   dev     => "http://localhost:3000"
 *   staging => "https://staging.example.com"
 *   prod    => "https://example.com"
 * The path may come with or without a leading "/" – the result must have exactly one "/".
 *
 *   buildUrl("staging", "/users") => "https://staging.example.com/users"
 *   buildUrl("dev", "health")     => "http://localhost:3000/health"
 *
 * Hint: inside the function define  const baseUrls: Record<Environment, string> = { ... }
 *      (try leaving out one environment – TS will warn that a key is missing!)
 */
export type Environment = "dev" | "staging" | "prod";

export function buildUrl(env: Environment, path: string): string {
  throw new Error("TODO");
}

/**
 * Exercise 3 – Tuple
 * StatusLine is a tuple:  [code: number, text: string]
 * Parse an HTTP status line and return a tuple:
 *   parseStatusLine("HTTP/1.1 200 OK")         => [200, "OK"]
 *   parseStatusLine("HTTP/1.1 404 Not Found")  => [404, "Not Found"]
 *   parseStatusLine("HTTP/2 503 Service Unavailable") => [503, "Service Unavailable"]
 * If the line isn't in the format "<protocol> <3 digits> <text>" – throw an Error with the message:
 *   "Invalid status line: <line>"
 *
 * Hint: split(" ") – the second part is the code, and everything else (slice(2).join(" ")) is the text.
 *      Check that the code is exactly 3 digits (e.g. /^\d{3}$/).
 */
export type StatusLine = [code: number, text: string];

export function parseStatusLine(line: string): StatusLine {
  throw new Error("TODO");
}

/**
 * Exercise 4 – Intersection (&)
 * StoredBug = Bug & WithTimestamps  (all fields of both).
 *   stampBug(bug, now)    – returns a new StoredBug: createdAt = updatedAt = now
 *   touchBug(stored, now) – returns a new StoredBug where only updatedAt = now
 * Don't change (mutate) the object you received!
 *
 *   stampBug({ id: 1, title: "Broken link" }, "2026-11-01")
 *     => { id: 1, title: "Broken link", createdAt: "2026-11-01", updatedAt: "2026-11-01" }
 *
 * Hint: spread –  { ...bug, createdAt: now, ... }
 */
export type Bug = { id: number; title: string };
export type WithTimestamps = { createdAt: string; updatedAt: string };
export type StoredBug = Bug & WithTimestamps;

export function stampBug(bug: Bug, now: string): StoredBug {
  throw new Error("TODO");
}

export function touchBug(stored: StoredBug, now: string): StoredBug {
  throw new Error("TODO");
}

/**
 * Exercise 5 – Utility types: Partial, Omit, Pick
 *   applyDraft(base, draft) – returns a new TestCase: base with the fields that appear in draft.
 *       draft is Partial<Omit<TestCase, "id">> – meaning id can't be changed.
 *       Don't change base.
 *   toPreview(tc) – returns a TestCasePreview containing only id and title (no extra fields!)
 *
 *   applyDraft(tc, { title: "Login v2" })  => same as tc, but with the new title
 *   toPreview(tc) => { id: "TC-1", title: "Login" }
 *
 * Hint: in toPreview don't return tc itself (it has extra fields) – build a new object.
 */
export type Priority = "P1" | "P2" | "P3";

export interface TestCase {
  id: string;
  title: string;
  steps: string[];
  owner: string;
  priority: Priority;
}

export type TestCaseDraft = Partial<Omit<TestCase, "id">>;
export type TestCasePreview = Pick<TestCase, "id" | "title">;

export function applyDraft(base: TestCase, draft: TestCaseDraft): TestCase {
  throw new Error("TODO");
}

export function toPreview(tc: TestCase): TestCasePreview {
  throw new Error("TODO");
}

/**
 * Exercise 6 (Bonus) – Record + Tuple + Literal types together
 * Take an array of runs, where each run is a tuple:  [browser, passed]
 * and return ResultsByBrowser – { passed, failed } for each of the three browsers.
 * A browser with no runs at all appears as { passed: 0, failed: 0 }.
 *
 *   aggregateByBrowser([["chromium", true], ["chromium", false], ["webkit", true]])
 *     => { chromium: { passed: 1, failed: 1 }, firefox: { passed: 0, failed: 0 }, webkit: { passed: 1, failed: 0 } }
 *
 * Hint: first initialize the three keys, then loop over the runs with for...of and destructure [browser, passed].
 */
export type BrowserName = "chromium" | "firefox" | "webkit";
export type BrowserRun = [browser: BrowserName, passed: boolean];
export type Counts = { passed: number; failed: number };
export type ResultsByBrowser = Record<BrowserName, Counts>;

export function aggregateByBrowser(runs: BrowserRun[]): ResultsByBrowser {
  throw new Error("TODO");
}

// ============================================================
// Self-check – run:  npm run exercise -- 06 02
// On every line, the value left of "=> expected:" must equal the value on its right.
// (No need to change the code below this line)
// ============================================================

console.log("\n--- Exercise 1: between ---");
try {
  const isFast = between(0, 200);
  console.log(typeof isFast, "=> expected:", "function");
  console.log(isFast(150), "=> expected:", true);
  console.log(isFast(0), "=> expected:", true);
  console.log(isFast(200), "=> expected:", true);
  console.log(isFast(201), "=> expected:", false);
  console.log(isFast(-1), "=> expected:", false);
  const isServerError = between(500, 599);
  console.log([200, 404, 500, 503, 600].map(isServerError), "=> expected:", [false, false, true, true, false]);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 2: buildUrl ---");
try {
  console.log(buildUrl("staging", "/users"), "=> expected:", "https://staging.example.com/users");
  console.log(buildUrl("dev", "health"), "=> expected:", "http://localhost:3000/health");
  console.log(buildUrl("prod", "/api/v1/orders"), "=> expected:", "https://example.com/api/v1/orders");
  console.log(buildUrl("prod", "login"), "=> expected:", "https://example.com/login");
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 3: parseStatusLine ---");
try {
  console.log(parseStatusLine("HTTP/1.1 200 OK"), "=> expected:", [200, "OK"]);
  console.log(parseStatusLine("HTTP/1.1 404 Not Found"), "=> expected:", [404, "Not Found"]);
  console.log(parseStatusLine("HTTP/2 503 Service Unavailable"), "=> expected:", [503, "Service Unavailable"]);
  const [code, text] = parseStatusLine("HTTP/1.1 201 Created");
  console.log(typeof code, "=> expected:", "number");
  console.log(text, "=> expected:", "Created");
  const badLines: [string, string][] = [
    ["garbage", "Invalid status line: garbage"],
    ["HTTP/1.1 OK", "Invalid status line: HTTP/1.1 OK"],
    ["HTTP/1.1 20 OK", "Invalid status line: HTTP/1.1 20 OK"],
  ];
  for (const [bad, expectedMessage] of badLines) {
    try {
      parseStatusLine(bad);
      console.log("did not throw", "=> expected:", "threw:", expectedMessage);
    } catch (err) {
      if ((err as Error).message === "TODO") throw err;
      console.log("threw:", (err as Error).message, "=> expected:", "threw:", expectedMessage);
    }
  }
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 4: stampBug + touchBug ---");
try {
  const bug = { id: 1, title: "Broken link" };
  const stored = stampBug(bug, "2026-11-01");
  console.log(stored, "=> expected:", { id: 1, title: "Broken link", createdAt: "2026-11-01", updatedAt: "2026-11-01" });
  console.log(bug, "=> expected:", { id: 1, title: "Broken link" }); // the original bug must not change
  const touched = touchBug(stored, "2026-11-05");
  console.log(touched, "=> expected:", { id: 1, title: "Broken link", createdAt: "2026-11-01", updatedAt: "2026-11-05" });
  console.log(stored.updatedAt, "=> expected:", "2026-11-01"); // the original stored must not change
  console.log(touched === stored, "=> expected:", false); // a new object
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 5: applyDraft + toPreview ---");
try {
  const loginCase: TestCase = {
    id: "TC-1",
    title: "Login",
    steps: ["open /login", "fill credentials", "submit"],
    owner: "dana",
    priority: "P1",
  };
  const original = structuredClone(loginCase);
  console.log(applyDraft(loginCase, { title: "Login v2", priority: "P2" }), "=> expected:", {
    ...original,
    title: "Login v2",
    priority: "P2",
  });
  console.log(loginCase, "=> expected:", original); // base must not change
  console.log(applyDraft(loginCase, {}), "=> expected:", original);
  console.log(applyDraft(loginCase, {}) === loginCase, "=> expected:", false); // must return a new object
  console.log(toPreview(loginCase), "=> expected:", { id: "TC-1", title: "Login" });
  console.log(Object.keys(toPreview(loginCase)).sort(), "=> expected:", ["id", "title"]);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 6 (Bonus): aggregateByBrowser ---");
try {
  console.log(
    aggregateByBrowser([
      ["chromium", true],
      ["chromium", false],
      ["webkit", true],
    ]),
    "=> expected:",
    {
      chromium: { passed: 1, failed: 1 },
      firefox: { passed: 0, failed: 0 },
      webkit: { passed: 1, failed: 0 },
    },
  );
  console.log(aggregateByBrowser([]), "=> expected:", {
    chromium: { passed: 0, failed: 0 },
    firefox: { passed: 0, failed: 0 },
    webkit: { passed: 0, failed: 0 },
  });
  const r = aggregateByBrowser([
    ["firefox", false],
    ["firefox", false],
    ["firefox", true],
  ]);
  console.log(r.firefox, "=> expected:", { passed: 1, failed: 2 });
  // Each browser gets its own counts object (not shared)
  console.log(r.chromium === r.webkit, "=> expected:", false);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}
