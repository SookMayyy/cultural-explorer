// tests/fr7-auth.test.js
// FR7 — Student login & session management.
//
//   npx jest tests/fr7-auth.test.js
//
// FR7 contract (CLAUDE.md §3 / §2):
//   • Grade-based account creation; Grade 4+ choose a password, Grade 1-3 get a memorable
//     auto-password shown once at registration and cleared after first login.
//   • Icon-based recovery: two ordered icons from a grid of 12. Grade 1-3 reveal the
//     password; Grade 4+ set a new one.
//   • Sessions: httpOnly cookie, 8h expiry; protected routes need a session; logout clears it.
//   • MOE login is deferred (501). Teacher login uses bcrypt.
//
// Rate limiters are skipped under NODE_ENV=test (see middleware/rateLimiter.js), so the
// many auth calls here don't trip the 10/min · 20/hr windows.
//
// Standalone: every account created here (incl. a directly-inserted teacher) is tracked
// and deleted in afterAll.

const request = require('supertest');
const bcrypt  = require('bcrypt');
const app  = require('../server');
const pool = require('../db/connection');

const rnd  = () => Array.from({ length: 8 }, () => String.fromCharCode(97 + Math.floor(Math.random() * 26))).join('');
const name = (p) => `${p}${rnd()}`.slice(0, 20);

const createdIds = [];
async function trackByName(displayName, grade) {
  const [rows] = await pool.execute(
    'SELECT id FROM users WHERE display_name = ? AND grade_group = ? ORDER BY id DESC LIMIT 1',
    [displayName, grade]
  );
  if (rows[0]) createdIds.push(rows[0].id);
  return rows[0]?.id;
}

afterAll(async () => {
  for (const id of createdIds) {
    await pool.execute('DELETE FROM user_costumes WHERE user_id = ?', [id]);
    await pool.execute('DELETE FROM user_progress WHERE user_id = ?', [id]);
    await pool.execute('DELETE FROM users          WHERE id = ?',      [id]);
  }
  await pool.pool.end();
});

describe('FR7 — Grade 4+ registration & session', () => {
  const NAME = name('Stu');
  const agent = request.agent(app);

  test('registers with a password, opens a session, and returns no secrets', async () => {
    const res = await agent.post('/api/auth/register').send({
      display_name: NAME, grade_group: '4-6', password: 'pass123', icon_key_1: 3, icon_key_2: 7,
    });
    expect(res.status).toBe(201);
    expect(res.body.ok).toBe(true);
    expect(res.body.auto_password).toBeUndefined();   // only Grade 1-3 get one
    await trackByName(NAME, '4-6');

    // Session cookie is httpOnly + SameSite=Strict (8h maxAge configured in server.js).
    const cookie = [].concat(res.headers['set-cookie'] || []).join(';');
    expect(cookie).toMatch(/HttpOnly/i);
    expect(cookie).toMatch(/SameSite=Strict/i);
  });

  test('the session user is safe-shaped (no password hash) with sensible defaults', async () => {
    const me = (await agent.get('/api/auth/me')).body.user;
    expect(me.display_name).toBe(NAME);
    expect(me.grade_group).toBe('4-6');
    expect(me.auth_type).toBe('grade_account');
    expect(me.points).toBe(0);
    expect(me.avatar_costume_id).toBe(1);
    expect(me.password_hash).toBeUndefined();
    expect(me.auto_password).toBeUndefined();
  });
});

