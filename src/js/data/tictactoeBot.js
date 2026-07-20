// js/data/tictactoeBot.js — noughts-and-crosses strategy for the computer player.
// ─────────────────────────────────────────────────────────────────────────────
// Pure board maths: no DOM, no timers, no randomness beyond picking among
// equally-good squares. That keeps it unit testable (tests/tictactoeBot.test.js)
// and keeps tictactoe.js free to worry only about presentation.
//
// A board is a 9-slot array indexed left-to-right, top-to-bottom:
//
//     0 | 1 | 2
//     3 | 4 | 5
//     6 | 7 | 8
//
// Each slot is null (unclaimed), 'X' (Player 1) or 'O' (Player 2 / the bot).
//
// Note this is deliberately NOT a perfect minimax player. Perfect play makes the
// game unwinnable for a child; the "should I answer correctly at all?" accuracy
// roll lives in tictactoe.js and is what actually keeps the bot beatable.

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

/** Empty square indices, in board order. */
export function emptySquares(board) {
  return board.reduce((acc, v, i) => (v === null ? acc.concat(i) : acc), []);
}

/** The three squares `mark` has won on, or null if it hasn't won. */
export function winningLine(board, mark) {
  return LINES.find(line => line.every(i => board[i] === mark)) || null;
}

/**
 * The square that completes a line for `mark` right now — i.e. `mark` already
 * holds two of the three and the third is empty. Null if there isn't one.
 * Used both to take a win and (passing the opponent's mark) to block theirs.
 */
export function findWinningSquare(board, mark) {
  for (const line of LINES) {
    const held  = line.filter(i => board[i] === mark).length;
    const empty = line.find(i => board[i] === null);
    if (held === 2 && empty !== undefined) return empty;
  }
  return null;
}

/**
 * Pick a square using standard tic-tac-toe priority:
 *   1. win now   2. block the opponent's win   3. centre   4. a corner   5. anything
 * Returns null only when the board is full.
 */
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
