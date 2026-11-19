# שיעור 4 – עקרונות ה-OOP (חלקים א'+ב') ופולימורפיזם

## נושאים
- חזרה והעמקה – Encapsulation: `private` / `readonly` / `#`, getters ו-setters עם ולידציה
- חזרה והעמקה – Inheritance: `extends`, `super(...)`, `super.method()`, `override`, `protected`
- פולימורפיזם – אותה קריאה, התנהגות שונה
- מערך מסוג מחלקת הבסיס, `instanceof`
- מתודה במחלקת הבסיס שקוראת למתודה שהבת דורסת

## דוגמאות להרצה
- `npx tsx lessons/04-oop-polymorphism/examples/01-polymorphism.ts`
- לחזרה על Encapsulation ו-Inheritance – הדוגמאות של שיעור 3: `lessons/03-oop-encapsulation-inheritance/examples/` (02–04)

## תרגילים

### תרגילים לפי נושא
פתחו את הקובץ, השלימו כל `TODO`, ובדקו את עצמכם עם הפקודה שליד.
כל קובץ תרגילים מסתיים בבדיקה עצמית שמדפיסה בכל שורה את התוצאה שלכם מול הערך הצפוי (`=> expected:`) – תרגיל שעוד לא פתרתם יציג `✋ TODO`.

| נושא | קובץ תרגילים | בדיקה |
| --- | --- | --- |
| 01 – Polymorphism | `exercises/01-polymorphism.ts` | `npm run exercise -- 04 01` |

### תרגילי סיכום לשיעור
1. פתחו את `exercises/exercises.ts` והשלימו כל `TODO`:
   - תרגילים 1–2 – **חזרה** על Encapsulation ו-Inheritance (`Environment` עם setter שמאמת ומנרמל, היררכיית `HttpRequest` עם `super.describe()`) – פותרים אחרי חלק החזרה בשיעור
   - תרגילים 3–4 – **פולימורפיזם** (צעדי תרחיש על `FakePage`, וחוות מכשירים שמשלבת את שלושת העקרונות)
2. בדיקה: `npm run exercise -- 04` (מריץ את הקובץ ומדפיס את הבדיקה העצמית שבסופו)

### פתרונות
- פתרון לכל נושא נמצא בקובץ עם אותו שם בתיקייה `solutions/` (למשל `solutions/01-polymorphism.ts`).
- פתרון תרגילי הסיכום: `solutions/solutions.ts`
- הרצת הפתרונות: `npm run solution -- 04` (תרגילי הסיכום) או לנושא אחד: `npm run solution -- 04 01` – גם בפתרונות יש את אותה בדיקה עצמית בסוף הקובץ
- הרצת כל הפתרונות של הקורס בבת אחת: `npm run solutions`

## שיעורי בית
**Form Robot – שדות שממלאים, מאמתים ומתארים את עצמם.** סוויטת ה-e2e ממלאת טופסי הרשמה ארוכים, וכל בדיקה חזרה על אותו קוד: לקצץ רווחים, להקטין אותיות במייל, להסתיר את הסיסמה בלוג, לסמן checkbox, לבחור אפשרות מרשימה – ו-if/else אחר לכל סוג שדה.
בונים "רובוט טפסים": `UiField` עם מצב בשדות `#` ו-getters, תת-מחלקות (`TextField`, `EmailField`, `PasswordField`, `Checkbox`, `Dropdown`) שדורסות רק את מה ששונה ומשתמשות ב-`super`, ו-`Form` שעובד **רק** דרך טיפוס הבסיס – ממלא, אוסף שגיאות ומפיק דוח, בלי `instanceof`.

- הקובץ: `exercises/homework.ts` – 7 משימות שנבנות זו על זו (7 היא Challenge)
- בדיקה: `npm run exercise -- 04 hw`
- פתרון: `solutions/homework.ts` – הרצה: `npm run solution -- 04 hw`
