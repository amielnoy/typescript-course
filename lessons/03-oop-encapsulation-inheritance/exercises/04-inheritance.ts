// Lesson 3 – Topic 04: Inheritance – extends, super, override, protected – Exercises
// ------------------------------------------------------------
// Instructions:
//   1. Fill in every constructor and method in place of the line  throw new Error("TODO")
//      (in subclass constructors – keep the call to super and adjust its arguments as needed)
//   2. Classes marked "already implemented" – don't change them, just use them.
//   3. Check yourself: npm run exercise -- 03 04 (self-check at the end of the file)
// ------------------------------------------------------------

// ---------- Warm-ups (in class, ~5 minutes each) ----------
// Two short exercises we solve during the lesson, right after the examples – before Exercise 1.

/**
 * A simple check (already implemented – used by Warm-up A)
 */
export class Check {
  constructor(readonly name: string) {}

  describe(): string {
    return `Check: ${this.name}`;
  }
}

/**
 * Warm-up A – SmokeCheck extends Check: super(...) and super.describe()
 * - constructor(name, owner) – passes name to the parent with super(name); owner is a public readonly field (ready)
 * - tag is "smoke" (ready)
 * - override describe() – the parent's text + " [smoke] by <owner>"
 *     new SmokeCheck("login", "dana").describe() => "Check: login [smoke] by dana"
 * Hint: don't copy the parent's text – call super.describe()
 */
export class SmokeCheck extends Check {
  readonly tag = "smoke";

  constructor(
    name: string,
    readonly owner: string,
  ) {
    super("TODO");
    throw new Error("TODO");
  }

  override describe(): string {
    throw new Error("TODO");
  }
}

/**
 * A counter (already implemented – used by Warm-up B)
 */
export class Counter {
  protected count = 0;

  increment(): void {
    this.count++;
  }

  value(): number {
    return this.count;
  }
}

/**
 * Warm-up B – LimitedCounter extends Counter: protected + override
 * A counter that stops at a maximum (e.g. "retry at most 3 times").
 * - The constructor is ready – it stores max
 * - override increment() – increments ONLY while the count is below max (call super.increment())
 * - isFull(): boolean – true when the count reached max
 * You may read this.count here because it is protected (not private) in Counter.
 *   const c = new LimitedCounter(2);
 *   c.increment(); c.increment(); c.increment();
 *   c.value() => 2,  c.isFull() => true
 */
export class LimitedCounter extends Counter {
  constructor(private readonly max: number) {
    super();
  }

  override increment(): void {
    throw new Error("TODO");
  }

  isFull(): boolean {
    throw new Error("TODO");
  }
}

// ---------- Exercises ----------

/**
 * A base class for Page Objects (already implemented – used by Exercises 1 and 2)
 */
export class BasePage {
  constructor(protected readonly path: string) {}

  url(baseUrl: string): string {
    return `${baseUrl}${this.path}`;
  }

  title(): string {
    return "Base Page";
  }

  describe(): string {
    return `${this.title()} @ ${this.path}`;
  }
}

/**
 * Exercise 1 – LoginPage extends BasePage
 * - constructor() with no parameters – calls super with "/login"
 * - override title() => "Login"
 * - fields(): string[] => ["username", "password"]
 * You don't write url() and describe() – they are inherited!
 *   new LoginPage().describe()                     => "Login @ /login"
 *   new LoginPage().url("https://qa.example.com")  => "https://qa.example.com/login"
 * Note: the parent's describe() calls this.title() – and gets the subclass's version.
 */
export class LoginPage extends BasePage {
  constructor() {
    super("/");
    throw new Error("TODO");
  }

  override title(): string {
    throw new Error("TODO");
  }

  fields(): string[] {
    throw new Error("TODO");
  }
}

/**
 * Exercise 2 – ProductPage extends BasePage: using super.method()
 * - constructor(productId: number) – stores productId as public readonly,
 *     and calls super with "/products/<productId>"
 * - override title() => "Product #<productId>"
 * - override url(baseUrl) => the parent's url + "?ref=qa"
 *     Use super.url(baseUrl) – don't duplicate the parent's code!
 *   new ProductPage(7).url("https://shop.test") => "https://shop.test/products/7?ref=qa"
 *   new ProductPage(7).describe()               => "Product #7 @ /products/7"
 */
