const MoveParser = require('./src/move-parser.js');

// Just test the 士6进5 move
const board = Array(10).fill(null).map(() => Array(9).fill(null));
board[0][5] = { type: '士', color: 'black' }; // 士在6路
board[0][3] = { type: '士', color: 'black' }; // 另一个士在4路
board[0][4] = { type: '將', color: 'black' }; // 将在5路

console.log("初始:");
console.log("士1 (4路):", board[0][3]);
console.log("將 (5路):", board[0][4]);
console.log("士2 (6路):", board[0][5]);

// Test 士6进5
const parsed = MoveParser.parseMove("士6进5", 15);
console.log("\n解析 '士6进5':");
console.log("fromCol:", parsed.fromCol); // Should be 5 (6路)
console.log("target:", parsed.target); // Should be 5

const coords = MoveParser.findCoordinates(parsed, board);
console.log("\n坐标结果:", coords);

if (coords) {
  console.log(`移动: (${coords.fromX},${coords.fromY}) -> (${coords.toX},${coords.toY})`);
  board[coords.toY][coords.toX] = board[coords.fromY][coords.fromX];
  board[coords.fromY][coords.fromX] = null;
  
  console.log("\n移动后:");
  console.log("(3,0):", board[0][3]);
  console.log("(4,0):", board[0][4]);
  console.log("(4,1):", board[1][4]);
  console.log("(5,0):", board[0][5]);
}
