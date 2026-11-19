#!/usr/bin/env bash
# Automatic checker – Lesson 9 homework: "A week in the checkout-tests repo"
# Usage:  bash lessons/09-git-github/exercises/verify-homework.sh ~/git-practice/homework
#
# The checker runs git fetch from origin (updates only origin/* – does not touch your files and branches).
# ✔ = passed, ✘ = failed (required), ○ = challenge check not done yet (optional).

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

# Challenge check – does not fail if it wasn't done
challenge() {
  local description="$1"
  shift
  if "$@" >/dev/null 2>&1; then
    echo "  ✔ $description (challenge)"
  else
    echo "  ○ $description (challenge – optional)"
  fi
}

not() { ! "$@"; }

has_commit() { git log "${2:-main}" --format=%s 2>/dev/null | grep -qxF "$1"; }
has_merge() { git log "${2:-main}" --merges --format=%s 2>/dev/null | grep -qF "$1"; }
branch_exists() { git show-ref --verify --quiet "refs/heads/$1"; }
working_tree_clean() { git rev-parse -q --verify HEAD >/dev/null && test -z "$(git status --porcelain 2>/dev/null)"; }
file_has() { git show "${3:-main}:$2" 2>/dev/null | grep -qF -- "$1"; }

# Hash of the (newest) commit on main whose subject is exactly $1
commit_hash() { git log main --format='%H%x09%s' 2>/dev/null | awk -F '\t' -v m="$1" '$2 == m { print $1; exit }'; }
# Hash of the (newest) merge commit on main whose subject contains $1
merge_hash() { git log main --merges --format='%H%x09%s' 2>/dev/null | awk -F '\t' -v m="$1" 'index($2, m) { print $1; exit }'; }

# --no-ff: the branch's commits must NOT be on main's first-parent line (otherwise it was a fast-forward)
merged_no_ff() {
  local merge
  merge="$(merge_hash "$1")"
  [ -n "$merge" ] || return 1
  shift
  for subject in "$@"; do
    has_commit "$subject" || return 1
    git log main --first-parent --format=%s | grep -qxF "$subject" && return 1
  done
  return 0
}

# ---- Step 1 ----
root_subject_is() { test "$(git log main --max-parents=0 --format=%s 2>/dev/null | tail -n 1)" = "$1"; }
root_has_gitignore() {
  local root
  root="$(git rev-list --max-parents=0 main 2>/dev/null | tail -n 1)"
  [ -n "$root" ] && git cat-file -e "$root:.gitignore"
}
secrets_never_committed() {
  git rev-parse -q --verify main >/dev/null || return 1
  ! git log --all --format= --name-only 2>/dev/null | grep -qE '^(\.env$|reports/|node_modules/)'
}
env_on_disk_and_ignored() { test -f .env && git check-ignore -q .env && ! git ls-files --error-unmatch .env; }

# ---- Step 2 ----
origin_reachable() { git ls-remote origin >/dev/null; }
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

# ---- Step 4 ----
# Compares config/env.ts with the expected content, ignoring spaces/tabs/CR (indentation is not graded)
config_resolved() {
  local expected actual
  expected="$(printf '%s\n' \
    'export const config = {' \
    '  baseUrl: "https://staging.shop.test",' \
    '  timeout: Number(process.env.TIMEOUT ?? 15000),' \
    '};' | tr -d ' \t\r')"
  actual="$(git show main:config/env.ts 2>/dev/null | tr -d ' \t\r' | sed '/^$/d')"
  test -n "$actual" && test "$actual" = "$expected"
}
no_conflict_markers() {
  git rev-parse -q --verify main >/dev/null || return 1
  ! git grep -qE '^(<<<<<<<|=======|>>>>>>>)' main -- .
}
no_merge_in_progress() { git rev-parse -q --verify HEAD >/dev/null && ! test -f "$(git rev-parse --git-dir)/MERGE_HEAD"; }

# ---- Step 5 ----
two_authors_on_origin() { test "$(git log origin/main --format=%an 2>/dev/null | sort -u | wc -l)" -ge 2; }

