// Lesson 3 – Homework: Staging Test Accounts – users, roles and a static registry – Solution
// Check yourself: npm run solution -- 03 hw (self-check at the end of the file)

// ---------- Task 1 ----------
export class AccountError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(`[${code}] ${message}`); // the "[code] ..." format lives only here
    this.code = code;
    this.name = "AccountError";
  }
}

export class ValidationError extends AccountError {
  readonly field: string;

  constructor(field: string, reason: string) {
    super("VALIDATION", `${field}: ${reason}`);
    this.field = field;
    this.name = "ValidationError";
  }
}

export class PermissionError extends AccountError {
  readonly username: string;
  readonly action: string;

  constructor(username: string, action: string) {
    super("PERMISSION_DENIED", `${username} is not allowed to ${action}`);
    this.username = username;
    this.action = action;
    this.name = "PermissionError";
  }
}

export type Role = "user" | "viewer" | "admin";
export type Action = "read" | "write" | "delete" | "manage-users";

// ---------- Task 2 (+ the Task 3 part of TestUser) ----------
export class TestUser {
  static readonly EMAIL_DOMAIN = "qa.shop.test";

  readonly username: string;
  #password: string; // a # field: not in JSON.stringify, not in Object.keys, not reachable from outside
  private _email = "";
  private _active = true;

  constructor(username: string, password: string, email: string = `${username}@${TestUser.EMAIL_DOMAIN}`) {
    if (username.length < 3 || username.includes(" ")) {
      throw new ValidationError("username", "must be at least 3 characters with no spaces");
    }
    this.username = username;
    this.email = email; // the same validation as the setter – not a copy of it
    this.assertStrongPassword(password);
    this.#password = password;
  }

  /** The minimum password length – a subclass may demand more (Task 3) */
  protected minPasswordLength(): number {
    return 8;
  }

  // The password rule – written once, used by the constructor and by changePassword
  private assertStrongPassword(value: string): void {
    const min = this.minPasswordLength(); // polymorphic: an Admin answers 12
    const hasDigit = [...value].some((ch) => ch >= "0" && ch <= "9");
    if (value.length < min || !hasDigit) {
      throw new ValidationError("password", `must be at least ${min} characters and contain a digit`);
    }
  }

  get email(): string {
    return this._email;
  }

  set email(value: string) {
    const normalized = value.trim().toLowerCase();
    const suffix = `@${TestUser.EMAIL_DOMAIN}`;
    if (!normalized.endsWith(suffix) || normalized.length === suffix.length) {
      throw new ValidationError("email", `must be <name>@${TestUser.EMAIL_DOMAIN}`);
    }
    this._email = normalized;
  }

  get isActive(): boolean {
    return this._active;
  }

  deactivate(): void {
    this._active = false;
  }

  checkPassword(attempt: string): boolean {
    return attempt === this.#password;
  }

  changePassword(current: string, next: string): void {
    if (!this.checkPassword(current)) {
      throw new PermissionError(this.username, "change the password");
    }
    if (next === current) {
      throw new ValidationError("password", "must differ from the current password");
    }
    this.assertStrongPassword(next);
    this.#password = next;
  }

  // ----- Task 3 -----

  get role(): Role {
    return "user";
  }

  protected allowedActions(): Action[] {
    return ["read", "write"];
  }

  can(action: Action): boolean {
    return this.isActive && this.allowedActions().includes(action);
  }

  assertCan(action: Action): void {
    if (!this.can(action)) {
      throw new PermissionError(this.username, action);
    }
  }

  describe(): string {
    const status = this.isActive ? "" : " (inactive)";
    return `${this.username} <${this.email}> [${this.role}]${status}`;
  }
}

// ---------- Task 3 ----------
export class Viewer extends TestUser {
  override get role(): Role {
    return "viewer";
  }

  protected override allowedActions(): Action[] {
    return ["read"];
  }
}

export class Admin extends TestUser {
  override get role(): Role {
    return "admin";
  }

  protected override allowedActions(): Action[] {
    return [...super.allowedActions(), "delete", "manage-users"];
  }

