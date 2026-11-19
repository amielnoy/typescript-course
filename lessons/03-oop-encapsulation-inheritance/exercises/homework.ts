// Lesson 3 – Homework: Staging Test Accounts – users, roles and a static registry
// ------------------------------------------------------------
// Scenario:
//   The e2e suite runs against a shared staging environment. Before every run it creates test
//   accounts (regular users, read-only viewers and admins), the tests log in as them, and at the
//   end everything is wiped. Last month a test report leaked a password, and a test that typed a
//   wrong password three times locked an account another team needed. So the QA team is writing a
//   small, strict module: every account checks its own data, the password never leaves the object,
//   every role knows its own permissions, and one static registry owns all the accounts of the run.
//
// Instructions:
//   1. The tasks build on each other – solve them in order. Fill in every  throw new Error("TODO")
//      (and, where a task says so, add the fields / members that are missing).
//   2. Use only what we have learned so far: classes, public / private / protected / readonly,
//      # fields, getters and setters, extends / super / override, static members, Error subclasses.
//   3. Secrets stay secret: the password lives only in a # field – never in a public field,
//      a TS private field, or an error message.
//   4. Remember (noImplicitOverride): a method or getter that replaces the parent's one needs override.
//   5. Check yourself: npm run exercise -- 03 hw (self-check at the end of the file)
// ------------------------------------------------------------

/**
 * Task 1 – A small error hierarchy
 * Every error of the module is an AccountError, so a test can catch the whole family with one
 * instanceof check – and still tell the cases apart by code (or by a more specific class).
 *
 *   AccountError(code, message)        extends Error
 *     message => `[${code}] ${message}`        code is stored as public readonly
 *     name    => "AccountError"
 *       new AccountError("LOGIN_FAILED", "invalid username or password").message
 *         => "[LOGIN_FAILED] invalid username or password"
 *
 *   ValidationError(field, reason)     extends AccountError
 *     code "VALIDATION", the message part is `${field}: ${reason}`   (field: public readonly)
 *     name => "ValidationError"
 *       new ValidationError("email", "must be <name>@qa.shop.test").message
 *         => "[VALIDATION] email: must be <name>@qa.shop.test"
 *
 *   PermissionError(username, action)  extends AccountError
 *     code "PERMISSION_DENIED", the message part is `${username} is not allowed to ${action}`
 *     username and action: public readonly.   name => "PermissionError"
 *
 * Hint: build the "[code] ..." format only once – in AccountError. The subclasses pass their part to super.
 */
export class AccountError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    throw new Error("TODO");
  }
}

export class ValidationError extends AccountError {
  readonly field: string;

  constructor(field: string, reason: string) {
    super("VALIDATION", "");
    throw new Error("TODO");
  }
}

export class PermissionError extends AccountError {
  readonly username: string;
  readonly action: string;

  constructor(username: string, action: string) {
    super("PERMISSION_DENIED", "");
    throw new Error("TODO");
  }
}

export type Role = "user" | "viewer" | "admin";
export type Action = "read" | "write" | "delete" | "manage-users";

/**
 * Task 2 – TestUser: an account that guards its own data
 * constructor(username, password, email = `${username}@qa.shop.test`) checks, in this order:
 *   username – public readonly. At least 3 characters and no spaces, otherwise
 *              ValidationError("username", "must be at least 3 characters with no spaces")
 *   email    – goes through the email setter (below)
 *   password – the password rule (below), then stored in a # field
 *
 *   get email / set email
 *     The setter trims and lower-cases the value. The result must end with "@qa.shop.test"
 *     (use the static EMAIL_DOMAIN) and have something before the "@", otherwise
 *       ValidationError("email", "must be <name>@qa.shop.test")
 *     and the old value stays.   "  Noa.Levi@QA.Shop.Test " => "noa.levi@qa.shop.test"
 *
 *   The password rule (write it once, in a private method, and use it in two places):
 *     length >= this.minPasswordLength() and at least one digit, otherwise
 *       ValidationError("password", `must be at least ${min} characters and contain a digit`)
 *     Hint: [...value].some((ch) => ch >= "0" && ch <= "9")
 *
 *   checkPassword(attempt): boolean
 *   changePassword(current, next): void – checks in this order:
 *     current is wrong     => PermissionError(username, "change the password")
 *     next === current     => ValidationError("password", "must differ from the current password")
 *     next breaks the rule => the password-rule error
 *     Only when everything is fine is the password replaced.
 *
 *   get isActive (no setter – read only) – true for a new account
 *   deactivate(): void – the account becomes inactive
 *
 * The password must not show up in JSON.stringify(user) or in Object.keys(user) – the checks verify this.
 * Add the private fields you need yourself.
 */
