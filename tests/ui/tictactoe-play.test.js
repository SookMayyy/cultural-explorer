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

describe('UI — tic-tac-toe gameplay', () => {
  let browser, page;

  beforeAll(async () => {
    browser = await launchBrowser();
    page = await newSeededPage(browser, { grade_group: '4-6' });
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
