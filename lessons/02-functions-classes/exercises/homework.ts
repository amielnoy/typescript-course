// Lesson 2 – Homework: Test Case Manager
// ------------------------------------------------------------
// Instructions:
//   1. Complete the body of each function / method in place of the line  throw new Error("TODO")
//   2. Use only what you learned up to this lesson: everything from lesson 1, plus functions (default, optional
//      and rest parameters, function types), arrow functions and array methods (map / filter / find / some /
//      every / reduce / sort), and classes with constructors.
//      Tasks 6–7 (Challenge) also use objects (destructuring, spread, Object.keys / values / entries, JSON) –
//      we learn them at the start of lesson 3, so solve Tasks 1–5 now and come back to 6–7 after lesson 3.
//   3. The tasks build on each other – solve them in order. A later task may (and should!) call what you
//      wrote before it, e.g.  const errors = validateCase(tc, ...checks);
//   4. Never change the arrays and objects you receive – work on copies (spread, map, filter).
//   5. Check yourself: npm run exercise -- 02 hw (self-check at the end of the file)
// ------------------------------------------------------------
//
// Scenario:
//   The QA team keeps its regression test cases in a shared spreadsheet, and every release someone copies
//   them by hand, fixes typos in the tags, decides what to run first and counts results per area.
//   Your job: write a small test-case manager that does it in code – create clean test cases, validate them
//   with reusable rules, keep them in a TestSuite, plan the next run, summarize results per tag, exchange
//   suites with another team as JSON, and print a short status report.
// ------------------------------------------------------------

// ---------- Types and sample data (given – no need to change) ----------

export type Priority = "P1" | "P2" | "P3"; // P1 = most important
export type Status = "not-run" | "passed" | "failed" | "blocked";

/** One test case, with the result of its last run. */
export type TestCaseData = {
  id: string; // "TC-" followed by digits, e.g. "TC-101"
  title: string;
  priority: Priority;
  tags: string[]; // lowercase area names, e.g. ["auth", "smoke"]
  status: Status;
  durationMs: number; // 0 when it did not run
};

/** A validation rule: returns an error message, or undefined when the test case is OK. */
export type CaseCheck = (tc: TestCaseData) => string | undefined;

/** Which test cases to run next (Task 4). Every field is optional – a missing field means "don't filter by it". */
export type CaseFilter = {
  priorities?: Priority[]; // keep only these priorities
  statuses?: Status[]; // keep only these statuses
  tags?: string[]; // keep only cases that have ALL of these tags
};

/** Results of one tag (Task 5). */
export type TagSummary = {
  total: number; // cases with this tag
  passed: number;
  failed: number;
  passRate: number; // passed out of (passed + failed), in percent, rounded to a whole number. 0 if none of them ran.
};

/** A test case as it is exported to JSON (Task 6) – only the definition, without run results. */
export type CaseDefinition = {
  id: string;
  title: string;
  priority?: Priority; // may be missing in a file from another team
  tags?: string[]; // may be missing in a file from another team
};

/** The JSON format of an exported suite (Task 6). */
export type SuiteExport = {
  suite: string;
  cases: CaseDefinition[];
};

/** The test cases of the current regression cycle. */
export const regressionCases: TestCaseData[] = [
  { id: "TC-101", title: "Login with valid credentials", priority: "P1", tags: ["auth", "smoke"], status: "passed", durationMs: 1200 },
  { id: "TC-102", title: "Login with wrong password", priority: "P2", tags: ["auth"], status: "failed", durationMs: 900 },
  { id: "TC-201", title: "Add item to cart", priority: "P1", tags: ["cart", "smoke"], status: "failed", durationMs: 2300 },
  { id: "TC-202", title: "Remove item from cart", priority: "P3", tags: ["cart"], status: "not-run", durationMs: 0 },
  { id: "TC-203", title: "Apply coupon code", priority: "P2", tags: ["cart", "payments"], status: "blocked", durationMs: 0 },
  { id: "TC-301", title: "Checkout with credit card", priority: "P1", tags: ["payments", "smoke"], status: "passed", durationMs: 4100 },
  { id: "TC-302", title: "Checkout with PayPal", priority: "P2", tags: ["payments"], status: "passed", durationMs: 3600 },
  { id: "TC-401", title: "Search by product name", priority: "P3", tags: ["search"], status: "passed", durationMs: 700 },
];

