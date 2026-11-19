// Lesson 3 – Topic 02: Access Modifiers (public / private / readonly / #) – Exercises
// ------------------------------------------------------------
// Instructions:
//   1. Fill in every constructor and method in place of the line  throw new Error("TODO")
//   2. Add the private fields (private or #) yourself – as described in each exercise.
//   3. Check yourself: npm run exercise -- 03 02 (self-check at the end of the file)
// ------------------------------------------------------------

// ---------- Warm-ups (in class, ~5 minutes each) ----------
// Two short exercises we solve during the lesson, right after the examples – before Exercise 1.

/**
 * Warm-up A – a step counter with a private field
 * - Add a private field count that starts at 0
 * - next(): number    – adds 1 and returns the new value
 * - current(): number – returns the value without changing it
 * - reset(): void     – back to 0
 *   const steps = new StepCounter();
 *   steps.next() => 1,  steps.next() => 2,  steps.current() => 2
 */
export class StepCounter {
  private count: number = 0;
  next(): number {
    this.count++;
    return this.count;
  }

  current(): number {
    return this.count;
  }

  reset(): void {
    this.count = 0;
  }
}

/**
 * Warm-up B – a password field: readonly + private
 * - label is public readonly – set it in the constructor
 * - Add a private field value that starts as "" (empty)
 * - type(text): void – appends text to the end of the value (like typing into the field)
 * - clear(): void    – empties the value
 * - length(): number – how many characters were typed
 * - masked(): string – one "*" per character
 *   const field = new PasswordField("Password");
 *   field.type("S3c");  field.type("ret");
 *   field.masked() => "******",  field.length() => 6
 * Hint: "*".repeat(n)
 */
export class PasswordField {
  readonly label: string;
  private value: string = "";

  constructor(label: string) {
    this.label = label;
  }

  type(text: string): void {
    this.value += text;
  }

  clear(): void {
    this.value = "";
  }

  length(): number {
    return this.value.length;
  }

  masked(): string {
    return "*".repeat(this.value.length);
  }
}

// ---------- Exercises ----------

/**
 * Exercise 1 – Bug report: readonly and a private array
 * - id and reporter are public readonly (they can't be changed after creation)
 * - title is a regular public field (the title may be updated)
 * - Add a private field named comments – an array of strings that starts out empty
 * - addComment(text): boolean
 *     Empty or whitespace-only text => don't add it, and return false.
 *     Otherwise add the text after trim() and return true.
 * - getComments(): string[]  – returns a **copy** of the array.
 *     Changing the returned array (push, etc.) must not affect the report itself.
 * - commentCount(): number
 *
 * Example:
 *   const bug = new BugReport("BUG-101", "Login button disabled", "dana");
 *   bug.addComment("  reproduced on Chrome  ")  => true
 *   bug.getComments()                            => ["reproduced on Chrome"]
 * Hint: [...this.comments] creates a copy of an array.
 */
export class BugReport {
  readonly id: string;
  readonly reporter: string;
  title: string;
  private comments: string[] = [];

  constructor(id: string, title: string, reporter: string) {
    this.id = id;
    this.title = title;
    this.reporter = reporter;
  }

  addComment(text: string): boolean {
    const trimmed = text.trim();

    if (trimmed.length === 0) {
      return false;
    }
    this.comments.push(trimmed);
    return true;
  }

  getComments(): string[] {
    return [...this.comments];
  }

  commentCount(): number {
    return this.comments.length;
  }
}

/**
 * Exercise 2 – An API token with a "truly" private field (#)
 * - Store the token in a #value field (not TS's private!)
 * - The constructor throws an Error if the token is shorter than 8 characters
 * - masked(): string – asterisks in place of every character except the last 4
 *     "abcd1234efgh" => "********efgh"
 * - authHeader(): { Authorization: string }  => { Authorization: "Bearer <token>" }
 * - matches(candidate): boolean – whether the string is identical to the token
 *
 * Why #? TS's private exists only at compile time – at runtime the field is still there,
 * and JSON.stringify(token) or Object.keys(token) would "leak" it into the log.
 * A # field doesn't show up in them at all – the checks verify this.
 * Hint: "*".repeat(n), value.slice(-4)
 */
export class ApiToken {
  #value: string;

