// שיעור 3 – דוגמה 1: אובייקטים
// הרצה:  npx tsx lessons/03-oop-encapsulation-inheritance/examples/01-objects.ts

// ---------- אובייקט עם שדות ומתודה ----------
const testConfig = {
  browser: "chromium",
  headless: true,
  retries: 2,
  describe(): string {
    return `${this.browser} (headless=${this.headless}, retries=${this.retries})`;
  },
};
console.log(testConfig.describe());

// גישה לשדה: נקודה או סוגריים מרובעים
console.log(testConfig.browser, testConfig["retries"]);

// ---------- Destructuring – פירוק אובייקט למשתנים ----------
const { browser, retries } = testConfig;
console.log({ browser, retries });

// עם שינוי שם וערך ברירת מחדל
const user = { name: "Noa", email: "noa@example.com" } as { name: string; email: string; role?: string };
const { name: userName, role = "tester" } = user;
console.log(userName, role);

// ---------- Spread – העתקה ומיזוג ----------
const defaults = { timeout: 30000, retries: 0, headless: true };
const overrides = { retries: 3 };
const finalConfig = { ...defaults, ...overrides }; // השדות האחרונים גוברים
console.log("final config:", finalConfig);

// עותק "רדוד" – שינוי בעותק לא משנה את המקור
const copy = { ...defaults };
copy.timeout = 1;
console.log("original timeout unchanged:", defaults.timeout);

// ---------- מערך של אובייקטים ----------
const bugs = [
  { id: 101, title: "Login button disabled", severity: "High" },
  { id: 102, title: "Typo on homepage", severity: "Low" },
];
for (const { id, title } of bugs) {
  console.log(`BUG-${id}: ${title}`);
}

// ---------- Object.keys / values / entries ----------
console.log(Object.keys(defaults)); // ["timeout", "retries", "headless"]
console.log(Object.values(defaults));
for (const [key, value] of Object.entries(defaults)) {
  console.log(`${key} => ${value}`);
}

// ---------- JSON – המרה מ/אל טקסט (בדיוק מה ש-API מחזיר) ----------
const json = JSON.stringify(bugs[0]);
console.log("as JSON:", json);
const parsed = JSON.parse('{"id": 7, "status": "open"}') as { id: number; status: string };
console.log("parsed status:", parsed.status);

// ---------- במילים פשוטות: אובייקט = "כרטיס" עם שדות ----------
const testCase = {
  id: "TC-101",
  title: "Login with valid user",
  priority: 1,
};
console.log(testCase.title); // נקודה – כשיודעים את שם השדה
const field = "priority";
console.log(testCase[field]); // סוגריים מרובעים – כששם השדה נמצא במשתנה
testCase.priority = 2; // שינוי ערך של שדה קיים
console.log(testCase);
// testCase.owner = "dana";   // ❌ Property 'owner' does not exist – TS זוכר את הצורה של האובייקט

// ---------- אובייקטים מקוננים: קוראים תשובת API ----------
type ApiUser = {
  id: number;
  name: string;
  address?: { city: string }; // ? – שדה אופציונלי, לא לכל משתמש יש כתובת
};

type UsersResponse = { status: number; users: ApiUser[] };

const usersResponse: UsersResponse = {
  status: 200,
  users: [
    { id: 7, name: "Dana", address: { city: "Haifa" } },
    { id: 8, name: "Avi" }, // בלי כתובת
  ],
};

console.log(usersResponse.users[0].address?.city); // Haifa
console.log(usersResponse.users[1].address?.city); // undefined – ?. עוצר בשקט במקום לקרוס
for (const user of usersResponse.users) {
  console.log(`${user.name}: ${user.address?.city ?? "unknown city"}`);
}
// console.log(usersResponse.users[1].address.city); // ❌ 'address' is possibly 'undefined'

// ---------- מערך של אובייקטים: בדיקות מונחות נתונים (data-driven) ----------
const loginCases = [
  { username: "dana", password: "S3cret!", expected: true },
  { username: "dana", password: "wrong", expected: false },
  { username: "", password: "S3cret!", expected: false },
];

// "המערכת הנבדקת" – עם באג: היא בכלל לא בודקת את שם המשתמש
function fakeLogin(username: string, password: string): boolean {
  return password === "S3cret!";
}

let loginPassed = 0;
for (const { username, password, expected } of loginCases) {
  const actual = fakeLogin(username, password);
  const ok = actual === expected;
  if (ok) loginPassed++;
  const mark = ok ? "✔" : "✘";
  const call = `login("${username}", "${password}")`;
  console.log(mark, call, "->", actual); // כמה ערכים – מודפסים עם רווח ביניהם
}
console.log(`${loginPassed}/${loginCases.length} passed`);

// ---------- מה יודפס? הפניה מול עותק "רדוד" ----------
const original = { name: "Dana", tags: ["smoke"] };
const sameRef = original; // אותו אובייקט בדיוק
const shallow = { ...original }; // אובייקט חדש – אבל tags הוא אותו מערך!

sameRef.name = "Avi";
shallow.name = "Noa";
shallow.tags.push("e2e");

console.log(original.name); // Avi
console.log(original.tags); // [ 'smoke', 'e2e' ]
console.log(shallow.name); // Noa
const deeper = { ...original, tags: [...original.tags] }; // התיקון: מעתיקים גם את המערך
deeper.tags.push("regression");
console.log(original.tags); // [ 'smoke', 'e2e' ] – לא השתנה

export {}; // הופך את הקובץ למודול (משתנים לא "מתנגשים" עם קבצים אחרים)
