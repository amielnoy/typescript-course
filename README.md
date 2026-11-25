# קורס TypeScript · Git/GitHub · CI/CD לבודקי תוכנה

פרויקט התרגול של הקורס. בכל שיעור יש תיקייה עם **דוגמאות שאפשר להריץ**, **תרגילים עם בדיקה עצמית** ו**פתרונות**.
קובצי ההרצאה (PDF) נמצאים בתיקייה `lectures/`, ומקורות ה-HTML שלהם (לעריכה) ב-`lectures/src/`.

## קובצי ההרצאה (lectures/)
| # | תאריך | יום ושעות | מיקום | נושא | קובץ |
|---|---|---|---|---|---|
| 1 | 13.11 | ו' 09:00–14:00 | ZOOM | מבוא וסביבת עבודה, משתנים, טיפוסים ואופרטורים, זרימת תוכנית | `01-intro-types-flow.pdf` |
| 2 | 17.11 | ג' 09:00–11:30 | ZOOM | פונקציות ב-TypeScript: Functions, Arrow Functions, פרמטרים וערכי חזרה, Classes | `02-functions-classes.pdf` |
| 3 | 19.11 | ה' 09:00–16:00 | ZOOM | מבוא ל-OOP: Objects, Constructors, Encapsulation, Inheritance | `03-oop-encapsulation-inheritance.pdf` |
| 4 | 20.11 | ו' 09:00–14:00 | ZOOM | עקרונות ה-OOP (חלקים א'+ב') ופולימורפיזם | `04-oop-polymorphism.pdf` |
| 5 | 24.11 | ג' 09:00–11:30 | ZOOM | עקרונות ה-OOP (חלק ג'): Abstract Classes | `05-oop-abstract-classes.pdf` |
| 6 | 26.11 | ה' 09:00–12:30 | ZOOM | ממשקים וטיפוסים מותאמים: Interfaces, Type Aliases, Union Types | `06-interfaces-types-unions.pdf` |
| 7 | 26.11 | ה' 12:30–16:00 | ZOOM | Generics (נושאים 01–02). התרגול המסכם (נושא 03) עבר לחזרה ב-3.12 | `07-generics-oop-summary.pdf` |
| 8 | 27.11 | ו' 09:00–14:00 | ZOOM | קוד אסינכרוני וטיפול בשגיאות: Promise, Async/Await, Error Handling | `08-async-error-handling.pdf` |
| מבחן | 3.12 | ה' 09:00–12:00 חזרה · 12:30–14:30 מבחן | ZOOM | חזרה למבחן (כולל תרגול OOP מסכם משיעור 7), ואחריה מבחן | `12-exam-review.pdf` |
| 9 | ייקבע | | ZOOM | קונפיגורציה וניהול גרסאות: Git ו-GitHub | `09-git-github.pdf` |
| 10 | 1.1 | | ZOOM | תחקור בדיקות וניתוח תוצאות + עולם ה-CI/CD | `10-ci-cd-logs-reports.pdf` |
| 11 | 5.1 | | פרונטלי | הרצה אוטומטית ודוחות (GitHub Actions, Allure) | `11-ci-pipeline-reports.pdf` |

## התקנה (פעם אחת)
> מדריך מלא צעד-אחר-צעד ל-Windows / macOS / Linux, כולל פתרון תקלות: **[INSTALL.md](INSTALL.md)**

