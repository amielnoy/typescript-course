// Lesson 3 – Topic 01: Objects – Solutions

// ---------- Warm-ups (in class, ~5 minutes each) ----------
// Two short exercises we solve during the lesson, right after the examples – before Exercise 1.

export type TestCaseCard = { id: string; title: string; status: string; tags: string[] };

export function createTestCase(id: string, title: string): TestCaseCard {
  return { id, title, status: "new", tags: [] }; // shorthand: { id } is the same as { id: id }
}

export function withTag(card: TestCaseCard, tag: string): TestCaseCard {
  if (card.tags.includes(tag)) {
    return { ...card, tags: [...card.tags] }; // still a copy – the caller may change it safely
  }
  // a new object AND a new array – a plain { ...card } would share the same tags array
  return { ...card, tags: [...card.tags, tag] };
}

// ---------- Exercises ----------
export interface User {
  name: string;
  email: string;
  role?: string;
}

export interface TestConfig {
  baseUrl: string;
  browser: string;
  headless: boolean;
  retries: number;
  timeoutMs: number;
}

export interface ConfigOverrides {
  baseUrl?: string;
  browser?: string;
  headless?: boolean;
  retries?: number;
  timeoutMs?: number;
}

export interface Bug {
  id: number;
  title: string;
  severity: "low" | "medium" | "high";
  status: "open" | "in-progress" | "closed";
}

export interface Suite {
  name: string;
  tests: string[];
  add(testName: string): void;
  describe(): string;
}

export function describeUser(user: User): string {
  const { name, email, role = "tester" } = user;
  return `${name} <${email}> (${role})`;
}

// The last fields win – that's why overrides comes after defaults
export function mergeConfig(defaults: TestConfig, overrides: ConfigOverrides): TestConfig {
  return { ...defaults, ...overrides };
}

export function findEmptyFields(form: Record<string, string>): string[] {
  const empty: string[] = [];
  for (const [field, value] of Object.entries(form)) {
    if (value.trim() === "") empty.push(field);
  }
  return empty;
}

export function diffFields(
  expected: Record<string, string | number | boolean>,
  actual: Record<string, string | number | boolean>,
): string[] {
  const changed = Object.keys(expected).filter((key) => actual[key] !== expected[key]);
  const extra = Object.keys(actual).filter((key) => !(key in expected));
  return [...changed, ...extra];
}

export function updateBugJson(
  bugJson: string,
  changes: { title?: string; severity?: Bug["severity"]; status?: Bug["status"] },
): string {
  const bug = JSON.parse(bugJson) as Bug;
  const updated: Bug = { ...bug, ...changes }; // changes doesn't include id – so it is preserved
  return JSON.stringify(updated);
}

// Object literal with methods – this points to the object the method was called on
export function createSuite(name: string): Suite {
  return {
    name,
    tests: [],
    add(testName: string): void {
      this.tests.push(testName);
    },
    describe(): string {
      return `${this.name}: ${this.tests.length} tests`;
    },
  };
}

// ============================================================
// Self-check – run:  npm run solution -- 03 01
// On every line, the value left of "=> expected:" must equal the value on its right.
// (No need to change the code below this line)
// ============================================================

const baseConfig: TestConfig = {
  baseUrl: "http://localhost:3000",
  browser: "chromium",
  headless: true,
  retries: 0,
  timeoutMs: 30000,
};

