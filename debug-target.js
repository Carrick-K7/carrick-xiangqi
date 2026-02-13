// Test targetColX calculation
const target = 6; // 6路
const isRed = false; // 黑方

// For black: targetColX = target - 1
targetColX = target - 1;

console.log("将5平6:");
console.log("target:", target);
console.log("isRed:", isRed);
console.log("targetColX:", targetColX); // Should be 5
console.log("");
console.log("Source: fromCol = 4 (5路)");
console.log("Expected toX: 5 (6路)");
console.log("Calculated targetColX:", targetColX);
console.log("");
console.log(targetColX === 5 ? "✅ 计算正确" : "❌ 计算错误");
