/**
 * AI胜率解释功能模块
 * 根据局面特征生成人类可读的AI解释
 */

// ============================================
// 局面特征分析函数
// ============================================

/**
 * 计算控制中心点数量
 * 中心点定义为：(4,4), (4,5), (3,4), (3,5) - 九宫中心及河界附近
 */
function analyzeCenterControl(board, side) {
    const centerPoints = [
        {row: 4, col: 4}, {row: 4, col: 5},
        {row: 3, col: 4}, {row: 3, col: 5},
        {row: 4, col: 3}, {row: 3, col: 3}
    ];
    
    let controlled = 0;
    let attacking = 0;
    
    // 检查每个中心点是否被side方控制或攻击
    for (const point of centerPoints) {
        const piece = board[point.row][point.col];
        if (piece && piece.color === side) {
            controlled++;
        }
        
        // 检查是否可以攻击到此点
        if (canAttackPoint(board, side, point.row, point.col)) {
            attacking++;
        }
    }
    
    return { controlled, attacking, total: centerPoints.length };
}

/**
 * 检查某方是否可以攻击到某个点
 */
function canAttackPoint(board, side, targetRow, targetCol) {
    // 遍历所有己方棋子，看是否有棋子可以移动到目标点
    for (let row = 0; row < 10; row++) {
        for (let col = 0; col < 9; col++) {
            const piece = board[row][col];
            if (piece && piece.color === side) {
                // 简化的攻击检测 - 检查是否为相邻或常见攻击模式
                const dist = Math.abs(row - targetRow) + Math.abs(col - targetCol);
                if (dist <= 2) {
                    return true;
                }
            }
        }
    }
    return false;
}

/**
 * 分析威胁对方大子（车、马、炮）
 */
function analyzeThreats(board, side) {
    const threats = [];
    const enemySide = side === 'red' ? 'black' : 'red';
    const majorPieces = ['車', '俥', '馬', '傌', '炮', '砲'];
    
    for (let row = 0; row < 10; row++) {
        for (let col = 0; col < 9; col++) {
            const piece = board[row][col];
            if (piece && piece.color === enemySide && majorPieces.includes(piece.type)) {
                // 检查这个棋子是否被威胁
                if (isThreatened(board, row, col, side)) {
                    threats.push({
                        type: piece.type,
                        row, col,
                        value: getPieceValue(piece.type)
                    });
                }
            }
        }
    }
    
    return threats;
}

/**
 * 检查某位置的棋子是否被威胁
 */
function isThreatened(board, row, col, bySide) {
    // 简化的威胁检测
    // 检查周围是否有对方棋子
    for (let r = Math.max(0, row - 2); r <= Math.min(9, row + 2); r++) {
        for (let c = Math.max(0, col - 2); c <= Math.min(8, col + 2); c++) {
            const piece = board[r][c];
            if (piece && piece.color === bySide) {
                // 简单距离判断
                const dist = Math.abs(r - row) + Math.abs(c - col);
                if (dist <= 3) {
                    return true;
                }
            }
        }
    }
    return false;
}

/**
 * 分析保护弱子
 */
function analyzeProtection(board, side) {
    const protections = [];
    const weakPieces = ['兵', '卒', '仕', '士', '相', '象'];
    
    for (let row = 0; row < 10; row++) {
        for (let col = 0; col < 9; col++) {
            const piece = board[row][col];
            if (piece && piece.color === side && weakPieces.includes(piece.type)) {
                // 检查是否被威胁
                if (isThreatened(board, row, col, side === 'red' ? 'black' : 'red')) {
                    // 检查是否有保护
                    if (hasProtection(board, row, col, side)) {
                        protections.push({
                            type: piece.type,
                            row, col,
                            reason: '保护弱子'
                        });
                    }
                }
            }
        }
    }
    
    return protections;
}

/**
 * 检查某位置是否有保护
 */
function hasProtection(board, row, col, side) {
    // 检查是否有己方大子在附近
    const majorPieces = ['車', '俥', '馬', '傌', '炮', '砲'];
    for (let r = Math.max(0, row - 2); r <= Math.min(9, row + 2); r++) {
        for (let c = Math.max(0, col - 2); c <= Math.min(8, col + 2); c++) {
            const piece = board[r][c];
            if (piece && piece.color === side && majorPieces.includes(piece.type)) {
                return true;
            }
        }
    }
    return false;
}

