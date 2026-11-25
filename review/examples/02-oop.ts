// חזרה למבחן – דוגמה 2: מחלקות, Encapsulation, ירושה, פולימורפיזם, Abstract (שיעורים 2–5)
// הרצה:  npx tsx review/examples/02-oop.ts

// ---------- מחלקה, parameter properties, private ו-readonly ----------
class ApiClient {
  private requests = 0;
  constructor(public readonly baseUrl: string, private token: string) {}

  get(path: string): string {
    this.requests++;
    return `GET ${this.baseUrl}${path} (#${this.requests}, token ${this.token.length} chars)`;
  }
}
const api = new ApiClient("https://qa.dev", "secret");
console.log(api.get("/users"));
console.log(api.get("/orders"));
// api.baseUrl = "x";  ❌ read-only
// api.token;          ❌ private

// ---------- getter/setter עם ולידציה, והחזרת עותק ----------
class TestRun {
  private results: string[] = [];
  private _retries = 0;

  get retries(): number {
    return this._retries;
  }
  set retries(value: number) {
    if (value < 0) throw new Error("retries must be >= 0");
    this._retries = value;
  }
  add(name: string): void {
    this.results.push(name);
  }
  getResults(): string[] {
    return [...this.results]; // עותק – מבחוץ אי אפשר לשנות את המערך הפנימי
  }
}
const run = new TestRun();
run.add("login");
run.getResults().push("hacked");
console.log(run.getResults());
run.retries = 2;
console.log(run.retries);
try {
  run.retries = -1;
} catch (e) {
  console.log((e as Error).message);
}

// ---------- ירושה: super, סדר בנאים, override ----------
class BasePage {
  constructor(protected url: string) {
    console.log("BasePage ctor");
  }
  open(): string {
    return `open ${this.url}`;
  }
}
class CartPage extends BasePage {
  constructor() {
    super("/cart");
    console.log("CartPage ctor");
  }
  override open(): string {
    return super.open() + " + wait for items";
  }
}
console.log(new CartPage().open());

// ---------- פולימורפיזם: אותה קריאה, התנהגות לפי האובייקט ----------
class Notifier {
  send(msg: string): string {
    return `log: ${msg}`;
  }
}
class SlackNotifier extends Notifier {
  override send(msg: string): string {
    return `slack: ${msg}`;
  }
}
class MailNotifier extends Notifier {
  override send(msg: string): string {
    return `mail: ${msg}`;
  }
}
const notifiers: Notifier[] = [new Notifier(), new SlackNotifier(), new MailNotifier()];
for (const n of notifiers) console.log(n.send("build failed"));

// ---------- Abstract class + Template Method ----------
abstract class UiTest {
  run(): string {
    const steps = ["setup", this.body(), "teardown"];
    return steps.join(" → ");
  }
  protected abstract body(): string;
}
class LoginTest extends UiTest {
  protected body(): string {
    return "fill form + submit";
  }
}
console.log(new LoginTest().run());
// new UiTest();  ❌ Cannot create an instance of an abstract class.

export {};
