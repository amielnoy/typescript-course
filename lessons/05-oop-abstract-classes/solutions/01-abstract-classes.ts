// Lesson 5 – Topic 01: Abstract Classes – Solutions

// ---------- Exercise 1 ----------
export abstract class ApiEndpoint {
  abstract readonly method: string;
  abstract readonly path: string;

  // Shared code that uses abstract members – the values come from the subclass
  describe(): string {
    return `${this.method} ${this.path}`;
  }
}

export class GetUsersEndpoint extends ApiEndpoint {
  readonly method = "GET";
  readonly path = "/users";
}

export class CreateUserEndpoint extends ApiEndpoint {
  readonly method = "POST";
  readonly path = "/users";
}

export class DeleteUserEndpoint extends ApiEndpoint {
  readonly method = "DELETE";
  readonly path: string;

  constructor(id: number) {
    super();
    this.path = `/users/${id}`;
  }
}

// ---------- Exercise 2 ----------
export abstract class DataGenerator {
  abstract generate(index: number): string;

  generateMany(count: number): string[] {
    const values: string[] = [];
    for (let i = 1; i <= count; i++) {
      values.push(this.generate(i));
    }
    return values;
  }
}

export class EmailGenerator extends DataGenerator {
  constructor(private domain: string) {
    super();
  }

  generate(index: number): string {
    return `user${index}@${this.domain}`;
  }
}

export class PhoneGenerator extends DataGenerator {
  generate(index: number): string {
    return `050-${String(index).padStart(7, "0")}`;
  }
}

export class UsernameGenerator extends DataGenerator {
  constructor(private prefix: string) {
    super();
  }

  generate(index: number): string {
    return `${this.prefix}_${index}`;
  }
}

// ---------- Exercise 3 ----------
export abstract class BaseForm {
  abstract readonly fields: string[];
  protected abstract isValid(field: string, value: string): boolean;

  submit(data: Record<string, string>): string[] {
    const problems: string[] = [];
    for (const field of this.fields) {
      const value = data[field];
      if (value === undefined || value === "") {
        problems.push(`${field}: required`);
      } else if (!this.isValid(field, value)) {
        problems.push(`${field}: invalid`);
      }
    }
    return problems;
  }
}

export class LoginForm extends BaseForm {
  readonly fields = ["username", "password"];

  protected isValid(field: string, value: string): boolean {
    if (field === "password") return value.length >= 6;
    return true; // username – any non-empty value is valid
  }
}

export class SignupForm extends BaseForm {
  readonly fields = ["email", "password", "age"];

  protected isValid(field: string, value: string): boolean {
    switch (field) {
      case "email":
        return value.includes("@");
      case "password":
        return value.length >= 8 && /\d/.test(value);
      case "age": {
        const age = Number(value);
        return Number.isInteger(age) && age >= 18 && age <= 120;
      }
      default:
        return true;
    }
  }
}

// ---------- Exercise 4 ----------
export abstract class Role {
  abstract readonly name: string;
  protected abstract permissions(): string[];

  can(action: string): boolean {
    const allowed = this.permissions();
    return allowed.includes("*") || allowed.includes(action);
  }
}

export class ViewerRole extends Role {
  readonly name = "viewer";

  protected permissions(): string[] {
    return ["read"];
  }
}

export class EditorRole extends Role {
  readonly name = "editor";

  protected permissions(): string[] {
    return ["read", "write"];
  }
}

export class AdminRole extends Role {
  readonly name = "admin";

  protected permissions(): string[] {
    return ["*"];
  }
}

export function rolesAllowedTo(roles: Role[], action: string): string[] {
  return roles.filter((r) => r.can(action)).map((r) => r.name);
}

// ---------- Exercise 5 (Bonus) ----------
export abstract class BasePage {
  constructor(protected readonly baseUrl: string) {}

  abstract readonly path: string;
  protected abstract requiredElements(): string[];

  open(visibleElements: string[]): string {
    const missing = this.requiredElements().filter((el) => !visibleElements.includes(el));
    if (missing.length > 0) {
      throw new Error(`${this.path} is missing: ${missing.join(", ")}`);
    }
    return `${this.baseUrl}${this.path}`;
  }
}

export class LoginPage extends BasePage {
  readonly path = "/login";

  protected requiredElements(): string[] {
    return ["#username", "#password", "#login-btn"];
  }
}

export class DashboardPage extends BasePage {
  readonly path = "/dashboard";

  protected requiredElements(): string[] {
    return ["#welcome", "#logout"];
  }
}

export class CheckoutPage extends BasePage {
  readonly path: string;

  constructor(
    baseUrl: string,
    private step: number,
  ) {
    super(baseUrl);
    this.path = `/checkout/step-${step}`;
  }

  protected requiredElements(): string[] {
    return this.step >= 2 ? ["#cart-summary", "#pay-btn"] : ["#cart-summary"];
  }
}

// ============================================================
// Self-check – run:  npm run solution -- 05 01
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
