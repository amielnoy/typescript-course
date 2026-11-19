// Lesson 1 – Homework 2: Bug Triage Board
// ------------------------------------------------------------
// Instructions:
//   1. Complete the body of each function in place of the line  throw new Error("TODO")
//   2. Function syntax itself is taught in the next lesson – here, just write the code inside.
//   3. Use only what you learned in this lesson: types and variables, operators, conditions and loops
//      (plus the string methods trim / toLowerCase from topic 04).
//   4. The tasks build on each other – solve them in order. A later task may (and should!) call
//      the functions you wrote before it, e.g.  const priority = priorityOf(bug);
//   5. Check yourself: npm run exercise -- 01 hw2 (self-check at the end of the file)
// ------------------------------------------------------------
//
// Scenario:
//   Release day is getting close and the bug tracker is a mess: every reporter types the severity in their
//   own words, some bugs were reported twice, and nobody knows which bug should be fixed first.
//   Your job: write a small triage tool that puts the board in order – it normalizes the severity,
//   gives every bug a priority, summarizes the board, finds SLA breaches and possible duplicates,
//   and tells the team which bug to pick next.
// ------------------------------------------------------------

// ---------- Types and sample data (given – no need to change) ----------
// `type` gives a name to an object shape so we don't have to repeat it. You'll learn it properly in lesson 2 –
// for now just read  BugReport  as "an object with these fields".

/** One bug from the bug tracker. */
export type BugReport = {
  id: string;
  title: string;
  severity: string; // free text typed by the reporter: "Critical", " high ", "blocker", "minor", ...
  status: string; // usually "open" | "in-progress" | "reopened" | "fixed" | "closed" – but other values happen
  ageDays: number; // days since the bug was opened
  inProduction: boolean; // was it found in production (and not in a test environment)?
  reportedBy: number; // how many customers reported it (0 = found by the QA team)
};

/** The severity after normalization. */
export enum Severity {
  Critical = "CRITICAL",
  High = "HIGH",
  Medium = "MEDIUM",
  Low = "LOW",
}

/** Summary numbers of the board. */
export type BoardStats = {
  total: number;
  active: number; // everything that still needs a developer
  waitingForQa: number; // status "fixed" – the developer is done, QA has to verify
  closed: number;
  reopenRate: number; // percent, rounded to 1 decimal place
};

/** The bugs of the current release. */
export const bugs: BugReport[] = [
  { id: "BUG-101", title: "Login button does nothing on Safari", severity: "Critical", status: "open", ageDays: 2, inProduction: true, reportedBy: 12 },
  { id: "BUG-102", title: "Cart total ignores coupon", severity: " high ", status: "in-progress", ageDays: 4, inProduction: true, reportedBy: 3 },
  { id: "BUG-103", title: "Typo on the About page", severity: "trivial", status: "open", ageDays: 30, inProduction: false, reportedBy: 0 },
  { id: "BUG-104", title: "Search returns 500 for emoji", severity: "major", status: "reopened", ageDays: 5, inProduction: false, reportedBy: 0 },
  { id: "BUG-105", title: "cart total ignores coupon ", severity: "High", status: "open", ageDays: 1, inProduction: true, reportedBy: 1 },
  { id: "BUG-106", title: "Profile photo upload is slow", severity: "normal", status: "fixed", ageDays: 10, inProduction: false, reportedBy: 4 },
  { id: "BUG-107", title: "Checkout crashes on expired card", severity: "BLOCKER", status: "closed", ageDays: 20, inProduction: true, reportedBy: 25 },
  { id: "BUG-108", title: "Footer links misaligned on mobile", severity: "minor", status: "open", ageDays: 16, inProduction: true, reportedBy: 11 },
  { id: "BUG-109", title: "Password reset email never arrives", severity: "sev1", status: "open", ageDays: 3, inProduction: false, reportedBy: 0 },
  { id: "BUG-110", title: "Typo on the About page", severity: "low", status: "triage", ageDays: 7, inProduction: false, reportedBy: 0 },
];

// ---------- Tasks ----------
// "Active" bug (used in several tasks): any bug whose status is NOT "fixed" and NOT "closed".
// That includes "open", "in-progress", "reopened" – and any status we don't know (e.g. "triage"):
// we never hide a bug just because someone typed an unexpected status.

