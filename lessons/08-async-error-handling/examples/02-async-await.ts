// שיעור 8 – דוגמה 2: async / await
// הרצה:  npx tsx lessons/08-async-error-handling/examples/02-async-await.ts
//
// async/await = תחביר נוח ל-Promise. הקוד נראה "סדרתי" ופשוט לקריאה.
//   async function  -> תמיד מחזירה Promise
//   await           -> "חכה כאן עד שה-Promise יסתיים וקבל את הערך" (רק בתוך async)
// כך כתובות כל בדיקות Playwright:  await page.click(...)

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

interface User {
  id: number;
  name: string;
}

async function getUser(id: number): Promise<User> {
  await sleep(100); // מדמה זמן תגובה של שרת
  if (id === 404) throw new Error("User not found");
  return { id, name: `User${id}` };
}

async function getOrders(userId: number): Promise<string[]> {
  await sleep(100);
  return [`order-${userId}-1`, `order-${userId}-2`];
}

// ---------- סדרתי: כל שלב תלוי בקודם ----------
async function userFlow(): Promise<void> {
  console.log("Sequential flow:");
  const user = await getUser(1);
  console.log("  user:", user.name);
  const orders = await getOrders(user.id);
  console.log("  orders:", orders);
}

// ---------- מקבילי: פעולות בלתי תלויות ----------
async function parallelFlow(): Promise<void> {
  const start = Date.now();
  const [a, b, c] = await Promise.all([getUser(1), getUser(2), getUser(3)]);
  console.log(`Parallel: ${a.name}, ${b.name}, ${c.name} in ~${Date.now() - start}ms`);
}

// ---------- טעות נפוצה: await בתוך לולאה כשאפשר במקביל ----------
async function slowLoop(): Promise<void> {
  const start = Date.now();
  for (const id of [1, 2, 3]) {
    await getUser(id); // כל אחד מחכה לקודם
  }
  console.log(`Sequential loop took ~${Date.now() - start}ms (slower)`);
}

// ---------- try/catch עם await ----------
async function safeFlow(): Promise<void> {
  try {
    await getUser(404);
  } catch (err) {
    console.log("Caught with try/catch:", (err as Error).message);
  }
}

// ---------- שכחתם await? ----------
async function forgotAwait(): Promise<void> {
  const p = getUser(5); // בלי await – p הוא Promise, לא User!
  console.log("Without await we get:", p instanceof Promise ? "a Promise object" : p);
  console.log("With await we get:", (await p).name);
}

// top-level await – אפשרי במודולי ES (הפרויקט מוגדר "type": "module")
await userFlow();
await parallelFlow();
await slowLoop();
await safeFlow();
await forgotAwait();

export {}; // הופך את הקובץ למודול (משתנים לא "מתנגשים" עם קבצים אחרים)
