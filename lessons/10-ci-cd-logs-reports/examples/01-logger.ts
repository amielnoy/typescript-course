// שיעור 10 – דוגמה 1: לוגים (Logs) – כלי התחקור הראשון כשבדיקה נכשלת
// הרצה:  npx tsx lessons/10-ci-cd-logs-reports/examples/01-logger.ts
// סינון: LOG_LEVEL=warn npx tsx lessons/10-ci-cd-logs-reports/examples/01-logger.ts   (רק warn ו-error)
//
// לוג טוב עונה על: מתי? (timestamp)  כמה חמור? (level)  איפה? (context)  מה? (message + data)
// ב-CI אין לנו מסך – הלוג וה-artifacts הם כל מה שנשאר אחרי הריצה.

import { mkdirSync, appendFileSync } from "node:fs";
import { join } from "node:path";

type Level = "debug" | "info" | "warn" | "error";
const ORDER: Record<Level, number> = { debug: 0, info: 1, warn: 2, error: 3 };

/** קורא את LOG_LEVEL מהסביבה. ערך חסר או לא מוכר (למשל "verbose") → ברירת המחדל */
export function levelFromEnv(fallback: Level): Level {
  const value = process.env.LOG_LEVEL?.toLowerCase();
  return value !== undefined && value in ORDER ? (value as Level) : fallback;
}

export class Logger {
  constructor(
    private context: string,
    private minLevel: Level = levelFromEnv("info"),
    private filePath?: string,
  ) {}

  // לוגר "בן" עם הקשר מפורט יותר – למשל לכל בדיקה
  child(subContext: string): Logger {
    return new Logger(`${this.context}:${subContext}`, this.minLevel, this.filePath);
  }

  debug(msg: string, data?: unknown) {
    this.write("debug", msg, data);
  }
  info(msg: string, data?: unknown) {
    this.write("info", msg, data);
  }
  warn(msg: string, data?: unknown) {
    this.write("warn", msg, data);
  }
  error(msg: string, data?: unknown) {
    this.write("error", msg, data);
  }

  private write(level: Level, msg: string, data?: unknown): void {
    if (ORDER[level] < ORDER[this.minLevel]) return; // סינון לפי רמה
    const line =
      `[${new Date().toISOString()}] [${level.toUpperCase().padEnd(5)}] [${this.context}] ${msg}` +
      (data !== undefined ? ` ${JSON.stringify(data)}` : "");
    (level === "error" ? console.error : console.log)(line);
    if (this.filePath) appendFileSync(this.filePath, line + "\n");
  }
}

// ---------- שימוש ----------
const logsDir = join("reports", "logs");
mkdirSync(logsDir, { recursive: true });
const logFile = join(logsDir, "example-run.log");

// בדוגמה מציגים הכול כברירת מחדל (debug) – אבל LOG_LEVEL מהסביבה גובר
const root = new Logger("suite", levelFromEnv("debug"), logFile);
root.info("Starting regression suite", { env: process.env.TEST_ENV ?? "local", ci: !!process.env.CI });

const loginLog = root.child("login");
loginLog.debug("Filling username field");
loginLog.info("POST /api/login", { status: 200, durationMs: 143 });

const cartLog = root.child("cart");
cartLog.warn("Response slower than expected", { durationMs: 2300, thresholdMs: 2000 });
cartLog.error("Assertion failed: expected 3 items, got 2", { cartId: "c-981" });

// רמת info – הודעות debug לא יודפסו (שימושי ב-CI כדי לא להציף)
const quiet = new Logger("quiet", "info");
quiet.debug("this will NOT be printed");
quiet.info("this will be printed");

console.log(`\nLog file written to ${logFile}`);