  // One override – the constructor and changePassword of TestUser both ask this method.
  // (A field like "minLength = 12" would NOT work: it is set only after the TestUser constructor has finished.)
  protected override minPasswordLength(): number {
    return 12;
  }

  deactivateUser(target: TestUser): void {
    this.assertCan("manage-users");
    if (target === this) {
      throw new AccountError("SELF_LOCKOUT", "an admin cannot deactivate themselves");
    }
    target.deactivate();
  }
}

// ---------- Tasks 4–6 ----------
/** One row of test data for UserRegistry.seed (Task 6) */
export type SeedRow = { username: string; password: string; role: Role; email?: string };

export class UserRegistry {
  static readonly MAX_FAILED_LOGINS = 3;
  private static users: TestUser[] = [];
  private static failures: Record<string, number> = {};

  private constructor() {}

  // ----- Task 4 -----

  static register(user: TestUser): void {
    if (UserRegistry.find(user.username)) {
      throw new AccountError("DUPLICATE_USER", `"${user.username}" is already registered`);
    }
    UserRegistry.users.push(user);
  }

  static find(username: string): TestUser | undefined {
    return UserRegistry.users.find((u) => u.username === username);
  }

  static get count(): number {
    return UserRegistry.users.length;
  }

  static byRole(role: Role): TestUser[] {
    return UserRegistry.users.filter((u) => u.role === role); // filter always returns a new array
  }

  static reset(): void {
    UserRegistry.users = [];
    UserRegistry.failures = {}; // added in Task 5
  }

  // ----- Task 5 -----

  static login(username: string, password: string): TestUser {
    const user = UserRegistry.find(username);
    if (!user) {
      throw new AccountError("LOGIN_FAILED", "invalid username or password");
    }
    if (!user.isActive) {
      throw new AccountError("ACCOUNT_DISABLED", `${username} is disabled`);
    }
    if (!user.checkPassword(password)) {
      const failures = UserRegistry.failedLogins(username) + 1;
      UserRegistry.failures[username] = failures;
      if (failures >= UserRegistry.MAX_FAILED_LOGINS) {
        user.deactivate();
        throw new AccountError("ACCOUNT_LOCKED", `${username} was locked after ${failures} failed logins`);
      }
      throw new AccountError("LOGIN_FAILED", "invalid username or password");
    }
    UserRegistry.failures[username] = 0;
    return user;
  }

  static failedLogins(username: string): number {
    return UserRegistry.failures[username] ?? 0;
  }

  // ----- Task 6 -----

  static seed(rows: SeedRow[]): TestUser[] {
    const created: TestUser[] = [];
    // Step 1: create and check every row – nothing is registered yet
    rows.forEach((row, i) => {
      try {
        const taken = UserRegistry.find(row.username) !== undefined || created.some((u) => u.username === row.username);
        if (taken) {
          throw new AccountError("DUPLICATE_USER", `"${row.username}" is already registered`);
        }
        created.push(UserRegistry.createUser(row));
      } catch (err) {
        throw new AccountError("SEED_FAILED", `row ${i + 1}: ${(err as Error).message}`);
      }
    });
    // Step 2: every row is fine – register them all
    created.forEach((user) => UserRegistry.register(user));
    return created;
  }

  // A private static factory: the right class for the role
  private static createUser(row: SeedRow): TestUser {
    if (row.role === "admin") return new Admin(row.username, row.password, row.email);
    if (row.role === "viewer") return new Viewer(row.username, row.password, row.email);
    return new TestUser(row.username, row.password, row.email);
  }
}

// ---------- Task 7 ----------
export class TempAdmin extends Admin {
  private remaining: number;

  constructor(username: string, password: string, maxAdminActions: number, email?: string) {
    super(username, password, email); // the Admin password rule runs here
    if (!Number.isInteger(maxAdminActions) || maxAdminActions <= 0) {
      throw new ValidationError("maxAdminActions", "must be a positive integer");
    }
    this.remaining = maxAdminActions;
  }

