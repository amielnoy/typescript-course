#!/usr/bin/env bash
# Automatic checker – Lesson 9, Topic 04: Remote, push, pull
# Usage:  bash lessons/09-git-github/exercises/verify-04-remote-push-pull.sh ~/git-practice/04-remote-push-pull
#
# The checker runs git fetch from origin (updates only origin/* – does not touch your files and branches).

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
has_merge() { git log "${2:-main}" --merges --format=%s 2>/dev/null | grep -qF "$1"; }
branch_exists() { git show-ref --verify --quiet "refs/heads/$1"; }
working_tree_clean() { test -z "$(git status --porcelain 2>/dev/null)"; }

origin_reachable() { git ls-remote origin >/dev/null; }
# If origin is a local path – it must be a bare repository (like a server). A GitHub URL is accepted.
origin_is_bare() {
  local url
  url="$(git remote get-url origin)" || return 1
  if [ -d "$url" ]; then
    test "$(git --git-dir="$url" rev-parse --is-bare-repository)" = "true"
  else
    return 0
  fi
}
main_tracks_origin() { test "$(git rev-parse --abbrev-ref --symbolic-full-name 'main@{upstream}')" = "origin/main"; }
two_authors_on_origin() { test "$(git log origin/main --format=%an 2>/dev/null | sort -u | wc -l)" -ge 2; }
main_in_sync() { test "$(git rev-parse main)" = "$(git rev-parse origin/main)"; }
merges_on_origin() { test "$(git rev-list --merges --count origin/main 2>/dev/null)" -ge "$1"; }
remote_tag_v1() { git ls-remote --exit-code --tags origin refs/tags/v1.0; }
v1_is_annotated() { test "$(git cat-file -t v1.0)" = "tag"; }

cd "$REPO" 2>/dev/null || { echo "Folder not found: $REPO"; exit 1; }
echo "Checking repository: $(pwd)"
GIT_TERMINAL_PROMPT=0 git fetch -q origin >/dev/null 2>&1

echo "Exercise 1:"
check "folder is a git repository"                               git rev-parse --git-dir
check "remote 'origin' is configured"                            git remote get-url origin
check "origin is reachable (git ls-remote origin)"               origin_reachable
check "origin is a bare repository (or a GitHub URL)"            origin_is_bare

echo "Exercise 2:"
check "branch 'main' exists"                                     branch_exists main
check "commit 'Initial commit' exists"                           has_commit "Initial commit"
check "main tracks origin/main (git push -u)"                    main_tracks_origin

echo "Exercise 3:"
check "commit 'Add API health test' is on origin/main"           has_commit "Add API health test" origin/main
check "tests/api.spec.ts exists on origin/main"                  git cat-file -e origin/main:tests/api.spec.ts
check "origin/main has commits by 2 different authors"           two_authors_on_origin

echo "Exercise 4:"
check "commit 'Add cart tests' is on origin/main"                has_commit "Add cart tests" origin/main
check "tests/cart.spec.ts exists on origin/main"                 git cat-file -e origin/main:tests/cart.spec.ts
check "merge commit 'Merge pull request #1 from feature/cart-tests' on origin/main" \
                                                                 has_merge "Merge pull request #1 from feature/cart-tests" origin/main

echo "Exercise 5:"
check "commit 'Add login test' is on origin/main"                has_commit "Add login test" origin/main
check "tests/login.spec.ts exists on origin/main"                git cat-file -e origin/main:tests/login.spec.ts
check "merge commit from pull (\"Merge branch 'main' of ...\")"  has_merge "Merge branch 'main' of" origin/main
check "origin/main has at least 2 merge commits"                 merges_on_origin 2
check "your main is up to date with origin/main (git pull)"      main_in_sync
check "working tree is clean"                                    working_tree_clean

echo "Exercise 6 (bonus):"
bonus "tag v1.0 was pushed to origin"                            remote_tag_v1
bonus "v1.0 is an annotated tag (git tag -a)"                    v1_is_annotated
bonus "feature/cart-tests was deleted from origin"               bash -c 'git log origin/main --format=%s | grep -qxF "Add cart tests" && ! git ls-remote --exit-code --heads origin feature/cart-tests'
bonus "local feature/cart-tests was deleted"                     bash -c 'git log origin/main --format=%s | grep -qxF "Add cart tests" && ! git show-ref --verify --quiet refs/heads/feature/cart-tests'

echo
echo "Result: $PASS passed, $FAIL failed"
[ "$FAIL" -eq 0 ] && echo "🎉 Great job!" || exit 1
