# Lesson 9 – Topic 01: Repository and Commit – Exercises

> **Where do you work?** In a new folder **outside** the course project: `~/git-practice/01-first-repository`
>
> **Topic example:** `bash lessons/09-git-github/examples/01-first-repository.sh`
>
> **Automatic check** (from the course folder, after finishing all the exercises):
>
> ```bash
> bash lessons/09-git-github/exercises/verify-01-first-repository.sh ~/git-practice/01-first-repository
> ```
>
> Note: the checker looks for commit messages **exactly** as written here (including upper/lower case).

## Exercise 1 – First repository and a "selective" commit
1. Create the folder `~/git-practice/01-first-repository`, enter it and run `git init -b main`.
2. Create a `tests` folder and in it a file `tests/smoke.spec.ts` with the content:
   ```ts
   import { test } from "@playwright/test";

   test("home page loads", async ({ page }) => {
     await page.goto("/");
   });
   ```
3. In the root, create a file `playwright.config.ts`:
   ```ts
   export default {
     testDir: "./tests",
     retries: 1,
   };
   ```
4. Run `git status --short` – both files are marked `??` (Untracked).
5. Stage **only** the test file (`git add tests/smoke.spec.ts`) and make a commit named `Add smoke test`.

**Expected result:** `git status --short` shows only `?? playwright.config.ts`, and `git show --stat HEAD` shows the commit contains just one file.

## Exercise 2 – Second commit and history
1. Add `playwright.config.ts` and make a commit named `Add Playwright config`.
2. Run `git log --oneline`.

**Expected result:** two lines – `Add Playwright config` at the top (the newest) and `Add smoke test` below it. `git status` shows `nothing to commit, working tree clean`.

## Exercise 3 – diff before and after staging
1. Replace the content of `tests/smoke.spec.ts` with the following version (a title check was added):
   ```ts
   import { test, expect } from "@playwright/test";

   test("home page loads", async ({ page }) => {
     await page.goto("/");
     await expect(page).toHaveTitle(/QA Shop/);
   });
   ```
2. Run `git diff` – you see the lines that were added (`+`) and changed.
3. Run `git add tests/smoke.spec.ts` and then `git diff` again – **empty!** (the change is already staged).
4. Run `git diff --staged` – now the change shows up again.
5. Make a commit named `Add title check to smoke test`.

**Expected result:** `git log --oneline` shows 3 commits.

## Exercise 4 – .gitignore for test artifacts
1. Create "run artifacts" that should not go into Git:
   - `test-results/run-1.txt`
   - `playwright-report/index.html`
   - `debug.log`
   - `.env` with the content `PASSWORD=secret123`
2. Also create `.env.example` with the content `PASSWORD=` – an example file that **should** be in Git.
3. Create a `.gitignore` with these 4 lines:
   ```
   test-results/
   playwright-report/
   *.log
   .env
   ```
4. Run `git status --short` – **only** `.gitignore` and `.env.example` should show up.
5. Check why a specific file is excluded: `git check-ignore -v debug.log`.
6. Add both files and make a commit named `Ignore test artifacts`.

**Expected result:** `git status --short` is empty, and `git ls-files` shows only: `.env.example`, `.gitignore`, `playwright.config.ts`, `tests/smoke.spec.ts`.

## Exercise 5 – Undoing an unsaved change (restore)
1. "Accidentally" change `playwright.config.ts` – for example, change `retries: 1` to `retries: 99`.
2. Run `git status --short` – the file is marked `M`. Run `git diff` to see what changed.
3. Undo the change: `git restore playwright.config.ts`.

**Expected result:** `git status --short` is empty, and `cat playwright.config.ts` shows `retries: 1` again.

## Exercise 6 (Bonus) – Conventional Commits and searching the history
1. Create `docs/test-plan.md` with a few lines about what the smoke test checks (e.g. "home page loads", "title is correct").
2. Make a commit in the Conventional Commits format (see `templates/commit-conventions.md`): `docs: add test plan`.
3. Find which commits touched the test file: `git log --oneline -- tests/smoke.spec.ts` (2 should show up).
4. Show the details of the second-to-last commit: `git show --stat HEAD~1`.

**Expected result:** `git log --oneline` shows 5 commits, the latest being `docs: add test plan`.

---

## Comprehension questions
1. What is the difference between an Untracked file (`??`) and a Modified file (`M`)?
2. Why was `git diff` empty after `git add`, and how can you still see the change?
3. You added `.env` to `.gitignore` – does that delete it from disk? And does it help if `.env` was already included in an earlier commit?
4. Why is it worth keeping `.env.example` in Git?
5. Can you recover, with `git restore`, a change that was never saved in a commit (or in staging)?

<details>
<summary>Answers</summary>

1. Untracked – Git doesn't know the file at all (it was never added). Modified – the file is already tracked (it is in an earlier commit) and has changed since.
2. `git diff` compares the working tree with the staging area. After `add` they are identical. `git diff --staged` compares the staging area with the last commit.
3. No – `.gitignore` only makes Git ignore files that are **not tracked**. The file stays on disk. If it was already committed, you need to stop tracking it (`git rm --cached .env`), and also change the password – it is already in the history.
4. So every team member (and the CI) knows which environment variables the project needs – without exposing secret values.
5. No. `git restore <file>` returns the file to the version in staging / the last commit – a change that was never saved is lost forever. That's why you commit often.

</details>
