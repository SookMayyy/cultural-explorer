// tests/fr5-rewards.test.js
// FR5 — Rewards: points + stamps earned through gameplay.
//
//   npx jest tests/fr5-rewards.test.js
//
// FR5 contract (CLAUDE.md §3):
//   • Points live in users.points; awarded on correct quiz answers (+10, see FR3) and on
//     state completion (+20 bonus).
//   • One stamp per state completion, stored in user_progress.stamp_earned.
//   • Completion records is_completed + stamp_earned + last_quiz_score + completed_at.
// (The stamp-book grid / fly-in animation is frontend — not covered here.)
//
// Standalone: own throwaway Grade 3-4 user, fully cleaned up. Requires `npm run seed`.

const request = require('supertest');
const app  = require('../server');
const pool = require('../db/connection');

const rnd  = () => Array.from({ length: 8 }, () => String.fromCharCode(97 + Math.floor(Math.random() * 26))).join('');
const NAME = `Rewfr${rnd()}`.slice(0, 20);

const agent = request.agent(app);
let userId;

const points = async () => (await agent.get('/api/auth/me')).body.user.points;
const progress = async () => (await agent.get('/api/progress')).body.data;

beforeAll(async () => {
  const reg = await agent.post('/api/auth/register').send({
    display_name: NAME, grade_group: '3-4', password: 'pass123', icon_key_1: 4, icon_key_2: 9,
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

describe('FR5 — Stamps & completion bonus', () => {
  test('a fresh user has no progress and 0 points', async () => {
    expect(await progress()).toEqual([]);
    expect(await points()).toBe(0);
  });

  test('completing a state earns a stamp, records the score, and pays +20', async () => {
    const before = await points();
    const res = await agent.post('/api/progress/1/complete').send({ quizScore: 30 });
    expect(res.status).toBe(200);
    expect(res.body.bonusPoints).toBe(20);
    expect(await points()).toBe(before + 20);

    const row = (await progress()).find(p => p.state_id === 1);
    expect(row.is_completed).toBe(true);
    expect(row.stamp_earned).toBe(true);
    expect(row.last_quiz_score).toBe(30);
    expect(row.completed_at).toBeTruthy();
  });

  test('quiz points (+10) and completion bonus (+20) both accrue to users.points', async () => {
    const q = (await agent.get('/api/quiz/state/2')).body.data[0];
    const before = await points();

    const ans = await agent.post('/api/quiz/validate')
      .send({ questionId: q.id, selectedOption: q.correct_opt });
    expect(ans.body.correct).toBe(true);
    expect(await points()).toBe(before + 10);

    await agent.post('/api/progress/2/complete').send({ quizScore: 40 });
    expect(await points()).toBe(before + 30);
  });

  test('the stamp count equals the number of completed states', async () => {
    await agent.post('/api/progress/3/complete').send({ quizScore: 50 });
    const rows = await progress();
    const completed = rows.filter(p => p.is_completed);
    const stamps    = rows.filter(p => p.stamp_earned);
    expect(stamps.length).toBe(completed.length);
    expect(completed.map(p => p.state_id).sort()).toEqual([1, 2, 3]);
  });

  test('re-completing a state updates the same row in place (no duplicate stamp)', async () => {
    const before = (await progress()).filter(p => p.state_id === 1).length;
    expect(before).toBe(1);

    const res = await agent.post('/api/progress/1/complete').send({ quizScore: 99 });
    expect(res.status).toBe(200);

    const rows = (await progress()).filter(p => p.state_id === 1);
    expect(rows.length).toBe(1);                 // still one stamp for the state
    expect(rows[0].last_quiz_score).toBe(99);    // score refreshed
    // NOTE (known gap): the completion bonus is NOT idempotent — re-completing pays the
    // +20 again. Captured here so a future fix (guard the bonus on first completion) is a
    // deliberate change. See DEVELOPER_GUIDE §8.
  });
});
