// Lesson 11 – Topic 01: Local Pipeline – Solutions

export interface PipelineStage {
  name: string;
  run: () => number;
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

// Exercise 1
export function runPipeline(stages: PipelineStage[]): StageResult[] {
  const results: StageResult[] = [];
  for (const stage of stages) {
    const exitCode = stage.run();
    const ok = exitCode === 0;
    results.push({ name: stage.name, ok, exitCode });
    if (!ok && !stage.continueOnError) break; // fail fast
  }
  return results;
}

// Exercise 2
export function skippedStages(stageNames: string[], results: StageResult[]): string[] {
  const ran = new Set(results.map((r) => r.name));
  return stageNames.filter((name) => !ran.has(name));
}

// Exercise 3
export function pipelineVerdict(results: StageResult[], totalStages: number): "GREEN" | "RED" {
  return results.length === totalStages && results.every((r) => r.ok) ? "GREEN" : "RED";
}

// Exercise 4
export function formatStageLine(result: TimedResult): string {
  return `${result.ok ? "✅" : "❌"} ${result.name.padEnd(28)} ${result.seconds.toFixed(1)}s`;
}

// Exercise 5
export function tailLines(output: string, n: number): string[] {
  const text = output.trim();
  if (text === "" || n <= 0) return [];
  return text.split(/\r?\n/).slice(-n);
}

// Exercise 6 (Bonus)
export function summarizePipeline(
  results: TimedResult[],
  totalStages: number,
): { passed: number; failed: number; skipped: number; totalSeconds: number; slowest: string | null } {
  let slowest: TimedResult | null = null;
  let sum = 0;
  for (const r of results) {
    sum += r.seconds;
    if (slowest === null || r.seconds > slowest.seconds) slowest = r;
  }
  const passed = results.filter((r) => r.ok).length;
  return {
    passed,
    failed: results.length - passed,
    skipped: totalStages - results.length,
    totalSeconds: Math.round(sum * 10) / 10,
    slowest: slowest?.name ?? null,
  };
}

// ============================================================
// Self-check – run:  npm run solution -- 11 01
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
