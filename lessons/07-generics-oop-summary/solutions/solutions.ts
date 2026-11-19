// Lesson 7 – Summary solutions
export function last<T>(items: T[]): T | undefined {
  return items.length === 0 ? undefined : items[items.length - 1];
}

export function groupBy<T>(items: T[], keyFn: (item: T) => string): Record<string, T[]> {
  const groups: Record<string, T[]> = {};
  for (const item of items) {
    const key = keyFn(item);
    (groups[key] ??= []).push(item);
  }
  return groups;
}

export function pluck<T, K extends keyof T>(items: T[], key: K): T[K][] {
  return items.map((item) => item[key]);
}

export class Stack<T> {
  private items: T[] = [];

  push(item: T): void {
    this.items.push(item);
  }
  pop(): T | undefined {
    return this.items.pop();
  }
  peek(): T | undefined {
    return this.items[this.items.length - 1];
  }
  get size(): number {
    return this.items.length;
  }
  isEmpty(): boolean {
    return this.items.length === 0;
  }
}

export interface HasId {
  id: number;
}

export class Repository<T extends HasId> {
  private store = new Map<number, T>();

  add(entity: T): void {
    if (this.store.has(entity.id)) {
      throw new Error(`Entity with id ${entity.id} already exists`);
    }
    this.store.set(entity.id, entity);
  }

  getById(id: number): T | undefined {
    return this.store.get(id);
  }

  update(id: number, changes: Partial<T>): T | undefined {
    const existing = this.store.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...changes, id }; // id doesn't change
    this.store.set(id, updated);
    return updated;
  }

  remove(id: number): boolean {
    return this.store.delete(id);
  }

  all(): T[] {
    return [...this.store.values()];
  }

  where(predicate: (entity: T) => boolean): T[] {
    return this.all().filter(predicate);
  }
}

export type Result<T> = { ok: true; value: T } | { ok: false; error: string };

export function tryCatch<T>(fn: () => T): Result<T> {
  try {
    return { ok: true, value: fn() };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

// ============================================================
// Self-check – run:  npm run solution -- 07
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