// ---------- Tasks ----------

/**
 * Task 1 – Create a clean test case (default + rest parameters)
 * People type test cases by hand, so clean up what they typed:
 *   id       – without spaces around it, in UPPERCASE           (" tc-501 " => "TC-501")
 *   title    – without spaces around it
 *   priority – "P2" when it is not passed
 *   tags     – every tag without spaces around it and in lowercase; drop empty tags;
 *              drop duplicates (keep the first one), otherwise keep the order they were passed in
 *   status   – always "not-run", durationMs – always 0 (a new test case did not run yet)
 * Don't change the tags you received (if they come from an array spread into the call, that array stays as it was).
 * Examples:
 *   (" tc-501 ", "  Reset password  ", "P1", "Auth", " smoke ", "auth", "")
 *       => { id: "TC-501", title: "Reset password", priority: "P1", tags: ["auth", "smoke"], status: "not-run", durationMs: 0 }
 *   ("TC-502", "Logout") => { id: "TC-502", title: "Logout", priority: "P2", tags: [], status: "not-run", durationMs: 0 }
 * Hint: map, then filter – filter's callback also gets the index and the whole array:
 *       (tag, index, all) => ...   and  all.indexOf(tag)  is the index of the FIRST occurrence.
 */
export function createTestCase(id: string, title: string, priority: Priority = "P2", ...tags: string[]): TestCaseData {
  throw new Error("TODO");
}

/**
 * Task 2 – Validation rules (function types)
 * A CaseCheck is a function that returns an error message, or undefined when everything is fine.
 *   a) hasValidId – the id must be "TC-" followed by at least one digit, and only digits.
 *      Otherwise: 'invalid id "<id>"'.      "TC-7", "TC-101" are valid;  "TC-", "TC-12a", "tc-12", "BUG-12" are not.
 *   b) requireTag(tag) – RETURNS a new CaseCheck: missing tag => 'missing tag "<tag>"'.
 *   c) validateCase(tc, ...checks) – runs every check on tc and returns all the error messages, in the order
 *      of the checks. No checks, or no errors => [].
 * Examples:
 *   hasValidId({ ...regressionCases[0], id: "TC-12a" })   => 'invalid id "TC-12a"'
 *   requireTag("smoke")(regressionCases[1])                => 'missing tag "smoke"'   (TC-102 has only "auth")
 *   validateCase(regressionCases[1], hasValidId, requireTag("smoke"), requireTag("auth")) => ['missing tag "smoke"']
 * Hints: "12a".split("") gives ["1", "2", "a"] – which array method checks that ALL of them are digits?
 *        Characters can be compared like strings:  ch >= "0" && ch <= "9".
 */
export const hasValidId: CaseCheck = (tc) => {
  throw new Error("TODO");
};

export function requireTag(tag: string): CaseCheck {
  throw new Error("TODO");
}

export function validateCase(tc: TestCaseData, ...checks: CaseCheck[]): string[] {
  throw new Error("TODO");
}

/**
 * Task 3 – The TestSuite class
 * - constructor(name, cases = []): name is a parameter property (public name). Store a COPY of every case
 *       in this.cases – including a copy of its tags array – so that changing the cases (or the array) you
 *       received later does not change the suite, and changing the suite does not change them.
 * - add(tc, ...checks): validates tc with validateCase (Task 2). If the suite already has a case with the
 *       same id, add the error 'duplicate id "<id>"' after the check errors.
 *       No errors => add a copy of tc (with a copy of its tags) to the end of this.cases and return [].
 *       Errors    => don't add anything, return the errors.
 * - record(id, status, durationMs = 0): saves the result of a run on the case with this id and returns true.
 *       No case with this id => returns false.
 *
 *   const suite = new TestSuite("regression", regressionCases);
 *   suite.record("TC-202", "passed", 450)    => true    (regressionCases[3] is still "not-run"!)
 *   suite.record("TC-999", "failed")         => false
 *   suite.add(createTestCase("TC-501", "Reset password", "P1", "auth"), hasValidId)   => []
 *   suite.add(regressionCases[1])            => ['duplicate id "TC-102"']
 * Hint: { ...tc, tags: [...tc.tags] }  copies a case together with its tags. Why isn't { ...tc } enough?
 */
