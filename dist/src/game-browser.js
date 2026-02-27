/**
 * 棋谱浏览功能模块
 * 支持加载、浏览和管理321局棋谱数据
 */

// ============================================
// 棋谱数据管理
// ============================================

class GameCollection {
    constructor() {
        this.games = [];
        this.currentGame = null;
        this.currentMoveIndex = 0;
        this.loaded = false;
    }

    /**
     * 加载所有棋谱数据
     */
    async loadAllGames() {
        try {
            // 加载烂柯神机
            const lankeParts = [
                '../../xiangqi_data/ancient/lanke_shenji_part1.json',
                '../../xiangqi_data/ancient/lanke_shenji_part2.json',
                '../../xiangqi_data/ancient/lanke_shenji_part3.json',
                '../../xiangqi_data/ancient/lanke_shenji_part4.json',
                '../../xiangqi_data/ancient/lanke_shenji_remaining.json'
            ];

            for (const url of lankeParts) {
                try {
                    const response = await fetch(url);
                    if (response.ok) {
                        const data = await response.json();
                        if (data.games) {
                            this.games.push(...data.games.map(g => ({
                                ...g,
                                collection: data.collection || '烂柯神机'
                            })));
                        }
                    }
                } catch (e) {
                    console.warn(`Failed to load ${url}:`, e);
                }
            }

            // 加载橘中秘
            try {
                const response = await fetch('../../xiangqi_data/ancient/juzhongmi.json');
                if (response.ok) {
                    const data = await response.json();
                    if (data.games) {
                        this.games.push(...data.games.map(g => ({
                            ...g,
                            collection: data.collection || '橘中秘'
                        })));
                    }
                }
            } catch (e) {
                console.warn('Failed to load juzhongmi:', e);
            }

            // 加载梅花谱
            try {
                const response = await fetch('../../xiangqi_data/ancient/meihua.json');
                if (response.ok) {
                    const data = await response.json();
                    if (data.games) {
                        this.games.push(...data.games.map(g => ({
                            ...g,
                            collection: data.collection || '梅花谱'
                        })));
                    }
                }
            } catch (e) {
                console.warn('Failed to load meihua:', e);
            }

            // 加载适情雅趣
            try {
                const response1 = await fetch('../../xiangqi_data/ancient/shiqing_yaqu_part1.json');
                if (response1.ok) {
                    const data = await response1.json();
                    if (data.games) {
                        this.games.push(...data.games.map(g => ({
                            ...g,
                            collection: data.collection || '适情雅趣'
                        })));
                    }
                }
                const response2 = await fetch('../../xiangqi_data/ancient/shiqing_yaqu_part2.json');
                if (response2.ok) {
                    const data = await response2.json();
                    if (data.games) {
                        this.games.push(...data.games.map(g => ({
                            ...g,
                            collection: data.collection || '适情雅趣'
                        })));
                    }
                }
            } catch (e) {
                console.warn('Failed to load shiqing_yaqu:', e);
            }

            // 加载现代名局
            try {
                const response = await fetch('../../xiangqi_data/modern/modern_masters.json');
                if (response.ok) {
                    const data = await response.json();
                    if (data.games) {
                        this.games.push(...data.games.map(g => ({
                            ...g,
                            collection: data.collection || '现代名局'
                        })));
                    }
                }
            } catch (e) {
                console.warn('Failed to load modern_masters:', e);
            }

            this.loaded = true;
            console.log(`✅ 棋谱加载完成，共 ${this.games.length} 局`);
            return this.games.length;

        } catch (error) {
            console.error('加载棋谱数据失败:', error);
            return 0;
        }
    }

    /**
     * 获取所有棋谱列表
     */
    getGameList() {
        return this.games.map(g => ({
            id: g.id,
            name: g.name,
            collection: g.collection,
            type: g.type,
            era: g.era,
            result: g.result,
            difficulty: g.difficulty,
            moveCount: g.moves ? g.moves.length : 0
        }));
    }

    /**
     * 按分类获取棋谱
     */
    getGamesByCollection(collection) {
        return this.games.filter(g => g.collection === collection);
    }

    /**
     * 搜索棋谱
     */
    searchGames(query) {
        const lowerQuery = query.toLowerCase();
        return this.games.filter(g => 
            g.name.toLowerCase().includes(lowerQuery) ||
            (g.opening && g.opening.toLowerCase().includes(lowerQuery))
        );
    }

