// Vanilla JavaScript (ES6 modules) — home.js
// ═══════════════════════════════════════════════════════════════════
// js/home.js — Landing screen controller.
//
// The landing page is a single scaled "stage" with the LokaLearn wordmark,
// Rimau, and two buttons (START GAME / HOW TO PLAY). The actual auth flow lives
// on its own screens (login.html → signup.html / recover.html) — the old in-page
// login/register/recover/avatar modals were removed so there is ONE auth surface
// to maintain. This file now only:
//   - animates the optional landing mascot bubble (Feature 1)
//   - fills the state count into the description from STATE_COUNT
//   - routes START GAME (returning player → dashboard, otherwise → login.html)
//   - shows the HOW TO PLAY popup
// ═══════════════════════════════════════════════════════════════════

import Storage    from './utils/storage.js';
import Typewriter from './components/typewriter.js';
import { showPopup } from './components/popup.js';
import { STATE_COUNT } from './data/states.js';

// ─────────────────────────────────────────────────────────────────
// SECTION 1 — DIALOGUE DATA
//
// Storing text as data keeps content separate from logic.
// ─────────────────────────────────────────────────────────────────

const DIALOGUES = {
  // Rimau speaks with a Malay–English mix (authentic Malaysian feel).
  rimau: [
    'Selamat datang! Jom terokai Malaysia bersama!',
    `Wah! Saya Rimau! Siap untuk jelajah ${STATE_COUNT} negeri?`,
    'Malaysia ada banyak tradisi unik — jom belajar!',
    'Kumpul stamps & points sambil jelajah! Let\'s go!',
    'Apa khabar, Explorer? Rimau sedia teman kamu!',
    'Setiap negeri ada cerita sendiri — jom cari!',
  ],
};

// Pick one random item from an array
function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}


// ─────────────────────────────────────────────────────────────────
// SECTION 2 — MASCOT SYSTEM (Feature 1)
//
// Wires the OPTIONAL landing-screen mascot bubble (if the page provides
// #bubble-text-rimau / #emoji-rimau). It no-ops safely on the current
// LokaLearn home, which shows Rimau as a static illustration.
// ─────────────────────────────────────────────────────────────────

function typeMascotText(bubbleTextEl, text, delay = 0, twRef) {
  setTimeout(() => {
    if (twRef?.current) twRef.current.stop();
    const tw = new Typewriter(bubbleTextEl, text, { speed: 36 });
    twRef.current = tw;
    tw.start();
  }, delay);
}

function initMascots(nickname = null) {
  const bubbleTextRimau = document.getElementById('bubble-text-rimau');
  const emojiRimau      = document.getElementById('emoji-rimau');

  if (!bubbleTextRimau) return;

  const rimauLine = nickname
    ? pickRandom([`Selamat datang, ${nickname}! Jom explore!`, `Hey ${nickname}! Rimau menunggu!`])
    : pickRandom(DIALOGUES.rimau);

  const rimauRef = { current: null };
  typeMascotText(bubbleTextRimau, rimauLine, 700, rimauRef);

  const handleRimauClick = () => typeMascotText(bubbleTextRimau, pickRandom(DIALOGUES.rimau), 0, rimauRef);
  emojiRimau?.addEventListener('click',   handleRimauClick);
  emojiRimau?.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') handleRimauClick(); });
}


// ─────────────────────────────────────────────────────────────────
// SECTION 3 — INITIALISATION
// ─────────────────────────────────────────────────────────────────

function init() {
  const session = Storage.getSession();

  // Mascot animates in, personalised if already logged in.
  initMascots(session?.displayName ?? null);

  // Drive the state count in the description from the single constant.
  const desc = document.getElementById('pb-desc');
  if (desc) {
    desc.innerHTML =
      `Explore Malaysia&rsquo;s ${STATE_COUNT} states, discover traditions, ` +
      `foods and festivals &mdash; earn stamps as you go!`;
  }

  // ── Button: "START GAME" ──
  //   Registered/guest user → the authenticated Home (dashboard).
  //   No session           → the login screen (which links to Sign Up + Guest).
  const startBtn = document.getElementById('btn-start');
  if (startBtn) {
    if (session && (session.type === 'registered' || session.type === 'guest')) {
      startBtn.textContent = 'Continue Exploring!';
      startBtn.addEventListener('click', () => { window.location.href = 'dashboard.html'; });
    } else {
      startBtn.addEventListener('click', () => { window.location.href = 'login.html'; });
    }
  }

  // ── Button: "HOW TO PLAY" ──
  document.getElementById('btn-how-to-play')
    ?.addEventListener('click', () => {
      showPopup({
        title: 'How to Play',
        emoji: '🎮',
        message: `1. Tap a state on the map to explore it.<br>
          2. Read the culture cards and play the mini-games.<br>
          3. Answer quizzes to earn points.<br>
          4. Collect a stamp for every state you finish!`,
        actions: [{ label: "Let's go!", value: true, style: 'primary' }],
      });
    });
}

// Run everything — type="module" defers execution, so the DOM is ready.
init();