export class TestSuite {
  cases: TestCaseData[];

  constructor(
    public name: string,
    cases: TestCaseData[] = [],
  ) {
    throw new Error("TODO");
  }

  add(tc: TestCaseData, ...checks: CaseCheck[]): string[] {
    throw new Error("TODO");
  }

  record(id: string, status: Status, durationMs: number = 0): boolean {
    throw new Error("TODO");
  }
}

/**
 * Task 4 – Plan the next run (filter + sort)
 * Return a NEW array with the cases that match the filter, in the order they should run:
 *   - Filtering: see CaseFilter. A missing field doesn't filter. All the given fields must match.
 *     tags: the case must have ALL the listed tags (an empty tags list matches every case).
 *   - Order: P1 first, then P2, then P3. With the same priority: "failed" first, then "blocked", then
 *     "not-run", then "passed". If both are the same – keep their original order.
 *   - Don't change the order of the array you received!
 * Examples:
 *   planRun(regressionCases).map((tc) => tc.id)
 *       => ["TC-201", "TC-101", "TC-301", "TC-102", "TC-203", "TC-302", "TC-202", "TC-401"]
 *   planRun(regressionCases, { statuses: ["failed", "blocked"] }).map((tc) => tc.id)  => ["TC-201", "TC-102", "TC-203"]
 * Hints: destructure the filter with a default:  const { priorities, statuses, tags = [] } = filter;
 *        a lookup object turns a status into a number you can subtract:  { failed: 0, blocked: 1, ... }
 *        Array.sort keeps the original order of equal items for you.
 */
export function planRun(cases: TestCaseData[], filter: CaseFilter = {}): TestCaseData[] {
  throw new Error("TODO");
}

/**
 * Task 5 – Results per tag (grouping)
 * Return an object: key = tag, value = the TagSummary of all the cases that have this tag.
 * A case with several tags counts in each of them. "blocked" and "not-run" count only in total.
 * A tag appears only if at least one case has it, so an empty array gives {}.
 * Example: summarizeByTag(regressionCases) => {
 *   auth:     { total: 2, passed: 1, failed: 1, passRate: 50 },
 *   smoke:    { total: 3, passed: 2, failed: 1, passRate: 67 },
 *   cart:     { total: 3, passed: 0, failed: 1, passRate: 0 },
 *   payments: { total: 3, passed: 2, failed: 0, passRate: 100 },
 *   search:   { total: 1, passed: 1, failed: 0, passRate: 100 },
 * }
 * Hint: count first, and compute passRate at the end (a for...in loop over the result gives you every tag).
 */
export function summarizeByTag(cases: TestCaseData[]): Record<string, TagSummary> {
  throw new Error("TODO");
}

/**
 * Task 6 (Challenge – after lesson 3: objects and JSON) – Exchange suites as JSON
 * a) exportSuite(suite, tag?) – return a JSON string (JSON.stringify, no extra spaces) of a SuiteExport:
 *        { suite: <name>, cases: [{ id, title, priority, tags }, ...] }   – exactly these keys, in this order
 *    Run results (status, durationMs) are NOT exported. If tag is passed – export only the cases that have it.
 *    Example: exportSuite(new TestSuite("search", [regressionCases[7]])) =>
 *      '{"suite":"search","cases":[{"id":"TC-401","title":"Search by product name","priority":"P3","tags":["search"]}]}'
 * b) importSuite(json, ...checks) – the opposite. Parse the JSON and return { suite, rejected }:
 *    - suite: a new TestSuite with the suite name from the JSON.
 *    - Every definition becomes a clean test case with createTestCase (Task 1) – a missing priority becomes "P2",
 *      missing tags become [] – and is added with suite.add(tc, ...checks) (Task 3).
 *    - rejected: one line per case that add() refused, in order: "<id>: <the errors, separated by ", ">"
 *      (use the clean id, e.g. "TC-601", not " tc-601 ").
 * Hints: destructuring works in a parameter list too:  .map(({ id, title }) => ({ id, title }))
 *        Passing undefined to a parameter with a default value gives you the default.
 */
