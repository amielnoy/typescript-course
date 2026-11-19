// Lesson 10 – Topic 03: Collecting evidence on failure – Solutions
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export type CaptureMode = "off" | "on" | "only-on-failure" | "on-first-retry";

export function shouldCapture(mode: CaptureMode, status: "passed" | "failed", retry: number): boolean {
  switch (mode) {
    case "off":
      return false;
    case "on":
      return true;
    case "only-on-failure":
      return status === "failed";
    case "on-first-retry":
      return retry === 1;
  }
}

export interface FailureContext {
  test: string;
  error: string;
  failedAt: string;
  lastLogs: string[];
}

const messageOf = (err: unknown): string => (err instanceof Error ? err.message : String(err));

export function buildFailureContext(
  testName: string,
  err: unknown,
  logs: string[],
  date: Date,
  maxLogs = 5,
): FailureContext {
  return {
    test: testName,
    error: messageOf(err),
    failedAt: date.toISOString(),
    // slice(-0) would return everything – so compute the start index explicitly
    lastLogs: logs.slice(Math.max(0, logs.length - maxLogs)),
  };
}

export interface ResponseSnapshot {
  method: string;
  url: string;
  status: number;
  headers: Record<string, string>;
  body: unknown;
}

const SENSITIVE_HEADERS = new Set(["authorization", "cookie", "set-cookie", "x-api-key"]);

export function formatResponseEvidence(snapshot: ResponseSnapshot): string {
  const headers = Object.fromEntries(
    Object.entries(snapshot.headers).map(([k, v]) => [k, SENSITIVE_HEADERS.has(k.toLowerCase()) ? "***" : v]),
  );
  return JSON.stringify({ ...snapshot, headers }, null, 2);
}

export interface RunOutcome {
  status: "passed" | "failed";
  error?: string;
  evidenceError?: string;
}

export async function runWithEvidence(
  testName: string,
  fn: () => void | Promise<void>,
  onFailure: (testName: string, err: unknown) => void | Promise<void>,
): Promise<RunOutcome> {
  try {
    await fn();
    return { status: "passed" };
  } catch (err) {
    const outcome: RunOutcome = { status: "failed", error: messageOf(err) };
    try {
      await onFailure(testName, err);
    } catch (evidenceErr) {
      // a problem in evidence collection – report it, but don't hide the original failure
      outcome.evidenceError = messageOf(evidenceErr);
    }
    return outcome;
  }
}

export interface Attachment {
  name: string;
  contentType: string;
  body: string;
}

/** "page.html" + 2 => "page-2.html";  "console" + 2 => "console-2" */
function withSuffix(name: string, n: number): string {
  const dot = name.lastIndexOf(".");
  if (dot <= 0) return `${name}-${n}`; // no extension (or a file that starts with a dot)
  return `${name.slice(0, dot)}-${n}${name.slice(dot)}`;
}

export class EvidenceCollector {
  private attachments: Attachment[] = [];
  private used = new Set<string>();

  attach(name: string, contentType: string, body: string): string {
    let finalName = name;
    for (let n = 2; this.used.has(finalName); n++) finalName = withSuffix(name, n);
    this.used.add(finalName);
    this.attachments.push({ name: finalName, contentType, body });
    return finalName;
  }

  list(): Attachment[] {
    return this.attachments.map((a) => ({ ...a }));
  }

  manifest(): string {
    if (this.attachments.length === 0) return "no evidence collected";
    return this.attachments
      .map((a) => `${a.name} (${a.contentType}, ${Buffer.byteLength(a.body, "utf8")} bytes)`)
      .join("\n");
  }
}

const isUnsafeName = (name: string) => name.includes("/") || name.includes("\\") || name.includes("..");

export function writeEvidence(dir: string, attachments: Attachment[]): string[] {
  // first make sure all the names are safe – and only then touch the disk
  const unsafe = attachments.find((a) => isUnsafeName(a.name));
  if (unsafe) throw new Error(`unsafe file name: ${unsafe.name}`);

  mkdirSync(dir, { recursive: true });
  return attachments.map((a) => {
    const path = join(dir, a.name);
    writeFileSync(path, a.body, "utf8");
    return path;
  });
}

// ============================================================
// Self-check – run:  npm run solution -- 10 03
// On every line, the value left of "=> expected:" must equal the value on its right.
// (No need to change the code below this line)
// Multi-line text (JSON, manifest) is printed as an array of lines – so it's easy to see which line differs.
// ============================================================

import * as nodeFs from "node:fs";
import * as nodeOs from "node:os";
import * as nodePath from "node:path";

