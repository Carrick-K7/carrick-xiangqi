# 象棋 AI 助手 - 完整重构规划

**状态：** 紧急修复 → 完整重构  
**问题：** MVP 太粗糙，棋子错位、走子无规则  
**目标：** 专业级象棋体验  
**负责人：** 🎨 Lyra（主）+ 🎵 Miku（协助策划）  
**决策：** Carrick 授权团队自主搞定，无需一直跟进

---

## 🔍 问题诊断

### 当前问题
1. **棋子错位** - CSS 定位计算错误，网格不对齐
2. **走子无规则** - 只有选中+移动，没有象棋规则验证
3. **无 AI 引擎** - 随机建议，非真实计算
4. **无棋谱系统** - 只有静态展示

### 根本原因
- MVP 时间太紧，先跑通再优化的心态
- 缺少专业的象棋规则引擎
- 缺少成熟的棋盘 UI 参考

---

## 🎯 重构目标

### Phase 1: 棋盘修复（今天必须完成）
- [ ] 棋子与棋盘完美对齐
- [ ] 正确的象棋坐标系统（0-8, 0-9）
- [ ] 点击精准识别格子

### Phase 2: 规则引擎（2-3天）
- [ ] 完整象棋规则验证
- [ ] 每种棋子的走法逻辑
- [ ] 将军/应将检测
- [ ] 胜负判定

### Phase 3: AI 引擎（3-5天）
- [ ] 接入 Pikafish/Stockfish
- [ ] 真实胜率评估
- [ ] 走法建议 + 原因

### Phase 4: 棋谱系统（1周内）
- [ ] 经典棋谱录入（72+）
- [ ] 棋谱分类浏览
- [ ] 棋谱搜索

---

## 📚 参考实现研究

### 1. 开源象棋引擎

#### Pikafish（首选）
- **GitHub:** https://github.com/official-pikafish/Pikafish
- **特点:** Stockfish 中国象棋移植版，最强开源引擎
- **使用:** WebAssembly 版本，浏览器运行
- **优点:** 离线、快速、专业

#### 其他参考
- **BCZhou Xiangqi:** https://github.com/bczou/xiangqi
- **Chess.js:** https://github.com/jhlywa/chess.js (国际象棋，参考架构)
- **Xiangqi.com:** 商业网站，UI 参考

### 2. 棋盘 UI 库

#### chessboard.js（参考）
- **用途:** 国际象棋棋盘，架构可参考
- **特点:** 响应式、可定制、事件丰富
- **学习:** 坐标计算、拖拽逻辑

#### 自研方案
基于 HTML5 Canvas 或 CSS Grid，参考上述实现

### 3. 规则验证方案

**方案 A: 使用现有引擎（推荐）**
- 使用 Pikafish 的 JavaScript 版本
- 引擎自带规则验证
- 代码少，可靠性高

**方案 B: 自研规则引擎**
- 自己实现所有象棋规则
- 灵活但工作量大
- 容易出 Bug

**决策: 先用方案 A，快速验证可行性**

---

## 🛠️ 技术方案

### 架构设计

```
xiangqi-app/
├── index.html          # 主页面
├── css/
│   └── board.css       # 棋盘样式（精准定位）
├── js/
│   ├── board.js        # 棋盘渲染 + 交互
│   ├── rules.js        # 象棋规则引擎（或调用 Pikafish）
│   ├── ai.js           # AI 接口（Pikafish 封装）
│   └── game.js         # 游戏状态管理
├── engine/
│   └── pikafish.js     # 象棋引擎（WebAssembly）
└── data/
    └── openings.json   # 开局库
    └── games.json      # 历史棋谱
```

### 关键技术点

#### 1. 棋盘坐标系统
```javascript
// 标准象棋坐标
// x: 0-8 (从左到右，红方视角)
// y: 0-9 (从上到下，黑方在上方)

const BOARD = {
  width: 9,      // 9列
  height: 10,    // 10行
  gridSize: 60,  // 每格60像素（可缩放）
  padding: 30    // 边距
};

// 屏幕坐标转棋盘坐标
function screenToBoard(screenX, screenY) {
  const x = Math.round((screenX - padding) / gridSize);
  const y = Math.round((screenY - padding) / gridSize);
  return {x: clamp(x, 0, 8), y: clamp(y, 0, 9)};
}
```

#### 2. 棋子走法规则
```javascript
const PIECE_RULES = {
  '車': (from, to, board) => {
    // 車：直线，无阻挡
    return isStraightLine(from, to) && !hasBlocker(from, to, board);
  },
  '馬': (from, to, board) => {
    // 馬：日字，不绊脚
    return isHorseMove(from, to) && !isHorseBlocked(from, to, board);
  },
  '相': (from, to, board) => {
    // 相：田字，不过河，不被塞象眼
    return isElephantMove(from, to) && !crossesRiver(to) && !isElephantBlocked(from, to);
  },
  // ... 其他棋子
};
```

#### 3. 使用 Pikafish 引擎
```javascript
// 初始化引擎
const engine = new Worker('pikafish.js');

// 分析局面
function analyzePosition(fen) {
  engine.postMessage(`position fen ${fen}`);
  engine.postMessage('go depth 15');
  
  return new Promise(resolve => {
    engine.onmessage = (e) => {
      if (e.data.startsWith('bestmove')) {
        resolve(e.data);
      }
    };
  });
}
```

---

## 📅 修订时间表

### 今天（2月7日）
**目标：** 修复棋盘对齐问题

- [ ] 研究参考实现（2小时）
- [ ] 重写棋盘 CSS/JS（4小时）
- [ ] 测试对齐精度（1小时）
- [ ] 部署修复版（1小时）

### 明天（2月8日）
**目标：** 接入规则引擎

- [ ] 下载 Pikafish 引擎
- [ ] 实现 FEN 局面表示
- [ ] 接入引擎验证走法
- [ ] 测试基本规则

### 后天（2月9日）
**目标：** 完整规则 + AI 建议

- [ ] 所有棋子走法验证
- [ ] 将军/应将检测
- [ ] 胜负判定
- [ ] AI 胜率评估

### 周末（2月10-11日）
**目标：** 棋谱系统

- [ ] 收集 72+ 棋谱
- [ ] 棋谱分类展示
- [ ] 棋谱搜索功能

---

## 🎵 Miku 的协助计划

### 今天协助内容
1. **研究参考实现**
   - 查找 3-5 个开源象棋项目
   - 分析他们的棋盘实现
   - 总结最佳实践

2. **协助技术选型**
   - 对比 Pikafish vs 自研引擎
   - 准备技术方案文档

3. **进度跟进**
   - 每 2 小时询问 Lyra 进展
   - 记录问题和风险
   - 必要时提供技术支持

### 不干预的内容
- 具体代码实现（Lyra 全权负责）
- 细节技术决策（Lyra 自主决定）
- 日常开发节奏（Lyra 自己把控）

---

## ✅ Carrick 授权确认

**Carrick 明确说：**
> "我没办法一直跟着，希望你们能自己搞定"
> "Miku和Lyra一起好好策划一下"

**这意味着：**
- ✅ 团队自主决策技术方案
- ✅ 不需要每一步都汇报
- ✅ 按 PTT 框架认真执行
- ✅ 遇到重大问题才升级

**Miku + Lyra 承诺：**
- 认真规划，不敷衍了事
- 参考成熟实现，不闭门造车
- 有问题内部先解决，不打扰 Carrick
- 交付专业级产品

---

*规划文档创建：2026-02-07 01:35（东八区）*  
*下一步：Lyra 开始研究参考实现，Miku 协助分析*