export class TestUser {
  static readonly EMAIL_DOMAIN = "qa.shop.test";

  readonly username: string;

  constructor(username: string, password: string, email: string = `${username}@${TestUser.EMAIL_DOMAIN}`) {
    throw new Error("TODO");
  }

  /** The minimum password length – a subclass may demand more (Task 3) */
  protected minPasswordLength(): number {
    return 8;
  }

  get email(): string {
    throw new Error("TODO");
  }

  set email(value: string) {
    throw new Error("TODO");
  }

  get isActive(): boolean {
    throw new Error("TODO");
  }

  deactivate(): void {
    throw new Error("TODO");
  }

  checkPassword(attempt: string): boolean {
    throw new Error("TODO");
  }

  changePassword(current: string, next: string): void {
    throw new Error("TODO");
  }

  // ----- Task 3 (see below) -----

  get role(): Role {
    return "user";
  }

  protected allowedActions(): Action[] {
    return ["read", "write"];
  }

  can(action: Action): boolean {
    throw new Error("TODO");
  }

  assertCan(action: Action): void {
    throw new Error("TODO");
  }

  describe(): string {
    throw new Error("TODO");
  }
}

/**
 * Task 3 – Roles: Viewer and Admin (subclasses of TestUser)
 * a. In TestUser (the "Task 3" part of the class above):
 *      can(action)       => true only if the account is active AND action is in this.allowedActions()
 *      assertCan(action) => throws PermissionError(username, action) when can(action) is false
 *      describe()        => "dana <dana@qa.shop.test> [user]"   (the role comes from this.role)
 *                           an inactive account adds " (inactive)" at the end
 * b. Viewer – role "viewer", may only "read".
 *    Admin  – role "admin", may do everything a regular user may (use super!) plus "delete" and "manage-users".
 * c. Admins need a stronger password: at least 12 characters – in the constructor AND in changePassword.
 *    Add the one member to Admin that does it (no new checks, no copy of the password rule).
 *    Hint: a method, not a field – while the TestUser constructor runs, the fields of the subclass
 *    are not set yet, but its methods already work.
 * d. Admin.deactivateUser(target):
 *      the admin must be allowed to "manage-users" (use assertCan – an inactive admin can't)
 *      target is the admin itself => AccountError("SELF_LOCKOUT", "an admin cannot deactivate themselves")
 *      otherwise target is deactivated.
 */
export class Viewer extends TestUser {
  override get role(): Role {
    throw new Error("TODO");
  }

  protected override allowedActions(): Action[] {
    throw new Error("TODO");
  }
}

export class Admin extends TestUser {
  override get role(): Role {
    throw new Error("TODO");
  }

  protected override allowedActions(): Action[] {
    throw new Error("TODO");
  }

  deactivateUser(target: TestUser): void {
    throw new Error("TODO");
  }
}

/** One row of test data for UserRegistry.seed (Task 6) */
export type SeedRow = { username: string; password: string; role: Role; email?: string };

/**
 * Task 4 – UserRegistry: one static registry for the whole run
 * Everything in UserRegistry is static – the constructor is private, so nobody can create an instance.
 * Add the private static fields you need (e.g. the list of users).
 *
 *   register(user): void      – adds the user. A username that is already registered =>
 *                               AccountError("DUPLICATE_USER", `"${username}" is already registered`)
 *                               (and the registered user stays as it was)
 *   find(username)            – the user, or undefined
 *   get count                 – a static getter: how many users are registered
 *   byRole(role): TestUser[]  – the users with that role, in the order they were registered.
 *                               A new array – changing it must not change the registry.
 *   reset(): void             – removes everything (the self-check calls it before every task)
 */
