// Vanilla JavaScript (ES6 modules) — home.js
// ═══════════════════════════════════════════════════════════════════
// js/home.js — Home Screen Controller
//
// This file is the "brain" of the home screen. It connects:
//   - DOM elements (from home.html)
//   - Animations and dialogue (Features 1 & 4)
//   - Login/Register modal (Feature 2)
//   - Avatar picker (Feature 3)
//   - Navigation to map.html after successful auth
//
// WHY use ES6 modules? (type="module" in the script tag)
//   - We can use `import` to pull in other files (Storage, Typewriter)
//   - Code only runs after the HTML is fully loaded — no DOMContentLoaded needed
//   - Each file has its own scope, so variable names don't clash globally
// ═══════════════════════════════════════════════════════════════════

import Storage    from './utils/storage.js';
import Typewriter from './components/typewriter.js';
import { AVATARS, avatarImg } from './data/avatars.js';
import { showPopup } from './components/popup.js';

// ── Auth config (backend integration) ────────────────────────────
// The 12 secret icons map to icon_key_1 / icon_key_2 (values 1–12) in the
// backend `users` table, used for icon-based password recovery.
const ICONS = ['🌺','🦋','⭐','🌙','🐘','🦜','🍃','🎈','🐠','🌈','🦁','🌻'];

let loginGrade    = null;   // selected grade group on the Login form
let regGrade      = null;   // selected grade group on the Register form
let recoverGrade  = null;   // selected grade group on the Recover form
let selectedIcons = [];     // up to 2 chosen icon ids (1–12) on Register
let recoverIcons  = [];     // up to 2 chosen icon ids (1–12) on Recover

// ─────────────────────────────────────────────────────────────────
// SECTION 1 — DIALOGUE DATA
//
// Storing all text as data arrays is a key frontend pattern.
// It separates content from logic — you can update dialogue
// without touching any function code below.
// ─────────────────────────────────────────────────────────────────

const DIALOGUES = {

  // Rimau speaks with a Malay–English mix (authentic Malaysian feel)
  rimau: [
    'Selamat datang! Jom terokai Malaysia bersama!',
    'Wah! Saya Rimau! Siap untuk jelajah 13 negeri?',
    'Malaysia ada banyak tradisi unik — jom belajar!',
    'Kumpul stamps & points sambil jelajah! Let\'s go!',
    'Apa khabar, Explorer? Rimau sedia teman kamu!',
    'Setiap negeri ada cerita sendiri — jom cari!',
  ],

  // Shown inside the login modal when "Login" tab is active
  loginGreeting: [
    'Welcome back, Explorer! Ready for more adventures?',
    'Ah, you\'re back! Rimau missed you!',
    'Let\'s pick up where we left off!',
    'Malaysia is still waiting for you to finish exploring!',
  ],

  // Shown inside the login modal when "Register" tab is active
  registerGreeting: [
    'Yay, a new Explorer joins the adventure!',
    'New friend! Rimau is so happy to meet you!',
    'Welcome to the team, future Cultural Expert!',
    'Malaysia has 13 states to discover — let\'s start!',
  ],
};

// Pick one random item from an array
function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}


// ─────────────────────────────────────────────────────────────────
// SECTION 2 — MASCOT SYSTEM (Feature 1)
//
// On page load:
//   1. Mascot blocks slide in from the sides (CSS animation handles this)
//   2. We delay slightly, then type a random dialogue into each bubble
//
// On mascot click/tap:
//   3. Pick a new random dialogue and type it (makes it feel alive)
//
// WHY import Typewriter instead of writing it inline?
//   Typewriter is already built and tested. Reusing it keeps home.js
//   focused on home-screen logic, not text-animation implementation.
// ─────────────────────────────────────────────────────────────────

function typeMascotText(bubbleTextEl, text, delay = 0, twRef) {
  // Wrap in setTimeout to let slide-in animation finish first
  setTimeout(() => {
    if (twRef?.current) twRef.current.stop();
    const tw = new Typewriter(bubbleTextEl, text, { speed: 36 });
    twRef.current = tw;
    tw.start();
  }, delay);
}

