// tests/ui/tictactoe-play.test.js
// Cultural Tic-Tac-Toe actually plays: popups in order, a real drag claims a
// square, and the wording addresses the child directly.
//
// This drives page.mouse, so the browser emits genuine trusted pointerdown /
// pointermove / pointerup — the same path a finger takes through
// utils/pointerDrag.js. Synthetic dispatchEvent() would skip setPointerCapture
// and prove much less.

const { url, launchBrowser, newSeededPage, settle } = require('./helpers');

const GAME = 'tictactoe.html?from=activities';

// The loss test plays a whole game against the bot and waits on real state
// changes rather than sleeping, so it needs more headroom than the 60s default.
jest.setTimeout(120000);

// Drag the pill for `square` onto that square's picture. They match by
// construction (items[i] is the answer for square i), so this is a correct move.
async function dragPillToSquare(page, square) {
  const pill = await page.$(`.ttt-pill[data-square="${square}"]`);
  const cell = await page.$(`.ttt-cell[data-square="${square}"]`);
  const p = await pill.boundingBox();
  const c = await cell.boundingBox();

  await page.mouse.move(p.x + p.width / 2, p.y + p.height / 2);
  await page.mouse.down();
  // Several steps so the 8px drag threshold is crossed and pointermove fires
  // more than once — a single jump would not exercise the ghost tracking.
  await page.mouse.move(c.x + c.width / 2, c.y + c.height / 2, { steps: 12 });
  await page.mouse.up();
  await settle(250);
}

const text = (page, sel) => page.$eval(sel, el => el.textContent.trim());

/**
 * Play a game to its result popup, choosing each move with `pickMove`.
 *
 * Deadline-driven rather than a fixed number of tries, and it waits on real
 * state rather than sleeping. Both matter: a drag that lands while the previous
 * move is still resolving (or while the bot has control) is simply discarded by
 * the game, and a count-based loop would burn its whole budget on discarded
 * drags in milliseconds. Here a wasted attempt costs a moment and we try again.
 *
 * `pickMove` returns { pill, target } square indices, or null when it has no
 * move left. Equal indices are a correct match; different ones are deliberately
 * wrong.
 */
async function playUntilResult(page, pickMove, { deadlineMs = 45000 } = {}) {
  const deadline = Date.now() + deadlineMs;

  while (Date.now() < deadline) {
    if (await page.$('.ttt-win')) return;              // a result popup landed

    // Only ever drag on the child's turn — "Rimau is thinking" means the bot
    // still has control and anything we do would be discarded.
    await page.waitForFunction(
      () => document.querySelector('.ttt-win') ||
            document.getElementById('ttt-turn-text')?.textContent !== 'Rimau is thinking',
      { timeout: 12000, polling: 80 },
    ).catch(() => {});
    if (await page.$('.ttt-win')) return;

    const move = await page.evaluate(pickMove);
    if (!move) return;

    const pill = await page.$(`.ttt-pill[data-square="${move.pill}"]`);
    const cell = await page.$(`.ttt-cell[data-square="${move.target}"]`);
    if (!pill || !cell) return;
    const p = await pill.boundingBox();
    const c = await cell.boundingBox();
    if (!p || !c) return;

    // The feedback line is rewritten on EVERY resolved attempt, so a change in
    // it is the reliable "the game accepted that move" signal.
    const before = await page.$eval('#ttt-feedback', e => e.textContent);

    await page.mouse.move(p.x + p.width / 2, p.y + p.height / 2);
    await page.mouse.down();
    await page.mouse.move(c.x + c.width / 2, c.y + c.height / 2, { steps: 8 });
    await page.mouse.up();

    // Short wait: an accepted move resolves quickly; a discarded one just loops
    // round and tries again, well inside the deadline.
    await page.waitForFunction(
      (prev) => document.querySelector('.ttt-win') ||
                document.getElementById('ttt-feedback')?.textContent !== prev,
      { timeout: 4000, polling: 60 }, before,
    ).catch(() => {});
  }
}

// Move pickers, evaluated in the page.
// Deliberately WRONG: drag one free square's pill onto a different free square.
const pickWrong = () => {
  const free = [...document.querySelectorAll('.ttt-cell')]
    .filter(c => !c.classList.contains('is-x') && !c.classList.contains('is-o'))
    .map(c => Number(c.dataset.square));
  return free.length >= 2 ? { pill: free[0], target: free[1] } : null;
};
// Correct: every pill's own square is its answer.
const pickCorrect = () => {
  const el = document.querySelector('.ttt-pill:not(.is-used)');
  if (!el) return null;
  const sq = Number(el.dataset.square);
  return { pill: sq, target: sq };
};

