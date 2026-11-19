#!/usr/bin/env bash
# Lesson 9 – Topic 05: solution for the Fixing Mistakes and stash exercises + runs the automatic checker
# Run:  bash lessons/09-git-github/solutions/05-undo-and-stash.sh [target-dir]
#   Without an argument – works in a temporary folder and deletes it at the end.
#   With an argument   – creates <target-dir>/05-undo-and-stash and keeps it for you to inspect.
set -e
HERE="$(cd "$(dirname "$0")" && pwd)"
NAME="05-undo-and-stash"

if [ -n "$1" ]; then
  mkdir -p "$1"
  BASE="$(cd "$1" && pwd)"
else
  BASE="$(mktemp -d)"
  trap 'cd / && rm -rf "$BASE"' EXIT
fi
REPO="$BASE/$NAME"
if [ -e "$REPO" ]; then
  echo "Already exists: $REPO – delete it or choose another folder"
  exit 1
fi

export GIT_EDITOR=true GIT_PAGER=cat PAGER=cat

# ---------- Exercise 1 – amend ----------
git init -q -b main "$REPO"
cd "$REPO"
git config user.name "QA Student"
git config user.email "student@example.com"
git config commit.gpgsign false
echo "# Undo practice" > README.md
git add README.md
git commit -q -m "Initial commit"
mkdir -p tests pages
echo "test('login with valid user', () => {});" > tests/login.spec.ts
git add tests/login.spec.ts
git commit -q -m "Add logn test"                 # typo + forgot a file
echo 'export const loginButton = "#login-btn";' > pages/login.page.ts
git add pages/login.page.ts
git commit -q --amend -m "Add login test"
git log --oneline
git show --stat HEAD

# ---------- Exercise 2 – unstage and restore ----------
echo "test('add item to cart', () => {});" > tests/cart.spec.ts
echo "ask dev about flaky cart test" > local-notes.txt
git add .
git status --short                               # A for both files
git restore --staged local-notes.txt
git status --short                               # ?? local-notes.txt
git commit -q -m "Add cart test"
echo "local-notes.txt" > .gitignore
git add .gitignore
git commit -q -m "Ignore local notes"
echo "BROKEN" >> tests/cart.spec.ts
git restore tests/cart.spec.ts
git status --short                               # empty

# ---------- Exercise 3 – revert ----------
echo "test('checkout', () => {});" > tests/checkout.spec.ts
git add tests/checkout.spec.ts
git commit -q -m "Add checkout test"
echo "test.skip('checkout', () => {});" > tests/checkout.spec.ts
git commit -q -am "Skip checkout test"
git revert --no-edit HEAD
git log --oneline
cat tests/checkout.spec.ts

# ---------- Exercise 4 – reset --hard and reflog ----------
echo "export const experiment = 1;" > experiment.ts
git add experiment.ts
git commit -q -m "WIP experiment 1"
echo "export const experiment = 2;" > experiment.ts
git commit -q -am "WIP experiment 2"
git reset --hard HEAD~2
git log --oneline
git reflog | head -n 5
git branch rescue/experiment HEAD@{1}            # HEAD@{1} = where HEAD was before the reset
git log --oneline -3 rescue/experiment

# ---------- Exercise 5 – stash during an urgent bug ----------
echo "test('login with wrong password', () => {});" >> tests/login.spec.ts
git stash push -m "WIP: login edge cases"
git status --short                               # empty
git stash list
git switch -q -c hotfix/login-selector
echo 'export const loginButton = "[data-testid=login]";' > pages/login.page.ts
git commit -q -am "Fix login selector"
git switch -q main
git merge -q hotfix/login-selector
git branch -d hotfix/login-selector
git stash pop
git commit -q -am "Add login edge cases"

# ---------- Exercise 6 – stash with an untracked file ----------
echo "Slack reporter: TODO" >> README.md
mkdir -p reporters
echo "export class SlackReporter {}" > reporters/slack-reporter.ts
git status --short                               # M README.md, ?? reporters/
git stash push -u -m "WIP: slack reporter"
git status --short                               # empty
git stash list
git stash show stash@{0}

echo
bash "$HERE/../exercises/verify-$NAME.sh" "$REPO"
