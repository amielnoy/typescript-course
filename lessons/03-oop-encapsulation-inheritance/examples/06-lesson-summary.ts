// שיעור 3 – דוגמה 6: שאלת הסיכום (15:40–16:00)
// הרצה:  npx tsx lessons/03-oop-encapsulation-inheritance/examples/06-lesson-summary.ts
//
// שאלה אחת שמשלבת את כל נושאי השיעור: static, שדה #, getter, readonly, protected, extends ו-override.

class BaseCheck {
  static created = 0; // static – מונה אחד לכל המחלקה
  #attempts = 0; // # – פרטי באמת, גם בזמן ריצה

  constructor(readonly name: string) {
    BaseCheck.created++;
  }

  get attempts(): number {
    return this.#attempts; // getter בלי setter – מבחוץ אפשר רק לקרוא
  }

  run(): string {
    this.#attempts++;
    return `${this.name}: ${this.result()}`; // Template Method – result() של האובייקט האמיתי
  }

  protected result(): string {
    return "OK";
  }
}

class FlakyCheck extends BaseCheck {
  protected override result(): string {
    return this.attempts < 2 ? "RETRY" : "OK"; // ניסיון ראשון נכשל, השני עובר
  }
}

const api = new BaseCheck("api");
const ui = new FlakyCheck("ui");
console.log(api.run()); // api: OK
console.log(ui.run()); // ui: RETRY
console.log(ui.run()); // ui: OK
console.log(ui.attempts, api.attempts, BaseCheck.created); // 2 1 2

export {}; // הופך את הקובץ למודול (משתנים לא "מתנגשים" עם קבצים אחרים)
