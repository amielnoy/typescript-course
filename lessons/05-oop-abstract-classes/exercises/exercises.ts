// Lesson 5 – Summary exercises
// Polymorphism and Abstract Classes
// Check yourself: npm run exercise -- 05 (self-check at the end of the file)

export interface Summary {
  total: number;
  passed: number;
  failed: number;
}

/**
 * Exercise 1 – The abstract class Report
 * Report is already defined. Implement three subclasses that implement render(summary):
 *
 *   TextReport  => "Total: 10, Passed: 8, Failed: 2"
 *   JsonReport  => JSON.stringify(summary)            e.g. '{"total":10,"passed":8,"failed":2}'
 *   HtmlReport  => "<ul><li>Total: 10</li><li>Passed: 8</li><li>Failed: 2</li></ul>"
 *
 * and also fileExtension (abstract readonly):  "txt" / "json" / "html"
 */
export abstract class Report {
  abstract readonly fileExtension: string;
  abstract render(summary: Summary): string;

  // A shared method – already implemented
  fileName(base: string): string {
    return `${base}.${this.fileExtension}`;
  }
}

export class TextReport extends Report {
  readonly fileExtension = "TODO";
  render(summary: Summary): string {
    throw new Error("TODO");
  }
}
export class JsonReport extends Report {
  readonly fileExtension = "TODO";
  render(summary: Summary): string {
    throw new Error("TODO");
  }
}
export class HtmlReport extends Report {
  readonly fileExtension = "TODO";
  render(summary: Summary): string {
    throw new Error("TODO");
  }
}

/**
 * Exercise 2 – Polymorphism
 * Return an array of strings – the render result of every report, in the same order.
 * Using instanceof or an if on the report type is not allowed!
 */
export function renderAll(reports: Report[], summary: Summary): string[] {
  throw new Error("TODO");
}

/**
 * Exercise 3 – The abstract class Discount (a checkout system we are testing)
 * - abstract apply(price: number): number
 * - PercentageDiscount(percent)  -> takes a percentage off the price
 * - FixedDiscount(amount)        -> takes a fixed amount off, but the price never goes below 0
 * - NoDiscount                   -> returns the price as is
 * - The function bestPrice(price, discounts) returns the lowest price
 *   among all the discounts (if the array is empty – the original price).
 */
export abstract class Discount {
  abstract apply(price: number): number;
}

export class PercentageDiscount extends Discount {
  constructor(percent: number) {
    super();
    throw new Error("TODO");
  }
  apply(price: number): number {
    throw new Error("TODO");
  }
}

export class FixedDiscount extends Discount {
  constructor(amount: number) {
    super();
    throw new Error("TODO");
  }
  apply(price: number): number {
    throw new Error("TODO");
  }
}

export class NoDiscount extends Discount {
  apply(price: number): number {
    throw new Error("TODO");
  }
}

export function bestPrice(price: number, discounts: Discount[]): number {
  throw new Error("TODO");
}

// ============================================================
// Self-check – run:  npm run exercise -- 05
// On every line, the value left of "=> expected:" must equal the value on its right.
// (No need to change the code below this line)
// ============================================================

console.log("\n--- Exercise 1: Report subclasses ---");
try {
  const summary: Summary = { total: 10, passed: 8, failed: 2 };
  const text = new TextReport();
  const json = new JsonReport();
  const html = new HtmlReport();
  console.log(text.render(summary), "=> expected:", "Total: 10, Passed: 8, Failed: 2");
  console.log(JSON.parse(json.render(summary)), "=> expected:", { total: 10, passed: 8, failed: 2 });
  console.log(
    html.render(summary),
    "=> expected:",
    "<ul><li>Total: 10</li><li>Passed: 8</li><li>Failed: 2</li></ul>",
  );
  console.log(text.fileName("nightly"), "=> expected:", "nightly.txt");
  console.log(json.fileName("nightly"), "=> expected:", "nightly.json");
  console.log(html.fileName("nightly"), "=> expected:", "nightly.html");
  console.log(html instanceof Report, "=> expected:", true);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 2: renderAll ---");
try {
  const summary: Summary = { total: 10, passed: 8, failed: 2 };
  const out = renderAll([new TextReport(), new HtmlReport()], summary);
  console.log(out.length, "=> expected:", 2);
  console.log(out[0], "=> expected:", "Total: 10, Passed: 8, Failed: 2");
  console.log(out[1].startsWith("<ul>"), "=> expected:", true);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 3: Discounts & bestPrice ---");
try {
  console.log(new PercentageDiscount(10).apply(200), "=> expected:", 180);
  console.log(new FixedDiscount(50).apply(200), "=> expected:", 150);
  console.log(new FixedDiscount(500).apply(200), "=> expected:", 0);
  console.log(new NoDiscount().apply(200), "=> expected:", 200);
  console.log(
    bestPrice(200, [new NoDiscount(), new PercentageDiscount(30), new FixedDiscount(50)]),
    "=> expected:",
    140,
  );
  console.log(bestPrice(99, []), "=> expected:", 99);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}
