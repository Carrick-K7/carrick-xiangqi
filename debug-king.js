// 深度调试将的移动
const MoveParser = require('./src/move-parser.js');

const board = Array(10).fill(null).map(() => Array(9).fill(null));
board[0][4] = { type: '將', color: 'black' }; // 将在5路

console.log("测试 '将5平6':");
console.log("棋盘状态: 将在(4,0)");

// 手动执行findCoordinates逻辑
const parsed = MoveParser.parseMove("将5平6", 17);
console.log("解析结果:", parsed);

// 模拟findCoordinates
const pieceMap = {
  '將': 'king', '士': 'advisor', '象': 'elephant',
  '馬': 'horse', '車': 'rook', '砲': 'cannon', '卒': 'pawn'
};

const piece = 'king';
const fromCol = 4;
const color = 'black';

// 查找候选
let found = false;
for (let y = 0; y < 10; y++) {
  for (let x = 0; x < 9; x++) {
    const p = board[y][x];
    if (p && pieceMap[p.type] === piece && p.color === color) {
      if (x === fromCol) {
        console.log(`找到候选: (${x},${y})`);
        found = true;
      }
    }
  }
}

if (!found) {
  console.log("❌ 未找到候选棋子！");
  console.log("可能原因: pieceMap不匹配或棋盘状态错误");
}

// 测试pieceMap
console.log("\npieceMap['將'] =", pieceMap['將']);
console.log("board[0][4] =", board[0][4]);
console.log("board[0][4].type =", board[0][4]?.type);
console.log("pieceMap[board[0][4].type] =", pieceMap[board[0][4]?.type]);
