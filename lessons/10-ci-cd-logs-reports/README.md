# שיעור 10 – תחקור בדיקות וניתוח תוצאות + עולם ה-CI/CD

## נושאים
- Logger עם רמות, timestamps ו-context
- Reporters: spec / tap / junit
- איסוף ראיות בכישלון: Screenshot, HTML, Response, Log
- Mini test runner שמייצר HTML, JUnit, JSON ו-GitHub Step Summary
- מושגים: CI, Continuous Delivery/Deployment, Pipeline, Artifacts, Exit codes

## דוגמאות להרצה
- `npx tsx lessons/10-ci-cd-logs-reports/examples/01-logger.ts`
- `npx tsx lessons/10-ci-cd-logs-reports/examples/02-built-in-reporters.ts`
- `npx tsx lessons/10-ci-cd-logs-reports/examples/03-evidence-on-failure.ts`
- `npx tsx lessons/10-ci-cd-logs-reports/examples/04-mini-runner-with-reports.ts`

## תרגילים

### תרגילים לפי נושא
לכל דוגמה יש קובץ תרגילים משלו (מהקל לקשה, האחרון בונוס). מומלץ לפתור אותם אחרי שמריצים את הדוגמה המתאימה.
בסוף כל קובץ תרגילים יש "בדיקה עצמית" שמדפיסה בכל שורה את התוצאה שלכם מול הערך הצפוי (`✋ TODO` = תרגיל שעוד לא פתרתם):

| נושא | קובץ | הרצה |
|---|---|---|
| 01 – Logger: רמות, פורמט, הקשר, סינון והסתרת סודות | `exercises/01-logger.ts` | `npm run exercise -- 10 01` |
| 02 – Reporters: spec, TAP ו-JUnit (הפקה ופענוח) | `exercises/02-built-in-reporters.ts` | `npm run exercise -- 10 02` |
| 03 – ראיות בכישלון: מתי לצלם, תמונת מצב, תשובות API, attachments | `exercises/03-evidence-on-failure.ts` | `npm run exercise -- 10 03` |
| 04 – Mini Runner: exit code, בדיקות איטיות, סטטיסטיקה לפי tag, HTML, Flaky | `exercises/04-mini-runner-with-reports.ts` | `npm run exercise -- 10 04` |

### תרגילי סיכום השיעור
1. פתחו את `exercises/exercises.ts` והשלימו כל `TODO` – תרגילים שמשלבים את כל נושאי השיעור.
2. הריצו את הקובץ עם הבדיקה העצמית שבסופו: `npm run exercise -- 10`

### פתרונות
- לכל קובץ תרגילים יש פתרון באותו שם בתיקייה `solutions/` (למשל `solutions/01-logger.ts`), ותרגילי הסיכום ב-`solutions/solutions.ts`.
- הרצת פתרון עם הבדיקה העצמית: `npm run solution -- 10 03` (נושא אחד) או `npm run solution -- 10` (תרגילי הסיכום).
- הרצת כל הפתרונות בכל הקורס: `npm run solutions`

## שיעורי בית
**Night-Shift Triage – מה נשבר בריצת ה-CI של הלילה?** ריצת ה-regression הלילית נכשלה, ואתם ה-QA התורנים: מתוך הלוג הגולמי, דוח ה-JUnit ופלט ה-TAP של שני הלילות הקודמים – מאתרים כל כישלון והראיות שלו, מסווגים אותו (באג במוצר / באג בבדיקה / תקלת סביבה / flaky), מחליטים על exit code לפי quality gate, ומפיקים סיכום Markdown ל-`$GITHUB_STEP_SUMMARY`.
- הקובץ: `exercises/homework.ts` (7 משימות שנבנות זו על זו, האחרונה – Challenge)
- בדיקה עצמית: `npm run exercise -- 10 hw`
- פתרון: `solutions/homework.ts` – הרצה: `npm run solution -- 10 hw`

## מושגי CI/CD בקצרה
- **CI – Continuous Integration:** כל שינוי שנדחף נבנה ונבדק אוטומטית, כדי לגלות תקלות מוקדם.
- **Continuous Delivery:** כל גרסה שעברה את הבדיקות מוכנה לשחרור בלחיצת כפתור.
- **Continuous Deployment:** גרסה שעברה את כל הבדיקות עולה לייצור אוטומטית.
- **Pipeline:** רצף שלבים (build → test → report → deploy). שלב שנכשל (exit code ≠ 0) עוצר את ה-Pipeline.
- **Artifact:** קובץ שנשמר מהריצה – דוח, צילום מסך, לוג.
- **Runner:** המכונה שמריצה את ה-Pipeline.
