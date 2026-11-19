# Lesson 9 – Git & GitHub exercises

> At the end of exercises 1–3, run the automatic checker on the folder you created:
>
> ```bash
> bash lessons/09-git-github/exercises/verify-repo.sh ~/git-practice/qa-practice
> ```

## Exercise 1 – First repository
1. Create a new folder **outside** the course project, e.g. `~/git-practice/qa-practice`, and run `git init -b main`.
2. Create a `README.md` file with the project name, and make a commit named `Initial commit`.
3. Create a `.gitignore` file that ignores `node_modules/`, `reports/` and `.env`. Commit it.
4. Create a `node_modules` folder with any file in it, and confirm with `git status` that it does **not** show up.

## Exercise 2 – Branches and merge
1. Create a branch `feature/login-tests` and add a `login.spec.ts` file to it (the content doesn't matter). Commit.
2. Go back to `main` and change `README.md` (add a "How to run" line). Commit.
3. Merge `feature/login-tests` into `main` (a merge commit will be created, because the branches diverged).
4. Show the history: `git log --oneline --graph --all`.

## Exercise 3 – Resolving a conflict
1. Create a `config.ts` file with the line `export const env = "dev";` and commit it on `main`.
2. Create a branch `feature/staging` and change the line to `"staging"`. Commit.
3. On `main`, change the same line to `"qa"`. Commit.
4. Merge – and resolve the conflict so the value is `process.env.ENV ?? "qa"`. Complete the merge.

## Exercise 4 – GitHub and Pull Request (pair work)
1. Student A: create a repository on GitHub named `qa-ts-course-practice`, and push the project from exercises 1–3 to it
   (`git remote add origin ...`, `git push -u origin main`).
2. Add your partner as a Collaborator (Settings → Collaborators).
3. Student B: `git clone`, create a branch `feature/<your-name>-api-tests`, add a file, `push`.
4. Open a Pull Request to `main`. Use the template in `lessons/09-git-github/templates/pull_request_template.md`
   (copy it to `.github/pull_request_template.md` in your repository).
5. Student A: do a Review – write at least one comment on a specific line and request changes (Request changes).
6. Student B: fix it and push another commit to the same branch (the PR updates automatically).
7. Approve and Merge. Delete the branch. Both sides: `git switch main && git pull`.

## Exercise 5 (Bonus) – Protecting main
On GitHub: Settings → Branches → Add branch protection rule for `main`:
- Require a pull request before merging (at least one Approve)
- Require status checks to pass (we'll connect this to CI in lesson 11)

Try to `git push` directly to `main` – what happened?
