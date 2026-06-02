// js/map.js — map page interactions

import Storage from './utils/storage.js';
import { renderTopbar, renderNavbar, requireAuth } from './ui.js';
import { STATES_DATA, unlockedStates } from './data/states.js';

requireAuth();
renderTopbar({ 
  // Add an inline <img> tag before the "My Map" text
  title: `<span style="display:inline-flex; align-items:center;">
            <img src="/assets/images/ui/my-map-icon.png" alt="Map Icon" style="margin-right: 5px;">  
            My Map
          </span>`,
  showPoints: true, 
  showAvatar: true 
});
renderNavbar('map');

const progress  = Storage.getProgress();
const stamps    = Storage.getStamps();
const completed = Storage.completedCount();
const unlocked  = unlockedStates(progress).map(s => s.id);

// ── Update progress pill ────────────────────────────────────────────────────
document.getElementById('map-completed').textContent = `${completed}/7 explored`;
document.getElementById('map-pts').textContent = `${Math.round((completed / 7) * 100)}%`;

// ── SVG map ──────────────────────────────────────────────────────────────────
const STATE_PATHS = {
  perlis:      'M 148,30 L 168,28 L 175,46 L 155,52 Z',
  kedah:       'M 150,52 L 188,42 L 210,60 L 220,90 L 195,105 L 165,95 L 148,75 Z',
  penang:      'M 135,80 L 152,72 L 158,90 L 145,98 Z',
  perak:       'M 165,95 L 210,88 L 240,110 L 245,155 L 220,175 L 195,170 L 175,140 L 162,115 Z',
  kelantan:    'M 225,55 L 280,50 L 310,75 L 305,115 L 270,120 L 240,108 L 230,85 Z',
  terengganu:  'M 275,118 L 312,110 L 335,145 L 315,175 L 285,165 L 270,145 Z',
  pahang:      'M 238,108 L 308,112 L 335,145 L 330,195 L 295,215 L 255,210 L 230,180 L 228,148 Z',
  selangor:    'M 195,168 L 228,158 L 232,188 L 215,205 L 195,195 Z',
  negeri:      'M 215,202 L 255,210 L 258,235 L 238,245 L 215,238 L 208,220 Z',
  melaka:      'M 215,238 L 238,242 L 240,258 L 222,262 L 210,252 Z',
  johor:       'M 208,252 L 260,238 L 295,245 L 310,270 L 290,295 L 255,302 L 220,285 L 205,268 Z',
  sarawak:     'M 388,200 L 520,170 L 570,185 L 575,250 L 545,295 L 490,310 L 420,295 L 385,260 Z',
  sabah:       'M 558,140 L 640,130 L 690,155 L 695,215 L 655,255 L 600,265 L 558,240 L 545,200 Z',
};

const svgNS = 'http://www.w3.org/2000/svg';

// Builds a transparent SVG overlay with clickable paths for unlocked states.
// Positioned absolutely over map.png via CSS; no visual fill or stroke.
function buildClickOverlay() {
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('viewBox', '0 0 800 490');
  svg.setAttribute('class', 'map-click-overlay');
  svg.setAttribute('aria-hidden', 'true');

  STATES_DATA.forEach(state => {
    const d = STATE_PATHS[state.id];
    if (!d) return;
    const isUnlocked = unlocked.includes(state.id);

    const path = document.createElementNS(svgNS, 'path');
    path.setAttribute('d', d);
    path.setAttribute('fill', 'transparent');
    path.setAttribute('stroke', 'none');
    if (isUnlocked) {
      path.setAttribute('data-state', state.id);
      path.style.cursor = 'pointer';
    } else {
      path.style.pointerEvents = 'none';
    }
    svg.appendChild(path);
  });

  return svg;
}

const mapWrap = document.getElementById('malaysia-map-wrap');
if (mapWrap) mapWrap.appendChild(buildClickOverlay());

// ── State list ────────────────────────────────────────────────────────────────
const listEl = document.getElementById('state-list-items');
if (listEl) {
  listEl.innerHTML = STATES_DATA.map(state => {
    const isUnlocked  = unlocked.includes(state.id);
    const isCompleted = stamps.includes(state.id);
    return `
      <button class="state-list-item ${isUnlocked ? '' : 'locked'} ${isCompleted ? 'completed' : ''}"
              data-state="${state.id}" ${isUnlocked ? '' : 'disabled'}>
        <span class="state-emoji" style="background:${isUnlocked ? state.colorLight : '#F3F4F6'}">${state.emoji}</span>
        <div class="state-info">
          <span class="state-name">${state.name}</span>
          <span class="state-tagline">${isCompleted ? '✅ Completed' : isUnlocked ? state.tagline : '🔒 Locked'}</span>
        </div>
        <span class="state-arrow">${isUnlocked ? '›' : '🔒'}</span>
      </button>
    `;
  }).join('');
}

// ── Popup ──────────────────────────────────────────────────────────────────────
function openPopup(stateId) {
  const state = STATES_DATA.find(s => s.id === stateId);
  if (!state) return;

  const sp   = Storage.getStateProgress(stateId);
  const tabs = ['story','culture','activity','quiz'];

  document.getElementById('popup-emoji').textContent   = state.emoji;
  document.getElementById('popup-name').textContent    = state.name;
  document.getElementById('popup-tagline').textContent = state.tagline;
  document.getElementById('popup-badges').innerHTML    = tabs.map(t =>
    `<span class="popup-badge ${sp[t] ? 'done' : ''}">${t}</span>`
  ).join('');

  const exploreBtn = document.getElementById('popup-explore');
  exploreBtn.href = `narrative.html?state=${stateId}`;
  exploreBtn.addEventListener('click', () => Storage.setCurrentState(stateId));

  document.getElementById('map-popup').classList.remove('hidden');
}

// Click on map image (via transparent SVG overlay paths)
document.getElementById('malaysia-map-wrap')?.addEventListener('click', e => {
  const path = e.target.closest('[data-state]');
  if (path) openPopup(path.dataset.state);
});

// Click on list items
document.getElementById('state-list-items')?.addEventListener('click', e => {
  const btn = e.target.closest('.state-list-item:not([disabled])');
  if (btn) openPopup(btn.dataset.state);
});

// Close popup
document.getElementById('popup-close')?.addEventListener('click', () => {
  document.getElementById('map-popup').classList.add('hidden');
});
document.getElementById('map-popup')?.addEventListener('click', e => {
  if (e.target === document.getElementById('map-popup')) {
    document.getElementById('map-popup').classList.add('hidden');
  }
});
