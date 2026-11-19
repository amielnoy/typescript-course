// שיעור 10 – דוגמה 4: מיני Test Runner שמפיק דוחות – HTML, JUnit XML, JSON ו-GitHub Summary
// הרצה:              npm run report
// הדגמת כישלון:     DEMO_FAILURE=1 npm run report        (ב-Windows PowerShell: $env:DEMO_FAILURE=1; npm run report)
//
// זה בדיוק מה ש-Playwright / Allure עושים בשבילנו – כאן רואים את זה "מבפנים":
//   1. מריצים בדיקות ומודדים זמן
//   2. אוספים תוצאה + שגיאה + לוג לכל בדיקה
//   3. מייצרים דוחות בפורמטים שונים
//   4. מחזירים exit code – כך ה-CI יודע אם להצליח או להיכשל

import { mkdirSync, writeFileSync, appendFileSync } from "node:fs";
import { join } from "node:path";
import { startMockApi, type RunningServer } from "../../../shared/mock-api/server.ts";

type Status = "passed" | "failed" | "skipped";

interface TestCase {
  name: string;
  tags: string[];
  skip?: string;
  fn: (ctx: { api: RunningServer; log: (m: string) => void }) => Promise<void>;
}

interface TestResult {
  name: string;
  tags: string[];
  status: Status;
  durationMs: number;
  error?: string;
  logs: string[];
}

function expect<T>(actual: T, expected: T, label: string): void {
  if (actual !== expected) throw new Error(`${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
}

// ---------------- הבדיקות ----------------
const tests: TestCase[] = [
  {
    name: "Health check returns ok",
    tags: ["smoke"],
    fn: async ({ api, log }) => {
      const res = await fetch(`${api.url}/health`);
      log(`GET /health -> ${res.status}`);
      expect(res.status, 200, "status");
    },
  },
  {
    name: "List users returns 3 seeded users",
    tags: ["regression"],
    fn: async ({ api, log }) => {
      const users = (await (await fetch(`${api.url}/users`)).json()) as unknown[];
      log(`received ${users.length} users`);
      expect(users.length, 3, "users count");
    },
  },
  {
    name: "Create user returns 201 and an id",
    tags: ["regression"],
    fn: async ({ api, log }) => {
      const res = await fetch(`${api.url}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "CI Bot", email: "ci@example.com" }),
      });
      const body = (await res.json()) as { id: number };
      log(`POST /users -> ${res.status} id=${body.id}`);
      expect(res.status, 201, "status");
    },
  },
  {
    name: "Unknown user returns 404",
    tags: ["negative"],
    fn: async ({ api, log }) => {
      const res = await fetch(`${api.url}/users/12345`);
      log(`GET /users/12345 -> ${res.status}`);
      expect(res.status, 404, "status");
    },
  },
  {
    name: "Second user is an admin",
    tags: ["demo-failure"],
    skip: process.env.DEMO_FAILURE ? undefined : "enable with DEMO_FAILURE=1",
    fn: async ({ api, log }) => {
      const user = (await (await fetch(`${api.url}/users/2`)).json()) as { role: string };
      log(`user 2 role = ${user.role}`);
      expect(user.role, "admin", "role");
    },
  },
];

// ---------------- ההרצה ----------------
async function runAll(): Promise<TestResult[]> {
  const api = await startMockApi();
  const results: TestResult[] = [];
  try {
    for (const t of tests) {
      const logs: string[] = [];
      const log = (m: string) => logs.push(`${new Date().toISOString()} ${m}`);
      if (t.skip) {
        results.push({ name: t.name, tags: t.tags, status: "skipped", durationMs: 0, logs: [`skipped: ${t.skip}`] });
        console.log(`  ○ ${t.name} (skipped)`);
        continue;
      }
      const start = performance.now();
      try {
        await t.fn({ api, log });
        results.push({ name: t.name, tags: t.tags, status: "passed", durationMs: Math.round(performance.now() - start), logs });
        console.log(`  ✔ ${t.name}`);
      } catch (err) {
        const error = err instanceof Error ? err.message : String(err);
        results.push({ name: t.name, tags: t.tags, status: "failed", durationMs: Math.round(performance.now() - start), error, logs });
        console.log(`  ✘ ${t.name}\n      ${error}`);
      }
    }
  } finally {
    await api.close();
  }
  return results;
}