/**
 * 分析进攻线路
 */
function analyzeAttackLines(board, side) {
    const lines = [];
    const enemyPalaceRow = side === 'red' ? 0 : 9; // 对方九宫位置
    
    // 检查是否有子力指向对方九宫
    for (let col = 3; col <= 5; col++) {
        let piecesInLine = 0;
        for (let row = 0; row < 10; row++) {
            const piece = board[row][col];
            if (piece && piece.color === side) {
                piecesInLine++;
            }
        }
        if (piecesInLine >= 2) {
            lines.push({ col, count: piecesInLine });
        }
    }
    
    return lines;
}

/**
 * 获取棋子价值
 */
function getPieceValue(pieceType) {
    const values = {
        '車': 90, '俥': 90,
        '馬': 40, '傌': 40,
        '炮': 45, '砲': 45,
        '象': 20, '相': 20,
        '士': 20, '仕': 20,
        '將': 1000, '帥': 1000,
        '卒': 10, '兵': 10
    };
    return values[pieceType] || 0;
}

/**
 * 计算子力优势
 */
function calculateMaterialAdvantage(board, side) {
    let sideValue = 0;
    let enemyValue = 0;
    const enemySide = side === 'red' ? 'black' : 'red';
    
    for (let row = 0; row < 10; row++) {
        for (let col = 0; col < 9; col++) {
            const piece = board[row][col];
            if (piece) {
                const value = getPieceValue(piece.type);
                if (piece.color === side) {
                    sideValue += value;
                } else {
                    enemyValue += value;
                }
            }
        }
    }
    
    return sideValue - enemyValue;
}

/**
 * 分析棋子活动性
 */
function analyzeMobility(board, side) {
    let mobilePieces = 0;
    let totalPieces = 0;
    
    for (let row = 0; row < 10; row++) {
        for (let col = 0; col < 9; col++) {
            const piece = board[row][col];
            if (piece && piece.color === side) {
                totalPieces++;
                // 简化判断：检查棋子是否被阻挡
                if (!isPieceBlocked(board, row, col)) {
                    mobilePieces++;
                }
            }
        }
    }
    
    return { mobile: mobilePieces, total: totalPieces };
}

/**
 * 检查棋子是否被阻塞
 */
function isPieceBlocked(board, row, col) {
    const piece = board[row][col];
    if (!piece) return true;
    
    // 简化检查：看周围是否有空位
    const directions = [[-1,0], [1,0], [0,-1], [0,1]];
    for (const [dr, dc] of directions) {
        const nr = row + dr;
        const nc = col + dc;
        if (nr >= 0 && nr < 10 && nc >= 0 && nc < 9) {
            if (!board[nr][nc]) {
                return false; // 至少有一个方向可以移动
            }
        }
    }
    return true;
}

// ============================================
// 主函数：生成AI解释
// ============================================

/**
 * 根据局面特征生成AI解释
 * @param {Array} board - 棋盘数组
 * @param {string} side - 'red' 或 'black'
 * @param {number} winrateChange - 胜率变化百分比
 * @param {string} bestMove - 最佳着法
 * @returns {Object} 包含解释文本和胜率变化的对象
 */
