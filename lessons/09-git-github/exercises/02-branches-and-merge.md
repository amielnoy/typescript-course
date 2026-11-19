# Lesson 9 – Topic 02: Branch and Merge – Exercises

> **Where do you work?** In a new folder **outside** the course project: `~/git-practice/02-branches-and-merge`
>
> **Topic example:** `bash lessons/09-git-github/examples/02-branches-and-merge.sh`
>
> **Automatic check** (from the course folder, after finishing all the exercises):
>
> ```bash
> bash lessons/09-git-github/exercises/verify-02-branches-and-merge.sh ~/git-practice/02-branches-and-merge
> ```
>
> Tip: throughout the exercises, run `git log --oneline --graph --all` every now and then to "see" the branches.

## Exercise 1 – Starting point
1. Create the folder `~/git-practice/02-branches-and-merge` and run `git init -b main` in it.
2. Create `README.md` with the line `# E-shop QA tests` and make a commit named `Initial commit`.
3. Run `git branch`.

**Expected result:** `git branch` shows one line: `* main` (the asterisk = the current branch).

## Exercise 2 – A feature branch with two commits
1. Create a branch and switch to it with one command: `git switch -c feature/checkout-tests`.
2. Create `checkout.spec.ts` with the line `test('checkout with credit card', () => {});` and make a commit named `Add checkout tests`.
3. Add the line `test('checkout with coupon', () => {});` to the file and make a commit named `Add coupon test to checkout`.
4. Go back to `main` (`git switch main`) and run `ls`.

**Expected result:** `main` does **not** have `checkout.spec.ts`. `git log --oneline --all --graph` shows `feature/checkout-tests` two commits "ahead of" `main`.

## Exercise 3 – Fast-forward merge and deleting a branch
1. While on `main`, merge: `git merge feature/checkout-tests`.
2. Look at the output – the word `Fast-forward` appears (no merge commit was created, because `main` hasn't moved forward in the meantime).
3. Delete the merged branch: `git branch -d feature/checkout-tests`.

**Expected result:** `git branch` shows only `* main`, and `git log --oneline` shows 3 commits in a straight line (no `Merge`).

## Exercise 4 – A diverged bugfix branch → Merge commit
1. Create a branch `bugfix/flaky-search` with a file `search.spec.ts` containing the line
   `test('search waits for results', () => {});` – commit it as `Fix flaky search test`.
2. Go back to `main`. Create `fixtures/users.json` with the content `[{ "user": "qa-admin" }]` – commit it as `Add test data fixtures`.
   (Now both branches have moved forward – they have "diverged".)
3. Merge: `git merge --no-edit bugfix/flaky-search` – a merge commit named `Merge branch 'bugfix/flaky-search'` is created.
4. Delete the branch: `git branch -d bugfix/flaky-search`.

**Expected result:** `git log --oneline --graph` shows a "diamond" – two lines that join at the merge commit. `main` has both `search.spec.ts` and `fixtures/users.json`.

## Exercise 5 – A branch that hasn't been merged yet
1. Create a branch `feature/reports` with a file `reports.config.ts` containing the line `export const reporter = "html";` – commit it as `Add reports config`.
2. Go back to `main` and try to delete the branch: `git branch -d feature/reports`.
3. Read the error message (`not fully merged`) – Git protects you from losing work. Do **not** delete the branch.
4. Run `git branch --no-merged` and `git branch --merged`.

**Expected result:** `feature/reports` shows up under `--no-merged`, and `reports.config.ts` does **not** exist on `main`.

## Exercise 6 (Bonus) – A merge commit even when fast-forward is possible
1. From `main`, create a branch `docs/how-to-run`, add the line `Run: npx playwright test` to `README.md` and make a commit named `Document how to run tests`.
2. Go back to `main` and merge with `git merge --no-ff --no-edit docs/how-to-run`.
3. Compare `git log --oneline --graph` with exercise 3: even though a fast-forward was possible, a merge commit was created (this is what merging a Pull Request on GitHub looks like).

**Expected result:** a commit named `Merge branch 'docs/how-to-run'` at the tip of `main`.

---

## Comprehension questions
1. What is the difference between `git switch feature/x` and `git switch -c feature/x`?
2. When does `git merge` do a fast-forward, and when is a merge commit created?
3. What happens to the files in the folder when you switch branches with `git switch`?
4. Why did `git branch -d` refuse to delete `feature/reports`? What does `-D` (capital) do, and why should you be careful with it?
5. After you deleted a merged branch – were its commits deleted?

<details>
<summary>Answers</summary>

1. `git switch feature/x` switches to an **existing** branch. `-c` (create) creates a new branch from the current position and switches to it.
2. Fast-forward – when the branch you merge into (`main`) hasn't moved forward since the other branch was created: Git just "moves the pointer" forward. Merge commit – when both branches have moved forward (diverged), or when you explicitly ask for `--no-ff`. A merge commit has two parents.
3. Git updates the files in the folder to the version of the branch you switch to – files that exist only on another branch "disappear" (and are still saved on their own branch).
4. Because its commits are not on `main` yet – deleting it would lose work. `-D` force-deletes without checking; use it only when you really want to throw the work away.
5. No. A branch is just a pointer to a commit. After the merge, the commits are in `main`'s history, and deleting the branch only deletes the name.

</details>
