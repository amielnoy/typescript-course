# שיעור 11 – הרצה אוטומטית ודוחות (GitHub Actions)

## נושאים
- מבנה Workflow: on, jobs, steps, runs-on, uses/run
- Matrix, needs, concurrency, cache
- Artifacts ו-if: always()
- Secrets, Variables, Environments
- schedule (cron) ו-workflow_dispatch עם inputs
- Playwright ב-CI + Allure 2 + GitHub Pages

## דוגמאות להרצה
- `npx tsx lessons/11-ci-pipeline-reports/examples/01-local-pipeline.ts`
- `npx tsx lessons/11-ci-pipeline-reports/examples/02-workflow-inspector.ts`

## תרגילים

### תרגילים לפי נושא
לכל דוגמה יש קובץ תרגילים משלה. השלימו כל `TODO` ובדקו רק את הנושא שעבדתם עליו:

| # | נושא | קובץ תרגילים | בדיקה עצמית |
|---|------|--------------|-------------|
| 01 | Pipeline מקומי (`examples/01-local-pipeline.ts`) | `exercises/01-local-pipeline.ts` | `npm run exercise -- 11 01` |
| 02 | קריאת קובצי Workflow (`examples/02-workflow-inspector.ts`) | `exercises/02-workflow-inspector.ts` | `npm run exercise -- 11 02` |
| 03 | Hello Actions – triggers, env, run/uses, outputs (`workflows/01-hello-actions.yml`) | `exercises/03-hello-actions.yml` | רשימת תיוג בסוף הקובץ + `solutions/03-hello-actions.yml` |
| 04 | Matrix, include/exclude, cache, needs (`workflows/02-node-tests-matrix.yml`) | `exercises/04-node-tests-matrix.yml` | רשימת תיוג בסוף הקובץ + `solutions/04-node-tests-matrix.yml` |
| 05 | Playwright + Allure + Pages (`workflows/03-playwright-allure-pages.yml`) | `exercises/05-playwright-allure-pages.yml` | רשימת תיוג בסוף הקובץ + `solutions/05-playwright-allure-pages.yml` |
| 06 | רגרסיה לילית – cron, inputs, concurrency (`workflows/04-nightly-regression.yml`) | `exercises/06-nightly-regression.yml` | רשימת תיוג בסוף הקובץ + `solutions/06-nightly-regression.yml` |
| 07 | Quality Gate ל-PR – paths, permissions, if, timeout (`workflows/05-pr-quality-gate.yml`) | `exercises/07-pr-quality-gate.yml` | רשימת תיוג בסוף הקובץ + `solutions/07-pr-quality-gate.yml` |