const sampleDate = new Date("2026-11-08T10:00:00.000Z");

console.log("\n--- Exercise 1: shouldCapture ---");
try {
  console.log(shouldCapture("off", "failed", 0), "=> expected:", false);
  console.log(shouldCapture("off", "passed", 1), "=> expected:", false);
  console.log(shouldCapture("on", "passed", 0), "=> expected:", true);
  console.log(shouldCapture("on", "failed", 3), "=> expected:", true);
  console.log(shouldCapture("only-on-failure", "failed", 0), "=> expected:", true);
  console.log(shouldCapture("only-on-failure", "failed", 2), "=> expected:", true);
  console.log(shouldCapture("only-on-failure", "passed", 0), "=> expected:", false);
  console.log(shouldCapture("on-first-retry", "passed", 1), "=> expected:", true);
  console.log(shouldCapture("on-first-retry", "failed", 1), "=> expected:", true);
  console.log(shouldCapture("on-first-retry", "failed", 0), "=> expected:", false);
  console.log(shouldCapture("on-first-retry", "failed", 2), "=> expected:", false);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 2: buildFailureContext ---");
try {
  const logs = ["a", "b", "c"];
  console.log(buildFailureContext("login", new Error("timeout"), logs, sampleDate, 2), "=> expected:", {
    test: "login",
    error: "timeout",
    failedAt: "2026-11-08T10:00:00.000Z",
    lastLogs: ["b", "c"],
  });
  console.log(buildFailureContext("x", "plain string", logs, sampleDate).lastLogs, "=> expected:", ["a", "b", "c"]);
  console.log(buildFailureContext("x", "plain string", logs, sampleDate).error, "=> expected:", "plain string");
  console.log(buildFailureContext("x", 404, [], sampleDate).error, "=> expected:", "404");
  console.log(buildFailureContext("x", new Error("e"), logs, sampleDate, 0).lastLogs, "=> expected:", []);
  console.log(buildFailureContext("x", new Error("e"), [], sampleDate).lastLogs, "=> expected:", []);
  const many = Array.from({ length: 8 }, (_, i) => `line ${i + 1}`);
  console.log(buildFailureContext("x", new Error("e"), many, sampleDate).lastLogs, "=> expected:", [
    "line 4",
    "line 5",
    "line 6",
    "line 7",
    "line 8",
  ]);
  // The original logs array was not changed:
  console.log(logs, "=> expected:", ["a", "b", "c"]);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 3: formatResponseEvidence ---");
try {
  const snapshot: ResponseSnapshot = {
    method: "GET",
    url: "/users/2",
    status: 200,
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer abc",
      COOKIE: "sid=1",
      "set-cookie": "sid=2",
      "X-Api-Key": "k-123",
    },
    body: { role: "viewer", tags: ["a"] },
  };
  const text = formatResponseEvidence(snapshot);
  console.log(
    text.split("\n"),
    "=> expected:",
    JSON.stringify(
      {
        method: "GET",
        url: "/users/2",
        status: 200,
        headers: {
          "Content-Type": "application/json",
          Authorization: "***",
          COOKIE: "***",
          "set-cookie": "***",
          "X-Api-Key": "***",
        },
        body: { role: "viewer", tags: ["a"] },
      },
      null,
      2,
    ).split("\n"),
  );
  console.log(text.includes("Bearer abc"), "=> expected:", false);
  // The original object was not changed:
  console.log(snapshot.headers.Authorization, "=> expected:", "Bearer abc");
  console.log(
    formatResponseEvidence({ method: "DELETE", url: "/x", status: 204, headers: {}, body: null }).split("\n"),
    "=> expected:",
    JSON.stringify({ method: "DELETE", url: "/x", status: 204, headers: {}, body: null }, null, 2).split("\n"),
  );
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 4: runWithEvidence ---");
try {
  const calls: string[] = [];
  const onFailure = async (name: string, err: unknown) => {
    calls.push(`${name}: ${(err as Error).message}`);
  };

  console.log(await runWithEvidence("ok test", async () => {}, onFailure), "=> expected:", { status: "passed" });
  // When the test passes – onFailure is not called:
  console.log(calls, "=> expected:", []);

  console.log(
    await runWithEvidence(
      "admin test",
      async () => {
        throw new Error('expected role "admin"');
      },
      onFailure,
    ),
    "=> expected:",
    { status: "failed", error: 'expected role "admin"' },
  );
  console.log(calls, "=> expected:", ['admin test: expected role "admin"']);

  // A synchronous test that throws something that is not an Error
  console.log(
    await runWithEvidence(
      "sync",
      () => {
        throw "boom";
      },
      () => {},
    ),
    "=> expected:",
    { status: "failed", error: "boom" },
  );

  // Evidence collection fails too – the original failure doesn't disappear
  console.log(
    await runWithEvidence(
      "broken evidence",
      () => {
        throw new Error("assertion failed");
      },
      async () => {
        throw new Error("disk full");
      },
    ),
    "=> expected:",
    { status: "failed", error: "assertion failed", evidenceError: "disk full" },
  );
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 5: EvidenceCollector ---");
try {
  const c = new EvidenceCollector();
  console.log(c.manifest(), "=> expected:", "no evidence collected");
  console.log(c.list(), "=> expected:", []);
  console.log(c.attach("page.html", "text/html", "<h1>Hi</h1>"), "=> expected:", "page.html");
  console.log(c.attach("page.html", "text/html", "<h1>Again</h1>"), "=> expected:", "page-2.html");
  console.log(c.attach("page.html", "text/html", "<p/>"), "=> expected:", "page-3.html");
  console.log(c.attach("console", "text/plain", "שלום"), "=> expected:", "console");
  console.log(c.attach("console", "text/plain", "x"), "=> expected:", "console-2");
  console.log(c.attach("trace.zip.json", "application/json", "{}"), "=> expected:", "trace.zip.json");
  console.log(c.attach("trace.zip.json", "application/json", "[]"), "=> expected:", "trace.zip-2.json");

  const list = c.list();
  console.log(
    list.map((a) => a.name),
    "=> expected:",
    ["page.html", "page-2.html", "page-3.html", "console", "console-2", "trace.zip.json", "trace.zip-2.json"],
  );
  console.log(list[1], "=> expected:", { name: "page-2.html", contentType: "text/html", body: "<h1>Again</h1>" });
  // list() returns a copy – changing it does not affect the collector:
  list.pop();
  console.log(c.list().length, "=> expected:", 7);

  console.log(c.manifest().split("\n"), "=> expected:", [
    "page.html (text/html, 11 bytes)",
    "page-2.html (text/html, 14 bytes)",
    "page-3.html (text/html, 4 bytes)",
    "console (text/plain, 8 bytes)",
    "console-2 (text/plain, 1 bytes)",
    "trace.zip.json (application/json, 2 bytes)",
    "trace.zip-2.json (application/json, 2 bytes)",
  ]);

  // Each collector is independent
  console.log(new EvidenceCollector().attach("page.html", "text/html", ""), "=> expected:", "page.html");
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 6 (Bonus): writeEvidence ---");
try {
  const tmp = nodeFs.mkdtempSync(nodePath.join(nodeOs.tmpdir(), "lesson09-evidence-"));
  try {
    const dir = nodePath.join(tmp, "run-1");
    const paths = writeEvidence(dir, [
      { name: "page.html", contentType: "text/html", body: "<h1>שלום</h1>" },
      { name: "login.response.json", contentType: "application/json", body: '{"status":200}' },
    ]);
    console.log(paths, "=> expected:", [nodePath.join(dir, "page.html"), nodePath.join(dir, "login.response.json")]);
    console.log(nodeFs.readFileSync(nodePath.join(dir, "page.html"), "utf8"), "=> expected:", "<h1>שלום</h1>");
    console.log(nodeFs.readFileSync(nodePath.join(dir, "login.response.json"), "utf8"), "=> expected:", '{"status":200}');

    console.log(writeEvidence(nodePath.join(tmp, "empty"), []), "=> expected:", []);

    for (const [i, bad] of ["../escape.txt", "sub/file.txt", "sub\\file.txt", ".."].entries()) {
      const badDir = nodePath.join(tmp, `bad-${i}`);
      try {
        writeEvidence(badDir, [
          { name: "ok.txt", contentType: "text/plain", body: "ok" },
          { name: bad, contentType: "text/plain", body: "x" },
        ]);
        console.log("did not throw", "=> expected:", `unsafe file name: ${bad}`);
      } catch (err) {
        if ((err as Error).message === "TODO") throw err;
        console.log((err as Error).message, "=> expected:", `unsafe file name: ${bad}`);
      }
      // When a name is unsafe – no file is written:
      console.log(nodeFs.existsSync(nodePath.join(badDir, "ok.txt")), "=> expected:", false);
    }
    console.log(nodeFs.existsSync(nodePath.join(tmp, "escape.txt")), "=> expected:", false);
  } finally {
    nodeFs.rmSync(tmp, { recursive: true, force: true });
  }
} catch (e) {
  console.log("  ✋", (e as Error).message);
}
