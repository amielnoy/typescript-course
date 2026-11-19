# Lesson 9 – Topic 05: Fixing Mistakes and stash – Exercises

> **Where do you work?** In a new folder **outside** the course project: `~/git-practice/05-undo-and-stash`
>
> **Topic example:** `bash lessons/09-git-github/examples/05-undo-and-stash.sh`
>
> **Automatic check** (from the course folder, after finishing all the exercises):
>
> ```bash
> bash lessons/09-git-github/exercises/verify-05-undo-and-stash.sh ~/git-practice/05-undo-and-stash
> ```
>
> Rule of thumb: `amend` and `reset` – **only** on commits that haven't been pushed yet. For what's already on the remote, use `revert`.

## Exercise 1 – amend: fixing a message and a forgotten file
1. Create `~/git-practice/05-undo-and-stash`, run `git init -b main`, create `README.md` with `# Undo practice` and make a commit named `Initial commit`.
2. Create `tests/login.spec.ts` with `test('login with valid user', () => {});` and make a commit with a **typo**: `Add logn test`.
3. You've found two problems: the message is wrong, and you forgot the Page Object file. Create `pages/login.page.ts` with
   `export const loginButton = "#login-btn";`
4. Fix everything in one commit: `git add pages/login.page.ts` and then `git commit --amend -m "Add login test"`.

**Expected result:** `git log --oneline` shows 2 commits – `Add login test` and `Initial commit` (no `Add logn test`). `git show --stat HEAD` shows **both** files.

## Exercise 2 – unstage and restore
1. Create `tests/cart.spec.ts` with `test('add item to cart', () => {});`, and also a private file `local-notes.txt` with `ask dev about flaky cart test`.
2. Run `git add .` and then `git status --short` – both files are marked `A`. Oops – you don't want the private notes in Git!
3. Remove it from staging without deleting it: `git restore --staged local-notes.txt` (now it's marked `??`).
4. Make a commit named `Add cart test` (only the test file).
5. Add `local-notes.txt` to `.gitignore` and make a commit named `Ignore local notes`.
6. Accidentally "break" `tests/cart.spec.ts` (add a line `BROKEN`) and undo it with `git restore tests/cart.spec.ts`.

**Expected result:** `git status --short` is empty, `local-notes.txt` still exists on disk but was never committed, and the test file has no `BROKEN`.

## Exercise 3 – revert: safely undoing a commit
1. Create `tests/checkout.spec.ts` with `test('checkout', () => {});` – commit it as `Add checkout test`.
2. Someone "silenced" the test: change the line to `test.skip('checkout', () => {});` – commit it as `Skip checkout test`.
3. Assume this commit has already been pushed to GitHub. Undo it the safe way: `git revert --no-edit HEAD`.

**Expected result:** `git log --oneline` shows a new commit `Revert "Skip checkout test"` – **and also** the original `Skip checkout test` (revert doesn't delete history). The file has no `test.skip`.

## Exercise 4 – reset --hard and the reflog safety net
1. Create `experiment.ts` with `export const experiment = 1;` – commit it as `WIP experiment 1`.
2. Change it to `export const experiment = 2;` – commit it as `WIP experiment 2`.
3. The experiment failed and wasn't pushed anywhere – throw away both commits: `git reset --hard HEAD~2`.
4. Check with `git log --oneline` that they've "disappeared". Now run `git reflog` – they're still there!
5. You've partly changed your mind and want to keep the experiment aside: create a branch from the commit you found in the reflog:
   `git branch rescue/experiment <hash-of-WIP experiment 2>` (or `git branch rescue/experiment HEAD@{1}`).

**Expected result:** `main` has no `WIP experiment` and no `experiment.ts`. `git log --oneline rescue/experiment` shows both experiment commits.

## Exercise 5 – stash: an urgent bug in the middle of your work
1. Start working: add the line `test('login with wrong password', () => {});` to `tests/login.spec.ts` (**without** committing).
2. An urgent bug comes in! "Hide" your work: `git stash push -m "WIP: login edge cases"`. Run `git status` (clean) and `git stash list`.
3. Create a branch `hotfix/login-selector`, change the selector in `pages/login.page.ts` to `"[data-testid=login]"` and make a commit named `Fix login selector`.
4. Go back to `main`, merge `hotfix/login-selector` and delete the branch (`git branch -d`).
5. Bring your work back: `git stash pop`, finish it and make a commit named `Add login edge cases`.

**Expected result:** `main` has both `Fix login selector` and `Add login edge cases`, and `git stash list` no longer contains `WIP: login edge cases`.

## Exercise 6 – stash with a new (untracked) file, to continue later
1. Start a new feature: add the line `Slack reporter: TODO` to `README.md`, and create a **new** file `reporters/slack-reporter.ts` with `export class SlackReporter {}`.
2. Run `git status --short` – ` M README.md` and `?? reporters/`. Note: a plain `git stash` does **not** take files Git doesn't know about.
3. Stash both of them: `git stash push -u -m "WIP: slack reporter"` (`-u` = include untracked).
4. Do **not** `pop` – this is work for later. Run `git stash list` and `git stash show stash@{0}`.

**Expected result:** `git status --short` is empty, `reporters/` doesn't exist in the folder, and `git stash list` shows `stash@{0}: On main: WIP: slack reporter`.

---

## Comprehension questions
1. Why is it forbidden (or almost forbidden) to `amend` or `reset` a commit that has already been pushed?
2. What is the difference between `git restore <file>` and `git restore --staged <file>`?
3. What is the difference between `git revert` and `git reset`?
4. What is the difference between `git reset --soft`, `--mixed` (the default) and `--hard`?
5. What is the difference between `git stash pop` and `git stash apply`?
6. How do you bring back a commit that was accidentally "deleted" with `reset --hard`?

<details>
<summary>Answers</summary>

1. Both **rewrite history** – they create new commits in place of the existing ones. If others have already pulled the old ones, the histories will clash, and pushing will require `--force`, which may delete other people's work.
2. `git restore <file>` – throws away the changes to the file in the working folder (irreversible!). `git restore --staged <file>` – only removes it from staging; the change stays in the file.
3. `revert` creates a **new** commit that does the opposite – the history is kept, so it's safe after a push. `reset` moves the branch backwards – the commits "disappear" from the branch; only for local work.
4. `--soft` – moves the branch; the changes stay in staging. `--mixed` – the changes stay in the files but not in staging. `--hard` – throws the changes away completely (from the files too).
5. `pop` applies the stash **and deletes** it from the list. `apply` applies it and keeps it in `git stash list` (useful when you want to apply it to several branches).
6. With `git reflog` – a log of every place HEAD has been. Find the hash and create a branch from it (`git branch <name> <hash>`) or go back to it (`git reset --hard <hash>`). The reflog is local only and is kept for a limited time.

</details>
