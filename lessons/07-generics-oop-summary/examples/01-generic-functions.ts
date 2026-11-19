// שיעור 7 – דוגמה 1: Generics – פונקציות גנריות
// הרצה:  npx tsx lessons/07-generics-oop-summary/examples/01-generic-functions.ts
//
// בעיה: רוצים פונקציה אחת שעובדת עם כל טיפוס – אבל בלי לאבד את מידע הטיפוס (בלי any).
// פתרון: פרמטר-טיפוס <T> – "משתנה" שמייצג טיפוס, ונקבע בזמן הקריאה.

// ---------- בלי generics ----------
function firstAny(items: any[]): any {
  return items[0];
}
const x = firstAny([1, 2, 3]); // x הוא any – איבדנו את הטיפוס 😞

// ---------- עם generics ----------
function first<T>(items: T[]): T | undefined {
  return items[0];
}
const n = first([10, 20, 30]); // n: number | undefined  (TS הסיק T = number)
const s = first(["chromium", "firefox"]); // s: string | undefined
console.log(n, s, x);
// n.toUpperCase();   // ❌ TS יודע ש-n הוא מספר

// ציון T במפורש (בדרך כלל לא צריך – TS מסיק לבד):
const u = first<{ id: number }>([{ id: 1 }]);
console.log("first user id:", u?.id);

// ---------- כמה פרמטרי טיפוס ----------
function pair<K, V>(key: K, value: V): [K, V] {
  return [key, value];
}
const p = pair("timeout", 5000); // [string, number]
console.log(p);

// ---------- generic עם callback ----------
function mapValues<T, R>(items: T[], fn: (item: T) => R): R[] {
  const out: R[] = [];
  for (const item of items) out.push(fn(item));
  return out;
}
const lengths = mapValues(["login", "checkout"], (name) => name.length); // number[]
console.log("lengths:", lengths);

// ---------- פונקציה שימושית לבדיקות: בחירת ערך אקראי ממערך ----------
function randomItem<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}
const browser = randomItem(["chromium", "firefox", "webkit"] as const); // "chromium" | "firefox" | "webkit"
console.log("Random browser for this run:", browser);

// ---------- generic arrow function ----------
const last = <T>(items: T[]): T | undefined => items[items.length - 1];
console.log("last:", last([1, 2, 3]));

export {}; // הופך את הקובץ למודול (משתנים לא "מתנגשים" עם קבצים אחרים)
