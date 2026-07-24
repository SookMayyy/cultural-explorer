/* map.js — Interactive Malaysia map screen */

// The backdrop is an inline SVG (#map) with one <path data-state="..."> per state.
// Tapping an unlocked state opens a bottom-sheet popup with an "Explore Now" CTA.

import Storage from './utils/storage.js';
import { renderTopbar, renderNavbar, requireAuth } from './ui.js';
import { STATES_DATA, unlockedStates, nextRecommended } from './data/states.js';
import { renderMascot } from './data/mascots.js';

requireAuth();

/* Shared chrome */
renderTopbar({
  title: 'My Map',
  showBack: true,
  backHref: 'dashboard.html',
  showPoints: true,
  showAvatar: false,   // back button is the nav control; avatar was redundant
  color: '#6B50CE',
});
renderNavbar('map');

/* Progress data */
const progress  = Storage.getProgress();
const stamps    = Storage.getStamps();
const completed = Storage.completedCount();
const unlocked  = unlockedStates(progress).map(s => s.id);
const nextUp    = nextRecommended(progress);

const TOTAL = STATES_DATA.length;   // number of explorable states (drives the tally)
document.getElementById('map-completed').textContent = `${completed}/${TOTAL}`;
document.getElementById('map-pts').textContent       = `${Math.round((completed / TOTAL) * 100)}%`;
requestAnimationFrame(() => {
  const fill = document.getElementById('map-progress-fill');
  if (fill) fill.style.width = `${Math.round((completed / TOTAL) * 100)}%`;
});

/* Mascot greeting */
const allWestDone = STATES_DATA
  .filter(s => s.region === 'west')
  .every(s => stamps.includes(s.id));

const mascotGreeting = completed === 0
  ? "Hi! I'm Rimau! Tap any state to begin your Malaysian adventure!"
  : completed < TOTAL
  ? `Amazing! You've explored ${completed} state${completed > 1 ? 's' : ''}! Tap another!`
  : "You've explored all of Malaysia with me! Amazing work! 🎉";

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

/* Style the SVG state paths */
// Colour each path by status and drop a status pin (✓ done / 🔒 locked / ⭐ next).
const SVGNS  = 'http://www.w3.org/2000/svg';
const svgEl  = document.getElementById('map');
const pinsEl = document.createElementNS(SVGNS, 'g');   // pins layer (drawn on top)
pinsEl.setAttribute('class', 'map-pins');
pinsEl.setAttribute('pointer-events', 'none');

// Per-state pin nudge (SVG viewBox units). Sabah/Sarawak's bbox centre falls off
// the visible land, so nudge their pins onto the landmass. dx: right+/left−, dy: down+/up−.
const PIN_OFFSET = {
  kedah:   { dx: 15, dy: 0},
  sabah:   { dx: -15, dy: 12 },   // Sabah is the NE tip — nudge up toward the land
  sarawak: { dx: 30, dy:  18 },   // Sarawak is the long SW body — nudge down into it
};

