// שיעור 6 – דוגמה 3: Union Types ו-Narrowing (צמצום טיפוס)
// הרצה:  npx tsx lessons/06-interfaces-types-unions/examples/03-union-types-narrowing.ts

// ---------- Union בסיסי: "זה או זה" ----------
type Quantity = number | string; // מספר, או טקסט משדה בטופס

function toQuantity(q: Quantity): number {
  // narrowing עם typeof: בתוך ה-if, TS יודע בדיוק מה הטיפוס
  if (typeof q === "string") {
    return Number.parseInt(q, 10); // כאן q הוא string
  }
  return Math.floor(q); // כאן q הוא number
}
console.log(toQuantity("3"), toQuantity(2.7));

// ---------- Narrowing צעד אחר צעד ----------
function formatPrice(p: string | number | null): string {
  if (p === null) {
    return "(no price)"; // p: null
  }
  if (typeof p === "number") {
    return `₪${p.toFixed(2)}`; // p: number
  }
  return p.trim(); // p: string
}
console.log(formatPrice(null), formatPrice(49.9), formatPrice("  ₪12.00 "));

// ---------- Union עם null ----------
function findCouponCode(customerId: number): string | null {
  return customerId === 1 ? "VIP20" : null;
}
const code = findCouponCode(2);
console.log(code?.toLowerCase() ?? "no coupon");
const c1 = findCouponCode(1);
if (c1 !== null) {
  console.log(c1.toLowerCase()); // c1: string
}

// ---------- Narrowing עם Array.isArray ----------
function countSkus(input: string | string[]): number {
  return Array.isArray(input) ? input.length : 1;
}
console.log(countSkus("MUG-01"), countSkus(["MUG-01", "CAP-07", "TEE-11"]));

function cartLine(skus: string | string[]): string {
  if (Array.isArray(skus)) {
    return skus.join(" + "); // skus: string[]
  }
  return skus; // skus: string
}
console.log(cartLine("MUG-01"));
console.log(cartLine(["MUG-01", "CAP-07"]));

// ---------- Narrowing עם in ----------
type SmsTarget = { phone: string };
type PushTarget = { deviceToken: string };
function channel(t: SmsTarget | PushTarget): string {
  return "phone" in t ? "sms" : "push";
}
console.log(channel({ deviceToken: "d-81" }));

type ApiKeyAuth = { apiKey: string };
type ClientCredentials = { clientId: string; clientSecret: string };
function authHeader(auth: ApiKeyAuth | ClientCredentials): string {
  if ("apiKey" in auth) {
    return `X-Api-Key ${auth.apiKey}`; // ApiKeyAuth
  }
  const encoded = Buffer.from(`${auth.clientId}:${auth.clientSecret}`).toString("base64");
  return `Basic ${encoded}`; // ClientCredentials
}
console.log(authHeader({ apiKey: "k-42" }));
console.log(authHeader({ clientId: "shop", clientSecret: "s3" }));

// ---------- Narrowing עם instanceof ----------
class RateLimitError extends Error {
  constructor(readonly retryAfterMs: number) {
    super(`Rate limited, retry after ${retryAfterMs}ms`);
  }
}
function explain(err: unknown): string {
  if (err instanceof RateLimitError) {
    return `retry later (wait ${err.retryAfterMs}ms)`; // err: RateLimitError
  }
  if (err instanceof Error) {
    return `fail: ${err.message}`; // err: Error
  }
  return `unknown: ${String(err)}`; // עדיין unknown
}
console.log(explain(new RateLimitError(2000)));
console.log(explain(new Error("Element not visible")));
console.log(explain(503));

// ---------- Narrowing עם === מול literal ----------
type Rating = 1 | 2 | 3 | 4 | 5;
function sentiment(r: Rating): string {
  if (r === 1 || r === 2) {
    return `${r}★ negative`; // r: 1 | 2
  }
  if (r === 3) {
    return `${r}★ neutral`; // r: 3
  }
  return `${r}★ positive`; // r: 4 | 5
}
const ratings: Rating[] = [2, 3, 5];
console.log(ratings.map(sentiment));

// ---------- Discriminated Union – הדפוס החשוב ביותר! ----------
// לכל אפשרות יש שדה משותף (כאן: kind) עם ערך קבוע שמזהה אותה.
type Upload =
  | { kind: "done"; status: 200 | 201; file: { name: string; sizeKb: number } }
  | { kind: "rejected"; status: 413 | 415; reason: string }
  | { kind: "aborted"; afterPercent: number };

function report(u: Upload): string {
  switch (u.kind) {
    case "done":
      return `✔ ${u.status}: ${u.file.name} (${u.file.sizeKb}KB)`; // רק כאן יש file
    case "rejected":
      return `⚠ ${u.status}: ${u.reason}`;
    case "aborted":
      return `✘ aborted at ${u.afterPercent}%`;
    default: {
      // Exhaustiveness check: אם מישהו יוסיף kind חדש ולא יטפל בו – שגיאת קומפילציה
      const never: never = u;
      return never;
    }
  }
}

const uploads: Upload[] = [
  { kind: "done", status: 201, file: { name: "avatar.png", sizeKb: 84 } },
  { kind: "rejected", status: 413, reason: "File too large" },
  { kind: "aborted", afterPercent: 60 },
];
uploads.forEach((u) => console.log(report(u)));

// ---------- Type guard מותאם אישית ----------
interface CartItem {
  sku: string;
  qty: number;
}
function isCartItem(value: unknown): value is CartItem {
  return typeof value === "object" && value !== null && "sku" in value && "qty" in value;
}
const fromStorage: unknown = JSON.parse('{"sku":"MUG-01","qty":2}');
if (isCartItem(fromStorage)) {
  console.log(`${fromStorage.qty} x ${fromStorage.sku}`); // TS יודע שזה CartItem
}
console.log(isCartItem(JSON.parse('{"sku":"MUG-01"}')));

// ---------- Type guard גם ב-filter ----------
const mixed: (string | number)[] = ["MUG-01", 2, "CAP-07", 3];
const quantities = mixed.filter((x): x is number => typeof x === "number"); // number[]
console.log(quantities, quantities.reduce((a, b) => a + b, 0));

export {}; // הופך את הקובץ למודול (משתנים לא "מתנגשים" עם קבצים אחרים)
