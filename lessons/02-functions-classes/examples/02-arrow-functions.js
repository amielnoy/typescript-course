"use strict";
// שיעור 2 – דוגמה 2: Arrow Functions ופונקציות על מערכים
// הרצה:  npx tsx lessons/02-functions-classes/examples/02-arrow-functions.ts
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
// ---------- תחביר ----------
// פונקציה רגילה:
function double(n) {
    return n * 2;
}
// אותה פונקציה כ-arrow function:
var doubleArrow = function (n) {
    return n * 2;
};
// גרסה מקוצרת – ביטוי יחיד מוחזר אוטומטית (בלי return ובלי סוגריים מסולסלים):
var doubleShort = function (n) { return n * 2; };
console.log(double(2), doubleArrow(3), doubleShort(4));
// ---------- Callbacks – העברת פונקציה כפרמטר ----------
function runWithLog(name, action) {
    console.log("START ".concat(name));
    action();
    console.log("END   ".concat(name));
}
runWithLog("login test", function () { return console.log("   ...clicking login"); });
var results = [
    { name: "login", status: "passed", durationMs: 1200 },
    { name: "search", status: "failed", durationMs: 3400 },
    { name: "checkout", status: "passed", durationMs: 2100 },
    { name: "logout", status: "failed", durationMs: 500 },
];
// filter – סינון
var failedTests = results.filter(function (r) { return r.status === "failed"; });
console.log("Failed:", failedTests.map(function (r) { return r.name; }));
// map – המרה של כל איבר
var names = results.map(function (r) { return r.name.toUpperCase(); });
console.log("Names:", names);
// find – האיבר הראשון שעומד בתנאי
var slow = results.find(function (r) { return r.durationMs > 3000; });
console.log("First slow test:", slow === null || slow === void 0 ? void 0 : slow.name);
// some / every – האם יש לפחות אחד / האם כולם
console.log("Any failed?", results.some(function (r) { return r.status === "failed"; }));
console.log("All under 5s?", results.every(function (r) { return r.durationMs < 5000; }));
// reduce – צמצום לערך יחיד (למשל סכום)
var totalMs = results.reduce(function (sum, r) { return sum + r.durationMs; }, 0);
console.log("Total duration:", totalMs, "ms");
// sort – מיון (על עותק, כדי לא לשנות את המקורי)
var bySpeed = __spreadArray([], results, true).sort(function (a, b) { return a.durationMs - b.durationMs; });
console.log("Fastest → slowest:", bySpeed.map(function (r) { return "".concat(r.name, "(").concat(r.durationMs, ")"); }).join(", "));
// forEach – מעבר עם פעולה
results.forEach(function (r, index) { return console.log("".concat(index + 1, ". ").concat(r.name, " \u2013 ").concat(r.status)); });
// שרשור (chaining)
var failedNamesSorted = results
    .filter(function (r) { return r.status === "failed"; })
    .map(function (r) { return r.name; })
    .sort();
console.log("Failed (sorted):", failedNamesSorted);
