// בדיקות API עם Playwright (request fixture) מול שרת ה-Mock
import { test, expect } from "@playwright/test";

test.describe("Users API", () => {
  test("health check", { tag: "@smoke" }, async ({ request }) => {
    const res = await request.get("/health");
    expect(res.status()).toBe(200);
    expect(await res.json()).toEqual({ status: "ok" });
  });

  test("list users", { tag: ["@smoke", "@regression"] }, async ({ request }) => {
    const res = await request.get("/users");
    expect(res.ok()).toBeTruthy();
    const users = await res.json();
    expect(users.length).toBeGreaterThan(0);
    expect(users[0]).toHaveProperty("email");
  });

  test("create user", { tag: "@regression" }, async ({ request }) => {
    const res = await request.post("/users", { data: { name: "Playwright Bot", email: "pw@example.com" } });
    expect(res.status()).toBe(201);
    const user = await res.json();
    expect(user).toMatchObject({ name: "Playwright Bot", role: "tester" });

    await test.step("new user can be fetched by id", async () => {
      const get = await request.get(`/users/${user.id}`);
      expect(get.status()).toBe(200);
    });
  });

  // Data-driven: אותה בדיקה עם כמה קלטים שגויים
  const invalidBodies = [
    { title: "missing email", data: { name: "No Email" } },
    { title: "missing name", data: { email: "x@example.com" } },
    { title: "empty body", data: {} },
  ];
  for (const { title, data } of invalidBodies) {
    test(`create user fails – ${title}`, { tag: "@regression" }, async ({ request }) => {
      const res = await request.post("/users", { data });
      expect(res.status()).toBe(400);
    });
  }

  test("unknown user returns 404", { tag: "@regression" }, async ({ request }) => {
    const res = await request.get("/users/99999");
    expect(res.status()).toBe(404);
  });
});
