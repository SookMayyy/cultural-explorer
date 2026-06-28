// js/map.js — Interactive Malaysia map screen.
//
// The backdrop is an inline SVG (#map) of Malaysia — one <path data-state="..."> per
// explorable state, in the malaysia.travel style (geometry from simplemaps.com, free
// for commercial use). Tapping an unlocked state path opens a bottom-sheet popup with
// an "Explore Now" CTA. States unlock West-first, then East after all 5 West states
// are completed.

import Storage from './utils/storage.js';
import { renderTopbar, renderNavbar, requireAuth } from './ui.js';
import { STATES_DATA, unlockedStates, nextRecommended } from './data/states.js';
import { renderMascot } from './data/mascots.js';

// ── Auth guard ────────────────────────────────────────────────────────────────
requireAuth();

// ── Shared chrome ───────────────────────────────────────────────────────────────
renderTopbar({
  title: 'My Map',
  showBack: true,
  backHref: 'dashboard.html',
  showPoints: true,
  showAvatar: false,   // back button is the nav control; avatar was redundant
  color: '#6B50CE',
});
renderNavbar('map');

// ── Progress data ───────────────────────────────────────────────────────────────
const progress  = Storage.getProgress();
const stamps    = Storage.getStamps();
const completed = Storage.completedCount();
const unlocked  = unlockedStates(progress).map(s => s.id);
const nextUp    = nextRecommended(progress);

document.getElementById('map-completed').textContent = `${completed}/7`;
document.getElementById('map-pts').textContent       = `${Math.round((completed / 7) * 100)}%`;
requestAnimationFrame(() => {
  const fill = document.getElementById('map-progress-fill');
  if (fill) fill.style.width = `${Math.round((completed / 7) * 100)}%`;
});

// ── Mascot greeting ─────────────────────────────────────────────────────────────
const allWestDone = STATES_DATA
  .filter(s => s.region === 'west')
  .every(s => stamps.includes(s.id));

const mascotGreeting = completed === 0
  ? "Hi! I'm Rimau! Tap a state to begin your Malaysian adventure!"
  : completed < 5
  ? `Amazing! You've explored ${completed} state${completed > 1 ? 's' : ''}! Tap another!`
  : allWestDone
  ? "West Malaysia conquered! Cross the sea to explore East Malaysia with me!"
  : `Almost there! ${5 - completed} more West states before East Malaysia unlocks!`;

const mascotFigureEl = document.getElementById('map-mascot-figure');
const mascotTextEl   = document.getElementById('map-mascot-text');
// Welcoming happy pose for the map greeting (cheer once all West states are done).
if (mascotFigureEl) renderMascot(mascotFigureEl, allWestDone ? 'cheer' : 'happy');
if (mascotTextEl)   mascotTextEl.textContent = mascotGreeting;

function nodeState(stateId) {
  if (stamps.includes(stateId))   return 'completed';
  if (unlocked.includes(stateId)) return 'unlocked';
  return 'locked';
}

// ── Style the SVG state paths ─────────────────────────────────────────────────────
// The inline <svg id="map"> has one <path data-state="..."> per explorable state
// (malaysia.travel-style click targets). We colour each by status and drop a small
// status pin (✓ done / 🔒 locked / ⭐ recommended) at the path's centre.
const SVGNS  = 'http://www.w3.org/2000/svg';
const svgEl  = document.getElementById('map');
const pinsEl = document.createElementNS(SVGNS, 'g');   // pins layer (drawn on top)
pinsEl.setAttribute('class', 'map-pins');
pinsEl.setAttribute('pointer-events', 'none');

// Per-state pin nudge (in SVG viewBox units — the map is viewBox "0 0 1000 332").
// Most pins sit at the path's bounding-box centre, which works for compact states.
// Sabah/Sarawak are large, L-shaped Borneo states whose bbox centre falls off the
// visible land, so nudge their pins onto the landmass here. dx = right(+)/left(−),
// dy = down(+)/up(−). Tweak these numbers until the ✓ / 🔒 sits where you want.
const PIN_OFFSET = {
  sabah:   { dx: -15, dy: 12 },   // Sabah is the NE tip — nudge up toward the land
  sarawak: { dx: 30, dy:  18 },   // Sarawak is the long SW body — nudge down into it
};

