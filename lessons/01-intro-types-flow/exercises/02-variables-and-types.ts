// Lesson 1 – Topic 02: Variables and Types – Exercises
// ------------------------------------------------------------
// Instructions:
//   1. Complete the body of each function in place of the line  throw new Error("TODO")
//   2. Function syntax itself is taught in the next lesson – here, just write the code inside.
//   3. Use only what has been taught up to this topic (see examples/02-variables-and-types.ts).
//   4. Check yourself: npm run exercise -- 01 02 (self-check at the end of the file)
// ------------------------------------------------------------

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

/**
 * Exercise 1 – Create a test result object
 * Return an object with the three fields: name, durationMs, passed.
 * Example: ("Login", 1532.5, true) => { name: "Login", durationMs: 1532.5, passed: true }
 */
export function createTestResult(
  name: string,
  durationMs: number,
  passed: boolean,
): { name: string; durationMs: number; passed: boolean } {
  
  return { name, durationMs, passed };
}

/**
 * Exercise 2 – Summarize a list of browsers
 * Return an object with the first browser in the array and the number of browsers.
 * Examples:
 *   ["chromium", "firefox"] => { first: "chromium", count: 2 }
 *   []                      => { first: undefined, count: 0 }
 * Hint: accessing an index that doesn't exist in an array returns undefined.
 */
export function summarizeBrowsers(browsers: string[]): { first: string | undefined; count: number } {
  return { first: browsers[0], count: browsers.length };
}

/**
 * Exercise 3 – Add a status code to an existing array
 * Add code to the end of the codes array (modify the array itself!) and return that same array.
 * Example: ([200, 404], 500) => [200, 404, 500]
 * Note: even an array declared with const can be modified – const only protects the assignment.
 */
export function addStatusCode(codes: number[], code: number): number[] {
  codes.push(code);
  return codes;
}

/**
 * Exercise 4 – Environment name by number (numeric enum)
 * Return the name of the Environment value by its number.
 * Examples: 0 => "Dev",  2 => "Production",  7 => undefined
 * Hint: Environment[2]
 */
export function getEnvironmentName(value: number): string | undefined {
  
  return Environment[value];
}

/**
 * Exercise 5 – Escalate a bug
 * A bug arrived with some severity and no assignee (assignee: null).
 * Update the object you received: severity => Severity.Critical, assignee => the given name.
 * Return the same object (not a copy).
 * Example: ({ id: "BUG-7", severity: Low, assignee: null }, "Yossi")
 *        => { id: "BUG-7", severity: CRITICAL, assignee: "Yossi" }
 */
export function escalateBug(
  bug: { id: string; severity: Severity; assignee: string | null },
  assignee: string,
): { id: string; severity: Severity; assignee: string | null } {
  bug.severity=Severity.Critical;
  bug.assignee=assignee;
  return bug;
}

/**
 * Exercise 6 (Bonus) – Read an id from an API response of type unknown
 * body can be anything (the result of JSON.parse).
 * If body is an object (not null) that has an id field of type number – return the id.
 * In any other case – return null.
 * Examples: { id: 7 } => 7,  { id: "7" } => null,  null => null,  "text" => null
 * Hint: copy the check from the example in examples and add a typeof check on the id.
 */
export function readIdFromApi(body: unknown): number | null {
  if (typeof body === "object" && body !== null) {
    const { id } = body as { id?: unknown };
    if (typeof id === "number") {
      return id;
    }
  }
  return null;
}

// ============================================================
// Self-check – run:  npm run exercise -- 01 02
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
