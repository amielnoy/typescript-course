// שיעור 7 – דוגמה 2: ממשקים ומחלקות גנריים
// הרצה:  npx tsx lessons/07-generics-oop-summary/examples/02-generic-interfaces-classes.ts

// ---------- ממשק גנרי לתשובת API ----------
interface ApiResponse<T> {
  status: number;
  data: T;
  durationMs: number;
}

interface User {
  id: number;
  name: string;
}
interface Product {
  sku: string;
  price: number;
}

const userResponse: ApiResponse<User> = { status: 200, data: { id: 1, name: "Dana" }, durationMs: 85 };
const listResponse: ApiResponse<Product[]> = {
  status: 200,
  data: [{ sku: "A-1", price: 19.9 }],
  durationMs: 120,
};
console.log(userResponse.data.name, listResponse.data[0].price);

// ---------- מחלקה גנרית: Queue ----------
class Queue<T> {
  private items: T[] = [];

  enqueue(item: T): void {
    this.items.push(item);
  }

  dequeue(): T | undefined {
    return this.items.shift();
  }

  get size(): number {
    return this.items.length;
  }
}

const testQueue = new Queue<string>();
testQueue.enqueue("login.spec.ts");
testQueue.enqueue("cart.spec.ts");
console.log("Next test:", testQueue.dequeue(), "| remaining:", testQueue.size);
// testQueue.enqueue(42);  // ❌ התור מוגדר ל-string בלבד

// ---------- Constraints – הגבלת T עם extends ----------
// T חייב להיות "משהו עם id מסוג number"
interface HasId {
  id: number;
}

class Repository<T extends HasId> {
  private store = new Map<number, T>();

  save(entity: T): void {
    this.store.set(entity.id, entity); // מותר לגשת ל-id בזכות ה-constraint
  }

  findById(id: number): T | undefined {
    return this.store.get(id);
  }

  findAll(): T[] {
    return [...this.store.values()];
  }

  // Partial<T> – עדכון חלקי
  update(id: number, changes: Partial<T>): T | undefined {
    const existing = this.store.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...changes };
    this.store.set(id, updated);
    return updated;
  }
}

const users = new Repository<User>();
users.save({ id: 1, name: "Dana" });
users.save({ id: 2, name: "Yossi" });
users.update(2, { name: "Yossi Cohen" });
console.log("All users:", users.findAll());
// new Repository<Product>();  // ❌ Product אין לו id: number

// ---------- keyof – גישה בטוחה לשדות ----------
function pluck<T, K extends keyof T>(items: T[], key: K): T[K][] {
  return items.map((item) => item[key]);
}
console.log("names:", pluck(users.findAll(), "name")); // string[]
// pluck(users.findAll(), "email");  // ❌ אין שדה email ב-User

// ---------- ערך ברירת מחדל לפרמטר טיפוס ----------
interface Page<T = string> {
  items: T[];
  page: number;
  total: number;
}
const tags: Page = { items: ["smoke", "regression"], page: 1, total: 2 }; // T = string
console.log("tags page:", tags);

export {}; // הופך את הקובץ למודול (משתנים לא "מתנגשים" עם קבצים אחרים)
