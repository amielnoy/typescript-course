// הגדרות Playwright – מותאמות גם להרצה מקומית וגם ל-CI
import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.MOCK_PORT ?? 3100);
const isCI = !!process.env.CI; // GitHub Actions מגדיר CI=true אוטומטית

export default defineConfig({
  testDir: "./tests",
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: true,

  // ב-CI: ניסיון חוזר לבדיקות "מהבהבות", ואיסור על test.only שנשכח בקוד
  retries: isCI ? 2 : 0,
  forbidOnly: isCI,
  workers: isCI ? 2 : undefined,

  // כמה דוחות במקביל – כל אחד לקהל אחר
  reporter: [
    ["list"], //                                     טרמינל / לוג של ה-CI
    ["html", { open: "never" }], //                  playwright-report/ – דוח אינטראקטיבי
    ["junit", { outputFile: "test-results/junit.xml" }], // לשילוב במערכות CI
    ["allure-playwright", { resultsDir: "allure-results" }], // Allure 2
  ],

  use: {
    baseURL: process.env.BASE_URL ?? `http://127.0.0.1:${PORT}`,
    screenshot: "only-on-failure", // 📸 צילום מסך רק כשנכשל
    trace: "retain-on-failure", //      🔍 Trace Viewer: כל צעד, רשת, DOM
    video: "retain-on-failure", //      🎬 וידאו של הבדיקה שנכשלה
  },

  projects: [
    { name: "api", testDir: "./tests/api" },
    { name: "chromium", testDir: "./tests/ui", use: { ...devices["Desktop Chrome"] } },
  ],

  // Playwright מפעיל את שרת ה-Mock לפני הבדיקות וסוגר אותו בסוף
  webServer: {
    command: "node --import tsx ../../../shared/mock-api/start.ts",
    url: `http://127.0.0.1:${PORT}/health`,
    env: { PORT: String(PORT) },
    reuseExistingServer: !isCI,
    timeout: 30_000,
  },
});
