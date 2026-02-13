const MoveParser = require('./src/move-parser.js');

// Access internal pieceMap if possible
const fs = require('fs');
const content = fs.readFileSync('./src/move-parser.js', 'utf8');

// Extract pieceMap definition
const match = content.match(/const pieceMap = \{[^}]+\}/);
if (match) {
  console.log("源码中的pieceMap定义:");
  console.log(match[0].substring(0, 200) + "...");
}

// Check if 將 is in the map
console.log("\n检查'將'是否在pieceMap中...");

function initBoard() {
  const board = Array(10).fill(null).map(() => Array(9).fill(null));
  board[0][4] = { type: '將', color: 'black' };
  return board;
}

const board = initBoard();
console.log("\nboard[0][4]:", board[0][4]);
console.log("board[0][4].type:", board[0][4].type);
console.log("board[0][4].type === '將':", board[0][4].type === '將');

// Manually check pieceMap
const testMap = {
  '將': 'king', '帥': 'king', '帅': 'king',
  '士': 'advisor', '仕': 'advisor',
  '象': 'elephant', '相': 'elephant',
  '马': 'horse', '馬': 'horse', '傌': 'horse',
  '车': 'rook', '車': 'rook', '俥': 'rook',
  '炮': 'cannon', '砲': 'cannon',
  '兵': 'pawn', '卒': 'pawn'
};

console.log("\ntestMap['將']:", testMap['將']);
console.log("testMap[board[0][4].type]:", testMap[board[0][4].type]);