  constructor(value: string) {
    if (value.length < 8) {
      throw new Error("Token must be at least 8 characters long");
    }
    this.#value = value;
  }

  masked(): string {
    return "*".repeat(this.#value.length - 4) + this.#value.slice(-4);
  }

  authHeader(): { Authorization: string } {
    return { Authorization: `Bearer ${this.#value}` };    
  }

  matches(candidate: string): boolean {
    return this.#value === candidate  ;
  }
}

/**
 * Exercise 3 – Test Data Pool
 * A pool of email addresses for tests – each test "takes" a user and gives it back at the end.
 * - The constructor receives an array of emails and stores a **copy** of it in a private field
 *     (changing the original array after creation does not affect the pool)
 * - Another private field that holds the emails currently in use
 * - take(): string – returns the first available email and moves it to "in use".
 *     If none are available – throws Error("Test data pool is exhausted")
 * - release(email): boolean – if the email is in use: moves it to the end of the available list and returns true.
 *     An email that wasn't taken from the pool (or was already released) => false, and nothing changes.
 * - availableCount(): number, inUseCount(): number
 */
export class TestDataPool {
  private available: string[];
  private inUse: string[] = [];

  constructor(emails: string[]) {
    this.available = [...emails];
  }

  take(): string {
    const email = this.available.shift();
    if (email === undefined) {
      throw new Error("Test data pool is exhausted");
    }
    this.inUse.push(email);
    return email;
  }

  release(email: string): boolean {
    const index = this.inUse.indexOf(email);
    if (index === -1) {
      return false;
    }
    this.inUse.splice(index, 1);
    this.available.push(email);
    return true;
  }

  availableCount(): number {
    return this.available.length;
  }

  inUseCount(): number {
    return this.inUse.length;
  }
}

/**
 * Exercise 4 – Feature Flags that can be "locked"
 * - environment is public readonly
 * - private fields: the list of enabled flags, and a locked flag (starts as false)
 * - enable(name) / disable(name) – turn a flag on/off.
 *     Enabling the same flag twice does not create a duplicate.
 *     After lock() both of them throw Error(`Flags for <environment> are locked`)
 * - isEnabled(name): boolean – a flag that was never set => false
 * - enabledFlags(): string[] – a sorted (sort) copy of the enabled flags
 * - lock(): void, isLocked(): boolean
 *
 * Example: new FeatureFlags("staging") → enable("new-checkout") → lock()
 *          → enable("dark-mode") throws "Flags for staging are locked"
 */
export class FeatureFlags {
  readonly environment: string;

  constructor(environment: string) {
    throw new Error("TODO");
  }

  enable(name: string): void {
    throw new Error("TODO");
  }

  disable(name: string): void {
    throw new Error("TODO");
  }

  isEnabled(name: string): boolean {
    throw new Error("TODO");
  }

  enabledFlags(): string[] {
    throw new Error("TODO");
  }

  lock(): void {
    throw new Error("TODO");
  }

  isLocked(): boolean {
    throw new Error("TODO");
  }
}

/**
 * Exercise 5 (Bonus) – A secret vault with an audit log
 * All internal data is stored in # fields only (there are no public fields at all):
 *   #allowed – a copy of the list of who is allowed to read secrets
 *   #secrets – the keys and values (e.g. Map<string, string>)
 *   #log     – the audit log
 * - store(key, value): void – stores/overwrites a secret
 * - reveal(key, requester): string | undefined
 *     unauthorized requester => adds "DENIED <requester> -> <key>" to the log and throws Error("Access denied")
 *     authorized requester   => adds "READ <requester> -> <key>" to the log and returns the value
 *                               (undefined if the key doesn't exist)
 * - auditLog(): string[] – a copy of the log
 * JSON.stringify(vault) must return "{}" – no secret leaks.
 */
export class SecretVault {
  constructor(allowedRequesters: string[]) {
    throw new Error("TODO");
  }

  store(key: string, value: string): void {
    throw new Error("TODO");
  }

  reveal(key: string, requester: string): string | undefined {
    throw new Error("TODO");
  }

