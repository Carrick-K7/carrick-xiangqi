const MoveParser = require('./src/move-parser.js');

function initBoard() {
  const board = Array(10).fill(null).map(() => Array(9).fill(null));
  const redPieces = [
    ['車', 0, 9], ['車', 8, 9], ['馬', 1, 9], ['馬', 7, 9],
    ['相', 2, 9], ['相', 6, 9], ['仕', 3, 9], ['仕', 5, 9], ['帥', 4, 9],
    ['炮', 1, 7], ['炮', 7, 7],
    ['兵', 0, 6], ['兵', 2, 6], ['兵', 4, 6], ['兵', 6, 6], ['兵', 8, 6]
  ];
  const blackPieces = [
    ['車', 0, 0], ['車', 8, 0], ['馬', 1, 0], ['馬', 7, 0],
    ['象', 2, 0], ['象', 6, 0], ['士', 3, 0], ['士', 5, 0], ['將', 4, 0],
    ['砲', 1, 2], ['砲', 7, 2],
    ['卒', 0, 3], ['卒', 2, 3], ['卒', 4, 3], ['卒', 6, 3], ['卒', 8, 3]
  ];
  redPieces.forEach(([type, x, y]) => board[y][x] = { type, color: 'red' });
  blackPieces.forEach(([type, x, y]) => board[y][x] = { type, color: 'black' });
  return board;
}

function executeMove(board, notation, index) {
  const parsed = MoveParser.parseMove(notation, index);
  if (!parsed || parsed.type === 'result') return { success: true, board };
  const coords = MoveParser.findCoordinates(parsed, board);
  if (!coords) {
    console.log(`第${index+1}步 "${notation}" 失败`);
    return { success: false, board };
  }
  const { fromX, fromY, toX, toY } = coords;
  board[toY][toX] = board[fromY][fromX];
  board[fromY][fromX] = null;
  return { success: true, board, fromX, fromY, toX, toY };
}

const moves = ["炮二平五", "炮8平5", "馬二进三", "馬8进7", "車一进一", "车9平8", "車一平六", "车8进6", "車六进七", "马2进1", "車九进一", "炮2进7", "炮八进五", "马7退8", "炮五进四", "士6进5"];

let board = initBoard();

for (let i = 0; i < moves.length; i++) {
  const result = executeMove(board, moves[i], i);
  if (!result.success) break;
}

console.log("16步后黑方九宫:");
for (let y = 0; y < 3; y++) {
  let row = `y=${y}: `;
  for (let x = 3; x <= 5; x++) {
    if (board[y][x]) row += `${board[y][x].type}(${x}) `;
    else row += `·(${x}) `;
  }
  console.log(row);
}

console.log("\n执行 '車九平六' (第17步):");
const r1 = executeMove(board, "車九平六", 16);
if (r1.success) {
  console.log(`  車从 (${r1.fromX},${r1.fromY}) 移动到 (${r1.toX},${r1.toY})`);
  console.log("\n17步后黑方九宫:");
  for (let y = 0; y < 3; y++) {
    let row = `y=${y}: `;
    for (let x = 3; x <= 5; x++) {
      if (board[y][x]) row += `${board[y][x].type}(${x}) `;
      else row += `·(${x}) `;
    }
    console.log(row);
  }
}

console.log("\n执行 '将5平6' (第18步):");
const r2 = executeMove(board, "将5平6", 17);
if (r2.success) {
  console.log(`  將从 (${r2.fromX},${r2.fromY}) 移动到 (${r2.toX},${r2.toY})`);
} else {
  console.log("  失败！检查目标位置...");
  console.log(`  board[0][5] =`, board[0][5]);
}
