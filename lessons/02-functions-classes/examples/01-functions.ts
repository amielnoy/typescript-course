// שיעור 2 – דוגמה 1: פונקציות, פרמטרים וערכי חזרה
// הרצה:  npx tsx lessons/02-functions-classes/examples/01-functions.ts

// ---------- הצהרת פונקציה עם טיפוסים ----------
//            שם      פרמטרים עם טיפוס          טיפוס ההחזרה
function calculatePassRate(passed: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((passed / total) * 100);
}
console.log("Pass rate:", calculatePassRate(45, 50), "%");
// calculatePassRate("45", 50);  // ❌ שגיאת קומפילציה – string במקום number

// ---------- void – פונקציה שלא מחזירה ערך ----------
function logStep(step: string): void {
  console.log(`  → ${step}`);
}
logStep("Open login page");
logStep("Fill username");

// ---------- פרמטר אופציונלי (?) ----------
function formatTestName(id: string, title: string, tag?: string): string {
  return tag ? `[${id}] ${title} @${tag}` : `[${id}] ${title}`;
}
console.log(formatTestName("TC-1", "Login works"));
console.log(formatTestName("TC-2", "Logout works", "smoke"));

// ---------- ערך ברירת מחדל ----------
function buildUrl(path: string, baseUrl: string = "http://localhost:3000"): string {
  return `${baseUrl}${path}`;
}
console.log(buildUrl("/users"));
console.log(buildUrl("/users", "https://staging.example.com"));

// ---------- Rest parameters (...) – מספר לא ידוע של ארגומנטים ----------
function average(...durations: number[]): number {
  if (durations.length === 0) return 0;
  let sum = 0;
  for (const d of durations) sum += d;
  return sum / durations.length;
}
console.log("Average duration:", average(120, 340, 200), "ms");

// ---------- החזרת כמה ערכים – באמצעות אובייקט ----------
function summarize(results: boolean[]): { passed: number; failed: number } {
  let passed = 0;
  for (const r of results) if (r) passed++;
  return { passed, failed: results.length - passed };
}
const { passed, failed } = summarize([true, true, false, true]); // destructuring
console.log({ passed, failed });

// ---------- Function expression – פונקציה כערך ----------
const isSuccess = function (status: number): boolean {
  return status >= 200 && status < 300;
};
console.log("201 success?", isSuccess(201));

// ---------- טיפוס של פונקציה ----------
type Validator = (value: string) => boolean;
const notEmpty: Validator = function (value) {
  return value.trim().length > 0;
};
console.log("'  ' is not empty?", notEmpty("  "));

export {}; // הופך את הקובץ למודול (משתנים לא "מתנגשים" עם קבצים אחרים)
