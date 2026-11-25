// שיעור 6 – דוגמה 4: interface מול type – מתי להשתמש במה?
// הרצה:  npx tsx lessons/06-interfaces-types-unions/examples/04-interface-vs-type.ts
//
// כלל אצבע:
//   interface – לתיאור צורה של אובייקטים ומחלקות (ניתן להרחיב עם extends ולממש עם implements)
//   type      – ל-union, literal, tuple, פונקציות, ושילובים (&)

// 1) שניהם יכולים לתאר אובייקט:
interface ShopperI {
  name: string;
}
type ShopperT = { name: string };

// 2) הרחבה:
interface VipI extends ShopperI {
  tier: number;
}
type VipT = ShopperT & { tier: number };

const x: VipI = { name: "Noa", tier: 2 };
const y: VipT = x; // ✅ אותה צורה = תואמים
console.log(y);

// 3) רק type יכול להיות union / literal:
type Tier = "basic" | "gold" | "platinum";
// interface Tier = "basic" | "gold";   // ❌ לא אפשרי

// 4) רק interface תומך ב-"declaration merging" (הגדרה בכמה מקומות שמתמזגת):
interface RunConfig {
  baseUrl: string;
}
interface RunConfig {
  locale: string;
}
const config: RunConfig = { baseUrl: "https://staging.shop.dev", locale: "he-IL" }; // שני השדות נדרשים
console.log(config);

// 5) מחלקה יכולה לממש את שניהם (כל עוד ה-type הוא צורת אובייקט):
class Shopper implements ShopperI {
  constructor(public name: string) {}
}
class VipShopper implements VipT {
  constructor(
    public name: string,
    public tier: number,
  ) {}
}

const t: Tier = "gold";
console.log({ t, shopper: new Shopper("Omer"), vip: new VipShopper("Noa", 3) });

export {}; // הופך את הקובץ למודול (משתנים לא "מתנגשים" עם קבצים אחרים)