/**
 * Task 1 – Normalize the severity
 * Reporters type the severity in their own words. First trim the spaces and ignore upper/lower case, then:
 *   "critical" | "blocker" | "crash"              => Severity.Critical
 *   "high" | "major"                              => Severity.High
 *   "medium" | "normal"                           => Severity.Medium
 *   "low" | "minor" | "trivial" | "cosmetic"      => Severity.Low
 *   anything else (including "")                  => Severity.High – better to over-triage than to miss a real problem
 * Examples:  " high " => Severity.High,  "BLOCKER" => Severity.Critical,  "sev1" => Severity.High
 * Hint: a switch where several  case  lines share one  return.
 */
export function normalizeSeverity(raw: string): Severity {
  throw new Error("TODO");
}

/**
 * Task 2 – Priority
 * Return the priority of a bug – "P1" (most urgent) to "P4" – by its normalized severity (Task 1):
 *   Critical => "P1"
 *   High     => "P1" if it was found in production, otherwise "P2"
 *   Medium   => "P2" if at least 3 customers reported it, otherwise "P3"
 *   Low      => "P3" if at least 10 customers reported it, otherwise "P4"
 * Examples:  BUG-102 (" high ", in production) => "P1",  BUG-108 ("minor", 11 customers) => "P3"
 */
export function priorityOf(bug: BugReport): string {
  throw new Error("TODO");
}

/**
 * Task 3 – Board statistics
 * Return the BoardStats of the given bugs:
 *   total        – how many bugs there are
 *   waitingForQa – status "fixed"
 *   closed       – status "closed"
 *   active       – everything else (see "Active" above)
 *   reopenRate   – how many of the bugs that were fixed at least once came back.
 *                  "Fixed at least once" = reopened + fixed + closed.
 *                  reopened out of that, in percent, rounded to 1 decimal place. If nothing was ever fixed – 0.
 * Example: bugs => { total: 10, active: 8, waitingForQa: 1, closed: 1, reopenRate: 33.3 }   (1 reopened of 3)
 */
export function boardStats(list: BugReport[]): BoardStats {
  throw new Error("TODO");
}

/**
 * Task 4 – SLA breaches
 * Every priority has an SLA – the maximum number of days an active bug may stay unsolved:
 *   P1 => 1 day,   P2 => 3 days,   P3 => 14 days,   P4 => no SLA (never breaches)
 * Return the ACTIVE bugs whose ageDays is MORE than their SLA, in list order, each as
 *   "<id> (<priority>, <ageDays>d > <slaDays>d)"
 * Exactly on the SLA is not a breach. Fixed and closed bugs never breach.
 * Example: bugs => ["BUG-101 (P1, 2d > 1d)", "BUG-102 (P1, 4d > 1d)", "BUG-104 (P2, 5d > 3d)", "BUG-108 (P3, 16d > 14d)"]
 */
export function slaBreaches(list: BugReport[]): string[] {
  throw new Error("TODO");
}

/**
 * Task 5 – Possible duplicates
 * Two bugs are possible duplicates if their titles are equal after trimming the spaces and ignoring upper/lower case.
 * Return an object: key = the normalized title (trimmed, lower case), value = the ids of the bugs with that title,
 * in list order. Only titles that appear at least twice go into the object. Check ALL the bugs, whatever their status.
 * Example: bugs => {
 *   "cart total ignores coupon": ["BUG-102", "BUG-105"],
 *   "typo on the about page": ["BUG-103", "BUG-110"],
 * }
 * Hint: it's easier in two loops – first group every bug by its title, then keep only the groups with 2+ ids.
 */
export function findDuplicates(list: BugReport[]): Record<string, string[]> {
  throw new Error("TODO");
}

/**
 * Task 6 (Challenge) – What do we fix next?
 * Return the id of the ACTIVE bug that should be fixed next:
 *   - the most urgent priority wins ("P1" before "P2" before ...)
 *   - on the same priority – the older bug (bigger ageDays) wins
 *   - on a full tie – the one that comes first in the list
 * If there is no active bug – return "nothing to do".
 * Examples:  bugs => "BUG-102" (three P1 bugs, BUG-102 is the oldest),   [BUG-103 (P4, 30 days), BUG-105 (P1, 1 day)] => "BUG-105"
 * Hint: keep "the best bug so far" in a variable and replace it only when a bug is strictly better.
 *       Did you know?  "P1" < "P2"  is true – strings are compared character by character.
 */
export function pickNextBug(list: BugReport[]): string {
  throw new Error("TODO");
}

