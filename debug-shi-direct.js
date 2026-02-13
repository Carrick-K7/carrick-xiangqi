const MoveParser = require('./src/move-parser.js');

function initBoard() {
  const board = Array(10).fill(null).map(() => Array(9).fill(null));
  board[1][4] = { type: '士', color: 'black' };
  board[0][4] = { type: '將', color: 'black' };
  board[0][3] = { type: '士', color: 'black' };
  return board;
}

const board = initBoard();

const parsed = MoveParser.parseMove("士5退4", 19);
console.log("解析 '士5退4':", parsed);

const result = MoveParser.findCoordinates(parsed, board);
console.log("findCoordinates结果:", result);