    /**
     * 加载指定棋谱
     */
    loadGame(gameId) {
        const game = this.games.find(g => g.id === gameId);
        if (game) {
            this.currentGame = game;
            this.currentMoveIndex = 0;
            return game;
        }
        return null;
    }

    /**
     * 获取当前棋谱的当前着法
     */
    getCurrentMove() {
        if (!this.currentGame || !this.currentGame.moves) return null;
        return this.currentGame.moves[this.currentMoveIndex];
    }

    /**
     * 前进一着
     */
    nextMove() {
        if (!this.currentGame || !this.currentGame.moves) return null;
        if (this.currentMoveIndex < this.currentGame.moves.length - 1) {
            this.currentMoveIndex++;
            return this.getCurrentMove();
        }
        return null;
    }

    /**
     * 后退一着
     */
    prevMove() {
        if (!this.currentGame || !this.currentGame.moves) return null;
        if (this.currentMoveIndex > 0) {
            this.currentMoveIndex--;
            return this.getCurrentMove();
        }
        return null;
    }

    /**
     * 跳到指定着法
     */
    jumpToMove(index) {
        if (!this.currentGame || !this.currentGame.moves) return null;
        if (index >= 0 && index < this.currentGame.moves.length) {
            this.currentMoveIndex = index;
            return this.getCurrentMove();
        }
        return null;
    }

    /**
     * 获取当前进度
     */
    getProgress() {
        if (!this.currentGame || !this.currentGame.moves) return { current: 0, total: 0 };
        return {
            current: this.currentMoveIndex + 1,
            total: this.currentGame.moves.length,
            percentage: Math.round((this.currentMoveIndex + 1) / this.currentGame.moves.length * 100)
        };
    }

    /**
     * 获取棋谱统计信息
     */
    getStats() {
        const collections = {};
        const results = {};
        const difficulties = {};

        this.games.forEach(g => {
            // 统计分类
            collections[g.collection] = (collections[g.collection] || 0) + 1;
            // 统计结果
            if (g.result) {
                results[g.result] = (results[g.result] || 0) + 1;
            }
            // 统计难度
            if (g.difficulty) {
                difficulties[g.difficulty] = (difficulties[g.difficulty] || 0) + 1;
            }
        });

        return {
            total: this.games.length,
            collections,
            results,
            difficulties
        };
    }
}

// ============================================
// 棋谱浏览器UI
// ============================================

class GameBrowserUI {
    constructor(containerId, collection) {
        this.container = document.getElementById(containerId);
        this.collection = collection;
        this.onGameSelect = null;
        this.onMoveNavigate = null;
    }

    /**
     * 渲染棋谱列表
     */
    renderGameList(games) {
        if (!this.container) return;

        const collections = {};
        games.forEach(g => {
            if (!collections[g.collection]) {
                collections[g.collection] = [];
            }
            collections[g.collection].push(g);
        });

        let html = '<div class="game-browser">';
        html += '<div class="browser-header">';
        html += '<h3>📚 棋谱浏览</h3>';
        html += `<span class="game-count">共 ${games.length} 局</span>`;
        html += '</div>';

        for (const [collectionName, collectionGames] of Object.entries(collections)) {
            html += `<div class="collection-section">`;
            html += `<div class="collection-title">${collectionName} (${collectionGames.length}局)</div>`;
            html += `<div class="game-list">`;

            collectionGames.forEach(game => {
                const resultClass = this.getResultClass(game.result);
                const difficultyStars = this.getDifficultyStars(game.difficulty);

                html += `
                    <div class="game-item" data-game-id="${game.id}">
                        <div class="game-info">
                            <div class="game-name">${game.name}</div>
                            <div class="game-meta">
                                <span class="game-result ${resultClass}">${game.result || '未知'}</span>
                                <span class="game-difficulty">${difficultyStars}</span>
                            </div>
                        </div>
                        <button class="btn-load-game" onclick="loadGame('${game.id}')">加载</button>
                    </div>
                `;
            });

            html += '</div></div>';
        }

        html += '</div>';
        this.container.innerHTML = html;
    }