# ---- Step 6 ----
is_annotated() { test "$(git cat-file -t "$1" 2>/dev/null)" = "tag"; }
tag_on_origin() {
  local remote_hash
  remote_hash="$(git ls-remote origin "refs/tags/$1^{}" 2>/dev/null | cut -f1)"
  [ -z "$remote_hash" ] && remote_hash="$(git ls-remote origin "refs/tags/$1" 2>/dev/null | cut -f1)"
  test -n "$remote_hash" && test "$remote_hash" = "$(git rev-parse "$1^{commit}" 2>/dev/null)"
}
tag_on_main() { git merge-base --is-ancestor "$1^{commit}" main; }
release_includes_revert() {
  local revert
  revert="$(commit_hash 'Revert "test: skip flaky checkout test"')"
  [ -n "$revert" ] && git merge-base --is-ancestor "$revert" "v1.0.0^{commit}"
}
release_on_main_with_revert() { tag_on_main v1.0.0 && release_includes_revert; }
# The file must exist there AND have no test.skip
no_skip_in() { git cat-file -e "$1:tests/checkout.spec.ts" && ! git show "$1:tests/checkout.spec.ts" | grep -qF "test.skip"; }

# ---- Step 7 ----
commit_files() {
  local hash
  hash="$(commit_hash "$1")"
  [ -n "$hash" ] && git show --name-only --format= "$hash" | sort | tr '\n' ' '
}
payment_commit_files() { test "$(commit_files 'test: add payment tests')" = "tests/checkout.spec.ts tests/payment.spec.ts "; }
payment_after_hotfix() {
  local merge payment
  merge="$(merge_hash 'hotfix/coupon-selector')"
  payment="$(commit_hash 'test: add payment tests')"
  [ -n "$merge" ] && [ -n "$payment" ] && git merge-base --is-ancestor "$merge" "$payment" && [ "$merge" != "$payment" ]
}
stash_exists() { git stash list --format='%gs' 2>/dev/null | grep -qF "$1"; }
# Only counts once the payment work was actually committed (otherwise an untouched repo would "pass")
stash_was_popped() { has_commit "test: add payment tests" && ! stash_exists "WIP: payment tests"; }

# ---- Whole week ----
CONVENTIONAL='^((feat|fix|test|docs|chore|refactor|ci|perf|build|style)(\([a-z0-9._/-]+\))?!?: .+|Revert ".+")$'
bad_commit_messages() { git log main --no-merges --format=%s 2>/dev/null | grep -vE "$CONVENTIONAL"; }
messages_are_conventional() {
  test "$(git rev-list --no-merges --count main 2>/dev/null)" -ge 1 && test -z "$(bad_commit_messages)"
}
main_in_sync() {
  local local_main remote_main
  local_main="$(git rev-parse -q --verify main)" && remote_main="$(git rev-parse -q --verify origin/main)" || return 1
  test "$local_main" = "$remote_main"
}

# ---- Step 8 (challenge) ----
v101_on_hotfix_merge() {
  local merge
  merge="$(merge_hash 'hotfix/coupon-selector')"
  [ -n "$merge" ] && test "$(git rev-parse 'v1.0.1^{commit}' 2>/dev/null)" = "$merge"
}
MERGED_BRANCHES="feature/cart-tests fix/checkout-timeout hotfix/coupon-selector"
merged_branches_deleted_locally() {
  merge_hash 'hotfix/coupon-selector' | grep -q . || return 1
  for b in $MERGED_BRANCHES; do branch_exists "$b" && return 1; done
  return 0
}
merged_branches_deleted_on_origin() {
  merge_hash 'hotfix/coupon-selector' | grep -q . || return 1
  origin_reachable || return 1
  for b in $MERGED_BRANCHES; do git ls-remote --exit-code --heads origin "$b" && return 1; done
  return 0
}

cd "$REPO" 2>/dev/null || { echo "Folder not found: $REPO"; exit 1; }
echo "Checking repository: $(pwd)"
GIT_TERMINAL_PROMPT=0 git fetch -q origin >/dev/null 2>&1

echo "Step 1 – Project setup:"
check "folder is a git repository"                                   git rev-parse --git-dir
check "branch 'main' exists"                                         branch_exists main
check "first commit is 'chore: initial project setup'"               root_subject_is "chore: initial project setup"
check ".gitignore is already part of the first commit"               root_has_gitignore
check "README.md, config/env.ts, tests/checkout.spec.ts are on main" bash -c 'git cat-file -e main:README.md && git cat-file -e main:config/env.ts && git cat-file -e main:tests/checkout.spec.ts'
check ".gitignore ignores node_modules/, reports/ and .env"           bash -c 'git check-ignore -q node_modules/x.js && git check-ignore -q reports/latest.html && git check-ignore -q .env'
check ".env exists on disk, ignored and untracked"                   env_on_disk_and_ignored
check ".env / reports / node_modules were never committed (any branch)" secrets_never_committed

echo "Step 2 – Publish to the remote:"
check "remote 'origin' is configured"                                git remote get-url origin
check "origin is reachable (git ls-remote origin)"                   origin_reachable
check "origin is a bare repository (or a GitHub URL)"                origin_is_bare
check "main tracks origin/main (git push -u)"                        main_tracks_origin

