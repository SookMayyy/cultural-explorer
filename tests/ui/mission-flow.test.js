// tests/ui/mission-flow.test.js
// A child's actual path through a mission: Discover → Play → Reward.
//
// Covers the pieces the backend suite can't see — the spotlight's 3-tap rule,
// keyword highlighting, the cook game's scoring, and the flat 25-point award
// that makes a fully-explored state worth exactly 100.

const { url, launchBrowser, newSeededPage, settle } = require('./helpers');

const MISSION_BONUS = 25;

// A fake narration layer whose lines finish after ~60ms. Lets us test with voice
// genuinely ON (not muted) but without waiting on real narration — the only way
// to observe the gates that hold the UI back *while a line is playing*.
// Two paths must both be sped up: `voice.js` plays a recorded **MP3** (`new Audio`)
// when a clip exists for the line (they now do — see js/data/voClips.js), and
// falls back to the **Web Speech API** otherwise. Headless Chrome ships no TTS
// voices and would not really play the MP3 either, so without these stubs the real
// code would sit on its 8s safety timers and the suite would crawl.
// `speechSynthesis`/`Audio` are read-only on Window — a plain assignment silently
// does nothing, so they must be installed with defineProperty.
const FAST_TTS = () => {
  Object.defineProperty(window, 'SpeechSynthesisUtterance', {
    configurable: true,
    value: function (text) { this.text = text; },
  });
  Object.defineProperty(window, 'speechSynthesis', {
    configurable: true,
    value: {
      speak(u) { setTimeout(() => u.onend && u.onend(), 60); },
      cancel() {},
      getVoices() { return []; },
    },
  });
  // Fake <audio>: any clip "ends" after ~60ms so recorded MP3 narration is as fast
  // as the TTS stub. Tolerates the property writes voice.js/music.js make (volume,
  // loop, currentTime …) since instances take arbitrary assignments.
  Object.defineProperty(window, 'Audio', {
    configurable: true,
    value: class FakeAudio {
      constructor(src) { this.src = src; this._h = {}; }
      addEventListener(ev, cb) { this._h[ev] = cb; }
      removeEventListener(ev) { delete this._h[ev]; }
      play() { setTimeout(() => this._h.ended && this._h.ended(), 60); return Promise.resolve(); }
      pause() {}
      load() {}
    },
  });
};

