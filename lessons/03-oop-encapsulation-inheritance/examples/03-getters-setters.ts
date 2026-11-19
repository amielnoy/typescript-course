// שיעור 3 – דוגמה 3: Getters ו-Setters – שליטה וולידציה בגישה לנתונים
// הרצה:  npx tsx lessons/03-oop-encapsulation-inheritance/examples/03-getters-setters.ts

class TestConfig {
  private _timeoutMs = 30_000;
  private _browser: "chromium" | "firefox" | "webkit" = "chromium";
  private _retries = 0;

  // getter – נראה כמו שדה, אבל מריץ קוד
  get timeoutMs(): number {
    return this._timeoutMs;
  }

  // setter – מאפשר לבדוק את הערך לפני שמירה
  set timeoutMs(value: number) {
    if (value <= 0 || value > 120_000) {
      throw new RangeError(`timeout must be between 1 and 120000, got ${value}`);
    }
    this._timeoutMs = value;
  }

  get retries(): number {
    return this._retries;
  }

  set retries(value: number) {
    if (!Number.isInteger(value) || value < 0) {
      throw new RangeError("retries must be a non-negative integer");
    }
    this._retries = value;
  }

  get browser() {
    return this._browser;
  }

  set browser(value: "chromium" | "firefox" | "webkit") {
    this._browser = value;
  }

  // getter מחושב (בלי setter) – לקריאה בלבד
  get timeoutSeconds(): number {
    return this._timeoutMs / 1000;
  }
}

const config = new TestConfig();
config.timeoutMs = 10_000; // מפעיל את ה-setter
config.retries = 2;
config.browser = "firefox";
console.log(`browser=${config.browser}, timeout=${config.timeoutSeconds}s, retries=${config.retries}`);

try {
  config.timeoutMs = -5; // הולידציה תזרוק שגיאה
} catch (err) {
  console.log("Caught:", (err as Error).message);
}

try {
  config.retries = 1.5;
} catch (err) {
  console.log("Caught:", (err as Error).message);
}

// config.timeoutSeconds = 3;  // ❌ אין setter – שדה לקריאה בלבד

// ---------- במילים פשוטות: ערך אחד, שתי "תצוגות" ----------
class Timeout {
  private _ms = 5000; // הערך האמיתי נשמר פעם אחת – במילישניות

  get ms(): number {
    return this._ms;
  }

  get seconds(): number {
    return this._ms / 1000;
  }

  set seconds(value: number) {
    this._ms = value * 1000;
  }
}

const timeout = new Timeout();
console.log(timeout.seconds); // 5 – בלי סוגריים!
timeout.seconds = 2.5; // מפעיל את ה-setter
console.log(timeout.ms); // 2500

// ---------- getter בלי setter = קריאה בלבד מבחוץ ----------
class RunCounter {
  private _passed = 0;
  private _failed = 0;

  get passed(): number {
    return this._passed;
  }

  get total(): number {
    return this._passed + this._failed; // מחושב – תמיד מעודכן
  }

  recordPass(): void {
    this._passed++;
  }

  recordFail(): void {
    this._failed++;
  }
}

const counter = new RunCounter();
counter.recordPass();
counter.recordPass();
counter.recordFail();
console.log(`${counter.passed}/${counter.total}`); // 2/3
// counter.passed = 100;   // ❌ Cannot assign to 'passed' because it is a read-only property

// ---------- מה יודפס? getter + setter עם ולידציה ----------
class RetryLimit {
  private _max = 3;

  get max(): number {
    return this._max;
  }

  set max(value: number) {
    if (value < 0) throw new Error(`max must be >= 0, got ${value}`);
    this._max = value;
  }
}

const retry = new RetryLimit();
retry.max = 5;
console.log(retry.max); // 5
retry.max += 1; // קודם getter (5), אחר כך setter (6)
console.log(retry.max); // 6
try {
  retry.max = -1;
} catch (e) {
  console.log((e as Error).message); // max must be >= 0, got -1
}
console.log(retry.max); // 6 – הערך הלא חוקי לא נשמר

export {}; // הופך את הקובץ למודול (משתנים לא "מתנגשים" עם קבצים אחרים)
