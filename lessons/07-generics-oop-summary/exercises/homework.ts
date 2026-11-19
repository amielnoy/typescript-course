// Lesson 7 – Homework: a typed test-data layer for a Bug Tracker
// Check yourself: npm run exercise -- 07 hw (self-check at the end of the file)
// ------------------------------------------------------------
// Scenario:
//   Your team tests a Bug Tracker app. Tests keep breaking because of messy test data:
//   tests share the same objects, ids collide, someone leaves junk data behind, and the
//   staging database contains bugs that should never have been allowed in.
//   In this homework you build a small, typed test-data layer that fixes all of that:
//     Task 1 – generic helpers for sorting and counting records by any field
//     Task 2 – EntityStore<T>: an in-memory store that hands out ids and protects its data
//     Task 3 – Factory<T>: produces fresh, numbered test data on demand
//     Task 4 – validation rules: an abstract FieldRule<T, K> and three concrete rules
//     Task 5 – Validator<T> + ValidatedStore<T>: a store that refuses invalid data
//     Task 6 – (Challenge) withFixtures: seed data for one test and always clean up after it
//     Task 7 – (Challenge) audit: a data-quality report over records that were never validated
//   Together it uses everything from lessons 3–7: encapsulation, inheritance, polymorphism,
//   abstract classes, interfaces, union types and generics.
//
// Instructions:
//   1. Replace every  throw new Error("TODO")  with your code
//      (in classes – add your own private fields as needed).
//   2. Solve the tasks in order – later tasks use the classes you built earlier
//      (Task 5 uses Task 2 and Task 4, Task 6 uses Tasks 2 and 5, Task 7 uses Tasks 1, 2, 4 and 5).
//   3. This is less guided than the exercises: decide on your own fields and helper methods.
//   4. Check yourself: npm run exercise -- 07 hw (self-check at the end of the file)
// ------------------------------------------------------------

// ---------- Shared types (given – no need to change) ----------
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

/**
 * A bug before it is saved – the store gives it the id.
 * Omit<T, "id"> is a built-in TS type: "all the fields of T except id" (the opposite of Pick).
 */
export type NewBug = Omit<Bug, "id">;

export type Result<T, E = string> = { ok: true; value: T } | { ok: false; error: E };

/**
 * Task 1 – sortBy & countBy: generic helpers that work on any field (keyof + T[K])
 *
 * 1a. sortBy(items, key, direction = "asc")
 *     Return a NEW array sorted by the value of the field key (the original array is not changed).
 *     Values can be numbers or strings – compare them with < and >.
 *     Items with equal values keep their original order.
 *       sortBy(runs, "durationMs")          => fastest first
 *       sortBy(runs, "durationMs", "desc")  => slowest first
 *
 * 1b. countBy(items, key)
 *     Return a Map from each value of the field key to how many items have it,
 *     in the order the values first appear.
 *       countBy(runs, "browser")  =>  Map { "chromium" => 2, "firefox" => 1, "webkit" => 1 }
 *     Why a Map and not an object? T[K] is not always a string – a Map accepts any key type.
 */
export function sortBy<T, K extends keyof T>(items: readonly T[], key: K, direction: "asc" | "desc" = "asc"): T[] {
  throw new Error("TODO");
}

export function countBy<T, K extends keyof T>(items: readonly T[], key: K): Map<T[K], number> {
  throw new Error("TODO");
}

/**
 * Task 2 – EntityStore<T extends HasId>: an in-memory store that protects its data
 * Unlike the Repository from the summary exercises, the caller does NOT choose the id –
 * the store does (1, 2, 3, ...). And the store never hands out its own objects, only copies,
 * so a test that changes an object it got back cannot break the next test.
 *   insert(data)            – gives data the next id, saves it and returns a copy of the saved entity
 *   getById(id)             – a copy of the entity, or undefined
 *   findBy(key, value)      – copies of all entities where entity[key] === value, in insert order
 *   update(id, changes)     – a partial update (the id never changes); returns a copy of the result.
 *                             Unknown id => throw an Error with the exact message "No entity with id 42"
 *   all()                   – copies of all entities, in insert order
 *   count (getter)          – how many entities are stored
 *   snapshot()              – { entities: copies of all entities, nextId: the id the next insert will get }
 *   restore(snapshot)       – puts the store back exactly as it was in the snapshot (entities AND nextId).
 *                             Keep copies – changing the snapshot later must not change the store, and vice versa.
 * Hints:
 *   - A shallow copy { ...entity } is enough – the entities here are flat.
 *   - { ...data, id } is "Omit<T, 'id'> plus an id"; TS can't prove that this is a T for a generic T,
 *     so you will need  as T  there.
 */
