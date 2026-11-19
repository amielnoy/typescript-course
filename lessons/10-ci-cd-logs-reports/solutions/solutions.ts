// Lesson 10 – Summary solutions
export type Level = "debug" | "info" | "warn" | "error";

export function formatLogLine(level: Level, message: string, date: Date, context?: string): string {
  const ctx = context ? ` [${context}]` : "";
  return `[${date.toISOString()}] [${level.toUpperCase()}]${ctx} ${message}`;
}

const ORDER: Record<Level, number> = { debug: 0, info: 1, warn: 2, error: 3 };

export function shouldLog(minLevel: Level, level: Level): boolean {
  return ORDER[level] >= ORDER[minLevel];
}

export interface TestResult {
  name: string;
  status: "passed" | "failed" | "skipped";
  durationMs: number;
  error?: string;
}

export interface Summary {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  passRate: number;
  durationMs: number;
}

export function summarize(results: TestResult[]): Summary {
  const count = (s: TestResult["status"]) => results.filter((r) => r.status === s).length;
  const passed = count("passed");
  const failed = count("failed");
  const executed = passed + failed;
  return {
    total: results.length,
    passed,
    failed,
    skipped: count("skipped"),
    passRate: executed === 0 ? 0 : Math.round((passed / executed) * 100),
    durationMs: results.reduce((sum, r) => sum + r.durationMs, 0),
  };
}

export function toMarkdownSummary(results: TestResult[]): string {
  const s = summarize(results);
  const lines = [
    `## Test Results: ${s.failed > 0 ? "FAILED" : "PASSED"}`,
    "| Total | Passed | Failed | Skipped | Pass rate |",
    "|---|---|---|---|---|",
    `| ${s.total} | ${s.passed} | ${s.failed} | ${s.skipped} | ${s.passRate}% |`,
  ];
  const failures = results.filter((r) => r.status === "failed");
  if (failures.length > 0) {
    lines.push("", "### Failures", ...failures.map((f) => `- **${f.name}**: ${f.error ?? ""}`));
  }
  return lines.join("\n");
}

const escapeXml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function toJUnitXml(suiteName: string, results: TestResult[]): string {
  const s = summarize(results);
  const cases = results.map((r) => {
    const open = `  <testcase name="${escapeXml(r.name)}" time="${r.durationMs / 1000}"`;
    if (r.status === "failed") return `${open}><failure message="${escapeXml(r.error ?? "")}"/></testcase>`;
    if (r.status === "skipped") return `${open}><skipped/></testcase>`;
    return `${open}/>`;
  });
  return [
    `<testsuite name="${escapeXml(suiteName)}" tests="${s.total}" failures="${s.failed}" skipped="${s.skipped}">`,
    ...cases,
    "</testsuite>",
  ].join("\n");
}

export function evidenceFileName(testName: string, date: Date, ext: string): string {
  const slug = testName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const stamp = date.toISOString().replace(/[:.]/g, "-");
  return `${slug}_${stamp}.${ext}`;
}

// ============================================================
// Self-check – run:  npm run solution -- 10
// On every line, the value left of "=> expected:" must equal the value on its right.
// (No need to change the code below this line)
// Multi-line text (Markdown, XML) is printed as an array of lines – so it's easy to see which line differs.
// ============================================================

const sampleDate = new Date("2026-11-08T10:00:00.000Z");
const sampleResults: TestResult[] = [
  { name: "login", status: "passed", durationMs: 100 },
  { name: "search", status: "failed", durationMs: 250, error: "expected 3 got 2" },
  { name: "cart", status: "passed", durationMs: 50 },
  { name: "pay", status: "passed", durationMs: 100 },
];

console.log("\n--- Exercise 1: formatLogLine ---");
try {
  console.log(formatLogLine("info", "Opening page", sampleDate), "=> expected:", "[2026-11-08T10:00:00.000Z] [INFO] Opening page");
  console.log(
    formatLogLine("error", "Timeout", sampleDate, "login"),
    "=> expected:",
    "[2026-11-08T10:00:00.000Z] [ERROR] [login] Timeout",
  );
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 2: shouldLog ---");
try {
  console.log(shouldLog("warn", "error"), "=> expected:", true);
  console.log(shouldLog("warn", "info"), "=> expected:", false);
  console.log(shouldLog("info", "info"), "=> expected:", true);
  console.log(shouldLog("debug", "debug"), "=> expected:", true);
  console.log(shouldLog("error", "warn"), "=> expected:", false);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 3: summarize ---");
try {
  console.log(summarize(sampleResults), "=> expected:", {
    total: 4,
    passed: 3,
    failed: 1,
    skipped: 0,
    passRate: 75,
    durationMs: 500,
  });
  console.log(summarize([{ name: "x", status: "skipped", durationMs: 0 }]).passRate, "=> expected:", 0);
  console.log(summarize([]).total, "=> expected:", 0);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 4: toMarkdownSummary ---");
try {
  console.log(toMarkdownSummary(sampleResults).split("\n"), "=> expected:", [
    "## Test Results: FAILED",
    "| Total | Passed | Failed | Skipped | Pass rate |",
    "|---|---|---|---|---|",
    "| 4 | 3 | 1 | 0 | 75% |",
    "",
    "### Failures",
    "- **search**: expected 3 got 2",
  ]);
  const ok = toMarkdownSummary([sampleResults[0]]);
  console.log(ok.split("\n")[0], "=> expected:", "## Test Results: PASSED");
  console.log(ok.includes("Failures"), "=> expected:", false);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 5: toJUnitXml ---");
try {
  const xml = toJUnitXml("API", [
    { name: "a", status: "passed", durationMs: 100 },
    { name: "b", status: "failed", durationMs: 250, error: "boom" },
    { name: "c", status: "skipped", durationMs: 0 },
  ]);
  console.log(xml.split("\n"), "=> expected:", [
    '<testsuite name="API" tests="3" failures="1" skipped="1">',
    '  <testcase name="a" time="0.1"/>',
    '  <testcase name="b" time="0.25"><failure message="boom"/></testcase>',
    '  <testcase name="c" time="0"><skipped/></testcase>',
    "</testsuite>",
  ]);
  const escaped = toJUnitXml("A&B", [{ name: "<x>", status: "failed", durationMs: 0, error: 'say "hi"' }]);
  console.log(escaped.includes('name="A&amp;B"'), "=> expected:", true);
  console.log(escaped.includes('name="&lt;x&gt;"'), "=> expected:", true);
  console.log(escaped.includes('message="say &quot;hi&quot;"'), "=> expected:", true);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 6: evidenceFileName ---");
try {
  console.log(
    evidenceFileName("Login with VALID user!", sampleDate, "png"),
    "=> expected:",
    "login-with-valid-user_2026-11-08T10-00-00-000Z.png",
  );
  console.log(
    evidenceFileName("  GET /users/1  ", sampleDate, "json"),
    "=> expected:",
    "get-users-1_2026-11-08T10-00-00-000Z.json",
  );
} catch (e) {
  console.log("  ✋", (e as Error).message);
}
