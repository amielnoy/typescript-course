# כללי כתיבת Commit טובים

1. **שורה ראשונה קצרה** (עד ~50 תווים), בלשון ציווי: `Add login tests` ולא `added some stuff`.
2. **commit אחד = שינוי לוגי אחד.** לא לערבב תיקון באג + רפקטור + פיצ'ר.
3. **Conventional Commits** (נפוץ מאוד):
   - `feat: add cart API tests`
   - `fix: wait for spinner before clicking checkout`
   - `test: cover negative login scenarios`
   - `refactor: extract LoginPage object`
   - `ci: run tests on pull requests`
   - `docs: explain how to run locally`
   - `chore: bump playwright to 1.50`
4. **מתי לעשות commit?** בכל פעם שהגעתם למצב יציב שעובד (הבדיקות עוברות).
5. **אף פעם** לא לבצע commit לסיסמאות, טוקנים או קובצי `.env`.

## שמות ענפים
- `feature/<short-description>` – פיצ'ר / בדיקות חדשות
- `fix/<bug-id>-<short-description>` – תיקון
- `chore/<...>` – תחזוקה
