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
  if (!coords) return { success: false, board };
  const { fromX, fromY, toX, toY } = coords;
  board[toY][toX] = board[fromY][fromX];
  board[fromY][fromX] = null;
  return { success: true, board };
}

const moves = ["炮二平五", "炮8平5", "馬二进三", "馬8进7", "車一进一", "车9平8", "車一平六", "车8进6", "車六进七", "马2进1", "車九进一", "炮2进7", "炮八进五", "马7退8", "炮五进四", "士6进5", "車九平六"];

let board = initBoard();

for (let i = 0; i < moves.length; i++) {
  const result = executeMove(board, moves[i], i);
  if (!result.success) {
    console.log(`第${i+1}步失败: ${moves[i]}`);
    break;
  }
}

// Now test 将5平6
console.log("\n17步后棋盘状态（黑方九宫）:");
for (let y = 0; y < 3; y++) {
  let row = "";
  for (let x = 3; x <= 5; x++) {
    if (board[y][x]) row += `[${board[y][x].type}](${x})`;
    else row += `[ ](${x})`;
  }
  console.log(`y=${y}: ${row}`);
}

// Manual test of 将5平6
console.log("\n手动测试 '将5平6':");
const parsed = MoveParser.parseMove("将5平6", 17);
console.log("解析:", parsed);

const pieceMap = {
  '將': 'king', '士': 'advisor', '象': 'elephant',
  '馬': 'horse', '車': 'rook', '砲': 'cannon', '卒': 'pawn'
};

// Find candidates
let foundKing = null;
for (let y = 0; y < 10; y++) {
  for (let x = 0; x < 9; x++) {
    const p = board[y][x];
    if (p && pieceMap[p.type] === 'king' && p.color === 'black') {
      console.log(`找到黑将: (${x},${y}) = ${x+1}路`);
      if (x === 4) foundKing = { x, y };
    }
  }
}

console.log("期望fromCol=4 (5路), 实际:", foundKing);
