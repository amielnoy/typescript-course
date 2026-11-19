// שיעור 5 – דוגמה 2: מיני-פריימוורק בדיקות עם מחלקה מופשטת ופולימורפיזם
// הרצה:  npx tsx lessons/05-oop-abstract-classes/examples/02-abstract-test-framework.ts

type Outcome = { name: string; passed: boolean; details: string };

abstract class Check {
  constructor(public readonly name: string) {}

  protected abstract verify(): boolean;
  protected abstract describeFailure(): string;

  // מתודה "סופית" – מגדירה את הזרימה הקבועה
  run(): Outcome {
    try {
      const passed = this.verify();
      return { name: this.name, passed, details: passed ? "ok" : this.describeFailure() };
    } catch (err) {
      return { name: this.name, passed: false, details: `error: ${(err as Error).message}` };
    }
  }
}

// <T> = טיפוס גנרי (נלמד בשיעור 7) – מאפשר להשוות כל סוג ערך
class EqualsCheck<T> extends Check {
  constructor(
    name: string,
    private actual: T,
    private expected: T,
  ) {
    super(name);
  }
  protected verify(): boolean {
    return this.actual === this.expected;
  }
  protected describeFailure(): string {
    return `expected ${String(this.expected)} but got ${String(this.actual)}`;
  }
}

class ContainsCheck extends Check {
  constructor(
    name: string,
    private text: string,
    private fragment: string,
  ) {
    super(name);
  }
  protected verify(): boolean {
    return this.text.includes(this.fragment);
  }
  protected describeFailure(): string {
    return `"${this.text}" does not contain "${this.fragment}"`;
  }
}

class ResponseTimeCheck extends Check {
  constructor(
    name: string,
    private ms: number,
    private maxMs: number,
  ) {
    super(name);
  }
  protected verify(): boolean {
    if (this.ms < 0) throw new Error("negative duration");
    return this.ms <= this.maxMs;
  }
  protected describeFailure(): string {
    return `${this.ms}ms > limit ${this.maxMs}ms`;
  }
}

const checks: Check[] = [
  new EqualsCheck("status is 200", 200, 200),
  new EqualsCheck("user name", "Dana", "Noa"),
  new ContainsCheck("welcome text", "Welcome, admin!", "admin"),
  new ResponseTimeCheck("GET /users is fast", 1450, 1000),
  new ResponseTimeCheck("bad timer", -1, 1000),
];

for (const outcome of checks.map((c) => c.run())) {
  console.log(`${outcome.passed ? "✔" : "✘"} ${outcome.name.padEnd(22)} ${outcome.details}`);
}

export {}; // הופך את הקובץ למודול (משתנים לא "מתנגשים" עם קבצים אחרים)
