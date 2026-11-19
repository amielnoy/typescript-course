#!/usr/bin/env bash
# Lesson 9 – solution for exercises 1–3 (in a temporary folder) + runs the automatic checker
# Run:  bash lessons/09-git-github/solutions/solution.sh
set -e
HERE="$(cd "$(dirname "$0")" && pwd)"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT
export GIT_AUTHOR_NAME="QA Student" GIT_AUTHOR_EMAIL="student@example.com"
export GIT_COMMITTER_NAME="QA Student" GIT_COMMITTER_EMAIL="student@example.com"
cd "$WORK"

# ---------- Exercise 1 ----------
git init -q -b main qa-practice
cd qa-practice
echo "# QA Practice" > README.md
git add README.md
git commit -q -m "Initial commit"
printf 'node_modules/\nreports/\n.env\n' > .gitignore
git add .gitignore
git commit -q -m "Add .gitignore"
mkdir -p node_modules && echo "x" > node_modules/x.js
git status --short   # node_modules does not show up

# ---------- Exercise 2 ----------
git switch -q -c feature/login-tests
echo "test('login', () => {});" > login.spec.ts
git add login.spec.ts
git commit -q -m "Add login tests"
git switch -q main
echo "How to run: npm test" >> README.md
git commit -q -am "Add run instructions"
git merge -q --no-edit feature/login-tests
git log --oneline --graph --all

# ---------- Exercise 3 ----------
echo 'export const env = "dev";' > config.ts
git add config.ts && git commit -q -m "Add config"
git switch -q -c feature/staging
echo 'export const env = "staging";' > config.ts
git commit -q -am "Use staging env"
git switch -q main
echo 'export const env = "qa";' > config.ts
git commit -q -am "Use qa env"
git merge feature/staging || true            # conflict expected
echo 'export const env = process.env.ENV ?? "qa";' > config.ts   # resolution
git add config.ts
git commit -q --no-edit

echo
bash "$HERE/../exercises/verify-repo.sh" "$WORK/qa-practice"
