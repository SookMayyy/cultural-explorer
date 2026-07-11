// tests/backend.test.js
// Integration tests for the Cultural Explorer backend (FR1–FR6).
// Runs against the live Supabase DB configured in .env, using a dedicated
// throwaway test user that is fully deleted in afterAll().
//
//   npm test
//
// Requires the content seed to have been run once (npm run seed).

const request = require('supertest');
const app  = require('../server');          // loads dotenv + Express app (no port bind under NODE_ENV=test)
const pool = require('../db/connection');

// Unique, letters-only display name (validator allows /^[a-zA-Z ]{1,20}$/ — no digits).
const rnd = () => Array.from({ length: 8 }, () => String.fromCharCode(97 + Math.floor(Math.random() * 26))).join('');
const TEST_NAME = `Tester${rnd()}`.slice(0, 20);
const POOR_NAME = `Poor${rnd()}`.slice(0, 20);

const agent = request.agent(app);   // keeps the session cookie across requests
let testUserId;
let poorUserId;

const WEST_STATES = [1, 2, 3, 4, 5]; // Penang, Melaka, Selangor, Johor, Kelantan

async function getMe() {
  const res = await agent.get('/api/auth/me');
  return res.body.user;
}

beforeAll(async () => {
  // Register the main test user (Grade 4-6 → has a password). Register also opens a session.
  const reg = await agent.post('/api/auth/register').send({
    display_name: TEST_NAME, grade_group: '4-6', password: 'pass123',
    icon_key_1: 3, icon_key_2: 7,
  });
  expect(reg.status).toBe(201);

  const me = await getMe();
  testUserId = me.id;
});

afterAll(async () => {
  // Clean up everything this suite created.
  const ids = [testUserId, poorUserId].filter(Boolean);
  for (const id of ids) {
    await pool.execute('DELETE FROM user_costumes  WHERE user_id = ?', [id]);
    await pool.execute('DELETE FROM user_progress  WHERE user_id = ?', [id]);
    await pool.execute('DELETE FROM users          WHERE id = ?',      [id]);
  }
  await pool.pool.end();
});

// ── Session sanity ──────────────────────────────────────────────────────────────
describe('Auth session', () => {
  test('GET /api/auth/me returns the logged-in user with 0 starting points', async () => {
    const me = await getMe();
    expect(me.id).toBe(testUserId);
    expect(me.display_name).toBe(TEST_NAME);
    expect(me.points).toBe(0);
    expect(me.avatar_costume_id).toBe(1);
  });

  test('protected route rejects unauthenticated requests', async () => {
    const res = await request(app).get('/api/progress'); // no session cookie
    expect(res.status).toBe(401);
  });
});

// NOTE: FR1 (states & unlock logic) now lives in its own thorough suite,
// tests/fr1-states.test.js — including the 4-vs-5 east-unlock boundary.

// ── FR2: Cultural content cards ──────────────────────────────────────────────────
describe('FR2 — Cultural content', () => {
  test('GET /api/states/1 returns the state with 4 cards + dialogue', async () => {
    const res = await agent.get('/api/states/1');
    expect(res.status).toBe(200);
    expect(res.body.data.cultural_content.length).toBeGreaterThanOrEqual(4);

    const types = res.body.data.cultural_content.map(c => c.card_type);
    expect(types).toContain('food');
    expect(types).toContain('dialect');

    expect(res.body.data.state_dialogue).toBeTruthy();
    expect(typeof res.body.data.state_dialogue.entry_first).toBe('string');
  });

  test('GET /api/states/:id returns 404 for an unknown state', async () => {
    const res = await agent.get('/api/states/9999');
    expect(res.status).toBe(404);
  });
});

// ── FR3: Mini-games (quiz) + points ─────────────────────────────────────────────
describe('FR3 — Quiz & points', () => {
  let question;

  test('GET /api/quiz/state/1 returns questions with options', async () => {
    const res = await agent.get('/api/quiz/state/1');
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data.length).toBeLessThanOrEqual(4);
    question = res.body.data[0];
    ['opt_a', 'opt_b', 'opt_c', 'opt_d', 'correct_opt'].forEach(k => expect(question[k]).toBeDefined());
  });

  test('correct answer awards 10 points', async () => {
    const before = (await getMe()).points;
    const res = await agent.post('/api/quiz/validate')
      .send({ questionId: question.id, selectedOption: question.correct_opt });
    expect(res.status).toBe(200);
    expect(res.body.correct).toBe(true);
    expect(res.body.pointsAwarded).toBe(10);
    expect((await getMe()).points).toBe(before + 10);
  });

  test('wrong answer awards 0 points', async () => {
    const before = (await getMe()).points;
    const wrong = ['a', 'b', 'c', 'd'].find(o => o !== question.correct_opt);
    const res = await agent.post('/api/quiz/validate')
      .send({ questionId: question.id, selectedOption: wrong });
    expect(res.status).toBe(200);
    expect(res.body.correct).toBe(false);
    expect(res.body.pointsAwarded).toBe(0);
    expect((await getMe()).points).toBe(before);
  });

  test('missing fields → 422; unknown question → 404', async () => {
    expect((await agent.post('/api/quiz/validate').send({})).status).toBe(422);
    expect((await agent.post('/api/quiz/validate')
      .send({ questionId: 999999, selectedOption: 'a' })).status).toBe(404);
  });
});

