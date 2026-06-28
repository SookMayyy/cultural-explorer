// tests/fr3-minigames.test.js
// FR3 — Mini-games: the CONTENT CONTRACT for all three games (CLAUDE.md §3 "FR3 — Mini-Games").
//
//   npx jest tests/fr3-minigames.test.js
//
// Why this is a *data* suite, not an API suite:
//   • MCQ  has a backend (quiz_questions) — its delivery + scoring are tested in
//     tests/fr3-quiz.test.js. Here we check the source MCQ bank shape (incl. the
//     difficulty variety the "adaptive" rule needs).
//   • Drag-Match (states.js `dragPairs`) and Guess-the-State (guessRounds.js
//     `GUESS_ROUNDS`) have NO backend endpoint — they run entirely client-side from the
//     frontend data modules. The only way to verify their FR3 contract is against that
//     source of truth, which is exactly what the screens read.
//
// The frontend data files use ESM `export const`. Jest (CJS, no --experimental-vm-modules)
// can't dynamic-import them, so we load them the way scripts/seed-content.mjs does:
// copy to `.mjs` twins and import them in a child `node` process, then assert on the JSON.
//
// FR3 spec (CLAUDE.md):
//   MCQ            — 4 questions, 4 options each; +10 + explanation; adaptive (harder after
//                    2 consecutive correct → needs >1 difficulty in the bank).
//   Drag-Match     — 3–4 pairs per state; tap chip → tap drop zone.
//   Guess-the-State— progressive clues; earlier correct = more points (descending values).
//
// ✅ Spec/data reconciled: Guess-the-State now ships 4 progressive clues worth
//   +20/15/10/5 and 5 answer options. Clues unlock as the player guesses wrong
//   (keep-trying mechanic in guess.js). This suite locks the data contract in.

const fs   = require('node:fs');
const os   = require('node:os');
const path = require('node:path');
const { pathToFileURL }  = require('node:url');
const { execFileSync }   = require('node:child_process');

const STATE_IDS = ['penang', 'melaka', 'selangor', 'johor', 'kelantan', 'sabah', 'sarawak'];

let STATES_DATA, QUIZ_QUESTIONS, GUESS_ROUNDS;

beforeAll(() => {
  const dataDir = path.join(__dirname, '..', 'src', 'js', 'data');
  const tmp     = fs.mkdtempSync(path.join(os.tmpdir(), 'ce-fr3-'));
  const twinUrl = (file) => {
    const t = path.join(tmp, file.replace(/\.js$/, '.mjs'));
    fs.copyFileSync(path.join(dataDir, file), t);
    return pathToFileURL(t).href;
  };
  const code = `
    const s = await import(${JSON.stringify(twinUrl('states.js'))});
    const q = await import(${JSON.stringify(twinUrl('quizzes.js'))});
    const g = await import(${JSON.stringify(twinUrl('guessRounds.js'))});
    process.stdout.write(JSON.stringify({
      STATES_DATA:    s.STATES_DATA,
      QUIZ_QUESTIONS: q.QUIZ_QUESTIONS,
      GUESS_ROUNDS:   g.GUESS_ROUNDS,
    }));
  `;
  const out = execFileSync(process.execPath, ['--input-type=module', '-e', code], { encoding: 'utf8' });
  ({ STATES_DATA, QUIZ_QUESTIONS, GUESS_ROUNDS } = JSON.parse(out));
});

