// שיעור 1 – דוגמה 3: אופרטורים
// הרצה:  npx tsx lessons/01-intro-types-flow/examples/03-operators.ts

// ---------- אופרטורים אריתמטיים ----------
const passed = 47;
const total = 50;
const failed = total - passed;
const passRate = (passed / total) * 100;
console.log({ failed, passRate, remainder: 17 % 5, power: 2 ** 10 });

let counter = 0;
counter++; // 1
counter += 5; // 6
console.log("counter:", counter);

// ---------- השוואה: תמיד === ולא == ----------
const expected: number = 200;
const actual: number = 404;
console.log("expected === 200 ->", expected === 200); // true
console.log("expected !== actual ->", expected !== actual); // true
// ב-JS הישן, "5" == 5 מחזיר true (המרה אוטומטית). ב-TS הקומפיילר יתריע על כך.
// השתמשו רק ב-=== וב-!==.

const responseTime = 850;
console.log("fast response?", responseTime < 1000);

// ---------- אופרטורים לוגיים ----------
const isLoggedIn = true;
const hasPermission = false;
console.log("AND:", isLoggedIn && hasPermission); // false
console.log("OR :", isLoggedIn || hasPermission); // true
console.log("NOT:", !isLoggedIn); // false

// ---------- אופרטור טרנרי (תנאי בשורה אחת) ----------
const status = passRate >= 90 ? "PASS" : "FAIL";
console.log("Suite status:", status);

// ---------- ?? (Nullish coalescing) – ערך ברירת מחדל ----------
const envTimeout: number | undefined = undefined;
const timeout = envTimeout ?? 30_000; // אם undefined/null -> 30000
console.log("timeout:", timeout);
// ההבדל מ-||:  || מחליף כל ערך "שקרי" (גם 0), ?? מחליף רק null/undefined
const zeroRetries: number = 0;
console.log("0 || 3 =", zeroRetries || 3, " | 0 ?? 3 =", zeroRetries ?? 3);

// ---------- ?. (Optional chaining) – גישה בטוחה ----------
const response: { data?: { user?: { name: string } } } = { data: {} };
console.log("user name:", response.data?.user?.name); // undefined במקום קריסה

// ---------- Template literals ----------
const testId = "TC-042";
console.log(`Test ${testId} finished in ${responseTime}ms with status ${status}`);

// ---------- typeof ----------
console.log(typeof "abc", typeof 42, typeof true, typeof {}, typeof undefined);

export {}; // הופך את הקובץ למודול (משתנים לא "מתנגשים" עם קבצים אחרים)