/**
 * Task 7 (Challenge) – The triage board
 * Put everything together and return the board lines, in this order:
 *   "Bug triage | total: <total>"
 *   "Active: <active> | Waiting for QA: <waitingForQa> | Closed: <closed>"
 *   "Reopen rate: <reopenRate>%"
 *   "Active by priority: P1=<n> P2=<n> P3=<n> P4=<n>"     – counting ACTIVE bugs only
 *   "SLA breaches: <the breaches, separated by ", ">"       – or "none" if there are none
 *   one line per duplicate group: 'Possible duplicate: "<title>" => <the ids, separated by ", ">'
 *   "Next up: <id>"                                         – from Task 6 (or "Next up: nothing to do")
 * Example: bugs =>
 *   [
 *     "Bug triage | total: 10",
 *     "Active: 8 | Waiting for QA: 1 | Closed: 1",
 *     "Reopen rate: 33.3%",
 *     "Active by priority: P1=3 P2=2 P3=1 P4=2",
 *     "SLA breaches: BUG-101 (P1, 2d > 1d), BUG-102 (P1, 4d > 1d), BUG-104 (P2, 5d > 3d), BUG-108 (P3, 16d > 14d)",
 *     'Possible duplicate: "cart total ignores coupon" => BUG-102, BUG-105',
 *     'Possible duplicate: "typo on the about page" => BUG-103, BUG-110',
 *     "Next up: BUG-102",
 *   ]
 */
export function buildTriageBoard(list: BugReport[]): string[] {
  throw new Error("TODO");
}

// ============================================================
// Self-check – run:  npm run exercise -- 01 hw2
// On every line, the value left of "=> expected:" must equal the value on its right.
// (No need to change the code below this line)
// ============================================================

