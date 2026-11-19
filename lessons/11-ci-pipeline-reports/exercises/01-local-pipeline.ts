// Lesson 11 – Topic 01: Local Pipeline – Exercises
// ------------------------------------------------------------
// Topic: examples/01-local-pipeline.ts – what a CI server actually does:
//   runs stages in order → checks the exit code → stops on failure (fail fast) → prints a green/red summary.
// Here the "commands" are functions that return an exit code, so everything is deterministic and testable.
// Instructions:
//   1. Fill in the body of each function, replacing the line  throw new Error("TODO")
//   2. Check yourself: npm run exercise -- 11 01 (self-check at the end of the file)
// ------------------------------------------------------------

export interface PipelineStage {
  name: string;
  /** "Runs" the stage and returns an exit code: 0 = success, any other number = failure */
  run: () => number;
  /** true = even if the stage fails, carry on to the next stage */
  continueOnError?: boolean;
}

export interface StageResult {
  name: string;
  ok: boolean;
  exitCode: number;
}

export interface TimedResult {
  name: string;
  ok: boolean;
  seconds: number;
}

/**
 * Exercise 1 – Run a Pipeline with fail fast
 * Run the stages in order (call each stage's run()) and return an array of results.
 *   ok = exitCode === 0
 * If a stage fails and it has no continueOnError – stop: the stages after it are not run at all!
 * Example: Typecheck→0, Tests→1, Report→0  =>
 *   [{ name: "Typecheck", ok: true, exitCode: 0 }, { name: "Tests", ok: false, exitCode: 1 }]
 *   (Report did not run)
 */
export function runPipeline(stages: PipelineStage[]): StageResult[] {
  throw new Error("TODO");
}

/**
 * Exercise 2 – Which stages were skipped?
 * Take the names of all the stages in the Pipeline and the results of what actually ran,
 * and return the names of the stages that did not run (in their original order).
 * Example: ["Typecheck", "Tests", "Report"] + results for Typecheck and Tests  =>  ["Report"]
 */
export function skippedStages(stageNames: string[], results: StageResult[]): string[] {
  throw new Error("TODO");
}

/**
 * Exercise 3 – Green or red?
 * The Pipeline is "GREEN" only if all stages ran (results.length === totalStages) and all of them passed.
 * In any other case – "RED" (even when a stage with continueOnError failed!).
 * An empty Pipeline (0 stages, 0 results) => "GREEN".
 */
export function pipelineVerdict(results: StageResult[], totalStages: number): "GREEN" | "RED" {
  throw new Error("TODO");
}

/**
 * Exercise 4 – A summary line for a stage
 * Build a line in the format:  <icon> <name padded to 28 chars> <seconds with one decimal place>s
 *   icon: "✅" for success, "❌" for failure
 * Example: { name: "Typecheck", ok: true, seconds: 3.456 }
 *   =>  "✅ " + "Typecheck".padEnd(28) + " 3.5s"
 * Hint: padEnd and toFixed(1)
 */
export function formatStageLine(result: TimedResult): string {
  throw new Error("TODO");
}

/**
 * Exercise 5 – Tail of the log
 * CI usually shows only the last lines of the output. Return the last n lines
 * of the output, after calling trim() on the whole output. Empty output (or only whitespace) / n <= 0  =>  [].
 * Lines can be separated by "\n" or by "\r\n".
 * Example: tailLines("a\nb\nc\nd\n", 2)  =>  ["c", "d"]
 */
export function tailLines(output: string, n: number): string[] {
  throw new Error("TODO");
}

/**
 * Exercise 6 (Bonus) – Pipeline summary
 * Return an object:
 *   passed       – how many stages passed
 *   failed       – how many stages failed
 *   skipped      – how many stages did not run (totalStages minus the number of results)
 *   totalSeconds – the sum of the times, rounded to one decimal place (Math.round(x * 10) / 10)
 *   slowest      – the name of the slowest stage (on a tie – the first one), or null if there are no results
 * Example: [{A, ok, 1.25}, {B, fail, 2.5}] with 3 stages
 *   =>  { passed: 1, failed: 1, skipped: 1, totalSeconds: 3.8, slowest: "B" }
 */
export function summarizePipeline(
  results: TimedResult[],
  totalStages: number,
): { passed: number; failed: number; skipped: number; totalSeconds: number; slowest: string | null } {
  throw new Error("TODO");
}

