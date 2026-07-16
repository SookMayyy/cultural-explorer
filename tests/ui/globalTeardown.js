// tests/ui/globalTeardown.js — stop the server started by globalSetup.
// A server we merely reused (globalSetup stored null) is left running.

module.exports = async () => {
  const server = globalThis.__UI_SERVER__;
  if (server) {
    await new Promise(resolve => server.close(resolve));
    console.log('\n[ui] server stopped');
  }

  // Release the Postgres pool too, so Jest exits instead of hanging on it.
  try {
    const pool = require('../../db/connection');
    if (pool && typeof pool.end === 'function') await pool.end();
  } catch {
    // Pool never opened (or already closed) — nothing to release.
  }
};
