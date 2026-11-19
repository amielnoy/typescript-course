// Lesson 7 – Summary exercises
// Check yourself: npm run exercise -- 07 (self-check at the end of the file)

/**
 * Exercise 1 – a generic function last
 * Return the last item in the array, or undefined if it is empty.
 */
export function last<T>(items: T[]): T | undefined {
  throw new Error("TODO");
}

/**
 * Exercise 2 – a generic groupBy
 * Group items by the key returned from keyFn.
 * groupBy(["a1","b1","a2"], s => s[0])  =>  { a: ["a1","a2"], b: ["b1"] }
 */
export function groupBy<T>(items: T[], keyFn: (item: T) => string): Record<string, T[]> {
  throw new Error("TODO");
}

/**
 * Exercise 3 – pluck with keyof
 * Return an array of the values of the field key from each item.
 */
export function pluck<T, K extends keyof T>(items: T[], key: K): T[K][] {
  throw new Error("TODO");
}

/**
 * Exercise 4 – a generic class Stack<T> (a stack – LIFO)
 *   push(item), pop(): T | undefined, peek(): T | undefined, size (getter), isEmpty(): boolean
 */
export class Stack<T> {
  push(item: T): void {
    throw new Error("TODO");
  }
  pop(): T | undefined {
    throw new Error("TODO");
  }
  peek(): T | undefined {
    throw new Error("TODO");
  }
  get size(): number {
    throw new Error("TODO");
  }
  isEmpty(): boolean {
    throw new Error("TODO");
  }
}

/**
 * Exercise 5 – a generic Repository with a constraint
 * T must include id: number.
 *   add(entity)               – throws an Error if an entity with the same id already exists
 *   getById(id)               – returns it, or undefined
 *   update(id, changes)       – a partial update (Partial<T>), returns the updated object or undefined
 *   remove(id): boolean       – true if it was deleted
 *   all(): T[]                – all the entities
 *   where(predicate): T[]     – filtering by a function
 */
export interface HasId {
  id: number;
}

export class Repository<T extends HasId> {
  add(entity: T): void {
    throw new Error("TODO");
  }
  getById(id: number): T | undefined {
    throw new Error("TODO");
  }
  update(id: number, changes: Partial<T>): T | undefined {
    throw new Error("TODO");
  }
  remove(id: number): boolean {
    throw new Error("TODO");
  }
  all(): T[] {
    throw new Error("TODO");
  }
  where(predicate: (entity: T) => boolean): T[] {
    throw new Error("TODO");
  }
}

/**
 * Exercise 6 – OOP summary: Result<T>
 * Write a function tryCatch that runs fn and returns:
 *   { ok: true, value }   if it succeeded
 *   { ok: false, error }  (the error message as a string) if an error was thrown
 */
export type Result<T> = { ok: true; value: T } | { ok: false; error: string };

export function tryCatch<T>(fn: () => T): Result<T> {
  throw new Error("TODO");
}

// ============================================================
// Self-check – run:  npm run exercise -- 07
// On every line, the value left of "=> expected:" must equal the value on its right.
// (No need to change the code below this line)
// ============================================================

interface Tc {
  id: number;
  title: string;
  owner: string;
}

console.log("\n--- Exercise 1: last ---");
try {
  console.log(last([1, 2, 3]), "=> expected:", 3);
  console.log(last([]), "=> expected:", undefined);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 2: groupBy ---");
try {
  console.log(
    groupBy(["a1", "b1", "a2"], (s) => s[0]),
    "=> expected:",
    { a: ["a1", "a2"], b: ["b1"] },
  );
  console.log(
    groupBy([], () => "x"),
    "=> expected:",
    {},
  );
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 3: pluck ---");
try {
  const items = [
    { id: 1, name: "a" },
    { id: 2, name: "b" },
  ];
  console.log(pluck(items, "name"), "=> expected:", ["a", "b"]);
  console.log(pluck(items, "id"), "=> expected:", [1, 2]);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 4: Stack ---");
try {
  const s = new Stack<string>();
  console.log("Empty at the start?", s.isEmpty(), "=> expected:", "Empty at the start?", true);
  s.push("a");
  s.push("b");
  console.log("size:", s.size, "=> expected:", "size:", 2);
  console.log("peek:", s.peek(), "=> expected:", "peek:", "b");
  console.log("pop x3:", [s.pop(), s.pop(), s.pop()], "=> expected:", "pop x3:", ["b", "a", undefined]);
  console.log("Empty at the end?", s.isEmpty(), "=> expected:", "Empty at the end?", true);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 5: Repository ---");
try {
  const repo = new Repository<Tc>();
  repo.add({ id: 1, title: "Login", owner: "dana" });
  repo.add({ id: 2, title: "Logout", owner: "yossi" });
  try {
    repo.add({ id: 1, title: "dup", owner: "x" });
    console.log("did not throw", "=> expected:", "an error");
  } catch (err) {
    if ((err as Error).message === "TODO") throw err;
    console.log("threw:", (err as Error).message, "=> expected:", "an error");
  }
  console.log(repo.getById(2)?.title, "=> expected:", "Logout");
  console.log(repo.update(2, { owner: "dana" })?.owner, "=> expected:", "dana");
  console.log("title kept:", repo.getById(2)?.title, "=> expected:", "title kept:", "Logout"); // the other fields were kept
  console.log(repo.update(99, { owner: "x" }), "=> expected:", undefined);
  console.log(repo.where((t) => t.owner === "dana").length, "=> expected:", 2);
  console.log("remove(1) twice:", repo.remove(1), repo.remove(1), "=> expected:", "remove(1) twice:", true, false);
  console.log(repo.all().length, "=> expected:", 1);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 6: tryCatch ---");
try {
  console.log(
    tryCatch(() => 42),
    "=> expected:",
    { ok: true, value: 42 },
  );
  console.log(
    tryCatch(() => {
      throw new Error("boom");
    }),
    "=> expected:",
    { ok: false, error: "boom" },
  );
} catch (e) {
  console.log("  ✋", (e as Error).message);
}
