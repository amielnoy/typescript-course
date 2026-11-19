# שיעור 6 – ממשקים וטיפוסים מותאמים

## נושאים
- interface: שדות אופציונליים, readonly, extends, implements
- type alias, literal types, intersection (&), tuple
- Utility types: Partial, Pick, Omit, Readonly, Record
- Union types ו-Narrowing (typeof, in, Array.isArray)
- Discriminated unions ו-exhaustiveness check
- Type guards
- interface מול type

## דוגמאות להרצה
- `npx tsx lessons/06-interfaces-types-unions/examples/01-interfaces.ts`
- `npx tsx lessons/06-interfaces-types-unions/examples/02-type-aliases.ts`
- `npx tsx lessons/06-interfaces-types-unions/examples/03-union-types-narrowing.ts`
- `npx tsx lessons/06-interfaces-types-unions/examples/04-interface-vs-type.ts`

## תרגילים

### תרגילים לפי נושא
לכל דוגמה יש קובץ תרגילים משלו, שמתמקד רק בנושא שלה. מומלץ לפתור אותם לפי הסדר, מיד אחרי הדוגמה המתאימה.
כל קובץ תרגילים (וכל קובץ פתרונות) מסתיים בבדיקה עצמית שמדפיסה, לכל בדיקה, את התוצאה שלכם לצד הערך הצפוי – ותרגיל שעוד לא השלמתם יסומן ב-`✋ TODO`.

| נושא | קובץ תרגילים | הרצה ובדיקה |
| --- | --- | --- |
| 01 – Interfaces | `exercises/01-interfaces.ts` | `npm run exercise -- 06 01` |
| 02 – Type Aliases | `exercises/02-type-aliases.ts` | `npm run exercise -- 06 02` |
| 03 – Union Types ו-Narrowing | `exercises/03-union-types-narrowing.ts` | `npm run exercise -- 06 03` |
| 04 – interface מול type | `exercises/04-interface-vs-type.ts` | `npm run exercise -- 06 04` |

### תרגילי סיכום לשיעור
1. פתחו את `exercises/exercises.ts` והשלימו כל `TODO`.
2. הרצה ובדיקה: `npm run exercise -- 06`  (הבדיקה העצמית בסוף הקובץ מדפיסה תוצאה מול ערך צפוי)

### פתרונות
- פתרונות לפי נושא: `solutions/01-interfaces.ts` … `solutions/04-interface-vs-type.ts`
  (הרצת פתרון לנושא אחד: `npm run solution -- 06 01`)
- פתרונות תרגילי הסיכום: `solutions/solutions.ts`  (הרצה: `npm run solution -- 06`)
- הרצת כל קובצי הפתרונות בקורס: `npm run solutions`

## שיעורי בית
**מבדק חוזים ל-API (API Contract Checker)** – מיני-פרויקט שמחבר את כל נושאי השיעור: קריאות שהוקלטו מ-Users API מגיעות כ-JSON "לא ידוע" (unknown), ואתם בונים שכבת בדיקה שמסננת אותן עם type guards, ממיינת אותן ל-discriminated union (הצלחה / שגיאת ולידציה / שגיאת שרת / הפרת חוזה), בודקת כללים עסקיים במחלקה שמממשת interface – ומפיקה דוח PASS/FAIL אחד.
הטיפוסים כבר מוגדרים בקובץ; אתם כותבים את קוד הריצה. המשימות בונות זו על זו – פתרו לפי הסדר (שתי האחרונות הן אתגר).

- קובץ: `exercises/homework.ts`
- הרצה ובדיקה: `npm run exercise -- 06 hw`  (הבדיקה העצמית בסוף הקובץ מדפיסה תוצאה מול ערך צפוי)
- פתרון: `solutions/homework.ts`  (הרצה: `npm run solution -- 06 hw`)
