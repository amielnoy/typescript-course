// Lesson 1 – Topic 01: Hello TypeScript – Exercises
// ------------------------------------------------------------
// Instructions:
//   1. Complete the body of each function in place of the line  throw new Error("TODO")
//   2. Function syntax itself is taught in the next lesson – here, just write the code inside.
//   3. Use only what has been taught up to this topic (see examples/01-hello-typescript.ts).
//   4. Check yourself: npm run exercise -- 01 01 (self-check at the end of the file)
// ------------------------------------------------------------

/**
 * Exercise 1 – Welcome message
 * Return a greeting with the given name.
 * Example: "Dana" => "Hello, Dana!"
 * Hint: Template literal – `Hello, ${...}!`
 */
export function greet(name: string): string {
  //throw new Error("TODO");
  return `Hello, ${name}!`;
}

/**
 * Exercise 2 – Test title in a report
 * Join a test ID and a test name into a single title.
 * Example: ("TC-001", "Login with valid user") => "[TC-001] Login with valid user"
 */
export function formatTestTitle(testId: string, title: string): string {
  return `[${testId}] ${title}`;
}

/**
 * Exercise 3 – From text to number
 * Values that come from the command line or from environment variables are always strings.
 * But timeout must be a number (remember the error: const timeout: number = "5000"?).
 * Convert the text to a number.
 * Examples: "5000" => 5000,  "1500.5" => 1500.5,  "0" => 0
 * Hint: Number(raw)
 */
export function parseTimeout(raw: string): number {
  return Number(raw);
}

/**
 * Exercise 4 – Describe the runtime environment
 * Take the Node version and the operating system (in a real program: process.version and process.platform)
 * and return a description line.
 * Example: ("v22.10.0", "darwin") => "Node v22.10.0 on darwin"
 */
export function describeRuntime(version: string, platform: string): string {
  return `Node ${version} on ${platform}`;
}

/**
 * Exercise 5 (Bonus) – Node's major version
 * Examples: "v22.10.0" => 22,  "v8.0.1" => 8
 * Hints:
 *   version.slice(1)        removes the leading "v"  => "22.10.0"
 *   text.split(".")[0]      the part before the first dot => "22"
 *   Number(...)             converts to a number
 */
export function getNodeMajorVersion(version: string): number {
  //throw new Error("TODO");
  return Number(version.slice(1).split(".")[0]);
}

// ============================================================
// Self-check – run:  npm run exercise -- 01 01
// On every line, the value left of "=> expected:" must equal the value on its right.
// (No need to change the code below this line)
// ============================================================

console.log("\n--- Exercise 1: greet ---");
try {
  console.log(greet("Dana"), "=> expected:", "Hello, Dana!");
  console.log(greet("QA Team"), "=> expected:", "Hello, QA Team!");
  console.log(greet(""), "=> expected:", "Hello, !");
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 2: formatTestTitle ---");
try {
  console.log(formatTestTitle("TC-001", "Login with valid user"), "=> expected:", "[TC-001] Login with valid user");
  console.log(formatTestTitle("TC-042", "Logout"), "=> expected:", "[TC-042] Logout");
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 3: parseTimeout ---");
try {
  console.log(parseTimeout("5000"), "=> expected:", 5000);
  console.log(parseTimeout("1500.5"), "=> expected:", 1500.5);
  console.log(parseTimeout("0"), "=> expected:", 0);
  console.log(typeof parseTimeout("30000"), "=> expected:", "number"); // a number, not text!
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 4: describeRuntime ---");
try {
  console.log(describeRuntime("v22.10.0", "darwin"), "=> expected:", "Node v22.10.0 on darwin");
  console.log(describeRuntime("v20.1.0", "linux"), "=> expected:", "Node v20.1.0 on linux");
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Exercise 5 (Bonus): getNodeMajorVersion ---");
try {
  console.log(getNodeMajorVersion("v22.10.0"), "=> expected:", 22);
  console.log(getNodeMajorVersion("v8.0.1"), "=> expected:", 8);
  console.log(getNodeMajorVersion("v100.0.0"), "=> expected:", 100);
  console.log(typeof getNodeMajorVersion("v22.10.0"), "=> expected:", "number");
} catch (e) {
  console.log("  ✋", (e as Error).message);
}
