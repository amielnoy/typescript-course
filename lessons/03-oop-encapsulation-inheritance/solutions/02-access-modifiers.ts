// Lesson 3 – Topic 02: Access Modifiers – Solutions

// ---------- Warm-ups (in class, ~5 minutes each) ----------
// Two short exercises we solve during the lesson, right after the examples – before Exercise 1.

export class StepCounter {
  private count = 0;

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

export class PasswordField {
  readonly label: string;
  private value = "";

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
    return "*".repeat(this.value.length); // the real value never leaves the class
  }
}

// ---------- Exercises ----------

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
    if (trimmed === "") return false;
    this.comments.push(trimmed);
    return true;
  }

  getComments(): string[] {
    return [...this.comments]; // a copy – outside code can't change the internal array
  }

  commentCount(): number {
    return this.comments.length;
  }
}

export class ApiToken {
  #value: string; // enforced at runtime too – won't show up in JSON.stringify or Object.keys

  constructor(value: string) {
    if (value.length < 8) {
      throw new Error("Token must be at least 8 characters");
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
    return candidate === this.#value;
  }
}

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
    if (index === -1) return false;
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

export class FeatureFlags {
  readonly environment: string;
  private enabled: string[] = [];
  private locked = false;

  constructor(environment: string) {
    this.environment = environment;
  }

  // A private helper method – not part of the public interface
  private ensureUnlocked(): void {
    if (this.locked) {
      throw new Error(`Flags for ${this.environment} are locked`);
    }
  }

  enable(name: string): void {
    this.ensureUnlocked();
    if (!this.enabled.includes(name)) this.enabled.push(name);
  }

  disable(name: string): void {
    this.ensureUnlocked();
    this.enabled = this.enabled.filter((flag) => flag !== name);
  }

  isEnabled(name: string): boolean {
    return this.enabled.includes(name);
  }

  enabledFlags(): string[] {
    return [...this.enabled].sort();
  }

  lock(): void {
    this.locked = true;
  }

  isLocked(): boolean {
    return this.locked;
  }
}

export class SecretVault {
  #allowed: string[];
  #secrets = new Map<string, string>();
  #log: string[] = [];

  constructor(allowedRequesters: string[]) {
    this.#allowed = [...allowedRequesters];
  }

  store(key: string, value: string): void {
    this.#secrets.set(key, value);
  }

  reveal(key: string, requester: string): string | undefined {
    if (!this.#allowed.includes(requester)) {
      this.#log.push(`DENIED ${requester} -> ${key}`);
      throw new Error("Access denied");
    }
    this.#log.push(`READ ${requester} -> ${key}`);
    return this.#secrets.get(key);
  }

  auditLog(): string[] {
    return [...this.#log];
  }
}

// ============================================================
// Self-check – run:  npm run solution -- 03 02
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
