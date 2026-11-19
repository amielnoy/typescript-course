// שיעור 6 – דוגמה 3: Union Types ו-Narrowing (צמצום טיפוס)
// הרצה:  npx tsx lessons/06-interfaces-types-unions/examples/03-union-types-narrowing.ts

// ---------- Union בסיסי: "זה או זה" ----------
type Id = string | number;

function normalizeId(id: Id): string {
  // narrowing עם typeof: בתוך ה-if, TS יודע בדיוק מה הטיפוס
  if (typeof id === "number") {
    return `ID-${id.toFixed(0)}`; // כאן id הוא number
  }
  return id.toUpperCase(); // כאן id הוא string
}
console.log(normalizeId(42), normalizeId("tc-7"));

// ---------- Union עם null ----------
function findUserName(id: number): string | null {
  return id === 1 ? "Dana" : null;
}
const name = findUserName(2);
console.log(name?.toUpperCase() ?? "user not found");

// ---------- Narrowing עם Array.isArray ו-in ----------
function countItems(input: string | string[]): number {
  return Array.isArray(input) ? input.length : 1;
}
console.log(countItems("one"), countItems(["a", "b", "c"]));

type Cat = { meow: () => string };
type Dog = { bark: () => string };
function speak(animal: Cat | Dog): string {
  return "meow" in animal ? animal.meow() : animal.bark();
}
console.log(speak({ bark: () => "woof" }));

// ---------- Discriminated Union – הדפוס החשוב ביותר! ----------
// לכל אפשרות יש שדה משותף (כאן: kind) עם ערך קבוע שמזהה אותה.
type ApiResult =
  | { kind: "success"; status: 200 | 201; data: { id: number; name: string } }
  | { kind: "client-error"; status: 400 | 401 | 404; message: string }
  | { kind: "network-error"; reason: string };

function describe(result: ApiResult): string {
  switch (result.kind) {
    case "success":
      return `✔ ${result.status}: got user ${result.data.name}`; // רק כאן יש data
    case "client-error":
      return `⚠ ${result.status}: ${result.message}`;
    case "network-error":
      return `✘ network: ${result.reason}`;
    default: {
      // Exhaustiveness check: אם מישהו יוסיף kind חדש ולא יטפל בו – שגיאת קומפילציה
      const never: never = result;
      return never;
    }
  }
}

const samples: ApiResult[] = [
  { kind: "success", status: 200, data: { id: 1, name: "Dana" } },
  { kind: "client-error", status: 404, message: "User not found" },
  { kind: "network-error", reason: "ECONNREFUSED" },
];
samples.forEach((s) => console.log(describe(s)));

// ---------- Type guard מותאם אישית ----------
interface TestFailure {
  test: string;
  error: string;
}
function isFailure(value: unknown): value is TestFailure {
  return typeof value === "object" && value !== null && "test" in value && "error" in value;
}
const fromReport: unknown = JSON.parse('{"test":"login","error":"timeout"}');
if (isFailure(fromReport)) {
  console.log(`Failure in ${fromReport.test}: ${fromReport.error}`); // TS יודע שזה TestFailure
}

export {}; // הופך את הקובץ למודול (משתנים לא "מתנגשים" עם קבצים אחרים)
