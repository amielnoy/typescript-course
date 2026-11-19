// מריץ קובץ תרגיל (או פתרון) אחד – בסוף כל קובץ יש "בדיקה עצמית" שמדפיסה תוצאה מול ערך צפוי.
// שימוש:  npm run exercise -- 03       (התרגיל המסכם של שיעור 3: exercises/exercises.ts)
//          npm run exercise -- 03 02    (התרגילים של נושא 02 בשיעור 3: exercises/02-*.ts)
//          npm run exercise -- 03 hw    (שיעורי הבית של שיעור 3: exercises/homework.ts)
//          npm run exercise -- 01 hw2   (שיעורי בית נוספים, אם יש: exercises/homework2.ts)
//          npm run solution -- 03 02    (אותו דבר – על קובץ הפתרון)
import { readdirSync } from "node:fs";
import { spawnSync } from "node:child_process";

const kind = process.argv.includes("--solutions") ? "solutions" : "exercises";
const [num, subject] = process.argv.slice(2).filter((a) => !a.startsWith("--"));
if (!num) {
  console.error(`Usage: npm run ${kind === "solutions" ? "solution" : "exercise"} -- <lesson-number> [subject-number | hw]`);
  process.exit(1);
}
const prefix = num.padStart(2, "0");
const dir = readdirSync("lessons").find((d) => d.startsWith(prefix + "-"));
if (!dir) {
  console.error(`Lesson ${prefix} not found`);
  process.exit(1);
}
const folder = `lessons/${dir}/${kind}`;
// hw / homework => homework.ts,  hw2 / homework2 => homework2.ts
const homeworkMatch = subject?.match(/^(?:hw|homework)(\d*)$/);
const isHomework = homeworkMatch !== null && homeworkMatch !== undefined;
const wanted = isHomework ? `homework${homeworkMatch[1]}.` : subject ? subject.padStart(2, "0") + "-" : kind;
const file = readdirSync(folder).find((f) => f.endsWith(".ts") && f.startsWith(wanted));
if (!file) {
  const what = isHomework ? "the homework" : subject ? `subject ${subject}` : "the lesson summary";
  console.log(`No TypeScript file for ${what} in ${folder} – see the README in that folder.`);
  process.exit(0);
}
console.log(`▶ ${folder}/${file}`);
const r = spawnSync(process.execPath, ["--import", "tsx", `${folder}/${file}`], { stdio: "inherit" });
process.exit(r.status ?? 1);
