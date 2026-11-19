// בדיקת סביבת העבודה: Node.js, npm, Git, VS Code ותלויות הפרויקט.
// שימוש:  npm run check-setup
// ✔ = תקין   ✘ = חובה לתקן   ○ = רשות (מומלץ)
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

const isWin = process.platform === "win32";
let failed = 0;

/** מריץ פקודה ומחזיר את השורה הראשונה של הפלט, או null אם הפקודה לא קיימת */
function version(cmd, args = ["--version"]) {
  const r = spawnSync(cmd, args, { encoding: "utf8", shell: isWin });
  if (r.error || r.status !== 0) return null;
  return (r.stdout || r.stderr).trim().split("\n")[0];
}

function check(ok, label, fix, required = true) {
  if (ok) {
    console.log(`✔ ${label}`);
  } else if (required) {
    failed++;
    console.log(`✘ ${label}\n    → ${fix}`);
  } else {
    console.log(`○ ${label}\n    → ${fix}`);
  }
}

const pkg = JSON.parse(readFileSync("package.json", "utf8"));
const minNode = Number(pkg.engines.node.match(/\d+/)[0]);
const nodeMajor = Number(process.versions.node.split(".")[0]);

console.log("בדיקת סביבת העבודה\n");
check(nodeMajor >= minNode, `Node.js ${process.version} (נדרש ${minNode} ומעלה)`, "התקינו את גרסת ה-LTS מ-https://nodejs.org – ראו INSTALL.md");

const npm = version("npm");
check(npm, `npm ${npm ?? "לא נמצא"}`, "npm מותקן יחד עם Node.js – התקינו מחדש את Node.js. ב-Windows ראו 'פתרון תקלות' ב-INSTALL.md");

const git = version("git");
check(git, git ?? "Git לא נמצא", "התקינו Git מ-https://git-scm.com (נדרש משיעור 9)");

check(
  existsSync("node_modules/.bin/tsx") || existsSync("node_modules/tsx"),
  "תלויות הפרויקט מותקנות (node_modules)",
  "הריצו בתיקיית הפרויקט:  npm install",
);

const code = version("code");
check(code, code ? `VS Code ${code}` : "הפקודה code לא נמצאה", "פתחו את VS Code והוסיפו את הפקודה code ל-PATH – ראו INSTALL.md", false);

const chrome = [
  process.env.CHROME_PATH,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
].find((p) => p && existsSync(p));
check(chrome, chrome ? "Google Chrome (לבניית המצגות)" : "Google Chrome לא נמצא", "נדרש רק כדי לבנות את קובצי ה-PDF של ההרצאות (npm run lectures)", false);

console.log(failed === 0 ? "\nהכול מוכן! נסו:  npm run exercise -- 01 01" : `\n${failed} בעיות לתיקון – ראו INSTALL.md`);
process.exit(failed === 0 ? 0 : 1);