  get adminActionsLeft(): number {
    return this.remaining;
  }

  // No actions left => only what a regular user may do. Admin.deactivateUser calls assertCan,
  // which calls this method – so the budget is enforced without touching deactivateUser's checks.
  protected override allowedActions(): Action[] {
    const actions = super.allowedActions();
    return this.remaining > 0 ? actions : actions.filter((a) => a !== "delete" && a !== "manage-users");
  }

  override deactivateUser(target: TestUser): void {
    super.deactivateUser(target); // throws => the line below never runs, nothing is used up
    this.remaining--;
  }

  override describe(): string {
    return `${super.describe()} (${this.remaining} admin action(s) left)`;
  }
}

// ============================================================
// Self-check – run:  npm run solution -- 03 hw
// On every line, the value left of "=> expected:" must equal the value on its right.
// (No need to change the code below this line)
// ============================================================

/** Runs fn and describes the result: "did not throw", or "threw: <error name>: <message>". A TODO is passed on. */
function thrown(fn: () => unknown): string {
  try {
    fn();
    return "did not throw";
  } catch (err) {
    if ((err as Error).message === "TODO") throw err;
    return `threw: ${(err as Error).name}: ${(err as Error).message}`;
  }
}

const ALL_ACTIONS: Action[] = ["read", "write", "delete", "manage-users"];