1. התקינו [Node.js](https://nodejs.org) גרסה 22 ומעלה (LTS) – **npm מותקן יחד איתו**.
2. התקינו [Git](https://git-scm.com) (ב-Windows הוא כולל גם את Git Bash).
3. התקינו את [VS Code](https://code.visualstudio.com), פתחו בו את תיקיית הפרויקט ואשרו את התקנת **התוספים המומלצים**.
4. בטרמינל, בתיקיית הפרויקט:
   ```bash
   npm install
   npm run check-setup
   ```

## מבנה הפרויקט
```
lessons/
  01-intro-types-flow/                 מבוא, סביבת עבודה, טיפוסים, אופרטורים, תנאים ולולאות, Node/NPM
  02-functions-classes/                פונקציות, Arrow Functions, פרמטרים וערכי חזרה, מחלקות ובנאים
  03-oop-encapsulation-inheritance/    אובייקטים, Encapsulation, Getters/Setters, Inheritance, static
  04-oop-polymorphism/                 חזרה על Encapsulation ו-Inheritance + Polymorphism
  05-oop-abstract-classes/             Abstract Classes, מיני-פריימוורק בדיקות
  06-interfaces-types-unions/          Interfaces, Type Aliases, Union Types, Narrowing
  07-generics-oop-summary/             Generics ותרגול OOP מסכם
  08-async-error-handling/             Promise, async/await, טיפול בשגיאות, fetch
  09-git-github/                       Repository, Commit, Branch, Merge, Pull Request
  10-ci-cd-logs-reports/               לוגים, צילומי מסך, דוחות + מושגי CI/CD
  11-ci-pipeline-reports/              GitHub Actions, הרצה אוטומטית, Playwright + Allure
     └─ playwright-project/            פרויקט Playwright קטן שרץ ב-CI

  כל שיעור:
    examples/    דוגמאות להרצה
    exercises/   תרגילים לכל נושא (NN-<נושא>.ts, תואם לדוגמה examples/NN-<נושא>.ts)
                 + תרגיל מסכם לשיעור (exercises.ts); בסוף כל קובץ – בדיקה עצמית שמדפיסה תוצאה מול ערך צפוי
    solutions/   פתרונות (אותם שמות קבצים)

review/examples/       דוגמאות החזרה למבחן (שיעורים 1–8), אחת לכל חלק במצגת 12-exam-review
lectures/              מצגות ההרצאות (PDF) + lectures/src/ – מקורות HTML לעריכה
shared/mock-api/       שרת REST מקומי שמשמש כ"מערכת תחת בדיקה" – אין צורך באינטרנט
.github/workflows/     ה-CI של הפרויקט עצמו
```

## פקודות
| פקודה | מה היא עושה |
|---|---|
| `npx tsx <file.ts>` | מריץ קובץ דוגמה, למשל `npx tsx lessons/02-functions-classes/examples/01-functions.ts` |
| `npm run exercise -- 03 02` | מריץ את התרגילים של נושא 02 בשיעור 3 ומדפיס תוצאה מול ערך צפוי |
| `npm run exercise -- 03` | מריץ את התרגיל המסכם של שיעור 3 (`exercises.ts`) |
| `npm run exercise -- 03 hw` | מריץ את שיעורי הבית של שיעור 3 (`homework.ts`) |
| `npm run solution -- 03 02` | מריץ את קובץ הפתרון המתאים |
| `npm run solutions` | מריץ את כל קובצי הפתרונות (smoke test) |
| `npm run check-setup` | בודק שסביבת העבודה מותקנת (Node, npm, Git, VS Code, node_modules) |
| `npm run typecheck` | בדיקת טיפוסים (tsc) לכל הפרויקט |
| `npm run examples` | מריץ את כל הדוגמאות (smoke test) |
| `npm run mock-api` | מפעיל את שרת ה-Mock על http://127.0.0.1:3000 (לבדיקה עם Postman/דפדפן) |
| `npm run lectures` | בונה מחדש את קובצי ה-PDF של ההרצאות מ-`lectures/src/` (או `npm run lectures -- 03` להרצאה אחת; דורש Chrome) |
| `npm run report` | מריץ בדיקות API ומייצר דוח HTML/JUnit ב-`reports/mini-runner/` |
| `npm run ci` | כל ה-Pipeline מקומית |

## איך עובדים עם התרגילים
1. אחרי כל נושא (כל קובץ ב-`examples/`) פותחים את קובץ התרגילים של אותו נושא: `lessons/XX-.../exercises/NN-<נושא>.ts`.
2. ממלאים את הקוד במקום `throw new Error("TODO")`.
3. מריצים `npm run exercise -- XX NN`. בסוף הקובץ יש **בדיקה עצמית** שמדפיסה לכל תרגיל שורות בצורה
   `<התוצאה שלכם> => צפוי: <הערך הנכון>` – ממשיכים עד ששני הצדדים זהים בכל השורות.
   תרגיל שעוד לא פתרתם מסומן ב-`✋ TODO`.
4. בסוף השיעור פותרים את התרגיל המסכם `exercises/exercises.ts` ומריצים `npm run exercise -- XX`.
5. **שיעורי בית:** פרויקט קטן שמשלב את כל נושאי השיעור – `exercises/homework.ts`, מריצים `npm run exercise -- XX hw`.
6. רק אחרי ניסיון אמיתי – משווים לפתרון ב-`solutions/` (אותו שם קובץ).

> בשיעור 9 (Git) התרגילים לכל נושא הם קובצי `NN-<נושא>.md` שנבדקים עם `verify-NN-<נושא>.sh` (והתרגיל המסכם עם `verify-repo.sh`).
> בשיעור 11 – נושאים 01–02 הם תרגילי TypeScript, ונושאים 03–07 הם קובצי YAML עם רשימת תיוג לבדיקה עצמית בסוף הקובץ.

## Windows
כל פקודות `npm` עובדות כרגיל. את קובצי ה-`.sh` של שיעור 9 מריצים ב-**Git Bash** (מותקן עם Git for Windows).
