// שיעור 5 – דוגמה 1: Abstract Classes – מחלקות מופשטות
// הרצה:  npx tsx lessons/05-oop-abstract-classes/examples/01-abstract-classes.ts
//
// מחלקה מופשטת:
//   - אי אפשר ליצור ממנה אובייקט ישירות (new BasePage ❌)
//   - יכולה להכיל קוד משותף (מתודות רגילות)
//   - יכולה להגדיר מתודות abstract – "חוזה" שכל מחלקה בת חייבת לממש
// זה בדיוק הבסיס של Page Object Model שתלמדו בהמשך הקורס.

abstract class BasePage {
  constructor(protected baseUrl: string) {}

  // כל עמוד חייב להגדיר את הנתיב שלו ואיך מוודאים שנטען
  abstract readonly path: string;
  abstract isLoaded(): boolean;

  // קוד משותף לכל העמודים
  open(): void {
    console.log(`Navigating to ${this.baseUrl}${this.path}`);
    if (!this.isLoaded()) {
      throw new Error(`${this.constructor.name} did not load`);
    }
    console.log(`  ✔ ${this.constructor.name} loaded`);
  }
}

class LoginPage extends BasePage {
  readonly path = "/login";

  isLoaded(): boolean {
    return true; // בפרויקט אמיתי: בדיקה שהשדה username מוצג
  }

  login(user: string, password: string): void {
    console.log(`  typing ${user} / ${"*".repeat(password.length)} and clicking Login`);
  }
}

class DashboardPage extends BasePage {
  readonly path = "/dashboard";

  isLoaded(): boolean {
    return true;
  }

  widgetCount(): number {
    return 4;
  }
}

class BrokenPage extends BasePage {
  readonly path = "/broken";

  isLoaded(): boolean {
    return false;
  }
}

// const p = new BasePage("x");   // ❌ Cannot create an instance of an abstract class

const base = "http://localhost:3000";
const login = new LoginPage(base);
login.open();
login.login("admin", "1234");

const dashboard = new DashboardPage(base);
dashboard.open();
console.log("  widgets:", dashboard.widgetCount());

try {
  new BrokenPage(base).open();
} catch (err) {
  console.log("  ✘", (err as Error).message);
}

// ---------- מערך מסוג המחלקה המופשטת – פולימורפיזם ----------
const pages: BasePage[] = [login, dashboard];
console.log("All paths:", pages.map((p) => p.path).join(", "));

export {}; // הופך את הקובץ למודול (משתנים לא "מתנגשים" עם קבצים אחרים)
