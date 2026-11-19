#!/usr/bin/env bash
# שיעור 9 – דוגמה 4: Remote, push, pull ותהליך Pull Request – הדמיה מקומית של GitHub
# הרצה:  bash lessons/09-git-github/examples/04-remote-push-pull.sh
#
# כדי לא להזדקק לחשבון GitHub, ניצור repository "bare" מקומי שמשחק את תפקיד GitHub.
# בעבודה אמיתית, במקום הנתיב המקומי תופיע כתובת כמו:
#   https://github.com/<org>/<repo>.git   או   git@github.com:<org>/<repo>.git
set -e
source "$(dirname "$0")/_helpers.sh"
make_sandbox
trap cleanup_sandbox EXIT

title "0. 'GitHub' – שרת מרוחק (bare repository)"
run git init -q --bare -b main github-qa-tests.git

title "1. דנה יוצרת את הפרויקט ודוחפת (push) ל-GitHub"
git init -q -b main dana && cd dana
echo "# QA Automation" > README.md
git add . && git commit -q -m "Initial commit"
run git remote add origin "$SANDBOX/github-qa-tests.git"
run git remote -v
run git push -u origin main
cd ..

title "2. יוסי משכפל (clone) את הפרויקט"
run git clone -q "$SANDBOX/github-qa-tests.git" yossi
cd yossi

title "3. יוסי עובד בענף משלו ודוחף אותו – הבסיס ל-Pull Request"
git switch -q -c feature/cart-tests
echo "test('add to cart', () => {});" > cart.spec.ts
git add . && run git commit -m "Add cart tests"
run git push -u origin feature/cart-tests
echo
echo "👉 ב-GitHub עכשיו לוחצים 'Compare & pull request':"
echo "   base: main  ←  compare: feature/cart-tests"
echo "   כותבים תיאור, מבקשים Reviewer, ה-CI מריץ בדיקות, ואחרי אישור – Merge."
echo "   עם GitHub CLI:  gh pr create --base main --title 'Add cart tests' --body '...'"
cd ..

title "4. 'מיזוג ה-PR' (בפועל נעשה בממשק של GitHub)"
cd dana
run git fetch origin
run git merge --no-edit origin/feature/cart-tests
run git push origin main
cd ..

title "5. יוסי מעדכן את main המקומי שלו – pull"
cd yossi
run git switch main
run git pull
run git log --oneline --graph
run ls
