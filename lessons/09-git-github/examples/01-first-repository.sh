#!/usr/bin/env bash
# שיעור 9 – דוגמה 1: Repository ו-Commit
# הרצה:  bash lessons/09-git-github/examples/01-first-repository.sh
# (הסקריפט עובד בתיקייה זמנית ומוחק אותה בסוף)
set -e
source "$(dirname "$0")/_helpers.sh"
make_sandbox
trap cleanup_sandbox EXIT

title "1. יצירת Repository חדש"
run git init -b main qa-project
cd qa-project
run git status

title "2. יצירת קובץ – Untracked"
cat > login.spec.ts <<'EOF'
// בדיקת התחברות
console.log("login test");
EOF
run git status --short        # ?? = קובץ שגיט לא עוקב אחריו

title "3. git add – העברה ל-Staging Area"
run git add login.spec.ts
run git status --short        # A = נוסף ל-staging

title "4. git commit – שמירת 'תמונת מצב' בהיסטוריה"
run git commit -m "Add login test"

title "5. שינוי נוסף + צפייה בהבדלים"
echo 'console.log("verify welcome message");' >> login.spec.ts
run git diff                  # מה השתנה לעומת ה-commit האחרון
run git add login.spec.ts
run git commit -m "Verify welcome message after login"

title "6. קובץ .gitignore – קבצים שלא נכנסים לגיט"
mkdir -p node_modules reports
echo "dependency" > node_modules/lib.js
echo "<html>report</html>" > reports/index.html
printf 'node_modules/\nreports/\n.env\n' > .gitignore
run git status --short        # node_modules ו-reports לא מופיעים!
run git add .gitignore
run git commit -m "Add .gitignore"

title "7. היסטוריה"
run git log --oneline
run git show --stat HEAD      # פרטי ה-commit האחרון

title "8. ביטול שינוי שלא נשמר (restore)"
echo "oops – broken line" >> login.spec.ts
run git status --short        # M = שונה
run git restore login.spec.ts
run git status --short        # חזר למצב האחרון שנשמר
echo "Working tree clean ✔"