describe('UI — tic-tac-toe gameplay', () => {
  let browser, page;

  beforeAll(async () => {
    browser = await launchBrowser();
    page = await newSeededPage(browser, { grade_group: '4-6' });
    // Puppeteer's default 800x600 leaves the lower name pills BELOW the fold,
    // and page.mouse cannot reach an off-screen coordinate — drags on those
    // pills silently do nothing. Give the whole board and column room.
    await page.setViewport({ width: 1280, height: 900 });
    await page.goto(url(GAME), { waitUntil: 'networkidle2', timeout: 20000 });
    await settle(600);
  });

  afterAll(async () => { if (browser) await browser.close(); });

  test('first visit shows the instructions, with the demo above the written steps', async () => {
    await page.waitForSelector('.ttt-howto', { timeout: 5000 });

    // Order inside the card: icon, title, demo, then the steps.
    const order = await page.$$eval('.ttt-howto .ce-popup-card > *', els => els.map(e => e.className));
    const demoAt  = order.findIndex(c => c.includes('ttt-demo'));
    const titleAt = order.findIndex(c => c.includes('ce-popup-title'));
    const stepsAt = order.findIndex(c => c.includes('ce-popup-msg'));
    expect(demoAt).toBeGreaterThan(titleAt);
    expect(demoAt).toBeLessThan(stepsAt);

    // The mode picker must NOT be stacked underneath it yet.
    expect(await page.$('.ttt-mode')).toBeNull();
  });

  test('the mode picker follows, with both options as icon cards', async () => {
    await page.$$eval('.ttt-howto .ce-popup-btn', btns => btns[0].click());
    await page.waitForSelector('.ttt-mode', { timeout: 5000 });

    const labels = await page.$$eval('.ttt-mode .ce-popup-btn', b => b.map(x => x.textContent.trim()));
    expect(labels).toEqual(['Play against the computer', 'Two player game']);

    // Each card carries an icon above its label (the supplied reference art).
    const icons = await page.$$eval('.ttt-mode .ce-popup-btn-icon', i => i.map(x => x.getAttribute('src')));
    expect(icons).toHaveLength(2);
    expect(icons.every(s => /computer_mode|player_mode/.test(s))).toBe(true);
  });

  test('against the computer the child is addressed as "you"', async () => {
    await page.$$eval('.ttt-mode .ce-popup-btn', btns => btns[0].click());   // vs computer
    await settle(400);
    // "Your turn", never "You's turn" or "Player 1's turn".
    expect(await text(page, '#ttt-turn-text')).toBe('Your turn');
  });

  test('a real mouse drag onto the matching picture claims the square', async () => {
    // Whichever pill is first in the column — its own square is the right answer.
    const square = await page.$eval('.ttt-pill', el => Number(el.dataset.square));

    await dragPillToSquare(page, square);

    const cls = await page.$eval(`.ttt-cell[data-square="${square}"]`, el => el.className);
    expect(cls).toContain('is-x');

    // The pill is spent, and the feedback names the player in second person.
    const pillCls = await page.$eval(`.ttt-pill[data-square="${square}"]`, el => el.className);
    expect(pillCls).toContain('is-used');
    expect(await text(page, '#ttt-feedback')).toMatch(/^You claimed /);

    // No ghost may survive the drop — a leaked one would sit over the board
    // swallowing clicks.
    expect(await page.$('.ce-drag-ghost')).toBeNull();
  });

  test('the bot answers on its own turn without the player touching anything', async () => {
    // Bot delay is 700–1200ms plus a ~450ms move animation.
    await settle(2400);
    const marks = await page.$$eval('.ttt-cell', els =>
      els.filter(e => e.classList.contains('is-x') || e.classList.contains('is-o')).length);
    // It either claimed a square (correct) or missed and passed back — but the
    // turn must have resolved either way, never left stuck on "thinking".
    const turn = await text(page, '#ttt-turn-text');
    expect(turn).not.toBe('Rimau is thinking');
    expect(marks).toBeGreaterThanOrEqual(1);
  });

  test('a return visit skips the instructions and goes straight to the mode picker', async () => {
    // The "seen" flag was set by the first visit above, in this same origin.
    await page.goto(url(GAME), { waitUntil: 'networkidle2', timeout: 20000 });
    await settle(700);

    expect(await page.$('.ttt-howto')).toBeNull();
    expect(await page.$('.ttt-mode')).not.toBeNull();
    // …and the "?" button is still there to re-open them on demand.
    expect(await page.$('#ce-help-fab')).not.toBeNull();
  });
});

