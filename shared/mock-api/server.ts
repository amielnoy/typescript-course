// שרת REST API קטן ו"מקומי" שמשמש כמערכת-תחת-בדיקה (SUT) בדוגמאות.
// אין צורך באינטרנט – הכול רץ על המחשב שלכם.
//
// Endpoints:
//   GET    /health            -> { status: "ok" }
//   GET    /users             -> רשימת משתמשים
//   GET    /users/:id         -> משתמש בודד או 404
//   POST   /users             -> יצירת משתמש (name, email חובה) -> 201 / 400
//   DELETE /users/:id         -> 204 / 404
//   GET    /slow?ms=500       -> תשובה מושהית (לתרגול timeouts)
//   GET    /app               -> דף HTML קטן עם טופס התחברות (לבדיקות UI)
import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";
import type { AddressInfo } from "node:net";

export interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "tester" | "developer";
}

const seedUsers = (): User[] => [
  { id: 1, name: "Dana Levi", email: "dana@example.com", role: "admin" },
  { id: 2, name: "Yossi Cohen", email: "yossi@example.com", role: "tester" },
  { id: 3, name: "Noa Mizrahi", email: "noa@example.com", role: "developer" },
];

const APP_HTML = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>Demo App</title></head>
<body>
  <h1>Demo Login</h1>
  <form id="login">
    <label>Username <input id="username" name="username" /></label>
    <label>Password <input id="password" name="password" type="password" /></label>
    <button type="submit" id="submit">Login</button>
  </form>
  <p id="message" role="status"></p>
  <script>
    document.getElementById('login').addEventListener('submit', (e) => {
      e.preventDefault();
      const u = document.getElementById('username').value;
      const p = document.getElementById('password').value;
      const msg = document.getElementById('message');
      setTimeout(() => {
        msg.textContent = (u === 'admin' && p === '1234') ? 'Welcome, admin!' : 'Invalid credentials';
      }, 300);
    });
  </script>
</body></html>`;

function sendJson(res: ServerResponse, status: number, body?: unknown): void {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(body === undefined ? "" : JSON.stringify(body));
}

async function readBody(req: IncomingMessage): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  return Buffer.concat(chunks).toString("utf8");
}

export interface RunningServer {
  url: string;
  port: number;
  close: () => Promise<void>;
}

export function createMockApi(): Server {
  let users = seedUsers();
  let nextId = users.length + 1;

  return createServer(async (req, res) => {
    const url = new URL(req.url ?? "/", "http://localhost");
    const parts = url.pathname.split("/").filter(Boolean); // ["users", "2"]

    try {
      if (req.method === "GET" && url.pathname === "/health") {
        return sendJson(res, 200, { status: "ok" });
      }

      if (req.method === "GET" && url.pathname === "/app") {
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        return res.end(APP_HTML);
      }

      if (req.method === "GET" && url.pathname === "/slow") {
        const ms = Number(url.searchParams.get("ms") ?? 500);
        await new Promise((r) => setTimeout(r, ms));
        return sendJson(res, 200, { waited: ms });
      }

      if (parts[0] === "users") {
        const id = parts[1] ? Number(parts[1]) : undefined;

        if (req.method === "GET" && id === undefined) return sendJson(res, 200, users);

        if (req.method === "GET" && id !== undefined) {
          const user = users.find((u) => u.id === id);
          return user ? sendJson(res, 200, user) : sendJson(res, 404, { error: `User ${id} not found` });
        }

        if (req.method === "POST" && id === undefined) {
          let data: Partial<User>;
          try {
            data = JSON.parse(await readBody(req));
          } catch {
            return sendJson(res, 400, { error: "Body must be valid JSON" });
          }
          if (!data.name || !data.email) {
            return sendJson(res, 400, { error: "name and email are required" });
          }
          const user: User = { id: nextId++, name: data.name, email: data.email, role: data.role ?? "tester" };
          users.push(user);
          return sendJson(res, 201, user);
        }

        if (req.method === "DELETE" && id !== undefined) {
          const before = users.length;
          users = users.filter((u) => u.id !== id);
          return users.length < before ? sendJson(res, 204) : sendJson(res, 404, { error: `User ${id} not found` });
        }
      }

      sendJson(res, 404, { error: `No route for ${req.method} ${url.pathname}` });
    } catch (err) {
      sendJson(res, 500, { error: String(err) });
    }
  });
}

/** מפעיל את השרת. port=0 => המערכת בוחרת פורט פנוי (מצוין לבדיקות). */
export function startMockApi(port = 0): Promise<RunningServer> {
  const server = createMockApi();
  return new Promise((resolve) => {
    server.listen(port, "127.0.0.1", () => {
      const { port: actual } = server.address() as AddressInfo;
      resolve({
        port: actual,
        url: `http://127.0.0.1:${actual}`,
        close: () => new Promise<void>((r) => server.close(() => r())),
      });
    });
  });
}
