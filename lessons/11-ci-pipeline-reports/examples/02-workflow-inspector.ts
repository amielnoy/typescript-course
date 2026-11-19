// שיעור 11 – דוגמה 2: "קריאת" קובצי Workflow ובדיקת טעויות נפוצות
// הרצה:  npx tsx lessons/11-ci-pipeline-reports/examples/02-workflow-inspector.ts
//
// הסקריפט עובר על קובצי ה-YAML של השיעור ומציג לכל אחד:
//   מתי הוא רץ (triggers) · אילו jobs יש · באילו actions הוא משתמש · אזהרות
// (בדיקה פשוטה מבוססת טקסט – בפרויקט אמיתי משתמשים בכלי כמו actionlint)

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const dirs = ["lessons/11-ci-pipeline-reports/examples/workflows", ".github/workflows"];

function topLevelKeysUnder(yaml: string, parent: string): string[] {
  const lines = yaml.split("\n");
  const start = lines.findIndex((l) => l.startsWith(`${parent}:`));
  if (start === -1) return [];
  const keys: string[] = [];
  for (const line of lines.slice(start + 1)) {
    if (/^\S/.test(line)) break; // הגענו למפתח הבא ברמה העליונה
    const m = line.match(/^ {2}([\w-]+):/);
    if (m) keys.push(m[1]);
  }
  return keys;
}

for (const dir of dirs) {
  for (const file of readdirSync(dir).filter((f) => f.endsWith(".yml")).sort()) {
    const yaml = readFileSync(join(dir, file), "utf8");
    const name = yaml.match(/^name:\s*(.+)$/m)?.[1] ?? "(no name)";
    const triggers = topLevelKeysUnder(yaml, "on");
    const jobs = topLevelKeysUnder(yaml, "jobs");
    const actions = [...new Set([...yaml.matchAll(/uses:\s*([\w./-]+@[\w.-]+)/g)].map((m) => m[1]))];

    const warnings: string[] = [];
    if (/upload-artifact/.test(yaml) && !/if:\s*always\(\)/.test(yaml)) {
      warnings.push("upload-artifact without `if: always()` – reports will be lost exactly when tests fail");
    }
    if (/cache:\s*npm/.test(yaml) && !/npm ci/.test(yaml)) warnings.push("npm cache configured but `npm ci` is not used");
    if (/run:.*(password|token)=\w+/i.test(yaml)) warnings.push("possible hard-coded secret – use ${{ secrets.X }}");
    if (!/actions\/checkout/.test(yaml) && /npm /.test(yaml)) warnings.push("runs npm but never checks out the code");

    console.log(`\n📄 ${join(dir, file)}  –  "${name}"`);
    console.log(`   triggers: ${triggers.join(", ") || "-"}`);
    console.log(`   jobs:     ${jobs.join(", ") || "-"}`);
    console.log(`   actions:  ${actions.join(", ") || "-"}`);
    warnings.forEach((w) => console.log(`   ⚠️  ${w}`));
  }
}
