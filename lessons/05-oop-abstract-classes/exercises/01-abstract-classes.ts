// Lesson 5 – Topic 01: Abstract Classes – Exercises
// ------------------------------------------------------------
// Instructions:
//   1. Fill in the body of every method/function in place of the line  throw new Error("TODO")
//      and in the subclasses – replace the "TODO" values with the correct values.
//   2. Use only what we have learned so far: abstract class, abstract methods,
//      abstract readonly properties, shared code in the abstract class, protected,
//      and arrays typed as the abstract class (polymorphism).
//   3. Note: implementing an abstract member in a subclass does not require the override keyword
//      (you may write it, but you don't have to). Overriding a regular method – does require it.
//   4. Check yourself: npm run exercise -- 05 01 (self-check at the end of the file)
// ------------------------------------------------------------

/**
 * Exercise 1 – API endpoints (abstract readonly properties)
 * The abstract class ApiEndpoint defines a "contract": every endpoint has a method and a path.
 *
 * a. Implement the shared method describe() in the abstract class:
 *      => `${method} ${path}`        e.g. "GET /users"
 * b. Complete the subclasses:
 *      GetUsersEndpoint            method "GET",     path "/users"
 *      CreateUserEndpoint          method "POST",    path "/users"
 *      DeleteUserEndpoint(id)      method "DELETE",  path `/users/${id}`    (e.g. "/users/42")
 *
 * Hint: in DeleteUserEndpoint, path is initialized in the constructor (after super()).
 */
export abstract class ApiEndpoint {
  abstract readonly method: string;
  abstract readonly path: string;

  describe(): string {
    throw new Error("TODO");
  }
}

export class GetUsersEndpoint extends ApiEndpoint {
  readonly method = "TODO";
  readonly path = "TODO";
}

export class CreateUserEndpoint extends ApiEndpoint {
  readonly method = "TODO";
  readonly path = "TODO";
}

export class DeleteUserEndpoint extends ApiEndpoint {
  readonly method = "TODO";
  readonly path: string;

  constructor(id: number) {
    super();
    throw new Error("TODO");
  }
}

/**
 * Exercise 2 – Test data generators (abstract method + shared code)
 * Every generator implements generate(index) – one value per sequence number.
 *
 * a. Implement the shared method generateMany(count) in the abstract class:
 *      returns an array of count values: generate(1), generate(2), ..., generate(count).
 *      count less than or equal to 0 => [].
 * b. Implement generate in the subclasses:
 *      EmailGenerator("test.io")   generate(3)  => "user3@test.io"
 *      PhoneGenerator              generate(42) => "050-0000042"     (7 digits after "050-")
 *      UsernameGenerator("qa")     generate(7)  => "qa_7"
 *
 *   new UsernameGenerator("qa").generateMany(3) => ["qa_1", "qa_2", "qa_3"]
 *
 * Hint: String(index).padStart(7, "0")
 */
export abstract class DataGenerator {
  abstract generate(index: number): string;

  generateMany(count: number): string[] {
    throw new Error("TODO");
  }
}

export class EmailGenerator extends DataGenerator {
  constructor(private domain: string) {
    super();
  }

  generate(index: number): string {
    throw new Error("TODO");
  }
}

export class PhoneGenerator extends DataGenerator {
  generate(index: number): string {
    throw new Error("TODO");
  }
}

export class UsernameGenerator extends DataGenerator {
  constructor(private prefix: string) {
    super();
  }

  generate(index: number): string {
    throw new Error("TODO");
  }
}

/**
 * Exercise 3 – Forms (protected abstract + shared logic)
 * Every form defines its list of fields (fields) and how a field is checked (isValid).
 *
 * a. Implement submit(data) in the abstract class – returns an array of problems, in fields order:
 *      - a field that is missing from data or whose value is "" => `${field}: required`
 *      - otherwise, if isValid(field, value) returns false => `${field}: invalid`
 *      - no problems => []
 *    Fields in data that are not listed in fields – are ignored.
 *
 * b. Implement the subclasses:
 *      LoginForm   fields: ["username", "password"]
 *                  username – any value is valid;  password – at least 6 characters
 *      SignupForm  fields: ["email", "password", "age"]
 *                  email – contains "@"
 *                  password – at least 8 characters and contains at least one digit
 *                  age – a whole number between 18 and 120 (inclusive)
 *
 *   new LoginForm().submit({ username: "dana", password: "123" })  => ["password: invalid"]
 *   new SignupForm().submit({ email: "a@b.com" })                  => ["password: required", "age: required"]
 *
 * Hints: /\d/.test(value),  Number(value),  Number.isInteger(n)
 */
