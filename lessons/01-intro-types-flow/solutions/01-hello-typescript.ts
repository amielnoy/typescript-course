// Lesson 1 – Topic 01: Hello TypeScript – Solutions

export function greet(name: string): string {
  return `Hello, ${name}!`;
}

export function formatTestTitle(testId: string, title: string): string {
  return `[${testId}] ${title}`;
}

export function parseTimeout(raw: string): number {
  // Values from outside (CLI / environment variables) are always strings – convert explicitly to number
  return Number(raw);
}

export function describeRuntime(version: string, platform: string): string {
  return `Node ${version} on ${platform}`;
}

export function getNodeMajorVersion(version: string): number {
  const withoutV = version.slice(1); // "22.10.0"
  const major = withoutV.split(".")[0]; // "22"
  return Number(major);
}

// ============================================================
// Self-check – run:  npm run solution -- 01 01
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