// Losing to the computer gets its own page and its own describe: it plays a
// whole game to completion, so sharing a page with the tests above would make
// it depend on whatever state they left behind.
describe('UI — tic-tac-toe, losing to the computer', () => {
  let browser, page;

  beforeAll(async () => {
    browser = await launchBrowser();
    page = await newSeededPage(browser, { grade_group: '4-6' });
    // Puppeteer's default 800x600 leaves the lower name pills BELOW the fold,
    // and page.mouse cannot reach an off-screen coordinate — drags on those
    // pills silently do nothing. Give the whole board and column room.
    await page.setViewport({ width: 1280, height: 900 });
    await page.goto(url(GAME), { waitUntil: 'networkidle2', timeout: 20000 });
    await settle(700);

    // First visit here, so the instructions are up; dismiss them, then pick the
    // computer. Tolerates either order in case the "seen" flag is already set.
    if (await page.$('.ttt-howto')) {
      await page.$$eval('.ttt-howto .ce-popup-btn', b => b[0].click());
      await settle(400);
    }
    await page.waitForSelector('.ttt-mode', { timeout: 8000 });
    await page.$$eval('.ttt-mode .ce-popup-btn', b => b[0].click());   // vs computer
    // Wait for the popup to actually leave the DOM (showPopup removes it 180ms
    // after the click). A fixed sleep here raced under load and the game loop
    // below would see the dying overlay and bail on its first iteration.
    await page.waitForFunction(() => !document.querySelector('.ce-popup-overlay'),
      { timeout: 8000, polling: 50 });
  });

  afterAll(async () => { if (browser) await browser.close(); });

  test('Rimau turns up to encourage the child', async () => {
    // Answer WRONG every turn. The child claims nothing, so the bot (accuracy
    // 0.72) builds a line unopposed — centre, a corner, then completes. It only
    // needs 3 successful claims, so it always gets there.
    await playUntilResult(page, pickWrong);

    await page.waitForSelector('.ttt-win--lost', { timeout: 10000 });

    expect(await page.$eval('.ttt-win .ce-popup-title', e => e.textContent.trim()))
      .toBe('The computer wins!');

    // Rimau is there, in the WAVE pose — happy/cheer are arms-up celebrations
    // and would read as gloating right after the child lost.
    const rimauSrc = await page.$eval('.ttt-rimau-fig .img-slot__img', e => e.getAttribute('src'));
    expect(rimauSrc).toContain('rimau_wave');

    // …saying something encouraging.
    const bubble = await page.$eval('.ttt-rimau-bubble', e => e.textContent.trim());
    expect(bubble.length).toBeGreaterThan(0);

    // No confetti for a loss.
    expect(await page.$('.confetti-piece')).toBeNull();

    // Both ways out are still offered.
    const btns = await page.$$eval('.ttt-win .ce-popup-btn', b => b.map(x => x.textContent.trim()));
    expect(btns).toEqual(['Play again', 'Back to Activities']);
  });

  test('a two-player result never shows Rimau — he is for losing to the computer', async () => {
    // Its own game from a clean load, so this does not depend on how the test
    // above finished. Two-player mode can never trigger Rimau: the loser there
    // is another child at the same tablet.
    await page.goto(url(GAME), { waitUntil: 'networkidle2', timeout: 20000 });
    await page.waitForSelector('.ttt-mode', { timeout: 8000 });
    await page.$$eval('.ttt-mode .ce-popup-btn', b => b[1].click());   // two-player
    await page.waitForFunction(() => !document.querySelector('.ce-popup-overlay'),
      { timeout: 8000, polling: 50 });

    // Match correctly every turn. Claims alternate X, O, X … so the game ends
    // in a win for one of them or a full-board draw — either way a result popup
    // lands, and neither may carry Rimau.
    await playUntilResult(page, pickCorrect, { deadlineMs: 30000 });

    await page.waitForSelector('.ttt-win', { timeout: 10000 });
    expect(await page.$('.ttt-rimau')).toBeNull();
    expect(await page.$('.ttt-win--lost')).toBeNull();
  });
});
