/**
 * 中文象棋着法解析器
 * 将中文记谱法转换为棋盘坐标
 */

const MoveParser = (function() {
    // 中文数字到阿拉伯数字的映射
    const chineseToNum = {
        '一': 1, '二': 2, '三': 3, '四': 4, '五': 5,
        '六': 6, '七': 7, '八': 8, '九': 9,
        '1': 1, '2': 2, '3': 3, '4': 4, '5': 5,
        '6': 6, '7': 7, '8': 8, '9': 9
    };

    // 数字到中文的映射（用于显示）
    const numToChinese = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九'];

    // 棋子名称统一映射
    const pieceMap = {
        '将': 'king', '將': 'king', '帥': 'king', '帅': 'king',
        '士': 'advisor', '仕': 'advisor',
        '象': 'elephant', '相': 'elephant',
        '马': 'horse', '馬': 'horse', '傌': 'horse',
        '车': 'rook', '車': 'rook', '俥': 'rook',
        '炮': 'cannon', '砲': 'cannon',
        '兵': 'pawn', '卒': 'pawn'
    };

    // 棋子英文到中文的映射
    const pieceToChinese = {
        'king': { red: '帥', black: '將' },
        'advisor': { red: '仕', black: '士' },
        'elephant': { red: '相', black: '象' },
        'horse': { red: '傌', black: '馬' },
        'rook': { red: '俥', black: '車' },
        'cannon': { red: '炮', black: '砲' },
        'pawn': { red: '兵', black: '卒' }
    };

    /**
     * 解析单步着法
     * @param {string} notation - 着法字符串，如 "炮二平五"
     * @param {number} moveIndex - 着法索引（用于判断红方/黑方）
     * @returns {Object} 解析结果
     */
    function parseMove(notation, moveIndex = 0) {
        if (!notation || typeof notation !== 'string') {
            return null;
        }

        notation = notation.trim();

        // 判断红方还是黑方
        const isRed = moveIndex % 2 === 0;

        // 匹配模式：支持两种格式
        // 格式1: [棋子][原始列][动作][目标] - 如 "車一平二"
        // 格式2: [前/后][棋子][动作][步数] - 如 "前车进一" (无前导列号)
        const pattern1 = /^([将帅車车馬马炮相象仕士兵卒])([一二三四五六七八九123456789])([平进退])([一二三四五六七八九123456789])$/;
        const pattern2 = /^([前后])([将帅車车馬马炮相象仕士兵卒])([平进退])([一二三四五六七八九123456789])$/;
        
        let match = notation.match(pattern1);
        let prefix = null;
        
        if (!match) {
            // 尝试格式2（前/后前缀）
            match = notation.match(pattern2);
            if (match) {
                prefix = match[1];
                // pattern2: [full, prefix, piece, action, target]
                // 需要转换为: piece, fromCol(null), action, target
                match = [match[0], match[2], null, match[3], match[4]];
            }
        }

        if (!match) {
            // 特殊处理结果
            if (notation.includes('胜') || notation.includes('和') || notation.includes('优')) {
                return { type: 'result', notation, isRed };
            }
            console.warn('无法解析着法:', notation);
            return null;
        }

        const [, pieceChar, fromColChar, action, targetChar] = match;
        const piece = pieceMap[pieceChar];
        
        // 计算起始列（0-8索引）
        // 如果有前/后前缀，需要根据棋盘状态确定具体列
        let fromCol;
        if (fromColChar) {
            // 有明确列号
            const colNum = chineseToNum[fromColChar];
            fromCol = isRed ? (9 - colNum) : (colNum - 1);
        } else if (prefix) {
            // 前/后前缀，先标记为null，在findCoordinates中根据棋盘确定
            fromCol = null;
        } else {
            console.warn('无法确定起始列:', notation);
            return null;
        }

        const targetNum = chineseToNum[targetChar];

        return {
            type: 'move',
            piece,
            pieceChar,
            fromCol,
            action, // '平', '进', '退'
            target: targetNum,
            targetChar,
            isRed,
            prefix, // '前', '后', 或 undefined
            notation
        };
    }

    /**
     * 根据当前棋盘状态，找到着法对应的起始和目标坐标
     * @param {Object} parsedMove - 解析后的着法
     * @param {Array} board - 当前棋盘状态
     * @returns {Object} {fromX, fromY, toX, toY, captured}
     */
    function findCoordinates(parsedMove, board) {
        if (!parsedMove || parsedMove.type !== 'move') return null;

        const { piece, fromCol, action, target, isRed, prefix } = parsedMove;
        const color = isRed ? 'red' : 'black';

        // 查找所有符合条件的棋子
        let candidates = [];
        for (let y = 0; y < 10; y++) {
            for (let x = 0; x < 9; x++) {
                const p = board[y][x];
                if (p && pieceMap[p.type] === piece && p.color === color) {
                    // 如果有明确的fromCol，只匹配该列
                    // 如果是前/后前缀（fromCol为null），收集所有该类型的棋子
                    if (fromCol === null || x === fromCol) {
                        candidates.push({ x, y, piece: p });
                    }
                }
            }
        }

        if (candidates.length === 0) {
            console.warn('未找到符合条件的棋子:', parsedMove);
            return null;
        }

        // 处理前/后前缀：当有多个候选时，根据y坐标选择
        if (prefix && candidates.length >= 1) {
            // 按y坐标排序
            candidates.sort((a, b) => a.y - b.y);
            
            if (prefix === '前') {
                // 红方：y小的是前（靠近对方）
                // 黑方：y大的是前（靠近对方）
                candidates = isRed ? [candidates[0]] : [candidates[candidates.length - 1]];
            } else if (prefix === '后') {
                // 红方：y大的是后
                // 黑方：y小的是后
                candidates = isRed ? [candidates[candidates.length - 1]] : [candidates[0]];
            }
        }

        // 计算目标列的x坐标
        let targetColX;
        if (action === '平') {
            // 平：目标直接是列号
            targetColX = isRed ? (9 - target) : (target - 1);
        } else {
            // 进/退：目标可能是步数或列号
            targetColX = null;
        }

        // 根据动作确定具体棋子
        for (const candidate of candidates) {
            const { x, y } = candidate;
            let toX = x, toY = y;
            let valid = false;

            if (action === '平') {
                // 平：横向移动，行不变
                toY = y;
                toX = targetColX;
                valid = isValidTarget(board, x, y, toX, toY, color);
            } else if (action === '进') {
                // 进：向对方方向前进
                if (isRed) {
                    // 红方向上（y减小）
                    if (piece === 'pawn' || piece === 'king') {
                        toY = y - target;
                        toX = x;
                    } else if (piece === 'advisor') {
                        // 士斜走一格：目标列号是目标位置的列
                        toX = isRed ? (9 - target) : (target - 1);
                        toY = y - 1; // 士只能向前走一格
                    } else if (piece === 'elephant') {
                        toY = y - 2;
                        toX = x + (target === 3 ? -2 : 2);
                    } else if (piece === 'horse') {
                        // 马走日：目标列号是目标位置的列
                        toX = isRed ? (9 - target) : (target - 1);
                        const dx = toX - x;
                        const absDx = Math.abs(dx);
                        if (absDx === 1) {
                            toY = y - 2; // 纵向走2格
                        } else if (absDx === 2) {
                            toY = y - 1; // 纵向走1格
                        }
                    } else if (piece === 'rook' || piece === 'cannon') {
                        toY = y - target;
                        toX = x;
                    }
                } else {
                    // 黑方向下（y增加）
                    if (piece === 'pawn' || piece === 'king') {
                        toY = y + target;
                        toX = x;
                    } else if (piece === 'advisor') {
                        // 士斜走一格：目标列号是目标位置的列
                        toX = target - 1;
                        toY = y + 1; // 士只能向前走一格
                    } else if (piece === 'elephant') {
                        toY = y + 2;
                        toX = x + (target === 3 ? -2 : 2);
                    } else if (piece === 'horse') {
                        toX = target - 1;
                        const dx = toX - x;
                        const absDx = Math.abs(dx);
                        if (absDx === 1) {
                            toY = y + 2;
                        } else if (absDx === 2) {
                            toY = y + 1;
                        }
                    } else if (piece === 'rook' || piece === 'cannon') {
                        toY = y + target;
                        toX = x;
                    }
                }
                valid = isValidTarget(board, x, y, toX, toY, color);
            } else if (action === '退') {
                // 退：向己方方向后退
                if (isRed) {
                    if (piece === 'king') {
                        toY = y + target;
                        toX = x;
                    } else if (piece === 'advisor') {
                        // 士斜走一格向后
                        toX = isRed ? (9 - target) : (target - 1);
                        toY = y + 1; // 士只能向后走一格
                    } else if (piece === 'horse') {
                        toX = isRed ? (9 - target) : (target - 1);
                        const dx = toX - x;
                        const absDx = Math.abs(dx);
                        if (absDx === 1) {
                            toY = y + 2;
                        } else if (absDx === 2) {
                            toY = y + 1;
                        }
                    } else if (piece === 'rook' || piece === 'cannon') {
                        toY = y + target;
                        toX = x;
                    }
                } else {
                    if (piece === 'king') {
                        toY = y - target;
                        toX = x;
                    } else if (piece === 'advisor') {
                        // 士斜走一格向后
                        toX = target - 1;
                        toY = y - 1; // 士只能向后走一格
                    } else if (piece === 'horse') {
                        toX = target - 1;
                        const dx = toX - x;
                        const absDx = Math.abs(dx);
                        if (absDx === 1) {
                            toY = y - 2;
                        } else if (absDx === 2) {
                            toY = y - 1;
                        }
                    } else if (piece === 'rook' || piece === 'cannon') {
                        toY = y - target;
                        toX = x;
                    }
                }
                valid = isValidTarget(board, x, y, toX, toY, color);
            }

            if (valid && toX >= 0 && toX < 9 && toY >= 0 && toY < 10) {
                const captured = board[toY][toX];
                return {
                    fromX: x,
                    fromY: y,
                    toX,
                    toY,
                    captured: captured ? { ...captured } : null,
                    piece: candidate.piece
                };
            }
        }

        console.warn('无法确定有效坐标:', parsedMove, '候选:', candidates);
        return null;
    }

    /**
     * 检查目标位置是否有效
     */
    function isValidTarget(board, fromX, fromY, toX, toY, color) {
        if (toX < 0 || toX >= 9 || toY < 0 || toY >= 10) return false;
        
        const targetPiece = board[toY][toX];
        if (targetPiece && targetPiece.color === color) return false;
        
        const piece = board[fromY][fromX];
        if (!piece) return false;

        const unifiedType = getUnifiedPieceType(piece.type);
        const dx = toX - fromX;
        const dy = toY - fromY;
        const absDx = Math.abs(dx);
        const absDy = Math.abs(dy);

        switch (unifiedType) {
            case 'R': // 車
                if (fromX !== toX && fromY !== toY) return false;
                return countPiecesBetween(board, fromX, fromY, toX, toY) === 0;
            
            case 'N': // 馬
                if (!((absDx === 2 && absDy === 1) || (absDx === 1 && absDy === 2))) return false;
                if (absDx === 2) {
                    const blockX = fromX + (dx > 0 ? 1 : -1);
                    return !board[fromY][blockX];
                } else {
                    const blockY = fromY + (dy > 0 ? 1 : -1);
                    return !board[blockY][fromX];
                }
            
            case 'C': // 炮
                if (fromX !== toX && fromY !== toY) return false;
                const piecesBetween = countPiecesBetween(board, fromX, fromY, toX, toY);
                if (targetPiece) {
                    return piecesBetween === 1;
                } else {
                    return piecesBetween === 0;
                }
            
            case 'K': // 将/帅
                if (absDx + absDy !== 1) return false;
                return isInPalace(toX, toY, color);
            
            case 'A': // 士/仕
                if (absDx !== 1 || absDy !== 1) return false;
                return isInPalace(toX, toY, color);
            
            case 'B': // 象/相
                if (absDx !== 2 || absDy !== 2) return false;
                if (color === 'red' && toY < 5) return false;
                if (color === 'black' && toY >= 5) return false;
                const eyeX = (fromX + toX) / 2;
                const eyeY = (fromY + toY) / 2;
                return !board[eyeY][eyeX];
            
            case 'P': // 兵/卒
                if (absDx + absDy !== 1) return false;
                const crossed = color === 'red' ? fromY < 5 : fromY >= 5;
                const forwardDir = color === 'red' ? -1 : 1;
                if (!crossed) {
                    return dy === forwardDir && dx === 0;
                } else {
                    return dy !== -forwardDir;
                }
            
            default:
                return true;
        }
    }

    function getUnifiedPieceType(type) {
        const map = {
            '將': 'K', '帥': 'K', '士': 'A', '仕': 'A', '象': 'B', '相': 'B',
            '車': 'R', '俥': 'R', '馬': 'N', '傌': 'N', '砲': 'C', '炮': 'C',
            '卒': 'P', '兵': 'P'
        };
        return map[type];
    }

    function countPiecesBetween(board, fromX, fromY, toX, toY) {
        let count = 0;
        if (fromX === toX) {
            const minY = Math.min(fromY, toY);
            const maxY = Math.max(fromY, toY);
            for (let y = minY + 1; y < maxY; y++) {
                if (board[y][fromX]) count++;
            }
        } else if (fromY === toY) {
            const minX = Math.min(fromX, toX);
            const maxX = Math.max(fromX, toX);
            for (let x = minX + 1; x < maxX; x++) {
                if (board[fromY][x]) count++;
            }
        }
        return count;
    }

    function isInPalace(x, y, color) {
        if (x < 3 || x > 5) return false;
        if (color === 'red') {
            return y >= 7 && y <= 9;
        } else {
            return y >= 0 && y <= 2;
        }
    }

    /**
     * 将坐标转换为中文记谱法
     */
    function toNotation(move) {
        const { fromX, fromY, toX, toY, piece } = move;
        const color = piece.color;
        const isRed = color === 'red';
        
        const pieceChar = pieceToChinese[pieceMap[piece.type]].red;
        
        const fromColNum = isRed ? (9 - fromX) : (fromX + 1);
        const fromCol = numToChinese[fromColNum];
        
        const dy = toY - fromY;
        let action, target;
        
        if (toX === fromX) {
            const steps = Math.abs(dy);
            action = (isRed && dy < 0) || (!isRed && dy > 0) ? '进' : '退';
            target = numToChinese[steps];
        } else if (toY === fromY) {
            action = '平';
            const toColNum = isRed ? (9 - toX) : (toX + 1);
            target = numToChinese[toColNum];
        } else {
            const toColNum = isRed ? (9 - toX) : (toX + 1);
            action = (isRed && dy < 0) || (!isRed && dy > 0) ? '进' : '退';
            target = numToChinese[toColNum];
        }
        
        return `${pieceChar}${fromCol}${action}${target}`;
    }

    /**
     * 解析整局棋谱
     */
    function parseGame(moves) {
        return moves.map((notation, index) => {
            const parsed = parseMove(notation, index);
            return { ...parsed, index };
        });
    }

    // 公开API
    return {
        parseMove,
        findCoordinates,
        parseGame,
        toNotation,
        pieceMap,
        pieceToChinese,
        chineseToNum,
        numToChinese
    };
})();

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MoveParser;
}
