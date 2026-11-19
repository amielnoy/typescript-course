// Lesson 11 – Topic 02: Reading Workflow Files – Exercises
// ------------------------------------------------------------
// Topic: examples/02-workflow-inspector.ts – "reading" a Workflow file as text and finding common mistakes.
// (A simple text-based check – in a real project you would use a tool like actionlint)
// All functions receive the contents of the YAML file as a string. Indentation = 2 spaces per level.
// Instructions:
//   1. Fill in the body of each function, replacing the line  throw new Error("TODO")
//   2. Check yourself: npm run exercise -- 11 02 (self-check at the end of the file)
// ------------------------------------------------------------

/**
 * Exercise 1 – The Workflow name
 * Return the value of the top-level name (a line that starts exactly with "name:" – no spaces before it).
 * Strip quotes (" or ') around the value, if any. No top-level name => "(no name)".
 * Example: 'name: "QA CI"\non: push'  =>  "QA CI"
 * Note: "      - name: Run tests" is the name of a step – not of the Workflow!
 */
export function getWorkflowName(yaml: string): string {
  throw new Error("TODO");
}

/**
 * Exercise 2 – List of actions
 * Return all the values that appear after "uses:" – without duplicates, in order of first appearance.
 * Example: two steps with actions/checkout@v6 and a step with actions/setup-node@v6
 *   =>  ["actions/checkout@v6", "actions/setup-node@v6"]
 */
export function listActions(yaml: string): string[] {
  throw new Error("TODO");
}

/**
 * Exercise 3 – Actions that are not "pinned" to a version
 * An action without a fixed version can change under our feet and break CI.
 * Return (without duplicates, in order) every action from Exercise 2 that:
 *   - has no "@" at all (e.g. "actions/checkout"), or
 *   - whose version after the "@" is main, master or latest
 * Local actions (starting with "./") – do not report them.
 * Example: [checkout@v6, setup-node@main, some/tool]  =>  ["actions/setup-node@main", "some/tool"]
 */
export function findUnpinnedActions(yaml: string): string[] {
  throw new Error("TODO");
}

/**
 * Exercise 4 – Who depends on whom (needs)
 * Find the jobs: names indented by exactly 2 spaces under the "jobs:" line (up to the next top-level key).
 * For each job, return its list of needs (a line indented by 4 spaces) – in both forms:
 *   needs: build            =>  ["build"]
 *   needs: [lint, build]    =>  ["lint", "build"]
 * A job without needs  =>  []
 * Example: { "lint": [], "api": ["lint"], "gate": ["lint", "api"] }
 */
export function parseJobNeeds(yaml: string): Record<string, string[]> {
  throw new Error("TODO");
}

/**
 * Exercise 5 – Execution waves (what runs in parallel?)
 * GitHub runs in parallel all the jobs whose dependencies have all finished.
 * Take the result of Exercise 4 and return an array of "waves": each wave = the jobs that can run together,
 * in the order of the keys in the object.
 * Example: { lint: [], api: ["lint"], ui: ["lint"], gate: ["api", "ui"] }
 *   =>  [["lint"], ["api", "ui"], ["gate"]]
 * A dependency cycle (a needs b and b needs a) or a dependency on a job that does not exist  =>  null
 */
export function jobWaves(needs: Record<string, string[]>): string[][] | null {
  throw new Error("TODO");
}

/**
 * Exercise 6 (Bonus) – Uploading reports without always()
 * A step = a line that starts with "- " (after spaces) + all the following lines that are indented further.
 * Find every step that uses actions/upload-artifact and does not contain "always()" –
 * its report will be lost exactly when the tests fail!
 * For each such step, return the step's name (the name key at step level – not the name inside with:),
 * and if it has no name – the value of uses.
 * Example: a step "Upload report" with if: always() and a step without a name with uses: actions/upload-artifact@v7 and no if
 *   =>  ["actions/upload-artifact@v7"]
 */
export function findUploadsWithoutAlways(yaml: string): string[] {
  throw new Error("TODO");
}

// ============================================================
// Self-check – run:  npm run exercise -- 11 02
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
