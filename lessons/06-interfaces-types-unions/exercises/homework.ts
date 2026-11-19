// Lesson 6 – Homework: API Contract Checker
// Check yourself: npm run exercise -- 06 hw (self-check at the end of the file)
// ------------------------------------------------------------
// Scenario:
//   Your team's Users API is called by many automated tests. Every call was captured as
//   [method, path, status, body, durationMs] – and the body is just "some JSON" (unknown).
//   You are building the contract-check layer that sits between the raw traffic and the report:
//     raw JSON log  ->  tuples (RawCall)  ->  type guards  ->  a discriminated union of results
//     ->  extra business rules (a class that implements an interface)  ->  one PASS/FAIL report.
//   Each task builds on the previous ones – solve them in order.
//
// Instructions:
//   1. All the types are already defined below – read them first, they ARE the spec.
//      Don't change them; write the runtime code that matches them.
//   2. Fill in the body of each function/method in place of the line  throw new Error("TODO")
//   3. Never access a field of an unknown value before you have narrowed it.
//   4. Check yourself: npm run exercise -- 06 hw
// ------------------------------------------------------------

// ---------- Given types (don't change) ----------

/** The HTTP methods the Users API supports (literal types). */
export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

/** The only roles a user may have. */
export type Role = "admin" | "tester" | "viewer";

/** A user, as the API is supposed to return it. */
export interface User {
  readonly id: number;
  name: string;
  email: string;
  role: Role;
  nickname?: string;
}

/** One item in the "errors" list of a 400/422 response. */
export interface FieldError {
  field: string;
  message: string;
}

/** One captured API call (a labeled tuple). The body came from JSON.parse – we know nothing about it yet. */
export type RawCall = [method: HttpMethod, path: string, status: number, body: unknown, durationMs: number];

/** What every result has in common – combined with each variant using an intersection (&). */
export type ResultBase = { endpoint: string; durationMs: number };
export type SuccessResult = ResultBase & { kind: "success"; user: User };
export type ValidationResult = ResultBase & { kind: "validation-error"; errors: FieldError[] };
export type ServerErrorResult = ResultBase & { kind: "server-error"; status: number; message: string };
export type ContractViolation = ResultBase & { kind: "contract-violation"; reason: string };

/** A discriminated union – the "kind" field tells the variants apart. */
export type CallResult = SuccessResult | ValidationResult | ServerErrorResult | ContractViolation;
export type ResultKind = "success" | "validation-error" | "server-error" | "contract-violation";

/**
 * A ready-made helper (a type guard): a "real" object – not null and not an array.
 * After  if (isPlainObject(value))  you may read any field:  value.id  is of type unknown,
 * so you still have to check its type (typeof ...) before you use it.
 */
