# שיעור 1 – מבוא, סביבת עבודה, טיפוסים ואופרטורים, זרימת תוכנית

## נושאים
- TypeScript מול JavaScript, קומפילציה, tsc ו-tsx
- let / const, string, number, boolean, array, object, enum, any/unknown
- אופרטורים: אריתמטיים, השוואה (===), לוגיים, טרנרי, ?? ו-?.
- תנאים: if / else / switch
- לולאות: for, for...of, for...in, while, do...while, break/continue
- Node.js ו-NPM: package.json, scripts, npx, process.argv, משתני סביבה

## דוגמאות להרצה
- `npx tsx lessons/01-intro-types-flow/examples/01-hello-typescript.ts`
- `npx tsx lessons/01-intro-types-flow/examples/02-variables-and-types.ts`
- `npx tsx lessons/01-intro-types-flow/examples/03-operators.ts`
- `npx tsx lessons/01-intro-types-flow/examples/04-conditions.ts`
- `npx tsx lessons/01-intro-types-flow/examples/05-loops.ts`
- `npx tsx lessons/01-intro-types-flow/examples/06-node-and-npm.ts`

## תרגילים

### תרגילים לפי נושא
לכל נושא יש קובץ תרגילים משלו, שמשתמש רק במה שנלמד עד אותו נושא. מומלץ לפתור אותו מיד אחרי הדוגמה המתאימה.
פתחו את הקובץ, השלימו כל `TODO`, והריצו אותו.
בסוף כל קובץ יש בדיקה עצמית שמדפיסה, לכל בדיקה, את התוצאה שלכם ליד הערך הצפוי (`=> צפוי:`) – אם שני הצדדים זהים, פתרתם נכון; תרגיל שעוד לא הושלם יציג `✋ TODO`.

| נושא | קובץ תרגילים | הרצה ובדיקה עצמית |
| --- | --- | --- |
| 01 – שלום TypeScript | `exercises/01-hello-typescript.ts` | `npm run exercise -- 01 01` |
| 02 – משתנים וטיפוסים | `exercises/02-variables-and-types.ts` | `npm run exercise -- 01 02` |
| 03 – אופרטורים | `exercises/03-operators.ts` | `npm run exercise -- 01 03` |
| 04 – תנאים | `exercises/04-conditions.ts` | `npm run exercise -- 01 04` |
| 05 – לולאות | `exercises/05-loops.ts` | `npm run exercise -- 01 05` |
| 06 – Node.js ו-NPM | `exercises/06-node-and-npm.ts` | `npm run exercise -- 01 06` |

### תרגילי סיכום השיעור
1. פתחו את `exercises/exercises.ts` והשלימו כל `TODO` (תרגילים שמשלבים את כל נושאי השיעור).
2. הרצה ובדיקה עצמית: `npm run exercise -- 01`

### פתרונות
- הפתרונות נמצאים בתיקייה `solutions/` באותם שמות קבצים (למשל `solutions/03-operators.ts`, ולסיכום `solutions/solutions.ts`).
- הרצת הפתרון של נושא אחד (כולל הבדיקה העצמית): `npm run solution -- 01 03`
- הרצת הפתרון של תרגילי הסיכום: `npm run solution -- 01`

## שיעורי בית
**Nightly Run Analyzer** – מיני-פרויקט שמשלב את כל נושאי השיעור: כותבים כלי קטן שמנתח את תוצאות ריצת הרגרסיה הלילית – קורא אפשרויות מ-argv וממשתני סביבה, מסווג כל תוצאה (עבר / flaky / נכשל / דולג), מחשב סטטיסטיקות, מאתר בדיקות איטיות וכישלונות, ובסוף בונה את דוח הבוקר עם החלטת שחרור (GREEN / YELLOW / RED).
המשימות בנויות זו על זו ופחות מודרכות מהתרגילים – פתרו אותן לפי הסדר; שתי האחרונות מסומנות (Challenge).

- הקובץ: `exercises/homework.ts`
- הרצה ובדיקה עצמית: `npm run exercise -- 01 hw`
- הפתרון: `solutions/homework.ts` – הרצה: `npm run solution -- 01 hw`

### שיעורי בית 2 (גרסה נוספת)
**Bug Triage Board** – מיני-פרויקט נוסף על אותם נושאים, בלי argv ומשתני סביבה: כותבים כלי שמסדר את לוח הבאגים לקראת שחרור – מנרמל את החומרה שהמדווח הקליד, נותן לכל באג עדיפות (P1–P4), מסכם את הלוח ואת אחוז הבאגים שנפתחו מחדש, מאתר חריגות SLA ובאגים כפולים, ובוחר את הבאג הבא לתיקון.
גם כאן המשימות בנויות זו על זו; שתי האחרונות מסומנות (Challenge).

- הקובץ: `exercises/homework2.ts`
- הרצה ובדיקה עצמית: `npm run exercise -- 01 hw2`
- הפתרון: `solutions/homework2.ts` – הרצה: `npm run solution -- 01 hw2`
