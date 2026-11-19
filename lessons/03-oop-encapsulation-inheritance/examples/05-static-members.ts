// שיעור 3 – דוגמה 5: חברים סטטיים (static) – שייכים למחלקה ולא לאובייקט
// הרצה:  npx tsx lessons/03-oop-encapsulation-inheritance/examples/05-static-members.ts

class TestIdGenerator {
  private static counter = 0; // משותף לכל המחלקה

  static next(prefix = "TC"): string {
    TestIdGenerator.counter++;
    return `${prefix}-${String(TestIdGenerator.counter).padStart(3, "0")}`;
  }

  static reset(): void {
    TestIdGenerator.counter = 0;
  }
}

// אין צורך ב-new – קוראים ישירות דרך שם המחלקה
console.log(TestIdGenerator.next()); // TC-001
console.log(TestIdGenerator.next()); // TC-002
console.log(TestIdGenerator.next("BUG")); // BUG-003

// קבועים סטטיים – מקום מרכזי לערכים שחוזרים בבדיקות
class HttpStatus {
  static readonly OK = 200;
  static readonly CREATED = 201;
  static readonly NOT_FOUND = 404;
  static readonly SERVER_ERROR = 500;
}
console.log("Expect status", HttpStatus.CREATED, "after POST");

// Factory method סטטי – דרך נוחה ליצור אובייקטים מוכנים
class User {
  private constructor(
    public name: string,
    public role: "admin" | "tester",
  ) {}

  static admin(name = "admin"): User {
    return new User(name, "admin");
  }

  static tester(name = "tester"): User {
    return new User(name, "tester");
  }
}
// new User("x", "admin");   // ❌ הבנאי private – חייבים להשתמש ב-factory
console.log(User.admin(), User.tester("Yossi"));

// ---------- במילים פשוטות: לוח משותף מול מחברת אישית ----------
class ParallelWorker {
  static sharedLog: string[] = []; // אחד לכולם – שייך למחלקה
  ownLog: string[] = []; // לכל אובייקט יש משלו

  constructor(public name: string) {}

  write(message: string): void {
    this.ownLog.push(message);
    ParallelWorker.sharedLog.push(`${this.name}: ${message}`);
  }
}

const w1 = new ParallelWorker("worker-1");
const w2 = new ParallelWorker("worker-2");
w1.write("login passed");
w2.write("cart failed");
w1.write("search passed");
console.log(w1.ownLog); // [ 'login passed', 'search passed' ]
console.log(w2.ownLog); // [ 'cart failed' ]
console.log(ParallelWorker.sharedLog); // כל 3 ההודעות

// ---------- מה יודפס? מונה סטטי ----------
class Run {
  static count = 0;
  readonly id: number;

  constructor() {
    Run.count++;
    this.id = Run.count;
  }
}

const run1 = new Run();
new Run();
const run3 = new Run();
console.log(run1.id, run3.id, Run.count); // 1 3 3
// console.log(run1.count);   // ❌ Property 'count' does not exist on type 'Run'. Did you mean to access the static member 'Run.count' instead?

export {}; // הופך את הקובץ למודול (משתנים לא "מתנגשים" עם קבצים אחרים)
