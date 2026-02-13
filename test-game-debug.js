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

function printBoard(board, highlightX, highlightY) {
  console.log("  0 1 2 3 4 5 6 7 8");
  for (let y = 0; y < 10; y++) {
    let row = y + " ";
    for (let x = 0; x < 9; x++) {
      if (x === highlightX && y === highlightY) {
        row += "[@]";
      } else if (board[y][x]) {
        row += board[y][x].type;
      } else {
        row += "· ";
      }
    }
    console.log(row);
  }
}

function executeMove(board, notation, index) {
  const parsed = MoveParser.parseMove(notation, index);
  if (!parsed || parsed.type === 'result') return { success: true, board };
  
  const coords = MoveParser.findCoordinates(parsed, board);
  if (!coords) return { success: false, board };
  
  const { fromX, fromY, toX, toY } = coords;
  board[toY][toX] = board[fromY][fromX];
  board[fromY][fromX] = null;
  return { success: true, board, fromX, fromY, toX, toY };
}

const moves = ["炮二平五", "炮8平5", "馬二进三", "馬8进7", "車一平二", "車9进1", "車二进六", "馬2进3", "馬八进七", "馬7退8", "車二平三", "車9平7", "馬七进六"];

let board = initBoard();

for (let i = 0; i < 12; i++) {
  const result = executeMove(board, moves[i], i);
  if (!result.success) {
    console.log(`第${i+1}步失败`);
    break;
  }
}

console.log("\n执行完12步后的棋盘状态:");
printBoard(board);

console.log("\n检查'馬七进六':");
console.log("马在(2,7)位置:", board[7][2]);
console.log("board[6][2] (蹩马腿位置):", board[6][2]);

// Try to execute step 13
const parsed = MoveParser.parseMove("馬七进六", 12);
console.log("\n解析 '馬七进六':");
console.log("fromCol:", parsed.fromCol, "(7路 -> x=2)");
console.log("target:", parsed.target, "(6路 -> x=3)");
console.log("计算目标位置: from(2,7) -> to(3,5)");
console.log("蹩马腿检查: board[6][2] =", board[6][2]);
