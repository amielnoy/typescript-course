# Playwright + CI + Allure – פרויקט הדגמה

בדיקות API ו-UI מול שרת ה-Mock של הקורס. Playwright מפעיל את השרת לבד (`webServer` ב-config).

## התקנה
```bash
# פעם אחת – בשורש פרויקט הקורס (בשביל tsx ושרת ה-Mock)
npm install

# בתיקייה הזו
cd lessons/11-ci-pipeline-reports/playwright-project
npm install
npx playwright install chromium
```

## הרצה
| פקודה | |
|---|---|
| `npx playwright test` | כל הבדיקות |
| `npm run test:api` / `npm run test:ui` | רק API / רק UI |
| `npm run test:smoke` | רק בדיקות עם התגית `@smoke` |
| `npx playwright test --headed` | לראות את הדפדפן |
| `npx playwright test --ui` | מצב UI אינטראקטיבי |
| `npm run report:html` | פתיחת דוח ה-HTML של Playwright |
| `npm run allure:serve` | דוח Allure 2 (דורש Java 8+ מותקן) |

## מה נוצר אחרי ריצה
- `playwright-report/` – דוח HTML (כולל screenshots, video, trace לבדיקות שנכשלו)
- `test-results/junit.xml` – JUnit לשילוב במערכות CI
- `allure-results/` – נתונים גולמיים ל-Allure → `allure generate` יוצר `allure-report/`

## ב-CI
ה-job בשם `playwright` ב-`.github/workflows/ci.yml` מריץ את הפרויקט הזה, מייצר דוח Allure ומעלה הכול כ-artifact.
דוגמה לפרסום Allure ל-GitHub Pages: `../examples/workflows/03-playwright-allure-pages.yml`.