STATES_DATA.forEach(state => {
  // A state may be drawn as more than one path (e.g. Penang = mainland + island).
  const paths = svgEl.querySelectorAll(`path[data-state="${state.id}"]`);
  if (!paths.length) return;

  const ns     = nodeState(state.id);
  const done   = ns === 'completed';
  const isNext = nextUp && nextUp.id === state.id;

  paths.forEach(path => {
    path.classList.add(`map-state--${ns}`);
    if (isNext) path.classList.add('map-state--next');
    if (state.color) path.style.fill = state.color;

    // The map is free-exploration — every state is open, so all paths are
    // focusable buttons with no locked/disabled state.
    path.setAttribute('role', 'button');
    path.setAttribute('tabindex', '0');
    path.setAttribute('aria-label', `${state.name} — ${done ? 'completed' : 'explore'}`);
  });

  const pinChar = done ? '✓' : isNext ? '⭐' : '';
  if (pinChar) {
    // Pin sits on the primary (first) path — the mainland for Penang.
    const box = paths[0].getBBox();
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
  if (path) openPopup(path.dataset.state);
});
svgEl.addEventListener('keydown', e => {
  if (e.key !== 'Enter' && e.key !== ' ') return;
  const path = e.target.closest('path[data-state]');
  if (path) {
    e.preventDefault();
    openPopup(path.dataset.state);
  }
});

// The story's first sentence, trimmed if long. Shared by the hover-card and popup.
function shortSummary(state) {
  const s = (state.story || '').trim();
  if (!s) return state.tagline || '';
  const first = s.split(/(?<=\.)\s/)[0];
  return first.length > 120 ? first.slice(0, 117).trimEnd() + '…' : first;
}

/* Hover info-card (desktop pointer preview) */
// Fine-pointer only: hovering a state previews its flag/name/tagline/summary.
(() => {
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const hoverEl  = document.getElementById('map-hover');
  const wrapEl   = document.getElementById('map-image-wrap');
  if (!canHover || !hoverEl || !wrapEl) return;

  const flagEl = document.getElementById('map-hover-flag');
  const nameEl = document.getElementById('map-hover-name');
  const tagEl  = document.getElementById('map-hover-tag');
  const sumEl  = document.getElementById('map-hover-sum');

  let hoverId = null;

  function positionHover(e) {
    const r = wrapEl.getBoundingClientRect();
    let x = e.clientX - r.left;
    const y = e.clientY - r.top;
    // Keep the card (centred above the pointer) inside the map wrap horizontally.
    const half = hoverEl.offsetWidth / 2;
    x = Math.max(half + 4, Math.min(x, r.width - half - 4));
    // Near the top edge, flip the card below the pointer so it isn't clipped.
    hoverEl.style.transform = (y - hoverEl.offsetHeight - 18 < 0)
      ? 'translate(-50%, 18px)'
      : 'translate(-50%, calc(-100% - 14px))';
    hoverEl.style.left = `${x}px`;
    hoverEl.style.top  = `${y}px`;
  }

  function showHover(stateId, e) {
    const state = STATES_DATA.find(s => s.id === stateId);
    if (!state) return;
    if (stateId !== hoverId) {
      hoverId = stateId;
      flagEl.innerHTML   = state.emoji || '🏳️';
      nameEl.textContent = state.name;
      tagEl.textContent  = state.tagline || '';
      sumEl.textContent  = shortSummary(state);
    }
    hoverEl.classList.remove('hidden');
    positionHover(e);
  }

  function hideHover() {
    hoverId = null;
    hoverEl.classList.add('hidden');
  }

  svgEl.addEventListener('mousemove', e => {
    const path = e.target.closest('path[data-state]');
    if (path) showHover(path.dataset.state, e);
    else hideHover();
  });
  svgEl.addEventListener('mouseleave', hideHover);
})();

/* Popup (bottom sheet) */
// The four Discover→Play mission categories per state (see data/missions.js TEMPLATES).
const POPUP_CATEGORIES = [
  { id: 'chef',     label: 'Food',     icon: '🍳' },
  { id: 'dancer',   label: 'Costume',  icon: '👗' },
  { id: 'tourist',  label: 'Landmark', icon: '🗺️' },
  { id: 'festival', label: 'Festival', icon: '🎉' },
];

function openPopup(stateId) {
  const state = STATES_DATA.find(s => s.id === stateId);
  if (!state) return;

  // Completed missions — a badge ticks once its mission id is here.
  const done = Storage.getMissions(stateId);

  const emojiEl = document.getElementById('popup-emoji');
  if (emojiEl) emojiEl.innerHTML = state.emoji || '🏳️';

  document.getElementById('popup-name').textContent    = state.name;
  document.getElementById('popup-tagline').textContent = state.tagline;

  const summaryEl = document.getElementById('popup-summary');
  if (summaryEl) summaryEl.textContent = shortSummary(state);

  document.getElementById('popup-badges').innerHTML = POPUP_CATEGORIES.map(m => `
    <span class="popup-badge ${done.includes(m.id) ? 'done' : ''}">
      <span class="popup-badge-icon" aria-hidden="true">${done.includes(m.id) ? '✓' : m.icon}</span>
      ${m.label}
    </span>
  `).join('');

  const exploreBtn = document.getElementById('popup-explore');
  exploreBtn.href = `narrative.html?state=${stateId}`;
  exploreBtn.className = 'popup-explore-btn';
  exploreBtn.textContent = 'Explore Now ›';
  exploreBtn.onclick = () => Storage.setCurrentState(stateId);

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
// Escape closes the popup, alongside the ✕ button and backdrop click.
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && !document.getElementById('map-popup')?.classList.contains('hidden')) {
    closePopup();
  }
});

/* Calibration mode (map.html?calibrate=1) — tap to read left%/top%.
   Dev-only: gated to localhost so it never activates on a deployed host, even if
   someone appends the query param. (No bundler here to strip it at build time.) */
const isLocalDev = ['localhost', '127.0.0.1', ''].includes(location.hostname);
if (isLocalDev && new URLSearchParams(location.search).get('calibrate') === '1') {
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