export interface StoreSnapshot<T> {
  entities: T[];
  nextId: number;
}

export class EntityStore<T extends HasId> {
  insert(data: Omit<T, "id">): T {
    throw new Error("TODO");
  }
  getById(id: number): T | undefined {
    throw new Error("TODO");
  }
  findBy<K extends keyof T>(key: K, value: T[K]): T[] {
    throw new Error("TODO");
  }
  update(id: number, changes: Partial<Omit<T, "id">>): T {
    throw new Error("TODO");
  }
  all(): T[] {
    throw new Error("TODO");
  }
  get count(): number {
    throw new Error("TODO");
  }
  snapshot(): StoreSnapshot<T> {
    throw new Error("TODO");
  }
  restore(snapshot: StoreSnapshot<T>): void {
    throw new Error("TODO");
  }
}

/**
 * Task 3 – Factory<T>: numbered test data on demand
 * The TestDataBuilder from topic 02 builds ONE object from fixed defaults. A factory is different:
 * it receives a blueprint function that gets a running number n (1, 2, 3, ...), so every object it
 * builds is a bit different ("Bug #1", "Bug #2", ...) – and the data is still predictable (deterministic).
 *   build(overrides = {})            – calls the blueprint with the next number, then applies the overrides
 *   buildMany(count, overrides = {}) – builds count objects (count 0 => []).
 *                                      count < 0 => throw an Error: "count must be 0 or more, got -1"
 *   built (getter)                   – how many objects were built since the start (or since reset)
 *   reset()                          – the next build starts again from 1
 *   const bugs = new Factory<NewBug>((n) => ({ title: `Bug #${n}`, ... }));
 *   bugs.build().title                             =>  "Bug #1"
 *   bugs.build({ severity: "critical" }).severity  =>  "critical"   (and its title is "Bug #2")
 */
export class Factory<T extends object> {
  constructor(private readonly blueprint: (n: number) => T) {}

  build(overrides: Partial<T> = {}): T {
    throw new Error("TODO");
  }
  buildMany(count: number, overrides: Partial<T> = {}): T[] {
    throw new Error("TODO");
  }
  get built(): number {
    throw new Error("TODO");
  }
  reset(): void {
    throw new Error("TODO");
  }
}

/**
 * Task 4 – validation rules: interface + abstract class + inheritance + polymorphism
 * A Rule<T> checks one entity and returns null if it is fine, or an error message.
 *
 * 4a. FieldRule<T, K>.check(entity) – a "Template Method" (like ApiCheck.run() in topic 03):
 *     read the value of this.field from the entity, pass it to this.problem(value), and:
 *       problem returned null      => return null
 *       problem returned a string  => return "<field> <problem>", e.g. "title is required"
 *     Hint: String(this.field) – because keyof T can also be a symbol.
 *
 * 4b. Implement problem() in each subclass (return null when the value is fine):
 *     RequiredRule – undefined, null, or a string that is empty after trim()   => "is required"
 *     OneOfRule    – the value is not in allowed  => "must be one of high/critical, got low"
 *                    (the allowed values joined with "/")
 *     RangeRule    – the value is not a number    => "must be a number"
 *                    (data from an API doesn't always match our types – check with typeof)
 *                    the value is outside min..max (inclusive) => "must be between 1 and 13, got 21"
 *   new RequiredRule<Bug, "title">("title").check(bugWithEmptyTitle)  =>  "title is required"
 */
