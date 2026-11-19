// Lesson 10 – Topic 04: Mini Runner – building reports – Solutions
export type Status = "passed" | "failed" | "skipped";

export interface TestResult {
  name: string;
  tags: string[];
  status: Status;
  durationMs: number;
  error?: string;
}

export function ciExitCode(results: TestResult[]): 0 | 1 {
  if (results.some((r) => r.status === "failed")) return 1;
  // a run in which no test actually ran is suspicious – so it's red
  const executed = results.some((r) => r.status === "passed");
  return executed ? 0 : 1;
}

export function slowestTests(results: TestResult[], n: number): { name: string; durationMs: number }[] {
  return results
    .filter((r) => r.status !== "skipped") // filter returns a new array – the sort won't affect the original
    .sort((a, b) => b.durationMs - a.durationMs || a.name.localeCompare(b.name))
    .slice(0, n)
    .map(({ name, durationMs }) => ({ name, durationMs }));
}

export interface TagStats {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  passRate: number;
}

export function statsByTag(results: TestResult[]): Record<string, TagStats> {
  const stats: Record<string, TagStats> = {};
  for (const r of results) {
    const tags = r.tags.length > 0 ? r.tags : ["untagged"];
    for (const tag of tags) {
      const s = (stats[tag] ??= { total: 0, passed: 0, failed: 0, skipped: 0, passRate: 0 });
      s.total++;
      s[r.status]++;
    }
  }
  for (const s of Object.values(stats)) {
    const executed = s.passed + s.failed;
    s.passRate = executed === 0 ? 0 : Math.round((s.passed / executed) * 100);
  }
  return stats;
}

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function htmlRow(result: TestResult): string {
  const err = result.status === "failed" && result.error ? `<div class="err">${escapeHtml(result.error)}</div>` : "";
  return (
    `<tr class="${result.status}"><td>${result.status}</td>` +
    `<td>${escapeHtml(result.name)}${err}</td>` +
    `<td class="num">${result.durationMs} ms</td></tr>`
  );
}

export function detectFlaky(runs: TestResult[][]): string[] {
  const seen = new Map<string, Set<Status>>();
  for (const run of runs) {
    for (const r of run) {
      if (!seen.has(r.name)) seen.set(r.name, new Set());
      seen.get(r.name)!.add(r.status);
    }
  }
  return [...seen]
    .filter(([, statuses]) => statuses.has("passed") && statuses.has("failed"))
    .map(([name]) => name)
    .sort();
}

export interface RunDiff {
  newFailures: string[];
  fixed: string[];
  stillFailing: string[];
}

export function compareRuns(previous: TestResult[], current: TestResult[]): RunDiff {
  const prevFailed = new Set(previous.filter((r) => r.status === "failed").map((r) => r.name));
  const diff: RunDiff = { newFailures: [], fixed: [], stillFailing: [] };
  for (const r of current) {
    const wasFailing = prevFailed.has(r.name);
    if (r.status === "failed") (wasFailing ? diff.stillFailing : diff.newFailures).push(r.name);
    else if (r.status === "passed" && wasFailing) diff.fixed.push(r.name);
  }
  diff.newFailures.sort();
  diff.fixed.sort();
  diff.stillFailing.sort();
  return diff;
}

// ============================================================
// Self-check – run:  npm run solution -- 10 04
// On every line, the value left of "=> expected:" must equal the value on its right.
// (No need to change the code below this line)
// ============================================================

const makeResult = (name: string, status: Status, durationMs = 0, tags: string[] = [], error?: string): TestResult =>
  error === undefined ? { name, tags, status, durationMs } : { name, tags, status, durationMs, error };

const sampleResults: TestResult[] = [
  makeResult("login", "passed", 120, ["smoke", "auth"]),
  makeResult("search", "failed", 400, ["regression"], "expected 3 got 2"),
  makeResult("checkout", "passed", 900, ["regression", "smoke"]),
  makeResult("profile", "passed", 400, ["regression"]),
  makeResult("admin", "skipped", 5000, ["auth"]),
  makeResult("logout", "passed", 30),
];

