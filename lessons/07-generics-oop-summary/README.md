# שיעור 7 – Generics ותרגול OOP מסכם

## נושאים
- פונקציות גנריות <T>
- ממשקים ומחלקות גנריים: ApiResponse<T>, Queue<T>
- Constraints: T extends ..., keyof
- Repository<T> גנרי
- מיני-תשתית בדיקות API שמשלבת את כל עקרונות ה-OOP

## דוגמאות להרצה
- `npx tsx lessons/07-generics-oop-summary/examples/01-generic-functions.ts`
- `npx tsx lessons/07-generics-oop-summary/examples/02-generic-interfaces-classes.ts`
- `npx tsx lessons/07-generics-oop-summary/examples/03-oop-summary-mini-framework.ts`

## תרגילים

### תרגילים לפי נושא
לכל דוגמה יש קובץ תרגילים משלה (באותו מספר). מומלץ לפתור אותו מיד אחרי שעוברים על הדוגמה.
בסוף כל קובץ תרגילים יש "בדיקה עצמית" שמדפיסה, בכל שורה, את התוצאה שלכם מול הערך הצפוי (`=> צפוי:`) – תרגיל שעוד לא פתרתם מסומן ב-`✋ TODO`.

| נושא | קובץ תרגילים | הרצה ובדיקה עצמית |
| --- | --- | --- |
| 01 – פונקציות גנריות | `exercises/01-generic-functions.ts` | `npm run exercise -- 07 01` |
| 02 – ממשקים ומחלקות גנריים | `exercises/02-generic-interfaces-classes.ts` | `npm run exercise -- 07 02` |
| 03 – OOP מסכם: מיני תשתית בדיקות API | `exercises/03-oop-summary-mini-framework.ts` | `npm run exercise -- 07 03` |

### תרגילי סיכום לשיעור
1. פתחו את `exercises/exercises.ts` והשלימו כל `TODO`.
2. הרצה ובדיקה עצמית: `npm run exercise -- 07` (מריץ את `exercises/exercises.ts` ומדפיס את הבדיקה העצמית שבסופו)

### פתרונות
- `solutions/` – פתרון לכל קובץ תרגילים באותו שם (למשל `solutions/01-generic-functions.ts`), ופתרון תרגילי הסיכום ב-`solutions/solutions.ts`.
- הרצת פתרון של נושא אחד (עם אותה בדיקה עצמית): `npm run solution -- 07 01`
- הרצת פתרון תרגילי הסיכום: `npm run solution -- 07`
- הרצת כל הפתרונות בכל השיעורים: `npm run solutions`

## שיעורי בית
מיני-פרויקט מסכם: בונים שכבת נתוני בדיקה טיפוסית ל-Bug Tracker – פונקציות גנריות למיון וספירה, `EntityStore<T>` שמחלק מזהים ומגן על הנתונים, `Factory<T>` לנתונים ממוספרים, כללי ולידציה (מחלקה אבסטרקטית `FieldRule<T, K>` ויורשות), `ValidatedStore<T>` שדוחה נתונים לא תקינים, ובאתגר – `withFixtures` שמנקה אחרי כל בדיקה ודוח איכות נתונים (`audit`). המשימות נבנות זו על זו ומשלבות את כל עקרונות ה-OOP מהשיעורים 3–7 יחד עם Generics.

- הקובץ: `exercises/homework.ts` (7 משימות, האחרונות מסומנות Challenge)
- הרצה ובדיקה עצמית: `npm run exercise -- 07 hw`
- פתרון: `solutions/homework.ts` – הרצה: `npm run solution -- 07 hw`
