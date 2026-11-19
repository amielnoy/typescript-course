// Lesson 10 – Topic 02: Reporters – Solutions
export type Status = "passed" | "failed" | "skipped";

export interface TestResult {
  name: string;
  status: Status;
  durationMs: number;
  error?: string;
}

export function tapLine(index: number, name: string, status: Status): string {
  const prefix = status === "failed" ? "not ok" : "ok";
  const directive = status === "skipped" ? " # SKIP" : "";
  return `${prefix} ${index} - ${name}${directive}`;
}

const SPEC_ICON: Record<Status, string> = { passed: "✔", failed: "✖", skipped: "﹣" };

export function specLine(result: TestResult): string {
  const skip = result.status === "skipped" ? " # SKIP" : "";
  return `${SPEC_ICON[result.status]} ${result.name} (${Math.round(result.durationMs)}ms)${skip}`;
}

export interface ReporterConfig {
  name: string;
  destination?: string;
}

export function reporterArgs(reporters: ReporterConfig[]): string[] {
  // each reporter gets a pair of arguments – hence flatMap
  return reporters.flatMap((r) => [
    `--test-reporter=${r.name}`,
    `--test-reporter-destination=${r.destination ?? "stdout"}`,
  ]);
}

export function toTap(results: TestResult[]): string {
  const lines = ["TAP version 13", `1..${results.length}`];
  results.forEach((r, i) => {
    lines.push(tapLine(i + 1, r.name, r.status));
    if (r.status === "failed" && r.error) lines.push("  ---", `  error: ${r.error}`, "  ...");
  });
  return lines.join("\n");
}

export interface TapSummary {
  planned: number | null;
  passed: number;
  failed: number;
  skipped: number;
  failedNames: string[];
}

const PLAN_RE = /^1\.\.(\d+)$/;
const RESULT_RE = /^(not )?ok \d+ - (.*)$/;