// Rimau is the single mascot. This wires the optional landing-screen mascot
// (if the page provides #bubble-text-rimau / #emoji-rimau); it no-ops safely
// on the current LokaLearn home, which shows Rimau as a static illustration.
function initMascots(nickname = null) {
  const bubbleTextRimau = document.getElementById('bubble-text-rimau');
  const emojiRimau      = document.getElementById('emoji-rimau');

  if (!bubbleTextRimau) return;

  // Rimau greeting — if user is logged in, address them by nickname
  const rimauLine = nickname
    ? pickRandom([`Selamat datang, ${nickname}! Jom explore!`, `Hey ${nickname}! Rimau menunggu!`])
    : pickRandom(DIALOGUES.rimau);

  const rimauRef = { current: null };
  typeMascotText(bubbleTextRimau, rimauLine, 700, rimauRef);

  // Clicking/tapping the mascot shows a new random line
  const handleRimauClick = () => typeMascotText(bubbleTextRimau, pickRandom(DIALOGUES.rimau), 0, rimauRef);
  emojiRimau?.addEventListener('click',   handleRimauClick);
  emojiRimau?.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') handleRimauClick(); });
}


// ─────────────────────────────────────────────────────────────────
// SECTION 3 — AVATAR DATA (Feature 3)
//
// Avatars are defined here as a plain array of objects.
// WHY plain array vs. a class or database?
//   For a UI-only prototype like this, a simple array is the right
//   level of complexity. Adding a new avatar = one new object.
//   This data could later come from an API with no change to the UI code.
// ─────────────────────────────────────────────────────────────────

// AVATARS is imported from ./data/avatars.js (shared across all screens).
// We store the selected avatar as its NUMERIC INDEX so the topbar and
// dashboard can look it up the same way.

let selectedAvatarId = null;