export function exportSuite(suite: TestSuite, tag?: string): string {
  throw new Error("TODO");
}

export function importSuite(json: string, ...checks: CaseCheck[]): { suite: TestSuite; rejected: string[] } {
  throw new Error("TODO");
}

/**
 * Task 7 (Challenge – after lesson 3: Object.entries) – The status report
 * Return the report lines of the suite, in this order:
 *   'Suite "<name>": <number of cases> cases'
 *   "passed <n> | failed <n> | blocked <n> | not-run <n>"     – always all four, in this order (0 too)
 *   one line per tag from Task 5: "  <tag>: <passRate>% (<passed>/<passed + failed>)"   – two spaces at the start;
 *       worst passRate first; the same passRate => by tag name (A to Z)
 *   "Next run: <ids>"  – the ids of the cases that are "failed", "blocked" or "not-run", in the order of
 *       Task 4, separated by ", ". If there are none: "Next run: nothing to run"
 * Example: suiteReport(new TestSuite("regression", regressionCases)) =>
 *   [
 *     'Suite "regression": 8 cases',
 *     "passed 4 | failed 2 | blocked 1 | not-run 1",
 *     "  cart: 0% (0/1)",
 *     "  auth: 50% (1/2)",
 *     "  smoke: 67% (2/3)",
 *     "  payments: 100% (2/2)",
 *     "  search: 100% (1/1)",
 *     "Next run: TC-201, TC-102, TC-203, TC-202",
 *   ]
 * Hints: start the counts from { passed: 0, failed: 0, blocked: 0, "not-run": 0 } – Object.entries keeps that order.
 *        Object.entries(summary) gives [tag, summary] pairs that you can sort and map.
 */
export function suiteReport(suite: TestSuite): string[] {
  throw new Error("TODO");
}

// ============================================================
// Self-check – run:  npm run exercise -- 02 hw
// On every line, the value left of "=> expected:" must equal the value on its right.
// (No need to change the code below this line)
// ============================================================

const ids = (cases: TestCaseData[]): string[] => cases.map((tc) => tc.id);
const regressionIds = ["TC-101", "TC-102", "TC-201", "TC-202", "TC-203", "TC-301", "TC-302", "TC-401"];

