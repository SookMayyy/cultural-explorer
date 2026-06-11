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
const NAV_ITEMS = [
  { id: 'map',       href: 'map.html',       icon: '🗺️',  label: 'Map'     },
  { id: 'stampbook', href: 'stampbook.html', icon: '📚',  label: 'Stamps'  },
  { id: 'dashboard', href: 'dashboard.html', icon: '📊',  label: 'Progress'},
];

export function renderNavbar(activeId = '') {
  const el = document.getElementById('navbar');
  if (!el) return;

  el.innerHTML = NAV_ITEMS.map(item => `
    <a class="nav-item ${item.id === activeId ? 'active' : ''}" href="${item.href}">
      <span class="nav-icon">${item.icon}</span>
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
