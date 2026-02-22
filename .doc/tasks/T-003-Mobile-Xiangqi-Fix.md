# T-031: 象棋移动端适配修复

## 问题反馈
Carrick报告移动端象棋体验问题：
1. 棋子太小，难以点击
2. 点击棋谱不会加载
3. 没有棋谱切换按钮
4. 棋谱占比太大，滑动到棋盘较久

## 修复内容 - 第一版

### 1. 移动端CSS全面优化
- 添加 `@media (max-width: 900px)` 全面移动端适配
- 棋子字体放大：`font-size: clamp(16px, 5vw, 28px)`
- 棋谱面板改为抽屉式侧滑
- 添加底部悬浮切换按钮
- 优化按钮和控制面板布局

### 2. 移动端交互优化
- 添加棋谱面板开关函数 `toggleHistoryPanel()` / `closeHistoryPanel()`
- 添加遮罩层点击关闭功能
- 点击棋谱后自动关闭面板（移动端）

### 3. 新增元素
- 遮罩层 `<div class="history-overlay">`
- 移动端切换按钮 `<button class="mobile-toggle-btn">`
- 面板关闭按钮

## 修复内容 - 第二版
Carrick反馈：
1. 棋子太大，而且不圆
2. 棋子落地动画太久
3. 棋谱按钮不见了

### 修复：
- 棋子缩小：`clamp(12px, 4vw, 22px)`
- 强制圆形：`border-radius: 50% !important`
- 动画加快：0.15s（原来是0.25s）
- 按钮移到左下角，缩小尺寸

## 测试结果
- ✅ 部署成功
- 🧪 移动端需Carrick验证

## 访问地址
https://xiangqi.carrick7.com

---
*修复时间：2026-02-13*
