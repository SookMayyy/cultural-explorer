// public/js/app.js
// SPA router + topbar/navbar renderer + app boot

import Storage from './utils/storage.js';
import HomePage     from './pages/homePage.js';
import LoginPage    from './pages/loginPage.js';
import MapPage      from './pages/mapPage.js';
import NarrativePage from './pages/narrativePage.js';
import QuizPage     from './pages/quizPage.js';
import StampPage    from './pages/stampPage.js';
import RewardPage   from './pages/rewardPage.js';
import DashboardPage from './pages/dashboardPage.js';
import TeacherPage  from './pages/teacherPage.js';

// ─── App-wide state ────────────────────────────────────────────────
export const AppState = {
  session:        null,   // { type, displayName, avatarId, points, ... }
  currentStateId: null,   // last selected state
};

// ─── Page registry ─────────────────────────────────────────────────
const PAGES = {
  home:      HomePage,
  login:     LoginPage,
  map:       MapPage,
  narrative: NarrativePage,
  quiz:      QuizPage,
  stampbook: StampPage,
  reward:    RewardPage,
  dashboard: DashboardPage,
  teacher:   TeacherPage,
};

// ─── Navigate ──────────────────────────────────────────────────────
export function navigate(screenId, params = {}) {
  // Hide all screens
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));

  const screen = document.getElementById('screen-' + screenId);
  if (!screen) { console.warn('[Router] Unknown screen:', screenId); return; }

  const page = PAGES[screenId];
  if (!page) { console.warn('[Router] No page handler for:', screenId); return; }

  // Re-show topbar/navbar (reward page hides them; restore here for others)
  const topbarEl = document.getElementById('topbar');
  const navbarEl = document.getElementById('navbar');
  if (topbarEl) topbarEl.hidden = false;
  if (navbarEl) navbarEl.hidden = false;

  // Render screen
  screen.innerHTML = '';
  page.render(screen, params);
  screen.classList.add('active');
  page.init?.(screen, params);

  window.scrollTo({ top: 0, behavior: 'instant' });
}

// ─── Topbar renderer ───────────────────────────────────────────────
export function renderTopbar(opts = {}) {
  const {
    title       = 'Cultural Explorer MY',
    showBack    = false,
    backTarget  = 'map',
    showPoints  = false,
    showAvatar  = false,
    accentColor = null,
  } = opts;

  const topbarEl = document.getElementById('topbar');
  if (!topbarEl) return;

  const session = AppState.session || {};
  const points  = Storage.getPoints();

  topbarEl.hidden = false;
  topbarEl.style.background = accentColor ? accentColor : '';
  topbarEl.innerHTML = `
    <div class="topbar-left">
      ${showBack ? `<button class="topbar-back" id="topbar-back">‹</button>` : ''}
      <span class="topbar-title">${title}</span>
    </div>
    <div class="topbar-right">
      ${showPoints ? `<div class="topbar-points">⭐ ${points}</div>` : ''}
      ${showAvatar ? `<div class="topbar-avatar" id="topbar-avatar">${_avatarEmoji(session.avatarId)}</div>` : ''}
    </div>
  `;

  if (showBack) {
    topbarEl.querySelector('#topbar-back')?.addEventListener('click', () => navigate(backTarget));
  }
  if (showAvatar) {
    topbarEl.querySelector('#topbar-avatar')?.addEventListener('click', () => navigate('dashboard'));
  }
}

// ─── Navbar renderer ───────────────────────────────────────────────
const NAV_ITEMS = [
  { id: 'map',       icon: '🗺️',  label: 'Map'    },
  { id: 'stampbook', icon: '📚',  label: 'Stamps' },
  { id: 'dashboard', icon: '📊',  label: 'Progress'},
];

export function renderNavbar(activeId = '') {
  const navbarEl = document.getElementById('navbar');
  if (!navbarEl) return;

  navbarEl.hidden = false;
  navbarEl.innerHTML = NAV_ITEMS.map(item => `
    <button class="nav-item ${item.id === activeId ? 'active' : ''}" data-nav="${item.id}">
      <span class="nav-icon">${item.icon}</span>
      <span>${item.label}</span>
    </button>
  `).join('');

  navbarEl.querySelectorAll('[data-nav]').forEach(btn => {
    btn.addEventListener('click', () => navigate(btn.dataset.nav));
  });
}

// ─── Helpers ───────────────────────────────────────────────────────
const AVATARS = ['🦁','🐘','🦧','🦜','🐯','🦊','🦎','🦀','🐊','🦋',
                 '🦚','🦃','🦤','🦞','🦅','🦩','🐢','🐬','🦈','🦦'];

function _avatarEmoji(avatarId) {
  if (avatarId === null || avatarId === undefined) return '👤';
  return AVATARS[avatarId] || '👤';
}

// ─── Boot ──────────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  const session = Storage.getSession();
  if (session) {
    AppState.session = session;
    navigate('map');
  } else {
    navigate('home', {
      onLogin: (loginData) => {
        AppState.session = loginData;
        Storage.setSession(loginData);
        navigate('map');
      },
    });
  }
});
