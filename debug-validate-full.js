function initBoard() {
  const board = Array(10).fill(null).map(() => Array(9).fill(null));
  board[1][4] = { type: '士', color: 'black' };
  board[0][4] = { type: '將', color: 'black' };
  board[0][3] = { type: '士', color: 'black' };
  return board;
}

const board = initBoard();
const fromX = 4, fromY = 1, toX = 3, toY = 0;
const color = 'black';

// Simulate isValidTarget
function getUnifiedPieceType(type) {
  const map = {
    '將': 'K', '帥': 'K', '士': 'A', '仕': 'A', '象': 'B', '相': 'B',
    '車': 'R', '俥': 'R', '馬': 'N', '傌': 'N', '砲': 'C', '炮': 'C',
    '卒': 'P', '兵': 'P'
  };
  return map[type];
}

function isInPalace(x, y, color) {
  if (x < 3 || x > 5) return false;
  if (color === 'red') return y >= 7 && y <= 9;
  return y >= 0 && y <= 2;
}

// Step by step
console.log("1. 边界检查");
console.log(`   toX=${toX} in [0,9): ${toX >= 0 && toX < 9}`);
console.log(`   toY=${toY} in [0,10): ${toY >= 0 && toY < 10}`);

const targetPiece = board[toY][toX];
console.log(`\n2. 目标位置检查: board[${toY}][${toX}] =`, targetPiece);

if (targetPiece && targetPiece.color === color) {
  console.log("   ❌ 目标有同色棋子");
} else {
  console.log("   ✅ 目标可以移动");
}

const piece = board[fromY][fromX];
console.log(`\n3. 源位置棋子: board[${fromY}][${fromX}] =`, piece);

const unifiedType = getUnifiedPieceType(piece.type);
console.log(`   unifiedType = '${unifiedType}'`);

const dx = toX - fromX;
const dy = toY - fromY;
const absDx = Math.abs(dx);
const absDy = Math.abs(dy);
console.log(`\n4. 移动向量: dx=${dx}, dy=${dy}, absDx=${absDx}, absDy=${absDy}`);

if (unifiedType === 'A') {
  console.log("\n5. 士/仕走法检查:");
  console.log(`   absDx === 1: ${absDx === 1}`);
  console.log(`   absDy === 1: ${absDy === 1}`);
  const diagonalCheck = absDx === 1 && absDy === 1;
  console.log(`   斜走一格: ${diagonalCheck ? '✅' : '❌'}`);
  
  const palaceCheck = isInPalace(toX, toY, color);
  console.log(`   isInPalace(${toX},${toY},'${color}'): ${palaceCheck ? '✅' : '❌'}`);
  
  console.log(`\n   最终结果: ${diagonalCheck && palaceCheck ? '✅ 有效' : '❌ 无效'}`);
}
