// שיעור 3 – דוגמה 0: תזכורת משיעור 2 (פתיחת השיעור, 09:00–09:15)
// הרצה:  npx tsx lessons/03-oop-encapsulation-inheritance/examples/00-recap-lesson-2.ts
//
// שלוש שאלות "מה יודפס?" על מה שלמדנו בשיעור 2: פונקציות, arrow functions ומתודות מערך, מחלקות.

// ---------- 1. פונקציות: ברירת מחדל ו-rest ----------
function report(
  title: string,
  status = "PASSED",
  ...tags: string[]
): string {
  return `${title}: ${status} [${tags.join(", ")}]`;
}

console.log(report("Login")); // Login: PASSED []
console.log(report("Cart", "FAILED")); // Cart: FAILED []
console.log(report("Search", undefined, "smoke", "ui")); // undefined => ערך ברירת המחדל

// ---------- 2. arrow functions ומתודות מערך ----------
const results = [
  { name: "login", passed: true, ms: 1200 },
  { name: "cart", passed: false, ms: 3400 },
  { name: "search", passed: true, ms: 800 },
];

const failed = results
  .filter((r) => !r.passed)
  .map((r) => r.name);
const totalMs = results.reduce((sum, r) => sum + r.ms, 0);
const allFast = results.every((r) => r.ms < 3000);
console.log(failed, totalMs, allFast); // [ 'cart' ] 5400 false

// ---------- 3. מחלקות: בנאי, parameter properties ו-this ----------
class TestCase {
  status = "new";

  constructor(
    public id: string,
    private priority = 3,
  ) {}

  start(): void {
    this.status = "running";
  }

  describe(): string {
    return `${this.id} (P${this.priority}) - ${this.status}`;
  }
}

const first = new TestCase("TC-1", 1);
const second = new TestCase("TC-2");
first.start();
console.log(first.describe()); // TC-1 (P1) - running
console.log(second.describe()); // TC-2 (P3) - new – לכל אובייקט שדות משלו

export {}; // הופך את הקובץ למודול (משתנים לא "מתנגשים" עם קבצים אחרים)
