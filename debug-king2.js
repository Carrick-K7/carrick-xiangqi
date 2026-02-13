const MoveParser = require('./src/move-parser.js');

// 完整模拟findCoordinates
const board = Array(10).fill(null).map(() => Array(9).fill(null));
board[0][4] = { type: '將', color: 'black' };

const parsed = {
  type: 'move',
  piece: 'king',
  pieceChar: '将',
  fromCol: 4,
  action: '平',
  target: 6,
  targetChar: '6',
  isRed: false
};

const { piece, fromCol, action, target, isRed } = parsed;
const color = 'black';

// pieceMap
const pieceMap = {
  '將': 'king', '帥': 'king', '士': 'advisor', '仕': 'advisor',
  '象': 'elephant', '相': 'elephant', '馬': 'horse', '傌': 'horse',
  '車': 'rook', '俥': 'rook', '砲': 'cannon', '炮': 'cannon',
  '卒': 'pawn', '兵': 'pawn'
};

// 查找候选
const candidates = [];
for (let y = 0; y < 10; y++) {
  for (let x = 0; x < 9; x++) {
    const p = board[y][x];
    if (p && pieceMap[p.type] === piece && p.color === color) {
      if (x === fromCol) candidates.push({ x, y, piece: p });
    }
  }
}

console.log("候选:", candidates);

// 计算targetColX
const targetColX = isRed ? (9 - target) : (target - 1);
console.log("targetColX:", targetColX);

// 处理动作
for (const candidate of candidates) {
  const { x, y } = candidate;
  let toX = x, toY = y;
  let valid = false;

  if (action === '平') {
    toY = y;
    toX = targetColX;
    valid = true;
    console.log(`平操作: (${x},${y}) -> (${toX},${toY})`);
  }

  // 检查目标位置
  const targetPiece = board[toY]?.[toX];
  console.log("目标位置:", targetPiece);
  
  if (targetPiece && targetPiece.color === color) {
    console.log("❌ 目标有同色棋子");
    valid = false;
  }

  // isInPalace检查
  function isInPalace(x, y, color) {
    if (x < 3 || x > 5) return false;
    if (color === 'red') return y >= 7 && y <= 9;
    return y >= 0 && y <= 2;
  }

  if (!isInPalace(toX, toY, color)) {
    console.log("❌ 不在九宫");
    valid = false;
  }

  if (valid) {
    console.log("✅ 移动有效！");
  }
}
