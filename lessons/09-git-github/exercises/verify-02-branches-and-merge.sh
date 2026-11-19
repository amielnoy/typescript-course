#!/usr/bin/env bash
# Automatic checker – Lesson 9, Topic 02: Branch and Merge
# Usage:  bash lessons/09-git-github/exercises/verify-02-branches-and-merge.sh ~/git-practice/02-branches-and-merge

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

# Whether the branch ($2, default main) has a commit with exactly this message
has_commit() { git log "${2:-main}" --format=%s 2>/dev/null | grep -qxF "$1"; }
# Whether main has a merge commit whose message contains the text
has_merge() { git log main --merges --format=%s 2>/dev/null | grep -qF "$1"; }
# The commit is on main's "first-parent line" (i.e. it came in by fast-forward, not through a merge commit)
on_first_parent() { git log main --first-parent --format=%s 2>/dev/null | grep -qxF "$1"; }
branch_exists() { git show-ref --verify --quiet "refs/heads/$1"; }
is_merged_into_main() { git merge-base --is-ancestor "$1" main; }
merge_in_progress() { test -f "$(git rev-parse --git-dir)/MERGE_HEAD"; }

cd "$REPO" 2>/dev/null || { echo "Folder not found: $REPO"; exit 1; }
echo "Checking repository: $(pwd)"

echo "Exercise 1:"
check "folder is a git repository"                          git rev-parse --git-dir
check "branch 'main' exists"                                branch_exists main
check "commit 'Initial commit' exists"                      has_commit "Initial commit"
check "README.md mentions 'E-shop QA tests'"                bash -c 'git show main:README.md | grep -q "E-shop QA tests"'

echo "Exercise 2:"
check "commit 'Add checkout tests' is on main"              has_commit "Add checkout tests"
check "commit 'Add coupon test to checkout' is on main"     has_commit "Add coupon test to checkout"
check "checkout.spec.ts on main contains the coupon test"   bash -c 'git show main:checkout.spec.ts | grep -q "coupon"'

echo "Exercise 3:"
check "checkout commits came in by fast-forward"            on_first_parent "Add coupon test to checkout"
check "no merge commit for feature/checkout-tests"          not has_merge "feature/checkout-tests"
check "branch feature/checkout-tests was deleted"           not branch_exists feature/checkout-tests

echo "Exercise 4:"
check "commit 'Fix flaky search test' is on main"           has_commit "Fix flaky search test"
check "commit 'Add test data fixtures' is on main"          has_commit "Add test data fixtures"
check "merge commit \"Merge branch 'bugfix/flaky-search'\"" has_merge "Merge branch 'bugfix/flaky-search'"
check "search.spec.ts exists on main"                       git cat-file -e main:search.spec.ts
check "fixtures/users.json exists on main"                  git cat-file -e main:fixtures/users.json
check "branch bugfix/flaky-search was deleted"              not branch_exists bugfix/flaky-search

echo "Exercise 5:"
check "branch feature/reports exists"                       branch_exists feature/reports
check "commit 'Add reports config' is on feature/reports"   has_commit "Add reports config" feature/reports
check "feature/reports is NOT merged into main"             not is_merged_into_main feature/reports
check "reports.config.ts does NOT exist on main"            not git cat-file -e main:reports.config.ts
check "no merge in progress"                                not merge_in_progress

echo "Exercise 6 (bonus):"
bonus "merge commit \"Merge branch 'docs/how-to-run'\""     has_merge "Merge branch 'docs/how-to-run'"
bonus "README.md on main explains how to run"               bash -c 'git show main:README.md | grep -q "npx playwright test"'

echo
echo "Result: $PASS passed, $FAIL failed"
[ "$FAIL" -eq 0 ] && echo "🎉 Great job!" || exit 1
