const { test, expect } = require('@playwright/test');

test('T-008 验证导航按钮', async ({ page }) => {
  // Clear cache with timestamp
  await page.goto('https://xiangqi.carrick7.com?_=' + Date.now());
  await page.waitForTimeout(3000);
  
  // Check for move-parser script
  const html = await page.content();
  const hasMoveParser = html.includes('move-parser.js');
  const hasGameBrowser = html.includes('game-browser.js');
  
  console.log('move-parser.js:', hasMoveParser ? '✅' : '❌');
  console.log('game-browser.js:', hasGameBrowser ? '✅' : '❌');
  
  expect(hasMoveParser).toBe(true);
  expect(hasGameBrowser).toBe(true);
  
  // Click 弃马十三招
  await page.click('text=弃马十三招');
  await page.waitForTimeout(2000);
  
  // Screenshot
  await page.screenshot({ path: 't008-verified.png', fullPage: true });
  
  // Verify navigation buttons exist
  const navButtons = await page.locator('button:has-text("第一手"), button:has-text("下一手"), .nav-btn').count();
  console.log(`导航按钮数量: ${navButtons}`);
  expect(navButtons).toBeGreaterThan(0);
});
