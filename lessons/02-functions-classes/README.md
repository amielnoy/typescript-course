# שיעור 2 – פונקציות ב-TypeScript

## נושאים
- פונקציות: פרמטרים עם טיפוסים, ערך חזרה, void, פרמטר אופציונלי וברירת מחדל, rest
- Arrow Functions ו-callbacks
- map / filter / find / some / every / reduce / sort
- מחלקות, אובייקטים, constructor, this, parameter properties

## דוגמאות להרצה
- `npx tsx lessons/02-functions-classes/examples/01-functions.ts`
- `npx tsx lessons/02-functions-classes/examples/02-arrow-functions.ts`
- `npx tsx lessons/02-functions-classes/examples/03-classes-constructors.ts`

## תרגילים

### תרגילים לפי נושא
לכל נושא יש קובץ תרגילים משלו (מהקל לקשה, האחרון הוא בונוס). מומלץ לפתור אותו מיד אחרי הדוגמה המתאימה.
בסוף כל קובץ יש בדיקה עצמית שמדפיסה, לכל בדיקה, את התוצאה שלכם ליד התוצאה הצפויה (`=> צפוי:`) – אם הערכים זהים, פתרתם נכון.

| נושא | קובץ תרגילים | הרצה ובדיקה עצמית |
|------|--------------|-------|
| 01 – פונקציות, פרמטרים וערכי חזרה | `exercises/01-functions.ts` | `npm run exercise -- 02 01` |
| 02 – Arrow Functions ופונקציות על מערכים | `exercises/02-arrow-functions.ts` | `npm run exercise -- 02 02` |
| 03 – מחלקות, אובייקטים ובנאים | `exercises/03-classes-constructors.ts` | `npm run exercise -- 02 03` |

### תרגילי סיכום לשיעור
1. פתחו את `exercises/exercises.ts` והשלימו כל `TODO` (תרגילים שמשלבים את כל נושאי השיעור).
2. הרצה ובדיקה עצמית: `npm run exercise -- 02` (התוצאות מודפסות ליד הערכים הצפויים)

### פתרונות
- לכל קובץ תרגילים יש קובץ פתרון באותו שם בתיקייה `solutions/` (למשל `solutions/03-classes-constructors.ts`), ופתרון תרגילי הסיכום נמצא ב-`solutions/solutions.ts`.
- הרצת פתרון: `npm run solution -- 02 03` (פתרון נושא אחד) או `npm run solution -- 02` (פתרון תרגילי הסיכום)

## שיעורי בית
**Test Case Manager** – מיני-פרויקט שמשלב את כל נושאי השיעור: בונים מנהל מקרי בדיקה קטן – יוצרים מקרי בדיקה "נקיים" (פרמטרים עם ברירת מחדל ו-rest), מאמתים אותם עם כללי בדיקה שהם פונקציות (טיפוסי פונקציות), שומרים אותם במחלקה `TestSuite`, מתכננים את הריצה הבאה ומסכמים תוצאות לפי תגית עם מתודות מערך, ובמשימות ה-Challenge – מייצאים ומייבאים סוויטה כ-JSON ומפיקים דוח סטטוס.
המשימות בנויות זו על זו ופחות מודרכות מהתרגילים – פתרו אותן לפי הסדר; שתי האחרונות מסומנות (Challenge).
> משימות 6–7 (Challenge) משתמשות גם באובייקטים ו-JSON, שנלמד בתחילת שיעור 3 – פתרו עכשיו את 1–5 וחזרו ל-6–7 אחרי שיעור 3.

- הקובץ: `exercises/homework.ts`
- הרצה ובדיקה עצמית: `npm run exercise -- 02 hw`
- הפתרון: `solutions/homework.ts` – הרצה: `npm run solution -- 02 hw`
