/* activity-states.js — Activity → State picker */

// Reached from the Activities Hub after the player picks a game (?game=<id>).
// Lists states as cards; a state is playable only once all four of its missions
// are done. Tapping one opens the game with ?state=<id>&from=activities.

import Storage from './utils/storage.js';
import { renderTopbar, renderNavbar, requireAuth } from './ui.js';
import { STATES_DATA } from './data/states.js';
import { MISSION_COUNT } from './data/missions.js';
import Sound from './utils/sound.js';

requireAuth();

/* Which game are we picking a state for? */
// Guess the State is intentionally absent — it is multi-state and launches from the hub.
const GAMES = {
  scramble:  { label: 'Word Scramble', emoji: '🔤', build: (id) => `scramble.html?state=${id}&from=activities` },
  dragmatch: { label: 'Drag & Match',  emoji: '🧩', build: (id) => `activity.html?state=${id}&from=activities` },
  quiz:      { label: 'Quiz',          emoji: '❓', build: (id) => `quiz.html?state=${id}&from=activities` },
};

const gameId = new URLSearchParams(location.search).get('game');
const game   = GAMES[gameId];

// Unknown/missing game → bounce back to the hub rather than show an empty screen.
if (!game) {
  window.location.href = 'activities.html';
  throw new Error('Unknown activity game: ' + gameId);
}

/* Chrome */
// The topbar is transparent by design (base .topbar in style.css).
renderTopbar({
  title:      game.label,
  showBack:   true,
  backHref:   'activities.html',
  showPoints: true,
  color:      null,
});
renderNavbar('activities');

document.getElementById('as-heading').textContent = `${game.emoji} ${game.label}`;

/* Build the state cards */
// Locked until all four of the state's missions are done.
const progress = Storage.getProgress();

function isExplored(id) {
  return Storage.getMissions(id).length >= MISSION_COUNT || Storage.hasStamp(id);
}

const grid = document.getElementById('as-grid');
grid.innerHTML = STATES_DATA.map((s, i) => {
  const explored = isExplored(s.id);
  const delay    = `${i * 60}ms`;
  const accent   = s.color || '#6a32c9';

  if (!explored) {
    // Locked: greyed, non-clickable, with a hint to finish its missions first.
    return `
      <div class="as-card is-locked" style="--accent:${accent};animation-delay:${delay}"
           aria-disabled="true" aria-label="${s.name} — finish all ${MISSION_COUNT} missions to unlock">
        <span class="as-card-flag" aria-hidden="true">${s.emoji}</span>
        <span class="as-card-name">${s.name}</span>
        <span class="as-card-lock" aria-hidden="true">🔒</span>
        <span class="as-card-note">Finish all ${MISSION_COUNT} missions first</span>
      </div>`;
  }

  return `
    <a class="as-card" href="${game.build(s.id)}"
       style="--accent:${accent};animation-delay:${delay}"
       aria-label="Play ${game.label} for ${s.name}">
      <span class="as-card-flag" aria-hidden="true">${s.emoji}</span>
      <span class="as-card-name">${s.name}</span>
    </a>`;
}).join('');

// Little tap sound on selection (Sound is a no-op when muted).
grid.addEventListener('click', (e) => {
  if (e.target.closest('.as-card')) Sound.tap?.();
});