export function parseTap(text: string): TapSummary {
  const summary: TapSummary = { planned: null, passed: 0, failed: 0, skipped: 0, failedNames: [] };
  for (const line of text.split(/\r?\n/)) {
    // indented lines belong to a diagnostic block or a subtest – don't count them
    if (/^\s/.test(line)) continue;

    const plan = PLAN_RE.exec(line);
    if (plan) {
      summary.planned = Number(plan[1]);
      continue;
    }

    const result = RESULT_RE.exec(line);
    if (!result) continue;
    const [, notOk, rest] = result;
    const name = rest.replace(/\s*#.*$/, "");
    if (notOk) {
      summary.failed++;
      summary.failedNames.push(name);
    } else if (/#\s*skip/i.test(rest)) {
      summary.skipped++;
    } else {
      summary.passed++;
    }
  }
  return summary;
}

export interface JUnitFailure {
  name: string;
  message: string;
}

const ENTITIES: Record<string, string> = { lt: "<", gt: ">", quot: '"', apos: "'", amp: "&" };

// a single pass over the text – so "&amp;lt;" becomes "&lt;" and not "<"
const unescapeXml = (s: string) =>
  s.replace(/&(#\d+|lt|gt|quot|apos|amp);/g, (_, entity: string) =>
    entity.startsWith("#") ? String.fromCharCode(Number(entity.slice(1))) : ENTITIES[entity],
  );

const attr = (attrs: string, name: string): string | undefined => {
  const m = new RegExp(`\\b${name}="([^"]*)"`).exec(attrs);
  return m ? unescapeXml(m[1]) : undefined;
};

export function parseJUnitFailures(xml: string): JUnitFailure[] {
  const failures: JUnitFailure[] = [];
  for (const [, attrs, body = ""] of xml.matchAll(/<testcase\b([^>]*?)(?:\/>|>([\s\S]*?)<\/testcase>)/g)) {
    const failure = /<failure\b([^>]*?)\/?>/.exec(body);
    if (!failure) continue; // passed or skipped
    failures.push({ name: attr(attrs, "name") ?? "", message: attr(failure[1], "message") ?? "" });
  }
  return failures;
}

// ============================================================
// Self-check – run:  npm run solution -- 10 02
// On every line, the value left of "=> expected:" must equal the value on its right.
// (No need to change the code below this line)
// Multi-line text (TAP) is printed as an array of lines – so it's easy to see which line differs.
// ============================================================

const sampleResults: TestResult[] = [
  { name: "a", status: "passed", durationMs: 100 },
  { name: "b", status: "failed", durationMs: 250, error: "boom" },
  { name: "c", status: "skipped", durationMs: 0 },
];

const junitSample = `<?xml version="1.0" encoding="utf-8"?>
<testsuites>
\t<testsuite name="Users API" time="0.05" disabled="0" errors="0" tests="5" failures="2" skipped="1" hostname="runner">
\t\t<testcase name="GET /health returns ok" time="0.01" classname="test"/>
\t\t<testcase name="GET /users/999 returns 404" time="0.02" classname="test">
\t\t\t<failure type="testCodeFailure" message="Expected values to be strictly equal:&#10;&#10;200 !== 404&#10;">
[Error [ERR_ASSERTION]: Expected values to be strictly equal:
    at TestContext.&lt;anonymous&gt; (users-api.test.ts:31:12)]
\t\t\t</failure>
\t\t</testcase>
\t\t<testcase name="POST &quot;No Email&quot; &amp; &lt;b&gt;" time="0.01" classname="test">
\t\t\t<failure type="testCodeFailure" message="got &apos;200&apos; &amp;amp; more">stack</failure>
\t\t</testcase>
\t\t<testcase name="DELETE /users/1 as non-admin" time="0" classname="test">
\t\t\t<skipped type="skipped" message="not implemented yet"/>
\t\t</testcase>
\t\t<testcase name="crash without message" time="0" classname="test"><failure type="uncaught"/></testcase>
\t</testsuite>
</testsuites>`;

console.log("\n--- Exercise 1: tapLine ---");
try {
  console.log(tapLine(1, "GET /health", "passed"), "=> expected:", "ok 1 - GET /health");
  console.log(tapLine(2, "GET /users", "failed"), "=> expected:", "not ok 2 - GET /users");
  console.log(tapLine(3, "DELETE /users", "skipped"), "=> expected:", "ok 3 - DELETE /users # SKIP");
  console.log(tapLine(10, "x", "passed"), "=> expected:", "ok 10 - x");
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 2: specLine ---");
try {
  console.log(specLine({ name: "login", status: "passed", durationMs: 12.4 }), "=> expected:", "✔ login (12ms)");
  console.log(specLine({ name: "search", status: "failed", durationMs: 250, error: "x" }), "=> expected:", "✖ search (250ms)");
  console.log(specLine({ name: "pay", status: "skipped", durationMs: 0 }), "=> expected:", "﹣ pay (0ms) # SKIP");
  console.log(specLine({ name: "slow", status: "passed", durationMs: 1999.5 }), "=> expected:", "✔ slow (2000ms)");
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 3: reporterArgs ---");
try {
  console.log(reporterArgs([{ name: "spec" }, { name: "junit", destination: "reports/junit.xml" }]), "=> expected:", [
    "--test-reporter=spec",
    "--test-reporter-destination=stdout",
    "--test-reporter=junit",
    "--test-reporter-destination=reports/junit.xml",
  ]);
  console.log(reporterArgs([{ name: "tap", destination: "out.tap" }]), "=> expected:", [
    "--test-reporter=tap",
    "--test-reporter-destination=out.tap",
  ]);
  console.log(reporterArgs([]), "=> expected:", []);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 4: toTap ---");
try {
  console.log(toTap(sampleResults).split("\n"), "=> expected:", [
    "TAP version 13",
    "1..3",
    "ok 1 - a",
    "not ok 2 - b",
    "  ---",
    "  error: boom",
    "  ...",
    "ok 3 - c # SKIP",
  ]);
  console.log(toTap([]).split("\n"), "=> expected:", ["TAP version 13", "1..0"]);
  console.log(toTap([{ name: "no message", status: "failed", durationMs: 1 }]).split("\n"), "=> expected:", [
    "TAP version 13",
    "1..1",
    "not ok 1 - no message",
  ]);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 5: parseTap ---");
try {
  console.log(parseTap("TAP version 13\n1..2\nok 1 - a\nnot ok 2 - b"), "=> expected:", {
    planned: 2,
    passed: 1,
    failed: 1,
    skipped: 0,
    failedNames: ["b"],
  });
  const nodeLike = [
    "TAP version 13",
    "# Subtest: Users API",
    "    ok 1 - inner subtest is ignored",
    "ok 1 - GET /health returns ok",
    "  ---",
    "  duration_ms: 12.3",
    "  ...",
    "not ok 2 - GET /users/999 returns 404 # time=12ms",
    "  ---",
    "  error: 'expected 404'",
    "  ...",
    "ok 3 - DELETE /users/1 # skip not implemented",
    "not ok 4 - POST /users",
    "1..4",
    "# tests 4",
  ].join("\r\n");
  console.log(parseTap(nodeLike), "=> expected:", {
    planned: 4,
    passed: 1,
    failed: 2,
    skipped: 1,
    failedNames: ["GET /users/999 returns 404", "POST /users"],
  });
  console.log(parseTap(""), "=> expected:", { planned: null, passed: 0, failed: 0, skipped: 0, failedNames: [] });
  // Whatever toTap writes, parseTap must be able to read
  console.log(parseTap(toTap(sampleResults)), "=> expected:", {
    planned: 3,
    passed: 1,
    failed: 1,
    skipped: 1,
    failedNames: ["b"],
  });
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 6 (Bonus): parseJUnitFailures ---");
try {
  console.log(parseJUnitFailures(junitSample), "=> expected:", [
    { name: "GET /users/999 returns 404", message: "Expected values to be strictly equal:\n\n200 !== 404\n" },
    { name: 'POST "No Email" & <b>', message: "got '200' &amp; more" },
    { name: "crash without message", message: "" },
  ]);
  console.log(parseJUnitFailures('<testsuite name="ok"><testcase name="a" time="0.1"/></testsuite>'), "=> expected:", []);
  console.log(parseJUnitFailures(""), "=> expected:", []);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}
