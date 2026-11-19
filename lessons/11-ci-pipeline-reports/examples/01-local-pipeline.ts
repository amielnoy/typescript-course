// שיעור 11 – דוגמה 1: "Pipeline מקומי" – מה בעצם CI עושה?
// הרצה:  npx tsx lessons/11-ci-pipeline-reports/examples/01-local-pipeline.ts
//
// שרת CI (GitHub Actions / Jenkins / GitLab) עושה בדיוק את זה:
//   מריץ פקודות לפי סדר שלבים → בודק exit code של כל פקודה → עוצר בכישלון (fail fast)
//   → שומר תוצרים (artifacts) → מדווח ירוק/אדום.
// כאן נריץ את אותם שלבים של .github/workflows/ci.yml על המחשב שלכם.

import { spawnSync } from "node:child_process";

interface Stage {
  name: string;
  command: string[];
  continueOnError?: boolean;
}

const tsx = [process.execPath, "--import", "tsx"];

const stages: Stage[] = [
  { name: "Typecheck", command: [process.execPath, "node_modules/typescript/bin/tsc", "--noEmit"] },
  { name: "Solutions (smoke run)", command: [...tsx, "scripts/run-all-examples.ts", "solutions"] },
  { name: "API tests + reports", command: [...tsx, "lessons/10-ci-cd-logs-reports/examples/04-mini-runner-with-reports.ts"] },
];

const results: { name: string; ok: boolean; seconds: number }[] = [];
const pipelineStart = Date.now();

for (const stage of stages) {
  console.log(`\n▶ Stage: ${stage.name}`);
  console.log(`  $ node ${stage.command.slice(1).join(" ")}`);
  const start = Date.now();
  const r = spawnSync(stage.command[0], stage.command.slice(1), { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  const seconds = (Date.now() - start) / 1000;
  const ok = r.status === 0;
  results.push({ name: stage.name, ok, seconds });

  const tail = (r.stdout + r.stderr).trim().split("\n").slice(-3).join("\n    ");
  console.log(`    ${tail}`);
  console.log(`  ${ok ? "✅ passed" : `❌ failed (exit code ${r.status})`} in ${seconds.toFixed(1)}s`);

  if (!ok && !stage.continueOnError) {
    console.log("\n⛔ Fail fast: the next stages will not run");
    break;
  }
}

console.log("\n========== Pipeline summary ==========");
for (const r of results) console.log(`${r.ok ? "✅" : "❌"} ${r.name.padEnd(28)} ${r.seconds.toFixed(1)}s`);
const allOk = results.length === stages.length && results.every((r) => r.ok);
console.log(`Total: ${((Date.now() - pipelineStart) / 1000).toFixed(1)}s → ${allOk ? "PIPELINE GREEN ✅" : "PIPELINE RED ❌"}`);
console.log("Artifacts: reports/  (in CI they are uploaded with actions/upload-artifact)");
process.exit(allOk ? 0 : 1);
