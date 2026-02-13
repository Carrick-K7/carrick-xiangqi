function initBoard() {
  const board = Array(10).fill(null).map(() => Array(9).fill(null));
  const blackPieces = [
    ['車', 0, 0], ['車', 8, 0], ['馬', 1, 0], ['馬', 7, 0],
    ['象', 2, 0], ['象', 6, 0], ['士', 3, 0], ['士', 5, 0], ['將', 4, 0],
    ['砲', 1, 2], ['砲', 7, 2],
    ['卒', 0, 3], ['卒', 2, 3], ['卒', 4, 3], ['卒', 6, 3], ['卒', 8, 3]
  ];
  blackPieces.forEach(([type, x, y]) => board[y][x] = { type, color: 'black' });
  return board;
}

const board = initBoard();

console.log("初始状态 - 黑方士:");
console.log("士1:", board[0][3], "(4路, y=0)");
console.log("士2:", board[0][5], "(6路, y=0)");

console.log("\n模拟 '士6进5' (士从6路进到5路):");
console.log("从 (5,0) 到 (4,1) - y增加是'进'");
console.log("因为黑方在上方，向对方(下方红方)是y增加");

console.log("\n模拟 '士5退4' (士从5路退到4路):");
console.log("从 (4,1) 到 (3,0) 或 (3,2)?");
console.log("'退'对于黑方应该是y减少(回到y=0)");
console.log("因为'退'是远离对方，黑方的'退'是向上(y减少)");

console.log("\n棋盘坐标示意:");
console.log("y=0: 黑方底线 (士将在这一行)");
console.log("y=1: 士进5后应该在y=1");
console.log("y=2: 九宫底线");
console.log("'进' = y增加 (向红方)");
console.log("'退' = y减少 (向黑方底线)");
