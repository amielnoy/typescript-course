// Lesson 6 – Summary solutions
export type Severity = "low" | "medium" | "high" | "critical";
export type BugStatus = "open" | "in-progress" | "resolved" | "closed";

export interface Bug {
  readonly id: number;
  title: string;
  severity: Severity;
  status: BugStatus;
  assignee?: string;
  tags: string[];
}

export function urgentBugs(bugs: Bug[]): Bug[] {
  return bugs
    .filter((b) => b.status !== "closed" && b.status !== "resolved")
    .filter((b) => b.severity === "high" || b.severity === "critical")
    .sort((a, b) => a.id - b.id);
}

export function parseBugId(id: string | number): number {
  if (typeof id === "number") return id;
  const digits = id.startsWith("BUG-") ? id.slice(4) : id;
  return digits.trim() === "" ? NaN : Number(digits);
}

export type TestOutcome =
  | { status: "passed"; name: string; durationMs: number }
  | { status: "failed"; name: string; error: string }
  | { status: "skipped"; name: string; reason: string };

export function outcomeLine(outcome: TestOutcome): string {
  switch (outcome.status) {
    case "passed":
      return `✔ ${outcome.name} (${outcome.durationMs}ms)`;
    case "failed":
      return `✘ ${outcome.name}: ${outcome.error}`;
    case "skipped":
      return `○ ${outcome.name} – skipped: ${outcome.reason}`;
  }
}

export interface BugTracker {
  add(bug: Bug): void;
  findById(id: number): Bug | undefined;
  updateStatus(id: number, status: BugStatus): boolean;
  count(): number;
}

export class InMemoryBugTracker implements BugTracker {
  private bugs: Bug[] = [];

  add(bug: Bug): void {
    this.bugs.push(bug);
  }

  findById(id: number): Bug | undefined {
    return this.bugs.find((b) => b.id === id);
  }

  updateStatus(id: number, status: BugStatus): boolean {
    const bug = this.findById(id);
    if (!bug) return false;
    bug.status = status;
    return true;
  }

  count(): number {
    return this.bugs.length;
  }
}

// ============================================================
// Self-check – run:  npm run solution -- 06
// On every line, the value left of "=> expected:" must equal the value on its right.
// (No need to change the code below this line)
// ============================================================

// Sample data for exercises 2 and 5 (the as unknown as cast lets this run even before you've completed Exercise 1)
function sampleBugs(): Bug[] {
  return [
    { id: 3, title: "Crash on save", severity: "critical", status: "open", tags: [] },
    { id: 1, title: "Slow search", severity: "high", status: "in-progress", tags: ["perf"] },
    { id: 2, title: "Typo", severity: "low", status: "open", tags: [] },
    { id: 4, title: "Old crash", severity: "critical", status: "closed", tags: [] },
    { id: 5, title: "Fixed thing", severity: "high", status: "resolved", tags: [] },
  ] as unknown as Bug[];
}

console.log("\n--- Exercise 2: urgentBugs ---");
try {
  console.log(
    urgentBugs(sampleBugs()).map((b) => b.id),
    "=> expected:",
    [1, 3],
  );
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 3: parseBugId ---");
try {
  console.log(parseBugId(7), "=> expected:", 7);
  console.log(parseBugId("7"), "=> expected:", 7);
  console.log(parseBugId("BUG-7"), "=> expected:", 7);
  console.log(parseBugId("abc"), "=> expected:", NaN);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 4: outcomeLine ---");
try {
  console.log(outcomeLine({ status: "passed", name: "login", durationMs: 120 }), "=> expected:", "✔ login (120ms)");
  console.log(outcomeLine({ status: "failed", name: "search", error: "timeout" }), "=> expected:", "✘ search: timeout");
  console.log(
    outcomeLine({ status: "skipped", name: "pay", reason: "no sandbox" }),
    "=> expected:",
    "○ pay – skipped: no sandbox",
  );
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 5: InMemoryBugTracker ---");
try {
  const bugs = sampleBugs();
  const t = new InMemoryBugTracker();
  console.log(t.count(), "=> expected:", 0);
  t.add(bugs[0]);
  t.add(bugs[1]);
  console.log(t.count(), "=> expected:", 2);
  console.log(t.findById(3)?.title, "=> expected:", "Crash on save");
  console.log(t.findById(99), "=> expected:", undefined);
  console.log(t.updateStatus(3, "resolved"), "=> expected:", true);
  console.log(t.findById(3)?.status, "=> expected:", "resolved");
  console.log(t.updateStatus(99, "closed"), "=> expected:", false);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}