export class ProductPage extends BasePage {
  readonly productId: number;

  constructor(productId: number) {
    super("/");
    throw new Error("TODO");
  }

  override title(): string {
    throw new Error("TODO");
  }

  override url(baseUrl: string): string {
    throw new Error("TODO");
  }
}

/**
 * Exercise 3 – Custom error classes (inheriting from Error)
 * - TestFailureError extends Error:
 *     constructor(testName, message) => super with the message "[<testName>] <message>"
 *     this.name = "TestFailureError", and testName is stored as public readonly
 * - AssertionFailedError extends TestFailureError:
 *     constructor(testName, expected, actual) => the message: "expected <expected> but got <actual>"
 *       (the values are converted with JSON.stringify, so strings appear with quotes)
 *     this.name = "AssertionFailedError", and expected / actual are stored as public readonly
 *   new AssertionFailedError("GET users", 200, 404).message
 *     => '[GET users] expected 200 but got 404'
 * - assertStatus(testName, expected, actual): void
 *     A function that throws an AssertionFailedError if expected !== actual, and otherwise does nothing.
 * Hint: AssertionFailedError doesn't need to build "[testName]" itself – the parent already does that.
 */
export class TestFailureError extends Error {
  readonly testName: string;

  constructor(testName: string, message: string) {
    super(message);
    throw new Error("TODO");
  }
}

export class AssertionFailedError extends TestFailureError {
  readonly expected: unknown;
  readonly actual: unknown;

  constructor(testName: string, expected: unknown, actual: unknown) {
    super(testName, "");
    throw new Error("TODO");
  }
}

export function assertStatus(testName: string, expected: number, actual: number): void {
  throw new Error("TODO");
}

/**
 * A base class for checks using a Template Method (already implemented – used by Exercise 4)
 * execute() sets the order: before → check → after. Subclasses change only some of the parts.
 */
export class BaseCheck {
  protected steps: string[] = [];

  constructor(public readonly name: string) {}

  protected step(message: string): void {
    this.steps.push(message);
  }

  protected before(): void {
    this.step("before");
  }

  protected check(): boolean {
    return true;
  }

  protected after(): void {
    this.step("after");
  }

  execute(): { name: string; passed: boolean; steps: string[] } {
    this.steps = [];
    this.before();
    const passed = this.check();
    this.after();
    return { name: this.name, passed, steps: [...this.steps] };
  }
}

/**
 * Exercise 4 – Template Method: two checks that inherit from BaseCheck
 * - StatusCheck extends BaseCheck:
 *     constructor(name, expectedStatus: number, actualStatus: number)
 *     override check(): adds the step "expect <expected> got <actual>" and returns whether they are equal
 *     execute() of StatusCheck("health", 200, 200) =>
 *       { name: "health", passed: true, steps: ["before", "expect 200 got 200", "after"] }
 * - UiCheck extends BaseCheck:
 *     constructor(name, pagePath: string)
 *     override before(): first super.before(), then the step "open <pagePath>"
 *     override check():  the step "verify <pagePath>" and returns true
 *     override after():  first the step "close browser", then super.after()
 *     execute() of UiCheck("login ui", "/login") =>
 *       steps: ["before", "open /login", "verify /login", "close browser", "after"]
 * Note: step() and steps are protected – accessible in subclasses, but not from outside.
 */
export class StatusCheck extends BaseCheck {
  constructor(name: string, expectedStatus: number, actualStatus: number) {
    super(name);
    throw new Error("TODO");
  }

  protected override check(): boolean {
    throw new Error("TODO");
  }
}

export class UiCheck extends BaseCheck {
  constructor(name: string, pagePath: string) {
    super(name);
    throw new Error("TODO");
  }

  protected override before(): void {
    throw new Error("TODO");
  }

  protected override check(): boolean {
    throw new Error("TODO");
  }

  protected override after(): void {
    throw new Error("TODO");
  }
}

