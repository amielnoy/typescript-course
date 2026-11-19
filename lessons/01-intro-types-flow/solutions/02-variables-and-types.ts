// Lesson 1 – Topic 02: Variables and Types – Solutions

export enum Severity {
  Low = "LOW",
  Medium = "MEDIUM",
  High = "HIGH",
  Critical = "CRITICAL",
}

export enum Environment {
  Dev, // 0
  Staging, // 1
  Production, // 2
}

export function createTestResult(
  name: string,
  durationMs: number,
  passed: boolean,
): { name: string; durationMs: number; passed: boolean } {
  return { name: name, durationMs: durationMs, passed: passed };
}

export function summarizeBrowsers(browsers: string[]): { first: string | undefined; count: number } {
  // browsers[0] on an empty array returns undefined – exactly what we need
  return { first: browsers[0], count: browsers.length };
}

export function addStatusCode(codes: number[], code: number): number[] {
  codes.push(code); // modifies the array itself
  return codes;
}

export function getEnvironmentName(value: number): string | undefined {
  // A numeric enum allows a "reverse mapping": from number to name
  return Environment[value];
}

export function escalateBug(
  bug: { id: string; severity: Severity; assignee: string | null },
  assignee: string,
): { id: string; severity: Severity; assignee: string | null } {
  bug.severity = Severity.Critical;
  bug.assignee = assignee;
  return bug;
}

export function readIdFromApi(body: unknown): number | null {
  // unknown requires checks before use: an object? not null? has an id? is the id a number?
  if (typeof body === "object" && body !== null && "id" in body) {
    const id = (body as { id: unknown }).id;
    if (typeof id === "number") return id;
  }
  return null;
}

// ============================================================
// Self-check – run:  npm run solution -- 01 02
// On every line, the value left of "=> expected:" must equal the value on its right.
// (No need to change the code below this line)
// ============================================================

console.log("\n--- Exercise 1: createTestResult ---");
try {
  console.log(createTestResult("Login", 1532.5, true), "=> expected:", { name: "Login", durationMs: 1532.5, passed: true });
  console.log(createTestResult("", 0, false), "=> expected:", { name: "", durationMs: 0, passed: false });
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 2: summarizeBrowsers ---");
try {
  console.log(summarizeBrowsers(["chromium", "firefox"]), "=> expected:", { first: "chromium", count: 2 });
  console.log(summarizeBrowsers(["webkit"]), "=> expected:", { first: "webkit", count: 1 });
  console.log(summarizeBrowsers([]), "=> expected:", { first: undefined, count: 0 });
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 3: addStatusCode ---");
try {
  const codes = [200, 404];
  const result = addStatusCode(codes, 500);
  console.log(result, "=> expected:", [200, 404, 500]);
  console.log(result === codes, "=> expected:", true); // the same array, not a copy
  const empty: number[] = [];
  console.log(addStatusCode(empty, 204), "=> expected:", [204]);
  console.log(empty.length, "=> expected:", 1);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 4: getEnvironmentName ---");
try {
  console.log(getEnvironmentName(0), "=> expected:", "Dev");
  console.log(getEnvironmentName(1), "=> expected:", "Staging");
  console.log(getEnvironmentName(2), "=> expected:", "Production");
  console.log(getEnvironmentName(7), "=> expected:", undefined);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 5: escalateBug ---");
try {
  const bug = { id: "BUG-7", severity: Severity.Low, assignee: null };
  const result = escalateBug(bug, "Yossi");
  console.log(result, "=> expected:", { id: "BUG-7", severity: "CRITICAL", assignee: "Yossi" });
  console.log(result === bug, "=> expected:", true); // the same object, not a copy
  console.log(bug.severity, "=> expected:", "CRITICAL");
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 6 (Bonus): readIdFromApi ---");
try {
  console.log(readIdFromApi({ id: 7 }), "=> expected:", 7);
  console.log(readIdFromApi(JSON.parse('{"id": 0, "name": "x"}')), "=> expected:", 0);
  console.log(readIdFromApi({ id: "7" }), "=> expected:", null);
  console.log(readIdFromApi({ name: "no id" }), "=> expected:", null);
  console.log(readIdFromApi(null), "=> expected:", null);
  console.log(readIdFromApi(undefined), "=> expected:", null);
  console.log(readIdFromApi("text"), "=> expected:", null);
  console.log(readIdFromApi(42), "=> expected:", null);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}
