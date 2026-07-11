// js/activities.js — Activities Hub screen
// ─────────────────────────────────────────────────────────────────────────────
// A GLOBAL games menu (reached from the navbar): a 2×2 grid of replayable
// mini-games (Word Scramble, Drag & Match, Quiz, Guess the State). The three
// state-specific games hand off to the state picker (activity-states.html) so
// the player chooses which state to play — activities never get mixed up across
// states. Every game is open from the start (free exploration) — including the
// multi-state "Guess the State".
// ─────────────────────────────────────────────────────────────────────────────

import Storage from './utils/storage.js';
import { renderTopbar, renderNavbar, requireAuth, getStateParam, showToast } from './ui.js';
import { getState } from './data/states.js';
import { renderDifficultyChip } from './components/difficultyChip.js';

// ── Auth guard ────────────────────────────────────────────────────────────────
requireAuth();

// Optional state context (from ?state= or the last-visited state) — used only to
// tint the panel. The games themselves get their state from the picker screen.
const stateId = getStateParam();
const state   = getState(stateId);

// ── Shared chrome ─────────────────────────────────────────────────────────────
// This is a GLOBAL games menu (reached from the navbar). The player picks a game
// here, then a state on the next screen — so it stays state-agnostic and never
// locks the games to one possibly-stale "current" state.
// color:null keeps the purple .activities-topbar override (in activities.css).
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

// ── "Guess the State" unlock gate ─────────────────────────────────────────────
// Free exploration: every game (including Guess the State) is open from the
// start, so the gate is disabled (threshold 0 = always unlocked).
const GUESS_UNLOCK_AT = 0;
function exploredCount() {
  const p = Storage.getProgress();
  return Object.values(p).filter(s => (s.visits > 0) || s.story || s.culture || s.quiz).length;
}
const explored      = exploredCount();
const guessUnlocked = explored >= GUESS_UNLOCK_AT;

// ── Sub-heading ───────────────────────────────────────────────────────────────
const subhead = document.getElementById('act-subhead');
if (subhead) {
  subhead.textContent = 'Pick a game — then choose a state!';
}

// ── Difficulty selector ─────────────────────────────────────────────────────────
// The same games replay here, so the level toggle lives on this hub too.
renderDifficultyChip(document.getElementById('act-difficulty'), {
  onChange: (id) => showToast(id === 'adventurer'
    ? 'Adventurer mode on — the games just got tougher! 🔥'
    : 'Explorer mode on — nice and gentle. 🌱'),
});

// ── Game definitions ──────────────────────────────────────────────────────────
// emoji = placeholder art in the icon slot (📸 real icons to be exported later).
// The three state-specific games go through the state picker (activity-states.html)
// so the player chooses which state to play — keeping activities from mixing up
// across states. "Guess the State" is inherently multi-state, so it launches
// standalone straight away.
const GAMES = [
  { id: 'scramble',  label: 'Word Scramble',  emoji: '🔤', href: 'activity-states.html?game=scramble',  tile: 'act-tile--yellow' },
  { id: 'dragmatch', label: 'Drag & Match',   emoji: '🧩', href: 'activity-states.html?game=dragmatch', tile: 'act-tile--blue'   },
  { id: 'quiz',      label: 'Quiz',           emoji: '❓', href: 'activity-states.html?game=quiz',      tile: 'act-tile--purple' },
  {
    // Launched standalone (no ?state=) so it plays the full shuffled set —
    // a proper "replay", not the linear journey single-round → quiz chain.
    id: 'guess', label: 'Guess the State', emoji: '🌳',
    href: 'guess.html?from=activities', tile: 'act-tile--green',
    locked: !guessUnlocked,
    lockNote: `Unlocks after exploring ${GUESS_UNLOCK_AT} states`,
  },
];

// ── Build a single card ───────────────────────────────────────────────────────
// • locked  → non-clickable, greyed, lock badge + caption.
// • otherwise → links to the game's href (state picker, or Guess standalone).
function cardHTML(g, index) {
  const delay = `${index * 70}ms`;
  const locked = !!g.locked;

  // 📸 IMAGE NEEDED: assets/images/activities/${g.id}.png — game icon.
  // Falls back to the emoji placeholder below until exported.
  const iconSlot = `
    <span class="act-card-icon ${g.tile}" aria-hidden="true">
      <span class="act-card-emoji">${g.emoji}</span>
    </span>`;

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

// ── Render the grid ───────────────────────────────────────────────────────────
const grid = document.getElementById('act-grid');
if (grid) {
  grid.innerHTML = GAMES.map((g, i) => cardHTML(g, i)).join('');
}