// ---------------- הדוחות ----------------
const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function junitXml(results: TestResult[]): string {
  const failures = results.filter((r) => r.status === "failed").length;
  const skipped = results.filter((r) => r.status === "skipped").length;
  const time = results.reduce((s, r) => s + r.durationMs, 0) / 1000;
  const cases = results
    .map((r) => {
      const inner =
        r.status === "failed"
          ? `<failure message="${esc(r.error ?? "")}"/>`
          : r.status === "skipped"
            ? "<skipped/>"
            : "";
      return `    <testcase classname="mock-api" name="${esc(r.name)}" time="${r.durationMs / 1000}">${inner}</testcase>`;
    })
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<testsuites>
  <testsuite name="Mock API" tests="${results.length}" failures="${failures}" skipped="${skipped}" time="${time}">
${cases}
  </testsuite>
</testsuites>
`;
}

function htmlReport(results: TestResult[]): string {
  const count = (s: Status) => results.filter((r) => r.status === s).length;
  const executed = count("passed") + count("failed");
  const passRate = executed ? Math.round((count("passed") / executed) * 100) : 0;
  const color: Record<Status, string> = { passed: "#1a7f37", failed: "#cf222e", skipped: "#9a6700" };
  const rows = results
    .map(
      (r) => `<tr>
  <td><span class="badge" style="background:${color[r.status]}">${r.status}</span></td>
  <td>${esc(r.name)}<div class="tags">${r.tags.map((t) => `#${esc(t)}`).join(" ")}</div>
      ${r.error ? `<div class="err">${esc(r.error)}</div>` : ""}
      <details><summary>log (${r.logs.length})</summary><pre>${esc(r.logs.join("\n"))}</pre></details></td>
  <td class="num">${r.durationMs} ms</td>
</tr>`,
    )
    .join("\n");
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Test Report</title>
<style>
 body{font-family:system-ui,Arial,sans-serif;margin:32px;color:#1f2328}
 .cards{display:flex;gap:12px;margin:16px 0}.card{border:1px solid #d0d7de;border-radius:8px;padding:12px 18px;min-width:110px}
 .card b{display:block;font-size:28px}table{border-collapse:collapse;width:100%}td,th{border-bottom:1px solid #d0d7de;padding:8px;text-align:left;vertical-align:top}
 .badge{color:#fff;border-radius:12px;padding:2px 10px;font-size:12px}.err{color:#cf222e;font-family:monospace;margin-top:4px}
 .tags{color:#57606a;font-size:12px}.num{text-align:right;white-space:nowrap}pre{background:#f6f8fa;padding:8px;font-size:12px}
</style></head><body>
<h1>Mock API – Test Report</h1>
<div>Generated ${new Date().toISOString()} ${process.env.GITHUB_RUN_ID ? `· CI run #${process.env.GITHUB_RUN_NUMBER}` : "· local run"}</div>
<div class="cards">
 <div class="card">Total<b>${results.length}</b></div>
 <div class="card" style="color:${color.passed}">Passed<b>${count("passed")}</b></div>
 <div class="card" style="color:${color.failed}">Failed<b>${count("failed")}</b></div>
 <div class="card" style="color:${color.skipped}">Skipped<b>${count("skipped")}</b></div>
 <div class="card">Pass rate<b>${passRate}%</b></div>
</div>
<table><thead><tr><th>Status</th><th>Test</th><th>Duration</th></tr></thead><tbody>
${rows}
</tbody></table></body></html>`;
}

function markdownSummary(results: TestResult[]): string {
  const icon: Record<Status, string> = { passed: "✅", failed: "❌", skipped: "⏭️" };
  const lines = results.map((r) => `| ${icon[r.status]} | ${r.name} | ${r.durationMs} ms | ${r.error ?? ""} |`);
  return [
    "## 🧪 Mock API test results",
    "",
    "| | Test | Duration | Error |",
    "|---|---|---|---|",
    ...lines,
    "",
  ].join("\n");
}

// ---------------- main ----------------
console.log("Running tests...");
const results = await runAll();

const outDir = join("reports", "mini-runner");
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "results.json"), JSON.stringify(results, null, 2));
writeFileSync(join(outDir, "junit.xml"), junitXml(results));
writeFileSync(join(outDir, "index.html"), htmlReport(results));

// GitHub Actions: כל מה שנכתב לקובץ הזה מוצג בעמוד סיכום הריצה
if (process.env.GITHUB_STEP_SUMMARY) {
  appendFileSync(process.env.GITHUB_STEP_SUMMARY, markdownSummary(results));
}

const failed = results.filter((r) => r.status === "failed").length;
console.log(`\nReports written to ${outDir}/ (index.html, junit.xml, results.json)`);
console.log(failed ? `❌ ${failed} test(s) failed` : "✅ all executed tests passed");
process.exit(failed ? 1 : 0); // ← זה מה שקובע אם שלב ה-CI ירוק או אדום
