// Lesson 3 – Topic 01: Objects – Exercises
// ------------------------------------------------------------
// Instructions:
//   1. Complete the body of each function in place of the line  throw new Error("TODO")
//   2. Practice what we learned in this topic: destructuring, spread, Object.keys/values/entries,
//      JSON.stringify / JSON.parse and an object with methods (this).
//   3. Check yourself: npm run exercise -- 03 01 (self-check at the end of the file)
// ------------------------------------------------------------

// ---------- Warm-ups (in class, ~5 minutes each) ----------
// Two short exercises we solve during the lesson, right after the examples – before Exercise 1.

/** A test case "card" – used by the warm-ups */
export type TestCaseCard = { id: string; title: string; status: string; tags: string[] };

/**
 * Warm-up A – creating an object
 * Return a new card: the given id and title, status "new" and an empty tags array.
 *   createTestCase("TC-1", "Login") => { id: "TC-1", title: "Login", status: "new", tags: [] }
 * Hint: when the variable and the field have the same name, { id, title } is enough (shorthand).
 */
export function createTestCase(id: string, title: string): TestCaseCard {
  throw new Error("TODO");
}

/**
 * Warm-up B – a copy with one more tag
 * Return a NEW card with the tag added at the end of tags. The original card must not change!
 * If the card already has this tag – return a copy without adding it again.
 *   withTag({ id: "TC-1", title: "Login", status: "new", tags: ["smoke"] }, "e2e")
 *     => { id: "TC-1", title: "Login", status: "new", tags: ["smoke", "e2e"] }
 * Hint: copy the object AND the array – { ...card, tags: [...card.tags, tag] } (remember the quiz!)
 */
export function withTag(card: TestCaseCard, tag: string): TestCaseCard {
  throw new Error("TODO");
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

/** Only some of the fields of TestConfig – each of them is optional */
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

/** A "test suite" object – with fields and methods (see Exercise 6) */
export interface Suite {
  name: string;
  tests: string[];
  add(testName: string): void;
  describe(): string;
}

/**
 * Exercise 1 – destructuring with a default value
 * Destructure user into variables (name, email, role) – with role defaulting to "tester" –
 * and return: "<name> <<email>> (<role>)"
 *
 *   describeUser({ name: "Noa", email: "noa@example.com" })
 *     => "Noa <noa@example.com> (tester)"
 *   describeUser({ name: "Dan", email: "dan@example.com", role: "admin" })
 *     => "Dan <dan@example.com> (admin)"
 */
export function describeUser(user: User): string {
  throw new Error("TODO");
}

/**
 * Exercise 2 – spread: merging configuration
 * Return a new object in which every field from overrides wins over the matching field in defaults.
 * Do not change defaults itself!
 *
 *   mergeConfig({ ..., retries: 0, headless: true }, { retries: 2 })
 *     => { ..., retries: 2, headless: true }
 */
export function mergeConfig(defaults: TestConfig, overrides: ConfigOverrides): TestConfig {
  throw new Error("TODO");
}

/**
 * Exercise 3 – Object.entries: which form fields were left empty?
 * form is an object of field-name => the value that was entered.
 * Return the names of the fields whose value is empty or contains only spaces (in the order of the fields in the object).
 *
 *   findEmptyFields({ username: "noa", password: "", email: "   " })
 *     => ["password", "email"]
 *   findEmptyFields({})  => []
 */
export function findEmptyFields(form: Record<string, string>): string[] {
  throw new Error("TODO");
}

/**
 * Exercise 4 – Object.keys: comparing expected vs. actual result
 * Return the names of the fields where actual differs from expected:
 *   1. First – every field of expected (in its order) whose value in actual is different (or missing).
 *   2. Then – fields that exist only in actual (in their order in actual).
 * Comparing with === is enough (the values are string / number / boolean).
 *
 *   diffFields({ status: 200, name: "Noa" }, { status: 404, name: "Noa", debug: true })
 *     => ["status", "debug"]
 *
 * Hint: key in obj  checks whether a field exists in the object.
 */
export function diffFields(
  expected: Record<string, string | number | boolean>,
  actual: Record<string, string | number | boolean>,
): string[] {
  throw new Error("TODO");
}

/**
 * Exercise 5 – JSON + spread: updating a bug that came from an API
 * bugJson is a JSON string of a Bug (exactly like an API response body).
 * Parse it, apply the changes from changes to it, and return a new JSON string.
 * (The id field never changes.)
 *
 *   updateBugJson('{"id":7,"title":"Crash","severity":"low","status":"open"}', { status: "closed" })
 *     => '{"id":7,"title":"Crash","severity":"low","status":"closed"}'
 *
 * Hint: JSON.parse(...) as Bug
 */
export function updateBugJson(
  bugJson: string,
  changes: { title?: string; severity?: Bug["severity"]; status?: Bug["status"] },
): string {
  throw new Error("TODO");
}

/**
 * Exercise 6 (Bonus) – an object with methods and this
 * Return an object (object literal – no class!) of type Suite:
 *   - name – the name that was received
 *   - tests – an array that starts empty
 *   - add(testName) – adds testName to tests (via this)
 *   - describe() – returns "<name>: <n> tests"  (e.g. "Smoke: 2 tests")
 *
 *   const suite = createSuite("Smoke");
 *   suite.add("login"); suite.add("logout");
 *   suite.describe()  => "Smoke: 2 tests"
 *
 * Note: every call to createSuite must create a new object and a new tests array.
 */
export function createSuite(name: string): Suite {
  throw new Error("TODO");
}

// ============================================================
// Self-check – run:  npm run exercise -- 03 01
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
