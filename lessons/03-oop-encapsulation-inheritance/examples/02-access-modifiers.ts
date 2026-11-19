// שיעור 3 – דוגמה 2: Encapsulation (כימוס) – הרשאות גישה
// הרצה:  npx tsx lessons/03-oop-encapsulation-inheritance/examples/02-access-modifiers.ts
//
// כימוס = הסתרת המימוש הפנימי וחשיפת ממשק מסודר בלבד.
//   public     – נגיש מכל מקום (ברירת המחדל)
//   private    – נגיש רק בתוך המחלקה עצמה
//   protected  – נגיש בתוך המחלקה ובמחלקות שיורשות ממנה
//   readonly   – ניתן להציב רק בהגדרה או בבנאי

class UserAccount {
  public readonly username: string;
  private password: string;
  private failedLogins = 0;
  private static readonly MAX_FAILED = 3; // static – שייך למחלקה, לא לאובייקט

  constructor(username: string, password: string) {
    this.username = username;
    this.password = password;
  }

  login(attempt: string): boolean {
    if (this.isLocked()) {
      console.log(`  ${this.username}: account is LOCKED`);
      return false;
    }
    if (attempt === this.password) {
      this.failedLogins = 0;
      console.log(`  ${this.username}: login OK`);
      return true;
    }
    this.failedLogins++;
    console.log(`  ${this.username}: wrong password (${this.failedLogins}/${UserAccount.MAX_FAILED})`);
    return false;
  }

  isLocked(): boolean {
    return this.failedLogins >= UserAccount.MAX_FAILED;
  }
}

const account = new UserAccount("dana", "S3cret!");
account.login("123");
account.login("abc");
account.login("S3cret!");
account.login("x");
account.login("y");
account.login("z");
account.login("S3cret!"); // נעול

// console.log(account.password);    // ❌ Property 'password' is private
// account.failedLogins = 0;         // ❌ אי אפשר "לרמות" מבחוץ
// account.username = "other";       // ❌ readonly
console.log("username (public, readonly):", account.username);

// ---------- שדות פרטיים "אמיתיים" של JavaScript (#) ----------
// private של TS נבדק רק בזמן קומפילציה. # נאכף גם בזמן ריצה.
class Token {
  #value: string;
  constructor(value: string) {
    this.#value = value;
  }
  masked(): string {
    return this.#value.slice(0, 3) + "***";
  }
}
console.log("token:", new Token("abc123xyz").masked());

// ---------- במילים פשוטות: שלט של טלוויזיה ----------
// אפשר רק ללחוץ + / − ; אי אפשר "לכתוב" ווליום 500 ישירות
class VolumeControl {
  private level = 5; // 0..10 – אף אחד לא נוגע בו ישירות

  up(): void {
    if (this.level < 10) this.level++;
  }

  down(): void {
    if (this.level > 0) this.level--;
  }

  current(): number {
    return this.level;
  }
}

const tv = new VolumeControl();
for (let i = 0; i < 8; i++) tv.up();
console.log("volume:", tv.current()); // 10 – ולא 13
// tv.level = 500;   // ❌ Property 'level' is private

// ---------- לא להדליף מערך פרטי – מחזירים עותק ----------
class TestSuite {
  private tests: string[] = [];

  add(name: string): void {
    this.tests.push(name);
  }

  getTestsUnsafe(): string[] {
    return this.tests; // ❌ מחזיר את המערך עצמו – מי שמקבל אותו יכול לשנות אותו
  }

  getTests(): string[] {
    return [...this.tests]; // ✔ מחזיר עותק
  }
}

const suite = new TestSuite();
suite.add("login");
suite.add("checkout");

suite.getTests().push("hacked"); // משנה רק את העותק
console.log(suite.getTests()); // [ 'login', 'checkout' ]

suite.getTestsUnsafe().push("hacked"); // משנה את המערך הפרטי!
console.log(suite.getTests()); // [ 'login', 'checkout', 'hacked' ]

// ---------- מה עובר קומפילציה? ----------
class Report {
  readonly id = 1;
  private total = 0;
  title = "Nightly";
  #secret = "token-123";
}

const report = new Report();
report.title = "Daily"; // ✔ public
// report.id = 2;                 // ❌ Cannot assign to 'id' because it is a read-only property
// console.log(report.total);     // ❌ Property 'total' is private
console.log(Object.keys(report)); // [ 'id', 'total', 'title' ] – private של TS קיים בזמן ריצה, # לא

export {}; // הופך את הקובץ למודול (משתנים לא "מתנגשים" עם קבצים אחרים)
