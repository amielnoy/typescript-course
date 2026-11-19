#!/usr/bin/env bash
# פונקציות עזר לדוגמאות של שיעור Git. אין צורך להריץ קובץ זה ישירות.

# מדפיס את הפקודה ואז מריץ אותה – כדי שיהיה קל לעקוב בפלט
run() {
  printf '\n\033[1;34m$ %s\033[0m\n' "$*"
  "$@"
}

title() {
  printf '\n\033[1;32m=== %s ===\033[0m\n' "$*"
}

# יוצר תיקיית עבודה זמנית (לא נוגע בפרויקט שלכם) ומגדיר משתמש git מקומי
make_sandbox() {
  SANDBOX="$(mktemp -d)"
  cd "$SANDBOX" || exit 1
  export GIT_AUTHOR_NAME="QA Student" GIT_AUTHOR_EMAIL="student@example.com"
  export GIT_COMMITTER_NAME="QA Student" GIT_COMMITTER_EMAIL="student@example.com"
  export GIT_PAGER=cat PAGER=cat
  echo "Sandbox: $SANDBOX"
}

cleanup_sandbox() {
  cd / && rm -rf "$SANDBOX"
}
