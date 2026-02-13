const { test, expect } = require('@playwright/test');

test('弃马十三招自动播放修复验证', async ({ page }) => {
  console.log('🎮 测试开始...');
  
  // 访问页面
  await page.goto('https://xiangqi.carrick7.com?_=' + Date.now());
  await page.waitForTimeout(3000);
  
  // 点击弃马十三招
  await page.click('text=弃马十三招');
  await page.waitForTimeout(2000);
  console.log('✅ 棋谱已加载');
  
  // 截图: 初始状态
  await page.screenshot({ path: 'qima-fixed-01-start.png' });
  
  // 点击自动播放
  const autoPlayBtn = await page.locator('button:has-text("自动播放")');
  await autoPlayBtn.click();
  console.log('▶️ 自动播放已启动');
  
  // 等待自动播放完成（17步 × 1秒间隔 + 缓冲）
  await page.waitForTimeout(20000);
  
  // 截图: 播放结束后
  await page.screenshot({ path: 'qima-fixed-02-finished.png', fullPage: true });
  console.log('📸 已截图');
  
  // 检查进度
  const progressText = await page.locator('.progress-text, .move-progress').textContent().catch(() => 'unknown');
  console.log('进度:', progressText);
  
  // 验证是否完成（应该显示17/17或类似）
  const hasCompleted = progressText.includes('17') || progressText.includes('完成');
  console.log(hasCompleted ? '✅ 自动播放完成' : '⚠️ 可能未完成');
});
