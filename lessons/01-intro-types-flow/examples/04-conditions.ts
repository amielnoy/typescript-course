// שיעור 1 – דוגמה 4: תנאים – if / else if / else ו-switch
// הרצה:  npx tsx lessons/01-intro-types-flow/examples/04-conditions.ts

const statusCode: number = 404;

// ---------- if / else if / else ----------
if (statusCode >= 200 && statusCode < 300) {
  console.log(`${statusCode}: Success ✅`);
} else if (statusCode >= 400 && statusCode < 500) {
  console.log(`${statusCode}: Client error ⚠️`);
} else if (statusCode >= 500) {
  console.log(`${statusCode}: Server error ❌`);
} else {
  console.log(`${statusCode}: Other`);
}

// ---------- switch ----------
const browser: string = "firefox";

switch (browser) {
  case "chromium":
  case "chrome": // שני case-ים לאותו קוד
    console.log("Running on Chromium engine");
    break;
  case "firefox":
    console.log("Running on Gecko engine");
    break;
  case "webkit":
    console.log("Running on WebKit (Safari) engine");
    break;
  default:
    console.log("Unknown browser");
}

// ---------- switch על enum ----------
enum Priority {
  P1 = 1,
  P2,
  P3,
}

function getPriorityFromJira(): Priority {
  return Priority.P1; // בפועל – ערך שמגיע ממערכת ניהול הבאגים
}
const bugPriority = getPriorityFromJira();

switch (bugPriority) {
  case Priority.P1:
    console.log("Fix immediately – blocks release");
    break;
  case Priority.P2:
    console.log("Fix in current sprint");
    break;
  case Priority.P3:
    console.log("Add to backlog");
    break;
}

// ---------- truthy / falsy ----------
// ערכים "שקריים": false, 0, "", null, undefined, NaN – כל השאר "אמיתיים"
const errorMessage = "";
if (!errorMessage) {
  console.log("No error message received");
}

export {}; // הופך את הקובץ למודול (משתנים לא "מתנגשים" עם קבצים אחרים)