// Build the avatar grid inside the modal by creating DOM nodes from the AVATARS array
function buildAvatarGrid() {
  const grid = document.getElementById('avatar-grid');
  if (!grid) return;

  grid.innerHTML = '';  // clear any previous render

  AVATARS.forEach((avatar, index) => {
    // We create a <button> so it's keyboard and touch accessible
    const btn = document.createElement('button');
    btn.className = 'avatar-item';
    btn.setAttribute('role', 'option');
    btn.setAttribute('aria-selected', 'false');
    btn.dataset.id = index;
    btn.innerHTML = `
      <span class="avatar-emoji">${avatarImg(index)}</span>
      <span class="avatar-name">${avatar.name}</span>
    `;

    btn.addEventListener('click', () => {
      // Deselect all, then select this one
      grid.querySelectorAll('.avatar-item').forEach(el => {
        el.classList.remove('selected');
        el.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('selected');
      btn.setAttribute('aria-selected', 'true');
      selectedAvatarId = index;

      // Enable the confirm button once a selection is made
      const confirmBtn = document.getElementById('btn-confirm-avatar');
      if (confirmBtn) confirmBtn.disabled = false;
    });

    grid.appendChild(btn);
  });
}


// ─────────────────────────────────────────────────────────────────
// SECTION 4 — MODAL MANAGEMENT (Feature 2)
//
// Two modals: login modal and avatar modal.
// They open/close by toggling the .is-open CSS class.
//
// WHY class toggle instead of style.display?
//   Toggling a class lets CSS define the full appearance including
//   animations. style.display is "imperative" (JS controls everything).
//   Class toggle is "declarative" — CSS handles the how, JS just
//   says when.
//
// WHY NOT use the HTML "hidden" attribute?
//   When an element has display:none (what "hidden" does), and you
//   un-hide it, the CSS animation has already "played" internally
//   and won't replay. Toggling .is-open avoids this problem.
// ─────────────────────────────────────────────────────────────────

const loginModal  = document.getElementById('login-modal');
const avatarModal = document.getElementById('avatar-modal');

function openModal(modalEl) {
  modalEl.classList.add('is-open');
  // Trap focus inside the modal for accessibility
  const firstFocusable = modalEl.querySelector('input, button:not([disabled])');
  setTimeout(() => firstFocusable?.focus(), 350);   // wait for slide-up to finish
}

function closeModal(modalEl) {
  modalEl.classList.remove('is-open');
}

function openLoginModal() {
  // Set mascot greeting text for the Login tab (default)
  const greetingEl = document.getElementById('modal-greeting');
  if (greetingEl) greetingEl.textContent = pickRandom(DIALOGUES.loginGreeting);
  openModal(loginModal);
}

function closeLoginModal() { closeModal(loginModal); }

function openAvatarModal() {
  closeLoginModal();
  buildAvatarGrid();
  openModal(avatarModal);
}

function closeAvatarModal() { closeModal(avatarModal); }

// Navigate into the game — land on the authenticated dashboard (home) page.
function enterGame() {
  window.location.href = 'dashboard.html';
}


// ─────────────────────────────────────────────────────────────────
// SECTION 5 — AUTHENTICATION LOGIC (Feature 2)
//
// All data lives in localStorage — a browser key-value store.
//
// HOW localStorage works:
//   localStorage.setItem('key', 'value')  — save a string
//   localStorage.getItem('key')           — read it back
//   localStorage.removeItem('key')        — delete it
//   Data persists across browser sessions (closing/reopening).
//
// We use Storage.js (our wrapper) instead of calling localStorage
// directly, so all data format decisions are in one place.
//
// sessionStorage works the same way but clears when the tab closes.
// We use localStorage here so students stay logged in across sessions.
// ─────────────────────────────────────────────────────────────────

function showError(elId, message) {
  const el = document.getElementById(elId);
  if (!el) return;
  el.textContent = message;
  el.classList.remove('hidden');
}

function clearError(elId) {
  const el = document.getElementById(elId);
  if (!el) return;
  el.textContent = '';
  el.classList.add('hidden');
}

// Login now calls the backend (POST /api/auth/login). The server checks the
// name + grade + password against the database (Supabase/Postgres) and sets an
// httpOnly session cookie. We mirror a lightweight session into localStorage so
// the rest of the MPA (which gates on Storage.getSession()) keeps working.
async function handleLogin(e) {
  e.preventDefault();  // stop the form from reloading the page
  clearError('login-error');

  const name     = document.getElementById('login-name').value.trim();
  const password = document.getElementById('login-password').value;

  if (!name)       return showError('login-error', '❌ Please enter your name.');
  if (!loginGrade) return showError('login-error', '❌ Please choose your grade.');
  if (!password)   return showError('login-error', '❌ Please enter your password.');

  try {
    const res = await fetch('/api/auth/login', {
      method:      'POST',
      headers:     { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ display_name: name, grade_group: loginGrade, password }),
    });
    const data = await res.json();

    if (!res.ok || !data.ok) {
      return showError('login-error', '❌ ' + (data.error || 'Login failed.'));
    }

    // Establish the session first (with grade_group) so per-account storage
    // resolves to the SAME namespace this account used at sign-up.
    const prev = Storage.getSession();
    Storage.setSession({
      type:        'registered',
      displayName: name,
      grade_group: loginGrade,
      avatarId:    null,
      points:      prev?.points ?? 0,
    });

    // Restore the avatar this account last equipped (saved per-account, so it
    // survives logout). If none was ever picked, prompt to choose one.
    const savedAvatar = Storage.getCurrentAvatar();
    if (savedAvatar != null) {
      const s = Storage.getSession();
      s.avatarId = savedAvatar;
      Storage.setSession(s);
      enterGame();
    } else {
      openAvatarModal();
    }
  } catch (err) {
    showError('login-error', '❌ Could not reach the server. Is it running (npm start)?');
  }
}

// Register now calls the backend (POST /api/auth/register), which inserts a row
// into the `users` table. Grade 1–2 accounts get an auto-generated password
// returned in the response (shown once, like a teacher hand-out).
async function handleRegister(e) {
  e.preventDefault();
  clearError('reg-error');

  const name     = document.getElementById('reg-name').value.trim();
  const password = document.getElementById('reg-password').value;

  if (!name)                       return showError('reg-error', '❌ Please enter your name.');
  if (!/^[a-zA-Z ]{1,20}$/.test(name))
                                   return showError('reg-error', '❌ Name must be letters only (max 20).');
  if (!regGrade)                   return showError('reg-error', '❌ Please choose your grade.');
  if (selectedIcons.length !== 2)  return showError('reg-error', '❌ Pick exactly 2 secret icons.');
  if (regGrade !== '1-3' && password.length < 6)
                                   return showError('reg-error', '❌ Password must be at least 6 characters.');

  const body = {
    display_name: name,
    grade_group:  regGrade,
    icon_key_1:   selectedIcons[0],
    icon_key_2:   selectedIcons[1],
  };
  if (regGrade !== '1-3') body.password = password;

  try {
    const res = await fetch('/api/auth/register', {
      method:      'POST',
      headers:     { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body),
    });
    const data = await res.json();

    if (!res.ok || !data.ok) {
      return showError('reg-error', '❌ ' + (data.error || 'Registration failed.'));
    }

    // Grade 1–3: reveal the auto-generated password once. Await so the child
    // (or teacher) reads and writes it down before the avatar picker opens.
    if (data.auto_password) {
      await showPopup({
        title: 'Account created! 🎉',
        emoji: '🔑',
        message: `Your automatic password is<br>
          <strong style="font-size:22px; letter-spacing:1px;">${data.auto_password}</strong><br><br>
          Write it down — you'll use it to log in next time!`,
        actions: [{ label: "Got it!", value: true, style: 'primary' }],
      });
    }

    Storage.setSession({ type: 'registered', displayName: name, grade_group: regGrade, avatarId: null, points: 0 });

    // Brand-new account → start fresh: clear any stale local progress under this
    // (name+grade) namespace so old points/stamps aren't inherited.
    Storage.reset();
    openAvatarModal();   // new users pick an avatar before entering
  } catch (err) {
    showError('reg-error', '❌ Could not reach the server. Is it running (npm start)?');
  }
}

// ── Grade selector + secret-icon picker wiring ───────────────────
function initGradeSelect(groupId, onSelect) {
  const group = document.getElementById(groupId);
  if (!group) return;
  group.querySelectorAll('.grade-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      group.querySelectorAll('.grade-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      onSelect(btn.dataset.grade);
    });
  });
}

