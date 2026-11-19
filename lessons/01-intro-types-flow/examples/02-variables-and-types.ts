// שיעור 1 – דוגמה 2: משתנים וטיפוסים בסיסיים
// הרצה:  npx tsx lessons/01-intro-types-flow/examples/02-variables-and-types.ts

// ---------- let מול const ----------
const baseUrl = "https://api.example.com"; // const – לא ניתן להציב ערך חדש
let retries = 0; // let – ניתן לשנות
retries = retries + 1;
// baseUrl = "x";  // ❌ Cannot assign to 'baseUrl' because it is a constant

// ---------- טיפוסים פרימיטיביים ----------
const testName: string = "Login with valid user";
const durationMs: number = 1532.5; // אין הבדל בין int ל-float – הכול number
const isPassed: boolean = true;

console.log({ baseUrl, retries, testName, durationMs, isPassed });

// ---------- הסקת טיפוסים (Type Inference) ----------
// לא חייבים לכתוב את הטיפוס – TS מסיק אותו מהערך:
let browser = "chromium"; // TS יודע ש-browser הוא string
// browser = 42;          // ❌ Type 'number' is not assignable to type 'string'

// ---------- מערכים (Arrays) ----------
const statusCodes: number[] = [200, 201, 404, 500];
const browsers: Array<string> = ["chromium", "firefox", "webkit"]; // תחביר חלופי
statusCodes.push(204);
console.log("Status codes:", statusCodes, "count:", statusCodes.length);
console.log("First browser:", browsers[0]);

// ---------- אובייקטים (Objects) ----------
const user: { name: string; age: number; isAdmin: boolean } = {
  name: "Dana",
  age: 29,
  isAdmin: false,
};
user.age = 30; // מותר לשנות שדה (const מגן רק על ההצבה עצמה)
console.log(`${user.name} is ${user.age}, admin=${user.isAdmin}`);

// ---------- enum ----------
// קבוצה סגורה של ערכים בעלי שם – מצוין לחומרות באגים, סביבות וכו'
enum Severity {
  Low = "LOW",
  Medium = "MEDIUM",
  High = "HIGH",
  Critical = "CRITICAL",
}

enum Environment {
  Dev, // 0
  Staging, // 1
  Production, // 2
}

const bugSeverity: Severity = Severity.Critical;
console.log("Bug severity:", bugSeverity); // CRITICAL
console.log("Staging enum value:", Environment.Staging); // 1
console.log("Name of value 2:", Environment[2]); // Production

// ---------- any מול unknown ----------
let anything: any = "text";
anything = 5; // any מבטל את בדיקת הטיפוסים – להימנע!

let fromApi: unknown = JSON.parse('{"id": 7}');
// fromApi.id;  // ❌ unknown מחייב בדיקה לפני שימוש
if (typeof fromApi === "object" && fromApi !== null && "id" in fromApi) {
  console.log("id from API:", (fromApi as { id: number }).id);
}

// ---------- null ו-undefined ----------
let selectedUser: string | null = null; // אין משתמש נבחר עדיין
selectedUser = "Yossi";
let notAssigned: number | undefined;
console.log({ selectedUser, notAssigned, anything, browser });

export {}; // הופך את הקובץ למודול (משתנים לא "מתנגשים" עם קבצים אחרים)
