#!/usr/bin/env bash
# שיעור 9 – דוגמה 3: Merge Conflict – יצירה ופתרון
# הרצה:  bash lessons/09-git-github/examples/03-merge-conflict.sh
set -e
source "$(dirname "$0")/_helpers.sh"
make_sandbox
trap cleanup_sandbox EXIT

git init -q -b main project && cd project
cat > config.ts <<'EOF'
export const config = {
  baseUrl: "http://localhost:3000",
  timeout: 30000,
};
EOF
git add . && git commit -q -m "Add config"

title "1. שני ענפים משנים את אותה שורה"
git switch -q -c feature/staging
sed -i.bak 's|http://localhost:3000|https://staging.example.com|' config.ts && rm config.ts.bak
git commit -q -am "Point config to staging"
echo "feature/staging: baseUrl -> staging"

git switch -q main
sed -i.bak 's|http://localhost:3000|https://qa.example.com|' config.ts && rm config.ts.bak
git commit -q -am "Point config to QA env"
echo "main: baseUrl -> qa"

title "2. ניסיון מיזוג – קונפליקט!"
set +e
run git merge feature/staging
set -e
run git status --short       # UU = Unmerged – שני הצדדים שינו

title "3. כך נראה קובץ עם קונפליקט"
run cat config.ts
echo
echo "<<<<<<< HEAD          = הגרסה שלנו (main)"
echo "=======               = מפריד"
echo ">>>>>>> feature/...   = הגרסה מהענף שממזגים"

title "4. פתרון: עורכים את הקובץ ומשאירים את הגרסה הנכונה"
cat > config.ts <<'EOF'
export const config = {
  baseUrl: process.env.BASE_URL ?? "https://qa.example.com",
  timeout: 30000,
};
EOF
run cat config.ts
run git add config.ts         # מסמן שהקונפליקט נפתר
run git commit --no-edit      # משלים את ה-merge
run git log --oneline --graph --all

echo
echo "טיפ: אם רוצים לבטל מיזוג באמצע –  git merge --abort"