console.log("\n--- Warm-up A: createTestCase ---");
try {
  console.log(createTestCase("TC-1", "Login"), "=> expected:", { id: "TC-1", title: "Login", status: "new", tags: [] });
  console.log(createTestCase("TC-2", "Logout").tags === createTestCase("TC-2", "Logout").tags, "=> expected:", false); // every card gets its own array
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Warm-up B: withTag ---");
try {
  const card = { id: "TC-1", title: "Login", status: "new", tags: ["smoke"] };
  const tagged = withTag(card, "e2e");
  console.log(tagged.tags, "=> expected:", ["smoke", "e2e"]);
  console.log(card.tags, "=> expected:", ["smoke"]); // the original didn't change
  console.log(tagged === card, "=> expected:", false); // a new object
  const same = withTag(card, "smoke");
  console.log(same.tags, "=> expected:", ["smoke"]); // no duplicates
  same.tags.push("changed");
  console.log(card.tags, "=> expected:", ["smoke"]); // even the "nothing to add" result is a copy
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 1: describeUser ---");
try {
  console.log(describeUser({ name: "Noa", email: "noa@example.com" }), "=> expected:", "Noa <noa@example.com> (tester)");
  console.log(
    describeUser({ name: "Dan", email: "dan@example.com", role: "admin" }),
    "=> expected:",
    "Dan <dan@example.com> (admin)",
  );
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 2: mergeConfig ---");
try {
  const merged = mergeConfig(baseConfig, { retries: 2 });
  console.log(merged, "=> expected:", {
    baseUrl: "http://localhost:3000",
    browser: "chromium",
    headless: true,
    retries: 2,
    timeoutMs: 30000,
  });
  // Must return a new object – not defaults itself
  console.log(merged === baseConfig, "=> expected:", false);
  // defaults must not change
  console.log(baseConfig.retries, "=> expected:", 0);

  console.log(mergeConfig(baseConfig, { headless: false, baseUrl: "https://staging.example.com" }), "=> expected:", {
    baseUrl: "https://staging.example.com",
    browser: "chromium",
    headless: false,
    retries: 0,
    timeoutMs: 30000,
  });
  console.log(mergeConfig(baseConfig, {}), "=> expected:", {
    baseUrl: "http://localhost:3000",
    browser: "chromium",
    headless: true,
    retries: 0,
    timeoutMs: 30000,
  });
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 3: findEmptyFields ---");
try {
  console.log(findEmptyFields({ username: "noa", password: "", email: "   " }), "=> expected:", ["password", "email"]);
  console.log(findEmptyFields({ username: "noa", password: "123456" }), "=> expected:", []);
  console.log(findEmptyFields({}), "=> expected:", []);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 4: diffFields ---");
try {
  console.log(diffFields({ status: 200, name: "Noa" }, { status: 404, name: "Noa", debug: true }), "=> expected:", [
    "status",
    "debug",
  ]);
  console.log(diffFields({ id: 1, active: true }, { id: 1, active: true }), "=> expected:", []);
  console.log(diffFields({ id: 1, role: "admin" }, { id: 1 }), "=> expected:", ["role"]);
  console.log(diffFields({ id: 1 }, { id: "1" }), "=> expected:", ["id"]); // "1" !== 1
  console.log(diffFields({}, { a: 1, b: 2 }), "=> expected:", ["a", "b"]);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 5: updateBugJson ---");
try {
  const original = '{"id":7,"title":"Crash","severity":"low","status":"open"}';
  console.log(
    updateBugJson(original, { status: "closed" }),
    "=> expected:",
    '{"id":7,"title":"Crash","severity":"low","status":"closed"}',
  );
  console.log(JSON.parse(updateBugJson(original, { severity: "high", title: "Crash on save" })), "=> expected:", {
    id: 7,
    title: "Crash on save",
    severity: "high",
    status: "open",
  });
  console.log(updateBugJson(original, {}), "=> expected:", '{"id":7,"title":"Crash","severity":"low","status":"open"}');
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 6 (Bonus): createSuite ---");
try {
  const smoke = createSuite("Smoke");
  console.log(smoke.name, "=> expected:", "Smoke");
  console.log(smoke.tests, "=> expected:", []);
  console.log(smoke.describe(), "=> expected:", "Smoke: 0 tests");
  smoke.add("login");
  smoke.add("logout");
  console.log(smoke.tests, "=> expected:", ["login", "logout"]);
  console.log(smoke.describe(), "=> expected:", "Smoke: 2 tests");

  // Each suite has its own tests array
  const regression = createSuite("Regression");
  console.log(regression.tests, "=> expected:", []);
  console.log(regression.describe(), "=> expected:", "Regression: 0 tests");
} catch (e) {
  console.log("  ✋", (e as Error).message);
}
