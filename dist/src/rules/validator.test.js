/**
 * 象棋规则验证测试 - 完整测试套件
 * 基于正确的棋盘布局：红方在底部(7-9行)，黑方在顶部(0-2行)
 */

// 模拟棋盘状态辅助函数
function createBoard(pieces = {}) {
  const board = Array(10).fill(null).map(() => Array(9).fill(null));
  for (const [pos, piece] of Object.entries(pieces)) {
    const [row, col] = pos.split(',').map(Number);
    board[row][col] = piece;
  }
  return board;
}

// 模拟棋子工厂
const R = (color) => ({ type: 'R', color }); // 車
const N = (color) => ({ type: 'N', color }); // 馬
const B = (color) => ({ type: 'B', color }); // 相
const A = (color) => ({ type: 'A', color }); // 仕
const K = (color) => ({ type: 'K', color }); // 帥/將
const P = (color) => ({ type: 'P', color }); // 兵/卒
const C = (color) => ({ type: 'C', color }); // 炮

const RED = 'red';
const BLACK = 'black';

describe('象棋规则验证器', () => {
  let validator;
  
  beforeEach(() => {
    const { XiangqiValidator } = require('./validator');
    validator = new XiangqiValidator();
  });

  describe('車 (Rook) 移动规则', () => {
    test('車应能水平向右移动', () => {
      const board = createBoard({ '0,0': R(BLACK) });  // 黑方車
      const result = validator.validateMove(board, [0, 0], [0, 8]);
      expect(result.valid).toBe(true);
    });

    test('車应能水平向左移动', () => {
      const board = createBoard({ '0,8': R(BLACK) });  // 黑方車
      const result = validator.validateMove(board, [0, 8], [0, 0]);
      expect(result.valid).toBe(true);
    });

    test('車应能垂直向下移动', () => {
      const board = createBoard({ '0,4': R(BLACK) });  // 黑方車
      const result = validator.validateMove(board, [0, 4], [9, 4]);
      expect(result.valid).toBe(true);
    });

    test('車应能垂直向上移动', () => {
      const board = createBoard({ '9,4': R(RED) });  // 红方車
      const result = validator.validateMove(board, [9, 4], [0, 4]);
      expect(result.valid).toBe(true);
    });

    test('車不能斜向移动', () => {
      const board = createBoard({ '0,0': R(BLACK) });
      const result = validator.validateMove(board, [0, 0], [1, 1]);
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('直线');
    });

    test('車不能跳过中间棋子', () => {
      const board = createBoard({ 
        '0,0': R(BLACK),
        '0,4': P(RED)
      });
      const result = validator.validateMove(board, [0, 0], [0, 8]);
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('阻挡');
    });

    test('車可以吃掉目标位置的敌方棋子', () => {
      const board = createBoard({ 
        '0,0': R(BLACK),
        '0,4': P(RED)
      });
      const result = validator.validateMove(board, [0, 0], [0, 4]);
      expect(result.valid).toBe(true);
    });

    test('車不能吃己方棋子', () => {
      const board = createBoard({ 
        '0,0': R(BLACK),
        '0,4': P(BLACK)
      });
      const result = validator.validateMove(board, [0, 0], [0, 4]);
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('己方');
    });
  });

  describe('馬 (Horse/Knight) 移动规则', () => {
    test('馬应按日字移动 - 右上', () => {
      const board = createBoard({ '3,2': N(RED) });
      const result = validator.validateMove(board, [3, 2], [1, 3]); // 上2右1
      expect(result.valid).toBe(true);
    });

    test('馬应按日字移动 - 右下', () => {
      const board = createBoard({ '3,2': N(RED) });
      const result = validator.validateMove(board, [3, 2], [5, 3]); // 下2右1
      expect(result.valid).toBe(true);
    });

    test('馬应按日字移动 - 左上', () => {
      const board = createBoard({ '3,2': N(RED) });
      const result = validator.validateMove(board, [3, 2], [1, 1]); // 上2左1
      expect(result.valid).toBe(true);
    });

    test('馬应按日字移动 - 左下', () => {
      const board = createBoard({ '3,2': N(RED) });
      const result = validator.validateMove(board, [3, 2], [5, 1]); // 下2左1
      expect(result.valid).toBe(true);
    });

    test('馬应按日字移动 - 横日右', () => {
      const board = createBoard({ '3,2': N(RED) });
      const result = validator.validateMove(board, [3, 2], [2, 4]); // 上1右2
      expect(result.valid).toBe(true);
    });

    test('馬不能非日字移动', () => {
      const board = createBoard({ '3,2': N(RED) });
      const result = validator.validateMove(board, [3, 2], [5, 5]); // 2+3 不是日字
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('日字');
    });

    test('馬不能直行移动', () => {
      const board = createBoard({ '3,2': N(RED) });
      const result = validator.validateMove(board, [3, 2], [3, 5]);
      expect(result.valid).toBe(false);
    });

    test('馬被绊脚(蹩马腿)时不能移动 - 上方向', () => {
      const board = createBoard({ 
        '3,2': N(RED),
        '2,2': P(RED) // 绊马腿
      });
      const result = validator.validateMove(board, [3, 2], [1, 3]);
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('绊脚');
    });

    test('馬被绊脚(蹩马腿)时不能移动 - 下方向', () => {
      const board = createBoard({ 
        '3,2': N(RED),
        '4,2': P(BLACK)
      });
      const result = validator.validateMove(board, [3, 2], [5, 3]);
      expect(result.valid).toBe(false);
    });

    test('馬被绊脚(蹩马腿)时不能移动 - 左方向', () => {
      const board = createBoard({ 
        '3,2': N(RED),
        '3,1': P(RED)
      });
      const result = validator.validateMove(board, [3, 2], [2, 0]);
      expect(result.valid).toBe(false);
    });

    test('馬未被绊脚时可以移动', () => {
      const board = createBoard({ 
        '3,2': N(RED),
        '2,3': P(RED) // 不在绊脚位置
      });
      const result = validator.validateMove(board, [3, 2], [1, 3]);
      expect(result.valid).toBe(true);
    });
  });

  describe('相 (Elephant) 移动规则', () => {
    // 红方相在底部，从7-9行走
    test('红相应按田字移动 - 右上', () => {
      const board = createBoard({ '7,2': B(RED) });
      const result = validator.validateMove(board, [7, 2], [9, 4]);
      expect(result.valid).toBe(true);
    });

    test('红相应按田字移动 - 左上', () => {
      const board = createBoard({ '7,6': B(RED) });
      const result = validator.validateMove(board, [7, 6], [9, 4]);
      expect(result.valid).toBe(true);
    });

    test('红相应按田字移动 - 右下', () => {
      const board = createBoard({ '9,2': B(RED) });
      const result = validator.validateMove(board, [9, 2], [7, 4]);
      expect(result.valid).toBe(true);
    });

    test('红相应按田字移动 - 左下', () => {
      const board = createBoard({ '9,6': B(RED) });
      const result = validator.validateMove(board, [9, 6], [7, 4]);
      expect(result.valid).toBe(true);
    });

    // 黑方象在顶部，从0-2行走
    test('黑方象应按田字移动 - 右上', () => {
      const board = createBoard({ '0,2': B(BLACK) });
      const result = validator.validateMove(board, [0, 2], [2, 4]);
      expect(result.valid).toBe(true);
    });

    test('黑方象应按田字移动 - 左上', () => {
      const board = createBoard({ '0,6': B(BLACK) });
      const result = validator.validateMove(board, [0, 6], [2, 4]);
      expect(result.valid).toBe(true);
    });

    test('黑方象应按田字移动 - 右下', () => {
      const board = createBoard({ '2,4': B(BLACK) });
      const result = validator.validateMove(board, [2, 4], [0, 6]);
      expect(result.valid).toBe(true);
    });

    test('黑方象应按田字移动 - 左下', () => {
      const board = createBoard({ '2,4': B(BLACK) });
      const result = validator.validateMove(board, [2, 4], [0, 2]);
      expect(result.valid).toBe(true);
    });

    test('相不能非田字移动', () => {
      const board = createBoard({ '0,2': B(BLACK) });
      const result = validator.validateMove(board, [0, 2], [1, 3]);
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('田字');
    });

    test('红相不能过河', () => {
      // 红相在 [7,4]，田字移动到 [5,6]，row=5 不算过河
      // 需要找一个能走到 row < 5 的测试用例
      // 实际上相只能在自己半场移动，红方半场是 5-9行
      // 从 [7,4] 田字移动只能到 [5,2] 或 [5,6]，都是 row=5
      // 所以红相从合法位置出发，田字移动不会直接过河到 row < 5
      // 让我们测试从边界位置移动
      const board = createBoard({ '5,2': B(RED) });
      const result = validator.validateMove(board, [5, 2], [3, 4]); // 到row 3，过河了
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('过河');
    });

    test('黑象不能过河', () => {
      const board = createBoard({ '4,2': B(BLACK) });
      const result = validator.validateMove(board, [4, 2], [6, 4]); // 到row 6，过河了
      expect(result.valid).toBe(false);
    });

    test('相被塞象眼时不能移动', () => {
      const board = createBoard({ 
        '0,2': B(BLACK),
        '1,3': P(RED) // 塞象眼
      });
      const result = validator.validateMove(board, [0, 2], [2, 4]);
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('象眼');
    });
  });

  describe('仕 (Advisor) 移动规则', () => {
    // 红方仕在底部九宫 7-9行
    test('红方仕应在九宫内斜线移动 - 右下', () => {
      const board = createBoard({ '7,3': A(RED) });
      const result = validator.validateMove(board, [7, 3], [8, 4]);
      expect(result.valid).toBe(true);
    });

    test('红方仕应在九宫内斜线移动 - 左下', () => {
      const board = createBoard({ '7,5': A(RED) });
      const result = validator.validateMove(board, [7, 5], [8, 4]);
      expect(result.valid).toBe(true);
    });

    // 黑方士在顶部九宫 0-2行
    test('黑方士应在九宫内斜线移动 - 右上', () => {
      const board = createBoard({ '0,3': A(BLACK) });
      const result = validator.validateMove(board, [0, 3], [1, 4]);
      expect(result.valid).toBe(true);
    });

    test('黑方士应在九宫内斜线移动 - 左上', () => {
      const board = createBoard({ '0,5': A(BLACK) });
      const result = validator.validateMove(board, [0, 5], [1, 4]);
      expect(result.valid).toBe(true);
    });

    test('仕不能直行移动', () => {
      const board = createBoard({ '0,3': A(BLACK) });
      const result = validator.validateMove(board, [0, 3], [1, 3]);
      expect(result.valid).toBe(false);
    });

    test('仕不能走出九宫(红方)', () => {
      const board = createBoard({ '7,3': A(RED) });
      const result = validator.validateMove(board, [7, 3], [6, 4]); // 走出九宫
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('九宫');
    });

    test('仕不能走出九宫(黑方)', () => {
      const board = createBoard({ '2,3': A(BLACK) });
      const result = validator.validateMove(board, [2, 3], [3, 4]); // 走出九宫
      expect(result.valid).toBe(false);
    });

    test('仕不能非斜线移动', () => {
      const board = createBoard({ '0,4': A(BLACK) });
      const result = validator.validateMove(board, [0, 4], [0, 5]);
      expect(result.valid).toBe(false);
    });
  });

  describe('帥 (General/King) 移动规则', () => {
    // 红方帥在底部九宫 7-9行
    test('红方帥应在九宫内一格移动 - 向下', () => {
      const board = createBoard({ '7,4': K(RED) });
      const result = validator.validateMove(board, [7, 4], [8, 4]);
      expect(result.valid).toBe(true);
    });

    test('红方帥应在九宫内一格移动 - 向右', () => {
      const board = createBoard({ '8,3': K(RED) });
      const result = validator.validateMove(board, [8, 3], [8, 4]);
      expect(result.valid).toBe(true);
    });

    // 黑方將在顶部九宫 0-2行
    test('黑方將应在九宫内一格移动 - 向上', () => {
      const board = createBoard({ '2,4': K(BLACK) });
      const result = validator.validateMove(board, [2, 4], [1, 4]);
      expect(result.valid).toBe(true);
    });

    test('帥不能移动超过一格', () => {
      const board = createBoard({ '7,4': K(RED) });
      const result = validator.validateMove(board, [7, 4], [9, 4]);
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('一格');
    });

    test('帥不能走出九宫(红方)', () => {
      const board = createBoard({ '7,3': K(RED) });
      const result = validator.validateMove(board, [7, 3], [6, 3]);
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('九宫');
    });

    test('帥不能走出九宫(黑方)', () => {
      const board = createBoard({ '2,3': K(BLACK) });
      const result = validator.validateMove(board, [2, 3], [3, 3]);
      expect(result.valid).toBe(false);
    });

    test('帥不能斜向移动', () => {
      const board = createBoard({ '7,4': K(RED) });
      const result = validator.validateMove(board, [7, 4], [8, 5]);
      expect(result.valid).toBe(false);
    });

    test('帥不能吃己方棋子', () => {
      const board = createBoard({ 
        '7,4': K(RED),
        '8,4': A(RED)
      });
      const result = validator.validateMove(board, [7, 4], [8, 4]);
      expect(result.valid).toBe(false);
    });

    test('帥可以吃敌方棋子', () => {
      const board = createBoard({ 
        '7,4': K(RED),
        '8,4': A(BLACK)
      });
      const result = validator.validateMove(board, [7, 4], [8, 4]);
      expect(result.valid).toBe(true);
    });

    test('帥不能对脸(飞将)', () => {
      // 红帥在[8,4]，黑將在[0,4]，中间无棋子 = 对脸
      const board = createBoard({ 
        '8,4': K(RED),
        '0,4': K(BLACK)
      });
      // 红帥移动到[7,4]，检查是否与黑將对脸
      const result = validator.validateMove(board, [8, 4], [7, 4]);
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('对脸');
    });
  });

  describe('兵 (Soldier/Pawn) 移动规则', () => {
    describe('红方兵', () => {
      test('兵过河前只能前进(向上)', () => {
        const board = createBoard({ '6,4': P(RED) }); // 未过河
        const result = validator.validateMove(board, [6, 4], [5, 4]);
        expect(result.valid).toBe(true);
      });

      test('兵过河前不能后退', () => {
        const board = createBoard({ '6,4': P(RED) }); // 未过河
        const result = validator.validateMove(board, [6, 4], [7, 4]);
        expect(result.valid).toBe(false);
        expect(result.reason).toContain('后退');
      });

      test('兵过河前不能横移', () => {
        const board = createBoard({ '6,4': P(RED) }); // 未过河
        const result = validator.validateMove(board, [6, 4], [6, 5]);
        expect(result.valid).toBe(false);
        expect(result.reason).toContain('横移');
      });

      test('兵过河后可以横移', () => {
        const board = createBoard({ '4,4': P(RED) }); // 已过河(row < 5)
        const result = validator.validateMove(board, [4, 4], [4, 5]);
        expect(result.valid).toBe(true);
      });

      test('兵过河后可以后退', () => {
        const board = createBoard({ '4,4': P(RED) }); // 已过河
        const result = validator.validateMove(board, [4, 4], [5, 4]);
        expect(result.valid).toBe(true);
      });

      test('兵过河后仍然可以前进', () => {
        const board = createBoard({ '4,4': P(RED) }); // 已过河
        const result = validator.validateMove(board, [4, 4], [3, 4]);
        expect(result.valid).toBe(true);
      });
    });

    describe('黑方卒', () => {
      test('卒过河前只能前进(向下)', () => {
        const board = createBoard({ '3,4': P(BLACK) }); // 未过河
        const result = validator.validateMove(board, [3, 4], [4, 4]);
        expect(result.valid).toBe(true);
      });

      test('卒过河前不能后退', () => {
        const board = createBoard({ '3,4': P(BLACK) }); // 未过河
        const result = validator.validateMove(board, [3, 4], [2, 4]);
        expect(result.valid).toBe(false);
      });

      test('卒过河后可以横移', () => {
        const board = createBoard({ '5,4': P(BLACK) }); // 已过河(row >= 5)
        const result = validator.validateMove(board, [5, 4], [5, 5]);
        expect(result.valid).toBe(true);
      });

      test('卒过河后可以后退', () => {
        const board = createBoard({ '5,4': P(BLACK) }); // 已过河
        const result = validator.validateMove(board, [5, 4], [4, 4]);
        expect(result.valid).toBe(true);
      });
    });

    test('兵不能移动超过一格', () => {
      const board = createBoard({ '6,4': P(RED) });
      const result = validator.validateMove(board, [6, 4], [4, 4]);
      expect(result.valid).toBe(false);
    });

    test('兵不能吃己方棋子', () => {
      const board = createBoard({ 
        '6,4': P(RED),
        '5,4': R(RED)
      });
      const result = validator.validateMove(board, [6, 4], [5, 4]);
      expect(result.valid).toBe(false);
    });
  });

  describe('炮 (Cannon) 移动规则', () => {
    test('炮可以水平移动', () => {
      const board = createBoard({ '2,1': C(RED) });
      const result = validator.validateMove(board, [2, 1], [2, 7]);
      expect(result.valid).toBe(true);
    });

    test('炮可以垂直移动', () => {
      const board = createBoard({ '0,4': C(BLACK) });
      const result = validator.validateMove(board, [0, 4], [9, 4]);
      expect(result.valid).toBe(true);
    });

    test('炮不能斜向移动', () => {
      const board = createBoard({ '2,1': C(RED) });
      const result = validator.validateMove(board, [2, 1], [4, 3]);
      expect(result.valid).toBe(false);
    });

    test('炮不吃子时不能跳过棋子', () => {
      const board = createBoard({ 
        '2,1': C(RED),
        '2,4': P(BLACK)
      });
      const result = validator.validateMove(board, [2, 1], [2, 7]);
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('阻挡');
    });

    test('炮吃子时需要隔一个棋子(隔山打牛)', () => {
      const board = createBoard({ 
        '2,1': C(RED),
        '2,4': P(BLACK), // 炮架
        '2,7': P(BLACK)  // 目标
      });
      const result = validator.validateMove(board, [2, 1], [2, 7]);
      expect(result.valid).toBe(true);
    });

    test('炮吃子时不能隔多个棋子', () => {
      const board = createBoard({ 
        '2,1': C(RED),
        '2,3': P(BLACK),
        '2,5': P(BLACK),
        '2,7': P(BLACK)
      });
      const result = validator.validateMove(board, [2, 1], [2, 7]);
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('炮架');
    });

    test('炮吃子时不能没有炮架', () => {
      const board = createBoard({ 
        '2,1': C(RED),
        '2,7': P(BLACK)
      });
      const result = validator.validateMove(board, [2, 1], [2, 7]);
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('炮架');
    });

    test('炮不能吃己方棋子', () => {
      const board = createBoard({ 
        '2,1': C(RED),
        '2,4': P(RED),
        '2,7': P(RED)
      });
      const result = validator.validateMove(board, [2, 1], [2, 7]);
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('己方');
    });
  });

  describe('通用规则', () => {
    test('起始位置没有棋子时应返回错误', () => {
      const board = createBoard({});
      const result = validator.validateMove(board, [0, 0], [1, 1]);
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('棋子');
    });

    test('移动超出棋盘应返回错误', () => {
      const board = createBoard({ '0,0': R(BLACK) });
      const result = validator.validateMove(board, [0, 0], [0, 9]);
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('棋盘');
    });

    test('移动到相同位置应返回错误', () => {
      const board = createBoard({ '0,0': R(BLACK) });
      const result = validator.validateMove(board, [0, 0], [0, 0]);
      expect(result.valid).toBe(false);
    });
  });
});
