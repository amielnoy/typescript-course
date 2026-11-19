// Lesson 8 – Topic 04: fetch against a real API – Solutions
import type { User } from "../../../shared/mock-api/server.ts";

export async function checkHealth(baseUrl: string): Promise<boolean> {
  try {
    const res = await fetch(`${baseUrl}/health`);
    if (res.status !== 200) return false;
    const body = await res.json();
    return body?.status === "ok";
  } catch {
    // fetch only throws on a network problem (server unavailable, DNS...) – not on 404/500
    return false;
  }
}

export async function getUserById(baseUrl: string, id: number): Promise<User | null> {
  const res = await fetch(`${baseUrl}/users/${id}`);
  if (res.status === 404) return null;
  return (await res.json()) as User;
}

const ROLES = ["admin", "tester", "developer"];

export function validateUser(data: unknown): string[] {
  if (typeof data !== "object" || data === null || Array.isArray(data)) return ["not an object"];
  const u = data as Record<string, unknown>;
  const problems: string[] = [];
  if (typeof u.id !== "number" || !Number.isInteger(u.id) || u.id <= 0) problems.push("id must be a positive integer");
  if (typeof u.name !== "string" || u.name.trim() === "") problems.push("name must be a non-empty string");
  if (typeof u.email !== "string" || !u.email.includes("@")) problems.push("email must contain @");
  if (typeof u.role !== "string" || !ROLES.includes(u.role)) {
    problems.push(`role must be one of ${ROLES.join(", ")}`);
  }
  return problems;
}

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    serverMessage: string,
  ) {
    super(`HTTP ${status}: ${serverMessage}`);
    this.name = "HttpError";
  }
}

export async function createUser(
  baseUrl: string,
  input: { name?: string; email?: string; role?: User["role"] },
): Promise<User> {
  const res = await fetch(`${baseUrl}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const body = await res.json();
  if (res.status !== 201) throw new HttpError(res.status, body.error);
  return body as User;
}

export async function deleteAndVerify(baseUrl: string, id: number): Promise<void> {
  const del = await fetch(`${baseUrl}/users/${id}`, { method: "DELETE" });
  if (del.status !== 204) {
    const body = await del.json(); // only when there is a body (not on 204)
    throw new HttpError(del.status, body.error);
  }
  const check = await fetch(`${baseUrl}/users/${id}`);
  await check.body?.cancel(); // we don't need the body – release the connection
  if (check.status !== 404) throw new Error(`User ${id} still exists after delete`);
}

export async function getJsonWithTimeout<T>(url: string, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`Request timed out after ${ms}ms`)), ms);
  });
  const request = fetch(url).then((res) => res.json() as Promise<T>);
  try {
    return await Promise.race([request, timeout]);
  } finally {
    clearTimeout(timer); // otherwise the timer keeps "ticking" even after we got a response
  }
}

// ============================================================
// Self-check – run:  npm run solution -- 08 04
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