export abstract class BaseForm {
  abstract readonly fields: string[];
  protected abstract isValid(field: string, value: string): boolean;

  submit(data: Record<string, string>): string[] {
    throw new Error("TODO");
  }
}

export class LoginForm extends BaseForm {
  readonly fields: string[] = [];

  protected isValid(field: string, value: string): boolean {
    throw new Error("TODO");
  }
}

export class SignupForm extends BaseForm {
  readonly fields: string[] = [];

  protected isValid(field: string, value: string): boolean {
    throw new Error("TODO");
  }
}

/**
 * Exercise 4 – Role-based permissions (permission checks are QA's bread and butter)
 * a. Implement can(action) in the abstract class Role:
 *      true if permissions() contains action, or contains "*" (= everything is allowed).
 * b. Implement the subclasses (name + permissions):
 *      ViewerRole   "viewer"   ["read"]
 *      EditorRole   "editor"   ["read", "write"]
 *      AdminRole    "admin"    ["*"]
 * c. Implement rolesAllowedTo(roles, action) – returns the names of the roles that are
 *    allowed to perform the action, in array order.
 *
 *   rolesAllowedTo([viewer, editor, admin], "write")  => ["editor", "admin"]
 *   rolesAllowedTo([viewer, editor, admin], "delete") => ["admin"]
 */
export abstract class Role {
  abstract readonly name: string;
  protected abstract permissions(): string[];

  can(action: string): boolean {
    throw new Error("TODO");
  }
}

export class ViewerRole extends Role {
  readonly name = "TODO";

  protected permissions(): string[] {
    throw new Error("TODO");
  }
}

export class EditorRole extends Role {
  readonly name = "TODO";

  protected permissions(): string[] {
    throw new Error("TODO");
  }
}

export class AdminRole extends Role {
  readonly name = "TODO";

  protected permissions(): string[] {
    throw new Error("TODO");
  }
}

export function rolesAllowedTo(roles: Role[], action: string): string[] {
  throw new Error("TODO");
}

/**
 * Exercise 5 (Bonus) – BasePage: the foundation of the Page Object Model
 * Every page has a path and a list of elements that must be present for the page to count as "loaded".
 * (Instead of a real browser, open receives the list of elements currently shown on the screen)
 *
 * a. Implement open(visibleElements) in the abstract class:
 *      - if all of requiredElements() are in visibleElements => returns the full URL:
 *          `${baseUrl}${path}`
 *      - otherwise => throws an Error with the message:
 *          `${path} is missing: ${the missing ones, separated by ", "}`
 *        e.g.:  "/login is missing: #password, #login-btn"
 * b. Implement the subclasses:
 *      LoginPage          path "/login"        required: ["#username", "#password", "#login-btn"]
 *      DashboardPage      path "/dashboard"    required: ["#welcome", "#logout"]
 *      CheckoutPage(step) path `/checkout/step-${step}`
 *                         required: ["#cart-summary"], and from step 2 onwards also "#pay-btn" (at the end of the list)
 *
 * Hint: requiredElements().filter(...)
 */
export abstract class BasePage {
  constructor(protected readonly baseUrl: string) {}

  abstract readonly path: string;
  protected abstract requiredElements(): string[];

  open(visibleElements: string[]): string {
    throw new Error("TODO");
  }
}

export class LoginPage extends BasePage {
  readonly path = "TODO";

  protected requiredElements(): string[] {
    throw new Error("TODO");
  }
}

export class DashboardPage extends BasePage {
  readonly path = "TODO";

  protected requiredElements(): string[] {
    throw new Error("TODO");
  }
}

export class CheckoutPage extends BasePage {
  readonly path: string;

  constructor(
    baseUrl: string,
    private step: number,
  ) {
    super(baseUrl);
    throw new Error("TODO");
  }

  protected requiredElements(): string[] {
    throw new Error("TODO");
  }
}

