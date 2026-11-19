// Lesson 2 – Summary exercises
// Check yourself: npm run exercise -- 02 (self-check at the end of the file)

export interface TestResult {
  name: string;
  status: "passed" | "failed" | "skipped";
  durationMs: number;
}

/**
 * Exercise 1 – Pass rate
 * Return the pass rate as a percentage rounded to a whole number (Math.round).
 * If total is 0 – return 0.
 */
export function passRate(passed: number, total: number): number {
  throw new Error("TODO");
}

/**
 * Exercise 2 – Building a test title with an optional parameter
 * formatTitle("TC-1", "Login")            => "TC-1: Login"
 * formatTitle("TC-1", "Login", "smoke")   => "TC-1: Login [smoke]"
 */
export function formatTitle(id: string, title: string, tag?: string): string {
  throw new Error("TODO");
}

/**
 * Exercise 3 – arrow function: names of the tests that failed
 * Return an array of the names of the tests with status "failed" (in the same order).
 * Write the solution as an arrow function with filter and map.
 */
export const failedNames = (results: TestResult[]): string[] => {
  throw new Error("TODO");
};

/**
 * Exercise 4 – reduce: total run time of all tests except the skipped ones (status "skipped")
 */
export const totalRunTime = (results: TestResult[]): number => {
  throw new Error("TODO");
};

/**
 * Exercise 5 – A function that receives a function (callback)
 * Call action exactly `times` times, and return an array with the results.
 * action receives the attempt number (starting from 1).
 * repeat(3, (n) => n * 10)  => [10, 20, 30]
 * (We'll learn the <T> notation in Lesson 7 – for now just ignore it)
 */
export function repeat<T>(times: number, action: (attempt: number) => T): T[] {
  throw new Error("TODO");
}

/**
 * Exercise 6 – The BugReport class
 * - constructor(id: number, title: string, severity: "low" | "medium" | "high")
 * - a status field that starts as "open"
 * - a comments: string[] field that starts empty
 * - addComment(text): adds a comment
 * - close(): changes status to "closed"
 * - reopen(): changes status to "reopened" – only if the bug is closed, otherwise does nothing
 * - toString(): returns  "BUG-<id> [<severity>] <title> (<status>, <n> comments)"
 *   For example: "BUG-7 [high] Crash on save (open, 2 comments)"
 */
export class BugReport {
  // TODO: define the fields and the constructor

  constructor(id: number, title: string, severity: "low" | "medium" | "high") {
    throw new Error("TODO");
  }

  addComment(text: string): void {
    throw new Error("TODO");
  }

  close(): void {
    throw new Error("TODO");
  }

  reopen(): void {
    throw new Error("TODO");
  }

  toString(): string {
    throw new Error("TODO");
  }
}

// ============================================================
// Self-check – run:  npm run exercise -- 02
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
