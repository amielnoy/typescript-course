// Lesson 6 – Topic 03: Union Types and Narrowing – Exercises
// ------------------------------------------------------------
// Instructions:
//   1. Fill in the body of each function in place of the line  throw new Error("TODO")
//   2. In every exercise the input is a union – "narrow" it (typeof / Array.isArray / in /
//      switch on a discriminant field / type guard) before you access its fields.
//   3. Check yourself: npm run exercise -- 06 03 (self-check at the end of the file)
// ------------------------------------------------------------

/**
 * Exercise 1 – Narrowing with typeof and null
 * Turn the value of a cell in a report table into text:
 *   null     => "—"
 *   boolean  => true: "✔"   false: "✘"
 *   number   => an integer as is ("42"); a non-integer – 2 digits after the decimal point ("3.14")
 *   string   => the text without surrounding whitespace (trim)
 *
 *   formatCell(null)       => "—"
 *   formatCell(false)      => "✘"
 *   formatCell(3.14159)    => "3.14"
 *   formatCell(42)         => "42"
 *   formatCell("  login ") => "login"
 *
 * Hint: check null first (typeof null === "object"!). Number.isInteger and toFixed(2) will help.
 */
export type CellValue = string | number | boolean | null;

export function formatCell(value: CellValue): string {
  throw new Error("TODO");
}

/**
 * Exercise 2 – Narrowing with Array.isArray (and undefined/null)
 * A test's tags may arrive as a single string, as an array, or not at all.
 * Always return a clean array:
 *   - each tag: trim + lowercase
 *   - no empty tags
 *   - no duplicates (keep the first occurrence)
 *
 *   normalizeTags("Smoke")                              => ["smoke"]
 *   normalizeTags(["Smoke", " regression ", "SMOKE"])   => ["smoke", "regression"]
 *   normalizeTags(null)                                 => []
 *   normalizeTags(undefined)                            => []
 *
 * Hint: first turn any input into an array, then work on a single array only.
 */
export function normalizeTags(input: string | string[] | null | undefined): string[] {
  throw new Error("TODO");
}

/**
 * Exercise 3 – Narrowing with the in operator
 * An API response can be a success (has users) or a failure (has error).
 *   success => return an array of the user names
 *   failure => throw an Error with the message  "API error <code>: <message>"
 *
 *   userNamesOrThrow({ users: [{ id: 1, name: "Dana" }] })            => ["Dana"]
 *   userNamesOrThrow({ error: { code: 401, message: "Unauthorized" } }) => throws "API error 401: Unauthorized"
 *
 * Hint:  if ("error" in res) { ... }  – inside the if, TS knows res is ApiFailure.
 */
export type UsersResponse = { users: { id: number; name: string }[] };
export type ApiFailure = { error: { code: number; message: string } };

export function userNamesOrThrow(res: UsersResponse | ApiFailure): string[] {
  throw new Error("TODO");
}

/**
 * Exercise 4 – Discriminated union + exhaustiveness (never)
 * A step in a test script is identified by its type field. Return a readable description:
 *   navigate   => "Go to <url>"
 *   click      => "Click <selector>"
 *   fill       => 'Type "<value>" into <selector>'
 *   expectText => 'Expect <selector> to contain "<text>"'
 * In the default branch – do an exhaustiveness check with never, and throw an Error with the message
 *   "Unknown step: <the step as JSON>"
 * (That way, at runtime too, an unknown step – e.g. from a JSON file – is caught immediately.)
 *
 * Hint:
 *   default: {
 *     const unknownStep: never = step;
 *     throw new Error(`Unknown step: ${JSON.stringify(unknownStep)}`);
 *   }
 */
export type Step =
  | { type: "navigate"; url: string }
  | { type: "click"; selector: string }
  | { type: "fill"; selector: string; value: string }
  | { type: "expectText"; selector: string; text: string };

export function describeStep(step: Step): string {
  throw new Error("TODO");
}

