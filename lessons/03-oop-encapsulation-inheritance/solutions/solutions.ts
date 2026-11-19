// Lesson 3 – Summary solutions

export class Account {
  private _email = "";
  private password: string;

  constructor(email: string, password: string) {
    this.email = email; // goes through the setter => validation
    this.password = password;
  }

  get email(): string {
    return this._email;
  }

  set email(value: string) {
    if (!value.includes("@")) {
      throw new Error(`Invalid email: ${value}`);
    }
    this._email = value;
  }

  checkPassword(attempt: string): boolean {
    return attempt === this.password;
  }

  changePassword(oldPassword: string, newPassword: string): boolean {
    if (!this.checkPassword(oldPassword) || newPassword.length < 8) {
      return false;
    }
    this.password = newPassword;
    return true;
  }
}

export class SafeCounter {
  private count = 0;

  increment(): void {
    this.count++;
  }

  decrement(): void {
    if (this.count > 0) this.count--;
  }

  get value(): number {
    return this.count;
  }
}

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

export class UsersClient extends ApiClient {
  constructor(baseUrl: string) {
    super(baseUrl, "/users");
  }

  listUrl(): string {
    return this.buildUrl();
  }

  byIdUrl(id: number): string {
    return this.buildUrl(`/${id}`);
  }

  override describe(): string {
    return `UsersClient -> ${this.buildUrl()}`;
  }
}

export class Employee {
  constructor(
    protected name: string,
    protected baseSalary: number,
  ) {}

  monthlyCost(): number {
    return this.baseSalary;
  }

  title(): string {
    return "Employee";
  }

  card(): string {
    return `${this.name} – ${this.title()} – ${this.monthlyCost()}`;
  }
}

export class AutomationEngineer extends Employee {
  constructor(
    name: string,
    baseSalary: number,
    protected toolsBudget: number,
  ) {
    super(name, baseSalary);
  }

  override monthlyCost(): number {
    return this.baseSalary + this.toolsBudget;
  }

  override title(): string {
    return "Automation Engineer";
  }
}

export class TeamLead extends AutomationEngineer {
  constructor(
    name: string,
    baseSalary: number,
    toolsBudget: number,
    private teamSize: number,
  ) {
    super(name, baseSalary, toolsBudget);
  }

  override monthlyCost(): number {
    return super.monthlyCost() + 500 * this.teamSize;
  }

  override title(): string {
    return "Team Lead";
  }
}

// ============================================================
// Self-check – run:  npm run solution -- 03
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
