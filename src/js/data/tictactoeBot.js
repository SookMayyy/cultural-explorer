/* tictactoeBot.js — noughts-and-crosses strategy for the computer player */

// Pure board maths (no DOM), so it's unit-testable. A board is a 9-slot array
// (0–8, left-to-right, top-to-bottom); each slot is null | 'X' | 'O'.
// Deliberately NOT minimax — the beatability comes from the accuracy roll in tictactoe.js.

export const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],   // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8],   // columns
  [0, 4, 8], [2, 4, 6],              // diagonals
];

const CORNERS = [0, 2, 6, 8];
const CENTRE  = 4;

function randomFrom(list) {
  return list.length ? list[Math.floor(Math.random() * list.length)] : null;
}

// Empty square indices, in board order.
export function emptySquares(board) {
  return board.reduce((acc, v, i) => (v === null ? acc.concat(i) : acc), []);
}

// The three squares `mark` has won on, or null.
export function winningLine(board, mark) {
  return LINES.find(line => line.every(i => board[i] === mark)) || null;
}

// The square that completes a line for `mark` now (take a win, or block theirs). Null if none.
export function findWinningSquare(board, mark) {
  for (const line of LINES) {
    const held  = line.filter(i => board[i] === mark).length;
    const empty = line.find(i => board[i] === null);
    if (held === 2 && empty !== undefined) return empty;
  }
  return null;
}

// Pick a square by priority: win → block → centre → corner → anything. Null if full.
export function chooseSquare(board, me, opponent) {
  const empties = emptySquares(board);
  if (!empties.length) return null;

  const win = findWinningSquare(board, me);
  if (win !== null) return win;

  const block = findWinningSquare(board, opponent);
  if (block !== null) return block;

  if (board[CENTRE] === null) return CENTRE;

  const corner = randomFrom(CORNERS.filter(i => board[i] === null));
  if (corner !== null) return corner;

  return randomFrom(empties);
}
