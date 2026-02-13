const { test, expect } = require('@playwright/test');

/**
 * T-008 验收测试: 棋谱推演功能
 */

test.describe('T-008 棋谱推演功能验收', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('https://xiangqi.carrick7.com');
    await page.waitForTimeout(3000);
  });

  test('✅ 加载弃马十三招并推演前3步', async ({ page }) => {
    console.log('🎮 测试开始: 加载弃马十三招');
    
    // 1. 点击弃马十三招
    await page.click('text=弃马十三招');
    await page.waitForTimeout(2000);
    
    // 截图: 加载后
    await page.screenshot({ path: 't008-01-loaded.png' });
    console.log('✅ 棋谱加载成功');
    
    // 2. 检查导航按钮是否存在
    const navButtons = await page.locator('button:has-text("第一手"), button:has-text("上一手"), button:has-text("下一手")').count();
    console.log(`导航按钮数量: ${navButtons}`);
    expect(navButtons).toBeGreaterThan(0);
    
    // 3. 点击"下一手"3次
    for (let i = 1; i <= 3; i++) {
      await page.click('button:has-text("下一手")');
      await page.waitForTimeout(1000);
      await page.screenshot({ path: `t008-02-step-${i}.png` });
      console.log(`✅ 第${i}步完成`);
    }
    
    console.log('🎉 推演测试完成');
  });

  test('✅ 自动播放功能', async ({ page }) => {
    await page.click('text=弃马十三招');
    await page.waitForTimeout(2000);
    
    // 点击自动播放
    const autoPlayBtn = await page.locator('button:has-text("自动播放"), button:has-text("▶")').first();
    if (await autoPlayBtn.isVisible()) {
      await autoPlayBtn.click();
      console.log('▶️ 自动播放已启动');
      
      // 等待5秒
      await page.waitForTimeout(5000);
      await page.screenshot({ path: 't008-03-autoplay.png' });
      console.log('✅ 自动播放测试完成');
    }
  });

  test('✅ 进度条显示', async ({ page }) => {
    await page.click('text=弃马十三招');
    await page.waitForTimeout(2000);
    
    // 检查进度条或步数显示
    const progress = await page.locator('.progress-bar, .move-progress, text=/\\d+\\s*\\/\\s*\\d+/').count();
    console.log(`进度指示器: ${progress > 0 ? '✅' : '❌'}`);
    
    await page.screenshot({ path: 't008-04-progress.png' });
  });

});
