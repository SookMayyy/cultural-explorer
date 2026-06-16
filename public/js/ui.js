// js/ui.js — shared topbar, navbar, and toast helpers for all MPA pages

import Storage from './utils/storage.js';
import { avatarEmoji } from './data/avatars.js';

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
  const avatar  = avatarEmoji(session.avatarId ?? 0);

  el.style.background = color || '';
  el.innerHTML = `
    <div class="topbar-left">
      ${showBack ? `<a class="topbar-back" href="${backHref}">‹</a>` : ''}
      <span class="topbar-title">${title}</span>
    </div>
    <div class="topbar-right">
      ${showPoints ? `<div class="topbar-points">⭐ ${points}</div>` : ''}
      ${showAvatar ? `<a class="topbar-avatar" href="dashboard.html">${avatar}</a>` : ''}
    </div>
  `;
}

// ── Navbar ───────────────────────────────────────────────────────────────────
// Uses image icons to stay visually consistent with the static bottom-nav
// used on map.html, quiz.html, stampbook.html, and settings.html.
const NAV_ITEMS = [
  { id: 'home',      href: 'home.html',      img: '../assets/images/ui/home-icon.png',    label: 'Home'    },
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

// ── Get state from URL param (?state=penang) ─────────────────────────────────
export function getStateParam() {
  return new URLSearchParams(window.location.search).get('state')
      || Storage.getCurrentState();
}