/**
 * Exercise 5 (Bonus) – A permission hierarchy for test users (3 levels)
 * - TestUser: constructor(name) – name is stored as public readonly
 *     role(): string         => "guest"
 *     permissions(): string[] => ["read"]
 *     can(action): boolean   => whether action is in this.permissions()
 *     badge(): string        => "<name> [<role()>]"
 * - Tester extends TestUser:
 *     role() => "tester"
 *     permissions() => the parent's permissions + "run-tests" + "report-bugs"   (use super.permissions())
 * - Admin extends Tester:
 *     role() => "admin"
 *     permissions() => Tester's permissions + "manage-users"
 * - badges(users: TestUser[]): string[] – returns the badge() of every user (polymorphism!)
 *
 * new Admin("dana").permissions() => ["read", "run-tests", "report-bugs", "manage-users"]
 * Hint: [...super.permissions(), "run-tests", "report-bugs"]
 */
export class TestUser {
  readonly name: string;

  constructor(name: string) {
    throw new Error("TODO");
  }

  role(): string {
    throw new Error("TODO");
  }

  permissions(): string[] {
    throw new Error("TODO");
  }

  can(action: string): boolean {
    throw new Error("TODO");
  }

  badge(): string {
    throw new Error("TODO");
  }
}

export class Tester extends TestUser {
  override role(): string {
    throw new Error("TODO");
  }

  override permissions(): string[] {
    throw new Error("TODO");
  }
}

export class Admin extends Tester {
  override role(): string {
    throw new Error("TODO");
  }

  override permissions(): string[] {
    throw new Error("TODO");
  }
}

export function badges(users: TestUser[]): string[] {
  throw new Error("TODO");
}

// ============================================================
// Self-check – run:  npm run exercise -- 03 04
// On every line, the value left of "=> expected:" must equal the value on its right.
// (No need to change the code below this line)
// ============================================================