export interface Rule<T> {
  check(entity: T): string | null;
}

export abstract class FieldRule<T, K extends keyof T> implements Rule<T> {
  constructor(protected readonly field: K) {}

  protected abstract problem(value: T[K]): string | null;

  check(entity: T): string | null {
    throw new Error("TODO");
  }
}

export class RequiredRule<T, K extends keyof T> extends FieldRule<T, K> {
  protected problem(value: T[K]): string | null {
    throw new Error("TODO");
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
    throw new Error("TODO");
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
    throw new Error("TODO");
  }
}

/**
 * Task 5 – Validator<T> + ValidatedStore<T>: a store that refuses invalid data
 *
 * 5a. Validator<T>
 *     add(...rules): this – adds rules (chaining). A rule is ANY Rule<T> – a FieldRule subclass
 *                           or a plain object with check().
 *     validate(entity)    – runs ALL the rules in the order they were added (don't stop at the first error):
 *                             no errors  => { ok: true, value: entity }
 *                             errors     => { ok: false, error: [all the messages, in rule order] }
 *
 * 5b. ValidatedStore<T> extends EntityStore<T>
 *     Override insert(): validate the data first.
 *       Invalid => throw an Error: "Invalid entity: " + the messages joined with "; "
 *                  e.g. "Invalid entity: title is required; storyPoints must be between 1 and 13, got 0"
 *                  and nothing is saved – the id is NOT used up (the next valid insert gets it).
 *       Valid   => let EntityStore do the real work (super).
 *     Remember: with noImplicitOverride you must write the  override  keyword.
 */
export class Validator<T> {
  add(...rules: Rule<T>[]): this {
    throw new Error("TODO");
  }
  validate(entity: T): Result<T, string[]> {
    throw new Error("TODO");
  }
}

export class ValidatedStore<T extends HasId> extends EntityStore<T> {
  constructor(private readonly validator: Validator<Omit<T, "id">>) {
    super();
  }

  override insert(data: Omit<T, "id">): T {
    throw new Error("TODO");
  }
}

/**
 * Task 6 (Challenge) – withFixtures: seed data for one test, and always clean up after it
 * Like a fixture in Playwright: prepare data before the test, and remove it after the test –
 * whether the test passed or failed.
 *   1. Remember the store's current state (snapshot).
 *   2. Insert every item of seed, in order, with store.insert(...).
 *   3. Call test with the inserted entities (they now have ids).
 *   4. Return { ok: true, value: whatever test returned },
 *      or – if anything threw (a seed insert or the test itself) – { ok: false, error: the error message }.
 *   5. In ALL cases put the store back exactly as it was before (ids start over too).
 * Polymorphism bonus: you call store.insert(...) without knowing which store you got – a ValidatedStore
 * will refuse bad seed data by itself, and then the test is never called.
 * Hint: try / catch / finally – the finally block runs even after a return.
 */
export function withFixtures<T extends HasId, R>(
  store: EntityStore<T>,
  seed: readonly Omit<T, "id">[],
  test: (seeded: T[]) => R,
): Result<R, string> {
  throw new Error("TODO");
}

/**
 * Task 7 (Challenge) – audit: a data-quality report
 * The nightly import from staging was loaded into a plain EntityStore – nothing was validated.
 * Validate every entity and return an AuditReport:
 *   total      – how many entities were checked
 *   valid      – how many passed all the rules
 *   invalid    – { id, errors } for each entity that failed, sorted by id (the input may be in any order!)
 *   invalidBy  – among the INVALID entities only: how many there are for each value of groupKey,
 *                in the order the values first appear (going by id).
 *     audit(stagingBugs, validator, "severity").invalidBy  =>  Map { "high" => 2, "low" => 1, ... }
 * Reuse what you built: sortBy and countBy from Task 1, and validator.validate from Task 5.
 * (A T is also an Omit<T, "id"> – it just has one extra field – so you can pass an entity to validate.)
 */
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
  throw new Error("TODO");
}

// ============================================================
// Self-check – run:  npm run exercise -- 07 hw
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
