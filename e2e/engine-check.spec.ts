import { test, expect } from '@playwright/test';

test.describe('象棋AI引擎检查', () => {
  test('检查引擎文件是否可访问', async ({ page }) => {
    // 监听控制台错误
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
        console.log('Console Error:', msg.text());
      }
    });
    
    // 监听页面错误
    page.on('pageerror', error => {
      console.log('Page Error:', error.message);
    });

    await page.goto('https://xiangqi.carrick7.com');
    
    // 等待页面加载
    await page.waitForLoadState('networkidle');
    
    // 等待一段时间收集错误
    await page.waitForTimeout(3000);
    
    // 检查 XiangqiEngine 是否定义
    const engineDefined = await page.evaluate(() => {
      return typeof XiangqiEngine !== 'undefined';
    });
    
    console.log('XiangqiEngine defined:', engineDefined);
    console.log('Console errors:', errors);
    
    // 截图保存
    await page.screenshot({ path: '/tmp/xiangqi-engine-check.png', fullPage: true });
  });

  test('检查引擎文件加载状态', async ({ page }) => {
    const responses = [];
    
    page.on('response', response => {
      const url = response.url();
      if (url.includes('pikafish') || url.includes('engine')) {
        responses.push({
          url: url,
          status: response.status()
        });
      }
    });

    await page.goto('https://xiangqi.carrick7.com');
    await page.waitForLoadState('networkidle');
    
    console.log('Engine-related responses:', responses);
    
    // 检查关键文件是否加载成功
    const engineJsLoaded = responses.some(r => r.url.includes('engine.js') && r.status === 200);
    const pikafishJsLoaded = responses.some(r => r.url.includes('pikafish.js') && r.status === 200);
    
    console.log('engine.js loaded:', engineJsLoaded);
    console.log('pikafish.js loaded:', pikafishJsLoaded);
  });
});
