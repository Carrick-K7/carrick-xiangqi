/**
 * 象棋棋子规则定义
 * 每种棋子的移动规则逻辑
 */

/**
 * 基础规则辅助函数
 */
const Rules = {
  /**
   * 检查位置是否在棋盘内
   */
  isInBounds(row, col, rows = 10, cols = 9) {
    return row >= 0 && row < rows && col >= 0 && col < cols;
  },

  /**
   * 计算两点之间的棋子数量
   */
  countPiecesBetween(board, from, to) {
    const [fromRow, fromCol] = from;
    const [toRow, toCol] = to;
    let count = 0;

    if (fromRow === toRow) {
      // 水平方向
      const minCol = Math.min(fromCol, toCol);
      const maxCol = Math.max(fromCol, toCol);
      for (let col = minCol + 1; col < maxCol; col++) {
        if (board[fromRow][col]) count++;
      }
    } else if (fromCol === toCol) {
      // 垂直方向
      const minRow = Math.min(fromRow, toRow);
      const maxRow = Math.max(fromRow, toRow);
      for (let row = minRow + 1; row < maxRow; row++) {
        if (board[row][fromCol]) count++;
      }
    }

    return count;
  },

  /**
   * 检查是否在九宫内
   * 红方在棋盘下方，九宫行范围：7-9
   * 黑方在棋盘上方，九宫行范围：0-2
   */
  isInPalace(row, col, color) {
    // 九宫列范围：3-5
    if (col < 3 || col > 5) return false;

    // 红方九宫行范围：7-9（底部）
    // 黑方九宫行范围：0-2（顶部）
    return color === 'red' ? (row >= 7 && row <= 9) : (row >= 0 && row <= 2);
  },

  /**
   * 是否过河
   */
  hasCrossedRiver(row, color, riverRed = 4, riverBlack = 5) {
    return color === 'red' ? row > riverRed : row < riverBlack;
  }
};

/**
 * 車 (Rook) 移动规则
 */
const RookRules = {
  validate(board, from, to, piece) {
    const [fromRow, fromCol] = from;
    const [toRow, toCol] = to;

    // 只能直线移动
    if (fromRow !== toRow && fromCol !== toCol) {
      return { valid: false, reason: '車只能直线移动' };
    }

    // 检查是否有阻挡
    const piecesBetween = Rules.countPiecesBetween(board, from, to);
    if (piecesBetween > 0) {
      return { valid: false, reason: '路径上有棋子阻挡' };
    }

    return { valid: true };
  }
};

/**
 * 馬 (Horse/Knight) 移动规则
 */
const KnightRules = {
  // 绊马腿位置偏移映射
  // key: "rowDiff,colDiff" -> value: [blockingRowOffset, blockingColOffset]
  blockingOffsets: {
    '2,1': [1, 0],   // 下2右1 -> 下方绊脚
    '2,-1': [1, 0],  // 下2左1 -> 下方绊脚
    '-2,1': [-1, 0], // 上2右1 -> 上方绊脚
    '-2,-1': [-1, 0],// 上2左1 -> 上方绊脚
    '1,2': [0, 1],   // 上1右2 -> 右方绊脚
    '1,-2': [0, -1], // 上1左2 -> 左方绊脚
    '-1,2': [0, 1],  // 下1右2 -> 右方绊脚
    '-1,-2': [0, -1] // 下1左2 -> 左方绊脚
  },

  validate(board, from, to, piece) {
    const [fromRow, fromCol] = from;
    const [toRow, toCol] = to;

    const rowDiff = toRow - fromRow;
    const colDiff = toCol - fromCol;
    const absRowDiff = Math.abs(rowDiff);
    const absColDiff = Math.abs(colDiff);

    // 必须是日字（2+1）
    if (!((absRowDiff === 2 && absColDiff === 1) || (absRowDiff === 1 && absColDiff === 2))) {
      return { valid: false, reason: '馬必须按日字移动' };
    }

    // 检查绊马腿
    const key = `${rowDiff},${colDiff}`;
    const offset = this.blockingOffsets[key];
    if (offset) {
      const [rowOffset, colOffset] = offset;
      const blockingRow = fromRow + rowOffset;
      const blockingCol = fromCol + colOffset;
      if (board[blockingRow][blockingCol]) {
        return { valid: false, reason: '馬被绊脚（蹩马腿）' };
      }
    }

    return { valid: true };
  }
};

/**
 * 相 (Elephant) 移动规则
 */
const ElephantRules = {
  validate(board, from, to, piece) {
    const [fromRow, fromCol] = from;
    const [toRow, toCol] = to;

    const rowDiff = Math.abs(toRow - fromRow);
    const colDiff = Math.abs(toCol - fromCol);

    // 必须是田字（2+2）
    if (rowDiff !== 2 || colDiff !== 2) {
      return { valid: false, reason: '相必须按田字移动' };
    }

    // 不能过河
    // 红方在下方（row 5-9），不能走到 row <= 4（黑方区域）
    // 黑方在上方（row 0-4），不能走到 row >= 5（红方区域）
    if (piece.color === 'red' && toRow < 5) {
      return { valid: false, reason: '相不能过河' };
    }
    if (piece.color === 'black' && toRow >= 5) {
      return { valid: false, reason: '相不能过河' };
    }

    // 检查象眼是否被塞
    const eyeRow = fromRow + (toRow > fromRow ? 1 : -1);
    const eyeCol = fromCol + (toCol > fromCol ? 1 : -1);
    if (board[eyeRow][eyeCol]) {
      return { valid: false, reason: '象眼被塞' };
    }

    return { valid: true };
  }
};

