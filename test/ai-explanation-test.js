/**
 * AI解释功能测试
 */

// 模拟棋盘数据
const testBoard = Array(10).fill(null).map(() => Array(9).fill(null));

// 设置测试局面：红方控制中心，威胁黑车
testBoard[4][4] = { type: '炮', color: 'red' };  // 中心炮
testBoard[3][4] = { type: '兵', color: 'red' };  // 过河兵
testBoard[2][1] = { type: '車', color: 'black' }; // 黑车在边角
testBoard[9][4] = { type: '帥', color: 'red' };   // 红帅
testBoard[0][4] = { type: '將', color: 'black' }; // 黑将

// 导入函数
import { generateExplanation } from '../src/ai-explanation.js';

console.log('=================================');
console.log('AI解释功能测试');
console.log('=================================\n');

// 测试1：红方局面
console.log('测试1：红方控制中心局面');
const result1 = generateExplanation(testBoard, 'red', 5.5, 'h2e2');
console.log('主要解释:', result1.mainExplanation);
console.log('详细HTML:', result1.detailedHTML);
console.log('胜率影响:', result1.winrateImpacts);
console.log();

// 测试2：黑方局面
console.log('测试2：黑方局面');
const result2 = generateExplanation(testBoard, 'black', -3.2, 'b2b3');
console.log('主要解释:', result2.mainExplanation);
console.log('详细HTML:', result2.detailedHTML);
console.log();

// 测试3：均势局面
const balancedBoard = Array(10).fill(null).map(() => Array(9).fill(null));
balancedBoard[9][4] = { type: '帥', color: 'red' };
balancedBoard[0][4] = { type: '將', color: 'black' };

console.log('测试3：均势局面');
const result3 = generateExplanation(balancedBoard, 'red', 0, 'a0a1');
console.log('主要解释:', result3.mainExplanation);
console.log();

console.log('=================================');
console.log('测试完成！');
console.log('=================================');
