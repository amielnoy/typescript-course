// שיעור 1 – דוגמה 5: לולאות
// הרצה:  npx tsx lessons/01-intro-types-flow/examples/05-loops.ts

const testResults: string[] = ["passed", "passed", "failed", "skipped", "passed", "failed"];

// ---------- for קלאסי ----------
for (let i = 0; i < testResults.length; i++) {
  console.log(`Test #${i + 1}: ${testResults[i]}`);
}

// ---------- for...of – מעבר על ערכים (המומלץ למערכים) ----------
let failedCount = 0;
for (const result of testResults) {
  if (result === "failed") failedCount++;
}
console.log("Failed tests:", failedCount);

// ---------- for...in – מעבר על מפתחות של אובייקט ----------
const config = { browser: "chromium", headless: true, retries: 2 };
for (const key in config) {
  console.log(`config.${key} =`, config[key as keyof typeof config]);
}

// ---------- while – כל עוד התנאי מתקיים ----------
// דוגמה: ניסיון חוזר (retry) עד הצלחה או עד מקסימום ניסיונות
let attempt = 0;
let success = false;
const maxAttempts = 5;
while (!success && attempt < maxAttempts) {
  attempt++;
  success = attempt === 3; // מדמה הצלחה בניסיון השלישי
  console.log(`Attempt ${attempt}: ${success ? "OK" : "retrying..."}`);
}

// ---------- do...while – רץ לפחות פעם אחת ----------
let page = 0;
do {
  page++;
  console.log("Loading page", page);
} while (page < 2);

// ---------- break ו-continue ----------
for (const result of testResults) {
  if (result === "skipped") continue; // דלג על הנוכחי
  if (result === "failed") {
    console.log("First failure found – stopping (fail fast)");
    break; // צא מהלולאה
  }
  console.log("ok:", result);
}

// ---------- לולאה מקוננת: טבלת בדיקות דפדפן x מערכת הפעלה ----------
const browsers = ["chromium", "firefox"];
const systems = ["windows", "linux"];
for (const b of browsers) {
  for (const os of systems) {
    console.log(`Run suite on ${b} / ${os}`);
  }
}

export {}; // הופך את הקובץ למודול (משתנים לא "מתנגשים" עם קבצים אחרים)
