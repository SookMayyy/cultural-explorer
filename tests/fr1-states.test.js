// tests/fr1-states.test.js
// FR1 — Interactive Map / States: catalogue, structure, and unlock logic.
// Standalone suite (own throwaway user + cleanup) so it can be run on its own:
//
//   npx jest tests/fr1-states.test.js
//
// Checklist covered (see docs/DEVELOPER_GUIDE.md §7):
//   • GET /api/states returns 8 states (7 + Kedah)
//   • Free exploration: every state is always unlocked (logged-in AND guest)
//   • is_completed flips to true after completion; nothing ever re-locks

const request = require('supertest');
const app  = require('../server');
const pool = require('../db/connection');

const rnd = () => Array.from({ length: 8 }, () => String.fromCharCode(97 + Math.floor(Math.random() * 26))).join('');
const NAME = `Mapfr${rnd()}`.slice(0, 20); // letters only — validator forbids digits

const agent = request.agent(app);
let userId;

const WEST = [1, 2, 3, 4, 5]; // Penang, Melaka, Selangor, Johor, Kelantan
const EAST = [6, 7];          // Sabah, Sarawak

const byId = (rows) => Object.fromEntries(rows.map(s => [s.id, s]));
const complete = (stateId) => agent.post(`/api/progress/${stateId}/complete`).send({ quizScore: 20 });

beforeAll(async () => {
  const reg = await agent.post('/api/auth/register').send({
    display_name: NAME, grade_group: '4-6', password: 'pass123', icon_key_1: 4, icon_key_2: 9,
  });
  expect(reg.status).toBe(201);
  userId = (await agent.get('/api/auth/me')).body.user.id;
});

afterAll(async () => {
  if (userId) {
    await pool.execute('DELETE FROM user_progress WHERE user_id = ?', [userId]);
    await pool.execute('DELETE FROM users WHERE id = ?', [userId]);
  }
  await pool.pool.end();
});

describe('FR1 — Catalogue & shape', () => {
  test('GET /api/states returns exactly 8 states ordered by sort_order', async () => {
    const res = await agent.get('/api/states');
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.data).toHaveLength(8);
    expect(res.body.data.map(s => s.id)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });

  test('each state exposes the fields the map screen needs', async () => {
    const { body } = await agent.get('/api/states');
    for (const s of body.data) {
      expect(typeof s.id).toBe('number');
      expect(typeof s.name).toBe('string');
      expect(['west', 'east']).toContain(s.region);
      expect(['rimau', 'wak']).toContain(s.mascot);
      expect(s.color_hex).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(typeof s.is_locked).toBe('boolean');
      expect(typeof s.is_completed).toBe('boolean');
    }
  });

  test('mascot matches region (west → rimau, east → wak)', async () => {
    const { body } = await agent.get('/api/states');
    for (const s of body.data) {
      expect(s.mascot).toBe(s.region === 'east' ? 'wak' : 'rimau');
    }
  });
});

describe('FR1 — Free exploration (no locking)', () => {
  test('fresh user: every state is unlocked, none completed', async () => {
    const states = byId((await agent.get('/api/states')).body.data);
    [...WEST, ...EAST].forEach(id => expect(states[id].is_locked).toBe(false));
    Object.values(states).forEach(s => expect(s.is_completed).toBe(false));
  });

  test('guest (no session): every state is unlocked', async () => {
    const res = await request(app).get('/api/states'); // no agent → no cookie
    expect(res.status).toBe(200);
    expect(res.body.data.every(s => s.is_locked === false)).toBe(true);
  });

  test('East Malaysia is playable immediately — no west-completion gate', async () => {
    // Complete an East state first, with zero west states done.
    expect((await complete(6)).status).toBe(200);
    const states = byId((await agent.get('/api/states')).body.data);
    EAST.forEach(id => expect(states[id].is_locked).toBe(false));
    expect(states[6].is_completed).toBe(true);
  });

  test('completing states flips is_completed and never locks anything', async () => {
    for (const id of WEST) expect((await complete(id)).status).toBe(200);
    const states = byId((await agent.get('/api/states')).body.data);
    WEST.forEach(id => expect(states[id].is_completed).toBe(true));
    [...WEST, ...EAST].forEach(id => expect(states[id].is_locked).toBe(false));
  });
});
