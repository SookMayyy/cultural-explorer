/* dashboard.js — authenticated Home: greeting, progress bar, quick-access cards */

import Storage from './utils/storage.js';
import { renderTopbar, renderNavbar, requireAuth } from './ui.js';
import { STATES_DATA, STATE_COUNT, nextRecommended } from './data/states.js';

const session = requireAuth();

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

/* Hero */
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

/* Journey progress bar */
document.getElementById('home-progress-label').textContent = `${completed} / ${total} states`;
requestAnimationFrame(() => {
  document.getElementById('home-progress-fill').style.width =
    `${Math.round((completed / total) * 100)}%`;
});

/* Card subtitles + quiz target */
document.getElementById('home-stamp-sub').textContent = `${stampsN} / ${total} collected`;
const mapSub = document.getElementById('home-map-sub');
if (mapSub) mapSub.textContent = `Discover ${STATE_COUNT} states`;
document.getElementById('home-shop-sub').textContent  = `⭐ ${points} pts to spend`;

// The Activities card opens the hub (pick a game and a state) rather than a single quiz.
const quizCard = document.getElementById('home-card-quiz');
if (quizCard) quizCard.href = 'activities.html';