describe('FR7 — Grade 1-3 auto-password lifecycle', () => {
  const NAME = name('Kid');
  let autoPw, id;

  test('registration returns a memorable auto-password (no password supplied)', async () => {
    const agent = request.agent(app);
    const res = await agent.post('/api/auth/register').send({
      display_name: NAME, grade_group: '1-3', icon_key_1: 2, icon_key_2: 6,
    });
    expect(res.status).toBe(201);
    autoPw = res.body.auto_password;
    expect(autoPw).toMatch(/^[a-z]+\d[a-z]+$/);       // e.g. "sun7cat"
    id = await trackByName(NAME, '1-3');
  });

  test('first login with the auto-password clears it and sets a hash', async () => {
    const login = await request.agent(app).post('/api/auth/login')
      .send({ display_name: NAME, grade_group: '1-3', password: autoPw });
    expect(login.status).toBe(200);

    const [[row]] = await pool.execute(
      'SELECT auto_password, password_hash FROM users WHERE id = ?', [id]
    );
    expect(row.auto_password).toBeNull();             // cleared after first login
    expect(row.password_hash).toBeTruthy();           // now hashed
  });

  test('subsequent logins still work via the hashed password', async () => {
    const again = await request.agent(app).post('/api/auth/login')
      .send({ display_name: NAME, grade_group: '1-3', password: autoPw });
    expect(again.status).toBe(200);
  });
});

describe('FR7 — Login failures', () => {
  const NAME = name('Log');
  beforeAll(async () => {
    await request.agent(app).post('/api/auth/register').send({
      display_name: NAME, grade_group: '4-6', password: 'rightpw', icon_key_1: 1, icon_key_2: 2,
    });
    await trackByName(NAME, '4-6');
  });

  test('wrong password → 401', async () => {
    const res = await request(app).post('/api/auth/login')
      .send({ display_name: NAME, grade_group: '4-6', password: 'wrongpw' });
    expect(res.status).toBe(401);
  });

  test('unknown user → 401', async () => {
    const res = await request(app).post('/api/auth/login')
      .send({ display_name: name('Ghost'), grade_group: '4-6', password: 'whatever' });
    expect(res.status).toBe(401);
  });

  test('missing fields → 422', async () => {
    expect((await request(app).post('/api/auth/login').send({})).status).toBe(422);
  });
});

describe('FR7 — Registration validation', () => {
  const base = { grade_group: '4-6', password: 'pass123', icon_key_1: 3, icon_key_2: 7 };
  const reg = (over) => request(app).post('/api/auth/register').send({ display_name: name('V'), ...base, ...over });

  test('name with digits → 422', async () => {
    expect((await reg({ display_name: 'Bad1Name' })).status).toBe(422);
  });
  test('name longer than 20 chars → 422', async () => {
    expect((await reg({ display_name: 'abcdefghijklmnopqrstuvwxyz' })).status).toBe(422);
  });
  test('invalid grade group → 422', async () => {
    expect((await reg({ grade_group: '9-9' })).status).toBe(422);
  });
  test('icon out of range → 422', async () => {
    expect((await reg({ icon_key_1: 0 })).status).toBe(422);
    expect((await reg({ icon_key_2: 13 })).status).toBe(422);
  });
  test('two identical icons → 422', async () => {
    expect((await reg({ icon_key_1: 4, icon_key_2: 4 })).status).toBe(422);
  });
  test('Grade 4+ without a password → 422', async () => {
    expect((await reg({ password: '' })).status).toBe(422);
  });
  test('password shorter than 6 chars → 422', async () => {
    expect((await reg({ password: 'abc' })).status).toBe(422);
  });
});