console.log("\n--- Warm-up A: SmokeCheck extends Check ---");
try {
  const smoke = new SmokeCheck("login", "dana");
  console.log(smoke.describe(), "=> expected:", "Check: login [smoke] by dana");
  console.log(smoke.name, "=> expected:", "login"); // an inherited field
  console.log(smoke.tag, "=> expected:", "smoke");
  console.log(smoke instanceof Check, "=> expected:", true);
  console.log(new Check("api").describe(), "=> expected:", "Check: api"); // the parent didn't change
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Warm-up B: LimitedCounter extends Counter ---");
try {
  const c = new LimitedCounter(2);
  console.log(c.isFull(), "=> expected:", false);
  c.increment();
  c.increment();
  c.increment(); // above max – ignored
  console.log(c.value(), "=> expected:", 2); // value() is inherited
  console.log(c.isFull(), "=> expected:", true);
  console.log(c instanceof Counter, "=> expected:", true);
  const zero = new LimitedCounter(0);
  zero.increment();
  console.log(zero.value(), "=> expected:", 0);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 1: LoginPage extends BasePage ---");
try {
  const page = new LoginPage();
  console.log(page instanceof BasePage, "=> expected:", true); // LoginPage must inherit from BasePage
  console.log(page.title(), "=> expected:", "Login");
  console.log(page.fields(), "=> expected:", ["username", "password"]);
  // Inherited methods
  console.log(page.url("https://qa.example.com"), "=> expected:", "https://qa.example.com/login");
  console.log(page.describe(), "=> expected:", "Login @ /login");
  // The parent is unaffected
  console.log(new BasePage("/home").describe(), "=> expected:", "Base Page @ /home");
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 2: ProductPage – override with super.url() ---");
try {
  const page = new ProductPage(7);
  console.log(page instanceof BasePage, "=> expected:", true);
  console.log(page.productId, "=> expected:", 7);
  console.log(page.title(), "=> expected:", "Product #7");
  console.log(page.url("https://shop.test"), "=> expected:", "https://shop.test/products/7?ref=qa");
  console.log(page.describe(), "=> expected:", "Product #7 @ /products/7");
  console.log(new ProductPage(42).url(""), "=> expected:", "/products/42?ref=qa");

  // Polymorphism: an array of type BasePage, each one behaves according to its own class
  const pages: BasePage[] = [new LoginPage(), page];
  console.log(
    pages.map((p) => p.url("http://x")),
    "=> expected:",
    ["http://x/login", "http://x/products/7?ref=qa"],
  );
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 3: Custom error classes ---");
try {
  const failure = new TestFailureError("checkout", "cart is empty");
  console.log(failure instanceof Error, "=> expected:", true);
  console.log(failure.message, "=> expected:", "[checkout] cart is empty");
  console.log(failure.name, "=> expected:", "TestFailureError");
  console.log(failure.testName, "=> expected:", "checkout");

  const err = new AssertionFailedError("GET users", 200, 404);
  console.log(err instanceof TestFailureError, "=> expected:", true); // must inherit from TestFailureError
  console.log(err instanceof Error, "=> expected:", true);
  console.log(err.message, "=> expected:", "[GET users] expected 200 but got 404");
  console.log(err.name, "=> expected:", "AssertionFailedError");
  console.log(err.testName, "=> expected:", "GET users");
  console.log(err.expected, "=> expected:", 200);
  console.log(err.actual, "=> expected:", 404);
  console.log(
    new AssertionFailedError("title", "Home", "Login").message,
    "=> expected:",
    '[title] expected "Home" but got "Login"',
  );

  // Valid status – no error is thrown (the function returns undefined)
  console.log(assertStatus("health", 200, 200), "=> expected:", undefined);
  // Wrong status – an AssertionFailedError is thrown
  try {
    assertStatus("create user", 201, 500);
    console.log("did not throw", "=> expected:", "AssertionFailedError");
  } catch (thrown) {
    if ((thrown as Error).message === "TODO") throw thrown;
    console.log(thrown instanceof AssertionFailedError, "=> expected:", true);
    console.log((thrown as Error).message, "=> expected:", "[create user] expected 201 but got 500");
    console.log((thrown as AssertionFailedError).actual, "=> expected:", 500);
  }
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 4: Template method – StatusCheck and UiCheck ---");
try {
  const ok = new StatusCheck("health", 200, 200);
  console.log(ok instanceof BaseCheck, "=> expected:", true);
  console.log(ok.execute(), "=> expected:", {
    name: "health",
    passed: true,
    steps: ["before", "expect 200 got 200", "after"],
  });

  const badResult = new StatusCheck("missing user", 200, 404).execute();
  console.log(badResult.passed, "=> expected:", false);
  console.log(badResult.steps, "=> expected:", ["before", "expect 200 got 404", "after"]);

  const ui = new UiCheck("login ui", "/login");
  console.log(ui instanceof BaseCheck, "=> expected:", true);
  console.log(ui.execute(), "=> expected:", {
    name: "login ui",
    passed: true,
    steps: ["before", "open /login", "verify /login", "close browser", "after"],
  });
  // A second run starts clean (the parent's execute resets steps)
  console.log(ui.execute().steps.length, "=> expected:", 5);

  // Compile-time check only – if you uncomment the lines below, you should get a compile error:
  // ui.step("hack"); // ← compile error (step is protected)
  // ok.check();      // ← compile error (check is protected)
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 5 (Bonus): TestUser → Tester → Admin ---");
try {
  const guest = new TestUser("guest1");
  const tester = new Tester("noa");
  const admin = new Admin("dana");

  console.log(admin instanceof Tester, "=> expected:", true);
  console.log(admin instanceof TestUser, "=> expected:", true);
  console.log(tester instanceof Admin, "=> expected:", false);

  console.log(guest.name, "=> expected:", "guest1");
  console.log(guest.permissions(), "=> expected:", ["read"]);
  console.log(tester.permissions(), "=> expected:", ["read", "run-tests", "report-bugs"]);
  console.log(admin.permissions(), "=> expected:", ["read", "run-tests", "report-bugs", "manage-users"]);

  console.log(guest.can("read"), "=> expected:", true);
  console.log(guest.can("run-tests"), "=> expected:", false);
  console.log(tester.can("report-bugs"), "=> expected:", true);
  console.log(tester.can("manage-users"), "=> expected:", false);
  console.log(admin.can("run-tests"), "=> expected:", true); // came through the super chain
  console.log(admin.can("delete-prod"), "=> expected:", false);

  console.log(admin.badge(), "=> expected:", "dana [admin]");
  console.log(badges([guest, tester, admin]), "=> expected:", ["guest1 [guest]", "noa [tester]", "dana [admin]"]);
  console.log(badges([]), "=> expected:", []);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}
