// Lesson 1 – Homework 2: Bug Triage Board – Solutions
// Run (including the self-check):  npm run solution -- 01 hw2
// Scenario: triage the open bugs of the release – normalize the severity the reporter typed, give every bug
// a priority, summarize the board, find SLA breaches and possible duplicates, and pick the next bug to fix.

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

export function normalizeSeverity(raw: string): Severity {
  switch (raw.trim().toLowerCase()) {
    case "critical":
    case "blocker":
    case "crash":
      return Severity.Critical;
    case "high":
    case "major":
      return Severity.High;
    case "medium":
    case "normal":
      return Severity.Medium;
    case "low":
    case "minor":
    case "trivial":
    case "cosmetic":
      return Severity.Low;
    default:
      return Severity.High; // unknown severity – better to over-triage than to miss a real problem
  }
}

export function priorityOf(bug: BugReport): string {
  switch (normalizeSeverity(bug.severity)) {
    case Severity.Critical:
      return "P1";
    case Severity.High:
      return bug.inProduction ? "P1" : "P2";
    case Severity.Medium:
      return bug.reportedBy >= 3 ? "P2" : "P3";
    case Severity.Low:
      return bug.reportedBy >= 10 ? "P3" : "P4";
  }
}

export function boardStats(list: BugReport[]): BoardStats {
  let active = 0;
  let waitingForQa = 0;
  let closed = 0;
  let reopened = 0;

  for (const bug of list) {
    if (bug.status === "fixed") {
      waitingForQa++;
    } else if (bug.status === "closed") {
      closed++;
    } else {
      active++; // open, in-progress, reopened – and any status we don't know
      if (bug.status === "reopened") reopened++;
    }
  }

  // Bugs that reached "fixed" at least once: the reopened ones + the ones waiting for QA + the closed ones
  const everFixed = reopened + waitingForQa + closed;
  const reopenRate = everFixed === 0 ? 0 : Math.round((reopened / everFixed) * 100 * 10) / 10;

  return { total: list.length, active, waitingForQa, closed, reopenRate };
}

export function slaBreaches(list: BugReport[]): string[] {
  const breaches: string[] = [];
  for (const bug of list) {
    if (bug.status === "fixed" || bug.status === "closed") continue; // only active bugs have an SLA

    const priority = priorityOf(bug);
    let slaDays: number | undefined;
    if (priority === "P1") slaDays = 1;
    else if (priority === "P2") slaDays = 3;
    else if (priority === "P3") slaDays = 14;
    // P4 – no SLA, slaDays stays undefined

    if (slaDays !== undefined && bug.ageDays > slaDays) {
      breaches.push(`${bug.id} (${priority}, ${bug.ageDays}d > ${slaDays}d)`);
    }
  }
  return breaches;
}

export function findDuplicates(list: BugReport[]): Record<string, string[]> {
  // Pass 1 – group every bug by its normalized title
  const byTitle: Record<string, string[]> = {};
  for (const bug of list) {
    const key = bug.title.trim().toLowerCase();
    if (byTitle[key] === undefined) {
      byTitle[key] = [];
    }
    byTitle[key].push(bug.id);
  }

  // Pass 2 – keep only the titles that appear more than once
  const duplicates: Record<string, string[]> = {};
  for (const title in byTitle) {
    if (byTitle[title].length >= 2) {
      duplicates[title] = byTitle[title];
    }
  }
  return duplicates;
}

export function pickNextBug(list: BugReport[]): string {
  let best: BugReport | undefined;
  let bestPriority = "";

  for (const bug of list) {
    if (bug.status === "fixed" || bug.status === "closed") continue;

    const priority = priorityOf(bug);
    // "P1" < "P2" < "P3" < "P4" – comparing the strings works because there is a single digit.
    // Strictly better only (< and >) – on a full tie the earlier bug stays.
    const better =
      best === undefined || priority < bestPriority || (priority === bestPriority && bug.ageDays > best.ageDays);

    if (better) {
      best = bug;
      bestPriority = priority;
    }
  }

  return best === undefined ? "nothing to do" : best.id;
}

export function buildTriageBoard(list: BugReport[]): string[] {
  const stats = boardStats(list);

  // Active bugs per priority
  let p1 = 0;
  let p2 = 0;
  let p3 = 0;
  let p4 = 0;
  for (const bug of list) {
    if (bug.status === "fixed" || bug.status === "closed") continue;
    const priority = priorityOf(bug);
    if (priority === "P1") p1++;
    else if (priority === "P2") p2++;
    else if (priority === "P3") p3++;
    else p4++;
  }

  const breaches = slaBreaches(list);
  const duplicates = findDuplicates(list);

  const lines: string[] = [];
  lines.push(`Bug triage | total: ${stats.total}`);
  lines.push(`Active: ${stats.active} | Waiting for QA: ${stats.waitingForQa} | Closed: ${stats.closed}`);
  lines.push(`Reopen rate: ${stats.reopenRate}%`);
  lines.push(`Active by priority: P1=${p1} P2=${p2} P3=${p3} P4=${p4}`);
  lines.push(`SLA breaches: ${breaches.length > 0 ? breaches.join(", ") : "none"}`);

  for (const title in duplicates) {
    lines.push(`Possible duplicate: "${title}" => ${duplicates[title].join(", ")}`);
  }

  lines.push(`Next up: ${pickNextBug(list)}`);
  return lines;
}

// ============================================================
// Self-check – run:  npm run solution -- 01 hw2
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
