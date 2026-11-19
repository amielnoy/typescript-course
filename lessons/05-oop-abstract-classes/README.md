# שיעור 5 – עקרונות ה-OOP (חלק ג'): Abstract Classes

## נושאים
- abstract class ו-abstract methods – חוזה + קוד משותף
- `protected abstract` ו-Template Method
- BasePage – הבסיס ל-Page Object Model
- מיני-פריימוורק בדיקות: Check, BaseTest, Reporters
- ארבעת עקרונות ה-OOP – תמונה מלאה

## דוגמאות להרצה
- `npx tsx lessons/05-oop-abstract-classes/examples/01-abstract-classes.ts`
- `npx tsx lessons/05-oop-abstract-classes/examples/02-abstract-test-framework.ts`

## תרגילים

### תרגילים לפי נושא
לכל נושא (קובץ ב-`examples/`) יש סט תרגילים משלו – מומלץ לפתור אותו מיד אחרי הדוגמה.
פתחו את הקובץ, השלימו כל `TODO`, ובדקו את עצמכם עם הפקודה שליד.
כל קובץ תרגילים מסתיים בבדיקה עצמית שמדפיסה בכל שורה את התוצאה שלכם מול הערך הצפוי (`=> expected:`) – תרגיל שעוד לא פתרתם יציג `✋ TODO`.

| נושא | קובץ תרגילים | בדיקה |
| --- | --- | --- |
| 01 – Abstract Classes | `exercises/01-abstract-classes.ts` | `npm run exercise -- 05 01` |
| 02 – מיני-פריימוורק בדיקות | `exercises/02-abstract-test-framework.ts` | `npm run exercise -- 05 02` |

### תרגילי סיכום לשיעור
1. פתחו את `exercises/exercises.ts` והשלימו כל `TODO` (מחלקות מופשטות + פולימורפיזם).
2. בדיקה: `npm run exercise -- 05` (מריץ את הקובץ ומדפיס את הבדיקה העצמית שבסופו)

### פתרונות
- פתרון לכל נושא נמצא בקובץ עם אותו שם בתיקייה `solutions/` (למשל `solutions/01-abstract-classes.ts`).
- פתרון תרגילי הסיכום: `solutions/solutions.ts`
- הרצת הפתרונות: `npm run solution -- 05` (תרגילי הסיכום) או לנושא אחד: `npm run solution -- 05 01` – גם בפתרונות יש את אותה בדיקה עצמית בסוף הקובץ
- הרצת כל הפתרונות של הקורס בבת אחת: `npm run solutions`

## שיעורי בית
**Release Gate – בדיקות API ניתנות להרחבה וערוצי התראה.** לפני כל שחרור, צוות ה-QA מריץ "שער שחרור": סט בדיקות API מול שרת staging (מדומה), התוצאות נשלחות לכמה ערוצי התראה (Slack, מייל, זימונית לתורן) והשער מחליט GO או NO-GO.
בונים את כל זה עם `ApiCheck` ו-`AlertChannel` מופשטות, Template Method ו-hooks, ו-runner שעובד רק דרך טיפוסי הבסיס – כך שאפשר להוסיף סוג בדיקה או ערוץ חדש בלי לשנות אותו.

- הקובץ: `exercises/homework.ts` – 7 משימות שנבנות זו על זו (6–7 הן Challenge)
- בדיקה: `npm run exercise -- 05 hw`
- פתרון: `solutions/homework.ts` – הרצה: `npm run solution -- 05 hw`
