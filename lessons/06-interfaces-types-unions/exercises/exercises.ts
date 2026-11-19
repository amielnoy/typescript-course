// Lesson 6 – Summary exercises
// Check yourself: npm run exercise -- 06 (self-check at the end of the file)

/**
 * Exercise 1 – Defining types
 * Complete the following definitions (right now they are "empty"):
 *
 *  type Severity  – one of: "low" | "medium" | "high" | "critical"
 *  type BugStatus – one of: "open" | "in-progress" | "resolved" | "closed"
 *  interface Bug:
 *     readonly id: number
 *     title: string
 *     severity: Severity
 *     status: BugStatus
 *     assignee?: string      (optional)
 *     tags: string[]
 */
export type Severity = string; // TODO
export type BugStatus = string; // TODO
export interface Bug {
  // TODO
  [key: string]: unknown; // delete this line after you've defined the fields
}

/**
 * Exercise 2 – A function that uses Bug
 * Return all open bugs (status that is neither "closed" nor "resolved")
 * with severity "high" or "critical", sorted by id ascending.
 */
export function urgentBugs(bugs: Bug[]): Bug[] {
  throw new Error("TODO");
}

/**
 * Exercise 3 – Union + typeof
 * The function takes an ID that can be a number (7) or a string ("7" / "BUG-7")
 * and always returns a number. If it can't be parsed – return NaN.
 *   parseBugId(7)        => 7
 *   parseBugId("7")      => 7
 *   parseBugId("BUG-7")  => 7
 *   parseBugId("abc")    => NaN
 */
export function parseBugId(id: string | number): number {
  throw new Error("TODO");
}

/**
 * Exercise 4 – Discriminated Union
 * TestOutcome is already defined. Implement outcomeLine:
 *   passed  => "✔ <name> (<durationMs>ms)"
 *   failed  => "✘ <name>: <error>"
 *   skipped => "○ <name> – skipped: <reason>"
 */
export type TestOutcome =
  | { status: "passed"; name: string; durationMs: number }
  | { status: "failed"; name: string; error: string }
  | { status: "skipped"; name: string; reason: string };

export function outcomeLine(outcome: TestOutcome): string {
  throw new Error("TODO");
}

/**
 * Exercise 5 – implements
 * Implement a class InMemoryBugTracker that implements the BugTracker interface:
 *   add(bug)                 – adds a bug
 *   findById(id)             – returns the bug or undefined
 *   updateStatus(id, status) – updates the status, returns true if found, otherwise false
 *   count()                  – the number of bugs
 */
export interface BugTracker {
  add(bug: Bug): void;
  findById(id: number): Bug | undefined;
  updateStatus(id: number, status: BugStatus): boolean;
  count(): number;
}

export class InMemoryBugTracker /* TODO: implements BugTracker */ {
  add(bug: Bug): void {
    throw new Error("TODO");
  }
  findById(id: number): Bug | undefined {
    throw new Error("TODO");
  }
  updateStatus(id: number, status: BugStatus): boolean {
    throw new Error("TODO");
  }
  count(): number {
    throw new Error("TODO");
  }
}

// ============================================================
// Self-check – run:  npm run exercise -- 06
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
