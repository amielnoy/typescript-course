// Lesson 2 – Topic 03: Classes, Objects and Constructors – Solutions
export type Severity = "low" | "medium" | "high";

export interface TrackedBug {
  id: number;
  title: string;
  severity: Severity;
  resolved: boolean;
}

export class TestUser {
  username: string;
  password: string;
  role: "admin" | "viewer";

  constructor(username: string, password: string, role: "admin" | "viewer" = "viewer") {
    this.username = username;
    this.password = password;
    this.role = role;
  }

  canDelete(): boolean {
    return this.role === "admin";
  }

  toString(): string {
    return `${this.username} (${this.role})`;
  }
}

export class LoginPage {
  actions: string[] = [];

  // parameter property – creates and initializes the baseUrl field automatically
  constructor(public readonly baseUrl: string) {}

  url(): string {
    return `${this.baseUrl}/login`;
  }

  fillUsername(value: string): void {
    this.actions.push(`fill #username "${value}"`);
  }

  fillPassword(value: string): void {
    this.actions.push(`fill #password "${"*".repeat(value.length)}"`);
  }

  clickLogin(): void {
    this.actions.push("click #login-button");
  }

  // A method that uses other methods of the same object via this
  login(username: string, password: string): void {
    this.fillUsername(username);
    this.fillPassword(password);
    this.clickLogin();
  }
}

export class ResponseTimeTracker {
  private samples: number[] = [];

  record(ms: number): void {
    if (ms < 0) return;
    this.samples.push(ms);
  }

  get count(): number {
    return this.samples.length;
  }

  get average(): number {
    if (this.samples.length === 0) return 0;
    const total = this.samples.reduce((sum, ms) => sum + ms, 0);
    return Math.round(total / this.samples.length);
  }

  get max(): number {
    return this.samples.reduce((max, ms) => (ms > max ? ms : max), 0);
  }

  isWithinSla(slaMs: number): boolean {
    return this.samples.every((ms) => ms <= slaMs);
  }
}

export class RetryPolicy {
  attempts = 0;
  private passed = false;

  constructor(public readonly maxAttempts: number = 3) {}

  recordAttempt(passed: boolean): void {
    if (!this.canAttempt) return;
    this.attempts++;
    if (passed) this.passed = true;
  }

  get canAttempt(): boolean {
    return !this.passed && this.attempts < this.maxAttempts;
  }

  get status(): "pending" | "passed" | "exhausted" {
    if (this.passed) return "passed";
    if (this.attempts >= this.maxAttempts) return "exhausted";
    return "pending";
  }
}

export class BugTracker {
  private bugs: TrackedBug[] = [];
  private nextId = 1;

  report(title: string, severity: Severity): number {
    const id = this.nextId++;
    this.bugs.push({ id, title, severity, resolved: false });
    return id;
  }

  resolve(id: number): boolean {
    const bug = this.bugs.find((b) => b.id === id);
    if (!bug || bug.resolved) return false;
    bug.resolved = true;
    return true;
  }

  get openCount(): number {
    return this.bugs.filter((b) => !b.resolved).length;
  }

  openIdsBySeverity(severity: Severity): number[] {
    return this.bugs.filter((b) => !b.resolved && b.severity === severity).map((b) => b.id);
  }
}

// ============================================================
// Self-check – run:  npm run solution -- 02 03
// On every line, the value left of "=> expected:" must equal the value on its right.
// (No need to change the code below this line)
// ============================================================

