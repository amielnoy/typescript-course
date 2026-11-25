// חזרה למבחן – דוגמה 1: טיפוסים, זרימה, מערכים ופונקציות (שיעורים 1–2)
// הרצה:  npx tsx review/examples/01-basics.ts

// ---------- טיפוסים והסקה ----------
const env = "staging"; // הטיפוס: "staging" (literal) – const לא משתנה
let retries = 3; // הטיפוס: number
let status: "passed" | "failed" = "passed"; // union של literals
const data: unknown = JSON.parse('{"id":7}'); // unknown – חייבים לבדוק לפני שימוש
if (typeof data === "object" && data !== null && "id" in data) {
  console.log("id:", data.id);
}
console.log(typeof env, typeof retries, status);
retries++;
status = "failed";

// ---------- || מול ??, truthy/falsy, לולאה עם continue ----------
const code: number = 0;
console.log(code || 200, code ?? 200); // || מחליף כל falsy (גם 0), ?? רק null/undefined
console.log(Boolean(""), Boolean("0"));
for (const browser of ["chrome", "firefox", "webkit"]) {
  if (browser === "firefox") continue;
  console.log("run on", browser);
}

// ---------- מתודות מערך ----------
const durations = [120, 80, 300, 45];
const slow = durations.filter((d) => d > 100);
const total = durations.reduce((sum, d) => sum + d, 0);
console.log(slow, total, Math.round(total / durations.length));
console.log(durations.map((d) => `${d}ms`).join(" | "));
console.log(durations.find((d) => d < 50), durations.some((d) => d > 250));

// ---------- פונקציות: ערך ברירת מחדל, פרמטר אופציונלי, arrow ----------
function login(user: string, password = "1234", remember?: boolean): string {
  return `${user}:${password}:${remember ?? false}`;
}
const greet = (name: string): string => `Hello ${name}`;
console.log(login("dana"));
console.log(login("dana", undefined, true)); // undefined => ערך ברירת המחדל
console.log(greet("QA"));

export {};
