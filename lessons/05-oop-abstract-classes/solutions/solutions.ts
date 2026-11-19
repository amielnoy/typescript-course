// Lesson 5 – Summary exercises – Solutions
export interface Summary {
  total: number;
  passed: number;
  failed: number;
}

export abstract class Report {
  abstract readonly fileExtension: string;
  abstract render(summary: Summary): string;

  fileName(base: string): string {
    return `${base}.${this.fileExtension}`;
  }
}

export class TextReport extends Report {
  readonly fileExtension = "txt";
  render(s: Summary): string {
    return `Total: ${s.total}, Passed: ${s.passed}, Failed: ${s.failed}`;
  }
}

export class JsonReport extends Report {
  readonly fileExtension = "json";
  render(s: Summary): string {
    return JSON.stringify(s);
  }
}

export class HtmlReport extends Report {
  readonly fileExtension = "html";
  render(s: Summary): string {
    return `<ul><li>Total: ${s.total}</li><li>Passed: ${s.passed}</li><li>Failed: ${s.failed}</li></ul>`;
  }
}

export function renderAll(reports: Report[], summary: Summary): string[] {
  return reports.map((r) => r.render(summary)); // polymorphism – no type checks
}

export abstract class Discount {
  abstract apply(price: number): number;
}

export class PercentageDiscount extends Discount {
  constructor(private percent: number) {
    super();
  }
  apply(price: number): number {
    return price - (price * this.percent) / 100;
  }
}

export class FixedDiscount extends Discount {
  constructor(private amount: number) {
    super();
  }
  apply(price: number): number {
    return Math.max(0, price - this.amount);
  }
}

export class NoDiscount extends Discount {
  apply(price: number): number {
    return price;
  }
}

export function bestPrice(price: number, discounts: Discount[]): number {
  return discounts.reduce((best, d) => Math.min(best, d.apply(price)), price);
}

// ============================================================
// Self-check – run:  npm run solution -- 05
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
