// בונה את קובצי ה-PDF של ההרצאות מתוך מקורות ה-HTML שב-lectures/src.
// שימוש:  npm run lectures            (כל ההרצאות)
//          npm run lectures -- 03      (רק הרצאה 3)
//          npm run lectures -- 03 --force   (מייצא גם אם יש שקפים שגולשים – הם מסומנים באדום, לבדיקה)
// דורש Google Chrome / Chromium. נתיב אחר: CHROME_PATH=/path/to/chrome npm run lectures
// אם שקף גולש (תוכן ארוך/רחב מדי) – הבנייה נכשלת ומציינת את מספר השקף.
import { readdirSync, existsSync, mkdtempSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { pathToFileURL } from "node:url";

const SRC = "lectures/src";
const OUT = "lectures";

function findChrome() {
  const candidates = [
    process.env.CHROME_PATH,
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
  ].filter(Boolean);
  const found = candidates.find((p) => existsSync(p));
  if (!found) {
    console.error("Chrome not found. Set CHROME_PATH to your Chrome/Chromium executable.");
    process.exit(1);
  }
  return found;
}

function runChrome(chrome, args) {
  const profile = mkdtempSync(join(tmpdir(), "lectures-chrome-"));
  try {
    return spawnSync(
      chrome,
      ["--headless=new", "--disable-gpu", "--no-first-run", `--user-data-dir=${profile}`, "--virtual-time-budget=10000", ...args],
      { encoding: "utf8", maxBuffer: 64 * 1024 * 1024, timeout: 120_000 },
    );
  } finally {
    rmSync(profile, { recursive: true, force: true });
  }
}

const force = process.argv.includes("--force");
const filter = process.argv.slice(2).find((a) => !a.startsWith("--"))?.padStart(2, "0");
const sources = readdirSync(SRC)
  .filter((f) => /^\d\d-.*\.html$/.test(f))
  .filter((f) => !filter || f.startsWith(filter + "-"))
  .sort();
if (sources.length === 0) {
  console.error(`No lecture sources found in ${SRC}${filter ? ` for ${filter}` : ""}`);
  process.exit(1);
}

const chrome = findChrome();
let failed = 0;
for (const file of sources) {
  const url = pathToFileURL(resolve(SRC, file)).href;

  // 1. בדיקת גלישה: deck.js כותב את הבעיות ל-data-overflow על ה-body
  const dom = runChrome(chrome, ["--dump-dom", url]);
  const overflow = dom.stdout.match(/data-overflow="([^"]*)"/)?.[1] ?? "?";
  const slides = dom.stdout.match(/data-slides="(\d+)"/)?.[1] ?? "?";
  if (overflow === "?") {
    failed++;
    console.log(`✘ ${file}: deck.js did not run (check the <script src="deck.js"> tag)\n${dom.stderr}`);
    continue;
  }
  if (overflow) {
    failed++;
    console.log(`✘ ${file}: ${overflow.replaceAll(" | ", "\n    ")}`);
    if (!force) continue;
  }

  // 2. הדפסה ל-PDF
  const pdf = join(OUT, file.replace(/\.html$/, ".pdf"));
  const r = runChrome(chrome, ["--no-pdf-header-footer", `--print-to-pdf=${resolve(pdf)}`, url]);
  if (r.status === 0 && existsSync(pdf)) {
    console.log(`✔ ${pdf}  (${slides} slides)`);
  } else {
    failed++;
    console.log(`✘ ${file}: PDF export failed\n${r.stderr}`);
  }
}
process.exit(failed === 0 ? 0 : 1);