    /**
     * 渲染棋谱导航器
     */
    renderNavigator(game, currentMoveIndex, totalMoves) {
        if (!this.container) return;

        const progress = Math.round((currentMoveIndex + 1) / totalMoves * 100);

        let html = '<div class="game-navigator">';
        html += `<div class="navigator-header">`;
        html += `<div class="current-game">${game.name}</div>`;
        html += `<div class="game-meta">${game.collection} · ${game.era || '未知年代'}</div>`;
        html += '</div>';

        html += '<div class="move-display">';
        html += `<div class="current-move">${game.moves[currentMoveIndex] || '开始'}</div>`;
        html += '</div>';

        html += '<div class="progress-bar">';
        html += `<div class="progress-fill" style="width: ${progress}%"></div>`;
        html += `<div class="progress-text">${currentMoveIndex + 1} / ${totalMoves}</div>`;
        html += '</div>';

        html += '<div class="nav-buttons">';
        html += '<button class="nav-btn" onclick="navigatorFirst()" title="第一手">⏮</button>';
        html += '<button class="nav-btn" onclick="navigatorPrev()" title="上一手">◀</button>';
        html += '<button class="nav-btn" onclick="navigatorNext()" title="下一手">▶</button>';
        html += '<button class="nav-btn" onclick="navigatorLast()" title="最后一手">⏭</button>';
        html += '</div>';

        html += '<div class="move-list-toggle" onclick="toggleMoveList()">';
        html += '📋 显示全部着法';
        html += '</div>';

        html += '<div class="move-list" id="moveListPanel" style="display:none;">';
        game.moves.forEach((move, index) => {
            const isCurrent = index === currentMoveIndex;
            const turn = Math.floor(index / 2) + 1;
            const isRed = index % 2 === 0;
            const moveNum = isRed ? `${turn}.` : '...';
            html += `<div class="move-item ${isCurrent ? 'current' : ''}" onclick="jumpToMove(${index})">${moveNum} ${move}</div>`;
        });
        html += '</div>';

        html += '</div>';
        this.container.innerHTML = html;
    }

    getResultClass(result) {
        if (result === '红胜') return 'win-red';
        if (result === '黑胜') return 'win-black';
        if (result === '和棋') return 'draw';
        return '';
    }

    getDifficultyStars(difficulty) {
        const stars = {
            '简单': '⭐',
            '中等': '⭐⭐',
            '较难': '⭐⭐⭐',
            '困难': '⭐⭐⭐⭐',
            '极难': '⭐⭐⭐⭐⭐'
        };
        return stars[difficulty] || '⭐';
    }
}

// ============================================
// 着法解析器
// ============================================

const MoveParser = {
    /**
     * 解析中国象棋记谱法
     * 支持格式：炮二平五、車二进三、馬八进七等
     */
    parseMove(notation) {
        // 移除多余空格
        notation = notation.trim();

        // 匹配模式：棋子名 + 列数 + 动作 + 目标
        const pattern = /([将帅车马炮兵卒仕士相象])([一二三四五六七八九123456789])([平进退])([一二三四五六七八九123456789])/;
        const match = notation.match(pattern);

        if (!match) {
            return null;
        }

        const [, piece, fromCol, action, target] = match;

        return {
            piece,
            fromCol: this.chineseToNumber(fromCol),
            action, // 平、进、退
            target: this.chineseToNumber(target),
            raw: notation
        };
    },

    chineseToNumber(ch) {
        const map = {
            '一': 1, '二': 2, '三': 3, '四': 4, '五': 5,
            '六': 6, '七': 7, '八': 8, '九': 9,
            '1': 1, '2': 2, '3': 3, '4': 4, '5': 5,
            '6': 6, '7': 7, '8': 8, '9': 9
        };
        return map[ch] || 0;
    },

    /**
     * 将着法转换为坐标（需要当前棋盘状态）
     * 这是一个简化版本，实际实现需要完整的棋盘状态
     */
    moveToCoordinates(parsedMove, board, side) {
        // 这里需要根据当前棋盘状态推断出具体坐标
        // 简化处理：返回null，实际使用时需要更复杂的逻辑
        console.log('Move to coordinates:', parsedMove, side);
        return null;
    }
};

// ============================================
// 导出
// ============================================

const gameCollection = new GameCollection();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        GameCollection,
        GameBrowserUI,
        MoveParser,
        gameCollection
    };
}
