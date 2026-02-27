/**
 * 象棋规则验证器
 * 主入口，协调各棋子规则验证
 */

const {
  Rules,
  RookRules,
  KnightRules,
  ElephantRules,
  AdvisorRules,
  KingRules,
  PawnRules,
  CannonRules
} = require('./piece-rules');

/**
 * 象棋规则验证器类
 */
class XiangqiValidator {
  constructor() {
    // 棋盘尺寸常量
    this.ROWS = 10;
    this.COLS = 9;
    
    // 棋子类型到规则验证器的映射
    this.ruleValidators = {
      'R': RookRules,
      'N': KnightRules,
      'B': ElephantRules,
      'A': AdvisorRules,
      'K': KingRules,
      'P': PawnRules,
      'C': CannonRules
    };
  }

  /**
   * 验证移动是否合法
   * @param {Array} board - 10x9 棋盘数组
   * @param {Array} from - 起始位置 [row, col]
   * @param {Array} to - 目标位置 [row, col]
   * @returns {Object} { valid: boolean, reason: string }
   */
  validateMove(board, from, to) {
    const [fromRow, fromCol] = from;
    const [toRow, toCol] = to;

    // 基础边界检查
    if (!Rules.isInBounds(fromRow, fromCol, this.ROWS, this.COLS) ||
        !Rules.isInBounds(toRow, toCol, this.ROWS, this.COLS)) {
      return { valid: false, reason: '超出棋盘范围' };
    }

    // 不能移动到相同位置
    if (fromRow === toRow && fromCol === toCol) {
      return { valid: false, reason: '不能移动到相同位置' };
    }

    // 起始位置必须有棋子
    const piece = board[fromRow][fromCol];
    if (!piece) {
      return { valid: false, reason: '起始位置没有棋子' };
    }

    // 不能吃己方棋子
    const targetPiece = board[toRow][toCol];
    if (targetPiece && targetPiece.color === piece.color) {
      return { valid: false, reason: '不能吃己方棋子' };
    }

    // 获取对应的规则验证器
    const ruleValidator = this.ruleValidators[piece.type];
    if (!ruleValidator) {
      return { valid: false, reason: '未知棋子类型' };
    }

    // 调用具体棋子规则验证
    return ruleValidator.validate(board, from, to, piece, this);
  }
}

module.exports = { XiangqiValidator };