**איך בודקים את עצמכם?**
- **תרגילי TypeScript (01–02):** בסוף כל קובץ יש "בדיקה עצמית". הריצו `npm run exercise -- 11 01` – לכל תרגיל מודפסות שורות בפורמט `<התוצאה שלכם> => צפוי: <הערך הנכון>`, והשניים צריכים להיות זהים. תרגיל שעוד לא השלמתם מדפיס `✋ TODO`.
- **תרגילי YAML (03–07 ותרגילי הסיכום):** את קובצי ה-Workflow לא "מריצים" על המחשב – הם רצים ב-GitHub. ההוראות כתובות בהערות (`#`) בראש הקובץ, ובסוף הקובץ יש **רשימת תיוג** (`[ ]`) של מה שהקובץ המוגמר חייב להכיל. עברו עליה סעיף-סעיף, ואז השוו לקובץ באותו שם בתיקיית `solutions/`. לבדיקת תחביר (הזחה, נקודתיים וכו') אפשר להריץ: `npx --yes js-yaml lessons/11-ci-pipeline-reports/exercises/03-hello-actions.yml`.

### תרגילי סיכום לשיעור
1. השלימו את `exercises/ci-workflow.yml` ו-`exercises/nightly.yml` (ההוראות בתוך הקבצים, רשימת התיוג בסוף כל קובץ).
2. השוו ל-`solutions/ci-workflow.yml` ול-`solutions/nightly.yml`.
3. **תרגיל 3 (מעשי):** העתיקו את `ci-workflow.yml` ל-`.github/workflows/` ב-repository שלכם ב-GitHub, דחפו, וצפו בריצה בלשונית Actions. הורידו את ה-artifact ופתחו את הדוח. (זו הבדיקה האמיתית של Workflow – ריצה ירוקה ב-GitHub.)
4. **תרגיל 4 (Playwright + Allure):** ב-`playwright-project/` שברו בכוונה את הבדיקה `page title`, הריצו, ופתחו את דוח ה-HTML ואת דוח Allure – מצאו את צילום המסך, הווידאו וה-Trace.

### פתרונות
בתיקיית `solutions/` – פתרון לכל קובץ תרגילים באותו שם (למשל `solutions/03-hello-actions.yml`, `solutions/01-local-pipeline.ts`).
הרצת פתרון TypeScript עם הבדיקה העצמית שלו: `npm run solution -- 11 01` (או `02`).
הרצה של כל קובצי הפתרונות בקורס (כך גם ה-CI בודק אותם): `npm run solutions`.

Workflows לדוגמה (להעתקה ל-`.github/workflows/`): `examples/workflows/`. ה-CI האמיתי של הפרויקט: `.github/workflows/ci.yml`.

## שיעורי בית
**התרחיש:** אתם מהנדסי האוטומציה של ה-repository של הקורס. הצוות רוצה Workflow אחד שנותן משוב מהיר על כל PR, מריץ רגרסיה מלאה כל לילה, מאפשר להריץ ידנית חבילת Playwright לבחירה, מפרסם את דוח ה-Allure האחרון ל-GitHub Pages – ומציג בדיקה אחת (`quality-gate`) שאפשר לחייב ב-Branch Protection.

- **הקובץ:** `exercises/homework.yml` – שלד עם 8 משימות בהערות (`#`) ו-`TODO` בכל מקום שצריך להשלים. המשימות 7–8 הן **(Challenge)**. הפעם ההוראות אומרות *מה* צריך – למצוא את המפתחות והביטויים המדויקים זה חלק מהעבודה (הכול מופיע בתרגילים 03–07 וב-`examples/workflows/`).
- **הנושאים שמשולבים:** triggers (`pull_request` עם `paths`, `push`, `schedule`, `workflow_dispatch` עם input מסוג choice), `concurrency`, `permissions` מינימליות, cache, matrix, `needs`, artifacts עם `if: always()`, Playwright + Allure, GitHub Pages ו-quality gate עם `$GITHUB_STEP_SUMMARY`.

**איך בודקים את עצמכם?**
1. עברו על **רשימת התיוג** (`[ ]`) בסוף הקובץ וסמנו `[x]` רק על מה שבאמת קיים בקוד שכתבתם.
2. השוו לפתרון המלא: `solutions/homework.yml`.
3. בדיקת תחביר: `npx --yes js-yaml lessons/11-ci-pipeline-reports/exercises/homework.yml`

**החלק המעשי (הבדיקה האמיתית – ריצה ירוקה ב-GitHub):** העתיקו את הקובץ שלכם ל-`.github/workflows/qa-pipeline.yml` ב-repository משלכם ב-GitHub, והגדירו ב-Settings → Pages את ה-Source ל-"GitHub Actions". דחפו, ואז בלשונית Actions הפעילו ידנית (Run workflow) עם `suite = smoke`. בסיום הורידו את ה-artifact `playwright-evidence` ופתחו את הדוחות, וקראו את טבלת התוצאות ב-Summary של הריצה. לבסוף דחפו commit ל-main ופתחו את כתובת ה-Pages שמופיעה ב-job `deploy-report` – דוח ה-Allure צריך להיות שם.
