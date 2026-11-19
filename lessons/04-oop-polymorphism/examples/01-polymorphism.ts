// שיעור 4 – דוגמה 1: Polymorphism (רב-צורתיות)
// הרצה:  npx tsx lessons/04-oop-polymorphism/examples/01-polymorphism.ts
//
// פולימורפיזם = אותה קריאה (notify) מתנהגת אחרת לפי הסוג האמיתי של האובייקט.
// הקוד שמשתמש באובייקטים לא צריך לדעת מה הסוג המדויק – רק שהם "Notifier".

class Notifier {
  constructor(protected recipient: string) {}

  notify(message: string): string {
    return `[generic] to ${this.recipient}: ${message}`;
  }
}

class EmailNotifier extends Notifier {
  override notify(message: string): string {
    return `📧 Email to ${this.recipient}: ${message}`;
  }
}

class SlackNotifier extends Notifier {
  constructor(
    recipient: string,
    private channel: string,
  ) {
    super(recipient);
  }

  override notify(message: string): string {
    return `💬 Slack #${this.channel} @${this.recipient}: ${message}`;
  }
}

class SmsNotifier extends Notifier {
  override notify(message: string): string {
    const short = message.length > 20 ? message.slice(0, 17) + "..." : message;
    return `📱 SMS to ${this.recipient}: ${short}`;
  }
}

// פונקציה אחת שעובדת עם כל סוג Notifier – לא צריך if/switch על הסוג!
function broadcast(notifiers: Notifier[], message: string): void {
  for (const n of notifiers) {
    console.log(n.notify(message)); // הקריאה "נשלחת" למימוש הנכון בזמן ריצה
  }
}

const team: Notifier[] = [
  new EmailNotifier("qa-team@example.com"),
  new SlackNotifier("dana", "qa-alerts"),
  new SmsNotifier("+972-50-0000000"),
  new Notifier("fallback"),
];

broadcast(team, "Nightly regression: 3 tests failed");

// ---------- מה היה קורה בלי פולימורפיזם? ----------
// function badBroadcast(n: any) {
//   if (n.type === "email") {...} else if (n.type === "slack") {...} else if ...
// }
// כל ערוץ חדש = שינוי בפונקציה. עם פולימורפיזם – רק מוסיפים מחלקה חדשה.

export {}; // הופך את הקובץ למודול (משתנים לא "מתנגשים" עם קבצים אחרים)