console.log("\n--- Exercise 1: ciExitCode ---");
try {
  console.log(ciExitCode([makeResult("a", "passed"), makeResult("b", "skipped")]), "=> expected:", 0);
  console.log(ciExitCode(sampleResults), "=> expected:", 1);
  console.log(ciExitCode([makeResult("a", "failed")]), "=> expected:", 1);
  console.log(ciExitCode([]), "=> expected:", 1);
  console.log(ciExitCode([makeResult("a", "skipped"), makeResult("b", "skipped")]), "=> expected:", 1);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 2: slowestTests ---");
try {
  const namesBefore = sampleResults.map((x) => x.name);
  console.log(slowestTests(sampleResults, 2), "=> expected:", [
    { name: "checkout", durationMs: 900 },
    { name: "profile", durationMs: 400 },
  ]);
  console.log(slowestTests(sampleResults, 3), "=> expected:", [
    { name: "checkout", durationMs: 900 },
    { name: "profile", durationMs: 400 },
    { name: "search", durationMs: 400 },
  ]);
  // Skipped tests are not included:
  console.log(slowestTests(sampleResults, 100).length, "=> expected:", 5);
  console.log(slowestTests(sampleResults, 0), "=> expected:", []);
  console.log(slowestTests([], 3), "=> expected:", []);
  // The original array was not changed (not sorted in place):
  console.log(sampleResults.map((x) => x.name), "=> expected:", namesBefore);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 3: statsByTag ---");
try {
  console.log(
    statsByTag([
      makeResult("a", "passed", 1, ["smoke", "api"]),
      makeResult("b", "failed", 1, ["api"]),
      makeResult("c", "skipped", 0, []),
    ]),
    "=> expected:",
    {
      smoke: { total: 1, passed: 1, failed: 0, skipped: 0, passRate: 100 },
      api: { total: 2, passed: 1, failed: 1, skipped: 0, passRate: 50 },
      untagged: { total: 1, passed: 0, failed: 0, skipped: 1, passRate: 0 },
    },
  );
  console.log(statsByTag(sampleResults), "=> expected:", {
    smoke: { total: 2, passed: 2, failed: 0, skipped: 0, passRate: 100 },
    auth: { total: 2, passed: 1, failed: 0, skipped: 1, passRate: 100 },
    regression: { total: 3, passed: 2, failed: 1, skipped: 0, passRate: 67 },
    untagged: { total: 1, passed: 1, failed: 0, skipped: 0, passRate: 100 },
  });
  console.log(statsByTag([]), "=> expected:", {});
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 4: htmlRow ---");
try {
  console.log(
    JSON.stringify(htmlRow(makeResult("login", "passed", 120))),
    "=> expected:",
    JSON.stringify('<tr class="passed"><td>passed</td><td>login</td><td class="num">120 ms</td></tr>'),
  );
  console.log(
    JSON.stringify(htmlRow(makeResult("search", "failed", 250, [], "expected 3 got 2"))),
    "=> expected:",
    JSON.stringify(
      '<tr class="failed"><td>failed</td><td>search<div class="err">expected 3 got 2</div></td><td class="num">250 ms</td></tr>',
    ),
  );
  console.log(
    JSON.stringify(htmlRow(makeResult("admin", "skipped", 0))),
    "=> expected:",
    JSON.stringify('<tr class="skipped"><td>skipped</td><td>admin</td><td class="num">0 ms</td></tr>'),
  );
  console.log(
    JSON.stringify(htmlRow(makeResult("<script>alert(1)</script> & co", "failed", 1, [], 'expected "a" < "b"'))),
    "=> expected:",
    JSON.stringify(
      '<tr class="failed"><td>failed</td><td>&lt;script&gt;alert(1)&lt;/script&gt; &amp; co' +
        '<div class="err">expected &quot;a&quot; &lt; &quot;b&quot;</div></td><td class="num">1 ms</td></tr>',
    ),
  );
  console.log(
    JSON.stringify(htmlRow(makeResult("no message", "failed", 3))),
    "=> expected:",
    JSON.stringify('<tr class="failed"><td>failed</td><td>no message</td><td class="num">3 ms</td></tr>'),
  );
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 5: detectFlaky ---");
try {
  console.log(
    detectFlaky([
      [makeResult("login", "passed"), makeResult("search", "failed"), makeResult("pay", "passed")],
      [makeResult("login", "passed"), makeResult("search", "passed"), makeResult("pay", "passed")],
      [makeResult("login", "failed"), makeResult("search", "failed"), makeResult("pay", "skipped")],
    ]),
    "=> expected:",
    ["login", "search"],
  );
  // Always failing / skipped+passed – that's not flaky:
  console.log(
    detectFlaky([
      [makeResult("x", "failed"), makeResult("y", "skipped")],
      [makeResult("x", "failed"), makeResult("y", "passed")],
    ]),
    "=> expected:",
    [],
  );
  console.log(detectFlaky([[makeResult("only-once", "failed")]]), "=> expected:", []);
  console.log(detectFlaky([]), "=> expected:", []);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 6 (Bonus): compareRuns ---");
try {
  console.log(
    compareRuns(
      [makeResult("a", "failed"), makeResult("b", "failed"), makeResult("c", "passed")],
      [makeResult("a", "passed"), makeResult("b", "failed"), makeResult("c", "failed"), makeResult("d", "failed")],
    ),
    "=> expected:",
    { newFailures: ["c", "d"], fixed: ["a"], stillFailing: ["b"] },
  );
  console.log(
    compareRuns(
      [
        makeResult("z", "failed"),
        makeResult("gone", "failed"),
        makeResult("skippedNow", "failed"),
        makeResult("m", "skipped"),
      ],
      [
        makeResult("skippedNow", "skipped"),
        makeResult("z", "passed"),
        makeResult("m", "failed"),
        makeResult("k", "failed"),
      ],
    ),
    "=> expected:",
    { newFailures: ["k", "m"], fixed: ["z"], stillFailing: [] },
  );
  console.log(compareRuns([], []), "=> expected:", { newFailures: [], fixed: [], stillFailing: [] });
} catch (e) {
  console.log("  ✋", (e as Error).message);
}
