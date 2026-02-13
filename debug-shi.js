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
  if (!coords) return { success: false, board, notation };
  const { fromX, fromY, toX, toY } = coords;
  board[toY][toX] = board[fromY][fromX];
  board[fromY][fromX] = null;
  return { success: true, board };
}

const moves = ["炮二平五", "炮8平5", "馬二进三", "馬8进7", "車一进一", "车9平8", "車一平六", "车8进6", "車六进七", "马2进1", "車九进一", "炮2进7", "炮八进五", "马7退8", "炮五进四", "士6进5", "車九平六"];

let board = initBoard();

console.log("初始状态 - 黑方士的位置:");
console.log("士1:", board[0][3], "(4路)");
console.log("士2:", board[0][5], "(6路)");

for (let i = 0; i < moves.length; i++) {
  const result = executeMove(board, moves[i], i);
  if (!result.success) {
    console.log(`\n第${i+1}步失败: ${moves[i]}`);
    break;
  }
  
  // Check if 士6进5 was executed
  if (i === 15) {
    console.log("\n执行 '士6进5' 后:");
    console.log("士1:", board[0][3], "(4路)");
    console.log("士2:", board[0][4], "(5路) - 原来在6路的士移动到了5路");
    console.log("6路位置:", board[0][5]);
  }
}

console.log("\n第17步后黑方九宫:");
for (let y = 0; y < 3; y++) {
  let row = "";
  for (let x = 3; x <= 5; x++) {
    if (board[y][x]) {
      row += `${board[y][x].type}(${x},${y}) `;
    } else {
      row += `·(${x},${y}) `;
    }
  }
  console.log(row);
}
