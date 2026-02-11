// 测试黑方棋子和吃子功能
const { XiangqiValidator } = require('./src/rules/validator');

const validator = new XiangqiValidator();

// 创建测试棋盘
function createBoard(pieces = {}) {
  const board = Array(10).fill(null).map(() => Array(9).fill(null));
  for (const [pos, piece] of Object.entries(pieces)) {
    const [row, col] = pos.split(',').map(Number);
    board[row][col] = piece;
  }
  return board;
}

const R = (color) => ({ type: 'R', color }); // 車
const N = (color) => ({ type: 'N', color }); // 馬
const B = (color) => ({ type: 'B', color }); // 相/象
const A = (color) => ({ type: 'A', color }); // 仕/士
const K = (color) => ({ type: 'K', color }); // 帥/將
const C = (color) => ({ type: 'C', color }); // 炮
const P = (color) => ({ type: 'P', color }); // 兵/卒

console.log('=== 测试黑方棋子移动 ===\n');

// 测试1: 黑方象移动
console.log('1. 黑方象移动测试');
const blackElephantBoard = createBoard({
  '0,2': B('black'),  // 黑象在原始位置
  '2,4': null
});
const elephantMove = validator.validateMove(blackElephantBoard, [0, 2], [2, 4], B('black'));
console.log('  黑象 (0,2) -> (2,4):', elephantMove.valid ? '✅ 通过' : '❌ 失败', elephantMove.reason || '');

// 测试2: 黑方士移动
console.log('\n2. 黑方士移动测试');
const blackAdvisorBoard = createBoard({
  '0,3': A('black'),  // 黑士在原始位置
  '1,4': null
});
const advisorMove = validator.validateMove(blackAdvisorBoard, [0, 3], [1, 4], A('black'));
console.log('  黑士 (0,3) -> (1,4):', advisorMove.valid ? '✅ 通过' : '❌ 失败', advisorMove.reason || '');

// 测试3: 黑方将移动
console.log('\n3. 黑方将移动测试');
const blackKingBoard = createBoard({
  '0,4': K('black'),  // 黑将在原始位置
  '1,4': null
});
const kingMove = validator.validateMove(blackKingBoard, [0, 4], [1, 4], K('black'));
console.log('  黑将 (0,4) -> (1,4):', kingMove.valid ? '✅ 通过' : '❌ 失败', kingMove.reason || '');

// 测试4: 吃子功能 - 黑車吃红兵
console.log('\n4. 吃子功能测试 - 黑車吃红兵');
const captureBoard = createBoard({
  '0,0': R('black'),  // 黑車
  '0,4': P('red')     // 红兵
});
const captureMove = validator.validateMove(captureBoard, [0, 0], [0, 4], R('black'));
console.log('  黑車 (0,0) -> 吃红兵 (0,4):', captureMove.valid ? '✅ 通过' : '❌ 失败', captureMove.reason || '');

// 测试5: 不能吃己方棋子
console.log('\n5. 不能吃己方棋子测试');
const noSelfCaptureBoard = createBoard({
  '0,0': R('black'),  // 黑車
  '0,4': P('black')   // 黑卒（己方）
});
const noSelfCapture = validator.validateMove(noSelfCaptureBoard, [0, 0], [0, 4], R('black'));
console.log('  黑車吃黑卒（应失败）:', !noSelfCapture.valid ? '✅ 正确拒绝' : '❌ 错误允许', noSelfCapture.reason || '');

// 测试6: 黑方象吃子
console.log('\n6. 黑方象吃子测试');
const elephantCaptureBoard = createBoard({
  '0,2': B('black'),  // 黑象
  '2,4': P('red')     // 红兵
});
const elephantCapture = validator.validateMove(elephantCaptureBoard, [0, 2], [2, 4], B('black'));
console.log('  黑象 (0,2) -> 吃红兵 (2,4):', elephantCapture.valid ? '✅ 通过' : '❌ 失败', elephantCapture.reason || '');

// 测试7: 黑方士吃子
console.log('\n7. 黑方士吃子测试');
const advisorCaptureBoard = createBoard({
  '0,3': A('black'),  // 黑士
  '1,4': P('red')     // 红兵（在九宫内）
});
const advisorCapture = validator.validateMove(advisorCaptureBoard, [0, 3], [1, 4], A('black'));
console.log('  黑士 (0,3) -> 吃红兵 (1,4):', advisorCapture.valid ? '✅ 通过' : '❌ 失败', advisorCapture.reason || '');

console.log('\n=== 测试完成 ===');