console.log("\n--- Task 1: createTestCase ---");
try {
  console.log(createTestCase(" tc-501 ", "  Reset password  ", "P1", "Auth", " smoke ", "auth", ""), "=> expected:", {
    id: "TC-501",
    title: "Reset password",
    priority: "P1",
    tags: ["auth", "smoke"],
    status: "not-run",
    durationMs: 0,
  });
  console.log(createTestCase("TC-502", "Logout"), "=> expected:", {
    id: "TC-502",
    title: "Logout",
    priority: "P2",
    tags: [],
    status: "not-run",
    durationMs: 0,
  }); // the default priority
  console.log(createTestCase("TC-503", "Guest checkout", undefined, "Payments", "  ").priority, "=> expected:", "P2"); // undefined => the default
  console.log(createTestCase("TC-503", "Guest checkout", undefined, "Payments", "  ").tags, "=> expected:", ["payments"]); // "  " is empty
  console.log(createTestCase("TC-504", "Sort by price", "P3", "a", "A", " a ", "b").tags, "=> expected:", ["a", "b"]); // the same tag 3 times
  const typedTags = [" Smoke", "UI "];
  console.log(createTestCase("TC-505", "Header links", "P1", ...typedTags).tags, "=> expected:", ["smoke", "ui"]);
  console.log(typedTags, "=> expected:", [" Smoke", "UI "]); // the input array did not change
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Task 2: hasValidId / requireTag / validateCase ---");
try {
  console.log(hasValidId(regressionCases[0]), "=> expected:", undefined);
  console.log(hasValidId({ ...regressionCases[0], id: "TC-7" }), "=> expected:", undefined);
  console.log(hasValidId({ ...regressionCases[0], id: "TC-" }), "=> expected:", 'invalid id "TC-"'); // no digits
  console.log(hasValidId({ ...regressionCases[0], id: "TC-12a" }), "=> expected:", 'invalid id "TC-12a"');
  console.log(hasValidId({ ...regressionCases[0], id: "TC-1 2" }), "=> expected:", 'invalid id "TC-1 2"');
  console.log(hasValidId({ ...regressionCases[0], id: "tc-12" }), "=> expected:", 'invalid id "tc-12"');
  console.log(hasValidId({ ...regressionCases[0], id: "BUG-12" }), "=> expected:", 'invalid id "BUG-12"');
  const needsSmoke = requireTag("smoke");
  console.log(needsSmoke(regressionCases[0]), "=> expected:", undefined); // TC-101 has "smoke"
  console.log(needsSmoke(regressionCases[1]), "=> expected:", 'missing tag "smoke"');
  console.log(validateCase(regressionCases[0]), "=> expected:", []); // no checks
  console.log(validateCase(regressionCases[0], hasValidId, needsSmoke), "=> expected:", []);
  console.log(validateCase({ ...regressionCases[1], id: "TC-1O2" }, hasValidId, needsSmoke, requireTag("auth")), "=> expected:", [
    'invalid id "TC-1O2"', // the letter O, not a zero
    'missing tag "smoke"',
  ]);
  const notTooSlow: CaseCheck = (tc) => (tc.durationMs > 4000 ? `too slow: ${tc.durationMs}ms` : undefined);
  console.log(validateCase(regressionCases[5], notTooSlow, requireTag("payments")), "=> expected:", ["too slow: 4100ms"]); // any function of this type is a check
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Task 3: TestSuite ---");
try {
  const suite = new TestSuite("regression", regressionCases);
  console.log(suite.name, "=> expected:", "regression");
  console.log(ids(suite.cases), "=> expected:", regressionIds);
  console.log(suite.cases[0], "=> expected:", regressionCases[0]); // the same values...
  console.log(suite.cases[0] === regressionCases[0], "=> expected:", false); // ...but a copy
  console.log(suite.record("TC-202", "passed", 450), "=> expected:", true);
  console.log(suite.cases[3].status, suite.cases[3].durationMs, "=> expected:", "passed", 450);
  console.log(regressionCases[3].status, "=> expected:", "not-run"); // the sample data did not change
  console.log(suite.record("TC-203", "blocked"), "=> expected:", true);
  console.log(suite.cases[4].durationMs, "=> expected:", 0); // the default duration
  console.log(suite.record("TC-999", "failed"), "=> expected:", false);
  suite.cases[0].tags.push("flaky");
  console.log(regressionCases[0].tags, "=> expected:", ["auth", "smoke"]); // the tags were copied too

  const resetPassword = createTestCase("TC-501", "Reset password", "P1", "auth");
  console.log(suite.add(resetPassword, hasValidId, requireTag("auth")), "=> expected:", []);
  console.log(suite.cases.length, "=> expected:", 9);
  console.log(suite.add(resetPassword), "=> expected:", ['duplicate id "TC-501"']);
  console.log(suite.add(createTestCase("TC-5x", "Bad id", "P3"), hasValidId, requireTag("auth")), "=> expected:", [
    'invalid id "TC-5X"',
    'missing tag "auth"',
  ]);
  console.log(suite.add({ ...regressionCases[1] }, requireTag("smoke")), "=> expected:", [
    'missing tag "smoke"',
    'duplicate id "TC-102"',
  ]); // check errors first, then the duplicate
  console.log(suite.cases.length, "=> expected:", 9); // nothing with errors was added
  resetPassword.tags.push("changed-later");
  console.log(suite.cases[8].tags, "=> expected:", ["auth"]); // add() stored a copy

  const source = [regressionCases[0]];
  const small = new TestSuite("small", source);
  source.push(regressionCases[1]);
  console.log(small.cases.length, "=> expected:", 1); // changing the array later doesn't change the suite
  const a = new TestSuite("a");
  const b = new TestSuite("b");
  a.add(createTestCase("TC-1", "Only in suite a"));
  console.log(a.cases.length, b.cases.length, "=> expected:", 1, 0); // every suite has its own array
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Task 4: planRun ---");
try {
  console.log(ids(planRun(regressionCases)), "=> expected:", ["TC-201", "TC-101", "TC-301", "TC-102", "TC-203", "TC-302", "TC-202", "TC-401"]);
  console.log(ids(planRun(regressionCases, { tags: ["smoke"] })), "=> expected:", ["TC-201", "TC-101", "TC-301"]);
  console.log(ids(planRun(regressionCases, { statuses: ["failed", "blocked"] })), "=> expected:", ["TC-201", "TC-102", "TC-203"]);
  console.log(ids(planRun(regressionCases, { priorities: ["P1", "P2"], tags: ["payments"] })), "=> expected:", [
    "TC-301",
    "TC-203",
    "TC-302",
  ]);
  console.log(ids(planRun(regressionCases, { tags: ["cart", "smoke"] })), "=> expected:", ["TC-201"]); // must have ALL the tags
  console.log(ids(planRun(regressionCases, { priorities: ["P3"], tags: [] })), "=> expected:", ["TC-202", "TC-401"]); // empty tags = no tag filter
  console.log(ids(planRun(regressionCases, { tags: ["mobile"] })), "=> expected:", []);
  console.log(planRun([]), "=> expected:", []);
  console.log(planRun(regressionCases) === regressionCases, "=> expected:", false); // a new array
  console.log(ids(regressionCases), "=> expected:", regressionIds); // the original order did not change
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Task 5: summarizeByTag ---");
try {
  console.log(summarizeByTag(regressionCases), "=> expected:", {
    auth: { total: 2, passed: 1, failed: 1, passRate: 50 },
    smoke: { total: 3, passed: 2, failed: 1, passRate: 67 },
    cart: { total: 3, passed: 0, failed: 1, passRate: 0 },
    payments: { total: 3, passed: 2, failed: 0, passRate: 100 },
    search: { total: 1, passed: 1, failed: 0, passRate: 100 },
  });
  console.log(summarizeByTag([]), "=> expected:", {});
  console.log(summarizeByTag([regressionCases[3]]), "=> expected:", { cart: { total: 1, passed: 0, failed: 0, passRate: 0 } }); // nothing ran
  console.log(summarizeByTag([createTestCase("TC-601", "No tags at all")]), "=> expected:", {}); // a case without tags
  console.log(Object.keys(summarizeByTag(regressionCases)), "=> expected:", ["auth", "smoke", "cart", "payments", "search"]);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Task 6 (Challenge): exportSuite / importSuite ---");
try {
  console.log(
    exportSuite(new TestSuite("search", [regressionCases[7]])),
    "=> expected:",
    '{"suite":"search","cases":[{"id":"TC-401","title":"Search by product name","priority":"P3","tags":["search"]}]}',
  );
  const regression = new TestSuite("regression", regressionCases);
  console.log((JSON.parse(exportSuite(regression)) as SuiteExport).cases.length, "=> expected:", 8);
  console.log(exportSuite(regression).includes("status"), "=> expected:", false); // no run results
  const smokeOnly = JSON.parse(exportSuite(regression, "smoke")) as SuiteExport;
  console.log(smokeOnly.cases.map((c) => c.id), "=> expected:", ["TC-101", "TC-201", "TC-301"]);
  console.log(exportSuite(regression, "mobile"), "=> expected:", '{"suite":"regression","cases":[]}');

  // a round trip: export => import
  const copy = importSuite(exportSuite(regression)).suite;
  console.log(copy.name, "=> expected:", "regression");
  console.log(ids(copy.cases), "=> expected:", regressionIds);
  console.log(copy.cases[0], "=> expected:", {
    id: "TC-101",
    title: "Login with valid credentials",
    priority: "P1",
    tags: ["auth", "smoke"],
    status: "not-run",
    durationMs: 0,
  });
  console.log(copy.cases.every((tc) => tc.status === "not-run" && tc.durationMs === 0), "=> expected:", true);

  // a file from another team – messy
  const fromMobileTeam = JSON.stringify({
    suite: "mobile",
    cases: [
      { id: " tc-601 ", title: " Open app offline ", tags: ["Mobile", "smoke"] }, // no priority
      { id: "TC-602", title: "Rotate screen", priority: "P3" }, // no tags
      { id: "TC-601", title: "Open app offline (again)", tags: ["mobile"] },
      { id: "CASE-7", title: "Push notification", priority: "P1", tags: ["mobile"] },
    ],
  });
  const strict = importSuite(fromMobileTeam, hasValidId, requireTag("mobile"));
  console.log(strict.suite.name, "=> expected:", "mobile");
  console.log(strict.suite.cases, "=> expected:", [
    { id: "TC-601", title: "Open app offline", priority: "P2", tags: ["mobile", "smoke"], status: "not-run", durationMs: 0 },
  ]);
  console.log(strict.rejected, "=> expected:", [
    'TC-602: missing tag "mobile"',
    'TC-601: duplicate id "TC-601"',
    'CASE-7: invalid id "CASE-7"',
  ]);
  const relaxed = importSuite(fromMobileTeam); // no checks – only duplicates are refused
  console.log(ids(relaxed.suite.cases), "=> expected:", ["TC-601", "TC-602", "CASE-7"]);
  console.log(relaxed.suite.cases[1].tags, "=> expected:", []);
  console.log(relaxed.rejected, "=> expected:", ['TC-601: duplicate id "TC-601"']);
  const empty = importSuite('{"suite":"empty","cases":[]}');
  console.log(empty.suite.cases, empty.rejected, "=> expected:", [], []);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Task 7 (Challenge): suiteReport ---");
try {
  console.log(suiteReport(new TestSuite("regression", regressionCases)), "=> expected:", [
    'Suite "regression": 8 cases',
    "passed 4 | failed 2 | blocked 1 | not-run 1",
    "  cart: 0% (0/1)",
    "  auth: 50% (1/2)",
    "  smoke: 67% (2/3)",
    "  payments: 100% (2/2)",
    "  search: 100% (1/1)",
    "Next run: TC-201, TC-102, TC-203, TC-202",
  ]);

  // the next night – most of the problems were fixed
  const nightly = new TestSuite("nightly", regressionCases);
  nightly.record("TC-201", "passed", 2100);
  nightly.record("TC-102", "passed", 800);
  nightly.record("TC-203", "passed", 1500);
  nightly.record("TC-202", "failed", 600);
  console.log(suiteReport(nightly), "=> expected:", [
    'Suite "nightly": 8 cases',
    "passed 7 | failed 1 | blocked 0 | not-run 0",
    "  cart: 67% (2/3)",
    "  auth: 100% (2/2)", // the same passRate => A to Z
    "  payments: 100% (3/3)",
    "  search: 100% (1/1)",
    "  smoke: 100% (3/3)",
    "Next run: TC-202",
  ]);
  console.log(regressionCases[2].status, "=> expected:", "failed"); // the sample data did not change

  console.log(suiteReport(new TestSuite("empty")), "=> expected:", [
    'Suite "empty": 0 cases',
    "passed 0 | failed 0 | blocked 0 | not-run 0",
    "Next run: nothing to run",
  ]);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}
