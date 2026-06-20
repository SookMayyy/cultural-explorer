// tests/fr4-mascot.test.js
// FR4 — Mascot system: the backend-observable half (which mascot speaks + the dialogue
// the screens read). Animation, TypewriterBubble, Web Audio and voiceover are frontend.
//
//   npx jest tests/fr4-mascot.test.js
//
// FR4 contract (CLAUDE.md §3):
//   • Two characters — Rimau (tiger, West) / Wak (hornbill, East); the ACTIVE mascot is
//     determined by `states.mascot`.
//   • Entry dialogue uses a 3-sentence formula (Hook → Bridge → CTA).
//   • First-visit vs return-visit branching (entry_first vs entry_return).
//   • A locked-state line (entry_locked) for gated states.
//
// Mascot dialogue is public (no auth). Requires `npm run seed`.

const request = require('supertest');
const app  = require('../server');
const pool = require('../db/connection');

const api = request(app);

const DIALOGUE_FIELDS = [
  'entry_first', 'entry_return', 'entry_locked',
  'challenge_frame', 'feedback_correct', 'feedback_wrong', 'reward_outro',
];

afterAll(async () => { await pool.pool.end(); });

describe('FR4 — Active mascot is chosen by region', () => {
  let states;
  test('GET /api/states exposes a mascot for every state', async () => {
    const res = await api.get('/api/states');
    expect(res.status).toBe(200);
    states = res.body.data;
    expect(states.length).toBe(7);
  });

  test('West states ride Rimau, East states ride Wak', () => {
    for (const s of states) {
      expect(['rimau', 'wak']).toContain(s.mascot);
      expect(s.mascot).toBe(s.region === 'east' ? 'wak' : 'rimau');
    }
    // Both mascots are actually represented in the catalogue.
    const mascots = new Set(states.map(s => s.mascot));
    expect(mascots.has('rimau')).toBe(true);
    expect(mascots.has('wak')).toBe(true);
  });
});

describe('FR4 — Per-state dialogue set', () => {
  test('every state ships a complete, non-empty dialogue set', async () => {
    for (let id = 1; id <= 7; id++) {
      const { state_dialogue } = (await api.get(`/api/states/${id}`)).body.data;
      expect(state_dialogue).toBeTruthy();
      for (const f of DIALOGUE_FIELDS) {
        expect(typeof state_dialogue[f]).toBe('string');
        expect(state_dialogue[f].length).toBeGreaterThan(0);
      }
    }
  });

  test('entry_first follows the 3-sentence Hook→Bridge→CTA formula', async () => {
    const { state_dialogue } = (await api.get('/api/states/1')).body.data;
    // At least three sentence-ending marks → at least three sentences.
    const sentences = (state_dialogue.entry_first.match(/[.!?]/g) || []).length;
    expect(sentences).toBeGreaterThanOrEqual(3);
  });

  test('entry_first names the correct mascot for the region', async () => {
    for (let id = 1; id <= 7; id++) {
      const s = (await api.get(`/api/states/${id}`)).body.data;
      const mascotName = s.mascot === 'wak' ? 'Wak' : 'Rimau';
      expect(s.state_dialogue.entry_first).toContain(mascotName);
    }
  });

  test('first-visit and return-visit lines are both present and distinct', async () => {
    // BY DESIGN the backend does not detect first vs return — the app simply plays the
    // entry dialogue whenever a student opens a state after logging in, so no visit
    // tracking is needed (user_progress.visits / first_visited stay unused). Both lines
    // are kept in the data so return-branching can be turned on later without a migration.
    for (let id = 1; id <= 7; id++) {
      const { state_dialogue: d } = (await api.get(`/api/states/${id}`)).body.data;
      expect(d.entry_first).not.toBe(d.entry_return);
    }
  });

  test('East-Malaysia (gated) states carry a locked-entry line', async () => {
    for (const id of [6, 7]) {           // Sabah, Sarawak
      const s = (await api.get(`/api/states/${id}`)).body.data;
      expect(s.is_locked_default).toBe(true);
      expect(s.state_dialogue.entry_locked.length).toBeGreaterThan(0);
    }
  });
});
