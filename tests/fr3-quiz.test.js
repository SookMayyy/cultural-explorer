// tests/fr3-quiz.test.js
// FR3 — Mini-games (quiz): the MCQ endpoints the quiz screen reads + scores against.
// Standalone suite (own throwaway user + cleanup) so it can be run on its own:
//
//   npx jest tests/fr3-quiz.test.js
//
// FR3 contract (the backend half — quiz question delivery + answer validation):
//   • GET  /api/quiz/state/:id  → up to 4 random questions for the state, each with
//        question_text + four options (a–d) + a correct_opt + an explanation.
//   • POST /api/quiz/validate   → { questionId, selectedOption }
//        correct answer  → { correct:true,  pointsAwarded:10 } and +10 to the user's points
//        wrong answer    → { correct:false, pointsAwarded:0 }  and points unchanged
//        missing fields  → 422 ; unknown question id → 404
//
// Out of scope here (frontend-only, no backend endpoint): adaptive difficulty,
// spaced-repetition of wrong answers, Drag-Match, and Guess-the-State. Those are
// driven entirely client-side from src/js/data/ + the game components.
//
// Requires `npm run seed` to have populated quiz_questions.

const request = require('supertest');
const app  = require('../server');
const pool = require('../db/connection');

const rnd  = () => Array.from({ length: 8 }, () => String.fromCharCode(97 + Math.floor(Math.random() * 26))).join('');
const NAME = `Quizfr${rnd()}`.slice(0, 20); // letters only — validator forbids digits

const agent = request.agent(app);   // logged-in student (keeps the session cookie)
const guest = request(app);         // no session — for the guest-scoring path
let userId;

const OPTS    = ['opt_a', 'opt_b', 'opt_c', 'opt_d'];
const LETTERS = ['a', 'b', 'c', 'd'];

beforeAll(async () => {
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

const myPoints = async () => (await agent.get('/api/auth/me')).body.user.points;

describe('FR3 — Question delivery (GET /api/quiz/state/:id)', () => {
  let questions;
  test('returns 1–4 questions for a seeded state', async () => {
    const res = await agent.get('/api/quiz/state/1');
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    questions = res.body.data;
    expect(Array.isArray(questions)).toBe(true);
    expect(questions.length).toBeGreaterThanOrEqual(1);
    expect(questions.length).toBeLessThanOrEqual(4);
  });

  test('every question carries text, four non-empty options and a valid correct_opt', () => {
    for (const q of questions) {
      expect(typeof q.question_text).toBe('string');
      expect(q.question_text.length).toBeGreaterThan(0);
      OPTS.forEach(k => {
        expect(typeof q[k]).toBe('string');
        expect(q[k].length).toBeGreaterThan(0);
      });
      expect(LETTERS).toContain(q.correct_opt);
      expect(['easy', 'medium', 'hard']).toContain(q.difficulty);
    }
  });

  test('LIMIT 4 holds even for a state with a large bank', async () => {
    // Penang carries the most seeded questions; the route caps the set at 4.
    const res = await agent.get('/api/quiz/state/1');
    expect(res.body.data.length).toBeLessThanOrEqual(4);
  });

  test('an unknown state id returns an empty set (200, not an error)', async () => {
    const res = await agent.get('/api/quiz/state/9999');
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });

  test('every seeded state (1–7) has at least one quiz question', async () => {
    for (let id = 1; id <= 7; id++) {
      const res = await agent.get(`/api/quiz/state/${id}`);
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    }
  });
});

describe('FR3 — Answer validation & scoring (POST /api/quiz/validate)', () => {
  let q;
  beforeAll(async () => {
    q = (await agent.get('/api/quiz/state/1')).body.data[0];
  });

  test('a correct answer returns correct:true, +10, and an explanation', async () => {
    const before = await myPoints();
    const res = await agent.post('/api/quiz/validate')
      .send({ questionId: q.id, selectedOption: q.correct_opt });
    expect(res.status).toBe(200);
    expect(res.body.correct).toBe(true);
    expect(res.body.pointsAwarded).toBe(10);
    expect(typeof res.body.explanation).toBe('string');
    expect(await myPoints()).toBe(before + 10);
  });

  test('a wrong answer returns correct:false, +0, points unchanged', async () => {
    const before = await myPoints();
    const wrong = LETTERS.find(o => o !== q.correct_opt);
    const res = await agent.post('/api/quiz/validate')
      .send({ questionId: q.id, selectedOption: wrong });
    expect(res.status).toBe(200);
    expect(res.body.correct).toBe(false);
    expect(res.body.pointsAwarded).toBe(0);
    expect(await myPoints()).toBe(before);
  });

  test('re-answering the same question correctly awards again (no per-question lock yet)', async () => {
    const before = await myPoints();
    await agent.post('/api/quiz/validate').send({ questionId: q.id, selectedOption: q.correct_opt });
    expect(await myPoints()).toBe(before + 10);
  });

  test('missing fields → 422', async () => {
    expect((await agent.post('/api/quiz/validate').send({})).status).toBe(422);
    expect((await agent.post('/api/quiz/validate').send({ questionId: q.id })).status).toBe(422);
    expect((await agent.post('/api/quiz/validate').send({ selectedOption: 'a' })).status).toBe(422);
  });

  test('unknown question id → 404', async () => {
    const res = await agent.post('/api/quiz/validate')
      .send({ questionId: 999999, selectedOption: 'a' });
    expect(res.status).toBe(404);
  });
});

describe('FR3 — Guest scoring path (no session)', () => {
  test('a guest can validate an answer (200) but no points are persisted server-side', async () => {
    const list = await guest.get('/api/quiz/state/1');
    const q = list.body.data[0];
    const res = await guest.post('/api/quiz/validate')
      .send({ questionId: q.id, selectedOption: q.correct_opt });
    expect(res.status).toBe(200);
    expect(res.body.correct).toBe(true);
    // No user row to update — the route guards the UPDATE behind req.session.user,
    // so this must not throw and the guest simply isn't credited in the DB.
  });
});
