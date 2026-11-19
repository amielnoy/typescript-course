#!/usr/bin/env bash
# Automatic checker – Lesson 9, Topic 03: Merge Conflict
# Usage:  bash lessons/09-git-github/exercises/verify-03-merge-conflict.sh ~/git-practice/03-merge-conflict

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

has_commit() { git log "${2:-main}" --format=%s 2>/dev/null | grep -qxF "$1"; }
has_merge() { git log main --merges --format=%s 2>/dev/null | grep -qF "$1"; }
branch_exists() { git show-ref --verify --quiet "refs/heads/$1"; }
is_merged_into_main() { git merge-base --is-ancestor "$1" main; }
merge_in_progress() { test -f "$(git rev-parse --git-dir)/MERGE_HEAD"; }
working_tree_clean() { test -z "$(git status --porcelain 2>/dev/null)"; }
# Whether the file ($2) on the branch ($3, default main) contains the text ($1)
file_has() { git show "${3:-main}:$2" 2>/dev/null | grep -qF -- "$1"; }
conflict_markers_on_main() { git grep -qE '^(<<<<<<<|=======|>>>>>>>)' main -- .; }

cd "$REPO" 2>/dev/null || { echo "Folder not found: $REPO"; exit 1; }
echo "Checking repository: $(pwd)"

echo "Exercise 1:"
check "folder is a git repository"                               git rev-parse --git-dir
check "branch 'main' exists"                                     branch_exists main
check "commit 'Add test settings' exists"                        has_commit "Add test settings"
check "settings.ts exists on main"                               git cat-file -e main:settings.ts

echo "Exercise 2:"
check "commit 'Run tests on Firefox' is on main"                 has_commit "Run tests on Firefox"
check "commit 'Reduce workers to 2' is on main"                  has_commit "Reduce workers to 2"
check "merge commit \"Merge branch 'feature/firefox'\""          has_merge "Merge branch 'feature/firefox'"
check "settings.ts has browser: \"firefox\""                     file_has 'browser: "firefox",' settings.ts
check "settings.ts has workers: 2"                               file_has 'workers: 2,' settings.ts

echo "Exercise 3:"
check "commit 'Use 2 retries' is on main"                        has_commit "Use 2 retries"
check "commit 'Use 1 retry' is on main"                          has_commit "Use 1 retry"
check "merge commit \"Merge branch 'feature/ci-retries'\""       has_merge "Merge branch 'feature/ci-retries'"
check "settings.ts has retries: process.env.CI ? 2 : 0"          file_has 'retries: process.env.CI ? 2 : 0,' settings.ts
check "settings.ts has no leftover 'retries: 1' / 'retries: 2'"  not git grep -qE 'retries: [12],' main -- settings.ts

echo "Exercise 4:"
check "commit 'Update admin password' is on main"                has_commit "Update admin password"
check "commit 'Use temporary admin password' is on main"         has_commit "Use temporary admin password"
check "merge commit \"Merge branch 'feature/new-users'\""        has_merge "Merge branch 'feature/new-users'"
check "users.csv kept the branch version (admin,NewPass2026)"    file_has 'admin,NewPass2026' test-data/users.csv
check "users.csv does NOT contain Temp000"                       not file_has 'Temp000' test-data/users.csv
check "users.csv still has viewer,View123"                       file_has 'viewer,View123' test-data/users.csv

echo "Exercise 5:"
check "branch experiment/long-timeout exists"                    branch_exists experiment/long-timeout
check "experiment/long-timeout has timeout: 120000"              file_has 'timeout: 120000,' settings.ts experiment/long-timeout
check "experiment/long-timeout is NOT merged into main"          not is_merged_into_main experiment/long-timeout
check "main kept timeout: 60000"                                 file_has 'timeout: 60000,' settings.ts

echo "General:"
check "no conflict markers in any file on main"                  not conflict_markers_on_main
check "no merge in progress"                                     not merge_in_progress
check "working tree is clean"                                    working_tree_clean

echo "Exercise 6 (bonus):"
bonus "merge commit \"Merge branch 'cleanup/remove-legacy'\""    has_merge "Merge branch 'cleanup/remove-legacy'"
bonus "legacy.spec.ts was removed from main"                     bash -c 'git log main --format=%s | grep -qxF "Add legacy test" && ! git cat-file -e main:legacy.spec.ts'

echo
echo "Result: $PASS passed, $FAIL failed"
[ "$FAIL" -eq 0 ] && echo "🎉 Great job!" || exit 1
