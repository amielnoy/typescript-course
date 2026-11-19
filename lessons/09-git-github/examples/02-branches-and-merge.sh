#!/usr/bin/env bash
# שיעור 9 – דוגמה 2: Branch ו-Merge
# הרצה:  bash lessons/09-git-github/examples/02-branches-and-merge.sh
set -e
source "$(dirname "$0")/_helpers.sh"
make_sandbox
trap cleanup_sandbox EXIT

git init -q -b main tests && cd tests
echo "# QA tests" > README.md
git add . && git commit -q -m "Initial commit"

title "1. יצירת ענף (branch) חדש ומעבר אליו"
run git branch                              # * מסמן את הענף הנוכחי
run git switch -c feature/login-tests       # יצירה + מעבר (בגרסאות ישנות: git checkout -b)
echo "test('login', () => {});" > login.spec.ts
git add . && run git commit -m "Add login tests"
echo "test('logout', () => {});" > logout.spec.ts
git add . && run git commit -m "Add logout tests"
run git log --oneline --all --graph

title "2. ב-main הקבצים החדשים לא קיימים"
run git switch main
run ls

title "3. Fast-forward merge – main לא התקדם, ולכן פשוט 'מקדמים' אותו"
run git merge feature/login-tests
run ls
run git branch -d feature/login-tests       # מחיקת ענף שמוזג

title "4. ענפים שהתפצלו – Merge commit"
git switch -q -c feature/api-tests
echo "test('GET /users', () => {});" > api.spec.ts
git add . && run git commit -m "Add API tests"
git switch -q main
echo "Run: npm test" >> README.md
git add . && run git commit -m "Document how to run tests"
run git merge --no-edit feature/api-tests   # יוצר merge commit עם שני הורים
run git log --oneline --graph --all

title "5. מצב סופי"
run git branch -a
run ls