// ── Mini-game 1: MCQ quiz bank ──────────────────────────────────────────────────
describe('FR3 — MCQ quiz bank (source content)', () => {
  test('every question has a valid state, 4 options, an in-range answer, and an explanation', () => {
    expect(QUIZ_QUESTIONS.length).toBeGreaterThan(0);
    for (const q of QUIZ_QUESTIONS) {
      expect(STATE_IDS).toContain(q.stateId);
      expect(typeof q.q).toBe('string');
      expect(q.q.length).toBeGreaterThan(0);
      expect(Array.isArray(q.opts)).toBe(true);
      expect(q.opts).toHaveLength(4);
      q.opts.forEach(o => { expect(typeof o).toBe('string'); expect(o.length).toBeGreaterThan(0); });
      expect(Number.isInteger(q.ans)).toBe(true);
      expect(q.ans).toBeGreaterThanOrEqual(0);
      expect(q.ans).toBeLessThanOrEqual(3);
      expect(typeof q.explain).toBe('string');
      expect(q.explain.length).toBeGreaterThan(0);
    }
  });

  test('the bank carries more than one difficulty so "adaptive" can step up', () => {
    const diffs = new Set(QUIZ_QUESTIONS.map(q => q.difficulty));
    expect(diffs.has('easy')).toBe(true);
    expect(diffs.has('medium') || diffs.has('hard')).toBe(true);
    diffs.forEach(d => expect(['easy', 'medium', 'hard']).toContain(d));
  });

  test('every state has at least one MCQ (bank + its inline quizQuestion)', () => {
    for (const id of STATE_IDS) {
      const fromBank   = QUIZ_QUESTIONS.some(q => q.stateId === id);
      const state      = STATES_DATA.find(s => s.id === id);
      const fromInline = !!(state && state.quizQuestion);
      expect(fromBank || fromInline).toBe(true);
    }
  });

  test("each state's inline quizQuestion is well-formed (q, 4 opts, in-range ans, explain)", () => {
    for (const s of STATES_DATA) {
      const qq = s.quizQuestion;
      expect(qq).toBeTruthy();
      expect(qq.opts).toHaveLength(4);
      expect(qq.ans).toBeGreaterThanOrEqual(0);
      expect(qq.ans).toBeLessThanOrEqual(3);
      expect(qq.explain.length).toBeGreaterThan(0);
    }
  });
});

// ── Mini-game 2: Drag-Match ─────────────────────────────────────────────────────
describe('FR3 — Drag-Match pairs (states.js dragPairs)', () => {
  test('every state ships 3–4 match pairs', () => {
    for (const s of STATES_DATA) {
      expect(Array.isArray(s.dragPairs)).toBe(true);
      expect(s.dragPairs.length).toBeGreaterThanOrEqual(3);
      expect(s.dragPairs.length).toBeLessThanOrEqual(4);
    }
  });

  test('each pair has a non-empty chip + drop-zone label', () => {
    for (const s of STATES_DATA) {
      for (const p of s.dragPairs) {
        expect(typeof p.food).toBe('string');
        expect(p.food.length).toBeGreaterThan(0);
        expect(typeof p.state).toBe('string');
        expect(p.state.length).toBeGreaterThan(0);
      }
    }
  });

  test('drop-zone labels within a state are distinct (matching stays unambiguous)', () => {
    for (const s of STATES_DATA) {
      const labels = s.dragPairs.map(p => p.state);
      expect(new Set(labels).size).toBe(labels.length);
    }
  });
});

// ── Mini-game 3: Guess the State ────────────────────────────────────────────────
describe('FR3 — Guess the State (guessRounds.js)', () => {
  test('there is a round per state set, each answering a real state', () => {
    expect(GUESS_ROUNDS.length).toBeGreaterThanOrEqual(1);
    for (const r of GUESS_ROUNDS) {
      expect(STATE_IDS).toContain(r.answer);
    }
  });

  test('clues are progressive and worth descending points (early correct = more points)', () => {
    // RECONCILED: data now matches CLAUDE.md FR3 — 4 progressive clues worth
    // +20/15/10/5. Clues reveal as the player guesses wrong (keep-trying, in guess.js).
    for (const r of GUESS_ROUNDS) {
      expect(Array.isArray(r.hints)).toBe(true);
      expect(r.hints).toHaveLength(4);
      r.hints.forEach(h => { expect(typeof h).toBe('string'); expect(h.length).toBeGreaterThan(0); });

      expect(r.pointValues).toEqual([20, 15, 10, 5]);
      expect(r.pointValues).toHaveLength(r.hints.length);   // one value per clue
      for (let i = 1; i < r.pointValues.length; i++) {
        expect(r.pointValues[i]).toBeLessThan(r.pointValues[i - 1]); // strictly descending
      }
    }
  });

  test('options include the correct answer and only valid states, each with id/name/icon', () => {
    for (const r of GUESS_ROUNDS) {
      expect(Array.isArray(r.options)).toBe(true);
      expect(r.options.length).toBeGreaterThanOrEqual(2);
      const ids = r.options.map(o => o.id);
      expect(ids).toContain(r.answer);                       // the answer must be choosable
      r.options.forEach(o => {
        expect(STATE_IDS).toContain(o.id);
        expect(typeof o.name).toBe('string');
        expect(o.name.length).toBeGreaterThan(0);
        expect(typeof o.icon).toBe('string');
        expect(o.icon.length).toBeGreaterThan(0);
      });
    }
  });
});
