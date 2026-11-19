// בדיקות API לדוגמה שכתובות עם node:test (מובנה ב-Node – בלי התקנות).
// משמשות את דוגמה 02 כדי להדגים reporters (פורמטים של דוחות).
// הרצה ישירה:  node --import tsx --test lessons/10-ci-cd-logs-reports/examples/sample-tests/users-api.test.ts
import { before, after, describe, it } from "node:test";
import assert from "node:assert/strict";
import { startMockApi, type RunningServer } from "../../../../shared/mock-api/server.ts";

let api: RunningServer;

before(async () => {
  api = await startMockApi();
});
after(async () => {
  await api.close();
});

describe("Users API", () => {
  it("GET /health returns ok", async () => {
    const res = await fetch(`${api.url}/health`);
    assert.equal(res.status, 200);
    assert.deepEqual(await res.json(), { status: "ok" });
  });

  it("GET /users returns a non-empty list", async () => {
    const users = (await (await fetch(`${api.url}/users`)).json()) as unknown[];
    assert.ok(users.length > 0);
  });

  it("GET /users/999 returns 404", async () => {
    const res = await fetch(`${api.url}/users/999`);
    assert.equal(res.status, 404);
  });

  it("POST /users without email returns 400", async () => {
    const res = await fetch(`${api.url}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "No Email" }),
    });
    assert.equal(res.status, 400);
  });

  it.skip("DELETE /users/1 as non-admin returns 403 (not implemented yet)", () => {});
});