export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Task 1 – Type guards for what comes back from the API
 * isRole(value)           – true only for "admin" / "tester" / "viewer" (exact spelling).
 * isUser(value)           – true only if value is a plain object where:
 *                             id       – a positive integer (1, 2, 3 ... – not "1", not 1.5, not 0)
 *                             name     – a string
 *                             email    – a string
 *                             role     – a valid Role
 *                             nickname – either missing, or a string (null is NOT OK)
 *                           Extra fields are allowed (the API may add fields – that's not a contract break).
 * isFieldErrorList(value) – true only for a NON-empty array in which every item is a plain object
 *                           with a string field and a string message.
 *
 *   isUser({ id: 1, name: "Dana", email: "dana@test.local", role: "tester" })     => true
 *   isUser({ id: "1", name: "Dana", email: "dana@test.local", role: "tester" })   => false
 *   isFieldErrorList([{ field: "email", message: "is invalid" }])                  => true
 *   isFieldErrorList([])                                                            => false
 *
 * Hint: in isUser, after isPlainObject(value) you can destructure:
 *   const { id, name, email, role, nickname } = value;   // all of them are unknown
 */
export function isRole(value: unknown): value is Role {
  throw new Error("TODO");
}

export function isUser(value: unknown): value is User {
  throw new Error("TODO");
}

export function isFieldErrorList(value: unknown): value is FieldError[] {
  throw new Error("TODO");
}

/**
 * Task 2 – Classify a raw call into a CallResult
 * endpoint = "<method> <path>"  (e.g. "GET /users/1"),  durationMs – copied from the tuple.
 *   status 200–299 => body is a valid User?  "success" with that user
 *                                       else  "contract-violation", reason "body is not a valid User"
 *   status 400/422 => body is a plain object whose errors field passes isFieldErrorList?
 *                                             "validation-error" with those errors
 *                                       else  "contract-violation", reason "expected a non-empty errors list"
 *   status 500–599 => "server-error" with the status and a message:
 *                     body.message if the body is a plain object and message is a string, else "(no message)"
 *   any other status => "contract-violation", reason "unexpected status <status>"
 *
 *   classifyCall(["GET", "/users/9", 503, { message: "Service Unavailable" }, 30])
 *     => { kind: "server-error", endpoint: "GET /users/9", durationMs: 30, status: 503, message: "Service Unavailable" }
 *
 * Hint: start with  const [method, path, status, body, durationMs] = call;
 */
export function classifyCall(call: RawCall): CallResult {
  throw new Error("TODO");
}

/**
 * Task 3 – One readable line per result (switch + exhaustive never)
 *   success            => "✔ <endpoint> – <name> (<role>) in <durationMs>ms"
 *   validation-error   => "✘ <endpoint> – <count> validation error(s): <field1>, <field2>"
 *   server-error       => "✘ <endpoint> – <status> <message>"
 *   contract-violation => "⚠ <endpoint> – contract violation: <reason>"
 * In the default branch – an exhaustiveness check with never, then throw an Error with the message
 *   "Unknown result kind: <the result as JSON>"
 *
 *   "✔ GET /users/1 – Dana (tester) in 120ms"
 *   "✘ POST /users – 2 validation error(s): email, role"
 */
export function describeResult(result: CallResult): string {
  throw new Error("TODO");
}

/**
 * Task 4 – Business rules: a class that implements an interface
 * A response can have the right SHAPE and still break the CONTRACT. UserContract checks a SuccessResult
 * against ContractRules. The constructor takes only the rules you want to change (Partial) –
 * every rule that wasn't passed comes from DEFAULT_RULES.
 *
 * check(result) returns a list of problems, in this order (an empty list = all good):
 *   role is not in allowedRoles            => 'role "<role>" is not allowed'
 *   email doesn't end with "@<emailDomain>" => 'email "<email>" is not @<emailDomain>'
 *   requireNickname and the nickname is missing or empty => "nickname is missing"
 *   durationMs > maxDurationMs             => "too slow: <durationMs>ms > <maxDurationMs>ms"
 *
 *   new UserContract().rules                         => the same values as DEFAULT_RULES
 *   new UserContract({ maxDurationMs: 200 }).rules   => like DEFAULT_RULES, but maxDurationMs: 200
 *
 * Important: an instance must never change DEFAULT_RULES or share its allowedRoles array.
 * Hint: the spread operator merges objects – later keys win:  { ...a, ...b }
 */
export interface ContractRules {
  allowedRoles: Role[];
  emailDomain: string;
  requireNickname: boolean;
  maxDurationMs: number;
}

export const DEFAULT_RULES: Readonly<ContractRules> = {
  allowedRoles: ["admin", "tester", "viewer"],
  emailDomain: "test.local",
  requireNickname: false,
  maxDurationMs: 1000,
};

export interface ContractChecker {
  readonly rules: Readonly<ContractRules>;
  check(result: SuccessResult): string[];
}

export class UserContract /* TODO: implements ContractChecker */ {
  readonly rules: Readonly<ContractRules>;

  constructor(overrides: Partial<ContractRules> = {}) {
    throw new Error("TODO");
  }

  check(result: SuccessResult): string[] {
    throw new Error("TODO");
  }
}

/**
 * Task 5 (Challenge) – The contract report
 * Classify every call (Task 2) and build a ContractReport:
 *   total    – the number of calls
 *   counts   – how many results of each kind (all 4 keys, even when 0)
 *   lines    – describeResult (Task 3) of every result, in call order
 *   problems – [endpoint, problem] tuples, in call order:
 *                success            => one tuple per problem that checker.check returns
 *                server-error       => "server error <status>"
 *                contract-violation => the reason
 *                validation-error   => nothing! (an expected answer to a negative test, not a problem)
 *   verdict  – "PASS" if there are no problems at all, otherwise "FAIL"
 *
 * Note: buildReport receives a ContractChecker – the interface, not the class.
 *       Any object that implements it will do.
 */
export interface ContractReport {
  readonly total: number;
  counts: Record<ResultKind, number>;
  lines: string[];
  problems: [endpoint: string, problem: string][];
  verdict: "PASS" | "FAIL";
}

export function buildReport(calls: RawCall[], checker: ContractChecker): ContractReport {
  throw new Error("TODO");
}

/**
 * Task 6 (Challenge) – From raw JSON text to tuples
 * The traffic recorder saves a JSON array of entries like:
 *   { "request": "GET /users/1", "status": 200, "body": { ... }, "ms": 120 }
 * Turn it into RawCall tuples:  ["GET", "/users/1", 200, { ... }, 120]
 *   - text that isn't valid JSON          => throw Error "Traffic log is not valid JSON"
 *   - valid JSON that isn't an array      => throw Error "Traffic log must be a JSON array"
 *   - an entry is valid only if it is a plain object where:
 *       request – a string of exactly "<METHOD> <path>" (one space), METHOD is an HttpMethod
 *                 (uppercase only), and path starts with "/"
 *       status  – an integer
 *       ms      – a number, 0 or more
 *       body    – anything; may be missing (then it's undefined in the tuple)
 *     the first invalid entry => throw Error "Bad entry at index <i>"
 *
 * Hint: write your own type guard isHttpMethod(value: unknown): value is HttpMethod.
 *       "GET /users".split(" ") => ["GET", "/users"]. Wrap JSON.parse in try/catch.
 * When it works, the self-check runs the whole pipeline: parseTrafficLog -> buildReport.
 */
export function parseTrafficLog(json: string): RawCall[] {
  throw new Error("TODO");
}

// ============================================================
// Self-check – run:  npm run exercise -- 06 hw
// On every line, the value left of "=> expected:" must equal the value on its right.
// (No need to change the code below this line)
// ============================================================

// Sample bodies, as they would arrive from JSON.parse
const danaBody = { id: 1, name: "Dana", email: "dana@test.local", role: "tester" };
const rootBody = { id: 7, name: "Root", email: "root@test.local", role: "admin" };

console.log("\n--- Task 1: isRole + isUser + isFieldErrorList ---");
try {
  console.log(isRole("tester"), "=> expected:", true);
  console.log(isRole("owner"), "=> expected:", false);
  console.log(isRole("Admin"), "=> expected:", false);
  console.log(isRole(1), "=> expected:", false);
  console.log(isRole(undefined), "=> expected:", false);

  console.log(isUser(danaBody), "=> expected:", true);
  console.log(isUser({ ...danaBody, nickname: "dd" }), "=> expected:", true);
  console.log(isUser({ ...danaBody, extra: "fields are fine" }), "=> expected:", true);
  console.log(isUser({ ...danaBody, id: "1" }), "=> expected:", false);
  console.log(isUser({ ...danaBody, id: 1.5 }), "=> expected:", false);
  console.log(isUser({ ...danaBody, id: 0 }), "=> expected:", false);
  console.log(isUser({ ...danaBody, role: "owner" }), "=> expected:", false);
  console.log(isUser({ ...danaBody, nickname: 5 }), "=> expected:", false);
  console.log(isUser({ ...danaBody, nickname: null }), "=> expected:", false);
  console.log(isUser({ id: 1, name: "Dana", role: "tester" }), "=> expected:", false);
  console.log(isUser(null), "=> expected:", false);
  console.log(isUser([danaBody]), "=> expected:", false);
  console.log(isUser("Dana"), "=> expected:", false);

  console.log(isFieldErrorList([{ field: "email", message: "is invalid" }]), "=> expected:", true);
  console.log(isFieldErrorList([]), "=> expected:", false);
  console.log(isFieldErrorList([{ field: "email" }]), "=> expected:", false);
  console.log(isFieldErrorList([{ field: "email", message: "x" }, null]), "=> expected:", false);
  console.log(isFieldErrorList({ field: "email", message: "x" }), "=> expected:", false);
  console.log(isFieldErrorList("email is invalid"), "=> expected:", false);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Task 2: classifyCall ---");
try {
  console.log(classifyCall(["GET", "/users/1", 200, danaBody, 120]), "=> expected:", {
    kind: "success",
    endpoint: "GET /users/1",
    durationMs: 120,
    user: danaBody,
  });
  console.log(classifyCall(["POST", "/users", 201, rootBody, 300]).kind, "=> expected:", "success");
  console.log(classifyCall(["GET", "/users/2", 200, { id: "2", name: "Avi" }, 90]), "=> expected:", {
    kind: "contract-violation",
    endpoint: "GET /users/2",
    durationMs: 90,
    reason: "body is not a valid User",
  });
  console.log(classifyCall(["GET", "/users/3", 200, undefined, 10]), "=> expected:", {
    kind: "contract-violation",
    endpoint: "GET /users/3",
    durationMs: 10,
    reason: "body is not a valid User",
  });
  const errors = [
    { field: "email", message: "is invalid" },
    { field: "role", message: "is required" },
  ];
  console.log(classifyCall(["POST", "/users", 422, { errors }, 80]), "=> expected:", {
    kind: "validation-error",
    endpoint: "POST /users",
    durationMs: 80,
    errors,
  });
  console.log(classifyCall(["PUT", "/users/1", 400, { errors: [] }, 40]), "=> expected:", {
    kind: "contract-violation",
    endpoint: "PUT /users/1",
    durationMs: 40,
    reason: "expected a non-empty errors list",
  });
  console.log(classifyCall(["PUT", "/users/1", 400, "Bad Request", 40]).kind, "=> expected:", "contract-violation");
  console.log(classifyCall(["GET", "/users/9", 503, { message: "Service Unavailable" }, 30]), "=> expected:", {
    kind: "server-error",
    endpoint: "GET /users/9",
    durationMs: 30,
    status: 503,
    message: "Service Unavailable",
  });
  console.log(classifyCall(["DELETE", "/users/9", 500, "oops", 5]), "=> expected:", {
    kind: "server-error",
    endpoint: "DELETE /users/9",
    durationMs: 5,
    status: 500,
    message: "(no message)",
  });
  console.log(classifyCall(["GET", "/users/9", 502, { message: 502 }, 5]), "=> expected:", {
    kind: "server-error",
    endpoint: "GET /users/9",
    durationMs: 5,
    status: 502,
    message: "(no message)",
  });
  console.log(classifyCall(["GET", "/old", 302, null, 3]), "=> expected:", {
    kind: "contract-violation",
    endpoint: "GET /old",
    durationMs: 3,
    reason: "unexpected status 302",
  });
  console.log(classifyCall(["GET", "/users/99", 404, { message: "Not Found" }, 3]), "=> expected:", {
    kind: "contract-violation",
    endpoint: "GET /users/99",
    durationMs: 3,
    reason: "unexpected status 404",
  });
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Task 3: describeResult ---");
try {
  console.log(
    describeResult({ kind: "success", endpoint: "GET /users/1", durationMs: 120, user: danaBody as User }),
    "=> expected:",
    "✔ GET /users/1 – Dana (tester) in 120ms",
  );
  console.log(
    describeResult({
      kind: "validation-error",
      endpoint: "POST /users",
      durationMs: 80,
      errors: [
        { field: "email", message: "is invalid" },
        { field: "role", message: "is required" },
      ],
    }),
    "=> expected:",
    "✘ POST /users – 2 validation error(s): email, role",
  );
  console.log(
    describeResult({ kind: "server-error", endpoint: "GET /users/9", durationMs: 30, status: 503, message: "Service Unavailable" }),
    "=> expected:",
    "✘ GET /users/9 – 503 Service Unavailable",
  );
  console.log(
    describeResult({ kind: "contract-violation", endpoint: "GET /old", durationMs: 3, reason: "unexpected status 302" }),
    "=> expected:",
    "⚠ GET /old – contract violation: unexpected status 302",
  );
  // A result with an unknown kind (e.g. a typo in a hand-written fixture) – caught at runtime
  const bogus = { kind: "timeout", endpoint: "GET /slow" } as unknown as CallResult;
  try {
    describeResult(bogus);
    console.log("did not throw", "=> expected:", "threw:", 'Unknown result kind: {"kind":"timeout","endpoint":"GET /slow"}');
  } catch (err) {
    if ((err as Error).message === "TODO") throw err;
    console.log(
      "threw:",
      (err as Error).message,
      "=> expected:",
      "threw:",
      'Unknown result kind: {"kind":"timeout","endpoint":"GET /slow"}',
    );
  }
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Task 4: UserContract ---");
try {
  const relaxed: ContractChecker = new UserContract();
  console.log(relaxed.rules, "=> expected:", {
    allowedRoles: ["admin", "tester", "viewer"],
    emailDomain: "test.local",
    requireNickname: false,
    maxDurationMs: 1000,
  });
  const fast = new UserContract({ maxDurationMs: 200 });
  console.log([fast.rules.maxDurationMs, fast.rules.emailDomain], "=> expected:", [200, "test.local"]);

  const ok: SuccessResult = { kind: "success", endpoint: "GET /users/1", durationMs: 120, user: danaBody as User };
  console.log(relaxed.check(ok), "=> expected:", []);
  console.log(fast.check(ok), "=> expected:", []);
  console.log(fast.check({ ...ok, durationMs: 250 }), "=> expected:", ["too slow: 250ms > 200ms"]);

  const strict = new UserContract({ allowedRoles: ["tester", "viewer"], requireNickname: true, maxDurationMs: 500 });
  const bad: SuccessResult = {
    kind: "success",
    endpoint: "GET /users/7",
    durationMs: 800,
    user: { id: 7, name: "Root", email: "root@prod.example", role: "admin" },
  };
  console.log(strict.check(bad), "=> expected:", [
    'role "admin" is not allowed',
    'email "root@prod.example" is not @test.local',
    "nickname is missing",
    "too slow: 800ms > 500ms",
  ]);
  console.log(
    strict.check({ ...ok, user: { ...(danaBody as User), nickname: "" } }),
    "=> expected:",
    ["nickname is missing"],
  );
  console.log(
    strict.check({ ...ok, user: { ...(danaBody as User), nickname: "dd", email: "dana@test.local.evil.com" } }),
    "=> expected:",
    ['email "dana@test.local.evil.com" is not @test.local'],
  );
  console.log(relaxed.check({ ...ok, durationMs: 1000 }), "=> expected:", []);
  // The defaults must not be shared/changed by an instance
  console.log(new UserContract({ allowedRoles: [] }).check(ok), "=> expected:", ['role "tester" is not allowed']);
  console.log(new UserContract().rules.allowedRoles, "=> expected:", ["admin", "tester", "viewer"]);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Task 5 (Challenge): buildReport ---");
try {
  const calls: RawCall[] = [
    ["GET", "/users/1", 200, danaBody, 120],
    ["POST", "/users", 422, { errors: [{ field: "email", message: "is invalid" }] }, 80],
    ["GET", "/users/7", 200, rootBody, 1500],
    ["GET", "/users/9", 503, { message: "Service Unavailable" }, 30],
    ["GET", "/users/2", 200, { id: 2, name: "Avi" }, 90],
  ];
  const report = buildReport(calls, new UserContract({ allowedRoles: ["tester", "viewer"] }));
  console.log(report.total, "=> expected:", 5);
  console.log(report.counts, "=> expected:", {
    success: 2,
    "validation-error": 1,
    "server-error": 1,
    "contract-violation": 1,
  });
  console.log(report.lines, "=> expected:", [
    "✔ GET /users/1 – Dana (tester) in 120ms",
    "✘ POST /users – 1 validation error(s): email",
    "✔ GET /users/7 – Root (admin) in 1500ms",
    "✘ GET /users/9 – 503 Service Unavailable",
    "⚠ GET /users/2 – contract violation: body is not a valid User",
  ]);
  console.log(report.problems, "=> expected:", [
    ["GET /users/7", 'role "admin" is not allowed'],
    ["GET /users/7", "too slow: 1500ms > 1000ms"],
    ["GET /users/9", "server error 503"],
    ["GET /users/2", "body is not a valid User"],
  ]);
  console.log(report.verdict, "=> expected:", "FAIL");

  // Validation errors are expected answers to negative tests – they don't fail the run
  const green = buildReport(calls.slice(0, 2), new UserContract());
  console.log([green.verdict, green.problems.length], "=> expected:", ["PASS", 0]);

  console.log(buildReport([], new UserContract()), "=> expected:", {
    total: 0,
    counts: { success: 0, "validation-error": 0, "server-error": 0, "contract-violation": 0 },
    lines: [],
    problems: [],
    verdict: "PASS",
  });
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Task 6 (Challenge): parseTrafficLog + the whole pipeline ---");
try {
  const log = JSON.stringify([
    { request: "GET /users/1", status: 200, body: danaBody, ms: 120 },
    { request: "POST /users", status: 422, body: { errors: [{ field: "email", message: "is invalid" }] }, ms: 80 },
    { request: "GET /users/3", status: 200, ms: 15 },
    { request: "GET /users/9", status: 503, body: { message: "Service Unavailable" }, ms: 30 },
  ]);
  const parsed = parseTrafficLog(log);
  console.log(parsed.length, "=> expected:", 4);
  console.log(parsed[0], "=> expected:", ["GET", "/users/1", 200, danaBody, 120]);
  console.log(parsed[2], "=> expected:", ["GET", "/users/3", 200, undefined, 15]);
  console.log(parseTrafficLog("[]"), "=> expected:", []);

  // The whole pipeline: raw JSON text -> tuples -> results -> report
  const report = buildReport(parsed, new UserContract());
  console.log(report.verdict, "=> expected:", "FAIL");
  console.log(report.problems, "=> expected:", [
    ["GET /users/3", "body is not a valid User"],
    ["GET /users/9", "server error 503"],
  ]);

  const badLogs: [string, string][] = [
    ["not json", "Traffic log is not valid JSON"],
    ['{"request":"GET /users/1"}', "Traffic log must be a JSON array"],
    ["null", "Traffic log must be a JSON array"],
    ['[{"request":"GET /users/1","status":200,"ms":5},null]', "Bad entry at index 1"],
    ['[{"request":"FETCH /users","status":200,"ms":5}]', "Bad entry at index 0"],
    ['[{"request":"get /users","status":200,"ms":5}]', "Bad entry at index 0"],
    ['[{"request":"GET users","status":200,"ms":5}]', "Bad entry at index 0"],
    ['[{"request":"GET  /users","status":200,"ms":5}]', "Bad entry at index 0"],
    ['[{"request":"GET /users","status":"200","ms":5}]', "Bad entry at index 0"],
    ['[{"request":"GET /users","status":200.5,"ms":5}]', "Bad entry at index 0"],
    ['[{"request":"GET /users","status":200,"ms":-1}]', "Bad entry at index 0"],
    ['[{"request":"GET /users","status":200}]', "Bad entry at index 0"],
    ['[["GET","/users",200,null,5]]', "Bad entry at index 0"],
  ];
  for (const [badLog, expectedMessage] of badLogs) {
    try {
      parseTrafficLog(badLog);
      console.log("did not throw", "=> expected:", "threw:", expectedMessage);
    } catch (err) {
      if ((err as Error).message === "TODO") throw err;
      console.log("threw:", (err as Error).message, "=> expected:", "threw:", expectedMessage);
    }
  }
} catch (e) {
  console.log("  ✋", (e as Error).message);
}
