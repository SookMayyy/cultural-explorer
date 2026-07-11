// db/connection.js — PostgreSQL (Supabase) connection pool.
//
// The app was originally written for MySQL (mysql2). To keep the route code
// unchanged, this module exposes an `execute(sql, params)` helper that:
//   1. rewrites `?` placeholders into Postgres `$1, $2, …` form, and
//   2. returns `[rows, fields]` so existing destructuring like
//      `const [rows] = await pool.execute(...)` keeps working.
//
// MySQL-specific SQL (ON DUPLICATE KEY, IF(), RAND(), insertId) was ported to
// Postgres equivalents directly in the route files.

const { Pool } = require('pg');

if (!process.env.DATABASE_URL) {
  console.warn('⚠️  DATABASE_URL is not set. Add your Supabase connection string to .env');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Supabase requires TLS; the pooler cert isn't in the local trust store,
  // so we don't verify the chain (fine for a dev/FYP connection).
  ssl: { rejectUnauthorized: false },
  // Fail fast when the DB is unreachable or the Supabase project is paused,
  // instead of hanging the request forever (which makes the frontend button
  // look dead). The route then returns a 500 and the auth screens show their
  // "Could not reach the server" popup.
  connectionTimeoutMillis: 8000,
});

// mysql2-compatible execute(): `?` → `$n`, returns [rows, fields].
async function execute(sql, params = []) {
  let i = 0;
  const text = sql.replace(/\?/g, () => `$${++i}`);
  const result = await pool.query(text, params);
  return [result.rows, result.fields];
}

module.exports = {
  execute,
  query: (...args) => pool.query(...args),
  pool,
};
