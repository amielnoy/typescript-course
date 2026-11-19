#!/usr/bin/env bash
# Lesson 9 – Topic 02: solution for the Branch and Merge exercises + runs the automatic checker
# Run:  bash lessons/09-git-github/solutions/02-branches-and-merge.sh [target-dir]
#   Without an argument – works in a temporary folder and deletes it at the end.
#   With an argument   – creates <target-dir>/02-branches-and-merge and keeps it for you to inspect.
set -e
HERE="$(cd "$(dirname "$0")" && pwd)"
NAME="02-branches-and-merge"

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

# ---------- Exercise 1 – starting point ----------
git init -q -b main "$REPO"
cd "$REPO"
git config user.name "QA Student"
git config user.email "student@example.com"
git config commit.gpgsign false
echo "# E-shop QA tests" > README.md
git add README.md
git commit -q -m "Initial commit"
git branch

# ---------- Exercise 2 – feature branch with two commits ----------
git switch -q -c feature/checkout-tests
echo "test('checkout with credit card', () => {});" > checkout.spec.ts
git add checkout.spec.ts
git commit -q -m "Add checkout tests"
echo "test('checkout with coupon', () => {});" >> checkout.spec.ts
git commit -q -am "Add coupon test to checkout"
git switch -q main
ls                                   # no checkout.spec.ts
git log --oneline --graph --all

# ---------- Exercise 3 – fast-forward ----------
git merge --ff-only feature/checkout-tests   # like a plain git merge – here it will be a Fast-forward
git branch -d feature/checkout-tests
git log --oneline

# ---------- Exercise 4 – diverged branches → merge commit ----------
git switch -q -c bugfix/flaky-search
echo "test('search waits for results', () => {});" > search.spec.ts
git add search.spec.ts
git commit -q -m "Fix flaky search test"
git switch -q main
mkdir -p fixtures
echo '[{ "user": "qa-admin" }]' > fixtures/users.json
git add fixtures/users.json
git commit -q -m "Add test data fixtures"
git merge -q --no-edit bugfix/flaky-search
git branch -d bugfix/flaky-search
git log --oneline --graph

# ---------- Exercise 5 – a branch that hasn't been merged yet ----------
git switch -q -c feature/reports
echo 'export const reporter = "html";' > reports.config.ts
git add reports.config.ts
git commit -q -m "Add reports config"
git switch -q main
git branch -d feature/reports || echo "(expected: branch is not fully merged – keeping it)"
git branch --no-merged
git branch --merged

# ---------- Exercise 6 (Bonus) – --no-ff ----------
git switch -q -c docs/how-to-run
echo "Run: npx playwright test" >> README.md
git commit -q -am "Document how to run tests"
git switch -q main
git merge -q --no-ff --no-edit docs/how-to-run
git log --oneline --graph --all

echo
bash "$HERE/../exercises/verify-$NAME.sh" "$REPO"
