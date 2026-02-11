// 黑棋吃子Bug修复测试
const { XiangqiValidator } = require('./src/rules/validator');

const validator = new XiangqiValidator();

function createBoard(pieces = {}) {
  const board = Array(10).fill(null).map(() => Array(9).fill(null));
  for (const [pos, piece] of Object.entries(pieces)) {
    const [row, col] = pos.split(',').map(Number);
    board[row][col] = piece;
  }
  return board;
}

const R = (color) => ({ type: 'R', color });
const N = (color) => ({ type: 'N', color });
const B = (color) => ({ type: 'B', color });
const A = (color) => ({ type: 'A', color });
const K = (color) => ({ type: 'K', color });
const C = (color) => ({ type: 'C', color });
const P = (color) => ({ type: 'P', color });

let passed = 0;
let failed = 0;

function test(name, result, expected) {
  if (result === expected) {
    console.log(`✅ ${name}`);
    passed++;
  } else {
    console.log(`❌ ${name} - 期望: ${expected}, 实际: ${result}`);
    failed++;
  }
}

console.log('=== 黑棋吃子Bug修复验证 ===\n');

// 测试1: 黑将吃子（九宫格内）
console.log('【黑将吃子测试】');
const kingCaptureBoard = createBoard({
  '0,4': K('black'),
  '1,4': P('red')  // 红兵在将下方
});
test('黑将(0,4)吃红兵(1,4)', 
  validator.validateMove(kingCaptureBoard, [0, 4], [1, 4]).valid, true);

test('黑将不能吃己方棋子',
  validator.validateMove(createBoard({
    '0,4': K('black'), '1,4': P('black')
  }), [0, 4], [1, 4]).valid, false);

// 测试2: 黑士吃子
console.log('\n【黑士吃子测试】');
test('黑士(0,3)吃九宫格内红兵(1,4)',
  validator.validateMove(createBoard({
    '0,3': A('black'), '1,4': P('red')
  }), [0, 3], [1, 4]).valid, true);

test('黑士不能出九宫吃子',
  validator.validateMove(createBoard({
    '0,3': A('black'), '2,5': P('red')
  }), [0, 3], [2, 5]).valid, false);

// 测试3: 黑象吃子
console.log('\n【黑象吃子测试】');
test('黑象(0,2)吃(2,4)红兵',
  validator.validateMove(createBoard({
    '0,2': B('black'), '2,4': P('red')
  }), [0, 2], [2, 4]).valid, true);

test('黑象不能过河吃子(目标行>=5)',
  validator.validateMove(createBoard({
    '4,2': B('black'), '6,4': P('red')
  }), [4, 2], [6, 4]).valid, false);

// 测试4: 黑車吃子
console.log('\n【黑車吃子测试】');
test('黑車直线吃红兵',
  validator.validateMove(createBoard({
    '0,0': R('black'), '0,4': P('red')
  }), [0, 0], [0, 4]).valid, true);

test('黑車不能吃有阻挡的红兵',
  validator.validateMove(createBoard({
    '0,0': R('black'), '0,2': P('black'), '0,4': P('red')
  }), [0, 0], [0, 4]).valid, false);

// 测试5: 黑馬吃子
console.log('\n【黑馬吃子测试】');
test('黑馬日字吃红兵',
  validator.validateMove(createBoard({
    '0,1': N('black'), '2,2': P('red')
  }), [0, 1], [2, 2]).valid, true);

test('黑馬被绊腿不能吃子',
  validator.validateMove(createBoard({
    '0,1': N('black'), '1,1': P('black'), '2,2': P('red')
  }), [0, 1], [2, 2]).valid, false);

// 测试6: 黑炮吃子
console.log('\n【黑炮吃子测试】');
test('黑炮隔子吃红兵',
  validator.validateMove(createBoard({
    '2,1': C('black'), '2,3': P('black'), '2,5': P('red')
  }), [2, 1], [2, 5]).valid, true);

test('黑炮无炮架不能吃子',
  validator.validateMove(createBoard({
    '2,1': C('black'), '2,5': P('red')
  }), [2, 1], [2, 5]).valid, false);

// 测试7: 黑卒吃子
console.log('\n【黑卒吃子测试】');
test('黑卒过河前前进吃子',
  validator.validateMove(createBoard({
    '3,0': P('black'), '4,0': P('red')
  }), [3, 0], [4, 0]).valid, true);

test('黑卒过河前不能横吃',
  validator.validateMove(createBoard({
    '3,0': P('black'), '3,1': P('red')
  }), [3, 0], [3, 1]).valid, false);

test('黑卒过河后可以横吃',
  validator.validateMove(createBoard({
    '6,0': P('black'), '6,1': P('red')
  }), [6, 0], [6, 1]).valid, true);

// 总结
console.log('\n=== 测试结果 ===');
console.log(`通过: ${passed}/${passed + failed}`);
console.log(`失败: ${failed}/${passed + failed}`);

if (failed === 0) {
  console.log('\n🎉 所有测试通过！黑棋吃子Bug已修复！');
  process.exit(0);
} else {
  console.log('\n⚠️ 有测试未通过，请检查修复！');
  process.exit(1);
}
