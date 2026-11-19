# התקנת סביבת העבודה

מה נתקין (פעם אחת, לפני השיעור הראשון):

| כלי | למה צריך אותו | גרסה |
|---|---|---|
| **Node.js** | מריץ את קוד ה-TypeScript/JavaScript שלנו מחוץ לדפדפן | 22 ומעלה (מומלץ: גרסת ה-LTS העדכנית) |
| **npm** | מתקין חבילות ומריץ את הפקודות של הפרויקט (`npm run ...`) | מגיע **יחד** עם Node.js |
| **Git** | ניהול גרסאות (שיעור 9) ו-Git Bash ב-Windows | העדכנית |
| **VS Code** | עורך הקוד של הקורס | העדכנית |

> בסוף ההתקנה מריצים `npm run check-setup` – הפקודה בודקת שהכול מותקן כמו שצריך.

---

## 1. Node.js ו-npm

npm מותקן אוטומטית עם Node.js – אין צורך להתקין אותו בנפרד.

### Windows
1. היכנסו ל-<https://nodejs.org> והורידו את גרסת **LTS** (קובץ `.msi`).
2. הריצו את המתקין והשאירו את ברירות המחדל (כולל **Add to PATH**).
   אם מופיעה תיבה "Automatically install the necessary tools" – אין צורך לסמן אותה.
3. **סגרו ופתחו מחדש** כל חלון טרמינל / VS Code פתוח (כדי שה-PATH החדש ייטען).

לחלופין, מ-PowerShell:
```powershell
winget install OpenJS.NodeJS.LTS
```

### macOS
1. היכנסו ל-<https://nodejs.org>, הורידו את גרסת **LTS** (קובץ `.pkg`) והריצו אותו.

