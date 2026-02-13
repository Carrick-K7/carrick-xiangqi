const { test, expect } = require('@playwright/test');

test('弃马十三招标准版本完整播放', async ({ page }) => {
  await page.goto('https://xiangqi.carrick7.com?_=' + Date.now());
  await page.waitForTimeout(3000);
  
  // Click the correct game name
  await page.click('text=第9局 弃马十三招');
  await page.waitForTimeout(2000);
  
  // Screenshot: initial
  await page.screenshot({ path: 'qima-v2-01-start.png' });
  
  // Auto play
  const btn = await page.locator('button:has-text("自动播放")');
  await btn.click();
  
  // Wait for 30 seconds (25 steps × 1.2s)
  await page.waitForTimeout(30000);
  
  // Screenshot: finished
  await page.screenshot({ path: 'qima-v2-02-finished.png', fullPage: true });
  
  // Check progress
  const progress = await page.locator('.progress-text').textContent();
  console.log('进度:', progress);
  
  // Should show 25/25 or similar
  expect(progress).toMatch(/25/);
});
