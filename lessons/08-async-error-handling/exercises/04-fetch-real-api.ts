// Lesson 8 – Topic 04: fetch against a real API – Exercises
// ------------------------------------------------------------
// Instructions:
//   1. Fill in the body of each function / class in place of the line  throw new Error("TODO")
//   2. The self-check at the end of the file starts the course's Mock server (shared/mock-api) on a random port
//      and passes you its address in baseUrl (e.g. "http://127.0.0.1:54321"). No internet needed.
//   3. Relevant endpoints:
//        GET    /health      -> 200 { status: "ok" }
//        GET    /users       -> 200 [ ...users ]
//        GET    /users/:id   -> 200 user  |  404 { error: "User <id> not found" }
//        POST   /users       -> 201 user  |  400 { error: "name and email are required" }
//        DELETE /users/:id   -> 204 (no body)  |  404 { error: "User <id> not found" }
//        GET    /slow?ms=N   -> 200 { waited: N } after N milliseconds
//   4. Check yourself: npm run exercise -- 08 04 (self-check at the end of the file)
// ------------------------------------------------------------
import type { User } from "../../../shared/mock-api/server.ts";

/**
 * Exercise 1 – checkHealth
 * Send GET to <baseUrl>/health. Return true only if:
 *   the status is 200  and  the response body (JSON) is { status: "ok" }
 * If the server is unavailable (fetch itself throws – e.g. connection refused) – return false, don't throw.
 * Hint: try { const res = await fetch(...); ... } catch { return false; }
 */
export async function checkHealth(baseUrl: string): Promise<boolean> {
  throw new Error("TODO");
}

/**
 * Exercise 2 – getUserById
 * Send GET to <baseUrl>/users/<id>:
 *   200 => return the user (await res.json())
 *   404 => return null (in a negative test, "not found" is an expected result, not an error)
 */
export async function getUserById(baseUrl: string, id: number): Promise<User | null> {
  throw new Error("TODO");
}

/**
 * Exercise 3 – validateUser: validating JSON returned from the API
 * Don't trust the response "because TypeScript said so" – you have to check at runtime.
 * Return an array of problems (empty array = valid), in this order:
 *   if data is not an object (or is null / an array)  => ["not an object"]   (and check nothing more)
 *   id is not a positive integer                        => "id must be a positive integer"
 *   name is not a non-empty string                      => "name must be a non-empty string"
 *   email is not a string containing "@"                => "email must contain @"
 *   role is not one of admin / tester / developer       => "role must be one of admin, tester, developer"
 * Hint: const u = data as Record<string, unknown>;  typeof / Number.isInteger / includes
 */
export function validateUser(data: unknown): string[] {
  throw new Error("TODO");
}

/**
 * Exercise 4 – HttpError + createUser
 * a. HttpError extends Error with:
 *      name = "HttpError",  status: number (public readonly)
 *      message: "HTTP <status>: <serverMessage>"
 *
 * b. createUser – send POST to <baseUrl>/users with input as JSON
 *    (headers: { "Content-Type": "application/json" },  body: JSON.stringify(input)).
 *      201 => return the created user
 *      any other status => throw HttpError(status, <the error field from the response body>)
 *    Example: input without email => HttpError: "HTTP 400: name and email are required"
 */
export class HttpError extends Error {
  constructor(status: number, serverMessage: string) {
    super("TODO");
    throw new Error("TODO");
  }

  get status(): number {
    throw new Error("TODO – you can replace the getter with a parameter property");
  }
}

export async function createUser(
  baseUrl: string,
  input: { name?: string; email?: string; role?: User["role"] },
): Promise<User> {
  throw new Error("TODO");
}

/**
 * Exercise 5 – deleteAndVerify: delete + verify that the user was really deleted
 *   1. Send DELETE to <baseUrl>/users/<id>
 *      If the status is not 204 => throw HttpError(status, <the error field from the response body>)
 *      (note: a 204 has no body – don't call res.json() in that case)
 *   2. Send GET to <baseUrl>/users/<id> – the status must be 404.
 *      Otherwise => throw Error: "User <id> still exists after delete"
 */
export async function deleteAndVerify(baseUrl: string, id: number): Promise<void> {
  throw new Error("TODO");
}

/**
 * Exercise 6 (Bonus) – getJsonWithTimeout
 * Send GET to url and return the response body (JSON).
 * If the response didn't arrive within ms – reject with Error: "Request timed out after <ms>ms".
 * Remember to clear the timer (clearTimeout) so it doesn't hold the process.
 * Hint: Promise.race between fetch(url).then((res) => res.json()) and a Promise that rejects after ms.
 */
export async function getJsonWithTimeout<T>(url: string, ms: number): Promise<T> {
  throw new Error("TODO");
}

// ============================================================
// Self-check – run:  npm run exercise -- 08 04
// On every line, the value left of "=> expected:" must equal the value on its right.
// (No need to change the code below this line)
// ============================================================
import { startMockApi } from "../../../shared/mock-api/server.ts";

// Runs code that is supposed to fail and prints the error message it got next to the expected message
async function expectError(run: () => unknown, expectedMessage: string): Promise<unknown> {
  try {
    await run();
    console.log("did not throw", "=> expected:", "threw:", expectedMessage);
    return undefined;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.startsWith("TODO")) throw err; // exercise not solved yet – reported as ✋ TODO
    console.log("threw:", message, "=> expected:", "threw:", expectedMessage);
    return err;
  }
}

