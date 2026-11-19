#!/usr/bin/env bash
# Lesson 9 – Topic 03: solution for the Merge Conflict exercises + runs the automatic checker
# Run:  bash lessons/09-git-github/solutions/03-merge-conflict.sh [target-dir]
#   Without an argument – works in a temporary folder and deletes it at the end.
#   With an argument   – creates <target-dir>/03-merge-conflict and keeps it for you to inspect.
set -e
HERE="$(cd "$(dirname "$0")" && pwd)"
NAME="03-merge-conflict"

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

# Replaces text in a file (works on both macOS and Git Bash)
replace() {
  sed -i.bak "s|$1|$2|" "$3" && rm "$3.bak"
}

# ---------- Exercise 1 – settings file ----------
git init -q -b main "$REPO"
cd "$REPO"
git config user.name "QA Student"
git config user.email "student@example.com"
git config commit.gpgsign false
cat > settings.ts <<'EOF'
export const settings = {
  retries: 0,
  workers: 4,
  headless: true,
  timeout: 30000,
  browser: "chromium",
};
EOF
git add settings.ts
git commit -q -m "Add test settings"

# ---------- Exercise 2 – different lines, no conflict ----------
git switch -q -c feature/firefox
replace 'browser: "chromium",' 'browser: "firefox",' settings.ts
git commit -q -am "Run tests on Firefox"
git switch -q main
replace 'workers: 4,' 'workers: 2,' settings.ts
git commit -q -am "Reduce workers to 2"
git merge -q --no-edit feature/firefox
cat settings.ts

# ---------- Exercise 3 – conflict on the same line, manual resolution ----------
git switch -q -c feature/ci-retries
replace 'retries: 0,' 'retries: 2,' settings.ts
git commit -q -am "Use 2 retries"
git switch -q main
replace 'retries: 0,' 'retries: 1,' settings.ts
git commit -q -am "Use 1 retry"
git merge feature/ci-retries || true          # conflict expected
git status --short                            # UU settings.ts
cat settings.ts
cat > settings.ts <<'EOF'
export const settings = {
  retries: process.env.CI ? 2 : 0,
  workers: 2,
  headless: true,
  timeout: 30000,
  browser: "firefox",
};
EOF
git add settings.ts
git commit -q --no-edit

# ---------- Exercise 4 – picking a whole side (--theirs) ----------
mkdir -p test-data
printf 'username,password\nadmin,Admin123\nviewer,View123\n' > test-data/users.csv
git add test-data/users.csv
git commit -q -m "Add users test data"
git switch -q -c feature/new-users
replace 'admin,Admin123' 'admin,NewPass2026' test-data/users.csv
git commit -q -am "Update admin password"
git switch -q main
replace 'admin,Admin123' 'admin,Temp000' test-data/users.csv
git commit -q -am "Use temporary admin password"
git merge feature/new-users || true           # conflict expected
git checkout --theirs test-data/users.csv     # the feature/new-users version
git add test-data/users.csv
git commit -q --no-edit
cat test-data/users.csv

# ---------- Exercise 5 – merge --abort ----------
git switch -q -c experiment/long-timeout
replace 'timeout: 30000,' 'timeout: 120000,' settings.ts
git commit -q -am "Increase timeout to 2 minutes"
git switch -q main
replace 'timeout: 30000,' 'timeout: 60000,' settings.ts
git commit -q -am "Increase timeout to 60s"
git merge experiment/long-timeout || true     # conflict expected
git merge --abort
git status --short                            # clean
git branch --no-merged                        # experiment/long-timeout

# ---------- Exercise 6 (Bonus) – modify/delete ----------
echo "test('old checkout flow', () => {});" > legacy.spec.ts
git add legacy.spec.ts
git commit -q -m "Add legacy test"
git switch -q -c cleanup/remove-legacy
git rm -q legacy.spec.ts
git commit -q -m "Remove legacy test"
git switch -q main
echo "test('old checkout with coupon', () => {});" >> legacy.spec.ts
git commit -q -am "Update legacy test"
git merge cleanup/remove-legacy || true       # CONFLICT (modify/delete)
git rm -q legacy.spec.ts
git commit -q --no-edit
git log --oneline --graph --all

echo
bash "$HERE/../exercises/verify-$NAME.sh" "$REPO"
