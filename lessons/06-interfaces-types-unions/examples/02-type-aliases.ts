// שיעור 6 – דוגמה 2: Type Aliases – שמות לטיפוסים
// הרצה:  npx tsx lessons/06-interfaces-types-unions/examples/02-type-aliases.ts

// ---------- שם לטיפוס פרימיטיבי – משפר קריאות ----------
type UserId = number;
type Url = string;
type Milliseconds = number;

function fetchUser(id: UserId, base: Url, timeout: Milliseconds): string {
  return `GET ${base}/users/${id} (timeout ${timeout}ms)`;
}
console.log(fetchUser(7, "http://localhost:3000", 5000));

// ---------- type לאובייקט (כמו interface) ----------
type Point = { x: number; y: number };
const click: Point = { x: 120, y: 340 };
console.log("Click at", click);

// ---------- type לפונקציה ----------
type Assertion = (actual: unknown, expected: unknown) => boolean;
const strictEquals: Assertion = (a, e) => a === e;
console.log("strictEquals(1, 1):", strictEquals(1, 1));

// ---------- Literal types – רק ערכים מסוימים מותרים ----------
type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
type Browser = "chromium" | "firefox" | "webkit";

function request(method: HttpMethod, path: string): string {
  return `${method} ${path}`;
}
console.log(request("POST", "/users"));
// request("FETCH", "/users");  // ❌ "FETCH" אינו HttpMethod – טעות כתיב נתפסת מיד!

// ---------- Intersection (&) – שילוב טיפוסים ----------
type WithTimestamps = { createdAt: string; updatedAt: string };
type Bug = { id: number; title: string };
type StoredBug = Bug & WithTimestamps;

const stored: StoredBug = {
  id: 1,
  title: "Broken link",
  createdAt: "2026-11-01",
  updatedAt: "2026-11-02",
};
console.log("Stored bug:", stored);

// ---------- Tuple – מערך באורך וטיפוסים קבועים ----------
type StatusLine = [code: number, text: string];
const ok: StatusLine = [200, "OK"];
const [code, text] = ok;
console.log(`Status ${code} ${text}`);

// ---------- Utility types מובנים ----------
interface TestCase {
  id: string;
  title: string;
  steps: string[];
  owner: string;
}
type TestCaseDraft = Partial<TestCase>; // כל השדות אופציונליים
type TestCasePreview = Pick<TestCase, "id" | "title">; // רק חלק מהשדות
type TestCaseWithoutOwner = Omit<TestCase, "owner">; // בלי שדה מסוים
type FrozenTestCase = Readonly<TestCase>; // הכול readonly
type ResultsByBrowser = Record<Browser, number>; // מילון עם מפתחות ידועים

const draft: TestCaseDraft = { title: "WIP" };
const preview: TestCasePreview = { id: "TC-1", title: "Login" };
const noOwner: TestCaseWithoutOwner = { id: "TC-2", title: "Logout", steps: [] };
const frozen: FrozenTestCase = { id: "TC-3", title: "x", steps: [], owner: "dana" };
const results: ResultsByBrowser = { chromium: 40, firefox: 38, webkit: 37 };
console.log({ draft, preview, noOwner, frozen, results });

export {}; // הופך את הקובץ למודול (משתנים לא "מתנגשים" עם קבצים אחרים)