// Runs code that is supposed to pass without an error
async function expectNoError(run: () => unknown): Promise<void> {
  try {
    await run();
    console.log("did not throw", "=> expected:", "did not throw");
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.startsWith("TODO")) throw err;
    console.log("threw:", message, "=> expected:", "did not throw");
  }
}

// Start the course's Mock server on a random free port, and close it at the end (otherwise the process doesn't exit)
const server = await startMockApi();
try {
  console.log("\n--- Exercise 1: checkHealth ---");
  try {
    console.log(await checkHealth(server.url), "=> expected:", true);
    // a path that doesn't exist returns 404 => false
    console.log(await checkHealth(`${server.url}/nothing-here`), "=> expected:", false);
    // an unavailable server (port 1 is closed) => false, without throwing
    console.log(await checkHealth("http://127.0.0.1:1"), "=> expected:", false);
  } catch (e) {
    console.log("  ✋", (e as Error).message);
  }

  console.log("\n--- Exercise 2: getUserById ---");
  try {
    console.log(await getUserById(server.url, 2), "=> expected:", {
      id: 2,
      name: "Yossi Cohen",
      email: "yossi@example.com",
      role: "tester",
    });
    console.log(await getUserById(server.url, 999), "=> expected:", null);
  } catch (e) {
    console.log("  ✋", (e as Error).message);
  }

  console.log("\n--- Exercise 3: validateUser ---");
  try {
    console.log(validateUser({ id: 1, name: "Dana", email: "dana@example.com", role: "admin" }), "=> expected:", []);
    console.log(validateUser(null), "=> expected:", ["not an object"]);
    console.log(validateUser("user"), "=> expected:", ["not an object"]);
    console.log(validateUser([1, 2]), "=> expected:", ["not an object"]);
    console.log(validateUser({ id: "1", name: "", email: "dana.example.com", role: "manager" }), "=> expected:", [
      "id must be a positive integer",
      "name must be a non-empty string",
      "email must contain @",
      "role must be one of admin, tester, developer",
    ]);
    console.log(validateUser({ id: 1.5, name: "Dana", email: "d@x.com", role: "tester" }), "=> expected:", [
      "id must be a positive integer",
    ]);
    console.log(validateUser({ id: 0, name: "Dana", role: "tester" }), "=> expected:", [
      "id must be a positive integer",
      "email must contain @",
    ]);

    // and also on the real data from the server – all of it is valid
    const users: unknown[] = await (await fetch(`${server.url}/users`)).json();
    console.log(users.length > 0, "=> expected:", true);
    for (const u of users) console.log(validateUser(u), "=> expected:", []);
  } catch (e) {
    console.log("  ✋", (e as Error).message);
  }

  console.log("\n--- Exercise 4: HttpError + createUser ---");
  try {
    const e = new HttpError(503, "maintenance");
    console.log(e instanceof Error, "=> expected:", true);
    console.log(e.name, "=> expected:", "HttpError");
    console.log(e.status, "=> expected:", 503);
    console.log(e.message, "=> expected:", "HTTP 503: maintenance");

    const created = await createUser(server.url, { name: "Avi", email: "avi@example.com", role: "developer" });
    console.log(created.name, "=> expected:", "Avi");
    console.log(created.email, "=> expected:", "avi@example.com");
    console.log(created.role, "=> expected:", "developer");
    console.log(created.id > 3, "=> expected:", true);
    // really saved on the server
    const res = await fetch(`${server.url}/users/${created.id}`);
    console.log(res.status, "=> expected:", 200);
    console.log(await res.json(), "=> expected:", created);

    const err = await expectError(
      () => createUser(server.url, { name: "No email" }),
      "HTTP 400: name and email are required",
    );
    console.log(err instanceof HttpError, "=> expected:", true);
    console.log((err as HttpError | undefined)?.status, "=> expected:", 400);
  } catch (e) {
    console.log("  ✋", (e as Error).message);
  }

  console.log("\n--- Exercise 5: deleteAndVerify ---");
  try {
    // create a temporary user directly (doesn't depend on Exercise 4)
    const res = await fetch(`${server.url}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Temp", email: "temp@example.com" }),
    });
    const temp = (await res.json()) as User;

    await expectNoError(() => deleteAndVerify(server.url, temp.id));
    console.log((await fetch(`${server.url}/users/${temp.id}`)).status, "=> expected:", 404);

    // a second delete – it no longer exists => HttpError 404
    const err = await expectError(() => deleteAndVerify(server.url, temp.id), `HTTP 404: User ${temp.id} not found`);
    console.log(err instanceof HttpError, "=> expected:", true);
    console.log((err as HttpError | undefined)?.status, "=> expected:", 404);
  } catch (e) {
    console.log("  ✋", (e as Error).message);
  }

  console.log("\n--- Exercise 6 (Bonus): getJsonWithTimeout ---");
  try {
    console.log(await getJsonWithTimeout(`${server.url}/slow?ms=5`, 1000), "=> expected:", { waited: 5 });
    console.log(await getJsonWithTimeout<{ status: string }>(`${server.url}/health`, 1000), "=> expected:", {
      status: "ok",
    });

    const start = Date.now();
    await expectError(() => getJsonWithTimeout(`${server.url}/slow?ms=100`, 20), "Request timed out after 20ms");
    // didn't wait for the slow response?
    console.log(Date.now() - start < 90, "=> expected:", true);

    // the slow request is still "in the air" – let it finish so the server closes right away
    await new Promise((r) => setTimeout(r, 120));
  } catch (e) {
    console.log("  ✋", (e as Error).message);
  }
} finally {
  await server.close();
}
