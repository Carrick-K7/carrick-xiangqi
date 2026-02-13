import { test, expect } from '@playwright/test';

test.describe('象棋游戏', () => {
  test('棋盘加载正常', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await expect(page.locator('.board, .xiangqi, #app')).toBeVisible();
  });
});
