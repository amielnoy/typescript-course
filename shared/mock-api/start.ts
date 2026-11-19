// הפעלה ידנית של השרת:  npm run mock-api   (ברירת מחדל: פורט 3000)
// אחר כך אפשר לפתוח בדפדפן http://127.0.0.1:3000/users או לבדוק עם Postman.
import { startMockApi } from "./server.ts";

const port = Number(process.env.PORT ?? 3000);
const server = await startMockApi(port);
console.log(`Mock API is running at ${server.url}`);
console.log("Try: GET /health, GET /users, GET /users/1, POST /users, GET /app");
console.log("Press Ctrl+C to stop");