echo "Step 3 – Feature branch for cart tests:"
check "commits 'test: add cart tests' and 'test: cover empty cart' are on main" \
                                                                     bash -c 'git log main --format=%s | grep -qxF "test: add cart tests" && git log main --format=%s | grep -qxF "test: cover empty cart"'
check "commit 'docs: explain how to run tests' is on main"           has_commit "docs: explain how to run tests"
check "merge commit for feature/cart-tests is on main"               has_merge "feature/cart-tests"
check "feature/cart-tests was merged with --no-ff (no fast-forward)" merged_no_ff "feature/cart-tests" "test: add cart tests" "test: cover empty cart"
check "tests/cart.spec.ts has both cart tests"                       bash -c 'git show main:tests/cart.spec.ts | grep -qF "add item to cart" && git show main:tests/cart.spec.ts | grep -qF "empty cart shows message"'

echo "Step 4 – Bug-fix branch with a conflict:"
check "commit 'refactor: read timeout from env' is on main"          has_commit "refactor: read timeout from env"
check "commit 'fix: increase checkout timeout' is on main"           has_commit "fix: increase checkout timeout"
check "merge commit for fix/checkout-timeout is on main"             has_merge "fix/checkout-timeout"
check "config/env.ts has exactly the resolved content"               config_resolved
check "no conflict markers in any file on main"                      no_conflict_markers
check "no merge in progress"                                         no_merge_in_progress

echo "Step 5 – Your teammate pushed first:"
check "commit 'test: add coupon tests' is on origin/main"            has_commit "test: add coupon tests" origin/main
check "commit 'test: add guest checkout test' is on origin/main"     has_commit "test: add guest checkout test" origin/main
check "origin/main has commits by 2 different authors"               two_authors_on_origin
check "merge commit from pull (\"Merge branch 'main' of ...\")"      has_merge "Merge branch 'main' of"

echo "Step 6 – Revert the bad commit and release v1.0.0:"
check "the bad commit 'test: skip flaky checkout test' is still in history" has_commit "test: skip flaky checkout test"
check "commit 'Revert \"test: skip flaky checkout test\"' is on main" has_commit 'Revert "test: skip flaky checkout test"'
check "tests/checkout.spec.ts on main has no test.skip"              no_skip_in main
check "tag v1.0.0 exists and is annotated (git tag -a)"              is_annotated v1.0.0
check "v1.0.0 is on main and already includes the revert"            release_on_main_with_revert
check "v1.0.0 has no test.skip in tests/checkout.spec.ts"            no_skip_in v1.0.0
check "v1.0.0 was pushed to origin"                                  tag_on_origin v1.0.0

echo "Step 7 – Hotfix in the middle of your work (stash):"
check "commit 'fix: update coupon input selector' is on main"        has_commit "fix: update coupon input selector"
check "hotfix/coupon-selector was merged with --no-ff"               merged_no_ff "hotfix/coupon-selector" "fix: update coupon input selector"
check "tests/coupon.spec.ts uses [data-testid=coupon-input]"         file_has '[data-testid=coupon-input]' tests/coupon.spec.ts
check "'test: add payment tests' has checkout.spec.ts AND payment.spec.ts" payment_commit_files
check "'test: add payment tests' comes after the hotfix merge"       payment_after_hotfix
check "tests/checkout.spec.ts has the saved-card test"               file_has "checkout with saved card" tests/checkout.spec.ts
check "stash 'WIP: payment tests' was popped (not in the list)"      stash_was_popped

echo "The whole week:"
check "every non-merge commit on main follows Conventional Commits"  messages_are_conventional
if ! messages_are_conventional >/dev/null 2>&1; then
  bad_commit_messages | sed 's/^/      not conventional: /'
fi
check "main is in sync with origin/main (everything pushed)"         main_in_sync
check "working tree is clean"                                        working_tree_clean

echo "Step 8 (Challenge) – Patch release and cleanup:"
challenge "tag v1.0.1 is annotated"                                  is_annotated v1.0.1
challenge "v1.0.1 points to the hotfix merge commit"                 v101_on_hotfix_merge
challenge "v1.0.1 was pushed to origin"                              tag_on_origin v1.0.1
challenge "merged branches were deleted locally"                     merged_branches_deleted_locally
challenge "merged branches were deleted on origin"                   merged_branches_deleted_on_origin

echo
echo "Result: $PASS passed, $FAIL failed"
[ "$FAIL" -eq 0 ] && echo "🎉 Great job!" || exit 1
