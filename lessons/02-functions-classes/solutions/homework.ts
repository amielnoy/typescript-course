// Lesson 2 – Homework: Test Case Manager – Solutions
// Run (including the self-check):  npm run solution -- 02 hw
// Scenario: a small test-case manager – create clean test cases, validate them with reusable rules, keep them
// in a TestSuite, plan the next run, summarize results per tag, exchange suites as JSON and print a status report.

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

// ---------- Task 1 – Create a clean test case ----------

export function createTestCase(id: string, title: string, priority: Priority = "P2", ...tags: string[]): TestCaseData {
  // map and filter return NEW arrays – the tags we received are never changed
  const cleanTags = tags
    .map((tag) => tag.trim().toLowerCase())
    // keep a tag only if it is not empty AND this is its first occurrence
    .filter((tag, index, all) => tag !== "" && all.indexOf(tag) === index);

  return {
    id: id.trim().toUpperCase(),
    title: title.trim(),
    priority,
    tags: cleanTags,
    status: "not-run",
    durationMs: 0,
  };
}

// ---------- Task 2 – Validation rules ----------

export const hasValidId: CaseCheck = (tc) => {
  const digits = tc.id.slice(3); // everything after "TC-"
  const isValid =
    tc.id.startsWith("TC-") && digits.length > 0 && digits.split("").every((ch) => ch >= "0" && ch <= "9");
  return isValid ? undefined : `invalid id "${tc.id}"`;
};

// A function that RETURNS a function: every call creates a new check that "remembers" its tag
export function requireTag(tag: string): CaseCheck {
  return (tc) => (tc.tags.includes(tag) ? undefined : `missing tag "${tag}"`);
}

export function validateCase(tc: TestCaseData, ...checks: CaseCheck[]): string[] {
  const errors: string[] = [];
  for (const check of checks) {
    const message = check(tc);
    if (message !== undefined) {
      errors.push(message);
    }
  }
  return errors;
}

// ---------- Task 3 – The TestSuite class ----------

export class TestSuite {
  cases: TestCaseData[];

  constructor(
    public name: string,
    cases: TestCaseData[] = [],
  ) {
    // { ...tc } alone is a SHALLOW copy – the new object would still share the same tags array,
    // so we copy the tags array too
    this.cases = cases.map((tc) => ({ ...tc, tags: [...tc.tags] }));
  }

  add(tc: TestCaseData, ...checks: CaseCheck[]): string[] {
    const errors = validateCase(tc, ...checks);
    if (this.cases.some((existing) => existing.id === tc.id)) {
      errors.push(`duplicate id "${tc.id}"`);
    }
    if (errors.length === 0) {
      this.cases.push({ ...tc, tags: [...tc.tags] });
    }
    return errors;
  }

  record(id: string, status: Status, durationMs: number = 0): boolean {
    const tc = this.cases.find((c) => c.id === id);
    if (tc === undefined) return false;
    // tc is the suite's own copy, so changing it doesn't change the data we received in the constructor
    tc.status = status;
    tc.durationMs = durationMs;
    return true;
  }
}

// ---------- Task 4 – Plan the next run ----------

const priorityOrder: Record<Priority, number> = { P1: 0, P2: 1, P3: 2 };
const statusOrder: Record<Status, number> = { failed: 0, blocked: 1, "not-run": 2, passed: 3 };

export function planRun(cases: TestCaseData[], filter: CaseFilter = {}): TestCaseData[] {
  const { priorities, statuses, tags = [] } = filter;

  return (
    cases
      .filter((tc) => priorities === undefined || priorities.includes(tc.priority))
      .filter((tc) => statuses === undefined || statuses.includes(tc.status))
      .filter((tc) => tags.every((tag) => tc.tags.includes(tag)))
      // filter already returned a new array, so sorting it doesn't touch the original
      // (a negative number => a comes first; 0 => keep the original order)
      .sort(
        (a, b) =>
          priorityOrder[a.priority] - priorityOrder[b.priority] || statusOrder[a.status] - statusOrder[b.status],
      )
  );
}

// ---------- Task 5 – Results per tag ----------

export function summarizeByTag(cases: TestCaseData[]): Record<string, TagSummary> {
  const summary: Record<string, TagSummary> = {};

  cases.forEach((tc) => {
    tc.tags.forEach((tag) => {
      if (summary[tag] === undefined) {
        summary[tag] = { total: 0, passed: 0, failed: 0, passRate: 0 }; // the first case with this tag
      }
      const tagSummary = summary[tag];
      tagSummary.total++;
      if (tc.status === "passed") tagSummary.passed++;
      if (tc.status === "failed") tagSummary.failed++;
    });
  });

  for (const tagSummary of Object.values(summary)) {
    const executed = tagSummary.passed + tagSummary.failed;
    tagSummary.passRate = executed === 0 ? 0 : Math.round((tagSummary.passed / executed) * 100);
  }
  return summary;
}

// ---------- Task 6 (Challenge) – Exchange suites as JSON ----------

export function exportSuite(suite: TestSuite, tag?: string): string {
  const cases: CaseDefinition[] = suite.cases
    .filter((tc) => tag === undefined || tc.tags.includes(tag))
    // destructuring in the parameter list: take only the definition fields, leave status and durationMs out
    .map(({ id, title, priority, tags }) => ({ id, title, priority, tags }));

  const data: SuiteExport = { suite: suite.name, cases };
  return JSON.stringify(data);
}

export function importSuite(json: string, ...checks: CaseCheck[]): { suite: TestSuite; rejected: string[] } {
  const { suite: name, cases } = JSON.parse(json) as SuiteExport;
  const suite = new TestSuite(name);
  const rejected: string[] = [];

  for (const { id, title, priority, tags = [] } of cases) {
    // priority may be undefined here – createTestCase then uses its default value "P2"
    const tc = createTestCase(id, title, priority, ...tags);
    const errors = suite.add(tc, ...checks);
    if (errors.length > 0) {
      rejected.push(`${tc.id}: ${errors.join(", ")}`);
    }
  }
  return { suite, rejected };
}

// ---------- Task 7 (Challenge) – The status report ----------

export function suiteReport(suite: TestSuite): string[] {
  // all four statuses start at 0, so they always appear – in this order
  const counts: Record<Status, number> = { passed: 0, failed: 0, blocked: 0, "not-run": 0 };
  suite.cases.forEach((tc) => counts[tc.status]++);
  const statusLine = Object.entries(counts)
    .map(([status, count]) => `${status} ${count}`)
    .join(" | ");

  const tagLines = Object.entries(summarizeByTag(suite.cases))
    .sort(([tagA, a], [tagB, b]) => a.passRate - b.passRate || (tagA < tagB ? -1 : 1))
    .map(([tag, s]) => `  ${tag}: ${s.passRate}% (${s.passed}/${s.passed + s.failed})`);

  const nextIds = planRun(suite.cases, { statuses: ["failed", "blocked", "not-run"] }).map((tc) => tc.id);

  return [
    `Suite "${suite.name}": ${suite.cases.length} cases`,
    statusLine,
    ...tagLines,
    `Next run: ${nextIds.length > 0 ? nextIds.join(", ") : "nothing to run"}`,
  ];
}

// ============================================================
// Self-check – run:  npm run solution -- 02 hw
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
