// Lesson 2 – Summary solutions
export interface TestResult {
  name: string;
  status: "passed" | "failed" | "skipped";
  durationMs: number;
}

export function passRate(passed: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((passed / total) * 100);
}

export function formatTitle(id: string, title: string, tag?: string): string {
  const base = `${id}: ${title}`;
  return tag ? `${base} [${tag}]` : base;
}

export const failedNames = (results: TestResult[]): string[] =>
  results.filter((r) => r.status === "failed").map((r) => r.name);

export const totalRunTime = (results: TestResult[]): number =>
  results.filter((r) => r.status !== "skipped").reduce((sum, r) => sum + r.durationMs, 0);

export function repeat<T>(times: number, action: (attempt: number) => T): T[] {
  const out: T[] = [];
  for (let i = 1; i <= times; i++) {
    out.push(action(i));
  }
  return out;
}

export class BugReport {
  status: "open" | "closed" | "reopened" = "open";
  comments: string[] = [];

  constructor(
    public id: number,
    public title: string,
    public severity: "low" | "medium" | "high",
  ) {}

  addComment(text: string): void {
    this.comments.push(text);
  }

  close(): void {
    this.status = "closed";
  }

  reopen(): void {
    if (this.status === "closed") {
      this.status = "reopened";
    }
  }

  toString(): string {
    return `BUG-${this.id} [${this.severity}] ${this.title} (${this.status}, ${this.comments.length} comments)`;
  }
}

// ============================================================
// Self-check – run:  npm run solution -- 02
// On every line, the value left of "=> expected:" must equal the value on its right.
// (No need to change the code below this line)
// ============================================================

const sampleResults: TestResult[] = [
  { name: "login", status: "passed", durationMs: 100 },
  { name: "search", status: "failed", durationMs: 300 },
  { name: "cart", status: "skipped", durationMs: 0 },
  { name: "logout", status: "failed", durationMs: 50 },
];

console.log("\n--- Exercise 1: passRate ---");
try {
  console.log(passRate(45, 50), "=> expected:", 90);
  console.log(passRate(1, 3), "=> expected:", 33);
  console.log(passRate(0, 0), "=> expected:", 0);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 2: formatTitle ---");
try {
  console.log(formatTitle("TC-1", "Login"), "=> expected:", "TC-1: Login");
  console.log(formatTitle("TC-1", "Login", "smoke"), "=> expected:", "TC-1: Login [smoke]");
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 3: failedNames ---");
try {
  console.log(failedNames(sampleResults), "=> expected:", ["search", "logout"]);
  console.log(failedNames([]), "=> expected:", []);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 4: totalRunTime ---");
try {
  console.log(totalRunTime(sampleResults), "=> expected:", 450);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 5: repeat ---");
try {
  console.log(repeat(3, (n) => n * 10), "=> expected:", [10, 20, 30]);
  console.log(repeat(0, () => "x"), "=> expected:", []);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 6: BugReport ---");
try {
  const bug = new BugReport(7, "Crash on save", "high");
  console.log(bug.toString(), "=> expected:", "BUG-7 [high] Crash on save (open, 0 comments)");
  bug.reopen(); // the bug is not closed – should not change
  console.log(bug.toString(), "=> expected:", "BUG-7 [high] Crash on save (open, 0 comments)");
  bug.addComment("Reproduced on Chrome");
  bug.addComment("Also on Firefox");
  bug.close();
  console.log(bug.toString(), "=> expected:", "BUG-7 [high] Crash on save (closed, 2 comments)");
  bug.reopen();
  console.log(bug.toString(), "=> expected:", "BUG-7 [high] Crash on save (reopened, 2 comments)");
} catch (e) {
  console.log("  ✋", (e as Error).message);
}