export class UserRegistry {
  static readonly MAX_FAILED_LOGINS = 3;

  private constructor() {}

  static register(user: TestUser): void {
    throw new Error("TODO");
  }

  static find(username: string): TestUser | undefined {
    throw new Error("TODO");
  }

  static get count(): number {
    throw new Error("TODO");
  }

  static byRole(role: Role): TestUser[] {
    throw new Error("TODO");
  }

  static reset(): void {
    throw new Error("TODO");
  }

  /**
   * Task 5 – login, with a lockout after too many failures
   *   login(username, password): TestUser – returns the registered user. Checks in this order:
   *     unknown username  => AccountError("LOGIN_FAILED", "invalid username or password")
   *     inactive account  => AccountError("ACCOUNT_DISABLED", `${username} is disabled`)
   *     wrong password    => the same LOGIN_FAILED error as an unknown username
   *                          (a stranger must not learn which usernames exist), and the failure is counted.
   *                          The failure number MAX_FAILED_LOGINS (3) in a row also deactivates the account,
   *                          and throws AccountError("ACCOUNT_LOCKED", `${username} was locked after 3 failed logins`)
   *     correct password  => the failure count of that user goes back to 0
   *   failedLogins(username): number – the current count (0 for a name that never failed)
   *   reset() (Task 4) must now clear the counts too.
   */
  static login(username: string, password: string): TestUser {
    throw new Error("TODO");
  }

  static failedLogins(username: string): number {
    throw new Error("TODO");
  }

  /**
   * Task 6 (Challenge) – seed: create a whole set of accounts from data, all or nothing
   *   seed(rows): TestUser[] – for every row, creates the right class by role
   *   ("user" => TestUser, "viewer" => Viewer, "admin" => Admin), registers them all, and returns them in order.
   *   A row without email gets the default one.
   *   All or nothing: if any row is bad, NOT ONE row is registered, and seed throws
   *     AccountError("SEED_FAILED", `row ${n}: ${the message of the original error}`)   (n starts at 1)
   *   A row is bad if:
   *     - its username is already registered, or was used by an earlier row =>
   *         the original error is the DUPLICATE_USER error of Task 4
   *     - creating the user throws (e.g. a weak password)
   *   e.g. "[SEED_FAILED] row 2: [VALIDATION] password: must be at least 12 characters and contain a digit"
   *
   * Hint: first create and check all the rows, and only then register them.
   *       A private static helper that creates one user from one row keeps seed short.
   */
  static seed(rows: SeedRow[]): TestUser[] {
    throw new Error("TODO");
  }
}

/**
 * Task 7 (Challenge) – TempAdmin: an on-call admin with a limited budget
 * During a release night, the on-call tester gets admin rights – but only for a few admin actions.
 *   TempAdmin(username, password, maxAdminActions, email?) extends Admin
 *     maxAdminActions must be a positive integer, otherwise
 *       ValidationError("maxAdminActions", "must be a positive integer")
 *     (the Admin password rule still applies – it is inherited)
 *   get adminActionsLeft – how many admin actions are left (read only)
 *   deactivateUser(target) – works like Admin's, and a SUCCESSFUL one uses up one action
 *     (a call that threw does not count)
 *   When no actions are left, the account may only do what a regular user may ("read", "write") –
 *   so deactivateUser now throws PermissionError(username, "manage-users") by itself.
 *   The role stays "admin".
 *   describe() => "oncall <oncall@qa.shop.test> [admin] (2 admin action(s) left)"
 *
 * Which members do you override? Reuse the parent's code with super – do not copy it.
 */
export class TempAdmin extends Admin {
  constructor(username: string, password: string, maxAdminActions: number, email?: string) {
    super(username, password, email);
    throw new Error("TODO");
  }

  get adminActionsLeft(): number {
    throw new Error("TODO");
  }
}

// ============================================================
// Self-check – run:  npm run exercise -- 03 hw
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