function generateExplanation(board, side, winrateChange = 0, bestMove = '') {
    const explanations = [];
    const winrateImpacts = [];
    
    // 1. 分析控制中心
    const centerControl = analyzeCenterControl(board, side);
    if (centerControl.controlled >= 2) {
        explanations.push('控制中心要点，占据主动位置');
        winrateImpacts.push({ reason: '控制中心', impact: 5 });
    }
    
    // 2. 分析威胁对方大子
    const threats = analyzeThreats(board, side);
    if (threats.length > 0) {
        const topThreat = threats.sort((a, b) => b.value - a.value)[0];
        const pieceName = side === 'red' ? 
            topThreat.type.replace('車', '俥').replace('馬', '傌').replace('砲', '炮') :
            topThreat.type.replace('俥', '車').replace('傌', '馬').replace('炮', '砲');
        explanations.push(`威胁对方${pieceName}，形成战术压力`);
        winrateImpacts.push({ reason: `威胁对方${pieceName}`, impact: 4 + Math.min(threats.length, 2) });
    }
    
    // 3. 分析保护弱子
    const protections = analyzeProtection(board, side);
    if (protections.length > 0) {
        const weakPiece = protections[0];
        explanations.push(`保护${weakPiece.type}，巩固防线`);
        winrateImpacts.push({ reason: `保护${weakPiece.type}`, impact: 3 });
    }
    
    // 4. 分析进攻线路
    const attackLines = analyzeAttackLines(board, side);
    if (attackLines.length > 0) {
        explanations.push('打开进攻线路，准备发起攻势');
        winrateImpacts.push({ reason: '打开线路', impact: 4 });
    }
    
    // 5. 分析子力优势
    const materialAdv = calculateMaterialAdvantage(board, side);
    if (materialAdv > 30) {
        explanations.push('子力优势明显，保持压制态势');
        winrateImpacts.push({ reason: '子力优势', impact: 6 });
    } else if (materialAdv < -30) {
        explanations.push('子力处于劣势，需要寻找反击机会');
        winrateImpacts.push({ reason: '挽回劣势', impact: 4 });
    }
    
    // 6. 分析活动性
    const mobility = analyzeMobility(board, side);
    const mobilityRate = mobility.total > 0 ? mobility.mobile / mobility.total : 0;
    if (mobilityRate > 0.7) {
        explanations.push('棋子活动性良好，阵型灵活');
        winrateImpacts.push({ reason: '活动性优势', impact: 3 });
    }
    
    // 如果没有特别的解释，提供默认解释
    if (explanations.length === 0) {
        if (winrateChange > 0) {
            explanations.push('局势稳步发展，保持良好态势');
            winrateImpacts.push({ reason: '稳定发展', impact: 2 });
        } else if (winrateChange < 0) {
            explanations.push('需要谨慎应对，防止局势恶化');
            winrateImpacts.push({ reason: '谨慎应对', impact: 2 });
        } else {
            explanations.push('局面均衡，寻找突破口');
            winrateImpacts.push({ reason: '均衡局面', impact: 1 });
        }
    }
    
    // 生成格式化的解释文本
    const totalImpact = winrateImpacts.reduce((sum, item) => sum + item.impact, 0);
    const mainExplanation = explanations[0];
    const secondaryExplanation = explanations.length > 1 ? explanations[1] : null;
    
    // 构建详细解释HTML
    let detailedHTML = `<div style="margin-bottom: 8px;"><strong>${mainExplanation}</strong></div>`;
    
    if (secondaryExplanation) {
        detailedHTML += `<div style="font-size: 12px; opacity: 0.9; margin-bottom: 8px;">${secondaryExplanation}</div>`;
    }
    
    // 添加胜率变化详情
    if (winrateImpacts.length > 0) {
        detailedHTML += '<div style="font-size: 11px; opacity: 0.85; margin-top: 8px; border-top: 1px solid rgba(255,255,255,0.2); padding-top: 8px;">';
        detailedHTML += '<div style="margin-bottom: 4px;">📊 胜率变化分析：</div>';
        winrateImpacts.slice(0, 3).forEach(item => {
            const sign = item.impact > 0 ? '+' : '';
            detailedHTML += `<div style="margin-left: 8px;">• ${item.reason}: ${sign}${item.impact}%</div>`;
        });
        detailedHTML += `<div style="margin-left: 8px; margin-top: 4px; font-weight: bold;">总计: ${winrateChange >= 0 ? '+' : ''}${winrateChange.toFixed(1)}%</div>`;
        detailedHTML += '</div>';
    }
    
    return {
        mainExplanation,
        secondaryExplanation,
        detailedHTML,
        winrateImpacts,
        totalImpact
    };
}

/**
 * 生成对比分析（比较当前着法与次优着法）
 */
function generateComparisonAnalysis(board, side, bestMove, secondBestMove, winrateDiff) {
    if (!secondBestMove || winrateDiff < 2) {
        return '这是当前局面的最佳着法';
    }
    
    if (winrateDiff < 5) {
        return `比次优着法好约${winrateDiff.toFixed(1)}%，建议采用`;
    } else if (winrateDiff < 10) {
        return `明显优于其他选择（领先${winrateDiff.toFixed(1)}%），强烈推荐`;
    } else {
        return `这是决定性的一手！领先次优着法${winrateDiff.toFixed(1)}%`;
    }
}

// 导出函数
export {
    generateExplanation,
    generateComparisonAnalysis,
    analyzeCenterControl,
    analyzeThreats,
    analyzeProtection,
    calculateMaterialAdvantage
};

// 默认导出
export default generateExplanation;
