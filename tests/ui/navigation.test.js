// tests/ui/navigation.test.js
// Where each mini-game's back button and finish CTA point.
//
// The four mini-games are reachable from three places and must lead back to the
// right one (utils/launchContext.js). The differences are subtle and easy to
// "tidy" into a bug — e.g. guess.html's hub back has NO ?state=, while quiz's
// does — so every target is pinned here.

const { url, launchBrowser, newSeededPage, settle } = require('./helpers');

// [page, selector, attribute, expected]
const CASES = [
  // quiz.js
  ['quiz.html?state=kedah',                              '.topbar-back', 'href', 'narrative.html?state=kedah'],
  ['quiz.html?state=kedah&from=activities',              '.topbar-back', 'href', 'activities.html?state=kedah'],
  ['quiz.html?state=penang&from=mission&mission=festival','.topbar-back', 'href', 'missions.html?state=penang'],

  // scramble.js — journey finish continues to Drag-Match
  ['scramble.html?state=kedah',                          '.topbar-back', 'href', 'narrative.html?state=kedah'],
  ['scramble.html?state=kedah',                          '#scr-next',    'href', 'activity.html?state=kedah'],
  ['scramble.html?state=kedah&from=activities',          '.topbar-back', 'href', 'activities.html?state=kedah'],
  ['scramble.html?state=kedah&from=activities',          '#scr-next',    'href', 'activities.html?state=kedah'],
  ['scramble.html?state=kedah&from=mission&mission=dancer','.topbar-back','href', 'missions.html?state=kedah'],
  ['scramble.html?state=kedah&from=mission&mission=dancer','#scr-next',  'href', 'mission.html?state=kedah&mission=dancer&stage=reward'],

  // activity.js — the back pill changes label as well as target
  ['activity.html?state=penang',                         '#act-back', 'href', 'narrative.html?state=penang'],
  ['activity.html?state=penang&from=activities',         '#act-back', 'href', 'activities.html?state=penang'],
  ['activity.html?state=penang&from=activities',         '#act-back', 'text', '🎮 BACK TO ACTIVITIES'],
  ['activity.html?state=penang&from=mission&mission=chef','#act-back','href', 'missions.html?state=penang'],
  ['activity.html?state=penang&from=mission&mission=chef','#act-back','text', '🏰 BACK TO MISSIONS'],

  // guess.js — hub back drops ?state=; journey back goes to the drag-match
  ['guess.html?state=kedah',                             '.topbar-back', 'href', 'activity.html?state=kedah'],
  ['guess.html?state=kedah&from=activities',             '.topbar-back', 'href', 'activities.html'],
  ['guess.html?state=kedah&from=mission&mission=tourist', '.topbar-back', 'href', 'missions.html?state=kedah'],

  // mission.js
  ['mission.html?state=kedah&mission=chef',              '.topbar-back', 'href', 'missions.html?state=kedah'],
];

describe('UI — mini-game navigation targets', () => {
  let browser, page;

  beforeAll(async () => {
    browser = await launchBrowser();
    page = await newSeededPage(browser);
  });

  afterAll(async () => { if (browser) await browser.close(); });

  test.each(CASES)('%s → %s[%s]', async (href, sel, attr, want) => {
    await page.goto(url(href), { waitUntil: 'networkidle2', timeout: 20000 });
    await settle(300);
    const got = await page.evaluate(({ sel, attr }) => {
      const el = document.querySelector(sel);
      if (!el) return '<<element not found>>';
      return attr === 'text' ? el.textContent.trim() : el.getAttribute(attr);
    }, { sel, attr });
    expect(got).toBe(want);
  });
});
