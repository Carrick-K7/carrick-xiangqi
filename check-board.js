const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  
  console.log("🚀 访问Xiangqi网站...\n");
  await page.goto('https://xiangqi.carrick7.com', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  
  console.log("📸 截图...");
  await page.screenshot({ path: 'test-board.png', fullPage: true });
  
  console.log("✅ 截图已保存: test-board.png\n");
  
  // 检查页面
  const title = await page.title();
  console.log(`页面标题: ${title}`);
  
  // 获取HTML分析结构
  const html = await page.content();
  console.log("页面包含关键字:");
  console.log(`  - 'board': ${html.toLowerCase().includes('board')}`);
  console.log(`  - 'xiangqi': ${html.toLowerCase().includes('xiangqi')}`);
  console.log(`  - 'chess': ${html.toLowerCase().includes('chess')}`);
  console.log(`  - 'canvas': ${html.includes('canvas')}`);
  
  // 查找可能的棋盘元素
  const elements = await page.locator('canvas, [class*="board"], [id*="board"], [class*="xiangqi"]').count();
  console.log(`\n可能的棋盘元素数量: ${elements}`);
  
  // 获取所有class包含board的元素
  const boardEls = await page.locator('[class*="board"]').all();
  console.log(`class包含board的元素: ${boardEls.length}个`);
  
  await browser.close();
})();
