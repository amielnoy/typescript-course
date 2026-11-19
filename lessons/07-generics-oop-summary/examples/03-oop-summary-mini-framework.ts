// שיעור 7 – דוגמה 3: תרגול OOP מסכם – מיני תשתית בדיקות API
// הרצה:  npx tsx lessons/07-generics-oop-summary/examples/03-oop-summary-mini-framework.ts
//
// הדוגמה משלבת את כל מה שלמדנו:
//   interface + type + union      -> חוזים ותוצאות
//   abstract class + inheritance  -> BaseApiTest
//   encapsulation                 -> HttpClientMock עם נתונים פרטיים
//   polymorphism                  -> TestSuite מריץ כל סוג בדיקה
//   generics                      -> ApiResponse<T>, expectEqual<T>

// ---------- חוזים ----------
interface ApiResponse<T> {
  status: number;
  body: T;
}

interface User {
  id: number;
  name: string;
  role: "admin" | "tester";
}

type TestResult = { name: string; status: "passed" } | { name: string; status: "failed"; reason: string };

// ---------- Encapsulation: "שרת" מדומה ----------
class HttpClientMock {
  private users: User[] = [
    { id: 1, name: "Dana", role: "admin" },
    { id: 2, name: "Yossi", role: "tester" },
  ];

  get<T>(path: string): ApiResponse<T> {
    if (path === "/users") return { status: 200, body: this.users as T };
    const match = path.match(/^\/users\/(\d+)$/);
    if (match) {
      const user = this.users.find((u) => u.id === Number(match[1]));
      return user ? { status: 200, body: user as T } : { status: 404, body: { error: "not found" } as T };
    }
    return { status: 404, body: {} as T };
  }
}

// ---------- assertion גנרי ----------
class AssertionError extends Error {}

function expectEqual<T>(actual: T, expected: T, label: string): void {
  if (actual !== expected) {
    throw new AssertionError(`${label}: expected ${String(expected)}, got ${String(actual)}`);
  }
}

// ---------- Abstract + Inheritance ----------
abstract class BaseApiTest {
  constructor(
    public readonly name: string,
    protected client: HttpClientMock,
  ) {}

  protected abstract test(): void;

  run(): TestResult {
    try {
      this.test();
      return { name: this.name, status: "passed" };
    } catch (err) {
      return { name: this.name, status: "failed", reason: (err as Error).message };
    }
  }
}

class GetAllUsersTest extends BaseApiTest {
  protected test(): void {
    const res = this.client.get<User[]>("/users");
    expectEqual(res.status, 200, "status");
    expectEqual(res.body.length, 2, "users count");
  }
}

class GetUserByIdTest extends BaseApiTest {
  constructor(
    client: HttpClientMock,
    private id: number,
    private expectedName: string,
  ) {
    super(`GET /users/${id} returns ${expectedName}`, client);
  }
  protected test(): void {
    const res = this.client.get<User>(`/users/${this.id}`);
    expectEqual(res.status, 200, "status");
    expectEqual(res.body.name, this.expectedName, "name");
  }
}

class NotFoundTest extends BaseApiTest {
  protected test(): void {
    expectEqual(this.client.get("/users/999").status, 404, "status");
  }
}

// ---------- Polymorphism: הסוויטה לא יודעת איזה סוג בדיקה היא מריצה ----------
class TestSuite {
  private tests: BaseApiTest[] = [];

  add(...tests: BaseApiTest[]): this {
    this.tests.push(...tests);
    return this; // מאפשר שרשור
  }

  run(): void {
    const results = this.tests.map((t) => t.run());
    for (const r of results) {
      console.log(r.status === "passed" ? `✔ ${r.name}` : `✘ ${r.name} -> ${r.reason}`);
    }
    const passed = results.filter((r) => r.status === "passed").length;
    console.log(`\n${passed}/${results.length} passed`);
  }
}

const client = new HttpClientMock();
new TestSuite()
  .add(new GetAllUsersTest("GET /users returns 2 users", client))
  .add(new GetUserByIdTest(client, 1, "Dana"))
  .add(new GetUserByIdTest(client, 2, "Noa")) // ייכשל בכוונה – כדי לראות דיווח כישלון
  .add(new NotFoundTest("GET unknown user returns 404", client))
  .run();

export {}; // הופך את הקובץ למודול (משתנים לא "מתנגשים" עם קבצים אחרים)
