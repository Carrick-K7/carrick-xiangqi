const MoveParser = require('./src/move-parser.js');

// Create a simple board with just the black king
const board = Array(10).fill(null).map(() => Array(9).fill(null));
board[0][4] = { type: '將', color: 'black' };

console.log("测试 '将5平6':");
console.log("将初始位置: (4, 0) = 5路");

const parsed = MoveParser.parseMove("将5平6", 17);
console.log("解析结果:", JSON.stringify(parsed, null, 2));

const coords = MoveParser.findCoordinates(parsed, board);
console.log("坐标结果:", coords);

// Expected: from (4,0) to (5,0) - but that's 6路 which is outside palace!
// Wait, palace is x=3,4,5 for black
// 5路 is x=4, 6路 is x=5
// (5,0) is still inside palace
console.log("\n将的移动规则:");
console.log("- 只能在九宫内移动");
console.log("- 黑方九宫: x=3,4,5, y=0,1,2");
console.log("- 5路平6路: (4,0) -> (5,0) 应该可行");
