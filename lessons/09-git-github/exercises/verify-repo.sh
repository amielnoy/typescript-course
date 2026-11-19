#!/usr/bin/env bash
# Automatic checker for the Git exercises (exercises 1–3)
# Usage:  bash lessons/09-git-github/exercises/verify-repo.sh <path-to-your-repo>

REPO="${1:-.}"
PASS=0
FAIL=0

check() {
  local description="$1"
  shift
  if "$@" >/dev/null 2>&1; then
    echo "  ✔ $description"
    PASS=$((PASS + 1))
  else
    echo "  ✘ $description"
    FAIL=$((FAIL + 1))
  fi
}

cd "$REPO" 2>/dev/null || { echo "Folder not found: $REPO"; exit 1; }
echo "Checking repository: $(pwd)"

echo "Exercise 1:"
check "folder is a git repository"                 git rev-parse --git-dir
check "branch 'main' exists"                       git show-ref --verify refs/heads/main
check "at least 3 commits on main"                 test "$(git rev-list --count main 2>/dev/null)" -ge 3
check "README.md is committed"                     git cat-file -e main:README.md
check ".gitignore is committed"                    git cat-file -e main:.gitignore
check ".gitignore ignores node_modules"            git check-ignore -q node_modules/x.js
check ".gitignore ignores reports"                 git check-ignore -q reports/index.html
check ".gitignore ignores .env"                    git check-ignore -q .env
check "node_modules is NOT tracked"                bash -c '! git ls-files --error-unmatch node_modules >/dev/null 2>&1'

echo "Exercise 2:"
check "branch feature/login-tests was created"     bash -c 'git branch -a --format="%(refname:short)" | grep -q "feature/login-tests" || git log main --merges --format=%s | grep -q "feature/login-tests"'
check "login.spec.ts exists on main"               git cat-file -e main:login.spec.ts
check "main has at least one merge commit"         test "$(git rev-list --merges --count main 2>/dev/null)" -ge 1

echo "Exercise 3:"
check "config.ts exists on main"                   git cat-file -e main:config.ts
check "config.ts has the resolved value"           bash -c 'git show main:config.ts | grep -q "process.env.ENV ?? \"qa\""'
check "no conflict markers left in config.ts"      bash -c '! git show main:config.ts | grep -qE "^(<<<<<<<|=======|>>>>>>>)"'
check "no merge in progress"                       bash -c '! test -f "$(git rev-parse --git-dir)/MERGE_HEAD"'

echo
echo "Result: $PASS passed, $FAIL failed"
[ "$FAIL" -eq 0 ] && echo "🎉 Great job!" || exit 1
