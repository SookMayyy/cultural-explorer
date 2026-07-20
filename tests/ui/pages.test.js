// tests/ui/pages.test.js
// Every screen loads and its ES module runs without throwing.
//
//   npm run test:ui
//
// This is the cheapest guard there is: a broken import path, a renamed export,
// or a typo in a page script fails here instead of in front of a child.

const { url, launchBrowser, newSeededPage, collectErrors, settle } = require('./helpers');

// Each page with the query params it is really reached with in the app.
const PAGES = [
  ['map',                    'map.html'],
  ['mission hub',            'missions.html?state=kedah'],
  ['mission — chef',         'mission.html?state=kedah&mission=chef'],
  ['mission — tourist',      'mission.html?state=kedah&mission=tourist'],
  ['mission — festival',     'mission.html?state=penang&mission=festival'],
  ['mission — dancer',       'mission.html?state=kedah&mission=dancer'],
  ['mission — reward stage', 'mission.html?state=kedah&mission=chef&stage=reward'],
  ['quiz — journey',         'quiz.html?state=kedah'],
  ['quiz — from mission',    'quiz.html?state=penang&from=mission&mission=festival'],
  ['quiz — from hub',        'quiz.html?state=kedah&from=activities'],
  ['guess — journey',        'guess.html?state=kedah'],
  ['guess — from mission',   'guess.html?state=kedah&from=mission&mission=tourist'],
  ['guess — standalone',     'guess.html'],
  ['activity — journey',     'activity.html?state=penang'],
  ['activity — from mission','activity.html?state=penang&from=mission&mission=chef'],
  ['scramble — journey',     'scramble.html?state=kedah'],
  ['scramble — from mission','scramble.html?state=kedah&from=mission&mission=dancer'],
  ['activities hub',         'activities.html?state=kedah'],
  // Not gated on difficulty — the Activity Hub card is the gate, so a direct
  // load works at any level and needs no seeded difficulty here.
  ['tic-tac-toe',            'tictactoe.html?from=activities'],
  ['narrative',              'narrative.html?state=kedah'],
  ['stampbook',              'stampbook.html'],
  ['avatar shop',            'avatar.html'],
  ['settings',               'settings.html'],
  ['dashboard',              'dashboard.html'],
  ['reward',                 'reward.html?state=kedah&stamp=1&earned=25&score=4&total=4&from=mission'],
];

describe('UI — every screen loads without script errors', () => {
  let browser, page;

  beforeAll(async () => {
    browser = await launchBrowser();
    page = await newSeededPage(browser);
  });

  afterAll(async () => { if (browser) await browser.close(); });

  test.each(PAGES)('%s', async (_name, href) => {
    const errors = await collectErrors(page, async () => {
      await page.goto(url(href), { waitUntil: 'networkidle2', timeout: 20000 });
      await settle(600);
    });
    expect(errors).toEqual([]);
  });
});
