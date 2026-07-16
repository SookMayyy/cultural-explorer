// tests/ui/globalSetup.js — serve the app for the UI suite.
//
// server.js exports the Express app and only binds a port when NODE_ENV isn't
// 'test' (Jest sets that), so we require it and listen ourselves rather than
// spawning a child process — no stray processes to clean up, and no Windows
// path quirks around spawning node from "C:\Program Files\...".
//
// If something is already serving the port (e.g. `npm run dev`), we reuse it.

const PORT = Number(process.env.PORT) || 3000;
const ORIGIN = `http://localhost:${PORT}`;

async function alreadyServing() {
  try {
    const res = await fetch(`${ORIGIN}/views/home.html`, { signal: AbortSignal.timeout(1500) });
    return res.ok;
  } catch {
    return false;
  }
}

module.exports = async () => {
  if (await alreadyServing()) {
    globalThis.__UI_SERVER__ = null;
    console.log(`\n[ui] reusing the server already on ${ORIGIN}`);
    return;
  }

  // Keep server.js from binding the port itself — we do it here.
  process.env.NODE_ENV = 'test';
  const app = require('../../server');

  const server = await new Promise((resolve, reject) => {
    const s = app.listen(PORT, () => resolve(s));
    s.on('error', reject);
  });

  globalThis.__UI_SERVER__ = server;
  console.log(`\n[ui] serving ${ORIGIN}`);
};
