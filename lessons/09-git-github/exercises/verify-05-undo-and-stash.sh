#!/usr/bin/env bash
# Automatic checker – Lesson 9, Topic 05: Fixing Mistakes and stash
# Usage:  bash lessons/09-git-github/exercises/verify-05-undo-and-stash.sh ~/git-practice/05-undo-and-stash

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

not() { ! "$@"; }

has_commit() { git log "${2:-main}" --format=%s 2>/dev/null | grep -qxF "$1"; }
branch_exists() { git show-ref --verify --quiet "refs/heads/$1"; }
is_merged_into_main() { git merge-base --is-ancestor "$1" main; }
working_tree_clean() { test -z "$(git status --porcelain 2>/dev/null)"; }
file_has() { git show "${3:-main}:$2" 2>/dev/null | grep -qF -- "$1"; }

# List of the files changed in a commit, found by its message (sorted, on one line)
commit_files() {
  local hash
  hash="$(git log main --format='%H%x09%s' 2>/dev/null | awk -F '\t' -v m="$1" '$2 == m { print $1; exit }')"
  [ -n "$hash" ] && git show --name-only --format= "$hash" | sort | tr '\n' ' '
}
login_commit_has_both_files() { test "$(commit_files 'Add login test')" = "pages/login.page.ts tests/login.spec.ts "; }
cart_commit_only_spec() { test "$(commit_files 'Add cart test')" = "tests/cart.spec.ts "; }
notes_ever_committed() { git log --all --format= --name-only 2>/dev/null | grep -qx "local-notes.txt"; }
any_commit_matches() { git log main --format=%s 2>/dev/null | grep -qF "$1"; }
tip_is() { test "$(git log -1 --format=%s "$1" 2>/dev/null)" = "$2"; }

# Finds the stash by its message (e.g. stash@{0})
find_stash() { git stash list --format='%gd|%gs' 2>/dev/null | grep -F "$1" | head -n 1 | cut -d'|' -f1; }
stash_exists() { test -n "$(find_stash "$1")"; }
slack_stash_has_untracked() {
  local ref
  ref="$(find_stash 'WIP: slack reporter')"
  [ -n "$ref" ] && git cat-file -e "$ref^3:reporters/slack-reporter.ts"
}
slack_stash_has_readme_change() {
  local ref
  ref="$(find_stash 'WIP: slack reporter')"
  [ -n "$ref" ] && git show "$ref:README.md" | grep -qF "Slack reporter: TODO"
}

cd "$REPO" 2>/dev/null || { echo "Folder not found: $REPO"; exit 1; }
echo "Checking repository: $(pwd)"

echo "Exercise 1:"
check "folder is a git repository"                               git rev-parse --git-dir
check "branch 'main' exists"                                     branch_exists main
check "commit 'Initial commit' exists"                           has_commit "Initial commit"
check "commit 'Add login test' exists"                           has_commit "Add login test"
check "no commit with the typo 'Add logn test'"                  not any_commit_matches "Add logn test"
check "'Add login test' contains the spec AND the page object"   login_commit_has_both_files

echo "Exercise 2:"
check "commit 'Add cart test' contains ONLY tests/cart.spec.ts"  cart_commit_only_spec
check "commit 'Ignore local notes' exists"                       has_commit "Ignore local notes"
check "local-notes.txt is ignored"                               git check-ignore -q local-notes.txt
check "local-notes.txt was never committed"                      not notes_ever_committed
check "tests/cart.spec.ts has no 'BROKEN' line"                  not grep -q "BROKEN" tests/cart.spec.ts

echo "Exercise 3:"
check "commit 'Add checkout test' exists"                        has_commit "Add checkout test"
check "original commit 'Skip checkout test' is still in history" has_commit "Skip checkout test"
check "commit 'Revert \"Skip checkout test\"' exists"            has_commit 'Revert "Skip checkout test"'
check "checkout.spec.ts on main has no test.skip"                not file_has "test.skip" tests/checkout.spec.ts

echo "Exercise 4:"
check "no 'WIP experiment' commits on main (reset --hard)"       not any_commit_matches "WIP experiment"
check "experiment.ts does NOT exist on main"                     not git cat-file -e main:experiment.ts
check "branch rescue/experiment exists (from reflog)"            branch_exists rescue/experiment
check "rescue/experiment points to 'WIP experiment 2'"           tip_is rescue/experiment "WIP experiment 2"
check "rescue/experiment is NOT merged into main"                not is_merged_into_main rescue/experiment

echo "Exercise 5:"
check "commit 'Fix login selector' is on main"                   has_commit "Fix login selector"
check "login.page.ts uses [data-testid=login]"                   file_has '[data-testid=login]' pages/login.page.ts
check "commit 'Add login edge cases' is on main"                 has_commit "Add login edge cases"
check "login.spec.ts contains the wrong-password test"           file_has "login with wrong password" tests/login.spec.ts
check "stash 'WIP: login edge cases' was popped (not in list)"   not stash_exists "WIP: login edge cases"

echo "Exercise 6:"
check "stash 'WIP: slack reporter' exists"                       stash_exists "WIP: slack reporter"
check "the stash includes the untracked slack-reporter.ts (-u)"  slack_stash_has_untracked
check "the stash includes the README.md change"                  slack_stash_has_readme_change
check "slack-reporter.ts is NOT in the working folder"           not test -e reporters/slack-reporter.ts
check "working tree is clean"                                    working_tree_clean

echo
echo "Result: $PASS passed, $FAIL failed"
[ "$FAIL" -eq 0 ] && echo "🎉 Great job!" || exit 1
