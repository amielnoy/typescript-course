#!/usr/bin/env bash
# שיעור 9 – דוגמה 5: תיקון טעויות – amend, reset, revert, stash
# הרצה:  bash lessons/09-git-github/examples/05-undo-and-stash.sh
set -e
source "$(dirname "$0")/_helpers.sh"
make_sandbox
trap cleanup_sandbox EXIT

git init -q -b main repo && cd repo
echo "v1" > app.txt && git add . && git commit -q -m "v1"

title "1. amend – תיקון ה-commit האחרון (לפני push!)"
echo "v2" > app.txt && git add . && git commit -q -m "v2 with typo in mesage"
run git commit --amend -m "v2"
run git log --oneline

title "2. unstage – הוצאה מה-staging בלי לאבד את השינוי"
echo "temp" > notes.txt && git add notes.txt
run git restore --staged notes.txt
run git status --short
rm notes.txt

title "3. revert – commit חדש שמבטל commit קודם (בטוח גם אחרי push)"
echo "v3 – broken" > app.txt && git commit -q -am "v3 (broken)"
run git revert --no-edit HEAD
run cat app.txt
run git log --oneline

title "4. reset – הזזת הענף אחורה (רק לשינויים מקומיים שלא נדחפו!)"
echo "experiment" > app.txt && git commit -q -am "experiment"
run git reset --hard HEAD~1
run git log --oneline

title "5. stash – 'להחביא' עבודה באמצע כדי לעבור ענף"
echo "half-done work" >> app.txt
run git stash push -m "WIP on app"
run git status --short
run git stash list
run git stash pop
run git status --short