describe('FR7 — Icon-based recovery', () => {
  test('Grade 4+ recovery with correct icons sets a new password', async () => {
    const NAME = name('Rec');
    await request(app).post('/api/auth/register').send({
      display_name: NAME, grade_group: '4-6', password: 'oldpass', icon_key_1: 5, icon_key_2: 9,
    });
    await trackByName(NAME, '4-6');

    const rec = await request(app).post('/api/auth/recover').send({
      display_name: NAME, grade_group: '4-6', icon_key_1: 5, icon_key_2: 9, new_password: 'newpass1',
    });
    expect(rec.status).toBe(200);

    expect((await request(app).post('/api/auth/login')
      .send({ display_name: NAME, grade_group: '4-6', password: 'newpass1' })).status).toBe(200);
    expect((await request(app).post('/api/auth/login')
      .send({ display_name: NAME, grade_group: '4-6', password: 'oldpass' })).status).toBe(401);
  });

  test('wrong icons → 401; swapped icon ORDER → 401 (order matters)', async () => {
    const NAME = name('Ord');
    await request(app).post('/api/auth/register').send({
      display_name: NAME, grade_group: '4-6', password: 'pass123', icon_key_1: 3, icon_key_2: 8,
    });
    await trackByName(NAME, '4-6');

    expect((await request(app).post('/api/auth/recover').send({
      display_name: NAME, grade_group: '4-6', icon_key_1: 1, icon_key_2: 2, new_password: 'nope12',
    })).status).toBe(401);

    expect((await request(app).post('/api/auth/recover').send({
      display_name: NAME, grade_group: '4-6', icon_key_1: 8, icon_key_2: 3, new_password: 'nope12',
    })).status).toBe(401);
  });

  test('unknown account → 404', async () => {
    const res = await request(app).post('/api/auth/recover').send({
      display_name: name('Nobody'), grade_group: '4-6', icon_key_1: 1, icon_key_2: 2, new_password: 'abcdef',
    });
    expect(res.status).toBe(404);
  });

  test('Grade 1-3 recovery reveals the auto-password (before first login)', async () => {
    const NAME = name('Rk');
    const reg = await request(app).post('/api/auth/register').send({
      display_name: NAME, grade_group: '1-3', icon_key_1: 7, icon_key_2: 10,
    });
    await trackByName(NAME, '1-3');

    const rec = await request(app).post('/api/auth/recover').send({
      display_name: NAME, grade_group: '1-3', icon_key_1: 7, icon_key_2: 10,
    });
    expect(rec.status).toBe(200);
    expect(rec.body.revealed_password).toBe(reg.body.auto_password);
  });
});

describe('FR7 — Session management', () => {
  test('protected route without a session → 401', async () => {
    expect((await request(app).get('/api/progress')).status).toBe(401);
  });

  test('logout destroys the session', async () => {
    const NAME = name('Out');
    const agent = request.agent(app);
    await agent.post('/api/auth/register').send({
      display_name: NAME, grade_group: '4-6', password: 'pass123', icon_key_1: 6, icon_key_2: 12,
    });
    await trackByName(NAME, '4-6');

    expect((await agent.get('/api/auth/me')).status).toBe(200);
    expect((await agent.post('/api/auth/logout')).status).toBe(200);
    expect((await agent.get('/api/auth/me')).status).toBe(401);
  });
});

describe('FR7 — Other auth paths', () => {
  test('MOE login is deferred → 501', async () => {
    expect((await request(app).post('/api/auth/moe-login').send({ ic: '123' })).status).toBe(501);
  });

  test('teacher login: bad email → 422, unknown teacher → 401, valid → 200', async () => {
    // Bad email shape.
    expect((await request(app).post('/api/auth/teacher-login')
      .send({ email: 'not-an-email', password: 'x' })).status).toBe(422);

    // Unknown teacher.
    expect((await request(app).post('/api/auth/teacher-login')
      .send({ email: `ghost${rnd()}@example.com`, password: 'whatever' })).status).toBe(401);

    // Seed a teacher directly (no public teacher-register route) and log in.
    const email = `teacher${rnd()}@example.com`;
    const hash  = await bcrypt.hash('teachpass', 10);
    const [ins] = await pool.execute(
      `INSERT INTO users (auth_type, display_name, email, teacher_pw_hash)
       VALUES ('teacher', ?, ?, ?) RETURNING id`,
      ['Teacher Tester', email, hash]
    );
    createdIds.push(ins[0].id);

    const agent = request.agent(app);
    const ok = await agent.post('/api/auth/teacher-login').send({ email, password: 'teachpass' });
    expect(ok.status).toBe(200);
    expect((await agent.get('/api/auth/me')).body.user.auth_type).toBe('teacher');

    expect((await request(app).post('/api/auth/teacher-login')
      .send({ email, password: 'wrongpass' })).status).toBe(401);
  });
});
