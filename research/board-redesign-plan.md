# 象棋棋盘 UI 重构方案

## 当前问题分析

### 1. 定位问题
- 使用百分比 (`11.11%`, `10%`) 计算位置，累积误差大
- 棋子大小 (10% x 9%) 与位置计算不匹配
- 不同屏幕尺寸下错位严重

### 2. 棋盘线条问题
- 背景渐变生成线条，不是实际交叉点
- 楚河汉界区域线条缺失
- 九宫格斜线缺失

### 3. 点击交互问题
- 坐标转换使用 `Math.round(x * 8)`，精度低
- 没有视觉反馈显示选中了哪个格点

## 新方案：CSS Grid 精确坐标系统

### 核心设计
```
棋盘：9列 x 10行 的交叉点网格
每个交叉点是一个 Grid Cell
棋子绝对定位在交叉点中心
```

### 技术细节

#### 1. Grid 布局
```css
.board-grid {
  display: grid;
  grid-template-columns: repeat(9, 1fr);
  grid-template-rows: repeat(10, 1fr);
  width: 100%;
  aspect-ratio: 9/10;
}
```

#### 2. 棋子定位
- 使用 CSS 变量 `--x` 和 `--y` 存储坐标
- 通过 `grid-column` 和 `grid-row` 定位到交叉点
- 使用 `transform: translate(-50%, -50%)` 居中

#### 3. 棋盘绘制
- SVG 绘制精确的线条（横线10条，竖线9条）
- 九宫格斜线单独绘制
- 楚河汉界文字标注

#### 4. 点击交互
- 每个交叉点是一个可点击的 div
- 使用 event delegation 处理点击
- 添加 `.selected-point` 类显示选中状态

## 参考实现

### chessboard.js 核心思路
1. 使用绝对定位容器
2. 棋盘和棋子分离
3. 坐标系统统一（0-7, 0-7 对于国际象棋）
4. 动画使用 CSS transform

### 中国象棋特殊处理
1. 9x10 交叉点（国际象棋是 8x8 格子）
2. 棋子放在交叉点上，不是格子里
3. 楚河汉界在中间
4. 九宫格限制

## 实现步骤

1. [x] 分析现有代码
2. [ ] 创建新的 HTML 结构（Grid-based）
3. [ ] 重写 CSS（精确对齐）
4. [ ] 重写 JavaScript（精准交互）
5. [ ] 测试各种屏幕尺寸
6. [ ] Git 提交

## 代码结构

```
index.html
├── .board-container（外层容器）
│   ├── .board-svg（棋盘线条 SVG）
│   └── .board-grid（9x10 交叉点网格）
│       └── .intersection（每个交叉点）
│           └── .piece（棋子，绝对定位）
└── .ui-panel（UI 面板）
```

## 时间估算

- 重构 HTML/CSS: 1.5小时
- 重写 JavaScript: 1小时
- 测试调优: 0.5小时
- 总计: 3小时（在 3.5 小时内）
