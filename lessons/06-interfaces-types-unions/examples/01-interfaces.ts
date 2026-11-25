// שיעור 6 – דוגמה 1: Interfaces (ממשקים)
// הרצה:  npx tsx lessons/06-interfaces-types-unions/examples/01-interfaces.ts
//
// interface מתאר את "הצורה" של אובייקט: אילו שדות ומתודות חייבים להיות בו.
// אין לו קוד ואין לו קיום בזמן ריצה – הוא קיים רק לבדיקת טיפוסים.

// ---------- interface בסיסי ----------
interface Customer {
  readonly id: number; // לא ניתן לשינוי אחרי יצירה
  fullName: string;
  email: string;
  loyaltyPoints?: number; // שדה אופציונלי
}

const noa: Customer = { id: 1, fullName: "Noa Levi", email: "noa@shop.dev" };
// noa.id = 2;                                          // ❌ readonly
// const bad: Customer = { id: 2, fullName: "No email" }; // ❌ חסר email
console.log("Customer:", noa);

// ---------- שדה אופציונלי: חובה לבדוק לפני שימוש ----------
function pointsLine(c: Customer): string {
  if (c.loyaltyPoints !== undefined) {
    return `${c.fullName}: ${c.loyaltyPoints} pts`;
  }
  return `${c.fullName}: (not in the club)`;
}
console.log(pointsLine(noa));
console.log(pointsLine({ ...noa, loyaltyPoints: 120 }));
console.log(noa.loyaltyPoints ?? 0);

// ---------- readonly – גם למערכים ----------
interface Cart {
  readonly cartId: string;
  readonly couponCodes: readonly string[];
  itemCount: number;
}
const cart: Cart = { cartId: "C-301", couponCodes: ["WELCOME10"], itemCount: 2 };
cart.itemCount = 3; // ✅ שדה רגיל
// cart.cartId = "C-302";            // ❌ read-only property
// cart.couponCodes.push("FREESHIP"); // ❌ אין push ב-readonly string[]
console.log(cart);

// ---------- interface לתשובת API (מקונן) ----------
interface CatalogItemDto {
  sku: string;
  title: string;
  priceCents: number;
}
interface SearchPage {
  items: CatalogItemDto[];
  paging: { page: number; totalItems: number };
}
const raw = '{"items":[{"sku":"MUG-01","title":"Mug","priceCents":4990},' +
  '{"sku":"TEE-11","title":"T-shirt","priceCents":8900}],"paging":{"page":1,"totalItems":2}}';
const body: SearchPage = JSON.parse(raw); // JSON.parse מחזיר any – הטיפוס הוא הבטחה שלנו
console.log(body.paging.totalItems, body.items.map((i) => i.title));
// body.items[0].titel;  // ❌ Property 'titel' does not exist on type 'CatalogItemDto'. Did you mean 'title'?

// ---------- interface לנתוני בדיקה (Data-Driven) ----------
interface SignupCase {
  title: string;
  email: string;
  password: string;
  expectError?: string;
}
const cases: SignupCase[] = [
  { title: "valid signup", email: "omer@shop.dev", password: "Str0ng!pass" },
  { title: "short password", email: "omer@shop.dev", password: "123", expectError: "Password too short" },
  { title: "bad email", email: "omer.shop.dev", password: "Str0ng!pass", expectError: "Invalid email" },
];
for (const c of cases) {
  const expected = c.expectError ?? "account created";
  console.log(`${c.title.padEnd(15)} -> ${expected}`);
}

// ---------- Index signature + Record ----------
interface FeatureFlags {
  [flag: string]: boolean; // כל מפתח string, כל ערך boolean
}
const flags: FeatureFlags = { "new-checkout": true };
flags["dark-mode"] = false;
console.log(Object.keys(flags), flags["beta-search"]);
// flags["max-items"] = 50;  // ❌ Type 'number' is not assignable to type 'boolean'.

interface ProblemDetails {
  status: number;
  title: string;
  errors?: Record<string, string>; // מילון: שם שדה -> הודעת שגיאה
}
const problem: ProblemDetails = { status: 422, title: "Unprocessable", errors: { zip: "must be 7 digits" } };
console.log(`${problem.status} ${problem.title}`, problem.errors);

// ---------- הרחבת interface (extends) ----------
interface BusinessCustomer extends Customer {
  companyId: string;
  seats: number;
}
const acme: BusinessCustomer = { id: 2, fullName: "Acme Ltd", email: "it@acme.dev", companyId: "51-123", seats: 40 };
function greet(c: Customer): string {
  return `Hi ${c.fullName}`;
}
console.log("Seats:", acme.seats);
console.log(greet(acme)); // BusinessCustomer הוא גם Customer

interface Verified {
  verifiedAt: string;
}
interface VerifiedBusiness extends BusinessCustomer, Verified {}
const verified: VerifiedBusiness = { ...acme, verifiedAt: "2026-11-24" };
console.log(Object.keys(verified));

// ---------- interface עם מתודות + מחלקה שמממשת (implements) ----------
interface ArtifactStore {
  save(name: string, content: string): void;
  list(): string[];
}

class ConsoleStore implements ArtifactStore {
  save(name: string, content: string): void {
    console.log(`💾 ${name} (${content.length} chars)`);
  }
  list(): string[] {
    return []; // מדפיס בלבד, לא שומר
  }
}

class MemoryStore implements ArtifactStore {
  private files = new Map<string, string>();
  save(name: string, content: string): void {
    this.files.set(name, content);
  }
  list(): string[] {
    return [...this.files.keys()];
  }
}

// הפונקציה מקבלת "כל דבר שמתנהג כמו ArtifactStore"
function saveFailure(store: ArtifactStore, test: string): void {
  store.save(`${test}.log`, "Timeout after 5000ms");
  store.save(`${test}.html`, "<html>...</html>");
}
saveFailure(new ConsoleStore(), "checkout");
const mem = new MemoryStore();
saveFailure(mem, "checkout");
console.log(mem.list());

// ---------- Structural typing ("Duck typing") ----------
// TS בודק צורה, לא שם: אובייקט עם save+list מתאים ל-ArtifactStore גם בלי implements
const inlineStore = {
  save: (name: string, content: string) => console.log("inline:", name, content.length),
  list: () => [] as string[],
};
saveFailure(inlineStore, "login");

// ---------- מחלקה יכולה לממש כמה ממשקים ----------
interface Connectable {
  connect(): void;
}
interface Resettable {
  reset(): void;
}
class DbFixture implements Connectable, Resettable {
  connect(): void {
    console.log("[db] connected");
  }
  reset(): void {
    console.log("[db] tables truncated");
  }
}
function beforeEachTest(resource: Resettable): void {
  resource.reset(); // רואה רק את reset()
}
const db = new DbFixture();
db.connect();
beforeEachTest(db);

export {}; // הופך את הקובץ למודול (משתנים לא "מתנגשים" עם קבצים אחרים)
