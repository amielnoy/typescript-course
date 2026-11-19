# שיעור 9 – Git ו-GitHub

## נושאים
- Repository, working tree, staging, commit
- ‎.gitignore
- Branch, switch, merge (fast-forward ו-merge commit)
- Merge conflict – יצירה ופתרון
- Remote: clone, push, pull, fetch – ותהליך Pull Request
- תיקון טעויות: amend, restore, revert, reset, stash

## דוגמאות להרצה
- `bash lessons/09-git-github/examples/01-first-repository.sh`
- `bash lessons/09-git-github/examples/02-branches-and-merge.sh`
- `bash lessons/09-git-github/examples/03-merge-conflict.sh`
- `bash lessons/09-git-github/examples/04-remote-push-pull.sh`
- `bash lessons/09-git-github/examples/05-undo-and-stash.sh`

## תרגילים לפי נושא
לכל נושא יש קובץ תרגילים משלו, בודק אוטומטי ופתרון. עובדים **מחוץ** לפרויקט הקורס, בתיקייה `~/git-practice/<נושא>`
(בתחילת כל קובץ תרגילים כתוב בדיוק איפה). את הבודק מריצים מתיקיית הקורס:

| נושא | תרגילים | בדיקה אוטומטית |
|---|---|---|
| 01 – Repository ו-Commit | `exercises/01-first-repository.md` | `bash lessons/09-git-github/exercises/verify-01-first-repository.sh ~/git-practice/01-first-repository` |
| 02 – Branch ו-Merge | `exercises/02-branches-and-merge.md` | `bash lessons/09-git-github/exercises/verify-02-branches-and-merge.sh ~/git-practice/02-branches-and-merge` |
| 03 – Merge Conflict | `exercises/03-merge-conflict.md` | `bash lessons/09-git-github/exercises/verify-03-merge-conflict.sh ~/git-practice/03-merge-conflict` |
| 04 – Remote, push, pull | `exercises/04-remote-push-pull.md` | `bash lessons/09-git-github/exercises/verify-04-remote-push-pull.sh ~/git-practice/04-remote-push-pull` |
| 05 – תיקון טעויות ו-stash | `exercises/05-undo-and-stash.md` | `bash lessons/09-git-github/exercises/verify-05-undo-and-stash.sh ~/git-practice/05-undo-and-stash` |

בנושא 04 ה-"GitHub" הוא repository מקומי מסוג bare (`~/git-practice/04-remote.git`) – כך אפשר לתרגל push/pull בלי חשבון ובלי אינטרנט. תרגול מול GitHub אמיתי – רשות, בסוף הקובץ.

**פתרונות:** `solutions/NN-<נושא>.sh` – מבצע את כל תרגילי הנושא ומריץ את הבודק. בלי פרמטר הוא רץ בתיקייה זמנית ומוחק אותה;
עם תיקייה – משאיר את התוצאה לעיון:

```bash
bash lessons/09-git-github/solutions/02-branches-and-merge.sh            # תיקייה זמנית
bash lessons/09-git-github/solutions/02-branches-and-merge.sh /tmp/git-solutions   # יוצר /tmp/git-solutions/02-branches-and-merge
```

נסו לבד קודם – הפתרון הוא לבדיקה עצמית, לא לקיצור דרך.

## תרגיל סיכום לשיעור
ההוראות ב-`exercises/README.md` (משלב את כל הנושאים + עבודה בזוגות מול GitHub). בדיקה אוטומטית לתרגילים 1–3:

```bash
bash lessons/09-git-github/exercises/verify-repo.sh <path-to-your-repo>
```

פתרון לדוגמה (רץ בתיקייה זמנית): `bash lessons/09-git-github/solutions/solution.sh`

## שיעורי בית
"שבוע ב-repo של `checkout-tests`": מקימים repository לבדיקות אוטומטיות ומתחזקים אותו שבוע שלם – feature branch עם merge commit,
תיקון באג שמתנגש עם `main`, חבר צוות שדוחף לפניכם, commit גרוע שצריך לבטל ב-revert, גרסה עם tag ו-hotfix דחוף באמצע עבודה (stash).
משלב את כל נושאי השיעור; 8 שלבים, האחרון הוא אתגר (רשות).

- דף העבודה: `exercises/homework.md`
- עובדים ב-`~/git-practice/homework`, וה-"GitHub" הוא `~/git-practice/homework-remote.git`
- בדיקה אוטומטית:

```bash
bash lessons/09-git-github/exercises/verify-homework.sh ~/git-practice/homework
```

פתרון: `bash lessons/09-git-github/solutions/homework.sh` (בלי פרמטר – בתיקייה זמנית; עם תיקייה – יוצר בה את `homework`, `homework-remote.git` ו-`homework-teammate`).

תבניות שימושיות בתיקייה `templates/`: PR template, Bug report, ‎.gitignore, כללי commit.
