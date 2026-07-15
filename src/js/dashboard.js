// js/dashboard.js — authenticated Home: greeting, journey progress bar, and four
// quick-access cards (Map, Stamp Book, Activities, Avatar Shop).

import Storage from './utils/storage.js';
import { renderTopbar, renderNavbar, requireAuth } from './ui.js';
import { STATES_DATA, nextRecommended } from './data/states.js';

const session = requireAuth();

// Home shows no top-bar title (per design) — just points + profile.
renderTopbar({ showAvatar: true, showPoints: true, color: '#6b50ce' });
renderNavbar('home');

const progress   = Storage.getProgress();
const completed  = Storage.completedCount();
const stampsN    = Storage.stampCount();
const points     = Storage.getPoints();
const total      = STATES_DATA.length;
const next       = nextRecommended(progress);
const playerName = session.displayName || 'Explorer';

function levelLabel(n) {
  if (n === 0) return '🌱 Beginner Explorer';
  if (n <= 2)  return '🗺️ Junior Explorer';
  if (n <= 4)  return '⭐ Cultural Explorer';
  if (n <= 6)  return '🏆 Expert Explorer';
  return '👑 Master Explorer — All States!';
}

// ── Hero ──────────────────────────────────────────────────────────────────────
document.getElementById('dash-name').textContent = playerName;
document.getElementById('dash-level').textContent = levelLabel(completed);

const greetEl = document.getElementById('dash-greeting-text');
if (greetEl) {
  const lines = stampsN === 0
    ? [`Welcome, ${playerName}! Ready for your first adventure?`,
       `Hi ${playerName}! Let's explore Malaysia together!`]
    : [`Welcome back, ${playerName}!`,
       `Great to see you, ${playerName}! Let's keep exploring!`];
  greetEl.textContent = lines[Math.floor(Math.random() * lines.length)];
}

// ── Journey progress bar ────────────────────────────────────────────────────────
document.getElementById('home-progress-label').textContent = `${completed} / ${total} states`;
requestAnimationFrame(() => {
  document.getElementById('home-progress-fill').style.width =
    `${Math.round((completed / total) * 100)}%`;
});

// ── Card subtitles + quiz target ─────────────────────────────────────────────────
document.getElementById('home-stamp-sub').textContent = `${stampsN} / ${total} collected`;
// Avatar Shop is live — nudge with the points they have to spend on new avatars.
document.getElementById('home-shop-sub').textContent  = `⭐ ${points} pts to spend`;

// The Activities card always opens the Activity Hub (the global games menu), where
// the player picks a game and a state — rather than dropping them straight into a
// quiz for one state.
const quizCard = document.getElementById('home-card-quiz');
if (quizCard) quizCard.href = 'activities.html';
