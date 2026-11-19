// Lesson 10 – Topic 03: Collecting evidence on failure – Exercises
// ------------------------------------------------------------
// Instructions:
//   1. Fill in the body of each function/method in place of the line  throw new Error("TODO")
//   2. It is recommended to keep the example  examples/03-evidence-on-failure.ts  open alongside this file
//   3. The time comes in as a parameter (Date) and the evidence is collected in memory – that keeps the tests deterministic.
//      Only the bonus exercise writes to disk, and only to the folder it receives as a parameter.
//   4. Check yourself: npm run exercise -- 10 03 (self-check at the end of the file)
// ------------------------------------------------------------

/** The same modes as screenshot / trace / video in playwright.config.ts */
export type CaptureMode = "off" | "on" | "only-on-failure" | "on-first-retry";

/**
 * Exercise 1 – Should we save evidence?
 * retry = the retry attempt number (0 = the first run, 1 = the first retry, ...)
 *   "off"             => never
 *   "on"              => always
 *   "only-on-failure" => only when the test failed
 *   "on-first-retry"  => only on the first retry (retry === 1), regardless of the result
 *   shouldCapture("only-on-failure", "failed", 0) => true
 *   shouldCapture("only-on-failure", "passed", 0) => false
 *   shouldCapture("on-first-retry", "passed", 1)  => true
 *   shouldCapture("on-first-retry", "failed", 0)  => false
 */
export function shouldCapture(mode: CaptureMode, status: "passed" | "failed", retry: number): boolean {
  throw new Error("TODO");
}

export interface FailureContext {
  test: string;
  /** The error message */
  error: string;
  /** When it failed – ISO */
  failedAt: string;
  /** The last lines in the log before the failure */
  lastLogs: string[];
}

/**
 * Exercise 2 – A "snapshot" of the failure
 * When a test fails we save the context: which test, what the error is, when, and what happened right before.
 *   buildFailureContext("login", new Error("timeout"), ["a", "b", "c"], new Date("2026-11-08T10:00:00.000Z"), 2)
 *     => { test: "login", error: "timeout", failedAt: "2026-11-08T10:00:00.000Z", lastLogs: ["b", "c"] }
 * - err can be anything (throw "text" is valid in JS!):
 *     Error      => err.message
 *     otherwise  => String(err)
 * - lastLogs: only the last maxLogs lines (default 5). maxLogs = 0 => []
 *   Trap: logs.slice(-0) returns the whole array! (because -0 === 0)
 * - you must not change the original logs array
 */
export function buildFailureContext(
  testName: string,
  err: unknown,
  logs: string[],
  date: Date,
  maxLogs = 5,
): FailureContext {
  throw new Error("TODO");
}

export interface ResponseSnapshot {
  method: string;
  url: string;
  status: number;
  headers: Record<string, string>;
  body: unknown;
}

/**
 * Exercise 3 – Saving a request/response as evidence (a .response.json file)
 * Return formatted JSON (2-space indentation) of the snapshot, but:
 * sensitive headers are hidden as "***": authorization, cookie, set-cookie, x-api-key
 * (case-insensitive – the header name is kept as it is, only the value is replaced)
 *   formatResponseEvidence({ method: "GET", url: "/users/2", status: 200,
 *                            headers: { "Content-Type": "application/json", Authorization: "Bearer abc" },
 *                            body: { role: "viewer" } })
 *     => JSON.stringify({ ...the same, headers: { "Content-Type": "application/json", Authorization: "***" } }, null, 2)
 * - you must not change the original object
 */
export function formatResponseEvidence(snapshot: ResponseSnapshot): string {
  throw new Error("TODO");
}

export interface RunOutcome {
  status: "passed" | "failed";
  /** The test's error message (only if it failed) */
  error?: string;
  /** If evidence collection also failed – its message */
  evidenceError?: string;
}

/**
 * Exercise 4 – Running a test with evidence collection (async)
 * Exactly the pattern from the example: try { await test } catch { await collectEvidence }
 * - fn passed                  => { status: "passed" }   (and onFailure is not called!)
 * - fn threw err               => await onFailure(testName, err), then { status: "failed", error: <message> }
 * - onFailure threw too        => { status: "failed", error: <the test's message>, evidenceError: <onFailure's message> }
 *   (a problem in evidence collection must never hide the original failure!)
 * - the function itself never throws
 * - message: Error => message, otherwise String(err)
 * Hint: note that fn and onFailure can be synchronous or asynchronous – await works on both.
 */
export async function runWithEvidence(
  testName: string,
  fn: () => void | Promise<void>,
  onFailure: (testName: string, err: unknown) => void | Promise<void>,
): Promise<RunOutcome> {
  throw new Error("TODO");
}

export interface Attachment {
  name: string;
  contentType: string;
  body: string;
}

/**
 * Exercise 5 – An evidence collector (like testInfo.attach in Playwright)
 *   const c = new EvidenceCollector();
 *   c.attach("page.html", "text/html", "<h1>Hi</h1>")        => "page.html"
 *   c.attach("page.html", "text/html", "<h1>Again</h1>")     => "page-2.html"   (duplicate name!)
 *   c.attach("page.html", "text/html", "...")                => "page-3.html"
 *   c.attach("console", "text/plain", "שלום")                 => "console"      (no extension)
 *   c.attach("console", "text/plain", "x")                    => "console-2"
 *   c.list()     => all the Attachments in order (with their final names). Return a copy – changing it does not affect the collector.
 *   c.manifest() => one line per piece of evidence:  "<name> (<contentType>, <bytes> bytes)"   separated by \n
 *                   "console (text/plain, 8 bytes)"    ← "שלום" (Hebrew for "hello") = 4 characters but 8 bytes in UTF-8!
 *                   if there is no evidence: "no evidence collected"
 * - the extension = from the last dot ("trace.zip.json" => "trace.zip-2.json")
 * Hint: Buffer.byteLength(body, "utf8")
 */
export class EvidenceCollector {
  attach(name: string, contentType: string, body: string): string {
    throw new Error("TODO");
  }

  list(): Attachment[] {
    throw new Error("TODO");
  }

  manifest(): string {
    throw new Error("TODO");
  }
}

/**
 * Exercise 6 (Bonus) – Writing the evidence to disk
 * Write each attachment to the file  join(dir, attachment.name)  (content in utf8) and return the list of paths, in order.
 * - if the folder doesn't exist – create it (mkdirSync with { recursive: true })
 * - security: a file name that contains "/" or "\" or ".." is not safe (it could write outside the folder!)
 *   in that case throw an Error with the message  `unsafe file name: <name>`
 *   and check all the names *before* writing anything – that way no half-filled folder is left behind.
 *   writeEvidence("/tmp/run-1", [{ name: "page.html", contentType: "text/html", body: "<h1/>" }])
 *     => ["/tmp/run-1/page.html"]
 * Hint: import { mkdirSync, writeFileSync } from "node:fs";  import { join } from "node:path";
 */
export function writeEvidence(dir: string, attachments: Attachment[]): string[] {
  throw new Error("TODO");
}

// ============================================================
// Self-check – run:  npm run exercise -- 10 03
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
