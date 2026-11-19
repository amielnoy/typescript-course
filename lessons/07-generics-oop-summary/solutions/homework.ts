// Lesson 7 – Homework: a typed test-data layer for a Bug Tracker – Solutions

// ---------- Shared types ----------
export interface HasId {
  id: number;
}

export type Severity = "low" | "medium" | "high" | "critical";
export type BugStatus = "open" | "in-progress" | "fixed" | "closed";

export interface Bug {
  id: number;
  title: string;
  severity: Severity;
  status: BugStatus;
  assignee: string;
  storyPoints: number;
}

/** A bug before it is saved – the store gives it the id */
export type NewBug = Omit<Bug, "id">;

export type Result<T, E = string> = { ok: true; value: T } | { ok: false; error: E };

// ---------- Task 1 ----------
export function sortBy<T, K extends keyof T>(items: readonly T[], key: K, direction: "asc" | "desc" = "asc"): T[] {
  const sign = direction === "asc" ? 1 : -1;
  return [...items].sort((a, b) => {
    if (a[key] < b[key]) return -1 * sign;
    if (a[key] > b[key]) return 1 * sign;
    return 0;
  });
}

export function countBy<T, K extends keyof T>(items: readonly T[], key: K): Map<T[K], number> {
  const counts = new Map<T[K], number>();
  for (const item of items) {
    const value = item[key];
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return counts;
}

// ---------- Task 2 ----------
export interface StoreSnapshot<T> {
  entities: T[];
  nextId: number;
}

export class EntityStore<T extends HasId> {
  private entities: T[] = [];
  private nextId = 1;

  insert(data: Omit<T, "id">): T {
    const entity = { ...data, id: this.nextId } as T;
    this.nextId++;
    this.entities.push(entity);
    return { ...entity };
  }

  getById(id: number): T | undefined {
    const entity = this.entities.find((e) => e.id === id);
    return entity ? { ...entity } : undefined;
  }

  findBy<K extends keyof T>(key: K, value: T[K]): T[] {
    return this.entities.filter((e) => e[key] === value).map((e) => ({ ...e }));
  }

  update(id: number, changes: Partial<Omit<T, "id">>): T {
    const index = this.entities.findIndex((e) => e.id === id);
    if (index === -1) throw new Error(`No entity with id ${id}`);
    const updated = { ...this.entities[index], ...changes, id } as T;
    this.entities[index] = updated;
    return { ...updated };
  }

  all(): T[] {
    return this.entities.map((e) => ({ ...e }));
  }

  get count(): number {
    return this.entities.length;
  }

  snapshot(): StoreSnapshot<T> {
    return { entities: this.all(), nextId: this.nextId };
  }

  restore(snapshot: StoreSnapshot<T>): void {
    this.entities = snapshot.entities.map((e) => ({ ...e }));
    this.nextId = snapshot.nextId;
  }
}

// ---------- Task 3 ----------
export class Factory<T extends object> {
  private sequence = 0;

  constructor(private readonly blueprint: (n: number) => T) {}

  build(overrides: Partial<T> = {}): T {
    this.sequence++;
    return { ...this.blueprint(this.sequence), ...overrides };
  }

  buildMany(count: number, overrides: Partial<T> = {}): T[] {
    if (count < 0) throw new Error(`count must be 0 or more, got ${count}`);
    const items: T[] = [];
    for (let i = 0; i < count; i++) items.push(this.build(overrides));
    return items;
  }

  get built(): number {
    return this.sequence;
  }

  reset(): void {
    this.sequence = 0;
  }
}

// ---------- Task 4 ----------
export interface Rule<T> {
  check(entity: T): string | null;
}

export abstract class FieldRule<T, K extends keyof T> implements Rule<T> {
  constructor(protected readonly field: K) {}

  protected abstract problem(value: T[K]): string | null;

  check(entity: T): string | null {
    const problem = this.problem(entity[this.field]);
    return problem === null ? null : `${String(this.field)} ${problem}`;
  }
}

export class RequiredRule<T, K extends keyof T> extends FieldRule<T, K> {
  protected problem(value: T[K]): string | null {
    if (value === undefined || value === null) return "is required";
    if (typeof value === "string" && value.trim() === "") return "is required";
    return null;
  }
}

export class OneOfRule<T, K extends keyof T> extends FieldRule<T, K> {
  constructor(
    field: K,
    private readonly allowed: readonly T[K][],
  ) {
    super(field);
  }

  protected problem(value: T[K]): string | null {
    if (this.allowed.includes(value)) return null;
    return `must be one of ${this.allowed.join("/")}, got ${String(value)}`;
  }
}

export class RangeRule<T, K extends keyof T> extends FieldRule<T, K> {
  constructor(
    field: K,
    private readonly min: number,
    private readonly max: number,
  ) {
    super(field);
  }

  protected problem(value: T[K]): string | null {
    if (typeof value !== "number") return "must be a number";
    if (value < this.min || value > this.max) return `must be between ${this.min} and ${this.max}, got ${value}`;
    return null;
  }
}

// ---------- Task 5 ----------
export class Validator<T> {
  private readonly rules: Rule<T>[] = [];

  add(...rules: Rule<T>[]): this {
    this.rules.push(...rules);
    return this;
  }

  validate(entity: T): Result<T, string[]> {
    const errors: string[] = [];
    for (const rule of this.rules) {
      const message = rule.check(entity);
      if (message !== null) errors.push(message);
    }
    return errors.length === 0 ? { ok: true, value: entity } : { ok: false, error: errors };
  }
}

export class ValidatedStore<T extends HasId> extends EntityStore<T> {
  constructor(private readonly validator: Validator<Omit<T, "id">>) {
    super();
  }

  override insert(data: Omit<T, "id">): T {
    const result = this.validator.validate(data);
    if (!result.ok) throw new Error(`Invalid entity: ${result.error.join("; ")}`);
    return super.insert(data);
  }
}

// ---------- Task 6 (Challenge) ----------
export function withFixtures<T extends HasId, R>(
  store: EntityStore<T>,
  seed: readonly Omit<T, "id">[],
  test: (seeded: T[]) => R,
): Result<R, string> {
  const before = store.snapshot();
  try {
    const seeded = seed.map((data) => store.insert(data));
    return { ok: true, value: test(seeded) };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  } finally {
    store.restore(before);
  }
}

// ---------- Task 7 (Challenge) ----------
export interface AuditReport<V> {
  total: number;
  valid: number;
  invalid: { id: number; errors: string[] }[];
  invalidBy: Map<V, number>;
}

export function audit<T extends HasId, K extends keyof T>(
  entities: readonly T[],
  validator: Validator<Omit<T, "id">>,
  groupKey: K,
): AuditReport<T[K]> {
  const invalid: { id: number; errors: string[] }[] = [];
  const invalidEntities: T[] = [];
  for (const entity of sortBy(entities, "id")) {
    const result = validator.validate(entity);
    if (!result.ok) {
      invalid.push({ id: entity.id, errors: result.error });
      invalidEntities.push(entity);
    }
  }
  return {
    total: entities.length,
    valid: entities.length - invalid.length,
    invalid,
    invalidBy: countBy(invalidEntities, groupKey),
  };
}

// ============================================================
// Self-check – run:  npm run solution -- 07 hw
// On every line, the value left of "=> expected:" must equal the value on its right.
// (No need to change the code below this line)
// ============================================================

/** Rules for a NewBug – used by tasks 5–7 */
function bugValidator(): Validator<NewBug> {
  return new Validator<NewBug>().add(
    new RequiredRule<NewBug, "title">("title"),
    new OneOfRule<NewBug, "severity">("severity", ["low", "medium", "high", "critical"]),
    new RangeRule<NewBug, "storyPoints">("storyPoints", 1, 13),
  );
}

/** A valid bug with the given overrides (no Factory needed) */
function newBug(overrides: Partial<NewBug> = {}): NewBug {
  return { title: "Login fails", severity: "high", status: "open", assignee: "dana", storyPoints: 3, ...overrides };
}

console.log("\n--- Task 1: sortBy & countBy ---");
try {
  const runs = [
    { name: "login", durationMs: 300, browser: "chromium" },
    { name: "cart", durationMs: 120, browser: "firefox" },
    { name: "search", durationMs: 300, browser: "chromium" },
    { name: "logout", durationMs: 80, browser: "webkit" },
  ];
  console.log(
    sortBy(runs, "durationMs").map((r) => r.name),
    "=> expected:",
    ["logout", "cart", "login", "search"],
  );
  console.log(
    sortBy(runs, "durationMs", "desc").map((r) => r.name),
    "=> expected:",
    ["login", "search", "cart", "logout"],
  );
  console.log(
    sortBy(runs, "name").map((r) => r.name),
    "=> expected:",
    ["cart", "login", "logout", "search"],
  );
  console.log("original order kept:", runs[0].name, "=> expected:", "original order kept:", "login");
  console.log("a new array?", sortBy(runs, "name") !== runs, "=> expected:", "a new array?", true);
  console.log(
    countBy(runs, "browser"),
    "=> expected:",
    new Map([
      ["chromium", 2],
      ["firefox", 1],
      ["webkit", 1],
    ]),
  );
  console.log(countBy([], "browser"), "=> expected:", new Map());
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Task 2: EntityStore ---");
try {
  const store = new EntityStore<Bug>();
  const first = store.insert(newBug());
  const second = store.insert(newBug({ title: "Cart total wrong", severity: "critical", assignee: "yossi" }));
  console.log("ids:", first.id, second.id, "=> expected:", "ids:", 1, 2);
  console.log(store.getById(2), "=> expected:", {
    title: "Cart total wrong",
    severity: "critical",
    status: "open",
    assignee: "yossi",
    storyPoints: 3,
    id: 2,
  });
  console.log(store.getById(99), "=> expected:", undefined);
  console.log("count:", store.count, "=> expected:", "count:", 2);

  // Encapsulation – changing what we got back doesn't change the store
  first.title = "hacked";
  const fetched = store.getById(1);
  if (fetched) fetched.status = "closed";
  store.all()[0].assignee = "hacker";
  console.log(store.getById(1), "=> expected:", { ...newBug(), id: 1 });

  console.log(
    store.findBy("assignee", "yossi").map((b) => b.id),
    "=> expected:",
    [2],
  );
  console.log(store.findBy("severity", "low"), "=> expected:", []);

  console.log(store.update(1, { status: "fixed" }), "=> expected:", { ...newBug({ status: "fixed" }), id: 1 });
  try {
    store.update(42, { status: "fixed" });
    console.log("did not throw", "=> expected:", "threw:", "No entity with id 42");
  } catch (err) {
    if ((err as Error).message === "TODO") throw err;
    console.log("threw:", (err as Error).message, "=> expected:", "threw:", "No entity with id 42");
  }

  // snapshot / restore – a copy, not a shared reference
  const snap = store.snapshot();
  console.log("snapshot:", snap.entities.length, snap.nextId, "=> expected:", "snapshot:", 2, 3);
  store.insert(newBug({ title: "Temp" }));
  store.update(1, { status: "closed" });
  console.log("after changes:", store.count, store.getById(1)?.status, "=> expected:", "after changes:", 3, "closed");
  store.restore(snap);
  console.log("after restore:", store.count, store.getById(1)?.status, "=> expected:", "after restore:", 2, "fixed");
  console.log("next id after restore:", store.insert(newBug()).id, "=> expected:", "next id after restore:", 3);
  snap.entities[0].title = "changed the snapshot";
  store.restore(snap);
  store.update(2, { assignee: "noa" });
  console.log("snapshot untouched by the store:", snap.entities[1].assignee, "=> expected:", "snapshot untouched by the store:", "yossi");
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Task 3: Factory ---");
try {
  const bugs = new Factory<NewBug>((n) => ({
    title: `Bug #${n}`,
    severity: "medium",
    status: "open",
    assignee: `tester${n}`,
    storyPoints: n,
  }));
  console.log(bugs.build(), "=> expected:", {
    title: "Bug #1",
    severity: "medium",
    status: "open",
    assignee: "tester1",
    storyPoints: 1,
  });
  console.log(bugs.build({ severity: "critical", assignee: "dana" }), "=> expected:", {
    title: "Bug #2",
    severity: "critical",
    status: "open",
    assignee: "dana",
    storyPoints: 2,
  });
  console.log(
    bugs.buildMany(3, { status: "fixed" }).map((b) => `${b.title}:${b.status}`),
    "=> expected:",
    ["Bug #3:fixed", "Bug #4:fixed", "Bug #5:fixed"],
  );
  console.log("built:", bugs.built, "=> expected:", "built:", 5);
  console.log(bugs.buildMany(0), "=> expected:", []);
  bugs.reset();
  console.log("after reset:", bugs.build().title, bugs.built, "=> expected:", "after reset:", "Bug #1", 1);
  const a = bugs.build();
  const b = bugs.build();
  console.log("separate objects?", a !== b, "=> expected:", "separate objects?", true);
  try {
    bugs.buildMany(-1);
    console.log("did not throw", "=> expected:", "an error");
  } catch (err) {
    if ((err as Error).message === "TODO") throw err;
    console.log("threw:", (err as Error).message, "=> expected:", "threw:", "count must be 0 or more, got -1");
  }
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Task 4: FieldRule & concrete rules ---");
try {
  const required = new RequiredRule<Bug, "assignee">("assignee");
  console.log(required.check({ ...newBug(), id: 1 }), "=> expected:", null);
  console.log(required.check({ ...newBug({ assignee: "   " }), id: 1 }), "=> expected:", "assignee is required");

  const severity = new OneOfRule<Bug, "severity">("severity", ["high", "critical"]);
  console.log(severity.check({ ...newBug({ severity: "critical" }), id: 1 }), "=> expected:", null);
  console.log(
    severity.check({ ...newBug({ severity: "low" }), id: 1 }),
    "=> expected:",
    "severity must be one of high/critical, got low",
  );

  const points = new RangeRule<Bug, "storyPoints">("storyPoints", 1, 13);
  console.log(points.check({ ...newBug({ storyPoints: 13 }), id: 1 }), "=> expected:", null);
  console.log(
    points.check({ ...newBug({ storyPoints: 21 }), id: 1 }),
    "=> expected:",
    "storyPoints must be between 1 and 13, got 21",
  );
  // Data from an API doesn't always match our types – the rule must not trust them
  const fromApi = { ...newBug(), id: 1, storyPoints: "5" as unknown as number };
  console.log(points.check(fromApi), "=> expected:", "storyPoints must be a number");

  // Polymorphism – all three are a Rule<Bug>, and a new subclass gets check() for free
  class NoSpacesRule extends FieldRule<Bug, "assignee"> {
    protected problem(value: string): string | null {
      return value.includes(" ") ? "must not contain spaces" : null;
    }
  }
  const rules: Rule<Bug>[] = [required, severity, points, new NoSpacesRule("assignee")];
  const broken: Bug = { id: 7, title: "x", severity: "low", status: "open", assignee: "dana cohen", storyPoints: 0 };
  console.log(
    rules.map((r) => r.check(broken)),
    "=> expected:",
    [
      null,
      "severity must be one of high/critical, got low",
      "storyPoints must be between 1 and 13, got 0",
      "assignee must not contain spaces",
    ],
  );
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Task 5: Validator & ValidatedStore ---");
try {
  const validator = bugValidator();
  console.log(validator.validate(newBug()), "=> expected:", { ok: true, value: newBug() });
  console.log(
    validator.validate(newBug({ title: "", severity: "urgent" as Severity, storyPoints: 40 })),
    "=> expected:",
    {
      ok: false,
      error: [
        "title is required",
        "severity must be one of low/medium/high/critical, got urgent",
        "storyPoints must be between 1 and 13, got 40",
      ],
    },
  );
  console.log("Does add return this?", validator.add() === validator, "=> expected:", "Does add return this?", true);

  // A rule doesn't have to be a FieldRule – any object with check() is a Rule<T> (an interface!)
  const closedNeedsAssignee: Rule<NewBug> = {
    check: (bug) => (bug.status === "closed" && bug.assignee === "" ? "closed bugs need an assignee" : null),
  };
  const strict = bugValidator().add(closedNeedsAssignee);
  console.log(
    strict.validate(newBug({ status: "closed", assignee: "" })),
    "=> expected:",
    { ok: false, error: ["closed bugs need an assignee"] },
  );

  const store = new ValidatedStore<Bug>(bugValidator());
  console.log("is an EntityStore?", store instanceof EntityStore, "=> expected:", "is an EntityStore?", true);
  console.log("first id:", store.insert(newBug()).id, "=> expected:", "first id:", 1);
  try {
    store.insert(newBug({ title: " ", storyPoints: 0 }));
    console.log("did not throw", "=> expected:", "an error");
  } catch (err) {
    if ((err as Error).message === "TODO") throw err;
    console.log(
      "threw:",
      (err as Error).message,
      "=> expected:",
      "threw:",
      "Invalid entity: title is required; storyPoints must be between 1 and 13, got 0",
    );
  }
  console.log("count after the rejected insert:", store.count, "=> expected:", "count after the rejected insert:", 1);
  console.log("next id is not wasted:", store.insert(newBug()).id, "=> expected:", "next id is not wasted:", 2);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Task 6 (Challenge): withFixtures ---");
try {
  const store = new EntityStore<Bug>();
  store.insert(newBug({ title: "Existing bug" }));

  const passed = withFixtures(store, [newBug({ title: "A" }), newBug({ title: "B", severity: "low" })], (seeded) => {
    store.update(seeded[0].id, { status: "closed" });
    return `${seeded.map((b) => `${b.id}:${b.title}`).join(",")} | in store: ${store.count}`;
  });
  console.log(passed, "=> expected:", { ok: true, value: "2:A,3:B | in store: 3" });
  console.log(
    "store after the test:",
    store.all().map((b) => b.title),
    "=> expected:",
    "store after the test:",
    ["Existing bug"],
  );

  const failed = withFixtures(store, [newBug({ title: "C" })], () => {
    throw new Error("expected status 200, got 500");
  });
  console.log(failed, "=> expected:", { ok: false, error: "expected status 200, got 500" });
  console.log("restored after a failure:", store.count, "=> expected:", "restored after a failure:", 1);
  console.log("ids start over:", store.insert(newBug()).id, "=> expected:", "ids start over:", 2);

  // Polymorphism – with a ValidatedStore, bad seed data fails the run (and the test is never called)
  const validated = new ValidatedStore<Bug>(bugValidator());
  let testCalled = false;
  const badSeed = withFixtures(validated, [newBug({ title: "ok" }), newBug({ storyPoints: 99 })], () => {
    testCalled = true;
    return "should not get here";
  });
  console.log(badSeed, "=> expected:", { ok: false, error: "Invalid entity: storyPoints must be between 1 and 13, got 99" });
  console.log("test called / count:", testCalled, validated.count, "=> expected:", "test called / count:", false, 0);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Task 7 (Challenge): audit ---");
try {
  // A nightly import from staging – loaded into a plain EntityStore, so nothing was validated
  const staging = new EntityStore<Bug>();
  staging.insert(newBug({ title: "Checkout freezes", severity: "critical" }));
  staging.insert(newBug({ title: "", severity: "high" }));
  staging.insert(newBug({ title: "Typo on footer", severity: "low", storyPoints: 0 }));
  staging.insert(newBug({ title: "Search slow", severity: "blocker" as Severity, storyPoints: 20 }));
  staging.insert(newBug({ title: " ", severity: "high" }));

  const shuffled = sortBy(staging.all(), "title", "desc"); // not in id order on purpose
  const report = audit(shuffled, bugValidator(), "severity");
  console.log("total / valid:", report.total, report.valid, "=> expected:", "total / valid:", 5, 1);
  console.log(report.invalid, "=> expected:", [
    { id: 2, errors: ["title is required"] },
    { id: 3, errors: ["storyPoints must be between 1 and 13, got 0"] },
    {
      id: 4,
      errors: ["severity must be one of low/medium/high/critical, got blocker", "storyPoints must be between 1 and 13, got 20"],
    },
    { id: 5, errors: ["title is required"] },
  ]);
  console.log(
    report.invalidBy,
    "=> expected:",
    new Map<Severity, number>([
      ["high", 2],
      ["low", 1],
      ["blocker" as Severity, 1],
    ]),
  );
  console.log(
    "group by another field:",
    audit(staging.all(), bugValidator(), "assignee").invalidBy,
    "=> expected:",
    "group by another field:",
    new Map([["dana", 4]]),
  );
  console.log(audit<Bug, "status">([], bugValidator(), "status"), "=> expected:", { total: 0, valid: 0, invalid: [], invalidBy: new Map() });
} catch (e) {
  console.log("  ✋", (e as Error).message);
}
