# שיעור 3 – מבוא ל-OOP: Objects, Constructors, Encapsulation ו-Inheritance

## נושאים
- אובייקטים: שדות ומתודות, destructuring, spread, Object.keys / entries, JSON
- תזכורת: מחלקות ובנאים (constructor, parameter properties)
- public / private / protected / readonly ושדות #
- Getters ו-Setters עם ולידציה
- extends, super, override, protected
- Template Method
- static ו-Factory methods

## לוח זמנים (09:00–16:00)
| שעה | חלק |
| --- | --- |
| 09:00–09:15 | פתיחה ותזכורת משיעור 2 |
| 09:15–10:30 | חלק 1 – אובייקטים |
| 10:30–10:45 | ☕ הפסקה |
| 10:45–11:45 | חלק 2 – Encapsulation |
| 11:45–12:30 | חלק 3 – Getters ו-Setters |
| 12:30–13:15 | 🍽️ הפסקת צהריים |
| 13:15–14:45 | חלק 4 – Inheritance |
| 14:45–15:00 | ☕ הפסקה |
| 15:00–15:40 | חלק 5 – static |
| 15:40–16:00 | סיכום, שאלת סיכום, שאלון "איזה כלי?", שאלות ומה עושים בבית |

בכל חלק: הסבר פשוט ← דוגמאות ← 🤔 "מה יודפס?" ← חימום בכיתה ← תרגילים.

## דוגמאות להרצה
- `npx tsx lessons/03-oop-encapsulation-inheritance/examples/00-recap-lesson-2.ts` (תזכורת משיעור 2 – פתיחת השיעור)
- `npx tsx lessons/03-oop-encapsulation-inheritance/examples/01-objects.ts`
- `npx tsx lessons/03-oop-encapsulation-inheritance/examples/02-access-modifiers.ts`
- `npx tsx lessons/03-oop-encapsulation-inheritance/examples/03-getters-setters.ts`
- `npx tsx lessons/03-oop-encapsulation-inheritance/examples/04-inheritance.ts`
- `npx tsx lessons/03-oop-encapsulation-inheritance/examples/05-static-members.ts`
- `npx tsx lessons/03-oop-encapsulation-inheritance/examples/06-lesson-summary.ts` (שאלת הסיכום – סוף השיעור)

## תרגילים

### תרגילים לפי נושא
לכל דוגמה יש קובץ תרגילים משלו, באותו מספר. מומלץ לפתור אותם לפי הסדר, מיד אחרי שקוראים ומריצים את הדוגמה המתאימה.
פתחו את הקובץ, השלימו כל `TODO`, ובדקו את עצמכם עם הפקודה שליד.
**חימום בכיתה:** בראש כל קובץ תרגילים יש שני תרגילים קצרים – Warm-up A ו-Warm-up B – שפותרים במהלך השיעור, לפני תרגיל 1. הבדיקה העצמית שלהם מודפסת ראשונה.
כל קובץ תרגילים מסתיים בבדיקה עצמית שמדפיסה בכל שורה את התוצאה שלכם מול הערך הצפוי (`=> צפוי:`) – תרגיל שעוד לא פתרתם יציג `✋ TODO`.

| נושא | קובץ תרגילים | בדיקה |
| --- | --- | --- |
| 01 – אובייקטים | `exercises/01-objects.ts` | `npm run exercise -- 03 01` |
| 02 – הרשאות גישה (public / private / readonly / #) | `exercises/02-access-modifiers.ts` | `npm run exercise -- 03 02` |
| 03 – Getters ו-Setters | `exercises/03-getters-setters.ts` | `npm run exercise -- 03 03` |
| 04 – Inheritance (extends, super, override, protected) | `exercises/04-inheritance.ts` | `npm run exercise -- 03 04` |
| 05 – חברים סטטיים ו-Factory methods | `exercises/05-static-members.ts` | `npm run exercise -- 03 05` |

### תרגילי סיכום לשיעור
1. פתחו את `exercises/exercises.ts` והשלימו כל `TODO` (התרגילים משלבים את כל נושאי השיעור).
2. בדיקה: `npm run exercise -- 03` (מריץ את הקובץ ומדפיס את הבדיקה העצמית שבסופו)

### פתרונות
- פתרון לכל נושא נמצא בתיקיית `solutions` באותו שם קובץ (למשל `solutions/03-getters-setters.ts`), ופתרון תרגילי הסיכום ב-`solutions/solutions.ts`.
- הרצת הפתרונות: `npm run solution -- 03` (תרגילי הסיכום) או לנושא אחד: `npm run solution -- 03 03` – גם בפתרונות יש את אותה בדיקה עצמית בסוף הקובץ
- נסו לפתור לבד לפני שמציצים!

## שיעורי בית
**Staging Test Accounts – משתמשי בדיקה, תפקידים ו-registry סטטי.** סוויטת ה-e2e רצה מול סביבת staging משותפת: לפני כל ריצה היא יוצרת חשבונות בדיקה (משתמש רגיל, צופה לקריאה בלבד ואדמין), הבדיקות מתחברות דרכם ובסוף הכול נמחק.
בונים מודול קפדני לניהול החשבונות: היררכיית שגיאות משלו, `TestUser` עם סיסמה בשדה `#` ו-setters עם ולידציה, `Viewer` ו-`Admin` שדורסים הרשאות, ו-`UserRegistry` סטטי עם login, נעילה אחרי 3 ניסיונות כושלים ו-seed של "הכול או כלום".

- הקובץ: `exercises/homework.ts` – 7 משימות שנבנות זו על זו (6–7 הן Challenge)
- בדיקה: `npm run exercise -- 03 hw`
- פתרון: `solutions/homework.ts` – הרצה: `npm run solution -- 03 hw`

### שיעורי בית 2 (גרסה נוספת)
**Checkout Smoke Suite – אובייקטי קונפיגורציה, בדיקות עם מחזור חיים ודוח ל-CI.** לפני כל deploy רצה סוויטת smoke קצרה מול שירות ה-checkout – כמה בדיקות API וכמה בדיקות UI. בונים אותה מחדש כמודול נקי: קונפיגורציה שנבנית עם spread בלי "לדלוף" שינויים (מלכודת ההעתקה הרדודה), `RunContext` ששומר את הטוקן בשדה `#` ומאמת את `retries` ב-setter, `BaseCheck` עם Template Method (`setup` ← ניסיונות עם retry ← `teardown` תמיד), `ApiCheck` ו-`UiCheck` שדורסים רק את ה-hooks, factory methods סטטיים, ו-`SmokeSuite` שמסכם הכול להחלטה GREEN / YELLOW / RED ולדוח JSON בלי הטוקן האמיתי.
הגרסה הזו משלימה את מה שפחות מתורגל בשיעורי הבית הראשונים: חלק 1 (אובייקטים, `Object.entries`, JSON) ו-Template Method.

- הקובץ: `exercises/homework2.ts` – 7 משימות שנבנות זו על זו (6–7 הן Challenge)
- בדיקה: `npm run exercise -- 03 hw2`
- פתרון: `solutions/homework2.ts` – הרצה: `npm run solution -- 03 hw2`
