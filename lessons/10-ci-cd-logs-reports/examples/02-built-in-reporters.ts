// שיעור 10 – דוגמה 2: Reporters – אותן בדיקות, פורמטים שונים של דוחות
// הרצה:  npx tsx lessons/10-ci-cd-logs-reports/examples/02-built-in-reporters.ts
//
// node:test כולל reporters מובנים:
//   spec  – קריא לבני אדם (טרמינל)
//   tap   – פורמט טקסט סטנדרטי
//   junit – XML שכל מערכת CI יודעת להציג (GitHub, Jenkins, Azure DevOps, GitLab)
// אפשר להפעיל כמה reporters בבת אחת – כל אחד ליעד אחר (מסך / קובץ).
// (Playwright עושה בדיוק את אותו הדבר עם reporter: [['list'], ['html'], ['junit'], ['allure-playwright']])

import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync } from "node:fs";

mkdirSync("reports", { recursive: true });
const testFile = "lessons/10-ci-cd-logs-reports/examples/sample-tests/users-api.test.ts";

const result = spawnSync(
  process.execPath,
  [
    "--import",
    "tsx",
    "--test",
    "--test-reporter=spec",
    "--test-reporter-destination=stdout",
    "--test-reporter=junit",
    "--test-reporter-destination=reports/junit-sample.xml",
    testFile,
  ],
  { encoding: "utf8" },
);

console.log("----- spec reporter (stdout) -----");
console.log(result.stdout);
console.log(`exit code: ${result.status}  (0 = all passed, otherwise CI marks the job as failed ❌)`);

console.log("\n----- junit reporter (reports/junit-sample.xml) – first lines -----");
console.log(readFileSync("reports/junit-sample.xml", "utf8").split("\n").slice(0, 12).join("\n"));

process.exit(result.status ?? 1);
