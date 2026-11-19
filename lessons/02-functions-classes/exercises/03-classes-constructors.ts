// Lesson 2 – Topic 03: Classes, Objects and Constructors – Exercises
// ------------------------------------------------------------
// Instructions:
//   1. Complete every place that says  throw new Error("TODO")  – including the constructors.
//   2. You may add fields (properties) of your own, but don't change the existing signatures.
//   3. Check yourself: npm run exercise -- 02 03 (self-check at the end of the file)
// ------------------------------------------------------------

export type Severity = "low" | "medium" | "high";

/** A bug as it is stored inside BugTracker (Exercise 5) */
export interface TrackedBug {
  id: number;
  title: string;
  severity: Severity;
  resolved: boolean;
}

/**
 * Exercise 1 – A class with fields, a constructor and this: a test user
 * - constructor(username, password, role = "viewer") – stores all three in fields
 * - canDelete(): true only if role is "admin"
 * - toString(): "<username> (<role>)"
 *
 *   const qa = new TestUser("noa", "Secret123");
 *   qa.role          => "viewer"
 *   qa.canDelete()   => false
 *   qa.toString()    => "noa (viewer)"
 *   new TestUser("dan", "pw", "admin").canDelete()  => true
 */
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
    this.username;
    this.role;
    return `${this.username} (${this.role})`;
  }
}

/**
 * Exercise 2 – Page Object: the login page
 * The class doesn't launch a real browser – it only records in actions which actions were "performed".
 * - constructor(baseUrl) – stores baseUrl.
 *   (Try using a parameter property:  constructor(public readonly baseUrl: string) {} )
 * - actions – an array that starts empty
 * - url(): "<baseUrl>/login"
 * - fillUsername(value): adds to actions  'fill #username "<value>"'
 * - fillPassword(value): adds to actions  'fill #password "<asterisks>"'
 *       – one asterisk per character, so the password doesn't appear in the log! ("abc" => "***")
 * - clickLogin(): adds to actions  "click #login-button"
 * - login(username, password): calls (via this) the three previous methods, in order.
 *
 *   const page = new LoginPage("http://localhost:3000");
 *   page.url()               => "http://localhost:3000/login"
 *   page.login("noa", "abc");
 *   page.actions  => ['fill #username "noa"', 'fill #password "***"', "click #login-button"]
 *
 * Hint: "*".repeat(n)
 */
export class LoginPage {
  readonly baseUrl: string;
  actions: string[] = [];

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  url(): string {
    return `${this.baseUrl}/login`;
  }

  fillUsername(value: string): void {
    this.actions.push(`fill #username "${value}"`);
  }

  fillPassword(value: string): void {
    throw new Error("TODO");
  }

  clickLogin(): void {
    throw new Error("TODO");
  }

  login(username: string, password: string): void {
    throw new Error("TODO");
  }
}

/**
 * Exercise 3 – A private field and getters: tracking API response times
 * - record(ms): stores a measurement. A negative measurement is invalid – ignore it.
 * - get count: how many measurements were stored
 * - get average: the average, rounded to a whole number (Math.round). No measurements => 0
 * - get max: the highest measurement. No measurements => 0
 * - isWithinSla(slaMs): true if all measurements are less than or equal to slaMs (no measurements => true)
 *
 *   const tracker = new ResponseTimeTracker();
 *   tracker.record(120); tracker.record(300); tracker.record(-5);
 *   tracker.count            => 2
 *   tracker.average          => 210
 *   tracker.max              => 300
 *   tracker.isWithinSla(250) => false
 *
 * Note: a getter is called without parentheses – tracker.average and not tracker.average()
 */
export class ResponseTimeTracker {
  private samples: number[] = [];

  record(ms: number): void {
    throw new Error("TODO");
  }

  get count(): number {
    throw new Error("TODO");
  }

  get average(): number {
    throw new Error("TODO");
  }

  get max(): number {
    throw new Error("TODO");
  }

  isWithinSla(slaMs: number): boolean {
    throw new Error("TODO");
  }
}

/**
 * Exercise 4 – State inside an object: a retry policy
 * - constructor(maxAttempts = 3): stores maxAttempts; attempts starts at 0
 * - recordAttempt(passed): records an attempt (attempts increases by 1) and remembers whether it passed.
 *       If no more attempts are allowed (canAttempt is false) – does nothing.
 * - get canAttempt: true if there has not yet been an attempt that passed, and attempts < maxAttempts
 * - get status:
 *       "passed"     – if one of the attempts passed
 *       "exhausted"  – if all attempts were used up and none of them passed
 *       "pending"    – otherwise
 *
 *   const policy = new RetryPolicy(2);
 *   policy.status                 => "pending"
 *   policy.recordAttempt(false);  // attempts = 1
 *   policy.recordAttempt(false);  // attempts = 2
 *   policy.canAttempt             => false
 *   policy.status                 => "exhausted"
 */
export class RetryPolicy {
  readonly maxAttempts: number;
  attempts: number;

  constructor(maxAttempts: number = 3) {
    throw new Error("TODO");
  }

  recordAttempt(passed: boolean): void {
    throw new Error("TODO");
  }

  get canAttempt(): boolean {
    throw new Error("TODO");
  }

  get status(): "pending" | "passed" | "exhausted" {
    throw new Error("TODO");
  }
}

/**
 * Exercise 5 (Bonus) – A class that manages a collection of objects: BugTracker
 * Define private fields yourself: an array of TrackedBug and a counter for the next id.
 * - report(title, severity): creates a new bug (resolved = false) with a running id starting from 1,
 *       and returns its id.
 * - resolve(id): marks the bug as resolved and returns true.
 *       If there is no such bug, or it is already resolved – returns false.
 * - get openCount: how many bugs are not resolved yet
 * - openIdsBySeverity(severity): the ids of the unresolved bugs with this severity (in reporting order)
 *
 *   const tracker = new BugTracker();
 *   tracker.report("Crash on save", "high")   => 1
 *   tracker.report("Typo in footer", "low")   => 2
 *   tracker.resolve(1)                         => true
 *   tracker.resolve(1)                         => false  (already resolved)
 *   tracker.openCount                          => 1
 *
 * Hint: find / filter / map from the previous topic work just as well inside a class.
 */
export class BugTracker {
  // TODO: define the private fields here

  report(title: string, severity: Severity): number {
    throw new Error("TODO");
  }

  resolve(id: number): boolean {
    throw new Error("TODO");
  }

  get openCount(): number {
    throw new Error("TODO");
  }

  openIdsBySeverity(severity: Severity): number[] {
    throw new Error("TODO");
  }
}

// ============================================================
// Self-check – run:  npm run exercise -- 02 03
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
