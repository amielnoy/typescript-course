// Lesson 11 – Topic 02: Reading Workflow Files – Solutions

// Exercise 1
export function getWorkflowName(yaml: string): string {
  const match = yaml.match(/^name:\s*(.+?)\s*$/m);
  if (!match) return "(no name)";
  return match[1].replace(/^(["'])(.*)\1$/, "$2");
}

// Exercise 2
export function listActions(yaml: string): string[] {
  const all = [...yaml.matchAll(/uses:\s*["']?([^\s"'#]+)/g)].map((m) => m[1]);
  return [...new Set(all)];
}

// Exercise 3
export function findUnpinnedActions(yaml: string): string[] {
  return listActions(yaml).filter((action) => {
    if (action.startsWith("./")) return false;
    const at = action.lastIndexOf("@");
    if (at === -1) return true;
    return ["main", "master", "latest"].includes(action.slice(at + 1));
  });
}

// Exercise 4
export function parseJobNeeds(yaml: string): Record<string, string[]> {
  const lines = yaml.split("\n");
  const start = lines.findIndex((l) => /^jobs:\s*$/.test(l));
  const result: Record<string, string[]> = {};
  if (start === -1) return result;

  let current: string | null = null;
  for (const line of lines.slice(start + 1)) {
    if (/^[^\s#]/.test(line)) break; // next top-level key
    const job = line.match(/^ {2}([\w-]+):\s*$/);
    if (job) {
      current = job[1];
      result[current] = [];
      continue;
    }
    const needs = line.match(/^ {4}needs:\s*(.+?)\s*$/);
    if (needs && current) {
      result[current] = needs[1]
        .replace(/^\[|\]$/g, "")
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s !== "");
    }
  }
  return result;
}

// Exercise 5
export function jobWaves(needs: Record<string, string[]>): string[][] | null {
  const names = Object.keys(needs);
  if (names.some((n) => needs[n].some((dep) => !(dep in needs)))) return null;

  const done = new Set<string>();
  const waves: string[][] = [];
  while (done.size < names.length) {
    const wave = names.filter((n) => !done.has(n) && needs[n].every((dep) => done.has(dep)));
    if (wave.length === 0) return null; // dependency cycle
    wave.forEach((n) => done.add(n));
    waves.push(wave);
  }
  return waves;
}

// Exercise 6 (Bonus)
function splitSteps(yaml: string): { indent: number; lines: string[] }[] {
  const steps: { indent: number; lines: string[] }[] = [];
  let current: { indent: number; lines: string[] } | null = null;
  for (const line of yaml.split("\n")) {
    const dash = line.match(/^(\s*)- /);
    if (dash && (current === null || dash[1].length <= current.indent)) {
      current = { indent: dash[1].length, lines: [line] };
      steps.push(current);
      continue;
    }
    if (current === null || line.trim() === "") continue;
    const indent = line.length - line.trimStart().length;
    if (indent > current.indent) current.lines.push(line);
    else current = null;
  }
  return steps;
}

export function findUploadsWithoutAlways(yaml: string): string[] {
  const found: string[] = [];
  for (const step of splitSteps(yaml)) {
    const text = step.lines.join("\n");
    if (!/uses:\s*["']?actions\/upload-artifact/.test(text) || text.includes("always()")) continue;

    // Step-level name: on the "- " line itself, or indented by (dash position + 2)
    const stepKeyIndent = " ".repeat(step.indent + 2);
    const nameLine = step.lines.find(
      (l, i) => (i === 0 && /^\s*- name:/.test(l)) || l.startsWith(stepKeyIndent + "name:"),
    );
    const uses = text.match(/uses:\s*["']?([^\s"'#]+)/)![1];
    found.push(nameLine ? nameLine.replace(/^\s*(- )?name:\s*/, "").trim() : uses);
  }
  return found;
}

// ============================================================
// Self-check – run:  npm run solution -- 11 02
// On every line, the value left of "=> expected:" must equal the value on its right.
// (No need to change the code below this line)
// ============================================================

// Sample Workflow file that most of the checks below run against
const SAMPLE = `name: "PR Quality Gate"

on:
  pull_request:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v6
      - uses: actions/setup-node@main
        with:
          node-version: 22
      - run: npm ci

  api:
    needs: lint
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
      - uses: some-org/slack-notify
      - uses: ./.github/actions/local-helper
      - name: Upload report
        if: always()
        uses: actions/upload-artifact@v7
        with:
          name: api-report
          path: reports/

  gate:
    needs: [lint, api]
    runs-on: ubuntu-latest
    steps:
      - name: Upload traces
        uses: actions/upload-artifact@v7
        with:
          name: traces
          path: test-results/
      - uses: actions/upload-artifact@v7
        with:
          name: logs
          path: logs/
`;

console.log("\n--- Exercise 1: getWorkflowName ---");
try {
  console.log(getWorkflowName(SAMPLE), "=> expected:", "PR Quality Gate");
  console.log(getWorkflowName("name: Nightly\non: push"), "=> expected:", "Nightly");
  console.log(getWorkflowName("name: 'E2E + Allure'"), "=> expected:", "E2E + Allure");
  console.log(getWorkflowName("on: push\njobs:\n  a:\n    steps:\n      - name: Step only"), "=> expected:", "(no name)");
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 2: listActions ---");
try {
  console.log(listActions(SAMPLE), "=> expected:", [
    "actions/checkout@v6",
    "actions/setup-node@main",
    "some-org/slack-notify",
    "./.github/actions/local-helper",
    "actions/upload-artifact@v7",
  ]);
  console.log(listActions("name: x\njobs:\n  a:\n    steps:\n      - run: echo hi"), "=> expected:", []);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 3: findUnpinnedActions ---");
try {
  console.log(findUnpinnedActions(SAMPLE), "=> expected:", ["actions/setup-node@main", "some-org/slack-notify"]);
  console.log(
    findUnpinnedActions("steps:\n  - uses: a/b@latest\n  - uses: c/d@master\n  - uses: e/f@v1.2.3"),
    "=> expected:",
    ["a/b@latest", "c/d@master"],
  );
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 4: parseJobNeeds ---");
try {
  console.log(parseJobNeeds(SAMPLE), "=> expected:", { lint: [], api: ["lint"], gate: ["lint", "api"] });
  console.log(parseJobNeeds("name: x\non: push\n"), "=> expected:", {});
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 5: jobWaves ---");
try {
  console.log(jobWaves({ lint: [], api: ["lint"], ui: ["lint"], gate: ["api", "ui"] }), "=> expected:", [
    ["lint"],
    ["api", "ui"],
    ["gate"],
  ]);
  console.log(jobWaves({ a: [], b: [] }), "=> expected:", [["a", "b"]]);
  console.log(jobWaves({}), "=> expected:", []);
  console.log(jobWaves({ a: ["b"], b: ["a"] }), "=> expected:", null); // dependency cycle
  console.log(jobWaves({ a: [], b: ["missing"] }), "=> expected:", null); // depends on a job that does not exist
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 6 (Bonus): findUploadsWithoutAlways ---");
try {
  console.log(findUploadsWithoutAlways(SAMPLE), "=> expected:", ["Upload traces", "actions/upload-artifact@v7"]);
  console.log(
    findUploadsWithoutAlways("steps:\n  - uses: actions/upload-artifact@v7\n    if: ${{ always() }}\n"),
    "=> expected:",
    [],
  );
} catch (e) {
  console.log("  ✋", (e as Error).message);
}