// ============================================================
// Self-check – run:  npm run exercise -- 11 01
// On every line, the value left of "=> expected:" must equal the value on its right.
// (No need to change the code below this line)
// ============================================================

console.log("\n--- Exercise 1: runPipeline ---");
try {
  // calls records which stages actually "ran" (i.e. their run function was called)
  const calls: string[] = [];
  const stage = (name: string, code: number, continueOnError?: boolean): PipelineStage => ({
    name,
    continueOnError,
    run: () => {
      calls.push(name);
      return code;
    },
  });

  console.log(runPipeline([stage("Typecheck", 0), stage("Tests", 1), stage("Report", 0)]), "=> expected:", [
    { name: "Typecheck", ok: true, exitCode: 0 },
    { name: "Tests", ok: false, exitCode: 1 },
  ]);
  // After a failure, the following stages do not run at all
  console.log(calls, "=> expected:", ["Typecheck", "Tests"]);

  calls.length = 0;
  console.log(runPipeline([stage("Lint", 2, true), stage("Tests", 0)]), "=> expected:", [
    { name: "Lint", ok: false, exitCode: 2 },
    { name: "Tests", ok: true, exitCode: 0 },
  ]);
  // continueOnError – carry on to the next stage despite the failure
  console.log(calls, "=> expected:", ["Lint", "Tests"]);
  console.log(runPipeline([]), "=> expected:", []);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 2: skippedStages ---");
try {
  const ran: StageResult[] = [
    { name: "Typecheck", ok: true, exitCode: 0 },
    { name: "Tests", ok: false, exitCode: 1 },
  ];
  console.log(skippedStages(["Typecheck", "Tests", "Report", "Deploy"], ran), "=> expected:", ["Report", "Deploy"]);
  console.log(skippedStages(["Typecheck", "Tests"], ran), "=> expected:", []);
  console.log(skippedStages(["A"], []), "=> expected:", ["A"]);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 3: pipelineVerdict ---");
try {
  const ok: StageResult = { name: "A", ok: true, exitCode: 0 };
  const bad: StageResult = { name: "B", ok: false, exitCode: 1 };
  console.log(pipelineVerdict([ok, ok], 2), "=> expected:", "GREEN");
  console.log(pipelineVerdict([ok, bad], 2), "=> expected:", "RED");
  console.log(pipelineVerdict([ok], 3), "=> expected:", "RED"); // stages were skipped
  console.log(pipelineVerdict([], 0), "=> expected:", "GREEN");
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 4: formatStageLine ---");
try {
  console.log(formatStageLine({ name: "Typecheck", ok: true, seconds: 3.456 }), "=> expected:", "✅ Typecheck                    3.5s");
  console.log(formatStageLine({ name: "API tests", ok: false, seconds: 12 }), "=> expected:", "❌ API tests                    12.0s");
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 5: tailLines ---");
try {
  console.log(tailLines("a\nb\nc\nd\n", 2), "=> expected:", ["c", "d"]);
  console.log(tailLines("only one", 3), "=> expected:", ["only one"]);
  console.log(tailLines("x\r\ny\r\nz", 2), "=> expected:", ["y", "z"]);
  console.log(tailLines("   \n  ", 3), "=> expected:", []);
  console.log(tailLines("a\nb", 0), "=> expected:", []);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 6 (Bonus): summarizePipeline ---");
try {
  console.log(
    summarizePipeline(
      [
        { name: "A", ok: true, seconds: 1.25 },
        { name: "B", ok: false, seconds: 2.5 },
      ],
      3,
    ),
    "=> expected:",
    { passed: 1, failed: 1, skipped: 1, totalSeconds: 3.8, slowest: "B" },
  );
  console.log(
    summarizePipeline(
      [
        { name: "X", ok: true, seconds: 2 },
        { name: "Y", ok: true, seconds: 2 },
      ],
      2,
    ),
    "=> expected:",
    { passed: 2, failed: 0, skipped: 0, totalSeconds: 4, slowest: "X" },
  );
  console.log(summarizePipeline([], 2), "=> expected:", { passed: 0, failed: 0, skipped: 2, totalSeconds: 0, slowest: null });
} catch (e) {
  console.log("  ✋", (e as Error).message);
}