STATES_DATA.forEach(state => {
  const path = svgEl.querySelector(`path[data-state="${state.id}"]`);
  if (!path) return;

  const ns     = nodeState(state.id);
  const locked = ns === 'locked';
  const done   = ns === 'completed';
  const isNext = nextUp && nextUp.id === state.id && !locked;

  path.classList.add(`map-state--${ns}`);
  if (isNext) path.classList.add('map-state--next');
  // Unlocked/done states wear the state's own brand colour; locked stay grey (CSS).
  if (state.color && !locked) path.style.fill = state.color;

  path.setAttribute('role', 'button');
  path.setAttribute('tabindex', locked ? '-1' : '0');
  if (locked) path.setAttribute('aria-disabled', 'true');
  path.setAttribute('aria-label',
    locked ? `${state.name} — locked` : `${state.name} — ${done ? 'completed' : 'explore'}`);

  const pinChar = done ? '✓' : locked ? '🔒' : isNext ? '⭐' : '';
  if (pinChar) {
    const box = path.getBBox();
    const off = PIN_OFFSET[state.id] || { dx: 0, dy: 0 };
    const t = document.createElementNS(SVGNS, 'text');
    t.setAttribute('x', box.x + box.width / 2 + off.dx);
    t.setAttribute('y', box.y + box.height / 2 + off.dy);
    t.setAttribute('class', `map-pin map-pin--${ns}`);
    t.setAttribute('text-anchor', 'middle');
    t.setAttribute('dominant-baseline', 'central');
    t.textContent = pinChar;
    pinsEl.appendChild(t);
  }
});
svgEl.appendChild(pinsEl);

// Tap (or keyboard Enter/Space) a state path → open its popup.
svgEl.addEventListener('click', e => {
  const path = e.target.closest('path[data-state]');
  if (path && !path.hasAttribute('aria-disabled')) openPopup(path.dataset.state);
});
svgEl.addEventListener('keydown', e => {
  if (e.key !== 'Enter' && e.key !== ' ') return;
  const path = e.target.closest('path[data-state]');
  if (path && !path.hasAttribute('aria-disabled')) {
    e.preventDefault();
    openPopup(path.dataset.state);
  }
});

// ── Popup (bottom sheet) ─────────────────────────────────────────────────────────
function openPopup(stateId) {
  const state = STATES_DATA.find(s => s.id === stateId);
  if (!state) return;

  const sp       = Storage.getStateProgress(stateId);
  const tabs     = ['story', 'culture', 'activity', 'quiz'];
  const isLocked = !unlocked.includes(stateId);

  const emojiEl = document.getElementById('popup-emoji');
  if (emojiEl) emojiEl.innerHTML = state.emoji || '🏳️';

  document.getElementById('popup-name').textContent    = state.name;
  document.getElementById('popup-tagline').textContent = state.tagline;

  document.getElementById('popup-badges').innerHTML = tabs.map(t => `
    <span class="popup-badge ${sp[t] ? 'done' : ''}">${sp[t] ? '✓ ' : ''}${t}</span>
  `).join('');

  const exploreBtn = document.getElementById('popup-explore');
  if (isLocked) {
    exploreBtn.href = '#';
    exploreBtn.className = 'popup-explore-btn popup-explore-btn--locked';
    exploreBtn.textContent = '🔒 Locked';
    exploreBtn.onclick = e => e.preventDefault();
  } else {
    exploreBtn.href = `narrative.html?state=${stateId}`;
    exploreBtn.className = 'popup-explore-btn';
    exploreBtn.textContent = 'Explore Now ›';
    exploreBtn.onclick = () => Storage.setCurrentState(stateId);
  }

  document.getElementById('map-popup').classList.remove('hidden');
  document.getElementById('map-popup').scrollTop = 0;
}

function closePopup() {
  document.getElementById('map-popup').classList.add('hidden');
}

document.getElementById('popup-close')?.addEventListener('click', closePopup);
document.getElementById('map-popup')?.addEventListener('click', e => {
  if (e.target === document.getElementById('map-popup')) closePopup();
});

// ── Calibration mode (map.html?calibrate=1) ──────────────────────────────────────
// Tap anywhere on the map to read the left%/top% — paste into COORDS above.
if (new URLSearchParams(location.search).get('calibrate') === '1') {
  const wrap = document.getElementById('map-image-wrap');
  const cal  = document.getElementById('map-cal');
  cal.classList.remove('hidden');
  wrap.addEventListener('click', e => {
    const r = wrap.getBoundingClientRect();
    const left = ((e.clientX - r.left) / r.width  * 100).toFixed(1);
    const top  = ((e.clientY - r.top)  / r.height * 100).toFixed(1);
    cal.textContent = `left: ${left}%, top: ${top}%`;
    console.log(`{ left: ${left}, top: ${top} },`);
  }, true);
}
