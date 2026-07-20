// tests/ui/tictactoe-bot.test.js
// The computer opponent's board strategy.
//
// This is a pure unit test, but it lives in the UI suite for one reason: the
// game modules are native ES modules and the project is CommonJS, so `npm test`
// cannot import them. Chrome can, so we load the module in the page and run the
// assertions against the real export.
//
// What matters here is that the bot plays the priority order the child expects —
// take the win, else block, else centre, else a corner. How OFTEN it plays well
// is a separate dial (BOT_ACCURACY in js/tictactoe.js) and isn't tested here.

const { url, launchBrowser, newSeededPage } = require('./helpers');

const _ = null;   // an empty square, so the board literals below stay readable

describe('UI — tic-tac-toe bot strategy', () => {
  let browser, page;

  beforeAll(async () => {
    browser = await launchBrowser();
    page = await newSeededPage(browser);
    await page.goto(url('tictactoe.html?from=activities'), { waitUntil: 'networkidle2', timeout: 20000 });
  });

  afterAll(async () => { if (browser) await browser.close(); });

  // Run one exported function from the module inside the page.
  const call = (fn, ...args) => page.evaluate(async (fn, args) => {
    const m = await import('../js/data/tictactoeBot.js');
    return m[fn](...args);
  }, fn, args);

  test('takes the winning square when it has one', async () => {
    // O holds 0 and 1 — completing the top row wins it.
    const board = ['O', 'O', _,
                   'X',  _,  _,
                   _,   _,  _];
    await expect(call('chooseSquare', board, 'O', 'X')).resolves.toBe(2);
  });

  test('prefers its own win over blocking the opponent', async () => {
    // Both sides are one square from winning: O on the top row (needs 2), X on
    // the middle row (needs 5). Taking your win beats denying theirs.
    const board = ['O', 'O', _,
                   'X', 'X', _,
                   _,   _,  _];
    await expect(call('chooseSquare', board, 'O', 'X')).resolves.toBe(2);
  });

  test("blocks the player's imminent win", async () => {
    // X threatens the left column; O has nothing of its own yet.
    const board = ['X', _, _,
                   'X', _, _,
                   _,   _, 'O'];
    await expect(call('chooseSquare', board, 'O', 'X')).resolves.toBe(6);
  });

  test('takes the centre on an open board', async () => {
    await expect(call('chooseSquare', Array(9).fill(_), 'O', 'X')).resolves.toBe(4);
  });

  test('takes a corner once the centre is gone', async () => {
    const board = [_, _, _,
                   _, 'X', _,
                   _, _, _];
    const got = await call('chooseSquare', board, 'O', 'X');
    expect([0, 2, 6, 8]).toContain(got);
  });

  test('never returns an occupied square', async () => {
    // Only 5 and 7 are free — whatever it picks must be one of them.
    const board = ['X', 'O', 'X',
                   'O', 'X', _,
                   'O', _,  'O'];
    for (let i = 0; i < 20; i++) {
      const got = await call('chooseSquare', board, 'O', 'X');
      expect([5, 7]).toContain(got);
    }
  });

  test('returns null when the board is full', async () => {
    const board = ['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', 'X'];
    await expect(call('chooseSquare', board, 'O', 'X')).resolves.toBeNull();
  });

  test('winningLine finds a completed line and ignores an incomplete one', async () => {
    const won = ['O', 'O', 'O', 'X', 'X', _, _, _, _];
    await expect(call('winningLine', won, 'O')).resolves.toEqual([0, 1, 2]);
    await expect(call('winningLine', won, 'X')).resolves.toBeNull();
  });

  test('findWinningSquare ignores a line the opponent has blocked', async () => {
    // O holds 0 and 1 but X sits on 2 — that row is dead.
    const board = ['O', 'O', 'X',
                   _,   _,   _,
                   _,   _,   _];
    await expect(call('findWinningSquare', board, 'O')).resolves.toBeNull();
  });
});
