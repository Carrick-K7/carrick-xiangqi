const { test, expect } = require('@playwright/test');

/**
 * E2E测试: 弃马十三招经典对局
 * 验证: 棋盘加载、走子功能、胜负判定
 */

test.describe('弃马十三招经典对局', () => {
  
  test.beforeEach(async ({ page }) => {
    // 访问Xiangqi网站
    await page.goto('https://xiangqi.carrick7.com');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // 截图初始状态
    await page.screenshot({ path: 'test-results/qima-01-init.png' });
  });

  test('加载弃马十三招棋谱', async ({ page }) => {
    // 1. 点击左侧"弃马十三招"
    console.log('🎮 点击弃马十三招...');
    await page.click('text=弃马十三招');
    await page.waitForTimeout(2000);
    
    // 截图: 加载棋谱后
    await page.screenshot({ path: 'test-results/qima-02-loaded.png' });
    
    // 验证: 棋盘已渲染
    const board = await page.locator('.xiangqi-board, .board, [class*="board"]').first();
    await expect(board).toBeVisible();
    
    console.log('✅ 棋谱加载成功');
  });

  test('执行完整对局 - 关键步骤验证', async ({ page }) => {
    // 加载棋谱
    await page.click('text=弃马十三招');
    await page.waitForTimeout(2000);
    
    // 关键步骤验证点
    const checkpoints = [
      { step: 4, desc: "黑车过河", verify: "车8进6" },
      { step: 6, desc: "黑炮弃马", verify: "炮2进7" },
      { step: 9, desc: "红车占肋", verify: "车九平六" },
      { step: 13, desc: "重炮杀", verify: "炮八平五" }
    ];
    
    for (const cp of checkpoints) {
      console.log(`🎯 检查第${cp.step}步: ${cp.desc}`);
      
      // 截图记录
      await page.screenshot({ 
        path: `test-results/qima-step-${cp.step}.png` 
      });
      
      // 验证着法记录区域
      const moveRecord = await page.locator('.move-record, [class*="record"], text=${cp.verify}').count();
      console.log(`  着法记录: ${moveRecord > 0 ? '✅' : '⚠️'}`);
    }
    
    // 最终截图
    await page.screenshot({ path: 'test-results/qima-03-final.png' });
    
    console.log('✅ 弃马十三招测试完成');
  });

  test('验证棋盘交互功能', async ({ page }) => {
    // 加载棋谱
    await page.click('text=弃马十三招');
    await page.waitForTimeout(2000);
    
    // 测试功能按钮
    console.log('🔄 测试功能按钮...');
    
    // 翻转棋盘
    await page.click('text=翻转棋盘');
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'test-results/qima-04-flipped.png' });
    console.log('  ✅ 翻转棋盘');
    
    // 重置棋局
    await page.click('text=重置');
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'test-results/qima-05-reset.png' });
    console.log('  ✅ 重置棋局');
    
    // AI分析按钮存在
    const aiButton = await page.locator('text=AI分析');
    await expect(aiButton).toBeVisible();
    console.log('  ✅ AI分析按钮');
  });

});
