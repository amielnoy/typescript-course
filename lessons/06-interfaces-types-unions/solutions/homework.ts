// Lesson 6 – Homework (solution): API Contract Checker

// ---------- Given types ----------
export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";
export type Role = "admin" | "tester" | "viewer";

export interface User {
  readonly id: number;
  name: string;
  email: string;
  role: Role;
  nickname?: string;
}

export interface FieldError {
  field: string;
  message: string;
}

export type RawCall = [method: HttpMethod, path: string, status: number, body: unknown, durationMs: number];

export type ResultBase = { endpoint: string; durationMs: number };
export type SuccessResult = ResultBase & { kind: "success"; user: User };
export type ValidationResult = ResultBase & { kind: "validation-error"; errors: FieldError[] };
export type ServerErrorResult = ResultBase & { kind: "server-error"; status: number; message: string };
export type ContractViolation = ResultBase & { kind: "contract-violation"; reason: string };

export type CallResult = SuccessResult | ValidationResult | ServerErrorResult | ContractViolation;
export type ResultKind = "success" | "validation-error" | "server-error" | "contract-violation";

export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

// ---------- Task 1 ----------
export function isRole(value: unknown): value is Role {
  return value === "admin" || value === "tester" || value === "viewer";
}

export function isUser(value: unknown): value is User {
  if (!isPlainObject(value)) return false;
  const { id, name, email, role, nickname } = value;
  return (
    typeof id === "number" &&
    Number.isInteger(id) &&
    id > 0 &&
    typeof name === "string" &&
    typeof email === "string" &&
    isRole(role) &&
    (nickname === undefined || typeof nickname === "string")
  );
}

export function isFieldErrorList(value: unknown): value is FieldError[] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every((item) => isPlainObject(item) && typeof item.field === "string" && typeof item.message === "string")
  );
}

// ---------- Task 2 ----------
export function classifyCall(call: RawCall): CallResult {
  const [method, path, status, body, durationMs] = call;
  const endpoint = `${method} ${path}`;

  if (status >= 200 && status <= 299) {
    if (isUser(body)) return { kind: "success", endpoint, durationMs, user: body };
    return { kind: "contract-violation", endpoint, durationMs, reason: "body is not a valid User" };
  }

  if (status === 400 || status === 422) {
    const errors = isPlainObject(body) ? body.errors : undefined;
    if (isFieldErrorList(errors)) return { kind: "validation-error", endpoint, durationMs, errors };
    return { kind: "contract-violation", endpoint, durationMs, reason: "expected a non-empty errors list" };
  }

  if (status >= 500 && status <= 599) {
    const message = isPlainObject(body) && typeof body.message === "string" ? body.message : "(no message)";
    return { kind: "server-error", endpoint, durationMs, status, message };
  }

  return { kind: "contract-violation", endpoint, durationMs, reason: `unexpected status ${status}` };
}

// ---------- Task 3 ----------
export function describeResult(result: CallResult): string {
  switch (result.kind) {
    case "success":
      return `✔ ${result.endpoint} – ${result.user.name} (${result.user.role}) in ${result.durationMs}ms`;
    case "validation-error": {
      const fields = result.errors.map((e) => e.field).join(", ");
      return `✘ ${result.endpoint} – ${result.errors.length} validation error(s): ${fields}`;
    }
    case "server-error":
      return `✘ ${result.endpoint} – ${result.status} ${result.message}`;
    case "contract-violation":
      return `⚠ ${result.endpoint} – contract violation: ${result.reason}`;
    default: {
      const unknownResult: never = result;
      throw new Error(`Unknown result kind: ${JSON.stringify(unknownResult)}`);
    }
  }
}

// ---------- Task 4 ----------
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

export class UserContract implements ContractChecker {
  readonly rules: Readonly<ContractRules>;

  constructor(overrides: Partial<ContractRules> = {}) {
    // A fresh copy of the roles array, so no instance shares (or changes) the defaults
    this.rules = { ...DEFAULT_RULES, allowedRoles: [...DEFAULT_RULES.allowedRoles], ...overrides };
  }

  check(result: SuccessResult): string[] {
    const { user, durationMs } = result;
    const { allowedRoles, emailDomain, requireNickname, maxDurationMs } = this.rules;
    const problems: string[] = [];

    if (!allowedRoles.includes(user.role)) problems.push(`role "${user.role}" is not allowed`);
    if (!user.email.endsWith(`@${emailDomain}`)) problems.push(`email "${user.email}" is not @${emailDomain}`);
    if (requireNickname && !user.nickname) problems.push("nickname is missing");
    if (durationMs > maxDurationMs) problems.push(`too slow: ${durationMs}ms > ${maxDurationMs}ms`);

    return problems;
  }
}

// ---------- Task 5 (Challenge) ----------
export interface ContractReport {
  readonly total: number;
  counts: Record<ResultKind, number>;
  lines: string[];
  problems: [endpoint: string, problem: string][];
  verdict: "PASS" | "FAIL";
}

export function buildReport(calls: RawCall[], checker: ContractChecker): ContractReport {
  const counts: Record<ResultKind, number> = {
    success: 0,
    "validation-error": 0,
    "server-error": 0,
    "contract-violation": 0,
  };
  const lines: string[] = [];
  const problems: [endpoint: string, problem: string][] = [];

  for (const call of calls) {
    const result = classifyCall(call);
    counts[result.kind]++;
    lines.push(describeResult(result));

    if (result.kind === "success") {
      for (const problem of checker.check(result)) problems.push([result.endpoint, problem]);
    } else if (result.kind === "server-error") {
      problems.push([result.endpoint, `server error ${result.status}`]);
    } else if (result.kind === "contract-violation") {
      problems.push([result.endpoint, result.reason]);
    }
    // validation-error: an expected answer to a negative test – not a problem
  }

  return { total: calls.length, counts, lines, problems, verdict: problems.length === 0 ? "PASS" : "FAIL" };
}

// ---------- Task 6 (Challenge) ----------
export function isHttpMethod(value: unknown): value is HttpMethod {
  return value === "GET" || value === "POST" || value === "PUT" || value === "DELETE";
}

function toRawCall(entry: unknown): RawCall | undefined {
  if (!isPlainObject(entry)) return undefined;
  const { request, status, body, ms } = entry;
  if (typeof request !== "string") return undefined;

  const parts = request.split(" ");
  if (parts.length !== 2) return undefined;
  const [method, path] = parts;
  if (!isHttpMethod(method) || !path.startsWith("/")) return undefined;

  if (typeof status !== "number" || !Number.isInteger(status)) return undefined;
  if (typeof ms !== "number" || ms < 0) return undefined;

  return [method, path, status, body, ms];
}

export function parseTrafficLog(json: string): RawCall[] {
  let data: unknown;
  try {
    data = JSON.parse(json);
  } catch {
    throw new Error("Traffic log is not valid JSON");
  }
  if (!Array.isArray(data)) throw new Error("Traffic log must be a JSON array");

  return data.map((entry, index) => {
    const call = toRawCall(entry);
    if (!call) throw new Error(`Bad entry at index ${index}`);
    return call;
  });
}

// ============================================================
// Self-check – run:  npm run solution -- 06 hw
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