// Build a 12-icon picker into `gridId`, recording up to 2 taps (in order)
// into the passed-in `selectedArr` (mutated in place by reference).
function buildIconPicker(gridId, selectedArr) {
  const grid = document.getElementById(gridId);
  if (!grid) return;
  grid.innerHTML = ICONS.map((ic, i) =>
    `<button type="button" class="icon-pick" data-icon="${i + 1}" aria-label="Secret icon ${i + 1}">${ic}</button>`
  ).join('');

  grid.querySelectorAll('.icon-pick').forEach(btn => {
    btn.addEventListener('click', () => {
      const val = parseInt(btn.dataset.icon, 10);
      const idx = selectedArr.indexOf(val);
      if (idx >= 0) {
        selectedArr.splice(idx, 1);
        btn.classList.remove('selected');
      } else if (selectedArr.length < 2) {
        selectedArr.push(val);
        btn.classList.add('selected');
      }
    });
  });
}

// ── Forgot-password / icon recovery ──────────────────────────────
// Switches the modal between the login/register tabs and the recovery
// form (which lives in the same modal card).
function showRecoverView() {
  document.querySelector('.modal-tabs')?.classList.add('hidden');
  document.getElementById('form-login')?.classList.add('hidden');
  document.getElementById('form-register')?.classList.add('hidden');
  document.getElementById('form-recover')?.classList.remove('hidden');
  clearError('login-error');
  clearError('recover-error');
  document.getElementById('recover-success')?.classList.add('hidden');
}

