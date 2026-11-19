// שיעור 6 – דוגמה 4: interface מול type – מתי להשתמש במה?
// הרצה:  npx tsx lessons/06-interfaces-types-unions/examples/04-interface-vs-type.ts
//
// כלל אצבע:
//   interface – לתיאור צורה של אובייקטים ומחלקות (ניתן להרחיב עם extends ולממש עם implements)
//   type      – ל-union, literal, tuple, פונקציות, ושילובים (&)

// 1) שניהם יכולים לתאר אובייקט:
interface UserI {
  name: string;
}
type UserT = { name: string };

// 2) הרחבה:
interface AdminI extends UserI {
  level: number;
}
type AdminT = UserT & { level: number };

// 3) רק type יכול להיות union / literal:
type Status = "passed" | "failed" | "skipped";
// interface Status = "passed" | "failed";   // ❌ לא אפשרי

// 4) רק interface תומך ב-"declaration merging" (הגדרה בכמה מקומות שמתמזגת):
interface Env {
  baseUrl: string;
}
interface Env {
  apiKey: string;
}
const env: Env = { baseUrl: "http://localhost:3000", apiKey: "xyz" }; // שני השדות נדרשים

// 5) מחלקה יכולה לממש את שניהם (כל עוד ה-type הוא צורת אובייקט):
class Tester implements UserI {
  constructor(public name: string) {}
}
class Lead implements AdminT {
  constructor(
    public name: string,
    public level: number,
  ) {}
}

const a: AdminI = { name: "Avi", level: 2 };
const s: Status = "passed";
console.log({ a, s, env, tester: new Tester("Noa"), lead: new Lead("Dana", 3) });

export {}; // הופך את הקובץ למודול (משתנים לא "מתנגשים" עם קבצים אחרים)
