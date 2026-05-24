// js/map.js — map page interactions

import Storage from './utils/storage.js';
import { renderTopbar, renderNavbar, requireAuth } from './ui.js';
import { STATES_DATA, unlockedStates, nextRecommended } from './data/states.js';

requireAuth();
renderTopbar({ title: 'Cultural Explorer MY', showPoints: true, showAvatar: true });
renderNavbar('map');

const progress  = Storage.getProgress();
const stamps    = Storage.getStamps();
const completed = Storage.completedCount();
const points    = Storage.getPoints();
const unlocked  = unlockedStates(progress).map(s => s.id);
const recommended = nextRecommended(progress);

// ── Update progress strip ───────────────────────────────────────────────────
document.getElementById('map-completed').textContent = `${completed}/7`;
document.getElementById('map-pts').textContent = `⭐ ${points} pts`;
document.getElementById('map-progress-fill').style.width = `${Math.round((completed/7)*100)}%`;

// ── Recommended banner ─────────────────────────────────────────────────────
const banner = document.getElementById('banner-recommended');
if (recommended && banner) {
  banner.classList.remove('hidden');
  document.getElementById('rec-emoji').textContent = recommended.emoji;
  document.getElementById('rec-name').textContent  = recommended.name;
  banner.href = `narrative.html?state=${recommended.id}`;
  banner.addEventListener('click', () => Storage.setCurrentState(recommended.id));
}

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

const SCOPE = ['penang','kelantan','selangor','melaka','johor','sabah','sarawak'];
const NON_SCOPE = Object.keys(STATE_PATHS).filter(id => !SCOPE.includes(id));

// Centre points for emoji labels
const CX = { penang:143, kelantan:265, selangor:213, melaka:225, johor:255, sabah:620, sarawak:480 };
const CY = { penang:85,  kelantan:85,  selangor:185, melaka:250, johor:272, sabah:195, sarawak:240 };

const svgNS = 'http://www.w3.org/2000/svg';

function buildSVG() {
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('viewBox', '0 0 800 490');
  svg.setAttribute('class', 'map-svg');
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', 'Map of Malaysia');

  // Sea background
  const bg = document.createElementNS(svgNS, 'rect');
  bg.setAttribute('width', '800'); bg.setAttribute('height', '490'); bg.setAttribute('fill', '#C8E6F5');
  svg.appendChild(bg);

  // Non-scope states
  NON_SCOPE.forEach(id => {
    const path = document.createElementNS(svgNS, 'path');
    path.setAttribute('d', STATE_PATHS[id]);
    path.setAttribute('fill', '#C5CAD0');
    path.setAttribute('stroke', '#fff');
    path.setAttribute('stroke-width', '1.5');
    path.classList.add('state-path', 'state-non-scope');
    svg.appendChild(path);
  });

  // Scope states
  STATES_DATA.forEach(state => {
    const d = STATE_PATHS[state.id];
    if (!d) return;

    const isUnlocked  = unlocked.includes(state.id);
    const isCompleted = stamps.includes(state.id);
    const cls = isUnlocked ? (isCompleted ? 'state-completed' : 'state-available') : 'state-locked';

    const path = document.createElementNS(svgNS, 'path');
    path.setAttribute('d', d);
    path.setAttribute('fill', isUnlocked ? state.color : '#8D9199');
    path.setAttribute('fill-opacity', isUnlocked ? '1' : '0.55');
    path.setAttribute('stroke', '#fff');
    path.setAttribute('stroke-width', '2');
    path.setAttribute('data-state', state.id);
    path.classList.add('state-path', cls);
    if (isUnlocked) {
      path.setAttribute('tabindex', '0');
      path.setAttribute('role', 'button');
      path.setAttribute('aria-label', state.name + (isCompleted ? ' (completed)' : ''));
    }
    svg.appendChild(path);

    // Emoji label
    const cx = CX[state.id], cy = CY[state.id];
    if (cx) {
      if (isCompleted) {
        const check = document.createElementNS(svgNS, 'text');
        check.setAttribute('x', cx); check.setAttribute('y', cy - 6);
        check.setAttribute('text-anchor', 'middle');
        check.setAttribute('font-size', '11'); check.setAttribute('fill', 'white');
        check.textContent = '✓';
        check.classList.add('state-check');
        svg.appendChild(check);
      }
      const label = document.createElementNS(svgNS, 'text');
      label.setAttribute('x', cx); label.setAttribute('y', isCompleted ? cy + 8 : cy);
      label.setAttribute('text-anchor', 'middle'); label.setAttribute('dominant-baseline', 'middle');
      label.setAttribute('font-size', '10'); label.setAttribute('fill', 'white');
      label.setAttribute('pointer-events', 'none');
      label.classList.add('state-label');
      label.textContent = state.emoji;
      svg.appendChild(label);
    }
  });

  // Region labels
  [['Peninsular Malaysia', 230, 458], ['Borneo (East Malaysia)', 540, 458]].forEach(([txt, x, y]) => {
    const t = document.createElementNS(svgNS, 'text');
    t.setAttribute('x', x); t.setAttribute('y', y); t.setAttribute('text-anchor', 'middle');
    t.setAttribute('font-size', '10'); t.setAttribute('fill', '#4A6FA5');
    t.setAttribute('font-weight', '600'); t.setAttribute('font-family', "'Baloo 2', sans-serif");
    t.textContent = txt;
    svg.appendChild(t);
  });

  // East locked callout
  if (!unlocked.some(id => ['sabah','sarawak'].includes(id))) {
    const rect = document.createElementNS(svgNS, 'rect');
    rect.setAttribute('x', '428'); rect.setAttribute('y', '220');
    rect.setAttribute('width', '144'); rect.setAttribute('height', '40');
    rect.setAttribute('rx', '8'); rect.setAttribute('fill', 'rgba(26,58,92,0.88)');
    svg.appendChild(rect);

    const line1 = document.createElementNS(svgNS, 'text');
    line1.setAttribute('x', '500'); line1.setAttribute('y', '237');
    line1.setAttribute('text-anchor', 'middle'); line1.setAttribute('font-size', '9');
    line1.setAttribute('fill', '#FCD116'); line1.setAttribute('font-weight', '700');
    line1.setAttribute('font-family', "'Baloo 2', sans-serif");
    line1.textContent = 'Complete 5 West states';
    svg.appendChild(line1);

    const line2 = document.createElementNS(svgNS, 'text');
    line2.setAttribute('x', '500'); line2.setAttribute('y', '250');
    line2.setAttribute('text-anchor', 'middle'); line2.setAttribute('font-size', '8');
    line2.setAttribute('fill', 'white'); line2.setAttribute('font-family', "'Baloo 2', sans-serif");
    line2.textContent = 'to unlock East Malaysia!';
    svg.appendChild(line2);
  }

  return svg;
}

const container = document.getElementById('map-svg-container');
if (container) container.appendChild(buildSVG());

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

// Click on SVG paths
document.getElementById('map-svg-container')?.addEventListener('click', e => {
  const path = e.target.closest('[data-state]');
  if (path && !path.classList.contains('state-locked') && !path.classList.contains('state-non-scope')) {
    openPopup(path.dataset.state);
  }
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