/**
 * 仕 (Advisor) 移动规则
 */
const AdvisorRules = {
  validate(board, from, to, piece) {
    const [toRow, toCol] = to;

    // 必须在九宫内（先检查）
    if (!Rules.isInPalace(toRow, toCol, piece.color)) {
      return { valid: false, reason: '仕不能走出九宫' };
    }

    const [fromRow, fromCol] = from;
    const rowDiff = Math.abs(toRow - fromRow);
    const colDiff = Math.abs(toCol - fromCol);

    // 只能斜线移动一格
    if (rowDiff !== 1 || colDiff !== 1) {
      return { valid: false, reason: '仕只能斜线移动一格' };
    }

    return { valid: true };
  }
};

/**
 * 帥 (General/King) 移动规则
 */
const KingRules = {
  validate(board, from, to, piece, validator) {
    const [fromRow, fromCol] = from;
    const [toRow, toCol] = to;

    // 必须在九宫内
    if (!Rules.isInPalace(toRow, toCol, piece.color)) {
      return { valid: false, reason: '帥不能走出九宫' };
    }

    const rowDiff = Math.abs(toRow - fromRow);
    const colDiff = Math.abs(toCol - fromCol);

    // 只能移动一格
    if (rowDiff + colDiff !== 1) {
      return { valid: false, reason: '帥只能移动一格' };
    }

    // 检查是否会对脸（飞将）
    const enemyColor = piece.color === 'red' ? 'black' : 'red';
    let enemyKingPos = null;

    for (let r = 0; r < 10; r++) {
      for (let c = 0; c < 9; c++) {
        const p = board[r][c];
        if (p && p.type === 'K' && p.color === enemyColor) {
          enemyKingPos = [r, c];
          break;
        }
      }
      if (enemyKingPos) break;
    }

    if (enemyKingPos && enemyKingPos[1] === toCol) {
      // 在同一列，检查中间是否有棋子（不包括移动的棋子原来的位置）
      const minRow = Math.min(toRow, enemyKingPos[0]);
      const maxRow = Math.max(toRow, enemyKingPos[0]);
      let piecesBetween = 0;

      for (let r = minRow + 1; r < maxRow; r++) {
        // 跳过棋子原来的位置（因为移动后那里是空的）
        if (r === fromRow && toCol === fromCol) continue;
        if (board[r][toCol]) piecesBetween++;
      }

      if (piecesBetween === 0) {
        return { valid: false, reason: '不能和对方帥对脸（飞将）' };
      }
    }

    return { valid: true };
  }
};

/**
 * 兵 (Pawn) 移动规则
 */
const PawnRules = {
  validate(board, from, to, piece) {
    const [fromRow, fromCol] = from;
    const [toRow, toCol] = to;

    const rowDiff = toRow - fromRow;
    const colDiff = Math.abs(toCol - fromCol);

    // 只能移动一格
    if (Math.abs(rowDiff) + colDiff !== 1) {
      return { valid: false, reason: '兵只能移动一格' };
    }

    // 红方在下方，向上走（row 减小），过河是 row < 5
    // 黑方在上方，向下走（row 增大），过河是 row > 4
    if (piece.color === 'red') {
      const hasCrossedRiver = fromRow < 5;  // 红方已过河：row < 5

      if (!hasCrossedRiver) {
        // 过河前只能前进（row 减小）
        if (rowDiff !== -1) {
          if (rowDiff === 1) {
            return { valid: false, reason: '兵过河前不能后退' };
          }
          if (colDiff === 1) {
            return { valid: false, reason: '兵过河前不能横移' };
          }
          return { valid: false, reason: '兵移动方向错误' };
        }
      }
    } else {
      // 黑方
      const hasCrossedRiver = fromRow >= 5;  // 黑方已过河：row >= 5

      if (!hasCrossedRiver) {
        // 过河前只能前进（row 增大）
        if (rowDiff !== 1) {
          return { valid: false, reason: '兵过河前不能后退或横移' };
        }
      }
    }

    return { valid: true };
  }
};

/**
 * 炮 (Cannon) 移动规则
 */
const CannonRules = {
  validate(board, from, to, piece) {
    const [fromRow, fromCol] = from;
    const [toRow, toCol] = to;

    // 只能直线移动
    if (fromRow !== toRow && fromCol !== toCol) {
      return { valid: false, reason: '炮只能直线移动' };
    }

    const targetPiece = board[toRow][toCol];
    const piecesBetween = Rules.countPiecesBetween(board, from, to);

    if (targetPiece) {
      // 吃子情况：需要恰好一个炮架
      if (piecesBetween !== 1) {
        if (piecesBetween === 0) {
          return { valid: false, reason: '炮吃子需要有炮架' };
        }
        return { valid: false, reason: '炮吃子只能有一个炮架' };
      }
    } else {
      // 不吃子情况：不能有任何阻挡
      if (piecesBetween > 0) {
        return { valid: false, reason: '路径上有棋子阻挡' };
      }
    }

    return { valid: true };
  }
};

module.exports = {
  Rules,
  RookRules,
  KnightRules,
  ElephantRules,
  AdvisorRules,
  KingRules,
  PawnRules,
  CannonRules
};
