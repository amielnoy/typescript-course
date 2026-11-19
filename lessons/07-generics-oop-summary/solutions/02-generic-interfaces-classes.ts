// Lesson 7 – Topic 02: Generic interfaces and classes – Solutions

export interface ApiResponse<T> {
  status: number;
  data: T;
  durationMs: number;
}

export function unwrap<T>(response: ApiResponse<T>): T {
  if (response.status < 200 || response.status > 299) {
    throw new Error(`Request failed with status ${response.status}`);
  }
  return response.data; // the type T is preserved – the caller gets exactly the right type
}

export function pick<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>;
  for (const key of keys) {
    result[key] = obj[key];
  }
  return result;
}

export interface Page<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export function paginate<T>(items: T[], page: number, pageSize: number): Page<T> {
  if (page < 1 || pageSize < 1) {
    throw new Error(`Invalid page (${page}) or pageSize (${pageSize})`);
  }
  const start = (page - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize), // slice past the end returns [] – no error
    page,
    pageSize,
    total: items.length,
    totalPages: Math.ceil(items.length / pageSize),
  };
}

export class RingBuffer<T> {
  private items: T[] = [];
  private readonly capacity: number;

  constructor(capacity: number) {
    if (capacity < 1) {
      throw new Error(`capacity must be at least 1, got ${capacity}`);
    }
    this.capacity = capacity;
  }

  push(item: T): void {
    if (this.isFull()) {
      this.items.shift(); // drop the oldest one
    }
    this.items.push(item);
  }

  toArray(): T[] {
    return [...this.items]; // a copy – encapsulation
  }

  get size(): number {
    return this.items.length;
  }

  isFull(): boolean {
    return this.items.length === this.capacity;
  }
}

export class TestDataBuilder<T extends object> {
  private readonly defaults: T;
  private overrides: Partial<T> = {};

  constructor(defaults: T) {
    this.defaults = { ...defaults }; // a copy – so we don't change the object we received
  }

  with<K extends keyof T>(key: K, value: T[K]): this {
    this.overrides[key] = value;
    return this;
  }

  build(): T {
    return { ...this.defaults, ...this.overrides }; // a new object on every call
  }

  reset(): this {
    this.overrides = {};
    return this;
  }
}

export interface FieldDiff<T> {
  field: keyof T;
  expected: T[keyof T];
  actual: T[keyof T];
}

export function diffFields<T extends object>(expected: T, actual: T): FieldDiff<T>[] {
  const diffs: FieldDiff<T>[] = [];
  for (const field of Object.keys(expected) as (keyof T)[]) {
    if (expected[field] !== actual[field]) {
      diffs.push({ field, expected: expected[field], actual: actual[field] });
    }
  }
  return diffs;
}

// ============================================================
// Self-check – run:  npm run solution -- 07 02
// On every line, the value left of "=> expected:" must equal the value on its right.
// (No need to change the code below this line)
// ============================================================

interface TestUser {
  name: string;
  role: "admin" | "tester";
  active: boolean;
}

