// 完整的findCoordinates模拟
const board = Array(10).fill(null).map(() => Array(9).fill(null));
board[0][4] = { type: '將', color: 'black' }; // 将在5路
board[0][5] = { type: '士', color: 'black' }; // 士在6路，可能是这里有问题！

const pieceMap = {
  '將': 'king', '士': 'advisor', '象': 'elephant',
  '馬': 'horse', '車': 'rook', '砲': 'cannon', '卒': 'pawn'
};

const parsedMove = {
  type: 'move',
  piece: 'king',
  pieceChar: '将',
  fromCol: 4, // 5路
  action: '平',
  target: 6,  // 平到6路
  targetChar: '6',
  isRed: false,
  notation: '将5平6'
};

const { piece, fromCol, action, target, isRed } = parsedMove;
const color = 'black';

// 计算targetColX
const targetColX = isRed ? (9 - target) : (target - 1);
console.log("targetColX:", targetColX); // Should be 5

// 查找候选
const candidates = [];
for (let y = 0; y < 10; y++) {
  for (let x = 0; x < 9; x++) {
    const p = board[y][x];
    if (p && pieceMap[p.type] === piece && p.color === color) {
      if (x === fromCol) {
        candidates.push({ x, y, piece: p });
      }
    }
  }
}

console.log("候选:", candidates);

// 模拟平操作
for (const candidate of candidates) {
  const { x, y } = candidate;
  let toX = x, toY = y;
  let valid = false;

  if (action === '平') {
    toY = y;
    toX = targetColX;
    valid = true;
    console.log(`平操作: from (${x},${y}) to (${toX},${toY})`);
  }
  
  // 检查目标位置
  const targetPiece = board[toY][toX];
  console.log("目标位置棋子:", targetPiece);
  
  if (targetPiece && targetPiece.color === color) {
    console.log("❌ 目标位置有同色棋子，无法移动");
    valid = false;
  }
  
  if (valid && toX >= 0 && toX < 9 && toY >= 0 && toY < 10) {
    console.log("✅ 移动有效");
  } else {
    console.log("❌ 移动无效");
  }
}
