// שיעור 10 – דוגמה 3: איסוף ראיות בכישלון – Screenshot, HTML, תשובת API ולוג
// הרצה:  npx tsx lessons/10-ci-cd-logs-reports/examples/03-evidence-on-failure.ts
//
// כשבדיקה נכשלת ב-CI, אין לנו גישה למסך. לכן בזמן הכישלון שומרים "ראיות":
//   📸 צילום מסך        – מה המשתמש ראה
//   🧾 HTML של הדף      – מבנה ה-DOM ברגע הכישלון
//   📦 בקשה/תשובה      – מה השרת החזיר
//   📝 לוג              – מה קרה לפני הכישלון
// ב-Playwright זה מובנה: screenshot: 'only-on-failure', trace: 'retain-on-failure', video.
// כאן נבנה את הרעיון בעצמנו כדי להבין מה קורה "מתחת למכסה".

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { startMockApi } from "../../../shared/mock-api/server.ts";

const runId = new Date().toISOString().replace(/[:.]/g, "-");
const evidenceDir = join("reports", "evidence", runId);
mkdirSync(evidenceDir, { recursive: true });

const logLines: string[] = [];
const log = (msg: string) => {
  const line = `[${new Date().toISOString()}] ${msg}`;
  logLines.push(line);
  console.log(line);
};

/** ניסיון לצלם מסך אמיתי עם Playwright – אם מותקן. אחרת שומרים רק HTML. */
async function captureScreenshot(url: string, file: string): Promise<boolean> {
  try {
    const pw = await import("playwright" as string);
    const browser = await pw.chromium.launch();
    const page = await browser.newPage();
    await page.goto(url);
    await page.screenshot({ path: file, fullPage: true });
    await browser.close();
    return true;
  } catch {
    return false; // Playwright או הדפדפן לא מותקנים – זה בסדר לדוגמה הזו
  }
}

async function collectEvidence(testName: string, baseUrl: string, apiResponse: unknown): Promise<void> {
  const slug = testName.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  const html = await (await fetch(`${baseUrl}/app`)).text();
  writeFileSync(join(evidenceDir, `${slug}.html`), html);

  writeFileSync(join(evidenceDir, `${slug}.response.json`), JSON.stringify(apiResponse, null, 2));

  const shot = join(evidenceDir, `${slug}.png`);
  const hasShot = await captureScreenshot(`${baseUrl}/app`, shot);
  log(hasShot ? `📸 screenshot saved: ${shot}` : "📸 screenshot skipped (run 'npx playwright install chromium' to enable)");

  writeFileSync(join(evidenceDir, `${slug}.log`), logLines.join("\n"));
  log(`🗂  evidence saved in ${evidenceDir}`);
}

// ---------- "בדיקה" שנכשלת בכוונה ----------
const api = await startMockApi();
const testName = "User 2 should be admin";
try {
  log(`▶ ${testName}`);
  const res = await fetch(`${api.url}/users/2`);
  const body = (await res.json()) as { role: string };
  log(`GET /users/2 -> ${res.status} ${JSON.stringify(body)}`);
  try {
    if (body.role !== "admin") throw new Error(`expected role "admin" but got "${body.role}"`);
    log("✔ passed");
  } catch (err) {
    log(`✘ FAILED: ${(err as Error).message}`);
    await collectEvidence(testName, api.url, { status: res.status, body });
  }
} finally {
  await api.close();
}