console.log("\n--- Exercise 1: unwrap ---");
try {
  const user = { id: 1, name: "Dana" };
  console.log("Same data object?", unwrap({ status: 200, data: user, durationMs: 50 }) === user, "=> expected:", "Same data object?", true);
  console.log(unwrap({ status: 201, data: [1, 2], durationMs: 10 }), "=> expected:", [1, 2]);
  console.log(unwrap({ status: 299, data: "ok", durationMs: 1 }), "=> expected:", "ok");
  for (const badStatus of [404, 500, 199, 300]) {
    try {
      unwrap({ status: badStatus, data: null, durationMs: 5 });
      console.log("did not throw", "=> expected:", `an error containing ${badStatus}`);
    } catch (err) {
      if ((err as Error).message === "TODO") throw err;
      console.log("threw:", (err as Error).message, "=> expected:", `an error containing ${badStatus}`);
    }
  }
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 2: pick ---");
try {
  const original = { id: 7, name: "Dana", token: "abc" };
  console.log(pick(original, ["id", "name"]), "=> expected:", { id: 7, name: "Dana" });
  console.log(pick(original, ["token"]), "=> expected:", { token: "abc" });
  console.log(pick(original, []), "=> expected:", {});
  console.log("Original:", original, "=> expected:", "Original:", { id: 7, name: "Dana", token: "abc" });
  console.log("New object?", pick(original, ["id", "name", "token"]) !== original, "=> expected:", "New object?", true);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 3: paginate ---");
try {
  const letters = ["a", "b", "c", "d", "e"];
  console.log(paginate(letters, 2, 2), "=> expected:", {
    items: ["c", "d"],
    page: 2,
    pageSize: 2,
    total: 5,
    totalPages: 3,
  });
  console.log(paginate(letters, 1, 2).items, "=> expected:", ["a", "b"]);
  console.log(paginate(letters, 3, 2).items, "=> expected:", ["e"]);
  console.log(paginate(letters, 1, 10), "=> expected:", {
    items: ["a", "b", "c", "d", "e"],
    page: 1,
    pageSize: 10,
    total: 5,
    totalPages: 1,
  });
  // A page past the end – not an error, just empty
  console.log(paginate(letters, 9, 2).items, "=> expected:", []);
  console.log(paginate([], 1, 20), "=> expected:", { items: [], page: 1, pageSize: 20, total: 0, totalPages: 0 });
  for (const [page, pageSize] of [
    [0, 2],
    [1, 0],
  ]) {
    try {
      paginate(letters, page, pageSize);
      console.log("did not throw", "=> expected:", "an error");
    } catch (err) {
      if ((err as Error).message === "TODO") throw err;
      console.log("threw:", (err as Error).message, "=> expected:", "an error");
    }
  }
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 4: RingBuffer ---");
try {
  const logs = new RingBuffer<string>(2);
  console.log("Empty:", logs.size, logs.isFull(), logs.toArray(), "=> expected:", "Empty:", 0, false, []);
  logs.push("a");
  console.log("After a – size:", logs.size, "=> expected:", "After a – size:", 1);
  logs.push("b");
  console.log("After b – isFull:", logs.isFull(), "=> expected:", "After b – isFull:", true);
  logs.push("c");
  console.log("After c:", logs.size, logs.toArray(), "=> expected:", "After c:", 2, ["b", "c"]);
  logs.push("d");
  console.log("After d:", logs.toArray(), "=> expected:", "After d:", ["c", "d"]);

  // toArray returns a copy
  const copy = logs.toArray();
  copy.push("hacked");
  console.log("After changing the copy:", logs.toArray(), "=> expected:", "After changing the copy:", ["c", "d"]);

  const one = new RingBuffer<number>(1);
  one.push(1);
  one.push(2);
  console.log(one.toArray(), "=> expected:", [2]);

  try {
    new RingBuffer<number>(0);
    console.log("did not throw", "=> expected:", "an error");
  } catch (err) {
    if ((err as Error).message === "TODO") throw err;
    console.log("threw:", (err as Error).message, "=> expected:", "an error");
  }
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 5: TestDataBuilder ---");
try {
  const defaults: TestUser = { name: "Dana", role: "tester", active: true };
  const users = new TestDataBuilder(defaults);
  console.log(users.build(), "=> expected:", { name: "Dana", role: "tester", active: true });

  const chained = users.with("role", "admin").with("active", false);
  console.log("Does with return the same builder?", chained === users, "=> expected:", "Does with return the same builder?", true);
  const admin = users.build();
  console.log(admin, "=> expected:", { name: "Dana", role: "admin", active: false });

  // build returns a new object every time
  console.log("New object on every build?", users.build() !== admin, "=> expected:", "New object on every build?", true);
  admin.name = "changed";
  console.log(users.build().name, "=> expected:", "Dana");

  // The original defaults did not change
  console.log("defaults:", defaults, "=> expected:", "defaults:", { name: "Dana", role: "tester", active: true });

  // Overriding the same field twice – the last one wins
  users.with("name", "Yossi").with("name", "Noa");
  console.log(users.build().name, "=> expected:", "Noa");

  console.log("Does reset return the same builder?", users.reset() === users, "=> expected:", "Does reset return the same builder?", true);
  console.log(users.build(), "=> expected:", { name: "Dana", role: "tester", active: true });
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 6 (Bonus): diffFields ---");
try {
  console.log(
    diffFields({ id: 1, name: "Dana", role: "admin" }, { id: 1, name: "Dan", role: "tester" }),
    "=> expected:",
    [
      { field: "name", expected: "Dana", actual: "Dan" },
      { field: "role", expected: "admin", actual: "tester" },
    ],
  );
  console.log(diffFields({ id: 1, ok: true }, { id: 1, ok: true }), "=> expected:", []);
  console.log(diffFields({ count: 0 }, { count: 0 }), "=> expected:", []);
  // Comparison with !== – the exact same array => no difference; two different arrays (even with the same content) => a difference
  const tags = ["smoke"];
  console.log(diffFields({ tags }, { tags }), "=> expected:", []);
  console.log(diffFields({ tags: ["smoke"] }, { tags: ["smoke"] }).length, "=> expected:", 1);
  // The order is determined by expected
  console.log(
    diffFields({ b: 1, a: 1 }, { a: 2, b: 2 }).map((d) => d.field),
    "=> expected:",
    ["b", "a"],
  );
} catch (e) {
  console.log("  ✋", (e as Error).message);
}
