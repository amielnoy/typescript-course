// שיעור 8 – דוגמה 3: טיפול בשגיאות – try / catch / finally, שגיאות מותאמות, retry
// הרצה:  npx tsx lessons/08-async-error-handling/examples/03-error-handling.ts

// ---------- try / catch / finally ----------
function parseConfig(json: string): { baseUrl: string } {
  try {
    const parsed = JSON.parse(json);
    if (!parsed.baseUrl) throw new Error("baseUrl is missing");
    return parsed;
  } catch (err) {
    // ב-TS, err הוא unknown – צריך לבדוק לפני שימוש
    const message = err instanceof Error ? err.message : String(err);
    console.log("  config error:", message);
    return { baseUrl: "http://localhost:3000" }; // ערך ברירת מחדל
  } finally {
    console.log("  finally: parseConfig done"); // רץ תמיד – מצוין לניקוי (סגירת דפדפן וכו')
  }
}

console.log(parseConfig('{"baseUrl":"https://staging"}'));
console.log(parseConfig("{not json"));
console.log(parseConfig("{}"));

// ---------- מחלקות שגיאה מותאמות ----------
class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

class TimeoutError extends Error {
  constructor(public readonly ms: number) {
    super(`Operation timed out after ${ms}ms`);
    this.name = "TimeoutError";
  }
}

function handle(err: unknown): string {
  if (err instanceof ApiError) return `API error ${err.status}: ${err.message}`;
  if (err instanceof TimeoutError) return `Timeout (${err.ms}ms) – maybe retry?`;
  if (err instanceof Error) return `Unexpected: ${err.message}`;
  return `Unknown thrown value: ${String(err)}`;
}

console.log(handle(new ApiError(404, "User not found")));
console.log(handle(new TimeoutError(5000)));
console.log(handle(new TypeError("x is undefined")));
console.log(handle("a string was thrown"));

// ---------- זריקה מחדש (rethrow) – לטפל רק במה שמכירים ----------
function deleteUser(id: number): void {
  try {
    if (id === 1) throw new ApiError(403, "Cannot delete admin");
    if (id === 2) throw new RangeError("weird bug");
  } catch (err) {
    if (err instanceof ApiError && err.status === 403) {
      console.log("Expected 403 – handled");
      return;
    }
    throw err; // לא מכירים – מעבירים הלאה
  }
}
deleteUser(1);
try {
  deleteUser(2);
} catch (err) {
  console.log("Re-thrown and caught outside:", (err as Error).name);
}

// ---------- Retry אסינכרוני – תבנית שימושית מאוד באוטומציה ----------
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

async function retry<T>(fn: () => Promise<T>, attempts: number, delayMs: number): Promise<T> {
  let lastError: unknown;
  for (let i = 1; i <= attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      console.log(`  attempt ${i}/${attempts} failed: ${(err as Error).message}`);
      if (i < attempts) await sleep(delayMs);
    }
  }
  throw lastError;
}

let calls = 0;
const flakyService = async () => {
  calls++;
  if (calls < 3) throw new Error("503 Service Unavailable");
  return "OK";
};

console.log("Retry result:", await retry(flakyService, 5, 50));

// ---------- Timeout עם Promise.race ----------
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  const timeout = new Promise<never>((_, reject) => setTimeout(() => reject(new TimeoutError(ms)), ms));
  return Promise.race([promise, timeout]);
}

try {
  await withTimeout(sleep(500).then(() => "done"), 100);
} catch (err) {
  console.log(handle(err));
}

export {}; // הופך את הקובץ למודול (משתנים לא "מתנגשים" עם קבצים אחרים)