function showLoginView() {
  document.querySelector('.modal-tabs')?.classList.remove('hidden');
  document.getElementById('form-recover')?.classList.add('hidden');
  document.getElementById('form-register')?.classList.add('hidden');
  document.getElementById('form-login')?.classList.remove('hidden');
  clearError('recover-error');
}

// Recovery: verify name + grade + the 2 secret icons. Grade 1–3 gets their
// password revealed; Grade 4+ sets a brand-new password.
async function handleRecover(e) {
  e.preventDefault();
  clearError('recover-error');
  document.getElementById('recover-success')?.classList.add('hidden');

  const name  = document.getElementById('recover-name').value.trim();
  const newpw = document.getElementById('recover-newpw').value;

  if (!name)                          return showError('recover-error', '❌ Please enter your name.');
  if (!recoverGrade)                  return showError('recover-error', '❌ Please choose your grade.');
  if (recoverIcons.length !== 2)      return showError('recover-error', '❌ Tap your 2 secret icons (in order).');
  if (recoverGrade !== '1-3' && newpw.length < 6)
                                      return showError('recover-error', '❌ New password must be at least 6 characters.');

  const body = {
    display_name: name,
    grade_group:  recoverGrade,
    icon_key_1:   recoverIcons[0],
    icon_key_2:   recoverIcons[1],
  };
  if (recoverGrade !== '1-3') body.new_password = newpw;

  try {
    const res = await fetch('/api/auth/recover', {
      method:      'POST',
      headers:     { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body),
    });
    const data = await res.json();

    if (!res.ok || !data.ok) {
      return showError('recover-error', '❌ ' + (data.error || 'Recovery failed.'));
    }

    // Require an explicit acknowledgement so the revealed password (Grade 1–3)
    // isn't missed, then return to the login form so they can sign in.
    if (data.revealed_password) {
      await showPopup({
        title: 'Success! 🎉',
        emoji: '🔑',
        message: `Your password is<br>
          <strong style="font-size:22px; letter-spacing:1px;">${data.revealed_password}</strong><br><br>
          Write it down — you'll use it to log in!`,
        actions: [{ label: "Got it!", value: true, style: 'primary' }],
      });
    } else {
      await showPopup({
        title: 'Password updated! ✅',
        emoji: '🔓',
        message: 'You can log in now with your new password.',
        actions: [{ label: 'Go to login', value: true, style: 'primary' }],
      });
    }
    showLoginView();
  } catch (err) {
    showError('recover-error', '❌ Could not reach the server. Is it running (npm start)?');
  }
}

function handleGuest() {
  // Create a random guest name and skip the avatar picker
  const guestName = 'Explorer' + Math.floor(Math.random() * 9000 + 1000);
  Storage.setGuest(guestName, null);
  enterGame();
}


// ─────────────────────────────────────────────────────────────────
// SECTION 6 — TAB SWITCHING
//
// The modal has two tabs: Login and Register.
// Clicking a tab shows one form and hides the other.
// The mascot's greeting text also updates to match the context.
//
// WHY "data-tab" attribute?
//   Using a data attribute on the button (data-tab="login")
//   lets us read the target in one line without hardcoding IDs.
//   This pattern scales cleanly — adding a third tab takes one line.
// ─────────────────────────────────────────────────────────────────

function initTabs() {
  const tabs         = document.querySelectorAll('.tab-btn');
  const formLogin    = document.getElementById('form-login');
  const formRegister = document.getElementById('form-register');
  const greetingEl   = document.getElementById('modal-greeting');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Update tab active state
      tabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      const isLogin = tab.dataset.tab === 'login';

      // Toggle form visibility
      formLogin?.classList.toggle('hidden', !isLogin);
      formRegister?.classList.toggle('hidden', isLogin);

      // Update mascot speech to match the context
      if (greetingEl) {
        greetingEl.textContent = pickRandom(
          isLogin ? DIALOGUES.loginGreeting : DIALOGUES.registerGreeting
        );
      }

      // Clear any previous error messages when switching tabs
      clearError('login-error');
      clearError('reg-error');
    });
  });
}


