/* activities.js — Activities Hub screen */

// A global games menu (from the navbar): a 2×2 grid of replayable mini-games.
// State-specific games hand off to the state picker (activity-states.html); the
// multi-state "Guess the State" launches standalone. Every game is open from the start.

import Storage from './utils/storage.js';
import { renderTopbar, renderNavbar, requireAuth, getStateParam, showToast } from './ui.js';
import { getState } from './data/states.js';
import { renderDifficultyChip } from './components/difficultyChip.js';
import { currentLevel } from './data/difficulty.js';

requireAuth();

// Optional state context — used only to tint the panel; games get their state
// from the picker screen.
const stateId = getStateParam();
const state   = getState(stateId);

/* Shared chrome */
// The topbar is transparent by design (base .topbar in style.css).
renderTopbar({
  title:      'Activities',
  showBack:   true,
  backHref:   'map.html',
  showPoints: true,
  color:      null,
});
renderNavbar('activities');

// Tint the panel with the current state's accent (falls back to purple).
const main = document.getElementById('act-main');
if (main && state?.color) {
  main.style.setProperty('--state-color', state.color);
  if (state.colorLight) main.style.setProperty('--state-color-light', state.colorLight);
}

/* "Guess the State" unlock gate (disabled — threshold 0 = always unlocked) */
const GUESS_UNLOCK_AT = 0;
function exploredCount() {
  const p = Storage.getProgress();
  return Object.values(p).filter(s => (s.visits > 0) || s.story || s.culture || s.quiz).length;
}
const explored      = exploredCount();
const guessUnlocked = explored >= GUESS_UNLOCK_AT;

/* Sub-heading */
const subhead = document.getElementById('act-subhead');
if (subhead) {
  subhead.textContent = 'Pick a game — then choose a state!';
}

/* Difficulty selector */
// The chip re-paints without a reload, and the menu differs by level
// (Tic-Tac-Toe is Adventurer-only), so onChange rebuilds the grid too.
renderDifficultyChip(document.getElementById('act-difficulty'), {
  onChange: (id) => {
    renderGrid();
    showToast(id === 'adventurer'
      ? 'Adventurer mode on — the games just got tougher! 🔥'
      : 'Explorer mode on — nice and gentle. 🌱');
  },
});

/* Game definitions (rebuilt each render — the menu varies by difficulty) */
function gamesList() {
  // Slot 2 steps up with the level: Explorer plays Drag & Match; Adventurer gets
  // Cultural Tic-Tac-Toe instead (cross-state), replacing it so the grid stays 2×2.
  // Grade 1-3 is locked to Explorer (canChoose() in difficulty.js), so always Drag & Match.
  const matchGame = currentLevel() === 'adventurer'
    ? {
        // Standalone (no ?state=) — it draws from every state at once.
        id: 'tictactoe', label: 'Cultural Tic-Tac-Toe', emoji: '⭕',
        icon: '../assets/images/ui/tic_tac_toe_icon.png',
        href: 'tictactoe.html?from=activities', tile: 'act-tile--blue',
      }
    : { id: 'dragmatch', label: 'Drag & Match', emoji: '🧩',
        href: 'activity-states.html?game=dragmatch', tile: 'act-tile--blue' };

  return [
    { id: 'scramble', label: 'Word Scramble', emoji: '🔤', href: 'activity-states.html?game=scramble', tile: 'act-tile--yellow' },
    matchGame,
    { id: 'quiz',     label: 'Quiz',          emoji: '❓', href: 'activity-states.html?game=quiz',     tile: 'act-tile--purple' },
    {
      // Standalone (no ?state=) so it plays the full shuffled set.
      id: 'guess', label: 'Guess the State', emoji: '🌳',
      href: 'guess.html?from=activities', tile: 'act-tile--green',
      locked: !guessUnlocked,
      lockNote: `Unlocks after exploring ${GUESS_UNLOCK_AT} states`,
    },
  ];
}

/* Build a single card (locked → greyed + badge; otherwise → links to href) */
function cardHTML(g, index) {
  const delay = `${index * 70}ms`;
  const locked = !!g.locked;

  // Games with real art set `icon`; the rest fall back to the emoji placeholder.
  const art = g.icon
    ? `<img class="act-card-img" src="${g.icon}" alt=""
         onerror="this.replaceWith(Object.assign(document.createElement('span'),
                  {className:'act-card-emoji',textContent:'${g.emoji}'}))">`
    : `<span class="act-card-emoji">${g.emoji}</span>`;
  const iconSlot = `
    <span class="act-card-icon ${g.tile}" aria-hidden="true">${art}</span>`;

  if (locked) {
    return `
      <div class="act-card is-locked" style="animation-delay:${delay}" aria-disabled="true">
        ${iconSlot}
        <span class="act-card-label">${g.label}</span>
        <span class="act-card-lock" aria-hidden="true">🔒</span>
        <span class="act-card-note">${g.lockNote}</span>
      </div>`;
  }

  return `
    <a class="act-card" href="${g.href}" style="animation-delay:${delay}">
      ${iconSlot}
      <span class="act-card-label">${g.label}</span>
    </a>`;
}

/* Render the grid (re-run from the difficulty chip's onChange too) */
function renderGrid() {
  const grid = document.getElementById('act-grid');
  if (!grid) return;
  grid.innerHTML = gamesList().map((g, i) => cardHTML(g, i)).join('');
}

renderGrid();
