// js/missions.js — Mission Hub screen
// ─────────────────────────────────────────────────────────────────────────────
// The state's "explore the state" hub: four missions (Chef → Dancer → Tourist →
// Festival Challenge) played in order — the child starts at Mission 1 and each
// mission unlocks only after the previous one is completed. Each launches one of
// the existing mini-games (tagged from=mission); finishing one returns here with
// ?done=<id> so we can animate its check, bump the bar, and open the next row.
// ─────────────────────────────────────────────────────────────────────────────

import Storage from './utils/storage.js';
import { renderTopbar, renderNavbar, requireAuth, getStateParam, showToast } from './ui.js';
import { getState } from './data/states.js';
import { missionsFor, MISSION_COUNT } from './data/missions.js';
import { showPopup } from './components/popup.js';
import { renderDifficultyChip } from './components/difficultyChip.js';
import Sound from './utils/sound.js';

// ── Auth guard ────────────────────────────────────────────────────────────────
requireAuth();

// ── Load state ────────────────────────────────────────────────────────────────
const stateId = getStateParam();
const state   = getState(stateId);

if (!state) {
  showPopup({
    title: 'State not found',
    emoji: '🧭',
    message: "Let's go back to the map and pick a state first!",
    actions: [{ label: 'Back to Map', value: 'map', style: 'primary' }],
  }).then(() => { window.location.href = 'map.html'; });
  throw new Error('State not found: ' + stateId);
}

Storage.setCurrentState(stateId);

// A mission just finished if we arrived with ?done=<id>. Mark it complete
// (idempotent — the game already did) so the row animates in as done.
const justDoneId = new URLSearchParams(location.search).get('done');
if (justDoneId) Storage.completeMission(stateId, justDoneId);

// ── Chrome ────────────────────────────────────────────────────────────────────
renderTopbar({
  title:      state.name,
  showBack:   true,
  backHref:   `narrative.html?state=${stateId}`,
  showPoints: true,
  color:      null,   // .missions-topbar CSS forces purple
});
renderNavbar('');

// Tint the panel with the state's accent.
const main = document.getElementById('mi-main');
if (main && state.color) {
  main.style.setProperty('--state-color', state.color);
  if (state.colorLight) main.style.setProperty('--state-color-light', state.colorLight);
}

// Paint the state's scene behind the hub (same treatment as the mission flow) so
// the panel floats on the state's own background instead of flat beige. A soft
// white scrim keeps the text readable.
if (main && state.entryBg) {
  const bg = `linear-gradient(rgba(255,255,255,0.42), rgba(255,255,255,0.42)), url(${state.entryBg}) center / cover no-repeat`;
  const appEl = main.closest('.app-container');
  if (appEl) appEl.style.background = bg;
  main.style.background = 'transparent';
}

document.getElementById('mi-title').textContent = `Explore ${state.name}!`;

// ── Difficulty selector ─────────────────────────────────────────────────────────
// Grade 1–2 see a locked "Explorer Mode" badge; older grades can toggle
// Explorer/Adventurer. Changing it only affects the games on their next play, so
// no re-render of the hub is needed beyond a friendly nudge.
renderDifficultyChip(document.getElementById('mi-difficulty'), {
  onChange: (id) => showToast(id === 'adventurer'
    ? 'Adventurer mode on — the games just got tougher! 🔥'
    : 'Explorer mode on — nice and gentle. 🌱'),
});

// ── Build the mission list ─────────────────────────────────────────────────────
const missions = missionsFor(state);
const done      = Storage.getMissions(stateId);   // array of completed ids

// Sequential unlocking: the child must start with Mission 1 and can only open the
// next mission after finishing the one before it. Mission at `index` is unlocked
// when it's the first, or the previous mission has been completed. (Completed
// missions stay open so they can be replayed — see `isDone` in rowHTML.)
function isUnlocked(index) {
  if (index === 0) return true;
  return done.includes(missions[index - 1].id);
}

function rowHTML(m, index) {
  const isDone   = done.includes(m.id);
  const unlocked = isDone || isUnlocked(index);
  const justDone = m.id === justDoneId;

  const stateClass = isDone ? 'is-done' : unlocked ? 'is-open' : 'is-locked';
  const status = isDone
    ? `<span class="mi-row-status mi-status-check" aria-label="Completed">✓</span>`
    : unlocked
    ? `<span class="mi-row-status mi-status-go" aria-hidden="true">▶</span>`
    : `<span class="mi-row-status mi-status-lock" aria-label="Locked">🔒</span>`;

  const inner = `
    <span class="mi-row-icon" aria-hidden="true">${m.icon}</span>
    <span class="mi-row-text">
      <span class="mi-row-title">${m.num}. ${m.title}</span>
      <span class="mi-row-sub">${m.subtitle}</span>
    </span>
    ${status}`;

  // Unlocked rows (done or open) are tappable to play; locked rows are inert.
  const body = unlocked
    ? `<a class="mi-row-link" href="${m.href}">${inner}</a>`
    : `<div class="mi-row-link" aria-disabled="true">${inner}</div>`;

  return `<li class="mi-row ${stateClass} ${justDone ? 'just-done' : ''}"
              style="--i:${index}">${body}</li>`;
}

const listEl = document.getElementById('mi-list');
listEl.innerHTML = missions.map(rowHTML).join('');

// ── Progress bar ────────────────────────────────────────────────────────────────
const pct = Math.round((done.length / MISSION_COUNT) * 100);
const fillEl = document.getElementById('mi-progress-fill');
const pctEl  = document.getElementById('mi-progress-pct');
pctEl.textContent = `${pct}%`;
// Animate the fill from its pre-completion width up to the new value when we
// arrived from a just-finished mission; otherwise just set it.
if (justDoneId) {
  const prevPct = Math.round((Math.max(done.length - 1, 0) / MISSION_COUNT) * 100);
  fillEl.style.width = `${prevPct}%`;
  requestAnimationFrame(() => { fillEl.style.width = `${pct}%`; });
  Sound.unlock?.();
} else {
  fillEl.style.width = `${pct}%`;
}

// ── All missions complete → celebrate ──────────────────────────────────────────
if (done.length >= MISSION_COUNT) {
  const banner = document.getElementById('mi-done-banner');
  document.getElementById('mi-done-text').textContent = 'You\'ve explored it all! 🎉';
  document.getElementById('mi-done-btn').href = `activities.html?state=${stateId}`;
  banner.classList.remove('hidden');
  if (justDoneId) Sound.win?.();
} else if (justDoneId) {
  // Cheer the player on — finishing this mission has just unlocked the next one.
  showToast('Mission complete! The next one is unlocked 🎉');
}