console.log("\n--- Exercise 1: TestUser ---");
try {
  const qa = new TestUser("noa", "Secret123");
  console.log(qa.username, "=> expected:", "noa");
  console.log(qa.password, "=> expected:", "Secret123");
  console.log(qa.role, "=> expected:", "viewer");
  console.log(qa.canDelete(), "=> expected:", false);
  console.log(qa.toString(), "=> expected:", "noa (viewer)");

  const admin = new TestUser("dan", "pw", "admin");
  console.log(admin.canDelete(), "=> expected:", true);
  console.log(admin.toString(), "=> expected:", "dan (admin)");
  // Each object has its own fields
  console.log(qa.role, "=> expected:", "viewer");
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 2: LoginPage ---");
try {
  const page = new LoginPage("http://localhost:3000");
  console.log(page.baseUrl, "=> expected:", "http://localhost:3000");
  console.log(page.url(), "=> expected:", "http://localhost:3000/login");
  console.log(page.actions, "=> expected:", []);

  page.fillUsername("noa");
  console.log(page.actions, "=> expected:", ['fill #username "noa"']);

  const other = new LoginPage("https://staging.example.com");
  console.log(other.url(), "=> expected:", "https://staging.example.com/login");
  other.login("dan", "abc");
  console.log(other.actions, "=> expected:", ['fill #username "dan"', 'fill #password "***"', "click #login-button"]);
  // Each page has its own actions array
  console.log(page.actions, "=> expected:", ['fill #username "noa"']);

  page.fillPassword("Secret123");
  page.clickLogin();
  console.log(page.actions, "=> expected:", ['fill #username "noa"', 'fill #password "*********"', "click #login-button"]);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 3: ResponseTimeTracker ---");
try {
  const tracker = new ResponseTimeTracker();
  console.log(tracker.count, "=> expected:", 0);
  console.log(tracker.average, "=> expected:", 0);
  console.log(tracker.max, "=> expected:", 0);
  console.log(tracker.isWithinSla(100), "=> expected:", true);

  tracker.record(120);
  tracker.record(300);
  tracker.record(-5); // invalid measurement – ignored
  console.log(tracker.count, "=> expected:", 2);
  console.log(tracker.average, "=> expected:", 210);
  console.log(tracker.max, "=> expected:", 300);
  console.log(tracker.isWithinSla(250), "=> expected:", false);
  console.log(tracker.isWithinSla(300), "=> expected:", true);

  tracker.record(101);
  console.log(tracker.average, "=> expected:", 174); // (120 + 300 + 101) / 3 = 173.67
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 4: RetryPolicy ---");
try {
  const policy = new RetryPolicy(2);
  console.log(policy.maxAttempts, "=> expected:", 2);
  console.log(policy.attempts, "=> expected:", 0);
  console.log(policy.canAttempt, "=> expected:", true);
  console.log(policy.status, "=> expected:", "pending");

  policy.recordAttempt(false);
  console.log(policy.attempts, "=> expected:", 1);
  console.log(policy.status, "=> expected:", "pending");
  policy.recordAttempt(false);
  console.log(policy.canAttempt, "=> expected:", false);
  console.log(policy.status, "=> expected:", "exhausted");
  policy.recordAttempt(true); // can no longer retry – changes nothing
  console.log(policy.attempts, "=> expected:", 2);
  console.log(policy.status, "=> expected:", "exhausted");

  const flaky = new RetryPolicy();
  console.log(flaky.maxAttempts, "=> expected:", 3);
  flaky.recordAttempt(false);
  flaky.recordAttempt(true);
  console.log(flaky.status, "=> expected:", "passed");
  console.log(flaky.canAttempt, "=> expected:", false);
  flaky.recordAttempt(false); // after a success – not recorded
  console.log(flaky.attempts, "=> expected:", 2);
  console.log(flaky.status, "=> expected:", "passed");
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 5 (Bonus): BugTracker ---");
try {
  const tracker = new BugTracker();
  console.log(tracker.openCount, "=> expected:", 0);
  console.log(tracker.report("Crash on save", "high"), "=> expected:", 1);
  console.log(tracker.report("Typo in footer", "low"), "=> expected:", 2);
  console.log(tracker.report("Slow search", "high"), "=> expected:", 3);
  console.log(tracker.openCount, "=> expected:", 3);
  console.log(tracker.openIdsBySeverity("high"), "=> expected:", [1, 3]);
  console.log(tracker.openIdsBySeverity("medium"), "=> expected:", []);

  console.log(tracker.resolve(1), "=> expected:", true);
  console.log(tracker.resolve(1), "=> expected:", false);
  console.log(tracker.resolve(99), "=> expected:", false);
  console.log(tracker.openCount, "=> expected:", 2);
  console.log(tracker.openIdsBySeverity("high"), "=> expected:", [3]);

  // Each tracker has its own id counter
  const another = new BugTracker();
  console.log(another.report("Independent", "medium"), "=> expected:", 1);
  console.log(tracker.openCount, "=> expected:", 2);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}
