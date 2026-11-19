// שיעור 2 – דוגמה 3: מבוא ל-OOP – מחלקות (classes), אובייקטים ובנאים (constructors)
// הרצה:  npx tsx lessons/02-functions-classes/examples/03-classes-constructors.ts
//
// מחלקה = "תבנית" (שרטוט). אובייקט (מופע / instance) = משהו שנוצר מהתבנית עם new.

class TestCase {
  // שדות (properties)
  id: string;
  title: string;
  steps: string[];
  status: "not-run" | "passed" | "failed";

  // בנאי – רץ פעם אחת כשיוצרים אובייקט עם new
  constructor(id: string, title: string) {
    this.id = id; // this = האובייקט הנוכחי
    this.title = title;
    this.steps = [];
    this.status = "not-run";
  }

  // מתודות (methods) – פעולות שהאובייקט יודע לעשות
  addStep(step: string): void {
    this.steps.push(step);
  }

  markPassed(): void {
    this.status = "passed";
  }

  markFailed(): void {
    this.status = "failed";
  }

  summary(): string {
    return `${this.id} | ${this.title} | ${this.steps.length} steps | ${this.status}`;
  }
}

// יצירת אובייקטים
const loginTest = new TestCase("TC-001", "Login with valid credentials");
loginTest.addStep("Open /login");
loginTest.addStep("Type username and password");
loginTest.addStep("Click Login");
loginTest.markPassed();

const logoutTest = new TestCase("TC-002", "Logout");
logoutTest.addStep("Click Logout");
logoutTest.markFailed();

console.log(loginTest.summary());
console.log(logoutTest.summary());

// ---------- Parameter properties – קיצור דרך נפוץ ב-TypeScript ----------
// הוספת public/private/readonly לפרמטר בבנאי יוצרת ומאתחלת את השדה אוטומטית
class ApiClient {
  constructor(
    public baseUrl: string,
    public timeoutMs: number = 5000,
  ) {}

  url(path: string): string {
    return `${this.baseUrl}${path}`;
  }
}

const client = new ApiClient("http://localhost:3000");
console.log(client.url("/users"), "timeout:", client.timeoutMs);

// ---------- כל אובייקט עצמאי ----------
const a = new TestCase("TC-A", "A");
const b = new TestCase("TC-B", "B");
a.markPassed();
console.log(a.status, b.status); // passed not-run

// ---------- מחלקה עם שדה מחושב ----------
class TestRun {
  private results: boolean[] = []; // אתחול ישירות בשדה

  record(passed: boolean): void {
    this.results.push(passed);
  }

  get passRate(): number {
    if (this.results.length === 0) return 0;
    return Math.round((this.results.filter((r) => r).length / this.results.length) * 100);
  }
}

const run = new TestRun();
[true, true, false, true].forEach((r) => run.record(r));
console.log("Run pass rate:", run.passRate, "%");

export {}; // הופך את הקובץ למודול (משתנים לא "מתנגשים" עם קבצים אחרים)
