// שיעור 8 – דוגמה 4: קריאות HTTP אמיתיות עם fetch + async/await + טיפול בשגיאות
// הרצה:  npx tsx lessons/08-async-error-handling/examples/04-fetch-real-api.ts
//
// הדוגמה מפעילה את שרת ה-Mock המקומי של הקורס (shared/mock-api), ולכן לא צריך אינטרנט.
// זה "גשר" לשיעורי בדיקות ה-API: אותו דפוס בדיוק נשתמש בו עם Axios ו-Playwright.

import { startMockApi, type User } from "../../../shared/mock-api/server.ts";

class HttpError extends Error {
  constructor(
    public status: number,
    public body: unknown,
  ) {
    super(`HTTP ${status}`);
  }
}

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  const body = res.status === 204 ? undefined : await res.json();
  if (!res.ok) throw new HttpError(res.status, body);
  return body as T;
}

async function postJson<T>(url: string, data: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const body = await res.json();
  if (!res.ok) throw new HttpError(res.status, body);
  return body as T;
}

const server = await startMockApi(); // פורט אקראי פנוי
console.log("Mock API started at", server.url);

try {
  // 1. GET רשימה
  const users = await getJson<User[]>(`${server.url}/users`);
  console.log(`GET /users -> ${users.length} users:`, users.map((u) => u.name).join(", "));

  // 2. GET בודד
  const user = await getJson<User>(`${server.url}/users/2`);
  console.log("GET /users/2 ->", user);

  // 3. POST – יצירה
  const created = await postJson<User>(`${server.url}/users`, { name: "Avi", email: "avi@example.com" });
  console.log("POST /users ->", created);

  // 4. בדיקה שלילית: משתמש שלא קיים
  try {
    await getJson<User>(`${server.url}/users/999`);
  } catch (err) {
    if (err instanceof HttpError) console.log(`GET /users/999 -> expected error ${err.status}`, err.body);
  }

  // 5. בדיקה שלילית: POST בלי שדות חובה
  try {
    await postJson(`${server.url}/users`, { name: "No email" });
  } catch (err) {
    if (err instanceof HttpError) console.log(`POST invalid -> expected error ${err.status}`, err.body);
  }

  // 6. מקבילי
  const [u1, u3] = await Promise.all([getJson<User>(`${server.url}/users/1`), getJson<User>(`${server.url}/users/3`)]);
  console.log("Parallel:", u1.name, "&", u3.name);
} finally {
  await server.close(); // תמיד לסגור – גם אם משהו נכשל
  console.log("Mock API stopped");
}
