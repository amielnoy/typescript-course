// חזרה למבחן – דוגמה 3: Interfaces, Type Aliases, Union Types (דוגמאות חדשות – לא מופיעות בשיעור 6)
// הרצה:  npx tsx review/examples/03-interfaces-types-unions.ts

// ---------- interface: שדות readonly ואופציונליים, extends ו-implements ----------
interface Device {
  readonly serial: string;
  model: string;
  osVersion?: string;
}

interface MobileDevice extends Device {
  platform: "android" | "ios";
}

interface Installer {
  install(app: string, on: MobileDevice): string;
}

class AdbInstaller implements Installer {
  install(app: string, on: MobileDevice): string {
    return `adb -s ${on.serial} install ${app}`;
  }
}

const pixel: MobileDevice = { serial: "PX-81", model: "Pixel 8", platform: "android" };
console.log(new AdbInstaller().install("shop.apk", pixel));
console.log(pixel.osVersion ?? "os unknown");
// pixel.serial = "X";  ❌ Cannot assign to 'serial' because it is a read-only property.

// ---------- type: literal union, tuple, intersection (&) וטיפוס של פונקציה ----------
type Viewport = "mobile" | "tablet" | "desktop";
type Size = [width: number, height: number];
type Tagged = { tags: string[] };
type ScreenshotJob = { page: string; viewport: Viewport } & Tagged;
type SizeFor = (v: Viewport) => Size;

const sizeFor: SizeFor = (v) => (v === "mobile" ? [390, 844] : v === "tablet" ? [820, 1180] : [1440, 900]);
const job: ScreenshotJob = { page: "/checkout", viewport: "tablet", tags: ["visual"] };
const [w, h] = sizeFor(job.viewport);
console.log(`${job.page} @ ${w}x${h}`, job.tags);
// const bad: Viewport = "tv";  ❌ Type '"tv"' is not assignable to type 'Viewport'.

// ---------- Union + narrowing: typeof, Array.isArray, ומה שנשאר ----------
type Selector = string | string[] | { role: string; name: string };

function toLocator(s: Selector): string {
  if (typeof s === "string") return `css=${s}`; // כאן s הוא string
  if (Array.isArray(s)) return s.map((x) => `css=${x}`).join(" >> "); // כאן s הוא string[]
  return `role=${s.role}[name="${s.name}"]`; // נשאר רק האובייקט
}
console.log(toLocator("#pay"));
console.log(toLocator(["form", "button"]));
console.log(toLocator({ role: "button", name: "Pay" }));

// ---------- Narrowing עם in: שתי צורות בלי שדה משותף ----------
type Retry = { retryAfterMs: number };
type GiveUp = { reason: string };

function nextStep(r: Retry | GiveUp): string {
  return "retryAfterMs" in r ? `retry in ${r.retryAfterMs}ms` : `stop: ${r.reason}`;
}
console.log(nextStep({ retryAfterMs: 250 }));
console.log(nextStep({ reason: "quota exceeded" }));

// ---------- Discriminated union + switch + never ----------
type Payment =
  | { method: "card"; last4: string }
  | { method: "paypal"; email: string }
  | { method: "voucher"; code: string; amount: number };

function receipt(p: Payment): string {
  switch (p.method) {
    case "card":
      return `card •••• ${p.last4}`;
    case "paypal":
      return `PayPal (${p.email})`;
    case "voucher":
      return `voucher ${p.code}: ₪${p.amount}`;
    default: {
      // אם יתווסף { method: "bit" } ולא נטפל בו – שגיאת קומפילציה כאן
      const unhandled: never = p;
      return unhandled;
    }
  }
}

const payments: Payment[] = [
  { method: "card", last4: "4242" },
  { method: "paypal", email: "dana@shop.dev" },
  { method: "voucher", code: "WELCOME", amount: 50 },
];
payments.forEach((p) => console.log(receipt(p)));

// ---------- Utility types: טיפוסים חדשים מטיפוס קיים ----------
interface Order {
  id: number;
  customer: string;
  total: number;
  status: "new" | "paid" | "shipped";
}

type OrderDraft = Omit<Order, "id">; // בלי id – השרת יוצר אותו
type OrderUpdate = Partial<Pick<Order, "status" | "total">>; // רק status/total, ושניהם אופציונליים
type CountByStatus = Record<Order["status"], number>; // מפתח לכל סטטוס
type FrozenOrder = Readonly<Order>; // אי אפשר לשנות אף שדה

const draft: OrderDraft = { customer: "Noa", total: 120, status: "new" };
const update: OrderUpdate = { status: "paid" };
const counts: CountByStatus = { new: 3, paid: 5, shipped: 1 };
const frozen: FrozenOrder = { id: 7, ...draft };
console.log(draft);
console.log(update, frozen.id);
console.log(counts);
// frozen.total = 0;  ❌ Cannot assign to 'total' because it is a read-only property.

export {};
