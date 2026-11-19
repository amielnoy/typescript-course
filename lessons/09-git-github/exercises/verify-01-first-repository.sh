#!/usr/bin/env bash
# Automatic checker – Lesson 9, Topic 01: Repository and Commit
# Usage:  bash lessons/09-git-github/exercises/verify-01-first-repository.sh ~/git-practice/01-first-repository

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

# Bonus check – does not fail if it wasn't done
bonus() {
  local description="$1"
  shift
  if "$@" >/dev/null 2>&1; then
    echo "  ✔ $description (bonus)"
  else
    echo "  ○ $description (bonus – optional)"
  fi
}

not() { ! "$@"; }

# Whether main has a commit with exactly this message
has_commit() { git log main --format=%s 2>/dev/null | grep -qxF "$1"; }

# List of the files changed in a commit, found by its message
commit_files() {
  local hash
  hash="$(git log main --format='%H%x09%s' 2>/dev/null | awk -F '\t' -v m="$1" '$2 == m { print $1; exit }')"
  [ -n "$hash" ] && git show --name-only --format= "$hash"
}

only_smoke_in_first_commit() { test "$(commit_files 'Add smoke test')" = "tests/smoke.spec.ts"; }
tracked_artifacts() { git ls-tree -r --name-only main 2>/dev/null | grep -qE '^(test-results|playwright-report)/|\.log$|^\.env$'; }
working_tree_clean() { test -z "$(git status --porcelain 2>/dev/null)"; }

cd "$REPO" 2>/dev/null || { echo "Folder not found: $REPO"; exit 1; }
echo "Checking repository: $(pwd)"

echo "Exercise 1:"
check "folder is a git repository"                         git rev-parse --git-dir
check "branch 'main' exists"                               git show-ref --verify refs/heads/main
check "commit 'Add smoke test' exists"                     has_commit "Add smoke test"
check "'Add smoke test' contains ONLY tests/smoke.spec.ts" only_smoke_in_first_commit

echo "Exercise 2:"
check "commit 'Add Playwright config' exists"              has_commit "Add Playwright config"
check "playwright.config.ts is committed"                  git cat-file -e main:playwright.config.ts

echo "Exercise 3:"
check "commit 'Add title check to smoke test' exists"      has_commit "Add title check to smoke test"
check "smoke.spec.ts contains toHaveTitle"                 bash -c 'git show main:tests/smoke.spec.ts | grep -q "toHaveTitle"'

echo "Exercise 4:"
check "commit 'Ignore test artifacts' exists"              has_commit "Ignore test artifacts"
check ".gitignore is committed"                            git cat-file -e main:.gitignore
check ".gitignore ignores test-results/"                   git check-ignore -q test-results/run-1.txt
check ".gitignore ignores playwright-report/"              git check-ignore -q playwright-report/index.html
check ".gitignore ignores *.log"                           git check-ignore -q debug.log
check ".gitignore ignores .env"                            git check-ignore -q .env
check ".env.example is NOT ignored"                        not git check-ignore -q .env.example
check ".env.example is committed"                          git cat-file -e main:.env.example
check "no test artifacts / .env are tracked"               not tracked_artifacts

echo "Exercise 5:"
check "playwright.config.ts still has 'retries: 1'"        bash -c 'grep -q "retries: 1," playwright.config.ts'
check "working tree is clean (git status is empty)"        working_tree_clean

echo "Exercise 6 (bonus):"
bonus "commit 'docs: add test plan' exists"                has_commit "docs: add test plan"
bonus "docs/test-plan.md is committed"                     git cat-file -e main:docs/test-plan.md

echo
echo "Result: $PASS passed, $FAIL failed"
[ "$FAIL" -eq 0 ] && echo "🎉 Great job!" || exit 1
