// js/dashboard.js — student progress dashboard

import Storage from './utils/storage.js';
import { renderTopbar, renderNavbar, requireAuth } from './ui.js';
import { STATES_DATA, nextRecommended } from './data/states.js';
import { avatarEmoji } from './data/avatars.js';

const session = requireAuth();

renderTopbar({ title: 'My Progress', showAvatar: true, showPoints: true });
renderNavbar('dashboard');

const progress  = Storage.getProgress();
const stamps    = Storage.getStamps();
const points    = Storage.getPoints();
const completed = Storage.completedCount();
const best      = Storage.getBestScore();
const next      = nextRecommended(progress);

function levelLabel(n) {
  if (n === 0) return '🌱 Beginner Explorer';
  if (n <= 2)  return '🗺️ Junior Explorer';
  if (n <= 4)  return '⭐ Cultural Explorer';
  if (n <= 6)  return '🏆 Expert Explorer';
  return '👑 Master Explorer — All States!';
}

// ── Hero ──────────────────────────────────────────────────────────────────────
document.getElementById('dash-avatar').textContent = avatarEmoji(session.avatarId ?? 0);
document.getElementById('dash-name').textContent   = session.displayName || 'Explorer';
document.getElementById('dash-level').textContent  = levelLabel(completed);

// ── Stats ─────────────────────────────────────────────────────────────────────
document.getElementById('stat-states').textContent = completed;
document.getElementById('stat-stamps').textContent = stamps.length;
document.getElementById('stat-points').textContent = points;

// ── Mini stamps ───────────────────────────────────────────────────────────────
document.getElementById('mini-stamps').innerHTML = STATES_DATA.map(state => `
  <div class="mini-stamp ${stamps.includes(state.id) ? 'earned' : ''}"
       title="${state.name}"
       style="${stamps.includes(state.id) ? `background:${state.color}` : ''}">
    ${state.emoji}
  </div>
`).join('');

// ── State progress list ───────────────────────────────────────────────────────
document.getElementById('state-progress-list').innerHTML = STATES_DATA.map(state => {
  const sp   = Storage.getStateProgress(state.id);
  const tabs = ['story','culture','activity','quiz'];
  const done = tabs.filter(t => sp[t]).length;
  const pct  = Math.round((done / tabs.length) * 100);
  return `
    <div class="state-score-row">
      <span class="state-score-emoji" style="background:${state.colorLight}">${state.emoji}</span>
      <div class="state-score-info">
        <span class="state-score-name">${state.name}</span>
        <div class="progress-track state-prog">
          <div class="progress-fill" style="width:${pct}%; background:${state.color}"></div>
        </div>
      </div>
      <span class="state-score-pct">${pct}%</span>
    </div>
  `;
}).join('');

// ── Recommended next ──────────────────────────────────────────────────────────
if (next) {
  const card = document.getElementById('dash-recommended');
  card.style.background = `linear-gradient(135deg, ${next.color}, ${next.color}CC)`;
  card.href = `narrative.html?state=${next.id}`;
  card.addEventListener('click', () => Storage.setCurrentState(next.id));
  document.getElementById('rec-emoji').textContent = next.emoji;
  document.getElementById('rec-name').textContent  = next.name;
  document.getElementById('rec-desc').textContent  = next.tagline;
} else {
  document.getElementById('section-recommended').style.display = 'none';
}

// ── Best score ────────────────────────────────────────────────────────────────
document.getElementById('dash-best-score').textContent = `${best} pts`;

// ── Logout ────────────────────────────────────────────────────────────────────
document.getElementById('dash-logout')?.addEventListener('click', () => {
  if (confirm('Log out? Your progress is saved.')) {
    Storage.clearSession();
    window.location.href = 'home.html';
  }
});
