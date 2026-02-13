const MoveParser = require('./src/move-parser.js');

function initBoard() {
  const board = Array(10).fill(null).map(() => Array(9).fill(null));
  // 模拟19步后的状态
  board[1][4] = { type: '士', color: 'black' }; // 士在5路y=1
  board[0][4] = { type: '將', color: 'black' }; // 将在5路y=0
  board[0][3] = { type: '士', color: 'black' }; // 另一个士在4路y=0
  return board;
}

const board = initBoard();

console.log("19步后黑方九宫:");
for (let y = 0; y < 3; y++) {
  let row = `y=${y}: `;
  for (let x = 3; x <= 5; x++) {
    if (board[y][x]) row += `[${board[y][x].type}](${x})`;
    else row += `[ ](${x})`;
  }
  console.log(row);
}

console.log("\n测试 '士5退4':");
console.log("从 (4,1) 到 (3,0)");
console.log("dx = -1, dy = -1");
console.log("士走斜线一格: |dx|=1, |dy|=1 ✅");
console.log("目标(3,0)在九宫: x=3, y=0 ✅");

// Check manually
const fromX = 4, fromY = 1, toX = 3, toY = 0;
const dx = toX - fromX; // -1
const dy = toY - fromY; // -1
const absDx = Math.abs(dx); // 1
const absDy = Math.abs(dy); // 1

console.log(`\n手动计算: dx=${dx}, dy=${dy}, absDx=${absDx}, absDy=${absDy}`);
console.log(`士的走法检查: absDx===1 && absDy===1 = ${absDx === 1 && absDy === 1}`);

// Check isInPalace
function isInPalace(x, y, color) {
  if (x < 3 || x > 5) return false;
  if (color === 'red') return y >= 7 && y <= 9;
  return y >= 0 && y <= 2;
}
console.log(`isInPalace(3,0,'black') = ${isInPalace(3, 0, 'black')}`);
