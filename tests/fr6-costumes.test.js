// tests/fr6-costumes.test.js
// FR6 — Avatar costume customisation: spend earned points to unlock culturally-themed
// costumes, then equip/preview them.
//
//   npx jest tests/fr6-costumes.test.js
//
// FR6 contract (CLAUDE.md §3):
//   • Culturally-themed costume catalogue with point costs.
//   • Unlock spends the exact cost; can't afford → blocked; can't buy twice.
//   • Equip sets users.avatar_costume_id (the avatar preview); default (id 1) is free and
//     always equippable; equipping an unowned costume is rejected.
//
// Standalone: own throwaway Grade 4-6 user funded via the points route; fully cleaned up.
// Requires `npm run seed` + the schema's seeded costume catalogue.

const request = require('supertest');
const app  = require('../server');
const pool = require('../db/connection');

const rnd  = () => Array.from({ length: 8 }, () => String.fromCharCode(97 + Math.floor(Math.random() * 26))).join('');
const NAME = `Cosfr${rnd()}`.slice(0, 20);
const POOR = `Poorco${rnd()}`.slice(0, 20);

const agent = request.agent(app);
let userId, poorId;

const me        = async () => (await agent.get('/api/auth/me')).body.user;
const catalogue = async () => (await agent.get('/api/progress/costumes')).body.data;

// Expected catalogue from db/schema.postgres.sql.
const EXPECTED = {
  1: { name: 'School Uniform',       cost: 0  },
  2: { name: 'Baju Melayu',          cost: 50 },
  3: { name: 'Cheongsam',            cost: 50 },
  4: { name: 'Saree',                cost: 50 },
  5: { name: 'Kadazan-Dusun Attire', cost: 80 },
  6: { name: 'Iban Warrior',         cost: 80 },
};

beforeAll(async () => {
  const reg = await agent.post('/api/auth/register').send({
    display_name: NAME, grade_group: '4-6', password: 'pass123', icon_key_1: 5, icon_key_2: 11,
  });
  expect(reg.status).toBe(201);
  userId = (await me()).id;
  // Fund the wallet directly (state completion no longer pays a bonus — points
  // come from mission play; this test just needs enough to buy a 50-pt costume).
  await agent.post('/api/progress/points').send({ delta: 60 });
});

afterAll(async () => {
  for (const id of [userId, poorId].filter(Boolean)) {
    await pool.execute('DELETE FROM user_costumes WHERE user_id = ?', [id]);
    await pool.execute('DELETE FROM user_progress WHERE user_id = ?', [id]);
    await pool.execute('DELETE FROM users          WHERE id = ?',      [id]);
  }
  await pool.pool.end();
});

describe('FR6 — Catalogue', () => {
  test('exposes the full culturally-themed catalogue with correct costs', async () => {
    const list = await catalogue();
    expect(list.length).toBe(6);
    for (const c of list) {
      expect(EXPECTED[c.id]).toBeTruthy();
      expect(c.name).toBe(EXPECTED[c.id].name);
      expect(c.points_cost).toBe(EXPECTED[c.id].cost);
      expect(typeof c.culture_ref).toBe('string');
      expect(c.culture_ref.length).toBeGreaterThan(0);
    }
  });

  test('is sorted by ascending cost (free default first)', async () => {
    const costs = (await catalogue()).map(c => c.points_cost);
    for (let i = 1; i < costs.length; i++) expect(costs[i]).toBeGreaterThanOrEqual(costs[i - 1]);
    expect(costs[0]).toBe(0);
  });

  test('fresh user: default (id 1) equipped, everything else locked', async () => {
    const list = await catalogue();
    expect(list.find(c => c.id === 1).is_equipped).toBe(true);
    list.filter(c => c.id !== 1).forEach(c => expect(c.is_unlocked).toBe(false));
  });
});

describe('FR6 — Unlocking', () => {
  test('unlocking spends the exact cost and marks the costume owned', async () => {
    const before = (await me()).points;
    const cost   = EXPECTED[2].cost;
    expect(before).toBeGreaterThanOrEqual(cost);

    const res = await agent.post('/api/progress/costumes/2/unlock');
    expect(res.status).toBe(200);
    expect(res.body.newPoints).toBe(before - cost);
    expect((await me()).points).toBe(before - cost);
    expect((await catalogue()).find(c => c.id === 2).is_unlocked).toBe(true);
  });

  test('cannot buy the same costume twice → 400', async () => {
    expect((await agent.post('/api/progress/costumes/2/unlock')).status).toBe(400);
  });

  test('unknown costume → 404', async () => {
    expect((await agent.post('/api/progress/costumes/9999/unlock')).status).toBe(404);
  });

  test('a broke user cannot unlock → 400 (and is not charged)', async () => {
    const poor = request.agent(app);
    await poor.post('/api/auth/register').send({
      display_name: POOR, grade_group: '4-6', password: 'pass123', icon_key_1: 1, icon_key_2: 2,
    });
    poorId = (await poor.get('/api/auth/me')).body.user.id;

    const res = await poor.post('/api/progress/costumes/2/unlock'); // 0 points
    expect(res.status).toBe(400);
    expect((await poor.get('/api/auth/me')).body.user.points).toBe(0);
  });
});

describe('FR6 — Equipping / preview', () => {
  test('equipping an owned costume updates the avatar preview', async () => {
    const res = await agent.post('/api/progress/costumes/2/equip');
    expect(res.status).toBe(200);
    expect((await me()).avatar_costume_id).toBe(2);              // reflected on the profile
    expect((await catalogue()).find(c => c.id === 2).is_equipped).toBe(true);
  });

  test('equipping an unowned costume is rejected → 403', async () => {
    expect((await agent.post('/api/progress/costumes/5/equip')).status).toBe(403);
    expect((await me()).avatar_costume_id).toBe(2);              // unchanged
  });

  test('the free default can always be re-equipped', async () => {
    const res = await agent.post('/api/progress/costumes/1/equip');
    expect(res.status).toBe(200);
    expect((await me()).avatar_costume_id).toBe(1);
  });
});
