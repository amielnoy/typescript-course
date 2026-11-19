# Lesson 9 – Topic 04: Remote, push, pull and Pull Request – Exercises

> **Where do you work?** Three folders **outside** the course project, under `~/git-practice`:
>
> | Folder | Role |
> |---|---|
> | `~/git-practice/04-remote.git` | The "GitHub" – a bare remote repository (no working files) |
> | `~/git-practice/04-remote-push-pull` | **Your** computer |
> | `~/git-practice/04-teammate` | Your **teammate's** computer |
>
> This way you practice push / pull / clone without a GitHub account and without internet. In real work, instead of the local path
> you'll have a URL like `https://github.com/<user>/<repo>.git` – the commands are exactly the same.
>
> **Topic example:** `bash lessons/09-git-github/examples/04-remote-push-pull.sh`
>
> **Automatic check** (from the course folder, after finishing all the exercises – on **your** folder):
>
> ```bash
> bash lessons/09-git-github/exercises/verify-04-remote-push-pull.sh ~/git-practice/04-remote-push-pull
> ```

## Exercise 1 – A remote "server"
1. Create a bare repository: `git init --bare -b main ~/git-practice/04-remote.git`.
2. Run `ls ~/git-practice/04-remote.git`.

**Expected result:** you see only Git's internal folders (`HEAD`, `objects`, `refs`...) – no working files. This is what a repository on a server like GitHub looks like.

## Exercise 2 – First push
1. Create `~/git-practice/04-remote-push-pull`, run `git init -b main` in it, create `README.md` with `# QA regression suite` and make a commit named `Initial commit`.
2. Connect the remote: `git remote add origin ~/git-practice/04-remote.git`, and check with `git remote -v`.
3. Push and set the upstream: `git push -u origin main`.

**Expected result:** `git branch -vv` shows `[origin/main]` next to `main`, and `git status` shows `Your branch is up to date with 'origin/main'`.

## Exercise 3 – A teammate clones, and you pull
1. Clone: `git clone ~/git-practice/04-remote.git ~/git-practice/04-teammate` and enter the folder.
2. Set a different name (for this repository only) so you can see who did what:
   `git config user.name "QA Teammate"` and `git config user.email "teammate@example.com"`.
3. Create `tests/api.spec.ts` with `test('GET /health returns 200', () => {});`, commit it as `Add API health test`, and `git push`.
4. Go back to **your** folder and run `git fetch` and then `git status`.
5. Show what you're missing: `git log --oneline main..origin/main`, and then `git pull`.

**Expected result:** after `fetch` – `Your branch is behind 'origin/main' by 1 commit`. After `pull` – the file `tests/api.spec.ts` exists in your folder, and `git log --format="%h %an %s"` shows two different authors.

## Exercise 4 – A feature branch and a "Pull Request"
1. In your folder: `git switch -c feature/cart-tests`, create `tests/cart.spec.ts` with `test('add item to cart', () => {});`, commit it as `Add cart tests`.
2. Push the branch: `git push -u origin feature/cart-tests`, and run `git branch -r`.
3. On GitHub, you would now open a Pull Request (`base: main ← compare: feature/cart-tests`). Here we simulate the Merge button:
   ```bash
   git switch main
   git merge --no-ff -m "Merge pull request #1 from feature/cart-tests" feature/cart-tests
   git push
   ```

**Expected result:** `git branch -r` shows `origin/main` and `origin/feature/cart-tests`. `git log --oneline --graph origin/main` shows a merge commit named `Merge pull request #1 from feature/cart-tests`.

## Exercise 5 – A rejected push and fixing it with pull
1. Switch to the `04-teammate` folder (without pulling!). Create `tests/login.spec.ts` with `test('login with valid user', () => {});`, commit it as `Add login test`.
2. Try `git push` – **rejected** (`rejected ... fetch first`): the remote has commits your teammate doesn't have.
3. Pull and merge: `git pull --no-rebase --no-edit`, and then `git push` – now it succeeds.
4. Go back to **your** folder and run `git pull`.

**Expected result:** in your folder, `git status` shows `up to date with 'origin/main'`, `tests/api.spec.ts`, `tests/cart.spec.ts` and `tests/login.spec.ts` exist, and `git log --oneline --graph` also shows a merge commit named `Merge branch 'main' of ...`.

## Exercise 6 (Bonus) – A version tag and cleaning up a merged branch
1. In your folder, on `main`: `git tag -a v1.0 -m "Regression suite v1.0"` and `git push origin v1.0`.
2. Delete the merged feature branch – both on the remote and locally:
   `git push origin --delete feature/cart-tests` and `git branch -d feature/cart-tests`.
3. Clean up stale references: `git fetch --prune`, and run `git branch -r` and `git ls-remote --tags origin`.

**Expected result:** `git branch -r` shows only `origin/main` (and maybe `origin/HEAD`), and `v1.0` shows up on the remote.

## Optional – The same thing against real GitHub
1. Create an empty repository on GitHub (no README) named `qa-remote-practice`.
2. In your folder: `git remote add github https://github.com/<user>/qa-remote-practice.git` and `git push -u github main`.
3. Push a branch, open a real Pull Request in the web UI and merge it. Pull with `git pull github main`.
   (The automatic checker does not check this part.)

---

## Comprehension questions
1. What is the difference between `git fetch` and `git pull`?
2. What does `-u` mean in `git push -u origin main`?
3. What is the difference between `main` and `origin/main` on your computer?
4. Why was your teammate's push rejected in exercise 5? Why shouldn't you fix it with `git push --force`?
5. Why work on a branch + Pull Request instead of pushing directly to `main`?

<details>
<summary>Answers</summary>

1. `fetch` downloads the changes from the remote and updates only `origin/*` – without touching your branches and files. `pull` = `fetch` + `merge` (or rebase) into the current branch.
2. `-u` (upstream) links your local `main` to `origin/main`. From now on plain `git push` / `git pull` without arguments is enough, and `git status` shows whether you are ahead of / behind the remote.
3. `main` is your local branch. `origin/main` is a "snapshot" of `main` on the remote, as of the last `fetch`/`pull`. It does not update by itself.
4. The remote had commits (the PR merge) that your teammate didn't have – the push would have "overwritten" them, so Git refuses. `--force` would indeed overwrite and delete other people's work. The right way: `pull` (combine the changes) and then `push`.
5. Code Review before merging, running CI (automated tests) on the change, discussion and documentation, and `main` stays stable. You can enforce this with Branch protection.

</details>
