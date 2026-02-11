# Tech Spec - 中国象棋AI分析应用

## 1. 技术架构

### 1.1 架构选型: Web应用 (优先)
**原因**: 
- 明早必须可用，Web开发最快
- 可后续用Electron打包桌面版
- 跨平台兼容性好

### 1.2 技术栈
```
┌─────────────────────────────────────┐
│           前端层 (Vanilla JS)        │
│      HTML5 Canvas / SVG 棋盘渲染      │
├─────────────────────────────────────┤
│           引擎层                      │
│    Pikafish.js (中国象棋引擎)         │
├─────────────────────────────────────┤
│           数据层                      │
│    内置JSON棋谱 + localStorage        │
└─────────────────────────────────────┘
```

## 2. 引擎选型决策

### 2.1 选择: Pikafish.js

| 方案 | 评估 | 结论 |
|------|------|------|
| Pikafish.js | 基于Stockfish，中国象棋移植版，JS版本可用，强度足够 | ✅ 采用 |
| chinese-chess-engine | npm上有包，但更新较少，强度一般 | ❌ 备选 |
| 云端API | 需要联网，延迟不可控，可能有费用 | ❌ 不符合离线要求 |

**Pikafish.js 优势**:
- 完全离线运行
- UCI协议标准
- 可调难度（搜索深度）
- 开源免费

### 2.2 引擎集成方式
```javascript
// Web Worker 方式运行引擎
const engine = new Worker('./pikafish.js');
engine.postMessage('position fen ' + currentFen);
engine.postMessage('go depth 12'); // 搜索深度控制难度
```

## 3. 项目结构

```
carrick-xiangqi/
├── index.html          # 主入口
├── css/
│   └── style.css       # 样式
├── js/
│   ├── main.js         # 主逻辑
│   ├── board.js        # 棋盘渲染
│   ├── game.js         # 游戏逻辑
│   ├── engine.js       # AI引擎封装
│   ├── analyzer.js     # 分析功能
│   └── openings.js     # 历史棋谱数据
├── engine/
│   └── pikafish.js     # 象棋引擎(Web Worker)
└── assets/
    ├── pieces/         # 棋子图片
    └── boards/         # 棋盘背景
```

## 4. 核心模块设计

### 4.1 Board 棋盘模块
```javascript
class XiangqiBoard {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.pieces = []; // 当前棋子位置
    this.selected = null;
  }
  
  render() { /* 绘制棋盘和棋子 */ }
  handleClick(x, y) { /* 处理点击事件 */ }
  movePiece(from, to) { /* 移动棋子 */ }
  highlightSquare(square) { /* 高亮格子 */ }
}
```

### 4.2 Game 游戏逻辑模块
```javascript
class XiangqiGame {
  constructor() {
    this.board = new XiangqiBoard('board');
    this.engine = new PikafishEngine();
    this.history = []; // 走棋历史
    this.turn = 'red'; // 当前回合
  }
  
  makeMove(move) { /* 执行走法 */ }
  isLegalMove(move) { /* 验证合法性 */ }
  getFEN() { /* 获取局面FEN */ }
  undo() { /* 悔棋 */ }
}
```

### 4.3 Analyzer 分析模块
```javascript
class XiangqiAnalyzer {
  constructor(engine) {
    this.engine = engine;
    this.analysisCache = new Map();
  }
  
  async analyze(fen) {
    // 调用引擎分析
    const result = await this.engine.analyze(fen, 12);
    return {
      bestMove: result.bestMove,
      score: result.score, // 分数转胜率
      pv: result.pv, // 主要变例
      reason: this.generateReason(result)
    };
  }
  
  generateReason(analysis) {
    // 基于分析结果生成文字说明
    const score = analysis.score;
    if (score > 200) return "此步可获明显优势，控制中路发起进攻";
    if (score > 100) return "稳健走法，巩固阵型寻找战机";
    return "平衡局面，双方互有顾忌";
  }
}
```

## 5. AI难度控制

```javascript
const DIFFICULTY = {
  EASY: { depth: 4, randomness: 0.3 },   // 新手
  MEDIUM: { depth: 8, randomness: 0.1 }, // 业余  
  HARD: { depth: 12, randomness: 0 }     // 专业
};
```

## 6. 历史棋谱数据结构

```javascript
const CLASSIC_GAMES = [
  {
    id: "juzhongmi",
    name: "橘中秘 - 顺手炮",
    year: "明代",
    players: "古谱",
    description: "明代象棋经典，以炮局对抗闻名",
    moves: ["h2e2", "h9g7", "h0g2", "h7e7", ...], // UCI格式
    keyPosition: "rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w"
  },
  // ... 更多棋谱
];
```

## 7. 性能考虑

- 引擎在Web Worker中运行，不阻塞UI
- 分析深度默认12层，响应时间<3秒
- 棋盘使用Canvas渲染，60fps流畅

## 8. 后续扩展 (Electron桌面版)

```bash
# 后续可添加Electron打包
npm install electron --save-dev
# 创建 main.js 作为Electron入口
# 使用 electron-builder 打包
```

---
*Created: 2026-02-06*
