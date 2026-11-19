#!/usr/bin/env bash
# Lesson 9 – homework solution: "A week in the checkout-tests repo" + runs the automatic checker
# Run:  bash lessons/09-git-github/solutions/homework.sh [target-dir]
#   Without an argument – works in a temporary folder and deletes it at the end.
#   With an argument   – creates inside <target-dir>:
#                 homework-remote.git    ("GitHub" – bare repository)
#                 homework               (your computer)
#                 homework-teammate      (your teammate's computer)
#               and keeps them for you to inspect.
set -e
HERE="$(cd "$(dirname "$0")" && pwd)"

if [ -n "$1" ]; then
  mkdir -p "$1"
  BASE="$(cd "$1" && pwd)"
else
  BASE="$(mktemp -d)"
  trap 'cd / && rm -rf "$BASE"' EXIT
fi
REMOTE="$BASE/homework-remote.git"
REPO="$BASE/homework"
TEAMMATE="$BASE/homework-teammate"
for dir in "$REMOTE" "$REPO" "$TEAMMATE"; do
  if [ -e "$dir" ]; then
    echo "Already exists: $dir – delete it or choose another folder"
    exit 1
  fi
done

export GIT_EDITOR=true GIT_PAGER=cat PAGER=cat

# Local settings for each repository (name, email, and a pull that merges instead of rebasing)
setup_user() {
  git config user.name "$1"
  git config user.email "$2"
  git config commit.gpgsign false
  git config tag.gpgsign false
  git config pull.rebase false
}

# ---------- Step 1 – Project setup (Monday) ----------
git init -q -b main "$REPO"
cd "$REPO"
setup_user "QA Student" "student@example.com"
echo "# Checkout tests" > README.md
printf 'node_modules/\nreports/\n.env\n' > .gitignore
mkdir -p config tests
cat > config/env.ts <<'EOF'
export const config = {
  baseUrl: "https://staging.shop.test",
  timeout: 5000,
};
EOF
echo "test('checkout with card', () => {});" > tests/checkout.spec.ts
echo "API_TOKEN=super-secret-123" > .env
mkdir -p reports && echo "<html>report</html>" > reports/latest.html
git status --short               # .env and reports/ do not show up
git add .
git commit -q -m "chore: initial project setup"

# ---------- Step 2 – Publish to the remote ----------
git init -q --bare -b main "$REMOTE"
git remote add origin "$REMOTE"
git push -q -u origin main

# ---------- Step 3 – Feature branch for cart tests (Tuesday) ----------
git switch -q -c feature/cart-tests
echo "test('add item to cart', () => {});" > tests/cart.spec.ts
git add tests/cart.spec.ts
git commit -q -m "test: add cart tests"
echo "test('empty cart shows message', () => {});" >> tests/cart.spec.ts
git commit -q -am "test: cover empty cart"
git push -q -u origin feature/cart-tests       # "open a Pull Request"

git switch -q main
echo "Run the tests: npx playwright test" >> README.md
git commit -q -am "docs: explain how to run tests"
git merge -q --no-ff feature/cart-tests        # default message: Merge branch 'feature/cart-tests'
git push -q

# ---------- Step 4 – Bug-fix branch with a conflict (Wednesday) ----------
git switch -q -c fix/checkout-timeout
sed 's/timeout: 5000,/timeout: 15000,/' config/env.ts > config/env.tmp && mv config/env.tmp config/env.ts
git commit -q -am "fix: increase checkout timeout"

git switch -q main
sed 's/timeout: 5000,/timeout: Number(process.env.TIMEOUT ?? 5000),/' config/env.ts > config/env.tmp && mv config/env.tmp config/env.ts
git commit -q -am "refactor: read timeout from env"

git merge --no-ff fix/checkout-timeout || echo "(expected: CONFLICT in config/env.ts)"
cat config/env.ts
cat > config/env.ts <<'EOF'
export const config = {
  baseUrl: "https://staging.shop.test",
  timeout: Number(process.env.TIMEOUT ?? 15000),
};
EOF
git add config/env.ts
git commit -q --no-edit                         # Merge branch 'fix/checkout-timeout'
git push -q

# ---------- Step 5 – Your teammate pushes first (Thursday) ----------
git clone -q "$REMOTE" "$TEAMMATE"
cd "$TEAMMATE"
setup_user "QA Teammate" "teammate@example.com"
cat > tests/coupon.spec.ts <<'EOF'
const couponInput = "#coupon";
test('apply 10% coupon', () => {});
EOF
git add tests/coupon.spec.ts
git commit -q -m "test: add coupon tests"
git push -q

cd "$REPO"
echo "test('guest checkout', () => {});" >> tests/checkout.spec.ts
git commit -q -am "test: add guest checkout test"
git push || echo "(expected: push was rejected – fetch first)"
git pull -q --no-rebase --no-edit               # Merge branch 'main' of .../homework-remote
git push -q

# ---------- Step 6 – Revert the bad commit and release v1.0.0 (Friday) ----------
sed "s/^test('checkout with card'/test.skip('checkout with card'/" tests/checkout.spec.ts > tests/checkout.tmp && mv tests/checkout.tmp tests/checkout.spec.ts
git commit -q -am "test: skip flaky checkout test"
git push -q                                     # already public -> undo with revert, not reset
git revert --no-edit HEAD
git push -q
git tag -a v1.0.0 -m "Release 1.0.0"
git push -q origin v1.0.0

# ---------- Step 7 – Hotfix in the middle of your work (stash) ----------
echo "test('checkout with saved card', () => {});" >> tests/checkout.spec.ts
echo "test('pay with PayPal', () => {});" > tests/payment.spec.ts
git status --short
git stash push -u -m "WIP: payment tests"
git stash list

git switch -q -c hotfix/coupon-selector
sed 's/"#coupon"/"[data-testid=coupon-input]"/' tests/coupon.spec.ts > tests/coupon.tmp && mv tests/coupon.tmp tests/coupon.spec.ts
git commit -q -am "fix: update coupon input selector"
git switch -q main
git merge -q --no-ff hotfix/coupon-selector
HOTFIX_MERGE="$(git rev-parse HEAD)"
git push -q

git stash pop
git add tests/checkout.spec.ts tests/payment.spec.ts
git commit -q -m "test: add payment tests"
git push -q

# ---------- Step 8 (Challenge) – Patch release and cleanup ----------
git tag -a v1.0.1 -m "Release 1.0.1 – coupon selector hotfix" "$HOTFIX_MERGE"
git push -q origin v1.0.1
git push -q origin --delete feature/cart-tests
git branch -d feature/cart-tests fix/checkout-timeout hotfix/coupon-selector
git fetch -q --prune
git log --oneline --graph --decorate

echo
bash "$HERE/../exercises/verify-homework.sh" "$REPO"