// ============================================================
// Self-check – run:  npm run exercise -- 05 01
// On every line, the value left of "=> expected:" must equal the value on its right.
// (No need to change the code below this line)
// ============================================================

console.log("\n--- Exercise 1: ApiEndpoint ---");
try {
  const getUsers = new GetUsersEndpoint();
  const createUser = new CreateUserEndpoint();
  const deleteUser = new DeleteUserEndpoint(42);

  console.log(getUsers.describe(), "=> expected:", "GET /users");
  console.log(createUser.describe(), "=> expected:", "POST /users");
  console.log(deleteUser.describe(), "=> expected:", "DELETE /users/42");
  console.log(new DeleteUserEndpoint(7).path, "=> expected:", "/users/7");
  console.log(deleteUser.method, "=> expected:", "DELETE");

  const endpoints: ApiEndpoint[] = [getUsers, createUser, deleteUser];
  console.log(
    endpoints.every((e) => e instanceof ApiEndpoint),
    "=> expected:",
    true,
  );
  console.log(
    endpoints.map((e) => e.method),
    "=> expected:",
    ["GET", "POST", "DELETE"],
  );
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 2: DataGenerator ---");
try {
  console.log(new EmailGenerator("test.io").generate(3), "=> expected:", "user3@test.io");
  console.log(new PhoneGenerator().generate(42), "=> expected:", "050-0000042");
  console.log(new PhoneGenerator().generate(1234567), "=> expected:", "050-1234567");
  console.log(new UsernameGenerator("qa").generate(7), "=> expected:", "qa_7");

  console.log(new UsernameGenerator("qa").generateMany(3), "=> expected:", ["qa_1", "qa_2", "qa_3"]);
  console.log(new EmailGenerator("x.com").generateMany(2), "=> expected:", ["user1@x.com", "user2@x.com"]);
  console.log(new PhoneGenerator().generateMany(0), "=> expected:", []);
  console.log(new PhoneGenerator().generateMany(-3), "=> expected:", []);

  // The same shared method – different results depending on the class
  const generators: DataGenerator[] = [
    new EmailGenerator("qa.dev"),
    new PhoneGenerator(),
    new UsernameGenerator("tester"),
  ];
  console.log(
    generators.map((g) => g.generateMany(1)[0]),
    "=> expected:",
    ["user1@qa.dev", "050-0000001", "tester_1"],
  );
  console.log(
    generators.every((g) => g instanceof DataGenerator),
    "=> expected:",
    true,
  );
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 3: BaseForm ---");
try {
  const login = new LoginForm();
  console.log(login.submit({ username: "dana", password: "secret1" }), "=> expected:", []);
  console.log(login.submit({ username: "dana", password: "123" }), "=> expected:", ["password: invalid"]);
  console.log(
    login.submit({ username: "", password: "" }),
    "=> expected:",
    ["username: required", "password: required"],
  );
  console.log(login.submit({}), "=> expected:", ["username: required", "password: required"]);
  console.log(login.fields, "=> expected:", ["username", "password"]);

  const signup = new SignupForm();
  console.log(signup.fields, "=> expected:", ["email", "password", "age"]);
  console.log(signup.submit({ email: "qa@site.com", password: "passw0rd!", age: "30" }), "=> expected:", []);
  console.log(signup.submit({ email: "a@b.com" }), "=> expected:", ["password: required", "age: required"]);
  console.log(
    signup.submit({ email: "no-at-sign", password: "longpassword", age: "17" }),
    "=> expected:",
    ["email: invalid", "password: invalid", "age: invalid"],
  );
  console.log(signup.submit({ email: "a@b", password: "abc12345", age: "18.5" }), "=> expected:", ["age: invalid"]);
  console.log(signup.submit({ email: "a@b", password: "abc12345", age: "120" }), "=> expected:", []);
  console.log(signup.submit({ email: "a@b", password: "abc12345", age: "121" }), "=> expected:", ["age: invalid"]);
  console.log(signup.submit({ email: "a@b", password: "abc12345", age: "abc" }), "=> expected:", ["age: invalid"]);
  // Extra fields – ignored
  console.log(
    signup.submit({ email: "a@b", password: "abc12345", age: "40", coupon: "X" }),
    "=> expected:",
    [],
  );

  const forms: BaseForm[] = [login, signup];
  console.log(
    forms.map((f) => f.submit({}).length),
    "=> expected:",
    [2, 3],
  );
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 4: Role & rolesAllowedTo ---");
try {
  const viewer = new ViewerRole();
  const editor = new EditorRole();
  const admin = new AdminRole();

  console.log(viewer.can("read"), "=> expected:", true);
  console.log(viewer.can("write"), "=> expected:", false);
  console.log(editor.can("write"), "=> expected:", true);
  console.log(editor.can("delete"), "=> expected:", false);
  console.log(admin.can("delete"), "=> expected:", true);
  console.log(admin.can("anything-at-all"), "=> expected:", true);
  console.log([viewer.name, editor.name, admin.name], "=> expected:", ["viewer", "editor", "admin"]);

  const roles: Role[] = [viewer, editor, admin];
  console.log(rolesAllowedTo(roles, "read"), "=> expected:", ["viewer", "editor", "admin"]);
  console.log(rolesAllowedTo(roles, "write"), "=> expected:", ["editor", "admin"]);
  console.log(rolesAllowedTo(roles, "delete"), "=> expected:", ["admin"]);
  console.log(rolesAllowedTo([viewer, editor], "delete"), "=> expected:", []);
  console.log(rolesAllowedTo([], "read"), "=> expected:", []);
  console.log(
    roles.every((r) => r instanceof Role),
    "=> expected:",
    true,
  );
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 5 (Bonus): BasePage.open ---");
try {
  const base = "http://localhost:3000";
  const login = new LoginPage(base);
  console.log(
    login.open(["#username", "#password", "#login-btn", "#footer"]),
    "=> expected:",
    "http://localhost:3000/login",
  );
  // Missing elements – throws an error listing what is missing
  try {
    login.open(["#username"]);
    console.log("did not throw", "=> expected:", "threw:", "/login is missing: #password, #login-btn");
  } catch (err) {
    if ((err as Error).message === "TODO") throw err;
    console.log(
      "threw:",
      (err as Error).message,
      "=> expected:",
      "threw:",
      "/login is missing: #password, #login-btn",
    );
  }
  try {
    login.open([]);
    console.log(
      "did not throw",
      "=> expected:",
      "threw:",
      "/login is missing: #username, #password, #login-btn",
    );
  } catch (err) {
    if ((err as Error).message === "TODO") throw err;
    console.log(
      "threw:",
      (err as Error).message,
      "=> expected:",
      "threw:",
      "/login is missing: #username, #password, #login-btn",
    );
  }

  const dashboard = new DashboardPage(base);
  console.log(dashboard.open(["#logout", "#welcome"]), "=> expected:", "http://localhost:3000/dashboard");
  try {
    dashboard.open(["#welcome"]);
    console.log("did not throw", "=> expected:", "threw:", "/dashboard is missing: #logout");
  } catch (err) {
    if ((err as Error).message === "TODO") throw err;
    console.log("threw:", (err as Error).message, "=> expected:", "threw:", "/dashboard is missing: #logout");
  }

  const step1 = new CheckoutPage(base, 1);
  const step2 = new CheckoutPage("https://staging.shop", 2);
  console.log(step1.path, "=> expected:", "/checkout/step-1");
  console.log(step1.open(["#cart-summary"]), "=> expected:", "http://localhost:3000/checkout/step-1");
  try {
    step2.open(["#cart-summary"]);
    console.log("did not throw", "=> expected:", "threw:", "/checkout/step-2 is missing: #pay-btn");
  } catch (err) {
    if ((err as Error).message === "TODO") throw err;
    console.log(
      "threw:",
      (err as Error).message,
      "=> expected:",
      "threw:",
      "/checkout/step-2 is missing: #pay-btn",
    );
  }
  console.log(step2.open(["#cart-summary", "#pay-btn"]), "=> expected:", "https://staging.shop/checkout/step-2");

  // An array typed as the abstract class – the same call for every page
  const pages: BasePage[] = [login, dashboard, step1];
  console.log(
    pages.map((p) => p.path),
    "=> expected:",
    ["/login", "/dashboard", "/checkout/step-1"],
  );
  console.log(
    pages.every((p) => p instanceof BasePage),
    "=> expected:",
    true,
  );
} catch (e) {
  console.log("  ✋", (e as Error).message);
}