/**
 * Exercise 5 – A custom type guard
 * isTestFailure(value) – return true only if value is an object (not null) with:
 *   test: string,  error: string,  and if durationMs is present – it must be a number.
 * collectFailures(values) – take an unknown array (e.g. from a report's JSON) and return only
 *   the values that are TestFailure, in order.
 *
 *   isTestFailure({ test: "login", error: "timeout" })                  => true
 *   isTestFailure({ test: "login", error: "timeout", durationMs: "5" }) => false
 *   isTestFailure(null)                                                  => false
 *
 * Hint: after  typeof value === "object" && value !== null && "test" in value
 *      TS lets you access value.test. In collectFailures:  values.filter(isTestFailure)
 */
export interface TestFailure {
  test: string;
  error: string;
  durationMs?: number;
}

export function isTestFailure(value: unknown): value is TestFailure {
  throw new Error("TODO");
}

export function collectFailures(values: unknown[]): TestFailure[] {
  throw new Error("TODO");
}

/**
 * Exercise 6 (Bonus) – A run summary from events (discriminated union)
 * Take a list of events from a test runner and return a RunSummary:
 *   pass  => passed+1,  totalDurationMs += durationMs
 *   fail  => failed+1,  totalDurationMs += durationMs,  failures.push("<test>: <error>")
 *   retry => retries+1
 *   skip  => skipped+1
 *
 *   summarizeRun([
 *     { type: "pass", test: "login", durationMs: 120 },
 *     { type: "retry", test: "search", attempt: 2 },
 *     { type: "fail", test: "search", error: "timeout", durationMs: 3000 },
 *   ])
 *   => { passed: 1, failed: 1, skipped: 0, retries: 1, totalDurationMs: 3120, failures: ["search: timeout"] }
 *
 * Hint: switch (event.type) – and here too add a never check in default.
 */
export type RunEvent =
  | { type: "pass"; test: string; durationMs: number }
  | { type: "fail"; test: string; error: string; durationMs: number }
  | { type: "retry"; test: string; attempt: number }
  | { type: "skip"; test: string; reason: string };

export interface RunSummary {
  passed: number;
  failed: number;
  skipped: number;
  retries: number;
  totalDurationMs: number;
  failures: string[];
}

export function summarizeRun(events: RunEvent[]): RunSummary {
  throw new Error("TODO");
}

// ============================================================
// Self-check – run:  npm run exercise -- 06 03
// On every line, the value left of "=> expected:" must equal the value on its right.
// (No need to change the code below this line)
// ============================================================

