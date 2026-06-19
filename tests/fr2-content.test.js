// tests/fr2-content.test.js
// FR2 — Cultural content: the per-state record + content cards the narrative screen reads.
// Standalone suite (own throwaway user + cleanup) so it can be run on its own:
//
//   npx jest tests/fr2-content.test.js
//
// FR2 contract (what a state's cultural content must expose):
//   • state name + flag + intro story + theme colour
//   • content cards: food, landmark, tradition (festival/heritage/etc.), dialect word
//   • a fun fact on at least one card
//   • mascot dialogue for the state
//   • traditional costume — served via the costume catalogue (the costumes shop),
//     not as a per-state card. Verified here as a bridge to FR6.
//
// Requires `npm run seed` to have populated cultural_content / state_dialogue / states.story.

const request = require('supertest');
const app  = require('../server');
const pool = require('../db/connection');

const rnd  = () => Array.from({ length: 8 }, () => String.fromCharCode(97 + Math.floor(Math.random() * 26))).join('');
const NAME = `Cardfr${rnd()}`.slice(0, 20); // letters only — validator forbids digits

const agent = request.agent(app);
let userId;

const ALLOWED_TYPES = ['food', 'landmark', 'tradition', 'dialect', 'costume'];
const typesOf = (cards) => cards.map(c => c.card_type);

beforeAll(async () => {
  // Content endpoints are public, but the costume catalogue needs a session.
  const reg = await agent.post('/api/auth/register').send({
    display_name: NAME, grade_group: '3-4', password: 'pass123', icon_key_1: 2, icon_key_2: 8,
  });
  expect(reg.status).toBe(201);
  userId = (await agent.get('/api/auth/me')).body.user.id;
});

afterAll(async () => {
  if (userId) {
    await pool.execute('DELETE FROM user_costumes WHERE user_id = ?', [userId]);
    await pool.execute('DELETE FROM user_progress WHERE user_id = ?', [userId]);
    await pool.execute('DELETE FROM users          WHERE id = ?',      [userId]);
  }
  await pool.pool.end();
});

describe('FR2 — State record (name, flag, story, colour)', () => {
  let penang;
  test('GET /api/states/1 returns the state record', async () => {
    const res = await agent.get('/api/states/1');
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    penang = res.body.data;
  });

  test('exposes a non-empty name', () => {
    expect(typeof penang.name).toBe('string');
    expect(penang.name.length).toBeGreaterThan(0);
  });

  test('exposes a flag image file', () => {
    expect(typeof penang.flag_file).toBe('string');
    expect(penang.flag_file).toMatch(/\.png$/);
  });

  test('exposes an intro story (seeded from frontend content)', () => {
    expect(typeof penang.story).toBe('string');
    expect(penang.story.length).toBeGreaterThan(50); // real narrative, not a stub
  });

  test('exposes a theme colour and region', () => {
    expect(penang.color_hex).toMatch(/^#[0-9A-Fa-f]{6}$/);
    expect(['west', 'east']).toContain(penang.region);
  });
});

describe('FR2 — Content cards (food, landmark, tradition, dialect, fun fact)', () => {
  let cards;
  beforeAll(async () => {
    cards = (await agent.get('/api/states/1')).body.data.cultural_content;
  });

  test('Penang has at least 4 content cards', () => {
    expect(Array.isArray(cards)).toBe(true);
    expect(cards.length).toBeGreaterThanOrEqual(4);
  });

  test('covers food, landmark, tradition and dialect card types', () => {
    const types = typesOf(cards);
    ['food', 'landmark', 'tradition', 'dialect'].forEach(t => expect(types).toContain(t));
  });

  test('every card uses an allowed card_type and has a title + body', () => {
    for (const c of cards) {
      expect(ALLOWED_TYPES).toContain(c.card_type);
      expect(typeof c.title).toBe('string');
      expect(c.title.length).toBeGreaterThan(0);
      expect(typeof c.body_text).toBe('string');
      expect(c.body_text.length).toBeGreaterThan(0);
    }
  });

  test('at least one card carries a fun fact', () => {
    expect(cards.some(c => c.fun_fact && c.fun_fact.trim().length > 0)).toBe(true);
  });

  test('the dialect card encodes one dialect word + its meaning', () => {
    const dialect = cards.find(c => c.card_type === 'dialect');
    expect(dialect).toBeTruthy();
    expect(dialect.title.length).toBeGreaterThan(0);       // the word itself
    expect(dialect.body_text.toLowerCase()).toContain('means');
  });
});

describe('FR2 — Mascot dialogue', () => {
  test('state_dialogue is present with a non-empty first-entry line', async () => {
    const { state_dialogue } = (await agent.get('/api/states/1')).body.data;
    expect(state_dialogue).toBeTruthy();
    expect(typeof state_dialogue.entry_first).toBe('string');
    expect(state_dialogue.entry_first.length).toBeGreaterThan(0);
  });
});

describe('FR2 — Content coverage across all 7 states', () => {
  test('every state has a story, ≥4 cards incl. a dialect card, and dialogue', async () => {
    const seenTypes = new Set();
    for (let id = 1; id <= 7; id++) {
      const res = await agent.get(`/api/states/${id}`);
      expect(res.status).toBe(200);
      const s = res.body.data;

      expect(typeof s.story).toBe('string');
      expect(s.story.length).toBeGreaterThan(50);

      expect(s.cultural_content.length).toBeGreaterThanOrEqual(4);
      expect(typesOf(s.cultural_content)).toContain('dialect');
      typesOf(s.cultural_content).forEach(t => seenTypes.add(t));

      expect(s.state_dialogue).toBeTruthy();
      expect(s.state_dialogue.entry_first.length).toBeGreaterThan(0);
    }
    // Across the catalogue, the variety FR2 asks for shows up.
    ['food', 'landmark', 'tradition', 'dialect'].forEach(t => expect(seenTypes.has(t)).toBe(true));
  });
});

describe('FR2 — Unknown state', () => {
  test('GET /api/states/:id with an unknown id → 404', async () => {
    const res = await agent.get('/api/states/9999');
    expect(res.status).toBe(404);
  });
});

describe('FR2 — Traditional costume (served via the costume catalogue)', () => {
  // FR2 lists "traditional costume" as part of a state's culture. There is no per-state
  // costume *card* in the content data; instead the culturally-themed traditional
  // costumes live in the shared costume catalogue (the avatar shop / FR6).
  test('costume catalogue exposes culturally-themed traditional costumes', async () => {
    const res = await agent.get('/api/progress/costumes');
    expect(res.status).toBe(200);
    const costumes = res.body.data;
    expect(costumes.length).toBeGreaterThanOrEqual(6);

    // Each costume names the culture it represents.
    costumes.forEach(c => {
      expect(typeof c.name).toBe('string');
      expect(c.name.length).toBeGreaterThan(0);
    });
    const named = costumes.map(c => c.name.toLowerCase());
    expect(named.some(n => n.includes('baju melayu'))).toBe(true); // Malay traditional dress
  });
});