// ─────────────────────────────────────────────────────────────────
// SECTION 7 — EVENT WIRING & INITIALISATION
//
// This is the "main" function — called once on page load.
// It wires all the DOM elements to their handler functions.
//
// Pattern: define handlers above, wire them here at the bottom.
// This keeps the file readable top-to-bottom like a story.
// ─────────────────────────────────────────────────────────────────

function init() {
  // ── Check for an existing session ──
  // IMPORTANT: we do NOT return early here even if a session exists.
  // Returning early was the bug — it exited before any event listeners
  // were attached, so the button click did nothing.
  const session = Storage.getSession();

  // Mascots always animate in, personalised if already logged in
  initMascots(session?.displayName ?? null);

  // Tab switching always needs to be wired (modal may still open)
  initTabs();

  // Grade selectors (login + register) and the register secret-icon picker
  initGradeSelect('login-grade', g => { loginGrade = g; });
  initGradeSelect('reg-grade', g => {
    regGrade = g;
    // Grade 1–3 gets an auto-generated password, so hide the password field.
    const pw   = document.getElementById('reg-password');
    const hint = document.getElementById('reg-pw-hint');
    const isAuto = g === '1-3';
    pw?.classList.toggle('hidden', isAuto);
    hint?.classList.toggle('hidden', !isAuto);
  });
  initGradeSelect('recover-grade', g => {
    recoverGrade = g;
    // Grade 1–3 has its password revealed; Grade 4+ types a new one.
    const newpw = document.getElementById('recover-newpw');
    newpw?.classList.toggle('hidden', g === '1-3');
  });
  buildIconPicker('reg-icons', selectedIcons);
  buildIconPicker('recover-icons', recoverIcons);

  // Forgot-password navigation + recover form submit
  document.getElementById('link-forgot')?.addEventListener('click', showRecoverView);
  document.getElementById('link-back-login')?.addEventListener('click', showLoginView);
  document.getElementById('form-recover')?.addEventListener('submit', handleRecover);

  // ── Button: "START GAME" ──
  // The auth flow now lives on dedicated screens (login.html → signup.html /
  // recover.html) rather than the in-page modal. From the main page:
  //   Registered user → straight to the game (map).
  //   Guest user      → straight to the game (they chose guest already), but
  //                     they can still log in/register from the login screen.
  //   No session      → the login screen (which links to Sign Up + Guest).
  const startBtn = document.getElementById('btn-start');
  if (startBtn) {
    if (session && (session.type === 'registered' || session.type === 'guest')) {
      // Already signed in → go to the authenticated Home (greeting + Continue).
      startBtn.textContent = 'Continue Exploring!';
      startBtn.addEventListener('click', () => { window.location.href = 'dashboard.html'; });
    } else {
      startBtn.addEventListener('click', () => { window.location.href = 'login.html'; });
    }
  }

  // ── Button: close the login modal ──
  document.getElementById('btn-modal-close')
    ?.addEventListener('click', closeLoginModal);

  // ── Clicking the dark overlay backdrop also closes the modal ──
  loginModal?.addEventListener('click', e => {
    if (e.target === loginModal) closeLoginModal();
  });
  avatarModal?.addEventListener('click', e => {
    if (e.target === avatarModal) closeAvatarModal();
  });

  // ── Escape key closes any open modal ──
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    if (loginModal.classList.contains('is-open'))  closeLoginModal();
    if (avatarModal.classList.contains('is-open')) closeAvatarModal();
  });

  // ── Login and Register form submissions ──
  document.getElementById('form-login')
    ?.addEventListener('submit', handleLogin);
  document.getElementById('form-register')
    ?.addEventListener('submit', handleRegister);

  // ── Guest button ──
  document.getElementById('btn-guest-modal')
    ?.addEventListener('click', handleGuest);

  // ── Avatar confirm button ──
  document.getElementById('btn-confirm-avatar')
    ?.addEventListener('click', () => {
      if (selectedAvatarId == null) return;
      Storage.setSessionAvatar(selectedAvatarId);
      enterGame();
    });

  // ── How to Play ──
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

// Run everything — because type="module" defers execution,
// the DOM is already ready when this line runs.
init();