  auditLog(): string[] {
    throw new Error("TODO");
  }
}

// ============================================================
// Self-check – run:  npm run exercise -- 03 02
// On every line, the value left of "=> expected:" must equal the value on its right.
// (No need to change the code below this line)
// ============================================================

console.log("\n--- Warm-up A: StepCounter ---");
try {
  const steps = new StepCounter();
  console.log(steps.current(), "=> expected:", 0);
  console.log(steps.next(), "=> expected:", 1);
  console.log(steps.next(), "=> expected:", 2);
  console.log(steps.current(), "=> expected:", 2);
  steps.reset();
  console.log(steps.current(), "=> expected:", 0);
  console.log(new StepCounter().next(), "=> expected:", 1); // every counter has its own count
  // steps.count = 100;  // ← compile error if you uncomment it (private)
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Warm-up B: PasswordField ---");
try {
  const field = new PasswordField("Password");
  console.log(field.label, "=> expected:", "Password");
  console.log(field.masked(), "=> expected:", "");
  field.type("S3c");
  field.type("ret");
  console.log(field.masked(), "=> expected:", "******");
  console.log(field.length(), "=> expected:", 6);
  field.clear();
  console.log(field.length(), "=> expected:", 0);
  // field.label = "x";  // ← compile error (readonly)
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 1: BugReport ---");
try {
  const bug = new BugReport("BUG-101", "Login button disabled", "dana");
  console.log(bug.id, "=> expected:", "BUG-101");
  console.log(bug.reporter, "=> expected:", "dana");
  console.log(bug.title, "=> expected:", "Login button disabled");
  bug.title = "Login button disabled on Safari";
  console.log(bug.title, "=> expected:", "Login button disabled on Safari");

  console.log(bug.commentCount(), "=> expected:", 0);
  console.log(bug.getComments(), "=> expected:", []);
  console.log(bug.addComment("  reproduced on Chrome  "), "=> expected:", true);
  console.log(bug.addComment(""), "=> expected:", false);
  console.log(bug.addComment("   "), "=> expected:", false);
  console.log(bug.addComment("fixed in build 42"), "=> expected:", true);
  console.log(bug.getComments(), "=> expected:", ["reproduced on Chrome", "fixed in build 42"]);
  console.log(bug.commentCount(), "=> expected:", 2);

  // getComments returns a copy – changing it doesn't change the report
  const copy = bug.getComments();
  copy.push("hacked!");
  copy[0] = "changed";
  console.log(bug.getComments(), "=> expected:", ["reproduced on Chrome", "fixed in build 42"]);
  console.log(bug.commentCount(), "=> expected:", 2);

  // Compile-time check only – if you uncomment the lines below, you should get a compile error:
  // bug.id = "BUG-999";            // ← compile error (readonly)
  // bug.reporter = "someone-else"; // ← compile error (readonly)
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 2: ApiToken ---");
try {
  try {
    new ApiToken("short");
    console.log("did not throw", "=> expected:", "an error");
  } catch (err) {
    if ((err as Error).message === "TODO") throw err;
    console.log("threw:", (err as Error).message, "=> expected:", "an error");
  }
  try {
    new ApiToken("");
    console.log("did not throw", "=> expected:", "an error");
  } catch (err) {
    if ((err as Error).message === "TODO") throw err;
    console.log("threw:", (err as Error).message, "=> expected:", "an error");
  }

  const token = new ApiToken("abcd1234efgh");
  console.log(token.masked(), "=> expected:", "********efgh");
  console.log(new ApiToken("12345678").masked(), "=> expected:", "****5678");
  console.log(token.authHeader(), "=> expected:", { Authorization: "Bearer abcd1234efgh" });
  console.log(token.matches("abcd1234efgh"), "=> expected:", true);
  console.log(token.matches("abcd1234efgX"), "=> expected:", false);

  // The token doesn't leak at runtime
  console.log(Object.keys(token), "=> expected:", []);
  console.log(JSON.stringify(token), "=> expected:", "{}");
  console.log((token as unknown as Record<string, unknown>).value, "=> expected:", undefined);
  console.log(String(Object.values(token)).includes("abcd1234efgh"), "=> expected:", false);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 3: TestDataPool ---");
try {
  const emails = ["a@qa.com", "b@qa.com"];
  const pool = new TestDataPool(emails);
  emails.push("c@qa.com"); // shouldn't have any effect – the pool kept a copy
  console.log(pool.availableCount(), "=> expected:", 2);
  console.log(pool.inUseCount(), "=> expected:", 0);

  console.log(pool.take(), "=> expected:", "a@qa.com");
  console.log(pool.take(), "=> expected:", "b@qa.com");
  console.log(pool.availableCount(), "=> expected:", 0);
  console.log(pool.inUseCount(), "=> expected:", 2);
  try {
    pool.take();
    console.log("did not throw", "=> expected:", "an error");
  } catch (err) {
    if ((err as Error).message === "TODO") throw err;
    console.log((err as Error).message, "=> expected:", "Test data pool is exhausted");
  }

  console.log(pool.release("a@qa.com"), "=> expected:", true);
  console.log(pool.release("a@qa.com"), "=> expected:", false); // already released
  console.log(pool.release("stranger@qa.com"), "=> expected:", false); // not from the pool
  console.log(pool.availableCount(), "=> expected:", 1);
  console.log(pool.inUseCount(), "=> expected:", 1);
  console.log(pool.take(), "=> expected:", "a@qa.com");

  console.log(pool.release("b@qa.com"), "=> expected:", true);
  console.log(pool.release("a@qa.com"), "=> expected:", true);
  console.log(pool.take(), "=> expected:", "b@qa.com"); // released emails go back to the end of the queue
  console.log(pool.take(), "=> expected:", "a@qa.com");
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 4: FeatureFlags ---");
try {
  const flags = new FeatureFlags("staging");
  console.log(flags.environment, "=> expected:", "staging");
  console.log(flags.isEnabled("new-checkout"), "=> expected:", false);
  console.log(flags.isLocked(), "=> expected:", false);

  flags.enable("new-checkout");
  flags.enable("dark-mode");
  flags.enable("new-checkout"); // duplicate – ignored
  console.log(flags.isEnabled("new-checkout"), "=> expected:", true);
  console.log(flags.enabledFlags(), "=> expected:", ["dark-mode", "new-checkout"]);

  flags.disable("dark-mode");
  flags.disable("never-existed");
  console.log(flags.enabledFlags(), "=> expected:", ["new-checkout"]);

  const copy = flags.enabledFlags();
  copy.push("injected");
  console.log(flags.isEnabled("injected"), "=> expected:", false);

  flags.lock();
  console.log(flags.isLocked(), "=> expected:", true);
  try {
    flags.enable("beta");
    console.log("did not throw", "=> expected:", "an error");
  } catch (err) {
    if ((err as Error).message === "TODO") throw err;
    console.log((err as Error).message, "=> expected:", "Flags for staging are locked");
  }
  try {
    flags.disable("new-checkout");
    console.log("did not throw", "=> expected:", "an error");
  } catch (err) {
    if ((err as Error).message === "TODO") throw err;
    console.log((err as Error).message, "=> expected:", "Flags for staging are locked");
  }
  console.log(flags.enabledFlags(), "=> expected:", ["new-checkout"]);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 5 (Bonus): SecretVault ---");
try {
  const allowed = ["ci-bot"];
  const vault = new SecretVault(allowed);
  allowed.push("intruder"); // the internal copy doesn't change

  vault.store("DB_PASSWORD", "p@ss");
  vault.store("API_KEY", "k-1");
  vault.store("API_KEY", "k-2"); // overwrite

  console.log(vault.reveal("API_KEY", "ci-bot"), "=> expected:", "k-2");
  console.log(vault.reveal("MISSING", "ci-bot"), "=> expected:", undefined);
  try {
    vault.reveal("DB_PASSWORD", "intruder");
    console.log("did not throw", "=> expected:", "an error");
  } catch (err) {
    if ((err as Error).message === "TODO") throw err;
    console.log((err as Error).message, "=> expected:", "Access denied");
  }

  console.log(vault.auditLog(), "=> expected:", [
    "READ ci-bot -> API_KEY",
    "READ ci-bot -> MISSING",
    "DENIED intruder -> DB_PASSWORD",
  ]);

  const log = vault.auditLog();
  log.length = 0;
  console.log(vault.auditLog().length, "=> expected:", 3);

  console.log(JSON.stringify(vault), "=> expected:", "{}");
  console.log(Object.keys(vault), "=> expected:", []);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}
