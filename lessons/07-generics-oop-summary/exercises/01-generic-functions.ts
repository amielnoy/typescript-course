// Lesson 7 – Topic 01: Generic functions – Exercises
// ------------------------------------------------------------
// Instructions:
//   1. Complete the body of each function in place of the line  throw new Error("TODO")
//   2. The exercises focus only on this topic (examples/01-generic-functions.ts):
//      the type parameter <T>, multiple type parameters, generics with a callback, readonly T[].
//      Don't use any – let T "flow" from the input to the output.
//   3. Check yourself: npm run exercise -- 07 01 (self-check at the end of the file)
// ------------------------------------------------------------

/**
 * Exercise 1 – firstOr: first item or a default value
 * Return the first item in the array. If the array is empty – return fallback.
 *   firstOr(["chromium", "firefox"], "webkit")  =>  "chromium"
 *   firstOr([], "webkit")                        =>  "webkit"
 * Note: the return type is T (not T | undefined) – because there is always a value.
 * Hint: check items.length, not items[0] – after all, 0 or "" are valid values!
 */
export function firstOr<T>(items: readonly T[], fallback: T): T {
  throw new Error("TODO");
}

/**
 * Exercise 2 – partition: split results into two groups
 * Return a tuple of two arrays: [everything that passed predicate, everything else].
 * The original order is kept within each group.
 *   partition([200, 500, 201, 404], (s) => s < 400)  =>  [[200, 201], [500, 404]]
 * A testing-world example: splitting run results into passed / failed.
 */
export function partition<T>(items: T[], predicate: (item: T) => boolean): [T[], T[]] {
  throw new Error("TODO");
}

/**
 * Exercise 3 – zip: pair inputs with expected results (data-driven testing)
 * Return an array of pairs [a[i], b[i]].
 * If the lengths differ – stop at the shorter of the two.
 *   zip(["admin", "guest"], [200, 403])  =>  [["admin", 200], ["guest", 403]]
 * Hint: two type parameters – A and B – exactly like pair<K, V> in the example.
 */
export function zip<A, B>(a: A[], b: B[]): [A, B][] {
  throw new Error("TODO");
}

/**
 * Exercise 4 – chunk: split test data into batches
 * Split the array into smaller arrays of length size (the last batch may be smaller).
 *   chunk(["t1", "t2", "t3", "t4", "t5"], 2)  =>  [["t1", "t2"], ["t3", "t4"], ["t5"]]
 *   chunk([], 3)                               =>  []
 * If size is less than 1 – throw an Error (otherwise we get an infinite loop).
 * A testing-world example: distributing test files among several workers running in parallel.
 * Hint: items.slice(i, i + size)
 */
export function chunk<T>(items: T[], size: number): T[][] {
  throw new Error("TODO");
}

/**
 * Exercise 5 – uniqueBy: remove duplicates by key
 * Return a new array without duplicates, where "duplicate" = the same value returned by keyFn.
 * When there is a duplicate – keep the first occurrence, and the original order is kept.
 *   uniqueBy([{ id: 1, run: 1 }, { id: 2, run: 1 }, { id: 1, run: 2 }], (t) => t.id)
 *     =>  [{ id: 1, run: 1 }, { id: 2, run: 1 }]
 * Hint: a Set<string | number> of keys we've already seen.
 */
export function uniqueBy<T>(items: T[], keyFn: (item: T) => string | number): T[] {
  throw new Error("TODO");
}

/**
 * Exercise 6 (Bonus) – cycle: a fixed rotation (round-robin)
 * In the example we saw randomItem – a random pick. But in automated tests it is sometimes better
 * to have something predictable (deterministic): each call returns the next item, and at the end we start over.
 *   const nextBrowser = cycle(["chromium", "firefox", "webkit"]);
 *   nextBrowser()  =>  "chromium"
 *   nextBrowser()  =>  "firefox"
 *   nextBrowser()  =>  "webkit"
 *   nextBrowser()  =>  "chromium"   // back to the start
 * - cycle returns a function (a closure) that remembers the current position.
 * - Every call to cycle creates a new, independent rotation.
 * - If the array is empty – throw an Error already in the call to cycle itself.
 * Hint: the % (remainder) operator helps you "wrap back to the start".
 */
export function cycle<T>(items: readonly T[]): () => T {
  throw new Error("TODO");
}

