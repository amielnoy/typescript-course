#!/usr/bin/env bash
# Lesson 9 – Topic 04: solution for the Remote, push, pull exercises + runs the automatic checker
# Run:  bash lessons/09-git-github/solutions/04-remote-push-pull.sh [target-dir]
#   Without an argument – works in a temporary folder and deletes it at the end.
#   With an argument   – creates inside <target-dir>:
#                 04-remote.git          ("GitHub" – bare repository)
#                 04-remote-push-pull    (your computer)
#                 04-teammate            (your teammate's computer)
#               and keeps them for you to inspect.
set -e
HERE="$(cd "$(dirname "$0")" && pwd)"
NAME="04-remote-push-pull"

if [ -n "$1" ]; then
  mkdir -p "$1"
  BASE="$(cd "$1" && pwd)"
else
  BASE="$(mktemp -d)"
  trap 'cd / && rm -rf "$BASE"' EXIT
fi
REMOTE="$BASE/04-remote.git"
REPO="$BASE/$NAME"
TEAMMATE="$BASE/04-teammate"
for dir in "$REMOTE" "$REPO" "$TEAMMATE"; do
  if [ -e "$dir" ]; then
    echo "Already exists: $dir – delete it or choose another folder"
    exit 1
  fi
done

export GIT_EDITOR=true GIT_PAGER=cat PAGER=cat

# Local settings for each repository (name, email, and a pull that merges instead of rebasing)
setup_user() {
  git config user.name "$1"
  git config user.email "$2"
  git config commit.gpgsign false
  git config tag.gpgsign false
  git config pull.rebase false
}

# ---------- Exercise 1 – remote "server" ----------
git init -q --bare -b main "$REMOTE"
ls "$REMOTE"

# ---------- Exercise 2 – first push ----------
git init -q -b main "$REPO"
cd "$REPO"
setup_user "QA Student" "student@example.com"
echo "# QA regression suite" > README.md
git add README.md
git commit -q -m "Initial commit"
git remote add origin "$REMOTE"
git remote -v
git push -q -u origin main
git branch -vv

# ---------- Exercise 3 – teammate clones, and we pull ----------
git clone -q "$REMOTE" "$TEAMMATE"
cd "$TEAMMATE"
setup_user "QA Teammate" "teammate@example.com"
mkdir -p tests
echo "test('GET /health returns 200', () => {});" > tests/api.spec.ts
git add tests/api.spec.ts
git commit -q -m "Add API health test"
git push -q

cd "$REPO"
git fetch -q
git status                              # behind 'origin/main' by 1 commit
git log --oneline main..origin/main
git pull -q
git log --format="%h %an %s"

# ---------- Exercise 4 – feature branch and "Pull Request" ----------
git switch -q -c feature/cart-tests
echo "test('add item to cart', () => {});" > tests/cart.spec.ts
git add tests/cart.spec.ts
git commit -q -m "Add cart tests"
git push -q -u origin feature/cart-tests
git branch -r
git switch -q main
git merge -q --no-ff -m "Merge pull request #1 from feature/cart-tests" feature/cart-tests
git push -q

# ---------- Exercise 5 – rejected push, pull then push ----------
cd "$TEAMMATE"
echo "test('login with valid user', () => {});" > tests/login.spec.ts
git add tests/login.spec.ts
git commit -q -m "Add login test"
git push || echo "(expected: push was rejected – fetch first)"
git pull -q --no-rebase --no-edit
git push -q

cd "$REPO"
git pull -q
git status
git log --oneline --graph

# ---------- Exercise 6 (Bonus) – tag and branch cleanup ----------
git tag -a v1.0 -m "Regression suite v1.0"
git push -q origin v1.0
git push -q origin --delete feature/cart-tests
git branch -d feature/cart-tests
git fetch -q --prune
git branch -r
git ls-remote --tags origin

echo
bash "$HERE/../exercises/verify-$NAME.sh" "$REPO"
