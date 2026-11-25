// חזרה למבחן – דוגמה 5: קוד אסינכרוני וטיפול בשגיאות (שיעור 8)
// הרצה:  npx tsx review/examples/05-async-errors.ts

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

// ---------- סדר ריצה: sync => microtask (Promise) => macrotask (setTimeout) ----------
console.log("1 sync");
setTimeout(() => console.log("4 timeout (macrotask)"), 0);
Promise.resolve().then(() => console.log("3 then (microtask)"));
console.log("2 sync");
await wait(10);

// ---------- async תמיד מחזירה Promise ----------
async function getStatus(): Promise<number> {
  return 200;
}
const p = getStatus();
console.log(p instanceof Promise);
p.then((s) => console.log("then:", s));
console.log("await:", await getStatus());

// ---------- סדרתי מול מקבילי ----------
const delayed = (ms: number, v: string) => new Promise<string>((r) => setTimeout(() => r(v), ms));
let t = Date.now();
const a = await delayed(100, "a");
const b = await delayed(100, "b");
console.log("serial  ", a, b, Math.round((Date.now() - t) / 100) * 100, "ms");
t = Date.now();
const [c, d] = await Promise.all([delayed(100, "c"), delayed(100, "d")]);
console.log("parallel", c, d, Math.round((Date.now() - t) / 100) * 100, "ms");

// ---------- try/catch עובד רק עם await ----------
async function fetchUser(id: number) {
  if (id <= 0) throw new Error(`invalid id ${id}`);
  return { id };
}
async function good() {
  try {
    return await fetchUser(0);
  } catch (e) {
    return `caught: ${(e as Error).message}`;
  }
}
async function bad() {
  try {
    return fetchUser(0); // בלי await – הדחייה "בורחת" מה-try
  } catch {
    return "never here";
  }
}
console.log(await good());
await bad().catch((e: Error) => console.log("escaped:", e.message));

// ---------- מחלקת שגיאה מותאמת ו-catch עם unknown ----------
class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(`HTTP ${status}: ${message}`);
    this.name = "HttpError";
  }
}
function describeError(e: unknown): string {
  if (e instanceof HttpError) return `${e.name} ${e.status} – ${e.message}`;
  if (e instanceof Error) return e.message;
  return String(e);
}
console.log(describeError(new HttpError(503, "unavailable")));
console.log(describeError(new TypeError("x is undefined")));
console.log(describeError("socket hang up"));

export {};
