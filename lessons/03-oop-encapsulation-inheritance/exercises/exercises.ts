// Lesson 3 – Summary exercises
// Encapsulation and Inheritance
// Check yourself: npm run exercise -- 03 (self-check at the end of the file)

/**
 * Exercise 1 – Encapsulation: a user account
 * - email and password are stored in private fields
 * - a getter named email that returns the email
 * - a setter named email that throws an Error if the address has no "@"
 *   (the constructor must also go through the same validation)
 * - checkPassword(attempt): boolean
 * - changePassword(oldPassword, newPassword): boolean
 *     Changes it only if the old password is correct and the new one is at least 8 characters long. Returns whether it succeeded.
 */
export class Account {
  constructor(email: string, password: string) {
    throw new Error("TODO");
  }

  get email(): string {
    throw new Error("TODO");
  }

  set email(value: string) {
    throw new Error("TODO");
  }

  checkPassword(attempt: string): boolean {
    throw new Error("TODO");
  }

  changePassword(oldPassword: string, newPassword: string): boolean {
    throw new Error("TODO");
  }
}

/**
 * Exercise 2 – A protected counter
 * - a private field named count that starts at 0
 * - increment() adds 1, decrement() subtracts 1 but never goes below 0
 * - a getter named value
 */
export class SafeCounter {
  increment(): void {
    throw new Error("TODO");
  }

  decrement(): void {
    throw new Error("TODO");
  }

  get value(): number {
    throw new Error("TODO");
  }
}

/**
 * Exercise 3 – Inheritance: API clients
 * The base class ApiClient is already implemented. Complete UsersClient:
 * - extends ApiClient
 * - constructor(baseUrl: string) that calls super with baseUrl and "/users"
 * - listUrl()        => "<baseUrl>/users"
 * - byIdUrl(id)      => "<baseUrl>/users/<id>"
 * - override describe() => "UsersClient -> <baseUrl>/users"
 *   (Hint: use buildUrl and the parent's protected fields)
 */
export class ApiClient {
  constructor(
    protected baseUrl: string,
    protected resource: string,
  ) {}

  protected buildUrl(path = ""): string {
    return `${this.baseUrl}${this.resource}${path}`;
  }

  describe(): string {
    return `ApiClient -> ${this.buildUrl()}`;
  }
}

export class UsersClient /* TODO: extends ApiClient */ {
  constructor(baseUrl: string) {
    throw new Error("TODO");
  }

  listUrl(): string {
    throw new Error("TODO");
  }

  byIdUrl(id: number): string {
    throw new Error("TODO");
  }

  describe(): string {
    throw new Error("TODO");
  }
}

/**
 * Exercise 4 – Inheritance: employees in a QA team
 * - Employee: constructor(name: string, baseSalary: number)
 *     monthlyCost(): number   => baseSalary
 *     title(): string         => "Employee"
 *     card(): string          => "<name> – <title()> – <monthlyCost()>"
 * - AutomationEngineer extends Employee:
 *     constructor(name, baseSalary, toolsBudget: number)
 *     monthlyCost() => baseSalary + toolsBudget
 *     title()       => "Automation Engineer"
 * - TeamLead extends AutomationEngineer:
 *     constructor(name, baseSalary, toolsBudget, teamSize: number)
 *     monthlyCost() => AutomationEngineer's cost + 500 per team member (use super.monthlyCost())
 *     title()       => "Team Lead"
 */
export class Employee {
  constructor(name: string, baseSalary: number) {
    throw new Error("TODO");
  }

  monthlyCost(): number {
    throw new Error("TODO");
  }

  title(): string {
    throw new Error("TODO");
  }

  card(): string {
    throw new Error("TODO");
  }
}

export class AutomationEngineer extends Employee {
  constructor(name: string, baseSalary: number, toolsBudget: number) {
    super(name, baseSalary);
    throw new Error("TODO");
  }
}

export class TeamLead extends AutomationEngineer {
  constructor(name: string, baseSalary: number, toolsBudget: number, teamSize: number) {
    super(name, baseSalary, toolsBudget);
    throw new Error("TODO");
  }
}

// ============================================================
// Self-check – run:  npm run exercise -- 03
// On every line, the value left of "=> expected:" must equal the value on its right.
// (No need to change the code below this line)
// ============================================================

console.log("\n--- Exercise 1: Account ---");
try {
  const acc = new Account("dana@example.com", "Secret123");
  console.log(acc.email, "=> expected:", "dana@example.com");
  try {
    acc.email = "not-an-email";
    console.log("did not throw", "=> expected:", "an error");
  } catch (err) {
    if ((err as Error).message === "TODO") throw err;
    console.log("threw:", (err as Error).message, "=> expected:", "an error");
  }
  try {
    new Account("bad", "Secret123");
    console.log("did not throw", "=> expected:", "an error");
  } catch (err) {
    if ((err as Error).message === "TODO") throw err;
    console.log("threw:", (err as Error).message, "=> expected:", "an error");
  }
  console.log(acc.checkPassword("wrong"), "=> expected:", false);
  console.log(acc.checkPassword("Secret123"), "=> expected:", true);
  console.log(acc.changePassword("wrong", "NewSecret1"), "=> expected:", false);
  console.log(acc.changePassword("Secret123", "short"), "=> expected:", false);
  console.log(acc.changePassword("Secret123", "NewSecret1"), "=> expected:", true);
  console.log(acc.checkPassword("NewSecret1"), "=> expected:", true);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 2: SafeCounter ---");
try {
  const c = new SafeCounter();
  c.decrement(); // doesn't go below 0
  console.log(c.value, "=> expected:", 0);
  c.increment();
  c.increment();
  c.decrement();
  console.log(c.value, "=> expected:", 1);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 3: UsersClient extends ApiClient ---");
try {
  const users = new UsersClient("http://localhost:3000");
  console.log(users instanceof ApiClient, "=> expected:", true); // UsersClient must inherit from ApiClient
  console.log(users.listUrl(), "=> expected:", "http://localhost:3000/users");
  console.log(users.byIdUrl(5), "=> expected:", "http://localhost:3000/users/5");
  console.log(users.describe(), "=> expected:", "UsersClient -> http://localhost:3000/users");
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 4: Employee hierarchy ---");
try {
  const e = new Employee("Avi", 10000);
  const ae = new AutomationEngineer("Noa", 15000, 1000);
  const tl = new TeamLead("Dana", 20000, 2000, 4);
  console.log(e.card(), "=> expected:", "Avi – Employee – 10000");
  console.log(ae.card(), "=> expected:", "Noa – Automation Engineer – 16000");
  console.log(tl.card(), "=> expected:", "Dana – Team Lead – 24000");
  console.log(tl instanceof AutomationEngineer, "=> expected:", true);
  console.log(tl instanceof Employee, "=> expected:", true);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}
