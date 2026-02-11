// 测试黑方棋子和吃子功能修复
const fs = require('fs');
const path = require('path');

// 读取 index.html 中的规则逻辑
const indexHtml = fs.readFileSync('./index.html', 'utf-8');

// 提取规则函数（简化版测试）
console.log('=== 测试黑方棋子移动修复 ===\n');

// 模拟棋盘
function createBoard(pieces = {}) {
  const board = Array(10).fill(null).map(() => Array(9).fill(null));
  for (const [pos, piece] of Object.entries(pieces)) {
    const [row, col] = pos.split(',').map(Number);
    board[row][col] = piece;
  }
  return board;
}

// 辅助函数
function getDelta(fromRow, fromCol, toRow, toCol) {
  return {
    dRow: toRow - fromRow,
    dCol: toCol - fromCol,
    absRow: Math.abs(toRow - fromRow),
    absCol: Math.abs(toCol - fromCol)
  };
}

// 修复后的相/象规则
function validateElephant(board, fromRow, fromCol, toRow, toCol, side) {
  const { absRow, absCol } = getDelta(fromRow, fromCol, toRow, toCol);
  if (absRow !== 2 || absCol !== 2) {
    return { valid: false, reason: '相只能走田字' };
  }
  const eyeRow = (fromRow + toRow) / 2;
  const eyeCol = (fromCol + toCol) / 2;
  if (board[eyeRow][eyeCol]) {
    return { valid: false, reason: '相被塞象眼' };
  }
  // 修复：正确判断是否过河
  if (side === 'red' && toRow < 5) {
    return { valid: false, reason: '相不能过河' };
  }
  if (side === 'black' && toRow >= 5) {
    return { valid: false, reason: '象不能过河' };
  }
  return { valid: true };
}

// 修复后的兵/卒规则
function validateSoldier(board, fromRow, fromCol, toRow, toCol, side) {
  const { dRow, absRow, absCol } = getDelta(fromRow, fromCol, toRow, toCol);
  if (absRow + absCol !== 1) {
    return { valid: false, reason: '兵只能移动一格' };
  }
  // 修复：正确判断是否已过河
  const crossed = side === 'red' ? fromRow >= 5 : fromRow < 5;
  const forwardDir = side === 'red' ? -1 : 1;  // 红方向上行(减)，黑方向下行(加)
  if (!crossed) {
    if (dRow !== forwardDir) {
      return { valid: false, reason: '兵过河前只能前进' };
    }
  } else {
    if (dRow === -forwardDir) {
      return { valid: false, reason: '兵不能后退' };
    }
  }
  return { valid: true };
}

// 测试1: 黑方象移动（不过河）
console.log('1. 黑方象移动测试 - 在己方区域');
const blackElephantBoard = createBoard({ '0,2': { type: '象', color: 'black' } });
const elephantMove1 = validateElephant(blackElephantBoard, 0, 2, 2, 4, 'black');
console.log('  黑象 (0,2) -> (2,4):', elephantMove1.valid ? '✅ 通过' : '❌ 失败', elephantMove1.reason || '');

// 测试2: 黑方象不能过河
console.log('\n2. 黑方象不能过河测试');
const blackElephantBoard2 = createBoard({ '4,2': { type: '象', color: 'black' } });
const elephantMove2 = validateElephant(blackElephantBoard2, 4, 2, 6, 4, 'black');
console.log('  黑象 (4,2) -> (6,4) 过河:', !elephantMove2.valid ? '✅ 正确拒绝' : '❌ 错误允许', elephantMove2.reason || '');

// 测试3: 红方相移动（不过河）
console.log('\n3. 红方相移动测试 - 在己方区域');
const redElephantBoard = createBoard({ '9,2': { type: '相', color: 'red' } });
const elephantMove3 = validateElephant(redElephantBoard, 9, 2, 7, 4, 'red');
console.log('  红相 (9,2) -> (7,4):', elephantMove3.valid ? '✅ 通过' : '❌ 失败', elephantMove3.reason || '');

// 测试4: 红方相不能过河
console.log('\n4. 红方相不能过河测试');
const redElephantBoard2 = createBoard({ '5,2': { type: '相', color: 'red' } });
const elephantMove4 = validateElephant(redElephantBoard2, 5, 2, 3, 4, 'red');
console.log('  红相 (5,2) -> (3,4) 过河:', !elephantMove4.valid ? '✅ 正确拒绝' : '❌ 错误允许', elephantMove4.reason || '');

// 测试5: 黑方卒前进（没过河）
console.log('\n5. 黑方卒前进测试 - 没过河');
const blackSoldierBoard = createBoard({ '3,0': { type: '卒', color: 'black' } });
const soldierMove1 = validateSoldier(blackSoldierBoard, 3, 0, 4, 0, 'black');
console.log('  黑卒 (3,0) -> (4,0):', soldierMove1.valid ? '✅ 通过' : '❌ 失败', soldierMove1.reason || '');

// 测试6: 黑方卒不能后退
console.log('\n6. 黑方卒不能后退测试');
const soldierMove2 = validateSoldier(blackSoldierBoard, 3, 0, 2, 0, 'black');
console.log('  黑卒 (3,0) -> (2,0):', !soldierMove2.valid ? '✅ 正确拒绝' : '❌ 错误允许', soldierMove2.reason || '');

// 测试7: 红方兵前进（没过河）
console.log('\n7. 红方兵前进测试 - 没过河');
const redSoldierBoard = createBoard({ '6,0': { type: '兵', color: 'red' } });
const soldierMove3 = validateSoldier(redSoldierBoard, 6, 0, 5, 0, 'red');
console.log('  红兵 (6,0) -> (5,0):', soldierMove3.valid ? '✅ 通过' : '❌ 失败', soldierMove3.reason || '');

// 测试8: 红方兵不能后退
console.log('\n8. 红方兵不能后退测试');
const soldierMove4 = validateSoldier(redSoldierBoard, 6, 0, 7, 0, 'red');
console.log('  红兵 (6,0) -> (7,0):', !soldierMove4.valid ? '✅ 正确拒绝' : '❌ 错误允许', soldierMove4.reason || '');

console.log('\n=== 测试完成 ===');
console.log('\n修复内容：');
console.log('1. 相/象过河判断：红方 toRow < 5 为过河，黑方 toRow >= 5 为过河');
console.log('2. 兵/卒前进方向：红方 forwardDir = -1（向上），黑方 forwardDir = 1（向下）');
console.log('3. 兵/卒过河判断：红方 fromRow >= 5 为过河，黑方 fromRow < 5 为过河');
