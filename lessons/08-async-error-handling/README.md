# שיעור 8 – קוד אסינכרוני וטיפול בשגיאות

## נושאים
- Promise: then / catch / finally
- Promise.all / allSettled / race
- async / await, סדרתי מול מקבילי
- try / catch / finally, שגיאות מותאמות, rethrow
- retry ו-timeout
- fetch אמיתי מול שרת ה-Mock

## דוגמאות להרצה
- `npx tsx lessons/08-async-error-handling/examples/01-promises.ts`
- `npx tsx lessons/08-async-error-handling/examples/02-async-await.ts`
- `npx tsx lessons/08-async-error-handling/examples/03-error-handling.ts`
- `npx tsx lessons/08-async-error-handling/examples/04-fetch-real-api.ts`

## תרגילים

### תרגילים לפי נושא
לכל דוגמה ב-`examples/` יש קובץ תרגילים משלו ב-`exercises/` – מומלץ לפתור אותו מיד אחרי הדוגמה.
השלימו כל `TODO` ובדקו את עצמכם עם הפקודה שליד הקובץ.
בסוף כל קובץ יש בדיקה עצמית שמדפיסה, לכל בדיקה, את התוצאה שלכם ליד התוצאה הצפויה (`=> צפוי:`) – אם הערכים זהים, פתרתם נכון.

| נושא | קובץ תרגילים | הרצה ובדיקה עצמית |
| --- | --- | --- |
| 01 – Promise: then / catch / finally, all / allSettled / race | `exercises/01-promises.ts` | `npm run exercise -- 08 01` |
| 02 – async / await: סדרתי מול מקבילי, polling | `exercises/02-async-await.ts` | `npm run exercise -- 08 02` |
| 03 – טיפול בשגיאות: try / catch / finally, שגיאות מותאמות, rethrow | `exercises/03-error-handling.ts` | `npm run exercise -- 08 03` |
| 04 – fetch מול שרת ה-Mock (הבדיקה העצמית מפעילה אותו לבד) | `exercises/04-fetch-real-api.ts` | `npm run exercise -- 08 04` |

### תרגילי סיכום לשיעור
1. פתחו את `exercises/exercises.ts` והשלימו כל `TODO`.
2. הרצה ובדיקה עצמית: `npm run exercise -- 08` (התוצאות מודפסות ליד הערכים הצפויים)

### פתרונות
- פתרון לכל נושא: `solutions/NN-<נושא>.ts` (למשל `solutions/01-promises.ts`), ופתרון תרגילי הסיכום: `solutions/solutions.ts`.
- הרצת פתרון: `npm run solution -- 08 03` (פתרון נושא אחד) או `npm run solution -- 08` (פתרון תרגילי הסיכום)

## שיעורי בית
**תרחיש:** גרסה חדשה של שירות המשתמשים עלתה, ואתם צריכים לתת "פסק דין" smoke מהיר מול שרת ה-Mock: לבנות שכבה אחרי שכבה שגיאות מוקלדות (`HttpError`, `TimeoutError`), פונקציית `request` עם timeout, retry עם backoff, לקוח API מוקלד, זרימת CRUD מלאה (יצירה → קריאה → אימות → מחיקה → אימות 404) עם ניקוי ב-`finally`, ולבסוף הרצת כל הבדיקות במקביל (`Promise.allSettled`) עם דוח עבר/נכשל.

- הקובץ: `exercises/homework.ts` – 7 משימות שנבנות זו על זו (האחרונות מסומנות Challenge). הבדיקה העצמית מפעילה את שרת ה-Mock לבד.
- הרצה ובדיקה עצמית: `npm run exercise -- 08 hw`
- פתרון: `solutions/homework.ts` – הרצה: `npm run solution -- 08 hw`
