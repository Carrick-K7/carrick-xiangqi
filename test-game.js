const MoveParser = require('./src/move-parser.js');

// Initialize board with Chinese piece types
function initBoard() {
  const board = Array(10).fill(null).map(() => Array(9).fill(null));
  
  // Red pieces (bottom) - use Chinese characters as type
  const redPieces = [
    ['車', 0, 9], ['車', 8, 9],
    ['馬', 1, 9], ['馬', 7, 9],
    ['相', 2, 9], ['相', 6, 9],
    ['仕', 3, 9], ['仕', 5, 9],
    ['帥', 4, 9],
    ['炮', 1, 7], ['炮', 7, 7],
    ['兵', 0, 6], ['兵', 2, 6], ['兵', 4, 6], ['兵', 6, 6], ['兵', 8, 6]
  ];
  
  // Black pieces (top)
  const blackPieces = [
    ['車', 0, 0], ['車', 8, 0],
    ['馬', 1, 0], ['馬', 7, 0],
    ['象', 2, 0], ['象', 6, 0],
    ['士', 3, 0], ['士', 5, 0],
    ['將', 4, 0],
    ['砲', 1, 2], ['砲', 7, 2],
    ['卒', 0, 3], ['卒', 2, 3], ['卒', 4, 3], ['卒', 6, 3], ['卒', 8, 3]
  ];
  
  redPieces.forEach(([type, x, y]) => {
    board[y][x] = { type, color: 'red' };
  });
  blackPieces.forEach(([type, x, y]) => {
    board[y][x] = { type, color: 'black' };
  });
  
  return board;
}

// Execute move
function executeMove(board, notation, index) {
  const parsed = MoveParser.parseMove(notation, index);
  if (!parsed || parsed.type === 'result') {
    return { success: true, board };
  }
  
  const coords = MoveParser.findCoordinates(parsed, board);
  if (!coords) {
    return { success: false, notation, index, reason: '无法找到坐标' };
  }
  
  const { fromX, fromY, toX, toY } = coords;
  board[toY][toX] = board[fromY][fromX];
  board[fromY][fromX] = null;
  
  return { success: true, board };
}

// Test
const moves = ["炮二平五", "炮8平5", "馬二进三", "馬8进7", "車一平二", "車9进1", "車二进六", "馬2进3", "馬八进七", "馬7退8", "車二平三", "車9平7", "馬七进六", "马2进6", "車三进二", "炮5平7", "馬六进四"];

console.log("执行弃马十三招棋谱:\n");
let board = initBoard();
let failed = false;

for (let i = 0; i < moves.length; i++) {
  const move = moves[i];
  const isRed = i % 2 === 0;
  const turn = Math.floor(i / 2) + 1;
  
  const result = executeMove(board, move, i);
  if (result.success) {
    console.log(`${turn}.${isRed?'红':'黑'} ${move} ✅`);
  } else {
    console.log(`${turn}.${isRed?'红':'黑'} ${move} ❌ 失败: ${result.reason}`);
    failed = true;
    break;
  }
}

if (!failed) {
  console.log("\n🎉 全部着法执行成功！");
}
