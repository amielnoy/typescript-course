// שיעור 2 – דוגמה 2: Arrow Functions ופונקציות על מערכים
// הרצה:  npx tsx lessons/02-functions-classes/examples/02-arrow-functions.ts

// ---------- תחביר ----------
// פונקציה רגילה:
function double(n: number): number {
  return n * 2;
}
// אותה פונקציה כ-arrow function:
const doubleArrow = (n: number): number => {
  return n * 2;
};
// גרסה מקוצרת – ביטוי יחיד מוחזר אוטומטית (בלי return ובלי סוגריים מסולסלים):
const doubleShort = (n: number) => n * 2;

console.log(double(2), doubleArrow(3), doubleShort(4));

// ---------- Callbacks – העברת פונקציה כפרמטר ----------
function runWithLog(name: string, action: () => void): void {
  console.log(`START ${name}`);
  action();
  console.log(`END   ${name}`);
}
runWithLog("login test", () => console.log("   ...clicking login"));

// ---------- מתודות מערך שמקבלות arrow functions ----------
interface Result {
  name: string;
  status: "passed" | "failed";
  durationMs: number;
}

const results: Result[] = [
  { name: "login", status: "passed", durationMs: 1200 },
  { name: "search", status: "failed", durationMs: 3400 },
  { name: "checkout", status: "passed", durationMs: 2100 },
  { name: "logout", status: "failed", durationMs: 500 },
];

// filter – סינון
const failedTests = results.filter((r) => r.status === "failed");
console.log("Failed tests:", failedTests);
console.log("Failed:", failedTests.map((r) => r.name));

// map – המרה של כל איבר
const names = results.map((r) => r.name.toUpperCase());
console.log("Names:", names);

// find – האיבר הראשון שעומד בתנאי
const slow = results.find((r) => r.durationMs > 3000);
console.log("First slow test:", slow?.name);

// some / every – האם יש לפחות אחד / האם כולם
console.log("Any failed?", results.some((r) => r.status === "failed"));
console.log("All under 5s?", results.every((r) => r.durationMs < 5000));

// reduce – צמצום לערך יחיד (למשל סכום)
const totalMs = results.reduce((sum, r) => sum + r.durationMs, 0);
console.log("Total duration:", totalMs, "ms");

// sort – מיון (על עותק, כדי לא לשנות את המקורי)
const bySpeed = [...results].sort((a, b) => a.durationMs - b.durationMs);
console.log("Fastest → slowest:", bySpeed.map((r) => `${r.name}(${r.durationMs})`).join(", "));

// forEach – מעבר עם פעולה
results.forEach((r, index) => console.log(`${index + 1}. ${r.name} – ${r.status}`));

// שרשור (chaining)
const failedNamesSorted = results
  .filter((r) => r.status === "failed")
  .map((r) => r.name)
  .sort();
console.log("Failed (sorted):", failedNamesSorted);

export {}; // הופך את הקובץ למודול (משתנים לא "מתנגשים" עם קבצים אחרים)