describe('UI — mission flow (Kedah, Help the Chef)', () => {
  let browser, page;

  beforeAll(async () => {
    browser = await launchBrowser();
    page = await newSeededPage(browser);
  });

  afterAll(async () => { if (browser) await browser.close(); });

  test('spotlight highlights the keyword in its caption', async () => {
    await page.goto(url('mission.html?state=kedah&mission=chef'), { waitUntil: 'networkidle2' });
    await settle(800);

    const caption = await page.evaluate(() => document.getElementById('mn-spot-caption')?.textContent || '');
    expect(caption.length).toBeGreaterThan(0);

    const marks = await page.evaluate(() => {
      document.querySelector('.mn-spot-dot')?.click();
      return document.querySelectorAll('#mn-spot-caption mark.mn-spot-key').length;
    });
    expect(marks).toBeGreaterThanOrEqual(1);
  });

  test('the 3-tap rule gates Continue, then opens the cook game', async () => {
    await page.goto(url('mission.html?state=kedah&mission=chef'), { waitUntil: 'networkidle2' });
    await settle(800);

    expect(await page.evaluate(() => document.getElementById('mn-spot-continue')?.disabled)).toBe(true);

    // renderSpots() rebuilds the dots after each tap, so re-query every time.
    const enabled = await page.evaluate(async () => {
      const sleep = ms => new Promise(r => setTimeout(r, ms));
      for (let i = 0; i < 8; i++) {
        const dot = document.querySelector('.mn-spot-dot.is-active');
        if (!dot) break;
        dot.click();
        await sleep(150);
      }
      return !document.getElementById('mn-spot-continue').disabled;
    });
    expect(enabled).toBe(true);

    await page.evaluate(() => document.getElementById('mn-spot-continue').click());
    await settle(700);

    const tray = await page.evaluate(() => {
      const btns = [...document.querySelectorAll('.mn-ingredient')];
      return { total: btns.length, correct: btns.filter(b => b.dataset.ok === 'true').length };
    });
    expect(tray.total).toBeGreaterThan(0);
    expect(tray.correct).toBeGreaterThan(0);
  });

  test('a wrong ingredient bounces back instead of going in the pot', async () => {
    const res = await page.evaluate(() => {
      const bad = document.querySelector('.mn-ingredient[data-ok="false"]');
      if (!bad) return { skipped: true };
      bad.click();
      return { skipped: false, isWrong: bad.classList.contains('is-wrong'), added: bad.classList.contains('is-added') };
    });
    if (res.skipped) return; // difficulty may show no distractors
    expect(res.isWrong).toBe(true);
    expect(res.added).toBe(false);
  });

  test.each([
    ['kedah',  'chef'],
    ['kedah',  'dancer'],
    ['penang', 'dancer'],
  ])('Continue stays locked until the "Now you know…" line is heard (%s/%s)', async (st, mission) => {
    const page = await browser.newPage();
    // Voice must be ON for this one. localStorage is shared across pages in the
    // same browser, so the other tests' `ce_voice='0'` would otherwise leak in
    // here and make every line finish instantly — hiding the very gate under test.
    await page.evaluateOnNewDocument(() => {
      localStorage.setItem('ce_session', JSON.stringify({
        type: 'guest', displayName: 'Gate Check', grade_group: '3-4', avatarId: 0, points: 0,
      }));
      localStorage.removeItem('ce_voice');
      localStorage.removeItem('ce_sfx');   // the master mute also silences narration
    });
    await page.evaluateOnNewDocument(FAST_TTS);
    await page.goto(url(`mission.html?state=${st}&mission=${mission}`), { waitUntil: 'networkidle2' });
    await settle(500);

    // Tap every hotspot. Each line must finish before the next number unlocks,
    // so poll for the next active dot rather than assuming it is there.
    const atLastTap = await page.evaluate(async () => {
      const sleep = ms => new Promise(r => setTimeout(r, ms));
      const total = document.querySelectorAll('.mn-spot-dot').length;
      let taps = 0;
      while (taps < total) {
        let dot = null;
        for (let w = 0; w < 40 && !dot; w++) {
          dot = document.querySelector('.mn-spot-dot.is-active');
          if (!dot) await sleep(25);
        }
        if (!dot) break;              // gave up waiting for the next number
        dot.click();
        taps++;
        await sleep(5);
      }
      // Read the button the instant the final line starts playing.
      return { total, taps, disabled: document.getElementById('mn-spot-continue').disabled };
    });

    // Must actually have reached the LAST hotspot, or the assertion below would
    // pass for the wrong reason (mid-run, Continue is trivially disabled).
    expect(atLastTap.total).toBeGreaterThan(0);
    expect(atLastTap.taps).toBe(atLastTap.total);
    // The rule: the last tap must NOT open the gate — the takeaway hasn't played.
    expect(atLastTap.disabled).toBe(true);

    // Once the last line and then the transition have been heard, it opens.
    await page.waitForFunction(
      () => !document.getElementById('mn-spot-continue').disabled,
      { timeout: 20000 },
    );

    const after = await page.evaluate(() => ({
      caption: document.getElementById('mn-spot-caption').textContent.trim(),
      ready: document.getElementById('mn-spot-continue').classList.contains('mn-btn-ready'),
    }));

    // It opened *with the takeaway on screen* — never before it.
    expect(after.caption.toLowerCase()).toContain('now you know');
    expect(after.ready).toBe(true);

    await page.close();
  });

  test('finishing the dish shows the reward and awards a flat 25 points', async () => {
    await page.evaluate(() =>
      document.querySelectorAll('.mn-ingredient[data-ok="true"]').forEach(b => b.click()));
    await settle(1400);

    const reward = await page.evaluate(() => {
      const el = document.getElementById('mn-reward-pts');
      // flyPoints() appends its floating label inside the badge — read the
      // badge's own text nodes, not the whole subtree.
      const own = [...(el?.childNodes || [])]
        .filter(n => n.nodeType === Node.TEXT_NODE).map(n => n.textContent).join('').trim();
      return {
        visible: !document.getElementById('stage-reward')?.classList.contains('hidden'),
        badge: own,
        stored: Object.entries(localStorage).find(([k]) => k.startsWith('ce_points__'))?.[1],
      };
    });

    expect(reward.visible).toBe(true);
    expect(reward.badge).toBe(`+${MISSION_BONUS} ⭐`);
    expect(reward.stored).toBe(String(MISSION_BONUS));
  });
});
