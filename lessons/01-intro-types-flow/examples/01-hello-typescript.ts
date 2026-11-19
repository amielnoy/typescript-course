// שיעור 1 – דוגמה 1: התוכנית הראשונה ב-TypeScript
// הרצה:  npx tsx lessons/01-intro-types-flow/examples/01-hello-typescript.ts
//
// TypeScript = JavaScript + טיפוסים (types).
// הדפדפן ו-Node.js מריצים JavaScript בלבד, לכן קוד TS עובר "קומפילציה" (תרגום) ל-JS:
//   tsc  -> בודק טיפוסים ומייצר קובצי .js
//   tsx  -> מריץ קובץ .ts ישירות (מתרגם ברקע) – נוח מאוד לפיתוח ולשיעורים

console.log("Hello, TypeScript!");

// אותו קוד ב-JS היה עובד, אבל ב-TS אנחנו מצהירים מה הטיפוס:
const courseName: string = "QA Automation with TypeScript";
const lessonNumber: number = 1;

console.log(`Course: ${courseName}, lesson #${lessonNumber}`);

// למה זה חשוב לבודק אוטומציה?
// טעות כזו תיתפס כבר בעורך הקוד, לפני שהבדיקה בכלל רצה:
// const timeout: number = "5000";   // ❌ Type 'string' is not assignable to type 'number'

// מידע על סביבת ההרצה (Node.js):
console.log(`Node version: ${process.version}`);
console.log(`Platform: ${process.platform}`);

export {}; // הופך את הקובץ למודול (משתנים לא "מתנגשים" עם קבצים אחרים)
