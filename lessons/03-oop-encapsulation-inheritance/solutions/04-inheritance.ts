// Lesson 3 – Topic 04: Inheritance – Solutions

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

export class SmokeCheck extends Check {
  readonly tag = "smoke";

  constructor(
    name: string,
    readonly owner: string,
  ) {
    super(name); // the parent stores name
  }

  override describe(): string {
    const extra = `[${this.tag}] by ${this.owner}`;
    return `${super.describe()} ${extra}`; // extend – don't replace
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

export class LimitedCounter extends Counter {
  constructor(private readonly max: number) {
    super();
  }

  override increment(): void {
    if (this.count < this.max) {
      super.increment(); // the parent knows how to count – we only add the limit
    }
  }

  isFull(): boolean {
    return this.count >= this.max;
  }
}

// ---------- Exercises ----------

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

export class LoginPage extends BasePage {
  constructor() {
    super("/login");
  }

  override title(): string {
    return "Login";
  }

  fields(): string[] {
    return ["username", "password"];
  }
}

export class ProductPage extends BasePage {
  constructor(public readonly productId: number) {
    super(`/products/${productId}`);
  }

  override title(): string {
    return `Product #${this.productId}`;
  }

  override url(baseUrl: string): string {
    return `${super.url(baseUrl)}?ref=qa`; // use the parent's version and add to it
  }
}

export class TestFailureError extends Error {
  readonly testName: string;

  constructor(testName: string, message: string) {
    super(`[${testName}] ${message}`);
    this.name = "TestFailureError";
    this.testName = testName;
  }
}

export class AssertionFailedError extends TestFailureError {
  readonly expected: unknown;
  readonly actual: unknown;

  constructor(testName: string, expected: unknown, actual: unknown) {
    // The parent already adds "[testName]" – here we only build the specific part
    super(testName, `expected ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}`);
    this.name = "AssertionFailedError";
    this.expected = expected;
    this.actual = actual;
  }
}

export function assertStatus(testName: string, expected: number, actual: number): void {
  if (expected !== actual) {
    throw new AssertionFailedError(testName, expected, actual);
  }
}

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

export class StatusCheck extends BaseCheck {
  constructor(
    name: string,
    private expectedStatus: number,
    private actualStatus: number,
  ) {
    super(name);
  }

  protected override check(): boolean {
    this.step(`expect ${this.expectedStatus} got ${this.actualStatus}`);
    return this.expectedStatus === this.actualStatus;
  }
}

export class UiCheck extends BaseCheck {
  constructor(
    name: string,
    private pagePath: string,
  ) {
    super(name);
  }

  protected override before(): void {
    super.before(); // the parent's setup first, then ours
    this.step(`open ${this.pagePath}`);
  }

  protected override check(): boolean {
    this.step(`verify ${this.pagePath}`);
    return true;
  }

  protected override after(): void {
    this.step("close browser"); // our cleanup first, then the parent's
    super.after();
  }
}

export class TestUser {
  constructor(public readonly name: string) {}

  role(): string {
    return "guest";
  }

  permissions(): string[] {
    return ["read"];
  }

  can(action: string): boolean {
    return this.permissions().includes(action); // this.permissions() – the version of the actual class
  }

  badge(): string {
    return `${this.name} [${this.role()}]`;
  }
}

export class Tester extends TestUser {
  override role(): string {
    return "tester";
  }

  override permissions(): string[] {
    return [...super.permissions(), "run-tests", "report-bugs"];
  }
}

export class Admin extends Tester {
  override role(): string {
    return "admin";
  }

  override permissions(): string[] {
    return [...super.permissions(), "manage-users"];
  }
}

export function badges(users: TestUser[]): string[] {
  return users.map((user) => user.badge());
}

// ============================================================
// Self-check – run:  npm run solution -- 03 04
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
