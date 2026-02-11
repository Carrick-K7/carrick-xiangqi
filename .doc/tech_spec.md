# Tech Spec - 象棋 AI 助手 (Xiangqi Master) V2

## 1. Tech Stack (技术选型)

### 1.1 Frontend
- **Framework**: Vanilla JS (无需复杂框架，保持轻量)
- **Styling**: CSS Grid + Flexbox，响应式设计
- **Graphics**: SVG 绘制棋盘线条

### 1.2 AI Engine
- **Engine**: Pikafish (Stockfish 中国象棋移植版)
- **Format**: WebAssembly (.wasm) + JavaScript 封装
- **NNUE Data**: 4MB 神经网络评估数据
- **配置**: 搜索深度12，思考时间3秒

### 1.3 Testing (核心 - PTT V2 强制要求)
- **Testing Library**: Jest + Puppeteer (E2E 测试)
- **Coverage Target**: 业务逻辑 80%+
- **Test Types**:
  - Unit Tests: 规则验证、棋谱解析
  - Integration Tests: AI 引擎接口
  - E2E Tests: 用户交互流程
  - **新增**: 烂柯神机验证测试（150局）

### 1.4 Data (棋谱)
- **Format**: JSON (内部) + PGN (导入/导出)
- **Storage**: 本地文件 + 可扩展IndexedDB
- **Sources**: 烂柯神机、橘中秘、梅花谱、适情雅趣、现代名局

---

## 2. Data Schema (数据模型)

```typescript
// 棋子类型
interface Piece {
  type: '車' | '馬' | '相' | '仕' | '帥' | '兵' | '炮' | '將' | '象' | '士' | '卒' | '砲';
  color: 'red' | 'black';
  position: Position;
}

// 棋盘位置
interface Position {
  col: number; // 0-8 (从左到右)
  row: number; // 0-9 (从上到下)
}

// 游戏状态
interface GameState {
  board: (Piece | null)[][];
  currentPlayer: 'red' | 'black';
  moveHistory: Move[];
  isCheck: boolean;
  isCheckmate: boolean;
  isStalemate: boolean;
}

// 移动记录
interface Move {
  piece: Piece;
  from: Position;
  to: Position;
  capturedPiece?: Piece;
  timestamp: Date;
  notation: string; // 象棋记谱（如"炮二平五"）
}

// AI 分析结果
interface AIAnalysis {
  bestMove: string;       // UCI 格式 (如 "b2e2")
  bestMoveChinese: string; // 中文记谱 (如 "炮二平五")
  evaluation: number;     // 评估分数 (正值红方优)
  winrate: number;        // 红方胜率 0-100
  winrateChange: number;  // 胜率变化 (如 +5%)
  depth: number;          // 搜索深度
  thinkingTime: number;   // 思考时间 (ms)
  explanation: string;    // 简化解释
}

// 棋谱记录 (新增)
interface GameRecord {
  id: string;
  name: string;
  type: 'ancient' | 'modern' | 'custom';
  era?: string;           // 明代/清代/当代
  category?: string;      // 残局/开局/中局
  difficulty?: string;    // 简单/中等/困难
  moves: string[];        // 中文记谱数组
  pgn?: string;           // PGN格式
  result?: string;        // 红胜/黑胜/和棋
  description?: string;   // 棋谱说明
}

// PGN游戏 (新增)
interface PGNGame {
  event?: string;
  site?: string;
  date?: string;
  round?: string;
  red: string;
  black: string;
  result: string;
  moves: string[];        // UCI格式或中文记谱
}
```

---

## 3. Project Structure (目录与路由)

