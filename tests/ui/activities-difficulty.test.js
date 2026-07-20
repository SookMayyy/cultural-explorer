// tests/ui/activities-difficulty.test.js
// The Activity Hub menu changes with the difficulty level.
//
// Slot 2 swaps by level: Explorer plays Drag & Match, Adventurer gets Cultural
// Tic-Tac-Toe INSTEAD (a replacement, not a fifth card). The difficulty chip
// re-paints itself WITHOUT reloading the page, so activities.js has to rebuild
// the grid from the chip's onChange — if someone ever inlines that build back to
// module top level the swap silently stops happening until a manual refresh.
// This is the guard for exactly that.

const { url, launchBrowser, newSeededPage, settle } = require('./helpers');

const CARD_SEL = '#act-grid .act-card';
const TTT_HREF = 'tictactoe.html?from=activities';

// Grade group 4-6 defaults to Adventurer AND is allowed to switch levels.
const ADVENTURER = { grade_group: '4-6' };

const labels = page => page.$$eval(CARD_SEL, els =>
  els.map(el => el.querySelector('.act-card-label')?.textContent.trim()));

const hrefs = page => page.$$eval(CARD_SEL, els => els.map(el => el.getAttribute('href')));

// Click the segment whose data-level matches; returns false if it isn't there.
const pickLevel = (page, level) => page.evaluate(l => {
  const btn = document.querySelector(`.diff-opt[data-level="${l}"]`);
  if (!btn) return false;
  btn.click();
  return true;
}, level);

describe('UI — Activity Hub difficulty gating', () => {
  let browser;

  beforeAll(async () => { browser = await launchBrowser(); });
  afterAll(async () => { if (browser) await browser.close(); });

  test('Tic-Tac-Toe replaces Drag & Match at Adventurer, and swaps back', async () => {
    const page = await newSeededPage(browser, ADVENTURER);
    await page.goto(url('activities.html'), { waitUntil: 'networkidle2', timeout: 20000 });
    await settle(400);

    // Defaults to Adventurer for this grade group → slot 2 is Tic-Tac-Toe.
    expect(await labels(page)).toEqual(
      ['Word Scramble', 'Cultural Tic-Tac-Toe', 'Quiz', 'Guess the State']);
    expect(await hrefs(page)).toContain(TTT_HREF);

    // Switching down must rebuild the grid in place — no reload — and put Drag
    // & Match back in the SAME slot rather than appending it.
    expect(await pickLevel(page, 'explorer')).toBe(true);
    await settle(300);
    expect(await labels(page)).toEqual(
      ['Word Scramble', 'Drag & Match', 'Quiz', 'Guess the State']);

    // …and switching back swaps it again.
    expect(await pickLevel(page, 'adventurer')).toBe(true);
    await settle(300);
    expect(await labels(page)).toEqual(
      ['Word Scramble', 'Cultural Tic-Tac-Toe', 'Quiz', 'Guess the State']);

    await page.close();
  });

  test('Grade 1-3 is locked to Explorer and always gets Drag & Match', async () => {
    const page = await newSeededPage(browser, { grade_group: '1-3' });
    await page.goto(url('activities.html'), { waitUntil: 'networkidle2', timeout: 20000 });
    await settle(400);

    expect(await labels(page)).toContain('Drag & Match');
    expect(await labels(page)).not.toContain('Cultural Tic-Tac-Toe');
    // No segmented control at all for this cohort — just the locked badge.
    expect(await page.$('.diff-chip--locked')).not.toBeNull();
    expect(await page.$('.diff-opt')).toBeNull();

    await page.close();
  });
});