console.log("\n--- Exercise 1: formatCell ---");
try {
  console.log(formatCell(null), "=> expected:", "—");
  console.log(formatCell(true), "=> expected:", "✔");
  console.log(formatCell(false), "=> expected:", "✘");
  console.log(formatCell(3.14159), "=> expected:", "3.14");
  console.log(formatCell(42), "=> expected:", "42");
  console.log(formatCell(0), "=> expected:", "0");
  console.log(formatCell(-0.5), "=> expected:", "-0.50");
  console.log(JSON.stringify(formatCell("  login ")), "=> expected:", JSON.stringify("login"));
  console.log(JSON.stringify(formatCell("")), "=> expected:", JSON.stringify(""));
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 2: normalizeTags ---");
try {
  console.log(normalizeTags("Smoke"), "=> expected:", ["smoke"]);
  console.log(normalizeTags(["Smoke", " regression ", "SMOKE"]), "=> expected:", ["smoke", "regression"]);
  console.log(normalizeTags(null), "=> expected:", []);
  console.log(normalizeTags(undefined), "=> expected:", []);
  console.log(normalizeTags(""), "=> expected:", []);
  console.log(normalizeTags(["", "  ", "UI"]), "=> expected:", ["ui"]);
  console.log(normalizeTags([]), "=> expected:", []);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 3: userNamesOrThrow ---");
try {
  console.log(
    userNamesOrThrow({
      users: [
        { id: 1, name: "Dana" },
        { id: 2, name: "Avi" },
      ],
    }),
    "=> expected:",
    ["Dana", "Avi"],
  );
  console.log(userNamesOrThrow({ users: [] }), "=> expected:", []);
  const failures: [ApiFailure, string][] = [
    [{ error: { code: 401, message: "Unauthorized" } }, "API error 401: Unauthorized"],
    [{ error: { code: 500, message: "Internal Server Error" } }, "API error 500: Internal Server Error"],
  ];
  for (const [failure, expectedMessage] of failures) {
    try {
      userNamesOrThrow(failure);
      console.log("did not throw", "=> expected:", "threw:", expectedMessage);
    } catch (err) {
      if ((err as Error).message === "TODO") throw err;
      console.log("threw:", (err as Error).message, "=> expected:", "threw:", expectedMessage);
    }
  }
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 4: describeStep ---");
try {
  console.log(describeStep({ type: "navigate", url: "/login" }), "=> expected:", "Go to /login");
  console.log(describeStep({ type: "click", selector: "#submit" }), "=> expected:", "Click #submit");
  console.log(
    describeStep({ type: "fill", selector: "#email", value: "dana@test.local" }),
    "=> expected:",
    'Type "dana@test.local" into #email',
  );
  console.log(
    describeStep({ type: "expectText", selector: ".toast", text: "Saved" }),
    "=> expected:",
    'Expect .toast to contain "Saved"',
  );
  // An unknown step (e.g. from a JSON file) – caught at runtime
  const bogus = { type: "hover", selector: "#menu" } as unknown as Step;
  try {
    describeStep(bogus);
    console.log("did not throw", "=> expected:", "threw:", 'Unknown step: {"type":"hover","selector":"#menu"}');
  } catch (err) {
    if ((err as Error).message === "TODO") throw err;
    console.log(
      "threw:",
      (err as Error).message,
      "=> expected:",
      "threw:",
      'Unknown step: {"type":"hover","selector":"#menu"}',
    );
  }
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 5: isTestFailure + collectFailures ---");
try {
  console.log(isTestFailure({ test: "login", error: "timeout" }), "=> expected:", true);
  console.log(isTestFailure({ test: "login", error: "timeout", durationMs: 50 }), "=> expected:", true);
  console.log(isTestFailure({ test: "login", error: "timeout", durationMs: "5" }), "=> expected:", false);
  console.log(isTestFailure({ test: 1, error: "timeout" }), "=> expected:", false);
  console.log(isTestFailure({ test: "login" }), "=> expected:", false);
  console.log(isTestFailure(null), "=> expected:", false);
  console.log(isTestFailure(undefined), "=> expected:", false);
  console.log(isTestFailure("login: timeout"), "=> expected:", false);
  console.log(isTestFailure(["login", "timeout"]), "=> expected:", false);

  const fromJson: unknown[] = JSON.parse(
    '[{"test":"a","error":"x"}, null, {"test":"b"}, 7, {"test":"c","error":"y","durationMs":10}]',
  );
  console.log(collectFailures(fromJson), "=> expected:", [
    { test: "a", error: "x" },
    { test: "c", error: "y", durationMs: 10 },
  ]);
  console.log(collectFailures([]), "=> expected:", []);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 6 (Bonus): summarizeRun ---");
try {
  console.log(
    summarizeRun([
      { type: "pass", test: "login", durationMs: 120 },
      { type: "retry", test: "search", attempt: 2 },
      { type: "fail", test: "search", error: "timeout", durationMs: 3000 },
    ]),
    "=> expected:",
    { passed: 1, failed: 1, skipped: 0, retries: 1, totalDurationMs: 3120, failures: ["search: timeout"] },
  );
  console.log(summarizeRun([]), "=> expected:", {
    passed: 0,
    failed: 0,
    skipped: 0,
    retries: 0,
    totalDurationMs: 0,
    failures: [],
  });
  console.log(
    summarizeRun([
      { type: "skip", test: "pay", reason: "no sandbox" },
      { type: "fail", test: "a", error: "e1", durationMs: 10 },
      { type: "fail", test: "b", error: "e2", durationMs: 20 },
      { type: "retry", test: "a", attempt: 2 },
      { type: "retry", test: "a", attempt: 3 },
    ]),
    "=> expected:",
    { passed: 0, failed: 2, skipped: 1, retries: 2, totalDurationMs: 30, failures: ["a: e1", "b: e2"] },
  );
} catch (e) {
  console.log("  ✋", (e as Error).message);
}
