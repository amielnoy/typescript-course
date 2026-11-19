# Lesson 9 – Homework: A Week in the `checkout-tests` Repo

> **Where do you work?** **Outside** the course project, in three folders:
>
> | Folder | Plays the role of |
> |---|---|
> | `~/git-practice/homework` | your computer (this is the repo the checker looks at) |
> | `~/git-practice/homework-remote.git` | "GitHub" – a local bare repository |
> | `~/git-practice/homework-teammate` | your teammate's computer |
>
> **Automatic check** (from the course folder – you can run it after every step; steps you haven't done yet will show ✘):
>
> ```bash
> bash lessons/09-git-github/exercises/verify-homework.sh ~/git-practice/homework
> ```
>
> **Rules for this homework**
> - This sheet tells you **what** to reach, not which commands to type. Use the topic sheets (01–05) if you get stuck.
> - Use the commit messages **exactly** as written – the checker looks for them. Every commit you write yourself must follow
>   [Conventional Commits](../templates/commit-conventions.md) (`test: ...`, `fix: ...`, `docs: ...`, ...). Merge and revert
>   commits keep Git's default message.
> - Every merge into `main` in this homework is a **real merge commit** – never a fast-forward.
> - After every step, `main` should be pushed (the checker expects `main` = `origin/main` at the end).
> - If a text editor opens for a merge/revert message – save and close it.

## Scenario
You have just joined the QA automation team of an online shop. Your job this week: start the team's new
`checkout-tests` repository and keep it healthy while you and a teammate add tests, fix a bug, survive a bad commit,
ship a release and handle an urgent hotfix – exactly like a real week at work, only everything runs on your computer.

---

## Step 1 – Monday: set up the project
Create `~/git-practice/homework` as a new repository on branch `main` with:

- `README.md` – `# Checkout tests`
- `config/env.ts` – exactly:
  ```ts
  export const config = {
    baseUrl: "https://staging.shop.test",
    timeout: 5000,
  };
  ```
- `tests/checkout.spec.ts` – `test('checkout with card', () => {});`
- `.gitignore` that ignores `node_modules/`, `reports/` and `.env`

Your local machine also has a secrets file `.env` (`API_TOKEN=super-secret-123`) and a test report `reports/latest.html` – create them too.
They must **never** reach Git, not even in the first commit.

Commit everything that should be committed in **one** commit: `chore: initial project setup`.

**Expected end state:** one commit; `.gitignore` is already inside it; `git status --short` is empty although `.env` and `reports/` exist on disk.

## Step 2 – Monday: publish to "GitHub"
Create the bare repository `~/git-practice/homework-remote.git` (branch `main`), connect it as `origin` and push `main`
so that from now on a plain `git push` / `git pull` works.

**Expected end state:** `git branch -vv` shows `main` tracking `[origin/main]`.

## Step 3 – Tuesday: new tests on a feature branch
1. On a branch `feature/cart-tests` create `tests/cart.spec.ts` in **two** commits:
   - `test: add cart tests` – `test('add item to cart', () => {});`
   - `test: cover empty cart` – adds `test('empty cart shows message', () => {});`
2. Push the branch to `origin` (in real life you would now open a Pull Request).
3. Meanwhile, on `main`, add a line `Run the tests: npx playwright test` to `README.md` – commit `docs: explain how to run tests`.
4. "Approve the PR": merge `feature/cart-tests` into `main` so that a merge commit is **always** created, even if Git could fast-forward. Push.

**Expected end state:** `git log --oneline --graph` shows the two cart commits on a side line joined by `Merge branch 'feature/cart-tests'`.

## Step 4 – Wednesday: a bug fix that conflicts
1. Checkout tests time out on staging. On a branch `fix/checkout-timeout` change the timeout to `15000` – commit `fix: increase checkout timeout`.
2. Before you merge, the team lead asks to make the timeout configurable. On `main` change the **same line** to
   `timeout: Number(process.env.TIMEOUT ?? 5000),` – commit `refactor: read timeout from env`.
3. Merge `fix/checkout-timeout` into `main`. You will get a conflict. Resolve it so the file keeps **both** intentions
   (configurable **and** the new default). The final `config/env.ts` must be exactly:
   ```ts
   export const config = {
     baseUrl: "https://staging.shop.test",
     timeout: Number(process.env.TIMEOUT ?? 15000),
   };
   ```
4. Finish the merge (default message) and push.

**Expected end state:** a merge commit `Merge branch 'fix/checkout-timeout'`, no `<<<<<<<` / `=======` / `>>>>>>>` anywhere, no merge in progress.

## Step 5 – Thursday: your teammate pushes first
1. Simulate your teammate: clone the remote to `~/git-practice/homework-teammate`, and set **in that repository only**
   `user.name` = `QA Teammate`, `user.email` = `teammate@example.com`.
2. As the teammate: create `tests/coupon.spec.ts`:
   ```ts
   const couponInput = "#coupon";
   test('apply 10% coupon', () => {});
   ```
   commit `test: add coupon tests` and push.
3. Back in **your** repo (without pulling first!): add `test('guest checkout', () => {});` as a new line in
   `tests/checkout.spec.ts`, commit `test: add guest checkout test` and try to push. It will be rejected.
4. Get your teammate's work **with a merge** (not a rebase), then push.

**Expected end state:** `origin/main` has commits by two authors and a merge commit `Merge branch 'main' of ...`.

## Step 6 – Friday: a bad commit, then the release
1. Someone "fixed" a flaky test by silencing it: in `tests/checkout.spec.ts` change `test('checkout with card'` to
   `test.skip('checkout with card'`, commit `test: skip flaky checkout test` and **push** it.
2. The team decides skipping is not acceptable. The commit is already public – undo it **without rewriting history**, and push.
3. Release! Create an **annotated** tag `v1.0.0` (message `Release 1.0.0`) on the current `main` and push the tag.

**Expected end state:** both `test: skip flaky checkout test` and `Revert "test: skip flaky checkout test"` are in the history,
`test.skip` appears nowhere in the file, and `git ls-remote --tags origin` shows `v1.0.0`.

## Step 7 – Next Monday: hotfix in the middle of your work
1. Start new work on `main` (do **not** commit): add `test('checkout with saved card', () => {});` to `tests/checkout.spec.ts`,
   and create a **new** file `tests/payment.spec.ts` with `test('pay with PayPal', () => {});`.
2. Production alert! The developers renamed the coupon field and every coupon test fails. Put **both** of your unfinished
   changes aside (including the new, untracked file) as a stash named `WIP: payment tests`.
3. On a branch `hotfix/coupon-selector` change `"#coupon"` to `"[data-testid=coupon-input]"` in `tests/coupon.spec.ts`,
   commit `fix: update coupon input selector`, merge it into `main` (merge commit again) and push.
4. Bring your work back, remove the stash from the list, and commit both files in **one** commit `test: add payment tests`. Push.

**Expected end state:** `git stash list` has no `WIP: payment tests`, the hotfix merge comes **before** `test: add payment tests`,
and `git status --short` is empty.

## Step 8 (Challenge) – Patch release and cleanup
1. The hotfix deserves its own release: create an annotated tag `v1.0.1` on the **hotfix merge commit** – not on the latest commit
   (find its hash with `git log`). Push the tag.
2. Clean up: delete the merged branches `feature/cart-tests`, `fix/checkout-timeout` and `hotfix/coupon-selector`
   locally, delete the ones you pushed (at least `feature/cart-tests`) on `origin` too, and remove stale `origin/*` references.

**Expected end state:** `git branch -a` shows only `main` and `origin/main` (maybe `origin/HEAD`), and `git ls-remote --tags origin` shows both tags.
These checks appear as ○ (optional) in the checker until you do them.

Finally, admire your week: `git log --oneline --graph --decorate --all`.

---

## Reflection questions
1. Why did we insist on a merge commit (`--no-ff`) for every branch? What does it give a QA team that reads the history later?
2. In Step 4, why couldn't Git resolve the conflict by itself? Why was simply choosing "ours" or "theirs" wrong here?
3. In Step 5, why was your push rejected, and why is `git push --force` the wrong way out?
4. In Step 6, why `git revert` and not `git reset --hard HEAD~1`?
5. In Step 7, what would a plain `git stash` (without `-u`) have done with `tests/payment.spec.ts`?
6. Suppose `.env` had been committed in Step 1 and you only added it to `.gitignore` afterwards. Is the secret safe now? What must you do?

<details>
<summary>Answers</summary>

1. With `--no-ff` every branch stays a visible "bubble" with one merge commit. You can see which commits belonged to which
   feature/fix, revert a whole feature with a single `git revert -m 1 <merge>`, and know exactly when a fix reached `main`.
   A fast-forward would flatten the commits into `main`, and the branch would disappear from the history.
2. Both branches changed the **same line** from the same starting point, so Git can't know which version is right – only a human
   who understands the intent can decide. "Ours" would lose the bug fix (15000), "theirs" would lose the configurable timeout;
   the correct resolution combines both.
3. `origin/main` already had your teammate's commit, which you didn't have. Pushing would have overwritten it, so Git refuses.
   `--force` would really overwrite it and delete your teammate's work. The right way: `git pull` (combine) and then `git push`.
4. The bad commit was already pushed – others may have pulled it. `revert` adds a new commit that undoes it, so history stays the
   same for everyone. `reset` would rewrite history, and pushing it would require `--force` (see question 3).
5. A plain `git stash` only takes changes to files Git already tracks. `payment.spec.ts` was untracked, so it would have stayed
   in the folder – and could easily end up in the hotfix commit by mistake. `-u` (`--include-untracked`) stashes it too.
6. No. `.gitignore` only affects files that are **not** tracked yet; the secret stays in the history (and on the remote) forever.
   You must `git rm --cached .env`, commit, and above all **rotate the secret** (create a new token and revoke the old one).
   Cleaning the history (e.g. `git filter-repo`) is possible but rewrites history for everyone – and the old token is still leaked.

</details>