לחלופין, עם [Homebrew](https://brew.sh):
```bash
brew install node
```

### Linux (Ubuntu / Debian)
גרסת Node.js שבמאגרי ההפצה לרוב ישנה מדי. מומלץ להשתמש ב-nvm (ראו בהמשך), או במאגר הרשמי של NodeSource:
```bash
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### בדיקה
בטרמינל חדש:
```bash
node -v    # למשל v24.11.0 – המספר הראשון צריך להיות 22 או יותר
npm -v     # למשל 11.6.2
```

### (רשות) ניהול כמה גרסאות Node עם nvm
אם כבר מותקנת אצלכם גרסה ישנה שאתם צריכים לפרויקט אחר – השתמשו במנהל גרסאות:
- macOS / Linux: [nvm](https://github.com/nvm-sh/nvm)
- Windows: [nvm-windows](https://github.com/coreybutler/nvm-windows) או [fnm](https://github.com/Schniz/fnm)

בפרויקט יש קובץ `.nvmrc`, כך שבתיקיית הפרויקט מספיק להריץ:
```bash
nvm install    # מתקין את גרסת ה-LTS העדכנית
nvm use
```

---

## 2. Git

- **Windows:** הורידו מ-<https://git-scm.com> והתקינו עם ברירות המחדל. ההתקנה כוללת את **Git Bash** – בו מריצים את קובצי ה-`.sh` של שיעור 9.
- **macOS:** הריצו `git --version` בטרמינל – אם Git לא מותקן, macOS יציע להתקין את Xcode Command Line Tools. אפשר גם `brew install git`.
- **Linux:** `sudo apt-get install -y git`

הגדרה ראשונית (פעם אחת – השם והמייל יופיעו ב-commits שלכם):
```bash
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
git config --global init.defaultBranch main
```

---

## 3. VS Code

1. הורידו מ-<https://code.visualstudio.com> והתקינו.
   - **Windows:** במסך "Select Additional Tasks" סמנו **Add to PATH** ו-**Add "Open with Code" action**.
   - **macOS:** גררו את VS Code לתיקיית **Applications**.
2. הוסיפו את הפקודה `code` לטרמינל (כדי לפתוח תיקייה עם `code .`):
   - **macOS:** ב-VS Code לחצו `Cmd+Shift+P` ← כתבו **Shell Command: Install 'code' command in PATH** ← Enter.
   - **Windows / Linux:** מתווסף אוטומטית בהתקנה (פתחו טרמינל חדש).
3. פתחו את תיקיית הפרויקט: **File → Open Folder...** ובחרו את `qa-ts-course` (או מהטרמינל: `code .`).
4. VS Code יציע להתקין את **התוספים המומלצים** של הפרויקט (הודעה בפינה הימנית התחתונה) – לחצו **Install All**.
   אפשר גם ידנית: `Ctrl+Shift+X` (ב-Mac: `Cmd+Shift+X`) ← בתיבת החיפוש כתבו `@recommended`.

| תוסף | מה הוא נותן |
|---|---|
| Error Lens | מציג שגיאות TypeScript ישירות בשורה – לא צריך לרחף עם העכבר |
| YAML | השלמה ובדיקת תחביר לקובצי YAML (שיעור 11) |
| GitHub Actions | השלמה ובדיקה לקובצי Workflow (שיעורים 10–11) |
| Playwright Test | הרצת בדיקות Playwright מתוך העורך (שיעור 11) |

### הגדרות שכבר מוכנות בפרויקט (`.vscode/`)
- VS Code משתמש בגרסת ה-TypeScript של הפרויקט. אם מופיעה השאלה "Use workspace version?" – בחרו **Allow**.
- **הרצה ודיבאג של קובץ:** פתחו קובץ `.ts` ולחצו **F5** – הקובץ ירוץ בטרמינל של VS Code, ואפשר לעצור בנקודות עצירה (Breakpoints: לחיצה משמאל למספר השורה).
- **טרמינל מובנה:** `` Ctrl+` `` (גם ב-Mac). ב-Windows אפשר לבחור **Git Bash** כטרמינל ברירת המחדל:
  `Ctrl+Shift+P` ← **Terminal: Select Default Profile** ← **Git Bash**.

---

## 4. התקנת הפרויקט

בטרמינל (מומלץ – הטרמינל המובנה של VS Code), בתיקיית הפרויקט:
```bash
npm install          # מתקין את התלויות מ-package.json לתיקייה node_modules/
npm run check-setup  # בודק שהכול מוכן
```

אם הכול תקין תראו:
```
✔ Node.js v24.11.0 (נדרש 22 ומעלה)
✔ npm 11.6.2
✔ git version 2.51.0
✔ תלויות הפרויקט מותקנות (node_modules)
✔ VS Code 1.105.1
○ Google Chrome ...      ← רשות: נדרש רק לבניית קובצי ה-PDF של ההרצאות

הכול מוכן! נסו:  npm run exercise -- 01 01
```

ונסו להריץ דוגמה ותרגיל ראשונים:
```bash
npx tsx lessons/01-intro-types-flow/examples/01-hello-typescript.ts
npm run exercise -- 01 01
```

---

## פתרון תקלות

| הבעיה | הפתרון |
|---|---|
| `node` / `npm` is not recognized / command not found | סגרו ופתחו מחדש את הטרמינל ואת VS Code אחרי ההתקנה. אם עדיין לא עובד – התקינו שוב את Node.js וודאו ש-**Add to PATH** מסומן. |
| Windows: `npm.ps1 cannot be loaded because running scripts is disabled` | ב-PowerShell הריצו פעם אחת: `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` (או עבדו מ-Git Bash / Command Prompt). |
| `npm run check-setup` אומר שגרסת Node נמוכה מ-22 | התקינו את גרסת ה-LTS מ-nodejs.org (או `nvm install` בתיקיית הפרויקט). |
| `Cannot find module 'tsx'` / `tsx: command not found` | לא הורץ `npm install` בתיקיית הפרויקט – הריצו אותו. |
| `npm install` נכשל עם `EACCES` (macOS/Linux) | אל תשתמשו ב-`sudo npm install`. מחקו את `node_modules` והריצו שוב ללא sudo; אם הבעיה חוזרת – התקינו את Node דרך nvm. |
| `npm install` נכשל ברשת ארגונית (proxy / SSL) | `npm config set proxy http://proxy:port` ו-`npm config set https-proxy http://proxy:port` – בדקו מול צוות ה-IT. |
| VS Code מסמן שגיאות TypeScript שלא קיימות | `Ctrl+Shift+P` ← **TypeScript: Select TypeScript Version** ← **Use Workspace Version**, ואז **Developer: Reload Window**. |
| Windows: קובצי `.sh` של שיעור 9 נכשלים עם `$'\r': command not found` | הריצו אותם מ-**Git Bash**. אם הקובץ נשמר עם סיומות Windows – בפינה הימנית התחתונה של VS Code לחצו על `CRLF` ושנו ל-`LF`. |
