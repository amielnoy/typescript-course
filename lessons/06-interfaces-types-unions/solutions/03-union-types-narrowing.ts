// Lesson 6 – Topic 03: Union Types and Narrowing – Solutions

// ---------- Exercise 1 ----------
export type CellValue = string | number | boolean | null;

export function formatCell(value: CellValue): string {
  if (value === null) return "—"; // must come before typeof: typeof null === "object"
  if (typeof value === "boolean") return value ? "✔" : "✘";
  if (typeof value === "number") {
    return Number.isInteger(value) ? String(value) : value.toFixed(2);
  }
  return value.trim(); // here TS already knows that value is a string
}

// ---------- Exercise 2 ----------
export function normalizeTags(input: string | string[] | null | undefined): string[] {
  if (input === null || input === undefined) return [];
  const raw = Array.isArray(input) ? input : [input];
  const result: string[] = [];
  for (const tag of raw) {
    const clean = tag.trim().toLowerCase();
    if (clean !== "" && !result.includes(clean)) {
      result.push(clean);
    }
  }
  return result;
}

// ---------- Exercise 3 ----------
export type UsersResponse = { users: { id: number; name: string }[] };
export type ApiFailure = { error: { code: number; message: string } };

export function userNamesOrThrow(res: UsersResponse | ApiFailure): string[] {
  if ("error" in res) {
    throw new Error(`API error ${res.error.code}: ${res.error.message}`);
  }
  // After the if, TS knows that res is UsersResponse
  return res.users.map((u) => u.name);
}

// ---------- Exercise 4 ----------
export type Step =
  | { type: "navigate"; url: string }
  | { type: "click"; selector: string }
  | { type: "fill"; selector: string; value: string }
  | { type: "expectText"; selector: string; text: string };

export function describeStep(step: Step): string {
  switch (step.type) {
    case "navigate":
      return `Go to ${step.url}`;
    case "click":
      return `Click ${step.selector}`;
    case "fill":
      return `Type "${step.value}" into ${step.selector}`;
    case "expectText":
      return `Expect ${step.selector} to contain "${step.text}"`;
    default: {
      // If a new type is added to Step and we don't handle it – compile error here
      const unknownStep: never = step;
      throw new Error(`Unknown step: ${JSON.stringify(unknownStep)}`);
    }
  }
}

// ---------- Exercise 5 ----------
export interface TestFailure {
  test: string;
  error: string;
  durationMs?: number;
}

export function isTestFailure(value: unknown): value is TestFailure {
  if (typeof value !== "object" || value === null) return false;
  if (!("test" in value) || typeof value.test !== "string") return false;
  if (!("error" in value) || typeof value.error !== "string") return false;
  if ("durationMs" in value && typeof value.durationMs !== "number") return false;
  return true;
}

export function collectFailures(values: unknown[]): TestFailure[] {
  // filter with a type guard returns an array of the narrowed type – TestFailure[]
  return values.filter(isTestFailure);
}

// ---------- Exercise 6 (Bonus) ----------
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
  const summary: RunSummary = { passed: 0, failed: 0, skipped: 0, retries: 0, totalDurationMs: 0, failures: [] };
  for (const event of events) {
    switch (event.type) {
      case "pass":
        summary.passed++;
        summary.totalDurationMs += event.durationMs;
        break;
      case "fail":
        summary.failed++;
        summary.totalDurationMs += event.durationMs;
        summary.failures.push(`${event.test}: ${event.error}`);
        break;
      case "retry":
        summary.retries++;
        break;
      case "skip":
        summary.skipped++;
        break;
      default: {
        const unknownEvent: never = event;
        throw new Error(`Unknown event: ${JSON.stringify(unknownEvent)}`);
      }
    }
  }
  return summary;
}

// ============================================================
// Self-check – run:  npm run solution -- 06 03
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
