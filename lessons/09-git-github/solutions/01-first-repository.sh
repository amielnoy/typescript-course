#!/usr/bin/env bash
# Lesson 9 – Topic 01: solution for the Repository and Commit exercises + runs the automatic checker
# Run:  bash lessons/09-git-github/solutions/01-first-repository.sh [target-dir]
#   Without an argument – works in a temporary folder and deletes it at the end.
#   With an argument   – creates <target-dir>/01-first-repository and keeps it for you to inspect.
set -e
HERE="$(cd "$(dirname "$0")" && pwd)"
NAME="01-first-repository"

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

git init -q -b main "$REPO"
cd "$REPO"
git config user.name "QA Student"
git config user.email "student@example.com"
git config commit.gpgsign false

# ---------- Exercise 1 – selective commit ----------
mkdir -p tests
cat > tests/smoke.spec.ts <<'EOF'
import { test } from "@playwright/test";

test("home page loads", async ({ page }) => {
  await page.goto("/");
});
EOF
cat > playwright.config.ts <<'EOF'
export default {
  testDir: "./tests",
  retries: 1,
};
EOF
git status --short                 # ?? for both files
git add tests/smoke.spec.ts
git commit -q -m "Add smoke test"
git status --short                 # ?? playwright.config.ts

# ---------- Exercise 2 – second commit ----------
git add playwright.config.ts
git commit -q -m "Add Playwright config"
git log --oneline

# ---------- Exercise 3 – diff before and after staging ----------
cat > tests/smoke.spec.ts <<'EOF'
import { test, expect } from "@playwright/test";

test("home page loads", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/QA Shop/);
});
EOF
git diff
git add tests/smoke.spec.ts
git diff --staged
git commit -q -m "Add title check to smoke test"

# ---------- Exercise 4 – .gitignore ----------
mkdir -p test-results playwright-report
echo "run 1 output" > test-results/run-1.txt
echo "<html>report</html>" > playwright-report/index.html
echo "debug output" > debug.log
echo "PASSWORD=secret123" > .env
echo "PASSWORD=" > .env.example
printf 'test-results/\nplaywright-report/\n*.log\n.env\n' > .gitignore
git status --short                 # only .gitignore and .env.example
git check-ignore -v debug.log
git add .gitignore .env.example
git commit -q -m "Ignore test artifacts"
git ls-files

# ---------- Exercise 5 – restore ----------
sed -i.bak 's/retries: 1,/retries: 99,/' playwright.config.ts && rm playwright.config.ts.bak
git status --short                 # M playwright.config.ts
git restore playwright.config.ts
git status --short                 # empty

# ---------- Exercise 6 (Bonus) ----------
mkdir -p docs
printf '# Smoke test plan\n- home page loads\n- title is correct\n' > docs/test-plan.md
git add docs/test-plan.md
git commit -q -m "docs: add test plan"
git log --oneline -- tests/smoke.spec.ts
git show --stat HEAD~1
git log --oneline

echo
bash "$HERE/../exercises/verify-$NAME.sh" "$REPO"
