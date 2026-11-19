# Lesson 9 – Topic 03: Merge Conflict – Exercises

> **Where do you work?** In a new folder **outside** the course project: `~/git-practice/03-merge-conflict`
>
> **Topic example:** `bash lessons/09-git-github/examples/03-merge-conflict.sh`
>
> **Automatic check** (from the course folder, after finishing all the exercises):
>
> ```bash
> bash lessons/09-git-github/exercises/verify-03-merge-conflict.sh ~/git-practice/03-merge-conflict
> ```
>
> All merges in these exercises are done **into `main`** (first `git switch main`, then `git merge <branch>`).
> If a text editor opens for the merge message – save and close it (or use `--no-edit`).

## Exercise 1 – A settings file for the tests
1. Create the folder `~/git-practice/03-merge-conflict` and run `git init -b main` in it.
2. Create a file `settings.ts` with the following **exact** content:
   ```ts
   export const settings = {
     retries: 0,
     workers: 4,
     headless: true,
     timeout: 30000,
     browser: "chromium",
   };
   ```
3. Make a commit named `Add test settings`.

**Expected result:** `git log --oneline` shows one commit.

## Exercise 2 – Changes on different lines = no conflict
1. Create a branch `feature/firefox` and change the line `browser: "chromium",` to `browser: "firefox",` in it. Commit it as `Run tests on Firefox`.
2. Go back to `main` and change `workers: 4,` to `workers: 2,`. Commit it as `Reduce workers to 2`.
3. Merge: `git merge --no-edit feature/firefox`.

**Expected result:** the merge succeeds **without a conflict** (each branch changed a different line) and a merge commit is created. `settings.ts` now has both `workers: 2` and `browser: "firefox"`.

## Exercise 3 – A conflict on the same line: resolving manually
1. Create a branch `feature/ci-retries` and change `retries: 0,` to `retries: 2,` in it. Commit it as `Use 2 retries`.
2. Go back to `main` and change the same line to `retries: 1,`. Commit it as `Use 1 retry`.
3. Merge: `git merge feature/ci-retries` – **CONFLICT!**
4. Run `git status` – the file shows up under `both modified`. Open `settings.ts` and find the markers `<<<<<<<`, `=======`, `>>>>>>>`.
5. Resolve it: keep a single line, `retries: process.env.CI ? 2 : 0,`, and delete all the marker lines.
6. `git add settings.ts` and then `git commit --no-edit`.

**Expected result:** `git status` is clean, `git log --oneline --graph` shows a merge commit named `Merge branch 'feature/ci-retries'`, and `settings.ts` has no conflict markers at all.

## Exercise 4 – A conflict in test data: picking a whole side
1. On `main`, create `test-data/users.csv`:
   ```
   username,password
   admin,Admin123
   viewer,View123
   ```
   Commit it as `Add users test data`.
2. Create a branch `feature/new-users` and change `admin,Admin123` to `admin,NewPass2026` in it. Commit it as `Update admin password`.
3. Go back to `main` and change the same line to `admin,Temp000`. Commit it as `Use temporary admin password`.
4. Merge `feature/new-users` – conflict. It was decided that the branch's version is correct, so instead of editing by hand, pick its side:
   `git checkout --theirs test-data/users.csv` (during a merge: ours = `main`, theirs = the branch being merged).
5. `git add test-data/users.csv` and then `git commit --no-edit`.

**Expected result:** the file has `admin,NewPass2026` and `viewer,View123`, and no `Temp000`.

## Exercise 5 – Cancelling a merge halfway (merge --abort)
1. Create a branch `experiment/long-timeout` and change `timeout: 30000,` to `timeout: 120000,` in it. Commit it as `Increase timeout to 2 minutes`.
2. Go back to `main` and change the same line to `timeout: 60000,`. Commit it as `Increase timeout to 60s`.
3. Merge `experiment/long-timeout` – conflict. This time you've decided you don't want the merge at all: `git merge --abort`.
4. Run `git status` and `cat settings.ts`.

**Expected result:** `git status` is clean (no "You have unmerged paths"), `main` still has `timeout: 60000`, and the branch `experiment/long-timeout` still exists and is not merged (`git branch --no-merged`).

## Exercise 6 (Bonus) – A modify/delete conflict
1. On `main`, create `legacy.spec.ts` with the line `test('old checkout flow', () => {});` – commit it as `Add legacy test`.
2. Create a branch `cleanup/remove-legacy` and delete the file in it: `git rm legacy.spec.ts` – commit it as `Remove legacy test`.
3. Go back to `main` and add the line `test('old checkout with coupon', () => {});` to the file – commit it as `Update legacy test`.
4. Merge `cleanup/remove-legacy` – read the `CONFLICT (modify/delete)` message.
5. It was decided that the old test really is unnecessary: `git rm legacy.spec.ts` and then `git commit --no-edit`.

**Expected result:** `legacy.spec.ts` does not exist on `main`, and there is a merge commit named `Merge branch 'cleanup/remove-legacy'`.

---

## Comprehension questions
1. Why was there no conflict in exercise 2, but there was one in exercise 3?
2. What does each of the markers `<<<<<<< HEAD`, `=======`, `>>>>>>> feature/ci-retries` mark?
3. Why do you need to run `git add` after editing a file with a conflict?
4. During `git merge`, which side is "ours" and which is "theirs"?
5. What is the difference between `git merge --abort` and resolving the conflict?
6. How do you reduce the chance of conflicts when working in a team?

<details>
<summary>Answers</summary>

1. In exercise 2 each branch changed a **different** line – Git can combine both changes on its own. In exercise 3 both branches changed the **same line** to different values – Git can't guess which value is correct, so it stops and asks you.
2. Between `<<<<<<< HEAD` and `=======` – the version from the current branch (`main`). Between `=======` and `>>>>>>>` – the version from the branch being merged. All these marker lines must be deleted in the resolution.
3. `git add` tells Git that the conflict in the file is **resolved**. Only when all the files are marked can you complete the merge with `git commit`.
4. ours = the branch you are on (the one you merge **into**, here `main`). theirs = the branch you merge **from**.
5. `--abort` returns everything to the state before the merge – as if you never tried to merge (the branch stays unmerged). Resolving the conflict completes the merge and creates a merge commit.
6. Short-lived branches that are merged quickly, frequent `git pull` / merging `main` into your branch, coordinating with the team on "hot" files (like settings files), and small, focused commits.

</details>
