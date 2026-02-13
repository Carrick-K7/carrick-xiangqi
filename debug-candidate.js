const MoveParser = require('./src/move-parser.js');

// Create board with black king at (4,0)
const board = Array(10).fill(null).map(() => Array(9).fill(null));
board[0][4] = { type: '將', color: 'black' };

console.log("棋盘状态:");
console.log("board[0][4] =", board[0][4]);

// Check pieceMap
const pieceMap = {
  '將': 'king', '帥': 'king',
  '士': 'advisor', '仕': 'advisor',
  '象': 'elephant', '相': 'elephant',
  '马': 'horse', '馬': 'horse', '傌': 'horse',
  '车': 'rook', '車': 'rook', '俥': 'rook',
  '炮': 'cannon', '砲': 'cannon',
  '兵': 'pawn', '卒': 'pawn'
};

console.log("\n查找候选棋子:");
console.log("pieceMap['將'] =", pieceMap['將']); // Should be 'king'

const piece = 'king';
const fromCol = 4; // 5路
const color = 'black';

const candidates = [];
for (let y = 0; y < 10; y++) {
  for (let x = 0; x < 9; x++) {
    const p = board[y][x];
    if (p && pieceMap[p.type] === piece && p.color === color) {
      if (x === fromCol) {
        candidates.push({ x, y, piece: p });
        console.log(`找到候选: x=${x}, y=${y}`);
      } else {
        console.log(`列不匹配: x=${x}, 期望 fromCol=${fromCol}`);
      }
    }
  }
}

console.log("\n候选数量:", candidates.length);
