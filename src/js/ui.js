// js/ui.js — shared topbar, navbar, and toast helpers for all MPA pages

import Storage from './utils/storage.js';
import { avatarStackHTML } from './utils/avatarDisplay.js';

// ── Topbar ──────────────────────────────────────────────────────────────────
export function renderTopbar({
  title      = 'Cultural Explorer MY',
  showBack   = false,
  backHref   = 'map.html',
  showPoints = false,
  showAvatar = false,
  color      = null,
} = {}) {
  const el = document.getElementById('topbar');
  if (!el) return;

  const session = Storage.getSession() || {};
  const points  = Storage.getPoints();
  const avatar  = avatarStackHTML(session.avatarId ?? 0);

  el.style.background = color || '';
  el.innerHTML = `
    <div class="topbar-left">
      ${showBack ? `<a class="topbar-back" href="${backHref}" aria-label="Back"><img src="../assets/images/ui/back-button.png" alt=""></a>` : ''}
      <span class="topbar-title">${title}</span>
    </div>
    <div class="topbar-right">
      ${showPoints ? `<div class="topbar-points"><span class="topbar-points-star">⭐</span><span class="topbar-points-val">${points}</span></div>` : ''}
      ${showAvatar ? `<a class="topbar-avatar" href="dashboard.html">${avatar}</a>` : ''}
    </div>
  `;
  if (showPoints) bindPointsSync();
}

// Keep the topbar ⭐ badge in sync with Storage in real time. A single window
// listener updates whatever .topbar-points is on the page now, so it survives
// re-renders and works on every screen that shows points. The number bumps
// (and flashes red when it drops) so spends/earns read as a live change.
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
    badge.classList.toggle('is-spend', total < prev);
    badge.classList.remove('points-bump');
    void badge.offsetWidth;          // restart the animation
    badge.classList.add('points-bump');
  });
}

// Force the topbar badge to re-read the current total (e.g. after a manual
// localStorage change). Normal earn/spend already updates it via the event.
export function updateTopbarPoints() {
  const valEl = document.querySelector('.topbar-points-val');
  if (valEl) valEl.textContent = Storage.getPoints();
}

// ── Navbar ───────────────────────────────────────────────────────────────────
// Uses image icons to stay visually consistent with the static bottom-nav
// used on map.html, quiz.html, stampbook.html, and settings.html.
const NAV_ITEMS = [
  { id: 'home',      href: 'dashboard.html', img: '../assets/images/ui/home-icon.png',    label: 'Home'    },
  { id: 'map',       href: 'map.html',       img: '../assets/images/ui/my-map-icon.png',  label: 'Map'     },
  { id: 'stampbook', href: 'stampbook.html', img: '../assets/images/ui/stamp-icon.png',   label: 'Stamps'  },
  { id: 'quiz',      href: 'quiz.html',      img: '../assets/images/ui/quiz-icon.png',    label: 'Quiz'    },
  { id: 'settings',  href: 'settings.html',  img: '../assets/images/ui/setting-icon.png', label: 'Me'      },
];

export function renderNavbar(activeId = '') {
  const el = document.getElementById('navbar');
  if (!el) return;

  // Apply the shared .bottom-nav class so the purple bar + yellow active pill
  // styles from style.css apply automatically.
  el.className = 'bottom-nav';

  el.innerHTML = NAV_ITEMS.map(item => `
    <a class="map-nav-item ${item.id === activeId ? 'active' : ''}" href="${item.href}">
      <img src="${item.img}" alt="" class="nav-icon">
      <span>${item.label}</span>
    </a>
  `).join('');
}

// ── Auth guard — redirect to home if not logged in ───────────────────────────
export function requireAuth() {
  const session = Storage.getSession();
  if (!session) {
    window.location.href = 'home.html';
    return false;
  }
  return session;
}

// ── Toast notification ────────────────────────────────────────────────────────
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

// ── Points fly-up ("+10" floats up from an element) ──────────────────────────
// Spawns a one-shot "+N" label centred over `anchorEl` that floats up and fades.
// Pass a negative n (e.g. a hint cost) to show "−N" in coral. Purely decorative —
// the actual points total is updated by the caller via Storage.
export function flyPoints(anchorEl, n) {
  if (!anchorEl || !n) return;
  // The label is absolutely positioned, so the anchor needs a positioning context.
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

// ── Get state from URL param (?state=penang) ─────────────────────────────────
export function getStateParam() {
  return new URLSearchParams(window.location.search).get('state')
      || Storage.getCurrentState();
}
