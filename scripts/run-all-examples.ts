// מריץ את כל קבצי הדוגמאות (examples) בכל השיעורים – משמש גם כ-"smoke test" ב-CI.
// עם הפרמטר solutions – מריץ את כל קובצי הפתרונות (TypeScript בלבד) ומוודא שאף אחד מהם לא נכשל.
import { readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const lessonsDir = "lessons";
const folder = process.argv[2] === "solutions" ? "solutions" : "examples";
let failed = 0;
let ran = 0;

for (const lesson of readdirSync(lessonsDir).sort()) {
  const examplesDir = join(lessonsDir, lesson, folder);
  if (!existsSync(examplesDir)) continue;

  for (const file of readdirSync(examplesDir).sort()) {
    if (file.startsWith("_")) continue; // קובצי עזר
    const full = join(examplesDir, file);
    let cmd: string;
    let args: string[];
    if (file.endsWith(".ts")) {
      cmd = process.execPath;
      args = ["--import", "tsx", full];
    } else if (folder === "examples" && file.endsWith(".sh") && process.platform !== "win32") {
      cmd = "bash";
      args = [full];
    } else {
      continue;
    }

    ran++;
    const r = spawnSync(cmd, args, { encoding: "utf8", timeout: 30_000 });
    // בפתרונות – "✋" בפלט אומר שאחת הבדיקות העצמיות זרקה שגיאה
    if (r.status === 0 && !(folder === "solutions" && r.stdout.includes("✋"))) {
      console.log(`✔ ${full}`);
    } else {
      failed++;
      console.log(`✘ ${full}\n${r.stdout}\n${r.stderr}`);
    }
  }
}

console.log(`\n${ran - failed}/${ran} ${folder} ran successfully`);
process.exit(failed === 0 ? 0 : 1);
