// tests/fr5-rewards.test.js
// FR5 — Rewards: points + stamps earned through gameplay.
//
//   npx jest tests/fr5-rewards.test.js
//
// FR5 contract (CLAUDE.md §3):
//   • Points live in users.points. In the mission flow a state is worth exactly
//     100 (4 missions × 25); state completion itself pays NO bonus. The standalone
//     Activities-Hub quiz still awards +10 per correct answer (see FR3).
//   • One stamp per state completion, stored in user_progress.stamp_earned.
//   • Completion records is_completed + stamp_earned + last_quiz_score + completed_at.
// (The stamp-book grid / fly-in animation is frontend — not covered here.)
//
// Standalone: own throwaway Grade 4-6 user, fully cleaned up. Requires `npm run seed`.

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
    display_name: NAME, grade_group: '4-6', password: 'pass123', icon_key_1: 4, icon_key_2: 9,
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

describe('FR5 — Stamps & completion', () => {
  test('a fresh user has no progress and 0 points', async () => {
    expect(await progress()).toEqual([]);
    expect(await points()).toBe(0);
  });

  test('completing a state earns a stamp and records the score, with no points bonus', async () => {
    const before = await points();
    const res = await agent.post('/api/progress/1/complete').send({ quizScore: 30 });
    expect(res.status).toBe(200);
    expect(res.body.bonusPoints).toBe(0);          // points come from missions, not completion
    expect(await points()).toBe(before);           // completion pays nothing extra

    const row = (await progress()).find(p => p.state_id === 1);
    expect(row.is_completed).toBe(true);
    expect(row.stamp_earned).toBe(true);
    expect(row.last_quiz_score).toBe(30);
    expect(row.completed_at).toBeTruthy();
  });

  test('standalone quiz points (+10) accrue; completion adds no bonus', async () => {
    const q = (await agent.get('/api/quiz/state/2')).body.data[0];
    const before = await points();

    const ans = await agent.post('/api/quiz/validate')
      .send({ questionId: q.id, selectedOption: q.correct_opt });
    expect(ans.body.correct).toBe(true);
    expect(await points()).toBe(before + 10);

    await agent.post('/api/progress/2/complete').send({ quizScore: 40 });
    expect(await points()).toBe(before + 10);      // completion still adds nothing
  });

  test('the stamp count equals the number of completed states', async () => {
    await agent.post('/api/progress/3/complete').send({ quizScore: 50 });
    const rows = await progress();
    const completed = rows.filter(p => p.is_completed);
    const stamps    = rows.filter(p => p.stamp_earned);
    expect(stamps.length).toBe(completed.length);
    expect(completed.map(p => p.state_id).sort()).toEqual([1, 2, 3]);
  });

  test('re-completing a state refreshes the row but does NOT re-award the bonus', async () => {
    const rowBefore = (await progress()).find(p => p.state_id === 1);
    expect(rowBefore).toBeTruthy();
    const pointsBefore = await points();

    const res = await agent.post('/api/progress/1/complete').send({ quizScore: 99 });
    expect(res.status).toBe(200);
    expect(res.body.bonusPoints).toBe(0);          // bonus paid once, on first completion
    expect(res.body.alreadyCompleted).toBe(true);
    expect(await points()).toBe(pointsBefore);     // no double-dipping

    const rows = (await progress()).filter(p => p.state_id === 1);
    expect(rows.length).toBe(1);                   // still one stamp for the state
    expect(rows[0].last_quiz_score).toBe(99);      // score refreshed
    expect(rows[0].completed_at).toBe(rowBefore.completed_at); // first-finish time kept
  });
});
