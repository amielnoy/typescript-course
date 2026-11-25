// שיעור 6 – דוגמה 2: Type Aliases – שמות לטיפוסים
// הרצה:  npx tsx lessons/06-interfaces-types-unions/examples/02-type-aliases.ts

// ---------- שם לטיפוס פרימיטיבי, לאובייקט ולפונקציה ----------
type Sku = string;
type Cents = number;
type Percent = number;
type GeoPoint = { lat: number; lng: number }; // אובייקט
type Validator = (value: string) => boolean; // פונקציה

function priceAfter(sku: Sku, price: Cents, off: Percent): string {
  const final = Math.round((price * (100 - off)) / 100);
  return `${sku}: ${price} -> ${final} cents`;
}
const telAviv: GeoPoint = { lat: 32.08, lng: 34.78 };
const isEmail: Validator = (v) => v.includes("@"); // v: string – TS מסיק מהטיפוס

console.log(priceAfter("MUG-01", 4990, 20));
console.log("Mock location", telAviv, isEmail("noa.shop.dev"));
// const price: Cents = "49.90";  // ❌ Type 'string' is not assignable to type 'number'.

// ---------- Literal types – רק ערכים מסוימים מותרים ----------
type LogLevel = "debug" | "info" | "warn" | "error";
type Locale = "he-IL" | "en-US" | "ar-IL";

function log(level: LogLevel, msg: string): string {
  return `[${level.toUpperCase()}] ${msg}`;
}
console.log(log("warn", "Low stock: MUG-01"));
console.log(log("error", "Payment declined"));
// log("fatal", "x");  // ❌ "fatal" אינו LogLevel – טעות נתפסת מיד!
// log("Info", "x");   // ❌ גם הבדל של אות גדולה

// ---------- מלכודת: let "מרחיב" ל-string ----------
const l2 = "info"; // הטיפוס: "info"
let l3: LogLevel = "info"; // טיפוס מפורש
l3 = "debug";
console.log(log(l2, "a"), log(l3, "b"));
// let level = "info"; log(level, "x");  // ❌ string אינו LogLevel

// ---------- Union של literals + Record – מילון שלם ----------
const dateFormats: Record<Locale, string> = {
  "he-IL": "dd/mm/yyyy",
  "en-US": "mm/dd/yyyy",
  "ar-IL": "dd/mm/yyyy",
};
function dateFormatFor(locale: Locale): string {
  return `${locale}: ${dateFormats[locale]}`;
}
console.log(dateFormatFor("en-US"));
const locales: Locale[] = ["he-IL", "en-US", "ar-IL"];
console.log(locales.map(dateFormatFor).join(" | "));

// ---------- Tuple – מערך באורך וטיפוסים קבועים ----------
type Boundary = [min: number, max: number];
const qty: Boundary = [1, 10];
const [min, max] = qty;
console.log(`Quantity allowed: ${min}..${max}`);

// ניתוח ערכי גבול: לבדוק בדיוק על הגבול ומעט מחוץ לו
function boundaryValues([low, high]: Boundary): number[] {
  return [low - 1, low, high, high + 1];
}
console.log("Test with:", boundaryValues(qty));

// ---------- Intersection (&) – שילוב טיפוסים ----------
type Audited = { createdBy: string; createdAt: string };
type Coupon = { code: string; percentOff: number };
type StoredCoupon = Coupon & Audited;

const stored: StoredCoupon = {
  code: "WELCOME10",
  percentOff: 10,
  createdBy: "admin",
  createdAt: "2026-11-01",
};
type WithTrace = { traceId: string };
type TracedCall = { method: "GET" | "POST"; path: string } & WithTrace;
const call: TracedCall = { method: "POST", path: "/cart", traceId: "tr-81" };
console.log(Object.keys(stored));
console.log(Object.keys(call));

// ---------- Utility types מובנים ----------
interface Campaign {
  id: string;
  name: string;
  channels: string[];
  budget: number;
}
type NewCampaign = Omit<Campaign, "id">; // POST – בלי id
type CampaignPatch = Partial<NewCampaign>; // PATCH – הכול אופציונלי
type CampaignPreview = Pick<Campaign, "id" | "name">; // רק חלק מהשדות
type FrozenCampaign = Readonly<Campaign>; // הכול readonly
type SignupsByLocale = Record<Locale, number>; // מילון עם מפתחות ידועים

function createCampaign(body: NewCampaign): Campaign {
  return { id: "CMP-1", ...body };
}
function describePatch(patch: CampaignPatch): string {
  return `PATCH fields: ${Object.keys(patch).join(", ")}`;
}
console.log(createCampaign({ name: "Sale", channels: [], budget: 500 }));
console.log(describePatch({ budget: 800, channels: [] }));

const preview: CampaignPreview = { id: "CMP-1", name: "Sale" };
const frozen: FrozenCampaign = { id: "CMP-2", name: "Summer", channels: [], budget: 0 };
const signups: SignupsByLocale = { "he-IL": 40, "en-US": 25, "ar-IL": 12 };
const total = signups["he-IL"] + signups["en-US"] + signups["ar-IL"];
console.log(preview, frozen.name);
console.log(signups, total);

export {}; // הופך את הקובץ למודול (משתנים לא "מתנגשים" עם קבצים אחרים)
