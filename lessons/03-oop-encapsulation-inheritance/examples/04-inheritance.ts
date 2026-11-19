// שיעור 3 – דוגמה 4: Inheritance (הורשה) – extends, super, override, protected
// הרצה:  npx tsx lessons/03-oop-encapsulation-inheritance/examples/04-inheritance.ts
//
// הורשה = מחלקה "בת" מקבלת את כל השדות והמתודות של מחלקת "אב" ויכולה להוסיף/לשנות.
// יחס "is-a": ApiTest הוא סוג של BaseTest.

class BaseTest {
  protected logs: string[] = []; // protected – נגיש גם למחלקות הבנות

  constructor(public readonly name: string) {}

  protected log(message: string): void {
    const line = `[${this.name}] ${message}`;
    this.logs.push(line);
    console.log(line);
  }

  setup(): void {
    this.log("setup: preparing test data");
  }

  run(): boolean {
    this.log("run: (no steps defined)");
    return true;
  }

  teardown(): void {
    this.log("teardown: cleaning up");
  }

  // "Template method" – סדר קבוע, כשהבנות משנות רק חלקים
  execute(): boolean {
    this.setup();
    const ok = this.run();
    this.teardown();
    this.log(`result: ${ok ? "PASSED" : "FAILED"}`);
    return ok;
  }
}

class ApiTest extends BaseTest {
  constructor(
    name: string,
    private endpoint: string,
    private expectedStatus: number,
  ) {
    super(name); // חובה לקרוא לבנאי של האב לפני שימוש ב-this
  }

  override run(): boolean {
    this.log(`GET ${this.endpoint}`);
    const actualStatus = this.endpoint.includes("missing") ? 404 : 200; // הדמיה
    this.log(`expected ${this.expectedStatus}, got ${actualStatus}`);
    return actualStatus === this.expectedStatus;
  }
}

class UiTest extends BaseTest {
  constructor(
    name: string,
    private pageUrl: string,
  ) {
    super(name);
  }

  override setup(): void {
    super.setup(); // מפעיל גם את הגרסה של האב
    this.log(`setup: launching browser and opening ${this.pageUrl}`);
  }

  override run(): boolean {
    this.log("click #login, type credentials, verify welcome message");
    return true;
  }

  override teardown(): void {
    this.log("teardown: closing browser");
    super.teardown();
  }
}

const tests: BaseTest[] = [
  new ApiTest("GET users", "/users", 200),
  new ApiTest("GET missing user", "/users/missing", 200),
  new UiTest("Login UI", "/app"),
];

const results = tests.map((t) => t.execute());
console.log(`\n${results.filter(Boolean).length}/${results.length} passed`);

// instanceof – בדיקה מאיזו מחלקה נוצר האובייקט
console.log("tests[2] is UiTest?", tests[2] instanceof UiTest);
console.log("tests[2] is BaseTest?", tests[2] instanceof BaseTest);
console.log("tests[0] is UiTest?", tests[0] instanceof UiTest);

// ---------- במילים פשוטות: הבת מקבלת הכול – ומוסיפה ----------
class Test {
  constructor(public name: string) {}

  run(): string {
    return `running ${this.name}`;
  }
}

class SmokeTest extends Test {
  tag = "smoke"; // רק מה שחדש
}

const smoke = new SmokeTest("login");
console.log(smoke.run(), "|", smoke.tag); // run() הגיעה מהאב

// ---------- סדר הבנאים: מי רץ קודם? ----------
class Page {
  constructor(protected readonly path: string) {
    console.log(`1. Page: path=${path}`);
  }
}

class CheckoutPage extends Page {
  readonly title: string;

  constructor() {
    // console.log(this.title);   // ❌ 'super' must be called before accessing 'this'
    super("/checkout"); // קודם בונים את "החלק של האב"
    this.title = "Checkout";
    console.log(`2. CheckoutPage: title=${this.title}`);
  }
}

const checkout = new CheckoutPage();
console.log("is a Page?", checkout instanceof Page);

// ---------- מה יודפס? איזו מתודה רצה? ----------
class Base {
  name(): string {
    return "base";
  }

  hello(): string {
    return `hi from ${this.name()}`; // this = האובייקט האמיתי – גם אם הוא Child
  }
}

class Child extends Base {
  override name(): string {
    return "child";
  }
}

console.log(new Base().hello()); // hi from base
console.log(new Child().hello()); // hi from child
console.log(new Child() instanceof Base); // true
console.log(new Base() instanceof Child); // false

export {}; // הופך את הקובץ למודול (משתנים לא "מתנגשים" עם קבצים אחרים)
