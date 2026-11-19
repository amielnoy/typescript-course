// שיעור 6 – דוגמה 1: Interfaces (ממשקים)
// הרצה:  npx tsx lessons/06-interfaces-types-unions/examples/01-interfaces.ts
//
// interface מתאר את "הצורה" של אובייקט: אילו שדות ומתודות חייבים להיות בו.
// אין לו קוד ואין לו קיום בזמן ריצה – הוא קיים רק לבדיקת טיפוסים.

// ---------- interface בסיסי ----------
interface User {
  readonly id: number; // לא ניתן לשינוי אחרי יצירה
  name: string;
  email: string;
  phone?: string; // שדה אופציונלי
}

const dana: User = { id: 1, name: "Dana", email: "dana@example.com" };
// dana.id = 2;                                   // ❌ readonly
// const bad: User = { id: 2, name: "No email" }; // ❌ חסר email
console.log("User:", dana);

// ---------- הרחבת interface (extends) ----------
interface Admin extends User {
  permissions: string[];
}
const admin: Admin = { id: 2, name: "Avi", email: "avi@example.com", permissions: ["delete-users"] };
console.log("Admin permissions:", admin.permissions);

// ---------- interface לתשובת API ----------
interface ApiError {
  status: number;
  message: string;
  details?: Record<string, string>; // מילון: מפתח string -> ערך string
}
const err: ApiError = { status: 400, message: "Validation failed", details: { email: "is required" } };
console.log(`Error ${err.status}: ${err.message}`, err.details);

// ---------- interface עם מתודות + מחלקה שמממשת (implements) ----------
interface Logger {
  info(message: string): void;
  error(message: string): void;
}

class ConsoleLogger implements Logger {
  info(message: string): void {
    console.log(`ℹ️  ${message}`);
  }
  error(message: string): void {
    console.log(`❌ ${message}`);
  }
}

class MemoryLogger implements Logger {
  readonly lines: string[] = [];
  info(message: string): void {
    this.lines.push(`INFO ${message}`);
  }
  error(message: string): void {
    this.lines.push(`ERROR ${message}`);
  }
}

// הפונקציה מקבלת "כל דבר שמתנהג כמו Logger"
function runSmokeTest(logger: Logger): void {
  logger.info("Opening home page");
  logger.error("Logo not found");
}

runSmokeTest(new ConsoleLogger());
const mem = new MemoryLogger();
runSmokeTest(mem);
console.log("Memory logger captured:", mem.lines);

// ---------- מחלקה יכולה לממש כמה ממשקים ----------
interface Closable {
  close(): void;
}
class BrowserSession implements Logger, Closable {
  info(m: string) {
    console.log(`[browser] ${m}`);
  }
  error(m: string) {
    console.log(`[browser] ERROR ${m}`);
  }
  close() {
    console.log("[browser] closed");
  }
}
const session = new BrowserSession();
session.info("started");
session.close();

// ---------- Structural typing ("Duck typing") ----------
// TS בודק צורה, לא שם: אובייקט עם info+error מתאים ל-Logger גם בלי implements
const inlineLogger = { info: (m: string) => console.log("inline:", m), error: (m: string) => console.log("inline ERR:", m) };
runSmokeTest(inlineLogger);

export {}; // הופך את הקובץ למודול (משתנים לא "מתנגשים" עם קבצים אחרים)