console.log("\n--- Task 1: normalizeSeverity ---");
try {
  console.log(normalizeSeverity("Critical"), "=> expected:", Severity.Critical);
  console.log(normalizeSeverity("BLOCKER"), "=> expected:", Severity.Critical);
  console.log(normalizeSeverity(" high "), "=> expected:", Severity.High); // spaces around the word
  console.log(normalizeSeverity("Major"), "=> expected:", Severity.High);
  console.log(normalizeSeverity("normal"), "=> expected:", Severity.Medium);
  console.log(normalizeSeverity("minor"), "=> expected:", Severity.Low);
  console.log(normalizeSeverity("Cosmetic"), "=> expected:", Severity.Low);
  console.log(normalizeSeverity("sev1"), "=> expected:", Severity.High); // unknown => High
  console.log(normalizeSeverity(""), "=> expected:", Severity.High); // the reporter left it empty
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Task 2: priorityOf ---");
try {
  console.log(priorityOf(bugs[0]), "=> expected:", "P1"); // BUG-101 – Critical
  console.log(priorityOf(bugs[1]), "=> expected:", "P1"); // BUG-102 – High, in production
  console.log(priorityOf(bugs[3]), "=> expected:", "P2"); // BUG-104 – High, not in production
  console.log(priorityOf(bugs[5]), "=> expected:", "P2"); // BUG-106 – Medium, 4 customers
  console.log(priorityOf(bugs[7]), "=> expected:", "P3"); // BUG-108 – Low, 11 customers
  console.log(priorityOf(bugs[2]), "=> expected:", "P4"); // BUG-103 – Low, found by QA
  console.log(priorityOf(bugs[8]), "=> expected:", "P2"); // BUG-109 – unknown severity => High, not in production
  console.log(
    priorityOf({ id: "BUG-900", title: "x", severity: "medium", status: "open", ageDays: 1, inProduction: true, reportedBy: 3 }),
    "=> expected:",
    "P2",
  ); // exactly 3 customers is enough
  console.log(
    priorityOf({ id: "BUG-901", title: "x", severity: "medium", status: "open", ageDays: 1, inProduction: true, reportedBy: 2 }),
    "=> expected:",
    "P3",
  ); // for Medium, production alone doesn't matter
  console.log(
    priorityOf({ id: "BUG-902", title: "x", severity: "low", status: "open", ageDays: 1, inProduction: false, reportedBy: 10 }),
    "=> expected:",
    "P3",
  ); // exactly 10 customers
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Task 3: boardStats ---");
try {
  console.log(boardStats(bugs), "=> expected:", { total: 10, active: 8, waitingForQa: 1, closed: 1, reopenRate: 33.3 });
  console.log(boardStats([]), "=> expected:", { total: 0, active: 0, waitingForQa: 0, closed: 0, reopenRate: 0 });
  console.log(boardStats([bugs[0], bugs[2]]).reopenRate, "=> expected:", 0); // nothing was ever fixed
  console.log(boardStats([bugs[3], bugs[5]]).reopenRate, "=> expected:", 50); // 1 reopened of 2
  console.log(
    boardStats([bugs[3], { ...bugs[3], id: "BUG-903" }, bugs[6]]),
    "=> expected:",
    { total: 3, active: 2, waitingForQa: 0, closed: 1, reopenRate: 66.7 },
  ); // 2 reopened of 3
  console.log(boardStats([bugs[9]]).active, "=> expected:", 1); // unknown status "triage" is still active
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Task 4: slaBreaches ---");
try {
  console.log(slaBreaches(bugs), "=> expected:", [
    "BUG-101 (P1, 2d > 1d)",
    "BUG-102 (P1, 4d > 1d)",
    "BUG-104 (P2, 5d > 3d)",
    "BUG-108 (P3, 16d > 14d)",
  ]);
  console.log(slaBreaches([bugs[4], bugs[8]]), "=> expected:", []); // exactly on the SLA is not a breach
  console.log(slaBreaches([bugs[5], bugs[6]]), "=> expected:", []); // fixed / closed bugs have no SLA
  console.log(
    slaBreaches([{ id: "BUG-904", title: "x", severity: "trivial", status: "open", ageDays: 365, inProduction: false, reportedBy: 0 }]),
    "=> expected:",
    [],
  ); // P4 never breaches
  console.log(slaBreaches([]), "=> expected:", []);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Task 5: findDuplicates ---");
try {
  console.log(findDuplicates(bugs), "=> expected:", {
    "cart total ignores coupon": ["BUG-102", "BUG-105"],
    "typo on the about page": ["BUG-103", "BUG-110"],
  });
  console.log(findDuplicates([]), "=> expected:", {});
  console.log(findDuplicates([bugs[0], bugs[1], bugs[2]]), "=> expected:", {}); // no duplicates
  console.log(
    findDuplicates([
      { ...bugs[0], id: "BUG-905", title: "Logo is blurry" },
      { ...bugs[0], id: "BUG-906", title: "  logo IS blurry" },
      bugs[3],
      { ...bugs[0], id: "BUG-907", title: "LOGO is blurry " },
    ]),
    "=> expected:",
    { "logo is blurry": ["BUG-905", "BUG-906", "BUG-907"] },
  );
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Task 6 (Challenge): pickNextBug ---");
try {
  console.log(pickNextBug(bugs), "=> expected:", "BUG-102"); // three P1 bugs – BUG-102 is the oldest
  console.log(pickNextBug([]), "=> expected:", "nothing to do");
  console.log(pickNextBug([bugs[5], bugs[6]]), "=> expected:", "nothing to do"); // only fixed / closed
  console.log(pickNextBug([bugs[2], bugs[4]]), "=> expected:", "BUG-105"); // a new P1 beats an old P4
  console.log(pickNextBug([bugs[2], bugs[9]]), "=> expected:", "BUG-103"); // both P4 – the older one
  console.log(pickNextBug([bugs[0], { ...bugs[0], id: "BUG-908" }]), "=> expected:", "BUG-101"); // full tie – the first one
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Task 7 (Challenge): buildTriageBoard ---");
try {
  console.log(buildTriageBoard(bugs), "=> expected:", [
    "Bug triage | total: 10",
    "Active: 8 | Waiting for QA: 1 | Closed: 1",
    "Reopen rate: 33.3%",
    "Active by priority: P1=3 P2=2 P3=1 P4=2",
    "SLA breaches: BUG-101 (P1, 2d > 1d), BUG-102 (P1, 4d > 1d), BUG-104 (P2, 5d > 3d), BUG-108 (P3, 16d > 14d)",
    'Possible duplicate: "cart total ignores coupon" => BUG-102, BUG-105',
    'Possible duplicate: "typo on the about page" => BUG-103, BUG-110',
    "Next up: BUG-102",
  ]);
  console.log(buildTriageBoard([bugs[5], bugs[6], bugs[8]]), "=> expected:", [
    "Bug triage | total: 3",
    "Active: 1 | Waiting for QA: 1 | Closed: 1",
    "Reopen rate: 0%",
    "Active by priority: P1=0 P2=1 P3=0 P4=0",
    "SLA breaches: none",
    "Next up: BUG-109",
  ]); // no duplicates => no duplicate lines
  console.log(buildTriageBoard([]), "=> expected:", [
    "Bug triage | total: 0",
    "Active: 0 | Waiting for QA: 0 | Closed: 0",
    "Reopen rate: 0%",
    "Active by priority: P1=0 P2=0 P3=0 P4=0",
    "SLA breaches: none",
    "Next up: nothing to do",
  ]);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}
