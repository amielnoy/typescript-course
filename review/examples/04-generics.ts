// חזרה למבחן – דוגמה 4: Generics (שיעור 7)
// הרצה:  npx tsx review/examples/04-generics.ts

// ---------- פונקציה גנרית והסקת טיפוסים ----------
function last<T>(items: T[]): T | undefined {
  return items[items.length - 1];
}
const n = last([1, 2, 3]); // number | undefined
const s = last(["login", "cart"]); // string | undefined
console.log(n, s);

function mapAll<T, R>(items: T[], fn: (item: T) => R): R[] {
  return items.map(fn);
}
console.log(mapAll(["a", "bb", "ccc"], (x) => x.length)); // T = string, R = number

// ---------- Constraints: extends ו-keyof ----------
function pluck<T, K extends keyof T>(items: T[], key: K): T[K][] {
  return items.map((item) => item[key]);
}
const users = [
  { id: 1, email: "a@qa.dev" },
  { id: 2, email: "b@qa.dev" },
];
console.log(pluck(users, "email")); // string[]
// pluck(users, "name");  ❌ '"name"' is not assignable to '"id" | "email"'

function lengthOf<T extends { length: number }>(x: T): number {
  return x.length;
}
console.log(lengthOf("abc"), lengthOf([1, 2]));
// lengthOf(42);  ❌ number has no 'length'

// ---------- interface ומחלקה גנריים ----------
interface ApiResponse<T> {
  status: number;
  body: T;
}
type Product = { id: number; name: string };

class Store<T extends { id: number }> {
  private items = new Map<number, T>();
  add(item: T): this {
    this.items.set(item.id, item);
    return this;
  }
  get(id: number): T | undefined {
    return this.items.get(id);
  }
}
const res: ApiResponse<Product[]> = { status: 200, body: [{ id: 1, name: "pen" }] };
const store = new Store<Product>().add(res.body[0]!);
console.log(res.status, store.get(1)?.name, store.get(9));

export {};
