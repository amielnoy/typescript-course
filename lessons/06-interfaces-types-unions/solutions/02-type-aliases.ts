// Lesson 6 – Topic 02: Type Aliases – Solutions

// ---------- Exercise 1 ----------
export type NumberMatcher = (value: number) => boolean;

export function between(min: number, max: number): NumberMatcher {
  // The value parameter gets the type number automatically from NumberMatcher
  return (value) => value >= min && value <= max;
}

// ---------- Exercise 2 ----------
export type Environment = "dev" | "staging" | "prod";

export function buildUrl(env: Environment, path: string): string {
  // Record<Environment, string> requires a key for every environment – forgot one? Compile error
  const baseUrls: Record<Environment, string> = {
    dev: "http://localhost:3000",
    staging: "https://staging.example.com",
    prod: "https://example.com",
  };
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrls[env]}${normalizedPath}`;
}

// ---------- Exercise 3 ----------
export type StatusLine = [code: number, text: string];

export function parseStatusLine(line: string): StatusLine {
  const parts = line.split(" ");
  if (parts.length < 3 || !/^\d{3}$/.test(parts[1])) {
    throw new Error(`Invalid status line: ${line}`);
  }
  return [Number(parts[1]), parts.slice(2).join(" ")];
}

// ---------- Exercise 4 ----------
export type Bug = { id: number; title: string };
export type WithTimestamps = { createdAt: string; updatedAt: string };
export type StoredBug = Bug & WithTimestamps;

export function stampBug(bug: Bug, now: string): StoredBug {
  return { ...bug, createdAt: now, updatedAt: now };
}

export function touchBug(stored: StoredBug, now: string): StoredBug {
  return { ...stored, updatedAt: now };
}

// ---------- Exercise 5 ----------
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
  // Fields from draft "override" those of base; id can't appear in draft at all
  return { ...base, ...draft };
}

export function toPreview(tc: TestCase): TestCasePreview {
  // Pick is only a type – at runtime you need to build a new object with just these fields
  return { id: tc.id, title: tc.title };
}

// ---------- Exercise 6 (Bonus) ----------
export type BrowserName = "chromium" | "firefox" | "webkit";
export type BrowserRun = [browser: BrowserName, passed: boolean];
export type Counts = { passed: number; failed: number };
export type ResultsByBrowser = Record<BrowserName, Counts>;

export function aggregateByBrowser(runs: BrowserRun[]): ResultsByBrowser {
  const results: ResultsByBrowser = {
    chromium: { passed: 0, failed: 0 },
    firefox: { passed: 0, failed: 0 },
    webkit: { passed: 0, failed: 0 },
  };
  for (const [browser, passed] of runs) {
    if (passed) {
      results[browser].passed++;
    } else {
      results[browser].failed++;
    }
  }
  return results;
}

// ============================================================
// Self-check – run:  npm run solution -- 06 02
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
