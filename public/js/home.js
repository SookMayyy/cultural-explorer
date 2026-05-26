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
    'Selamat datang! Jom terokai Malaysia bersama! 🐯',
    'Wah! Saya Rimau! Siap untuk jelajah 13 negeri? 🗺️',
    'Malaysia ada banyak tradisi unik — jom belajar! ✨',
    'Kumpul stamps & points sambil jelajah! Let\'s go! 🌟',
    'Apa khabar, Explorer? Rimau sedia teman kamu! 🐾',
    'Setiap negeri ada cerita sendiri — jom cari! 🏛️',
  ],

  // Wak speaks with a different tone — East Malaysian, hornbill energy
  wak: [
    'Hello from Borneo! I\'m Wak the Hornbill! 🦜',
    'Sabah & Sarawak are waiting for you, friend! 🌴',
    'East Malaysia ada banyak keajaiban! Come see! 🏔️',
    'Wak dah jelajah Borneo — sekarang giliran kamu! 🌿',
    'Our cultures are so unique — come discover them! 🎶',
    'Iban, Kadazan, Melanau... so many stories! 📖',
  ],

  // Shown inside the login modal when "Login" tab is active
  loginGreeting: [
    'Welcome back, Explorer! Ready for more adventures? 🎉',
    'Ah, you\'re back! Rimau missed you! 🐯',
    'Let\'s pick up where we left off! 🗺️',
    'Malaysia is still waiting for you to finish exploring! 🌏',
  ],

  // Shown inside the login modal when "Register" tab is active
  registerGreeting: [
    'Yay, a new Explorer joins the adventure! 🌟',
    'New friend! Wak is so happy to meet you! 🦜',
    'Welcome to the team, future Cultural Expert! 🏆',
    'Malaysia has 13 states to discover — let\'s start! 🗺️',
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

// Track active Typewriter instances so we can stop them before starting new ones
let twRimau = null;
let twWak   = null;

function typeMascotText(bubbleTextEl, text, delay = 0, twRef) {
  // Wrap in setTimeout to let slide-in animation finish first
  setTimeout(() => {
    if (twRef?.current) twRef.current.stop();
    const tw = new Typewriter(bubbleTextEl, text, { speed: 36 });
    twRef.current = tw;
    tw.start();
  }, delay);
}

function initMascots(nickname = null) {
  const bubbleTextRimau = document.getElementById('bubble-text-rimau');
  const bubbleTextWak   = document.getElementById('bubble-text-wak');
  const emojiRimau      = document.getElementById('emoji-rimau');
  const emojiWak        = document.getElementById('emoji-wak');

  if (!bubbleTextRimau || !bubbleTextWak) return;

  // Rimau greeting — if user is logged in, address them by nickname
  const rimauLine = nickname
    ? pickRandom([`Selamat datang, ${nickname}! Jom explore! 🐯`, `Hey ${nickname}! Rimau menunggu! 🗺️`])
    : pickRandom(DIALOGUES.rimau);

  const rimauRef = { current: null };
  const wakRef   = { current: null };

  // Type Rimau's line first, Wak's line shortly after (staggered)
  typeMascotText(bubbleTextRimau, rimauLine, 700, rimauRef);
  typeMascotText(bubbleTextWak,   pickRandom(DIALOGUES.wak), 1050, wakRef);

  // Clicking/tapping a mascot shows a new random line
  const handleRimauClick = () => typeMascotText(bubbleTextRimau, pickRandom(DIALOGUES.rimau), 0, rimauRef);
  const handleWakClick   = () => typeMascotText(bubbleTextWak,   pickRandom(DIALOGUES.wak),   0, wakRef);

  emojiRimau?.addEventListener('click',   handleRimauClick);
  emojiWak?.addEventListener('click',     handleWakClick);

  // Keyboard support: Enter or Space also triggers the dialogue
  emojiRimau?.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') handleRimauClick(); });
  emojiWak?.addEventListener('keydown',   e => { if (e.key === 'Enter' || e.key === ' ') handleWakClick(); });
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

const AVATARS = [
  { id: 'tiger',     emoji: '🐯', name: 'Tiger Cub'  },
  { id: 'hornbill',  emoji: '🦜', name: 'Hornbill'   },
  { id: 'elephant',  emoji: '🐘', name: 'Elephant'   },
  { id: 'butterfly', emoji: '🦋', name: 'Butterfly'  },
  { id: 'turtle',    emoji: '🐢', name: 'Turtle'     },
  { id: 'monkey',    emoji: '🐒', name: 'Monyet'     },
  { id: 'owl',       emoji: '🦉', name: 'Owl'        },
  { id: 'panda',     emoji: '🐼', name: 'Panda'      },
];

let selectedAvatarId = null;

// Build the avatar grid inside the modal by creating DOM nodes from the AVATARS array
function buildAvatarGrid() {
  const grid = document.getElementById('avatar-grid');
  if (!grid) return;

  grid.innerHTML = '';  // clear any previous render

  AVATARS.forEach(avatar => {
    // We create a <button> so it's keyboard and touch accessible
    const btn = document.createElement('button');
    btn.className = 'avatar-item';
    btn.setAttribute('role', 'option');
    btn.setAttribute('aria-selected', 'false');
    btn.dataset.id = avatar.id;
    btn.innerHTML = `
      <span class="avatar-emoji">${avatar.emoji}</span>
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
      selectedAvatarId = avatar.id;

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

// Navigate into the game
function enterGame() {
  window.location.href = 'map.html';
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

function handleLogin(e) {
  e.preventDefault();  // stop the form from reloading the page

  const username = document.getElementById('login-username').value;
  const password = document.getElementById('login-password').value;
  clearError('login-error');

  const result = Storage.loginUser(username, password);

  if (result.ok) {
    // If the user never chose an avatar, show the picker
    if (!result.user.avatarId) {
      openAvatarModal();
    } else {
      enterGame();
    }
  } else {
    showError('login-error', '❌ ' + result.error);
  }
}

function handleRegister(e) {
  e.preventDefault();

  const nickname = document.getElementById('reg-nickname').value;
  const username = document.getElementById('reg-username').value;
  const password = document.getElementById('reg-password').value;
  clearError('reg-error');

  const result = Storage.registerUser(nickname, username, password);

  if (result.ok) {
    // New users always pick an avatar before entering
    openAvatarModal();
  } else {
    showError('reg-error', '❌ ' + result.error);
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

  // ── Button: "Start Exploring!" ──
  // If already logged in → go to game directly (no modal needed).
  // If not logged in → open the login modal.
  const startBtn = document.getElementById('btn-start');
  if (startBtn) {
    if (session) {
      startBtn.textContent = 'Continue Exploring! 🗺️';
      startBtn.addEventListener('click', enterGame);
    } else {
      startBtn.addEventListener('click', openLoginModal);
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
      if (!selectedAvatarId) return;
      Storage.setSessionAvatar(selectedAvatarId);
      enterGame();
    });

  // ── How to Play (placeholder for now) ──
  document.getElementById('btn-how-to-play')
    ?.addEventListener('click', () => {
      alert('Tutorial coming soon! 🎮\n\nFor now: explore states on the map, answer quizzes, earn stamps!');
    });
}

// Run everything — because type="module" defers execution,
// the DOM is already ready when this line runs.
init();
