// tests/ui/helpers.js — shared browser + page helpers for the UI suite.
//
// These tests drive the REAL pages in Chrome. The backend suite (tests/*.test.js)
// covers Express + Supabase; nothing there executes src/js, so this layer is what
// protects the frontend — page scripts, navigation targets, and the mission flow.
//
// Chrome is NOT downloaded (puppeteer-core). It uses the browser already on the
// machine; set CHROME_PATH to override the auto-discovery below.

const fs = require('fs');
const puppeteer = require('puppeteer-core');

const BASE = process.env.UI_BASE_URL || 'http://localhost:3000/views';

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
].filter(Boolean);

function findChrome() {
  const hit = CHROME_CANDIDATES.find(p => { try { return fs.existsSync(p); } catch { return false; } });
  if (!hit) {
    throw new Error(
      'No Chrome/Edge found for the UI tests. Install Google Chrome, or point CHROME_PATH at a browser:\n' +
      '  CHROME_PATH="C:\\Path\\To\\chrome.exe" npm run test:ui'
    );
  }
  return hit;
}

async function launchBrowser() {
  return puppeteer.launch({
    executablePath: findChrome(),
    headless: 'new',
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  });
}

// A page with a logged-in session already seeded, so requireAuth() doesn't
// bounce us to home.html. Voice is muted: Voice.play() then fires its onEnd
// immediately, so flows that wait for narration to finish advance without
// falling back to their 8s safety timers.
async function newSeededPage(browser, session = {}) {
  const page = await browser.newPage();
  await page.evaluateOnNewDocument((s) => {
    localStorage.setItem('ce_session', JSON.stringify(s));
    localStorage.setItem('ce_voice', '0');
  }, {
    type: 'guest', displayName: 'UI Test', grade_group: '3-4', avatarId: 0, points: 0, ...session,
  });
  return page;
}

// Collect console errors + uncaught exceptions raised while `fn` runs.
// Missing-art 404s are a known prototype gap (see src/assets/ASSETS.md), so
// resource-load failures are ignored — this watches for real script errors.
async function collectErrors(page, fn) {
  const errors = [];
  const onConsole = m => { if (m.type() === 'error') errors.push(`console: ${m.text()}`); };
  const onPageErr = e => errors.push(`uncaught: ${e.message}`);
  page.on('console', onConsole);
  page.on('pageerror', onPageErr);
  try {
    await fn();
  } finally {
    page.off('console', onConsole);
    page.off('pageerror', onPageErr);
  }
  return errors.filter(e =>
    !/Failed to load resource/i.test(e) && !/net::ERR_/i.test(e) && !/status of 404/i.test(e));
}

const url = (p) => `${BASE}/${p}`;

const settle = (ms = 500) => new Promise(r => setTimeout(r, ms));

module.exports = { BASE, url, findChrome, launchBrowser, newSeededPage, collectErrors, settle };