console.log("\n--- Task 1: AccountError, ValidationError, PermissionError ---");
try {
  const failed = new AccountError("LOGIN_FAILED", "invalid username or password");
  console.log(failed.message, "=> expected:", "[LOGIN_FAILED] invalid username or password");
  console.log(failed.code, "=> expected:", "LOGIN_FAILED");
  console.log(failed.name, "=> expected:", "AccountError");
  console.log(failed instanceof Error, "=> expected:", true);

  const invalid = new ValidationError("email", "must be <name>@qa.shop.test");
  console.log(invalid.message, "=> expected:", "[VALIDATION] email: must be <name>@qa.shop.test");
  console.log([invalid.code, invalid.field, invalid.name], "=> expected:", ["VALIDATION", "email", "ValidationError"]);
  console.log(String(invalid), "=> expected:", "ValidationError: [VALIDATION] email: must be <name>@qa.shop.test");

  const denied = new PermissionError("noa", "delete");
  console.log(denied.message, "=> expected:", "[PERMISSION_DENIED] noa is not allowed to delete");
  console.log([denied.code, denied.username, denied.action, denied.name], "=> expected:", [
    "PERMISSION_DENIED",
    "noa",
    "delete",
    "PermissionError",
  ]);

  // One instanceof check catches the whole family – the code tells the cases apart
  console.log(
    [failed, invalid, denied].map((e) => (e instanceof AccountError ? e.code : "not an AccountError")),
    "=> expected:",
    ["LOGIN_FAILED", "VALIDATION", "PERMISSION_DENIED"],
  );
  console.log([denied instanceof AccountError, denied instanceof ValidationError], "=> expected:", [true, false]);
  // invalid.code = "OTHER";   // ❌ readonly
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Task 2: TestUser – validation and a private password ---");
try {
  const dana = new TestUser("dana", "Secret123");
  console.log([dana.username, dana.email, dana.isActive], "=> expected:", ["dana", "dana@qa.shop.test", true]);

  const noa = new TestUser("noa", "Passw0rd!", "  Noa.Levi@QA.Shop.Test ");
  console.log(noa.email, "=> expected:", "noa.levi@qa.shop.test");
  console.log(
    thrown(() => (noa.email = "noa@gmail.com")),
    "=> expected:",
    "threw: ValidationError: [VALIDATION] email: must be <name>@qa.shop.test",
  );
  console.log(noa.email, "=> expected:", "noa.levi@qa.shop.test"); // a failed set keeps the old value
  console.log(
    thrown(() => new TestUser("avi", "Secret123", "@qa.shop.test")),
    "=> expected:",
    "threw: ValidationError: [VALIDATION] email: must be <name>@qa.shop.test",
  );
  console.log(
    thrown(() => new TestUser("qa bot", "Secret123")),
    "=> expected:",
    "threw: ValidationError: [VALIDATION] username: must be at least 3 characters with no spaces",
  );
  console.log(
    thrown(() => new TestUser("qa", "Secret123")),
    "=> expected:",
    "threw: ValidationError: [VALIDATION] username: must be at least 3 characters with no spaces",
  );
  console.log(
    thrown(() => new TestUser("avi", "short1")),
    "=> expected:",
    "threw: ValidationError: [VALIDATION] password: must be at least 8 characters and contain a digit",
  );
  console.log(
    thrown(() => new TestUser("avi", "NoDigitsHere")),
    "=> expected:",
    "threw: ValidationError: [VALIDATION] password: must be at least 8 characters and contain a digit",
  );

  console.log([dana.checkPassword("secret123"), dana.checkPassword("Secret123")], "=> expected:", [false, true]);
  console.log(
    thrown(() => dana.changePassword("wrong", "NewSecret1")),
    "=> expected:",
    "threw: PermissionError: [PERMISSION_DENIED] dana is not allowed to change the password",
  );
  console.log(
    thrown(() => dana.changePassword("Secret123", "Secret123")),
    "=> expected:",
    "threw: ValidationError: [VALIDATION] password: must differ from the current password",
  );
  console.log(
    thrown(() => dana.changePassword("Secret123", "weak")),
    "=> expected:",
    "threw: ValidationError: [VALIDATION] password: must be at least 8 characters and contain a digit",
  );
  console.log(dana.checkPassword("Secret123"), "=> expected:", true); // the failed changes changed nothing
  console.log(thrown(() => dana.changePassword("Secret123", "NewSecret1")), "=> expected:", "did not throw");
  console.log([dana.checkPassword("Secret123"), dana.checkPassword("NewSecret1")], "=> expected:", [false, true]);

  dana.deactivate();
  console.log(dana.isActive, "=> expected:", false);

  // The password never leaves the object – not in a report, not in a log
  console.log(JSON.stringify(noa).includes("Passw0rd!"), "=> expected:", false);
  console.log(
    Object.keys(noa).some((key) => key.toLowerCase().includes("pass")),
    "=> expected:",
    false,
  );
  // dana.username = "other";    // ❌ readonly
  // dana.isActive = true;       // ❌ a getter without a setter – read only
  // dana.minPasswordLength();   // ❌ protected – only inside TestUser and its subclasses
  // TestUser.EMAIL_DOMAIN = "gmail.com";   // ❌ static readonly
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Task 3: Viewer and Admin – roles, permissions, a stronger password ---");
try {
  const dana = new TestUser("dana", "Secret123");
  const guest = new Viewer("guest", "Viewer123");
  const root = new Admin("root", "Admin123456!");

  console.log([dana.role, guest.role, root.role], "=> expected:", ["user", "viewer", "admin"]);
  console.log(dana.describe(), "=> expected:", "dana <dana@qa.shop.test> [user]");
  console.log(root.describe(), "=> expected:", "root <root@qa.shop.test> [admin]");

  console.log(
    ALL_ACTIONS.filter((a) => dana.can(a)),
    "=> expected:",
    ["read", "write"],
  );
  console.log(
    ALL_ACTIONS.filter((a) => guest.can(a)),
    "=> expected:",
    ["read"],
  );
  console.log(
    ALL_ACTIONS.filter((a) => root.can(a)),
    "=> expected:",
    ["read", "write", "delete", "manage-users"],
  );
  // An array typed as the base class – every account answers with its own rules
  const team: TestUser[] = [dana, guest, root];
  console.log(
    team.map((u) => u.can("write")),
    "=> expected:",
    [true, false, true],
  );
  console.log(
    thrown(() => guest.assertCan("write")),
    "=> expected:",
    "threw: PermissionError: [PERMISSION_DENIED] guest is not allowed to write",
  );
  console.log(thrown(() => guest.assertCan("read")), "=> expected:", "did not throw");

  // Admins need 12+ characters – in the constructor and when changing the password
  console.log(
    thrown(() => new Admin("boss", "Secret123")),
    "=> expected:",
    "threw: ValidationError: [VALIDATION] password: must be at least 12 characters and contain a digit",
  );
  console.log(
    thrown(() => root.changePassword("Admin123456!", "Short1234")),
    "=> expected:",
    "threw: ValidationError: [VALIDATION] password: must be at least 12 characters and contain a digit",
  );
  console.log(thrown(() => new Viewer("eve", "Secret123")), "=> expected:", "did not throw"); // 8 is enough for others

  root.deactivateUser(dana);
  console.log([dana.isActive, dana.can("read")], "=> expected:", [false, false]);
  console.log(dana.describe(), "=> expected:", "dana <dana@qa.shop.test> [user] (inactive)");
  console.log(
    thrown(() => root.deactivateUser(root)),
    "=> expected:",
    "threw: AccountError: [SELF_LOCKOUT] an admin cannot deactivate themselves",
  );
  console.log(root.isActive, "=> expected:", true);

  // An inactive admin has no rights at all
  const formerAdmin = new Admin("root2", "Admin123456!");
  root.deactivateUser(formerAdmin);
  console.log(
    thrown(() => formerAdmin.deactivateUser(guest)),
    "=> expected:",
    "threw: PermissionError: [PERMISSION_DENIED] root2 is not allowed to manage-users",
  );
  console.log(guest.isActive, "=> expected:", true);
  console.log([guest instanceof TestUser, root instanceof Viewer], "=> expected:", [true, false]);
  // guest.deactivateUser(dana);   // ❌ only Admin has deactivateUser
  // root.allowedActions();        // ❌ protected
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Task 4: UserRegistry – a static registry ---");
try {
  UserRegistry.reset();
  console.log(UserRegistry.count, "=> expected:", 0);
  UserRegistry.register(new TestUser("dana", "Secret123"));
  UserRegistry.register(new Viewer("guest", "Viewer123"));
  UserRegistry.register(new Admin("root", "Admin123456!"));
  UserRegistry.register(new Viewer("ci_bot", "Viewer123"));
  console.log(UserRegistry.count, "=> expected:", 4);
  console.log(UserRegistry.find("root")?.describe(), "=> expected:", "root <root@qa.shop.test> [admin]");
  console.log(UserRegistry.find("ghost"), "=> expected:", undefined);
  console.log(
    UserRegistry.byRole("viewer").map((u) => u.username),
    "=> expected:",
    ["guest", "ci_bot"],
  );
  console.log(UserRegistry.byRole("admin")[0] instanceof Admin, "=> expected:", true);

  console.log(
    thrown(() => UserRegistry.register(new TestUser("dana", "Other1234"))),
    "=> expected:",
    'threw: AccountError: [DUPLICATE_USER] "dana" is already registered',
  );
  console.log(UserRegistry.find("dana")?.checkPassword("Secret123"), "=> expected:", true); // the original stays
  console.log(UserRegistry.count, "=> expected:", 4);

  // byRole returns a new array – emptying it does not touch the registry
  UserRegistry.byRole("viewer").length = 0;
  console.log(UserRegistry.byRole("viewer").length, "=> expected:", 2);

  UserRegistry.reset();
  console.log([UserRegistry.count, UserRegistry.find("dana")], "=> expected:", [0, undefined]);
  // new UserRegistry();         // ❌ the constructor is private – everything is static
  // UserRegistry.count = 10;    // ❌ a static getter without a setter
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Task 5: UserRegistry.login – one message for strangers, a lockout after 3 failures ---");
try {
  UserRegistry.reset();
  const dana = new TestUser("dana", "Secret123");
  const guest = new Viewer("guest", "Viewer123");
  const root = new Admin("root", "Admin123456!");
  UserRegistry.register(dana);
  UserRegistry.register(guest);
  UserRegistry.register(root);

  console.log(UserRegistry.login("dana", "Secret123") === dana, "=> expected:", true);
  console.log(
    thrown(() => UserRegistry.login("dana", "wrong")),
    "=> expected:",
    "threw: AccountError: [LOGIN_FAILED] invalid username or password",
  );
  // An unknown user gets the very same message
  console.log(
    thrown(() => UserRegistry.login("ghost", "Secret123")),
    "=> expected:",
    "threw: AccountError: [LOGIN_FAILED] invalid username or password",
  );
  console.log([UserRegistry.failedLogins("dana"), UserRegistry.failedLogins("ghost")], "=> expected:", [1, 0]);
  UserRegistry.login("dana", "Secret123");
  console.log(UserRegistry.failedLogins("dana"), "=> expected:", 0); // a success resets the count

  // Three failures in a row lock the account
  console.log(
    [1, 2, 3].map(() => thrown(() => UserRegistry.login("dana", "Secret12"))),
    "=> expected:",
    [
      "threw: AccountError: [LOGIN_FAILED] invalid username or password",
      "threw: AccountError: [LOGIN_FAILED] invalid username or password",
      "threw: AccountError: [ACCOUNT_LOCKED] dana was locked after 3 failed logins",
    ],
  );
  console.log(dana.isActive, "=> expected:", false);
  console.log(
    thrown(() => UserRegistry.login("dana", "Secret123")),
    "=> expected:",
    "threw: AccountError: [ACCOUNT_DISABLED] dana is disabled",
  );

  // An account that an admin deactivated can't log in either
  root.deactivateUser(guest);
  console.log(
    thrown(() => UserRegistry.login("guest", "Viewer123")),
    "=> expected:",
    "threw: AccountError: [ACCOUNT_DISABLED] guest is disabled",
  );
  // The password that was tried never shows up in the error
  console.log(
    thrown(() => UserRegistry.login("root", "MyRealPass99")).includes("MyRealPass99"),
    "=> expected:",
    false,
  );

  // reset() clears the counts too
  console.log(UserRegistry.failedLogins("root"), "=> expected:", 1);
  UserRegistry.reset();
  console.log(UserRegistry.failedLogins("root"), "=> expected:", 0);
  console.log(UserRegistry.MAX_FAILED_LOGINS, "=> expected:", 3);
  // UserRegistry.MAX_FAILED_LOGINS = 100;   // ❌ static readonly
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Task 6 (Challenge): UserRegistry.seed – all or nothing ---");
try {
  UserRegistry.reset();
  UserRegistry.register(new TestUser("dana", "Secret123"));

  const seeded = UserRegistry.seed([
    { username: "qa_admin", password: "Admin123456!", role: "admin" },
    { username: "qa_viewer", password: "Viewer123", role: "viewer", email: "Reports@QA.shop.test" },
    { username: "qa_user", password: "User12345", role: "user" },
  ]);
  console.log(
    seeded.map((u) => u.describe()),
    "=> expected:",
    [
      "qa_admin <qa_admin@qa.shop.test> [admin]",
      "qa_viewer <reports@qa.shop.test> [viewer]",
      "qa_user <qa_user@qa.shop.test> [user]",
    ],
  );
  console.log([seeded[0] instanceof Admin, seeded[1] instanceof Viewer], "=> expected:", [true, true]);
  console.log(UserRegistry.count, "=> expected:", 4);
  console.log(UserRegistry.login("qa_viewer", "Viewer123").can("write"), "=> expected:", false);

  // A bad row – nothing at all is registered
  console.log(
    thrown(() =>
      UserRegistry.seed([
        { username: "qa_lead", password: "Lead12345", role: "user" },
        { username: "qa_root", password: "Root12345", role: "admin" },
      ]),
    ),
    "=> expected:",
    "threw: AccountError: [SEED_FAILED] row 2: [VALIDATION] password: must be at least 12 characters and contain a digit",
  );
  console.log(UserRegistry.find("qa_lead"), "=> expected:", undefined);

  // A duplicate – of a registered user, or inside the same seed
  console.log(
    thrown(() =>
      UserRegistry.seed([
        { username: "new_one", password: "Secret123", role: "user" },
        { username: "dana", password: "Secret123", role: "viewer" },
      ]),
    ),
    "=> expected:",
    'threw: AccountError: [SEED_FAILED] row 2: [DUPLICATE_USER] "dana" is already registered',
  );
  console.log(
    thrown(() =>
      UserRegistry.seed([
        { username: "twin", password: "Secret123", role: "user" },
        { username: "other", password: "Secret123", role: "user" },
        { username: "twin", password: "Secret456", role: "viewer" },
      ]),
    ),
    "=> expected:",
    'threw: AccountError: [SEED_FAILED] row 3: [DUPLICATE_USER] "twin" is already registered',
  );
  console.log(
    ["new_one", "twin", "other"].map((name) => UserRegistry.find(name)),
    "=> expected:",
    [undefined, undefined, undefined],
  );
  console.log(UserRegistry.count, "=> expected:", 4);
  console.log(UserRegistry.seed([]), "=> expected:", []);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Task 7 (Challenge): TempAdmin – admin rights with a budget ---");
try {
  UserRegistry.reset();
  const oncall = new TempAdmin("oncall", "OnCall123456", 2);
  const a = new TestUser("tester_a", "Secret123");
  const b = new TestUser("tester_b", "Secret123");
  const c = new TestUser("tester_c", "Secret123");

  console.log([oncall instanceof Admin, oncall.role, oncall.adminActionsLeft], "=> expected:", [true, "admin", 2]);
  console.log(oncall.describe(), "=> expected:", "oncall <oncall@qa.shop.test> [admin] (2 admin action(s) left)");

  oncall.deactivateUser(a);
  console.log(oncall.adminActionsLeft, "=> expected:", 1);
  console.log(
    thrown(() => oncall.deactivateUser(oncall)),
    "=> expected:",
    "threw: AccountError: [SELF_LOCKOUT] an admin cannot deactivate themselves",
  );
  console.log(oncall.adminActionsLeft, "=> expected:", 1); // a call that threw does not count

  oncall.deactivateUser(b);
  console.log(oncall.adminActionsLeft, "=> expected:", 0);
  console.log(
    ALL_ACTIONS.filter((x) => oncall.can(x)),
    "=> expected:",
    ["read", "write"],
  );
  console.log(
    thrown(() => oncall.deactivateUser(c)),
    "=> expected:",
    "threw: PermissionError: [PERMISSION_DENIED] oncall is not allowed to manage-users",
  );
  console.log([a.isActive, b.isActive, c.isActive], "=> expected:", [false, false, true]);
  console.log(oncall.describe(), "=> expected:", "oncall <oncall@qa.shop.test> [admin] (0 admin action(s) left)");

  console.log(
    [0, -1, 1.5].map((n) => thrown(() => new TempAdmin("oncall2", "OnCall123456", n))),
    "=> expected:",
    [
      "threw: ValidationError: [VALIDATION] maxAdminActions: must be a positive integer",
      "threw: ValidationError: [VALIDATION] maxAdminActions: must be a positive integer",
      "threw: ValidationError: [VALIDATION] maxAdminActions: must be a positive integer",
    ],
  );
  console.log(
    thrown(() => new TempAdmin("oncall2", "Short1234", 1)),
    "=> expected:",
    "threw: ValidationError: [VALIDATION] password: must be at least 12 characters and contain a digit",
  );

  // To the registry it is just another admin
  UserRegistry.register(oncall);
  UserRegistry.register(new Admin("root", "Admin123456!"));
  console.log(
    UserRegistry.byRole("admin").map((u) => u.username),
    "=> expected:",
    ["oncall", "root"],
  );
  console.log(UserRegistry.login("oncall", "OnCall123456") === oncall, "=> expected:", true);
  console.log(JSON.stringify(oncall).includes("OnCall123456"), "=> expected:", false);
  // oncall.adminActionsLeft = 99;   // ❌ read only
} catch (e) {
  console.log("  ✋", (e as Error).message);
}
