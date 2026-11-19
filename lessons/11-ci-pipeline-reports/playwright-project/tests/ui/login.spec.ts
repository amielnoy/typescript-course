// בדיקות UI עם Playwright מול דף ה-Demo של שרת ה-Mock (/app)
import { test, expect } from "@playwright/test";

test.describe("Login page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/app");
  });

  test("valid credentials show welcome message", { tag: "@smoke" }, async ({ page }) => {
    await page.locator("#username").fill("admin");
    await page.locator("#password").fill("1234");
    await page.getByRole("button", { name: "Login" }).click();
    // expect מחכה אוטומטית (auto-wait) עד שהטקסט מופיע – אין צורך ב-sleep
    await expect(page.getByRole("status")).toHaveText("Welcome, admin!");
  });

  test("invalid credentials show an error", { tag: "@regression" }, async ({ page }) => {
    await page.locator("#username").fill("admin");
    await page.locator("#password").fill("wrong");
    await page.getByRole("button", { name: "Login" }).click();
    await expect(page.getByRole("status")).toHaveText("Invalid credentials");
  });

  // 🎯 תרגיל (שיעור 11): שנו את הטקסט הצפוי כאן ל-"Welcome!" כדי שהבדיקה תיכשל,
  // הריצו, ואז פתחו את הדוח: npx playwright show-report  – תראו צילום מסך, וידאו ו-Trace.
  test("page title", { tag: "@regression" }, async ({ page }) => {
    await expect(page).toHaveTitle("Demo App");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Demo Login");
  });
});
