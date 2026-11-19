// שיעור 8 – דוגמה 1: Promise
// הרצה:  npx tsx lessons/08-async-error-handling/examples/01-promises.ts
//
// קוד אסינכרוני = פעולה שלוקחת זמן (קריאת API, טעינת דף, קריאת קובץ)
// ו-JS לא "נתקע" ומחכה – הוא ממשיך, ומקבל את התוצאה כשהיא מוכנה.
// Promise = "הבטחה" לערך עתידי. מצבים: pending -> fulfilled (הצליח) / rejected (נכשל)

// ---------- יצירת Promise ----------
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function fetchUserMock(id: number): Promise<{ id: number; name: string }> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (id > 0) resolve({ id, name: `User${id}` });
      else reject(new Error(`Invalid id ${id}`));
    }, 100);
  });
}

console.log("1. before");

// ---------- then / catch / finally ----------
fetchUserMock(1)
  .then((user) => {
    console.log("3. got user:", user.name);
    return user.id * 10; // הערך עובר ל-then הבא
  })
  .then((value) => console.log("4. chained value:", value))
  .catch((err: Error) => console.log("error:", err.message))
  .finally(() => console.log("5. finally – always runs"));

console.log("2. after (runs before the promise resolves!)");

// ---------- טיפול בכישלון ----------
fetchUserMock(-1)
  .then((u) => console.log("will not run", u))
  .catch((err: Error) => console.log("6. caught rejection:", err.message));

// ---------- Promise.all – הרצה במקביל, מחכה לכולם ----------
sleep(300).then(async () => {
  const start = Date.now();
  const users = await Promise.all([fetchUserMock(1), fetchUserMock(2), fetchUserMock(3)]);
  console.log(`7. Promise.all: ${users.length} users in ~${Date.now() - start}ms (parallel, not 300ms)`);

  // Promise.all נכשל מיד אם אחד נכשל:
  try {
    await Promise.all([fetchUserMock(1), fetchUserMock(-5)]);
  } catch (err) {
    console.log("8. Promise.all rejected:", (err as Error).message);
  }

  // ---------- Promise.allSettled – מחכה לכולם, גם לכישלונות ----------
  const settled = await Promise.allSettled([fetchUserMock(1), fetchUserMock(-2)]);
  settled.forEach((r, i) => console.log(`9. allSettled[${i}]:`, r.status));

  // ---------- Promise.race – הראשון שמסתיים מנצח (שימושי ל-timeout) ----------
  const winner = await Promise.race([sleep(50).then(() => "fast"), sleep(500).then(() => "slow")]);
  console.log("10. race winner:", winner);
});

export {}; // הופך את הקובץ למודול (משתנים לא "מתנגשים" עם קבצים אחרים)