// ── FR5: Progress completion + stamps (no bonus) ─────────────────────────────────
describe('FR5 — Progress, stamps & completion', () => {
  test('progress is empty before any completion', async () => {
    const res = await agent.get('/api/progress');
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });

  test('completing a state awards a stamp and records the score (no points bonus)', async () => {
    const before = (await getMe()).points;
    const res = await agent.post('/api/progress/1/complete').send({ quizScore: 30 });
    expect(res.status).toBe(200);
    expect(res.body.bonusPoints).toBe(0);              // points come from missions, not completion
    expect((await getMe()).points).toBe(before);       // completion pays nothing extra

    const prog = await agent.get('/api/progress');
    const row = prog.body.data.find(p => p.state_id === 1);
    expect(row).toBeTruthy();
    expect(row.is_completed).toBe(true);
    expect(row.stamp_earned).toBe(true);
    expect(row.last_quiz_score).toBe(30);
  });

  test('every state (incl. East Malaysia) is unlocked — free exploration, no gate', async () => {
    for (const id of WEST_STATES.slice(1)) {           // state 1 already done above
      await agent.post(`/api/progress/${id}/complete`).send({ quizScore: 25 });
    }
    const res = await agent.get('/api/states');
    const byId = Object.fromEntries(res.body.data.map(s => [s.id, s]));
    expect(res.body.data.every(s => s.is_locked === false)).toBe(true);  // nothing ever locked
    expect(byId[6].is_locked).toBe(false);             // Sabah open
    expect(byId[7].is_locked).toBe(false);             // Sarawak open
    expect(byId[1].is_completed).toBe(true);
  });
});

// ── FR6: Avatar costume shop (unlock / equip / spend points) ─────────────────────
describe('FR6 — Costume shop', () => {
  test('GET costumes lists catalogue with default (id 1) equipped', async () => {
    const res = await agent.get('/api/progress/costumes');
    expect(res.status).toBe(200);
    const def = res.body.data.find(c => c.id === 1);
    expect(def.is_equipped).toBe(true);
    expect(res.body.data.find(c => c.id === 2).is_unlocked).toBe(false);
  });

  test('unlocking a costume spends the right number of points', async () => {
    // Fund the wallet directly — state completion no longer pays a bonus, so
    // top up enough to afford the costume (points normally come from missions).
    await agent.post('/api/progress/points').send({ delta: 100 });
    const costumes = (await agent.get('/api/progress/costumes')).body.data;
    const target = costumes.find(c => c.id === 2);     // Baju Melayu, 50 pts
    const before = (await getMe()).points;
    expect(before).toBeGreaterThanOrEqual(target.points_cost);

    const res = await agent.post('/api/progress/costumes/2/unlock');
    expect(res.status).toBe(200);
    expect(res.body.newPoints).toBe(before - target.points_cost);
    expect((await getMe()).points).toBe(before - target.points_cost);
  });

  test('cannot unlock the same costume twice', async () => {
    const res = await agent.post('/api/progress/costumes/2/unlock');
    expect(res.status).toBe(400);
  });

  test('unlocking an unknown costume → 404', async () => {
    const res = await agent.post('/api/progress/costumes/9999/unlock');
    expect(res.status).toBe(404);
  });

  test('a user without enough points cannot unlock', async () => {
    const poor = request.agent(app);
    await poor.post('/api/auth/register').send({
      display_name: POOR_NAME, grade_group: '4-6', password: 'pass123',
      icon_key_1: 1, icon_key_2: 2,
    });
    poorUserId = (await poor.get('/api/auth/me')).body.user.id;

    const res = await poor.post('/api/progress/costumes/2/unlock'); // 0 points
    expect(res.status).toBe(400);
  });

  test('equipping an owned costume works; unowned is rejected', async () => {
    const ok = await agent.post('/api/progress/costumes/2/equip');
    expect(ok.status).toBe(200);
    expect((await getMe()).avatar_costume_id).toBe(2);

    const denied = await agent.post('/api/progress/costumes/5/equip'); // not owned
    expect(denied.status).toBe(403);

    const def = await agent.post('/api/progress/costumes/1/equip');    // default always allowed
    expect(def.status).toBe(200);
  });
});

// ── Logout ───────────────────────────────────────────────────────────────────────
describe('Logout', () => {
  test('logout destroys the session', async () => {
    expect((await agent.post('/api/auth/logout')).status).toBe(200);
    expect((await agent.get('/api/auth/me')).status).toBe(401);
  });
});
