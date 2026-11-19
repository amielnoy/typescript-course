// Lesson 7 – Topic 02: Generic interfaces and classes – Exercises
// ------------------------------------------------------------
// Instructions:
//   1. Complete the body of each function/method in place of the line  throw new Error("TODO")
//      (in classes – add your own private fields as needed).
//   2. The exercises focus only on this topic (examples/02-generic-interfaces-classes.ts):
//      a generic interface (ApiResponse<T>), a generic class (Queue<T>), constraints (T extends ...),
//      keyof and T[K], Partial<T>.
//   3. Check yourself: npm run exercise -- 07 02 (self-check at the end of the file)
// ------------------------------------------------------------

/**
 * Exercise 1 – unwrap: "unwrapping" a generic API response
 * If status is in the range 200–299 – return data (of type T, without losing it!).
 * Otherwise – throw an Error whose message contains the status, for example:
 *   "Request failed with status 404"
 *   unwrap({ status: 200, data: { id: 1 }, durationMs: 50 })  =>  { id: 1 }
 */
export interface ApiResponse<T> {
  status: number;
  data: T;
  durationMs: number;
}

export function unwrap<T>(response: ApiResponse<T>): T {
  throw new Error("TODO");
}

/**
 * Exercise 2 – pick: selecting fields from an object (with keyof)
 * Return a new object that contains only the fields in keys. The original object is not changed.
 *   pick({ id: 7, name: "Dana", token: "abc" }, ["id", "name"])  =>  { id: 7, name: "Dana" }
 * A testing-world example: compare only the fields we care about and ignore createdAt, token, etc.
 * Hints:
 *   - K extends keyof T  =>  you can only pass names of fields that actually exist in T.
 *   - Pick<T, K> is a built-in TS type: "only the fields K out of T".
 *   - const result = {} as Pick<T, K>;  and then  result[key] = obj[key];
 */
export function pick<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  throw new Error("TODO");
}

/**
 * Exercise 3 – paginate: a generic interface Page<T>
 * Return the requested "page" out of items (page numbering starts at 1):
 *   items      – the items of this page only
 *   page       – the requested page number
 *   pageSize   – the page size
 *   total      – the total number of items
 *   totalPages – Math.ceil(total / pageSize)   (0 if there are no items at all)
 *   paginate(["a", "b", "c", "d", "e"], 2, 2)
 *     =>  { items: ["c", "d"], page: 2, pageSize: 2, total: 5, totalPages: 3 }
 * A page past the end returns empty items (that's not an error).
 * If page < 1 or pageSize < 1 – throw an Error.
 * A testing-world example: testing an API that returns paginated lists (?page=2&pageSize=20).
 */
export interface Page<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export function paginate<T>(items: T[], page: number, pageSize: number): Page<T> {
  throw new Error("TODO");
}

/**
 * Exercise 4 – a generic class RingBuffer<T>: keeps only the last N items
 * A testing-world example: keeping the last 50 log lines so they can be attached to the report when a test fails.
 *   constructor(capacity) – throws an Error if capacity < 1
 *   push(item)            – adds an item; if the buffer is full – the oldest item is dropped
 *   toArray(): T[]        – a copy of the items, from oldest to newest (changing the copy doesn't affect the buffer)
 *   size                  – getter: how many items there are right now
 *   isFull(): boolean     – whether size === capacity
 *   const logs = new RingBuffer<string>(2);
 *   logs.push("a"); logs.push("b"); logs.push("c");
 *   logs.toArray()  =>  ["b", "c"]
 */
export class RingBuffer<T> {
  constructor(capacity: number) {
    throw new Error("TODO");
  }
  push(item: T): void {
    throw new Error("TODO");
  }
  toArray(): T[] {
    throw new Error("TODO");
  }
  get size(): number {
    throw new Error("TODO");
  }
  isFull(): boolean {
    throw new Error("TODO");
  }
}

/**
 * Exercise 5 – TestDataBuilder<T>: a typed test-data builder
 * Takes a default object, and lets you "override" individual fields in a chain:
 *   const users = new TestDataBuilder({ name: "Dana", role: "tester", active: true });
 *   users.with("role", "admin").with("active", false).build()
 *     =>  { name: "Dana", role: "admin", active: false }
 *   constructor(defaults)  – stores the defaults (without changing the object it received!)
 *   with(key, value): this – overrides one field and returns the builder (for chaining).
 *                            value must be of the field's type: T[K].
 *   build(): T             – returns a new object on every call (defaults + all overrides so far)
 *   reset(): this          – cancels all overrides and goes back to the defaults
 * Hints:
 *   - with("role", 123) should fail to compile – thanks to K extends keyof T and value: T[K].
 *   - Store the overrides in a Partial<T>, and build with spread: { ...defaults, ...overrides }.
 */
export class TestDataBuilder<T extends object> {
  constructor(defaults: T) {
    throw new Error("TODO");
  }
  with<K extends keyof T>(key: K, value: T[K]): this {
    throw new Error("TODO");
  }
  build(): T {
    throw new Error("TODO");
  }
  reset(): this {
    throw new Error("TODO");
  }
}

/**
 * Exercise 6 (Bonus) – diffFields: comparing "expected vs. actual" field by field
 * Go over all the fields of expected (in their order), and return a list of all the fields
 * whose value in actual is different (compare with !==, top level only – no "diving" into nested objects).
 *   diffFields({ id: 1, name: "Dana", role: "admin" }, { id: 1, name: "Dan", role: "tester" })
 *     =>  [
 *           { field: "name", expected: "Dana",  actual: "Dan" },
 *           { field: "role", expected: "admin", actual: "tester" },
 *         ]
 * No differences => an empty array.
 * A testing-world example: a clear failure message that shows exactly which fields in the API response don't match.
 * Hint: Object.keys(expected) as (keyof T)[]
 */
export interface FieldDiff<T> {
  field: keyof T;
  expected: T[keyof T];
  actual: T[keyof T];
}

export function diffFields<T extends object>(expected: T, actual: T): FieldDiff<T>[] {
  throw new Error("TODO");
}

// ============================================================
// Self-check – run:  npm run exercise -- 07 02
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
