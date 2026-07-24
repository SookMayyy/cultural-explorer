/* ui.js — shared topbar, navbar, and toast helpers for all MPA pages */

import Storage from './utils/storage.js';
import { avatarStackHTML } from './utils/avatarDisplay.js';
import { escapeHtml, restartAnimation } from './utils/dom.js';

// Scale the UI up on desktop-class monitors only: screen.width ignores window size and page zoom.
if (screen.width >= 1500) document.documentElement.classList.add('big-ui');

/* Profile colour */

// Publish the player's profile colour as --profile-color for any surface to theme with.
export function applyProfileColor() {
  const c = Storage.getProfileColor();
  document.documentElement.style.setProperty('--profile-color', c);
  return c;
}

/* Topbar */

// A transparent strip: back button (left) + points and profile avatar (right).
// title/colour params are kept for back-compat but no longer drawn.
export function renderTopbar({
  showBack   = false,
  backHref   = 'map.html',
  title      = '',
} = {}) {
  applyProfileColor();

  const el = document.getElementById('topbar');
  if (!el) return;

  const session = Storage.getSession() || {};
  const points  = Storage.getPoints();
  const avatar  = avatarStackHTML(session.avatarId ?? 0);

  const safeTitle = escapeHtml(title);

  // The bar is transparent by design (see base .topbar in style.css) — the back
  // button + points + profile float over the screen, no bar behind them.
  el.innerHTML = `
    <div class="topbar-left">
      ${showBack ? `<a class="topbar-back" href="${backHref}" aria-label="Back"><img src="../assets/images/ui/back-button.png" alt=""></a>` : ''}
      ${safeTitle ? `<span class="topbar-title">${safeTitle}</span>` : ''}
    </div>
    <div class="topbar-right">
      <div class="topbar-points"><span class="topbar-points-star">⭐</span><span class="topbar-points-val">${points}</span></div>
      <a class="topbar-avatar" href="settings.html" aria-label="Profile">${avatar}</a>
    </div>
  `;
  bindPointsSync();
}

// Keep the topbar ⭐ badge in sync with Storage via a single 'ce:points' listener.
// The number bumps (and flashes red when it drops) so spends/earns read as live.
let _pointsSyncBound = false;
function bindPointsSync() {
  if (_pointsSyncBound || typeof window === 'undefined') return;
  _pointsSyncBound = true;
  window.addEventListener('ce:points', (e) => {
    const valEl = document.querySelector('.topbar-points-val');
    if (!valEl) return;
    const prev  = parseInt(valEl.textContent, 10) || 0;
    const total = (e.detail != null) ? e.detail : Storage.getPoints();
    valEl.textContent = total;

    const badge = valEl.closest('.topbar-points');
    if (!badge) return;
    // Flash coral for ~1s on a spend, then revert — don't stay red until the
    // next earn (which may never come, e.g. a mission where points aren't banked).
    clearTimeout(badge._spendTimer);
    if (total < prev) {
      badge.classList.add('is-spend');
      badge._spendTimer = setTimeout(() => badge.classList.remove('is-spend'), 1000);
    } else {
      badge.classList.remove('is-spend');
    }
    restartAnimation(badge, 'points-bump');
  });
}

/* Navbar */

// Image icons, consistent with the static bottom-nav on the standalone screens.
const NAV_ITEMS = [
  { id: 'home',      href: 'dashboard.html', img: '../assets/images/ui/home-icon.png',    label: 'Home'    },
  { id: 'map',       href: 'map.html',       img: '../assets/images/ui/my-map-icon.png',  label: 'Map'     },
  { id: 'stampbook',  href: 'stampbook.html',  img: '../assets/images/ui/stamp-icon.png',   label: 'Stamps' },
  // Activities Hub — quiz-icon.png reused until a dedicated icon is exported.
  { id: 'activities', href: 'activities.html', img: '../assets/images/ui/quiz-icon.png',    label: 'Activities' },
  { id: 'settings',   href: 'settings.html',   img: '../assets/images/ui/setting-icon.png', label: 'Me'     },
];

export function renderNavbar(activeId = '') {
  const el = document.getElementById('navbar');
  if (!el) return;

  el.className = 'bottom-nav';   // shared bar + active-pill styles from style.css

  el.innerHTML = NAV_ITEMS.map(item => `
    <a class="map-nav-item ${item.id === activeId ? 'active' : ''}" href="${item.href}">
      <img src="${item.img}" alt="" class="nav-icon">
      <span>${item.label}</span>
    </a>
  `).join('');
}

/* Auth guard — redirect to home if not logged in */
export function requireAuth() {
  const session = Storage.getSession();
  if (!session) {
    window.location.href = 'home.html';
    return false;
  }
  return session;
}

/* Toast notification */
export function showToast(msg, duration = 2500) {
  let el = document.querySelector('.toast');
  if (!el) {
    el = document.createElement('div');
    el.className = 'toast';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), duration);
}

/* Points fly-up ("+10" floats up from an element) */

// One-shot "+N" (or "−N" in coral) over `anchorEl`. Decorative only — the caller
// updates the real total via Storage.
export function flyPoints(anchorEl, n) {
  if (!anchorEl || !n) return;
  // Absolutely positioned, so the anchor needs a positioning context.
  const cs = getComputedStyle(anchorEl);
  if (cs.position === 'static') anchorEl.style.position = 'relative';

  const tag = document.createElement('span');
  tag.className = 'fly-up';
  if (n > 0) {
    tag.textContent = `+${n}`;
  } else {
    tag.textContent = `−${Math.abs(n)}`;
    tag.style.color = 'var(--clr-coral)';
  }
  tag.style.top = '4px';
  anchorEl.appendChild(tag);
  setTimeout(() => tag.remove(), 900);
}

/* Get state from URL param (?state=penang), falling back to stored current state */
export function getStateParam() {
  return new URLSearchParams(window.location.search).get('state')
      || Storage.getCurrentState();
}
