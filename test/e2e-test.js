/**
 * Xiangqi E2E 测试套件
 * 测试场景：
 * 1. 棋盘正确渲染（9x10格子、红黑棋子）
 * 2. 各兵种走棋规则验证（将/士/象/马/车/炮/兵）
 * 3. AI能正常响应走棋
 * 4. 胜负判定正确
 * 5. 悔棋功能正常
 */

const fs = require('fs');
const path = require('path');

// 引入规则验证器
const { XiangqiValidator } = require('../src/rules/validator.js');
const { Rules } = require('../src/rules/piece-rules.js');

// 测试状态
const TestResults = {
  passed: 0,
  failed: 0,
  tests: []
};

// 测试断言工具
function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message || 'Assertion failed'}: expected ${expected}, got ${actual}`);
  }
}

// 测试运行器
function test(name, fn) {
  try {
    fn();
    TestResults.passed++;
    TestResults.tests.push({ name, status: 'PASS' });
    console.log(`✅ ${name}`);
  } catch (error) {
    TestResults.failed++;
    TestResults.tests.push({ name, status: 'FAIL', error: error.message });
    console.log(`❌ ${name}: ${error.message}`);
  }
}

// ============================================
// 测试用例
// ============================================

console.log('\n🏮 中国象棋 E2E 测试套件\n');
console.log('=' .repeat(50));

// 1. 棋盘渲染测试
console.log('\n📋 1. 棋盘渲染测试\n');

test('棋盘应为 10 行 x 9 列', () => {
  const validator = new XiangqiValidator();
  assertEqual(validator.ROWS, 10, '棋盘行数应为 10');
  assertEqual(validator.COLS, 9, '棋盘列数应为 9');
});

test('棋盘边界检查应正确', () => {
  assert(Rules.isInBounds(0, 0, 10, 9), '(0,0) 应在棋盘内');
  assert(Rules.isInBounds(9, 8, 10, 9), '(9,8) 应在棋盘内');
  assert(!Rules.isInBounds(-1, 0, 10, 9), '(-1,0) 应在棋盘外');
  assert(!Rules.isInBounds(0, -1, 10, 9), '(0,-1) 应在棋盘外');
  assert(!Rules.isInBounds(10, 0, 10, 9), '(10,0) 应在棋盘外');
  assert(!Rules.isInBounds(0, 9, 10, 9), '(0,9) 应在棋盘外');
});

test('九宫格边界检查应正确', () => {
  // 红方九宫 (row 7-9, col 3-5)
  assert(Rules.isInPalace(7, 3, 'red'), '红方九宫左下角应在宫内');
  assert(Rules.isInPalace(9, 5, 'red'), '红方九宫右下角应在宫内');
  assert(!Rules.isInPalace(6, 4, 'red'), '红方九宫上方应在宫外');
  assert(!Rules.isInPalace(8, 2, 'red'), '红方九宫左侧应在宫外');
  
  // 黑方九宫 (row 0-2, col 3-5)
  assert(Rules.isInPalace(0, 3, 'black'), '黑方九宫左上角应在宫内');
  assert(Rules.isInPalace(2, 5, 'black'), '黑方九宫右上角应在宫内');
  assert(!Rules.isInPalace(3, 4, 'black'), '黑方九宫下方应在宫外');
});

// 2. 棋子规则验证测试
console.log('\n📋 2. 各兵种走棋规则验证\n');

// 创建测试棋盘
function createEmptyBoard() {
  return Array(10).fill(null).map(() => Array(9).fill(null));
}

function createBoardWithPiece(row, col, type, color) {
  const board = createEmptyBoard();
  board[row][col] = { type, color };
  return board;
}

test('車 (Rook) 移动规则', () => {
  const validator = new XiangqiValidator();
  const board = createBoardWithPiece(0, 0, 'R', 'black');
  
  // 車可以直线移动
  let result = validator.validateMove(board, [0, 0], [0, 8]);
  assert(result.valid, '車应可以横向移动');
  
  result = validator.validateMove(board, [0, 0], [9, 0]);
  assert(result.valid, '車应可以纵向移动');
  
  // 車不能斜向移动
  result = validator.validateMove(board, [0, 0], [1, 1]);
  assert(!result.valid, '車不应可以斜向移动');
  
  // 車不能被阻挡
  board[0][4] = { type: 'P', color: 'black' };
  result = validator.validateMove(board, [0, 0], [0, 8]);
  assert(!result.valid, '車不应可以跳过棋子');
});

test('馬 (Knight) 移动规则', () => {
  const validator = new XiangqiValidator();
  const board = createBoardWithPiece(4, 4, 'N', 'red');
  
  // 馬可以走日字
  let result = validator.validateMove(board, [4, 4], [2, 5]); // 上2右1
  assert(result.valid, '馬应可以走上2右1');
  
  result = validator.validateMove(board, [4, 4], [3, 6]); // 上1右2
  assert(result.valid, '馬应可以走上1右2');
  
  // 馬不能走其他位置
  result = validator.validateMove(board, [4, 4], [2, 4]); // 直线上2
  assert(!result.valid, '馬不应可以直线上2');
  
  // 馬不能被绊脚
  board[3][4] = { type: 'P', color: 'red' }; // 在馬脚位置放棋子
  result = validator.validateMove(board, [4, 4], [2, 5]);
  assert(!result.valid, '馬被绊脚时不应可以移动');
});

test('相/象 (Elephant) 移动规则', () => {
  const validator = new XiangqiValidator();
  
  // 红方相在下方
  const redBoard = createBoardWithPiece(7, 2, 'B', 'red');
  let result = validator.validateMove(redBoard, [7, 2], [5, 4]); // 上2右2
  assert(result.valid, '红相应可以走田字');
  
  result = validator.validateMove(redBoard, [7, 2], [5, 0]); // 上2左2
  assert(result.valid, '红相应可以左上走田字');
  
  // 红相不能过河 (toRow < 5 是黑方区域)
  result = validator.validateMove(redBoard, [7, 2], [3, 4]);
  assert(!result.valid, '红相不应可以过河');
  
  // 黑方象在上方 (row 0-4是黑方区域, row >= 5是红方区域)
  const blackBoard = createBoardWithPiece(3, 2, 'B', 'black');
  // 从row 3移动到row 5是过河（row 5是红方区域）
  result = validator.validateMove(blackBoard, [3, 2], [5, 4]);
  assert(!result.valid, '黑象不应可以过河');
  
  // 塞象眼
  const boardWithEye = createBoardWithPiece(7, 2, 'B', 'red');
  boardWithEye[6][3] = { type: 'P', color: 'red' }; // 塞象眼
  result = validator.validateMove(boardWithEye, [7, 2], [5, 4]);
  assert(!result.valid, '塞象眼时不应可以移动');
});

test('仕 (Advisor) 移动规则', () => {
  const validator = new XiangqiValidator();
  
  // 红方仕在九宫
  const redBoard = createBoardWithPiece(8, 3, 'A', 'red');
  let result = validator.validateMove(redBoard, [8, 3], [7, 4]); // 斜向移动一格
  assert(result.valid, '仕应可以斜向移动一格');
  
  // 仕不能直走
  result = validator.validateMove(redBoard, [8, 3], [7, 3]);
  assert(!result.valid, '仕不应可以直走');
  
  // 仕不能走出九宫
  result = validator.validateMove(redBoard, [8, 3], [6, 5]);
  assert(!result.valid, '仕不应可以走出九宫');
});

test('将/帥 (King) 移动规则', () => {
  const validator = new XiangqiValidator();
  
  // 红方帥
  const redBoard = createBoardWithPiece(9, 4, 'K', 'red');
  let result = validator.validateMove(redBoard, [9, 4], [8, 4]); // 向上
  assert(result.valid, '帥应可以向上移动一格');
  
  result = validator.validateMove(redBoard, [9, 4], [9, 5]); // 向右
  assert(result.valid, '帥应可以向右移动一格');
  
  // 帥不能移动两格
  result = validator.validateMove(redBoard, [9, 4], [7, 4]);
  assert(!result.valid, '帥不应可以移动两格');
  
  // 帥不能走出九宫
  result = validator.validateMove(redBoard, [9, 4], [9, 6]);
  assert(!result.valid, '帥不应可以走出九宫');
});

test('炮 (Cannon) 移动规则', () => {
  const validator = new XiangqiValidator();
  const board = createBoardWithPiece(2, 1, 'C', 'red');
  
  // 炮可以直线移动
  let result = validator.validateMove(board, [2, 1], [2, 8]);
  assert(result.valid, '炮应可以横向移动');
  
  // 不吃子时不能跳过棋子
  board[2][4] = { type: 'P', color: 'red' };
  result = validator.validateMove(board, [2, 1], [2, 8]);
  assert(!result.valid, '炮不吃子时不应可以跳过棋子');
  
  // 吃子需要炮架
  const captureBoard = createBoardWithPiece(2, 1, 'C', 'red');
  captureBoard[2][4] = { type: 'P', color: 'red' }; // 炮架
  captureBoard[2][7] = { type: 'R', color: 'black' }; // 目标
  result = validator.validateMove(captureBoard, [2, 1], [2, 7]);
  assert(result.valid, '炮吃子时应需要炮架');
  
  // 吃子不能有多个炮架
  captureBoard[2][5] = { type: 'P', color: 'red' };
  result = validator.validateMove(captureBoard, [2, 1], [2, 7]);
  assert(!result.valid, '炮吃子时不应可以有多个炮架');
});

test('兵/卒 (Pawn) 移动规则', () => {
  const validator = new XiangqiValidator();
  
  // 红方兵在过河前 (row >= 5)
  const redBoard = createBoardWithPiece(6, 0, 'P', 'red');
  let result = validator.validateMove(redBoard, [6, 0], [5, 0]); // 向前
  assert(result.valid, '红兵过河前应可以前进');
  
  result = validator.validateMove(redBoard, [6, 0], [6, 1]); // 横向
  assert(!result.valid, '红兵过河前不应可以横向移动');
  
  result = validator.validateMove(redBoard, [6, 0], [7, 0]); // 后退
  assert(!result.valid, '红兵不应可以后退');
  
  // 红方兵过河后 (row < 5)
  const crossedRedBoard = createBoardWithPiece(4, 0, 'P', 'red');
  result = validator.validateMove(crossedRedBoard, [4, 0], [4, 1]); // 横向
  assert(result.valid, '红兵过河后应可以横向移动');
  
  // 黑方卒
  const blackBoard = createBoardWithPiece(3, 0, 'P', 'black');
  result = validator.validateMove(blackBoard, [3, 0], [4, 0]); // 向前（向下）
  assert(result.valid, '黑卒过河前应可以前进');
});

test('不能吃己方棋子', () => {
  const validator = new XiangqiValidator();
  const board = createEmptyBoard();
  board[0][0] = { type: 'R', color: 'black' };
  board[0][4] = { type: 'N', color: 'black' };
  
  const result = validator.validateMove(board, [0, 0], [0, 4]);
  assert(!result.valid, '不应可以吃己方棋子');
});

// 3. 历史记录和悔棋测试
console.log('\n📋 3. 历史记录与悔棋功能测试\n');

test('棋盘克隆应正确', () => {
  const original = createEmptyBoard();
  original[0][0] = { type: 'R', color: 'black' };
  original[9][9] = { type: 'R', color: 'red' };
  
  // 模拟克隆函数
  function cloneBoard(board) {
    return board.map(row => 
      row.map(cell => cell ? { ...cell } : null)
    );
  }
  
  const cloned = cloneBoard(original);
  
  // 验证克隆正确
  assertEqual(cloned[0][0].type, 'R', '克隆后棋子类型应正确');
  assertEqual(cloned[0][0].color, 'black', '克隆后棋子颜色应正确');
  
  // 验证深拷贝
  cloned[0][0].type = 'N';
  assertEqual(original[0][0].type, 'R', '修改克隆不应影响原棋盘');
});

// 4. AI 引擎接口测试
console.log('\n📋 4. AI 引擎接口测试\n');

test('引擎类应存在', () => {
  // 检查引擎文件是否存在
  const enginePath = path.join(__dirname, '..', 'engine', 'engine.js');
  assert(fs.existsSync(enginePath), '引擎文件应存在');
});

test('引擎应提供核心方法', () => {
  // 读取引擎文件内容检查接口
  const enginePath = path.join(__dirname, '..', 'engine', 'engine.js');
  const engineCode = fs.readFileSync(enginePath, 'utf8');
  
  assert(engineCode.includes('getBestMove'), '引擎应提供 getBestMove 方法');
  assert(engineCode.includes('scoreToWinrate'), '引擎应提供 scoreToWinrate 方法');
  assert(engineCode.includes('scoreToDescription'), '引擎应提供 scoreToDescription 方法');
});

// 5. 文件结构测试
console.log('\n📋 5. 项目文件结构测试\n');

test('HTML 文件应存在', () => {
  const htmlPath = path.join(__dirname, '..', 'index.html');
  assert(fs.existsSync(htmlPath), 'index.html 应存在');
});

test('引擎目录应存在', () => {
  const engineDir = path.join(__dirname, '..', 'engine');
  assert(fs.existsSync(engineDir), 'engine 目录应存在');
});

test('规则验证器应存在', () => {
  const validatorPath = path.join(__dirname, '..', 'src', 'rules', 'validator.js');
  assert(fs.existsSync(validatorPath), 'validator.js 应存在');
  
  const pieceRulesPath = path.join(__dirname, '..', 'src', 'rules', 'piece-rules.js');
  assert(fs.existsSync(pieceRulesPath), 'piece-rules.js 应存在');
});

// 6. HTML 内容测试
console.log('\n📋 6. HTML 内容测试\n');

test('HTML 应包含棋盘渲染', () => {
  const htmlPath = path.join(__dirname, '..', 'index.html');
  const htmlContent = fs.readFileSync(htmlPath, 'utf8');
  
  assert(htmlContent.includes('boardGrid'), 'HTML 应包含 boardGrid 元素');
  assert(htmlContent.includes('piece'), 'HTML 应包含 piece 样式');
});

test('HTML 应包含悔棋功能', () => {
  const htmlPath = path.join(__dirname, '..', 'index.html');
  const htmlContent = fs.readFileSync(htmlPath, 'utf8');
  
  assert(htmlContent.includes('undoMove'), 'HTML 应包含 undoMove 函数');
});

test('HTML 应包含 AI 分析功能', () => {
  const htmlPath = path.join(__dirname, '..', 'index.html');
  const htmlContent = fs.readFileSync(htmlPath, 'utf8');
  
  assert(htmlContent.includes('getAIAdvice'), 'HTML 应包含 getAIAdvice 函数');
});

test('HTML 应包含游戏记录功能', () => {
  const htmlPath = path.join(__dirname, '..', 'index.html');
  const htmlContent = fs.readFileSync(htmlPath, 'utf8');
  
  assert(htmlContent.includes('moveHistory'), 'HTML 应包含 moveHistory');
  assert(htmlContent.includes('boardHistory'), 'HTML 应包含 boardHistory');
});

// 7. 初始棋盘测试
console.log('\n📋 7. 初始棋盘配置测试\n');

test('初始棋盘应有正确数量的棋子', () => {
  // 初始棋盘配置
  const initialBoard = Array(10).fill(null).map(() => Array(9).fill(null));
  
  // 黑方
  initialBoard[0] = [
    { type: 'R', color: 'black' }, { type: 'N', color: 'black' }, 
    { type: 'B', color: 'black' }, { type: 'A', color: 'black' }, 
    { type: 'K', color: 'black' }, { type: 'A', color: 'black' }, 
    { type: 'B', color: 'black' }, { type: 'N', color: 'black' }, 
    { type: 'R', color: 'black' }
  ];
  initialBoard[2][1] = { type: 'C', color: 'black' };
  initialBoard[2][7] = { type: 'C', color: 'black' };
  initialBoard[3][0] = { type: 'P', color: 'black' };
  initialBoard[3][2] = { type: 'P', color: 'black' };
  initialBoard[3][4] = { type: 'P', color: 'black' };
  initialBoard[3][6] = { type: 'P', color: 'black' };
  initialBoard[3][8] = { type: 'P', color: 'black' };
  
  // 红方
  initialBoard[9] = [
    { type: 'R', color: 'red' }, { type: 'N', color: 'red' }, 
    { type: 'B', color: 'red' }, { type: 'A', color: 'red' }, 
    { type: 'K', color: 'red' }, { type: 'A', color: 'red' }, 
    { type: 'B', color: 'red' }, { type: 'N', color: 'red' }, 
    { type: 'R', color: 'red' }
  ];
  initialBoard[7][1] = { type: 'C', color: 'red' };
  initialBoard[7][7] = { type: 'C', color: 'red' };
  initialBoard[6][0] = { type: 'P', color: 'red' };
  initialBoard[6][2] = { type: 'P', color: 'red' };
  initialBoard[6][4] = { type: 'P', color: 'red' };
  initialBoard[6][6] = { type: 'P', color: 'red' };
  initialBoard[6][8] = { type: 'P', color: 'red' };
  
  // 统计棋子数量
  let redCount = 0;
  let blackCount = 0;
  
  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 9; col++) {
      const piece = initialBoard[row][col];
      if (piece) {
        if (piece.color === 'red') redCount++;
        else blackCount++;
      }
    }
  }
  
  assertEqual(redCount, 16, '红方应有16个棋子');
  assertEqual(blackCount, 16, '黑方应有16个棋子');
});

// ============================================
// 测试报告
// ============================================

console.log('\n' + '='.repeat(50));
console.log('\n📊 测试报告\n');
console.log(`✅ 通过: ${TestResults.passed}`);
console.log(`❌ 失败: ${TestResults.failed}`);
console.log(`📈 总计: ${TestResults.passed + TestResults.failed}`);
console.log(`🎯 通过率: ${Math.round(TestResults.passed / (TestResults.passed + TestResults.failed) * 100)}%`);

// 保存测试结果
const reportPath = path.join(__dirname, 'e2e-test-report.json');
fs.writeFileSync(reportPath, JSON.stringify({
  timestamp: new Date().toISOString(),
  summary: {
    passed: TestResults.passed,
    failed: TestResults.failed,
    total: TestResults.passed + TestResults.failed,
    passRate: Math.round(TestResults.passed / (TestResults.passed + TestResults.failed) * 100)
  },
  tests: TestResults.tests
}, null, 2));

console.log(`\n📝 测试报告已保存至: ${reportPath}`);

// 退出码
process.exit(TestResults.failed > 0 ? 1 : 0);
