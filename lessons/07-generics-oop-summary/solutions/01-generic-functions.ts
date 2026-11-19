// Lesson 7 – Topic 01: Generic functions – Solutions

export function firstOr<T>(items: readonly T[], fallback: T): T {
  // Check the length, not "truthiness" – 0 and "" are valid values
  return items.length > 0 ? items[0] : fallback;
}

export function partition<T>(items: T[], predicate: (item: T) => boolean): [T[], T[]] {
  const matched: T[] = [];
  const rest: T[] = [];
  for (const item of items) {
    (predicate(item) ? matched : rest).push(item);
  }
  return [matched, rest];
}

export function zip<A, B>(a: A[], b: B[]): [A, B][] {
  const length = Math.min(a.length, b.length);
  const pairs: [A, B][] = [];
  for (let i = 0; i < length; i++) {
    pairs.push([a[i], b[i]]);
  }
  return pairs;
}

export function chunk<T>(items: T[], size: number): T[][] {
  if (size < 1) {
    throw new Error(`chunk size must be at least 1, got ${size}`);
  }
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size)); // slice doesn't change the original
  }
  return chunks;
}

export function uniqueBy<T>(items: T[], keyFn: (item: T) => string | number): T[] {
  const seen = new Set<string | number>();
  const result: T[] = [];
  for (const item of items) {
    const key = keyFn(item);
    if (seen.has(key)) continue; // already seen – keep only the first occurrence
    seen.add(key);
    result.push(item);
  }
  return result;
}

export function cycle<T>(items: readonly T[]): () => T {
  if (items.length === 0) {
    throw new Error("cycle() needs at least one item");
  }
  let index = 0; // the closure "remembers" this variable between calls
  return () => {
    const item = items[index];
    index = (index + 1) % items.length;
    return item;
  };
}

// ============================================================
// Self-check – run:  npm run solution -- 07 01
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