// ============================================================
// Self-check – run:  npm run exercise -- 07 01
// On every line, the value left of "=> expected:" must equal the value on its right.
// (No need to change the code below this line)
// ============================================================

console.log("\n--- Exercise 1: firstOr ---");
try {
  console.log(firstOr(["chromium", "firefox"], "webkit"), "=> expected:", "chromium");
  console.log(firstOr([], "webkit"), "=> expected:", "webkit");
  // 0 and "" are valid values – they are not replaced with fallback
  console.log(firstOr([0, 5], 99), "=> expected:", 0);
  console.log(JSON.stringify(firstOr([""], "fallback")), "=> expected:", JSON.stringify(""));
  const user = { id: 1 };
  console.log("Exact same object?", firstOr([user], { id: 0 }) === user, "=> expected:", "Exact same object?", true);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 2: partition ---");
try {
  console.log(
    partition([200, 500, 201, 404], (s) => s < 400),
    "=> expected:",
    [
      [200, 201],
      [500, 404],
    ],
  );
  console.log(
    partition(["login", "logout"], () => true),
    "=> expected:",
    [["login", "logout"], []],
  );
  console.log(
    partition([], () => true),
    "=> expected:",
    [[], []],
  );
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 3: zip ---");
try {
  console.log(zip(["admin", "guest"], [200, 403]), "=> expected:", [
    ["admin", 200],
    ["guest", 403],
  ]);
  // Different lengths – stop at the shorter one
  console.log(zip([1, 2, 3], ["a"]), "=> expected:", [[1, "a"]]);
  console.log(zip(["a"], [1, 2, 3]), "=> expected:", [["a", 1]]);
  console.log(zip([], [1, 2]), "=> expected:", []);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 4: chunk ---");
try {
  console.log(chunk(["t1", "t2", "t3", "t4", "t5"], 2), "=> expected:", [["t1", "t2"], ["t3", "t4"], ["t5"]]);
  console.log(chunk([1, 2, 3], 3), "=> expected:", [[1, 2, 3]]);
  console.log(chunk([1, 2], 5), "=> expected:", [[1, 2]]);
  console.log(chunk([], 3), "=> expected:", []);
  const input = [1, 2, 3];
  chunk(input, 1);
  console.log("Original array:", input, "=> expected:", "Original array:", [1, 2, 3]);
  for (const badSize of [0, -1]) {
    try {
      chunk([1, 2], badSize);
      console.log("did not throw", "=> expected:", "an error");
    } catch (err) {
      if ((err as Error).message === "TODO") throw err;
      console.log("threw:", (err as Error).message, "=> expected:", "an error");
    }
  }
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 5: uniqueBy ---");
try {
  console.log(
    uniqueBy(
      [
        { id: 1, run: 1 },
        { id: 2, run: 1 },
        { id: 1, run: 2 },
      ],
      (t) => t.id,
    ),
    "=> expected:",
    [
      { id: 1, run: 1 },
      { id: 2, run: 1 },
    ],
  );
  console.log(
    uniqueBy(["Login", "login", "Cart"], (s) => s.toLowerCase()),
    "=> expected:",
    ["Login", "Cart"],
  );
  console.log(
    uniqueBy([3, 1, 3, 2, 1], (n) => n),
    "=> expected:",
    [3, 1, 2],
  );
  console.log(
    uniqueBy([], (x) => String(x)),
    "=> expected:",
    [],
  );
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 6 (Bonus): cycle ---");
try {
  const nextBrowser = cycle(["chromium", "firefox", "webkit"]);
  const five = [nextBrowser(), nextBrowser(), nextBrowser(), nextBrowser(), nextBrowser()];
  console.log(five, "=> expected:", ["chromium", "firefox", "webkit", "chromium", "firefox"]);

  // Every call to cycle creates an independent rotation
  const a = cycle([1, 2]);
  const b = cycle([1, 2]);
  console.log([a(), a(), b()], "=> expected:", [1, 2, 1]);

  const single = cycle(["only"]);
  console.log([single(), single()], "=> expected:", ["only", "only"]);

  try {
    cycle([]);
    console.log("did not throw", "=> expected:", "an error");
  } catch (err) {
    if ((err as Error).message === "TODO") throw err;
    console.log("threw:", (err as Error).message, "=> expected:", "an error");
  }
} catch (e) {
  console.log("  ✋", (e as Error).message);
}