```
xiangqi/
├── .doc/                    # PTT 文档
│   ├── product_spec.md      # P - 目标层 (V2)
│   ├── tech_spec.md         # T - 约束层 (V2)
│   ├── task_spec.md         # T - 执行层 (V2)
│   └── complete-version-plan-20260208.md  # 今日完整版计划
├── src/
│   ├── engine/              # AI 引擎
│   │   ├── pikafish.js
│   │   ├── pikafish.wasm
│   │   ├── engine.js
│   │   ├── engine.test.js
│   │   └── ai-explainer.js  # 新增：AI解释生成
│   ├── rules/               # 规则验证
│   │   ├── validator.js
│   │   ├── piece-rules.js
│   │   ├── validator.test.js
│   │   └── lanke-validator.test.js  # 新增：烂柯神机验证
│   ├── data/                # 新增：棋谱数据
│   │   ├── ancient/         # 古谱
│   │   │   ├── lanke-shenji.json    # 烂柯神机150局
│   │   │   ├── juzhongmi.json       # 橘中秘
│   │   │   ├── meihua.json          # 梅花谱
│   │   │   └── shiqing-yaqui.json   # 适情雅趣
│   │   ├── modern/          # 现代名局
│   │   │   └── masters.json         # 30局大师对局
│   │   └── pgn-parser.js    # PGN解析器
│   ├── board/               # 棋盘组件
│   │   ├── board.js
│   │   ├── pieces.js
│   │   └── board.test.js
│   ├── ui/                  # UI 组件
│   │   ├── analysis.js      # AI分析面板
│   │   ├── history.js       # 历史记录
│   │   ├── gamelist.js      # 棋谱列表
│   │   └── game-viewer.js   # 新增：棋谱浏览器
│   └── utils/               # 工具函数
│       ├── fen.js
│       ├── notation.js
│       └── utils.test.js
├── tests/                   # E2E 测试
│   └── e2e.test.js
├── index.html
└── package.json
```

---

## 4. Development Workflow (核心 - TDD/DDD)

### 4.1 DDD (文档驱动开发)
**规则：先更新文档，再更新代码**

### 4.2 TDD (测试驱动开发)
**规则：Red-Green-Refactor 循环**

### 4.3 今日完整版开发流程

**Phase 1: 规则完善（烂柯神机验证）**
```
Red:  编写烂柯神机验证测试（150局）
Green: 实现将军/应将/和棋规则
Refactor: 优化验证器性能
```

**Phase 2: AI优化**
```
Red:  编写AI解释生成测试
Green: 实现胜率变化计算 + 模板解释
Refactor: 优化解释准确性
```

**Phase 3: 棋谱集成**
```
Red:  编写棋谱加载/浏览测试
Green: 实现JSON棋谱加载 + PGN解析
Refactor: 优化加载性能
```

---

## 5. Testing Strategy (测试策略)

### 5.1 烂柯神机验证测试 (今日核心)
```javascript
// lanke-validator.test.js
describe('烂柯神机150局验证', () => {
  const games = loadLankeShenjiGames(); // 150局
  
  games.forEach((game, index) => {
    test(`第${index + 1}局: ${game.name}`, () => {
      const board = createBoard();
      
      for (const move of game.moves) {
        const result = validateMove(board, move);
        expect(result.valid).toBe(true);
        board.applyMove(move);
      }
    });
  });
});
```

### 5.2 AI解释生成测试
```javascript
describe('AI解释生成', () => {
  test('生成控制中心的解释', () => {
    const position = '控制中心局面';
    const explanation = generateExplanation(position);
    expect(explanation).toContain('控制');
    expect(explanation).toContain('中心');
  });
});
```

### 5.3 棋谱解析测试
```javascript
describe('PGN解析', () => {
  test('解析标准PGN格式', () => {
    const pgn = '1. 炮二平五 馬八进七 ...';
    const game = parsePGN(pgn);
    expect(game.moves.length).toBeGreaterThan(0);
    expect(game.red).toBeDefined();
  });
});
```

---

*版本：PTT V2 - TDD/DDD Enhanced*  
*更新时间：2026-02-08 13:45 (东八区)*  
*今日重点：烂柯神机验证 + AI解释*
