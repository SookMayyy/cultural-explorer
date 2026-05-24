// js/pages/mapPage.js — Malaysia map screen with state exploration

import { navigate, renderTopbar, renderNavbar, AppState } from '../app.js';
import Storage from '../utils/storage.js';
import { STATES_DATA, unlockedStates, nextRecommended } from '../data/states.js';

// Approximate SVG polygon coordinates for each state (viewBox 0 0 800 490)
const STATE_PATHS = {
  // West Malaysia
  perlis:    'M 148,30 L 168,28 L 175,46 L 155,52 Z',
  kedah:     'M 150,52 L 188,42 L 210,60 L 220,90 L 195,105 L 165,95 L 148,75 Z',
  penang:    'M 135,80 L 152,72 L 158,90 L 145,98 Z',
  perak:     'M 165,95 L 210,88 L 240,110 L 245,155 L 220,175 L 195,170 L 175,140 L 162,115 Z',
  kelantan:  'M 225,55 L 280,50 L 310,75 L 305,115 L 270,120 L 240,108 L 230,85 Z',
  terengganu:'M 275,118 L 312,110 L 335,145 L 315,175 L 285,165 L 270,145 Z',
  pahang:    'M 238,108 L 308,112 L 335,145 L 330,195 L 295,215 L 255,210 L 230,180 L 228,148 Z',
  selangor:  'M 195,168 L 228,158 L 232,188 L 215,205 L 195,195 Z',
  putrajaya: 'M 212,198 L 222,194 L 224,205 L 214,208 Z',
  kualalumpur:'M 208,188 L 218,185 L 220,196 L 210,198 Z',
  negeri:    'M 215,202 L 255,210 L 258,235 L 238,245 L 215,238 L 208,220 Z',
  melaka:    'M 215,238 L 238,242 L 240,258 L 222,262 L 210,252 Z',
  johor:     'M 208,252 L 260,238 L 295,245 L 310,270 L 290,295 L 255,302 L 220,285 L 205,268 Z',

  // East Malaysia
  sarawak:   'M 388,200 L 520,170 L 570,185 L 575,250 L 545,295 L 490,310 L 420,295 L 385,260 Z',
  sabah:     'M 558,140 L 640,130 L 690,155 L 695,215 L 655,255 L 600,265 L 558,240 L 545,200 Z',
  labuan:    'M 540,222 L 552,218 L 555,228 L 542,232 Z',
};

const SCOPE_STATES = ['penang', 'kelantan', 'selangor', 'melaka', 'johor', 'sabah', 'sarawak'];
const NON_SCOPE    = Object.keys(STATE_PATHS).filter(id => !SCOPE_STATES.includes(id));

const MapPage = {
  render(screen) {
    const progress  = Storage.getProgress();
    const stamps    = Storage.getStamps();
    const completed = Storage.completedCount();
    const points    = Storage.getPoints();
    const session   = AppState.session || {};
    const unlocked  = unlockedStates(progress).map(s => s.id);
    const recommended = nextRecommended(progress);

    renderTopbar({
      title:      'Cultural Explorer MY',
      showPoints: true,
      showAvatar: true,
    });
    renderNavbar('map');

    screen.innerHTML = `
      <div class="map-screen has-navbar">

        <!-- Progress strip -->
        <div class="map-progress-strip">
          <div class="map-progress-info">
            <span class="map-progress-label">🗺️ Journey: <strong>${completed}/7</strong> states</span>
            <span class="map-progress-pts">⭐ ${points} pts</span>
          </div>
          <div class="progress-track">
            <div class="progress-fill" style="width:${Math.round((completed/7)*100)}%"></div>
          </div>
        </div>

        ${recommended ? `
        <div class="map-recommended-banner" id="banner-recommended" data-state="${recommended.id}">
          <span class="map-rec-emoji">${recommended.emoji}</span>
          <div>
            <p class="map-rec-label">Next stop:</p>
            <p class="map-rec-name">${recommended.name}</p>
          </div>
          <span class="map-rec-arrow">›</span>
        </div>
        ` : `
        <div class="map-completed-banner">
          🎉 Amazing! You've explored all 7 states!
        </div>
        `}

        <!-- SVG Map -->
        <div class="map-svg-wrapper">
          <!-- 📸 IMAGE NEEDED: malaysia-map-bg.svg — decorative sea/ocean background
               Export from Figma → Map/Background — light blue sea texture
               Place in: public/assets/images/ui/map-bg.svg -->
          <svg class="map-svg" viewBox="0 0 800 490" xmlns="http://www.w3.org/2000/svg"
               role="img" aria-label="Map of Malaysia">

            <!-- Sea background -->
            <rect width="800" height="490" fill="#C8E6F5"/>

            <!-- Non-scope states (grey, not interactive) -->
            ${NON_SCOPE.map(id => `
              <path class="state-path state-non-scope" d="${STATE_PATHS[id]}"
                    data-state="${id}" fill="#C5CAD0" stroke="#fff" stroke-width="1.5"/>
            `).join('')}

            <!-- Scope states — coloured or locked -->
            ${STATES_DATA.map(state => {
              const path = STATE_PATHS[state.id];
              if (!path) return '';
              const isUnlocked  = unlocked.includes(state.id);
              const isCompleted = stamps.includes(state.id);
              const cls = isUnlocked
                ? (isCompleted ? 'state-completed' : 'state-available')
                : 'state-locked';
              const fill = isUnlocked ? state.color : '#8D9199';
              return `
                <path class="state-path ${cls}" d="${path}" data-state="${state.id}"
                      fill="${fill}" fill-opacity="${isUnlocked ? 1 : 0.55}"
                      stroke="#fff" stroke-width="2"
                      tabindex="${isUnlocked ? '0' : '-1'}" role="button"
                      aria-label="${state.name}${isCompleted ? ' (completed)' : isUnlocked ? '' : ' (locked)'}"/>
                ${isCompleted ? `<text class="state-check" x="${_pathCx(state.id)}" y="${_pathCy(state.id)}" text-anchor="middle" dominant-baseline="middle" font-size="12" fill="white">✓</text>` : ''}
                <text class="state-label" x="${_pathCx(state.id)}" y="${_pathCy(state.id) + (isCompleted ? 10 : 0)}"
                      text-anchor="middle" dominant-baseline="middle"
                      font-size="9" fill="white" font-weight="600" pointer-events="none">
                  ${state.emoji}
                </text>
              `;
            }).join('')}

            <!-- Region labels -->
            <text x="230" y="455" text-anchor="middle" font-size="11" fill="#4A6FA5" font-weight="600" font-family="'Baloo 2', sans-serif">Peninsular Malaysia</text>
            <text x="540" y="455" text-anchor="middle" font-size="11" fill="#4A6FA5" font-weight="600" font-family="'Baloo 2', sans-serif">Borneo (East Malaysia)</text>

            <!-- Unlock callout if east not yet unlocked -->
            ${unlocked.filter(id => ['sabah','sarawak'].includes(id)).length === 0 ? `
              <rect x="430" y="220" width="140" height="36" rx="8" fill="rgba(26,58,92,0.85)"/>
              <text x="500" y="242" text-anchor="middle" font-size="9" fill="#FCD116" font-weight="700" font-family="'Baloo 2', sans-serif">Complete 5 West states</text>
              <text x="500" y="252" text-anchor="middle" font-size="8" fill="white" font-family="'Baloo 2', sans-serif">to unlock East Malaysia!</text>
            ` : ''}
          </svg>
        </div>

        <!-- State list -->
        <div class="state-list">
          <h2 class="state-list-heading">All States</h2>
          ${STATES_DATA.map(state => {
            const isUnlocked  = unlocked.includes(state.id);
            const isCompleted = stamps.includes(state.id);
            return `
            <button class="state-list-item ${isUnlocked ? '' : 'locked'} ${isCompleted ? 'completed' : ''}"
                    data-state="${state.id}" ${isUnlocked ? '' : 'disabled'}>
              <span class="state-emoji" style="background:${isUnlocked ? state.colorLight : '#F3F4F6'}">
                ${state.emoji}
              </span>
              <div class="state-info">
                <span class="state-name">${state.name}</span>
                <span class="state-tagline">${isCompleted ? '✅ Completed' : isUnlocked ? state.tagline : '🔒 Locked'}</span>
              </div>
              <span class="state-arrow">${isUnlocked ? '›' : '🔒'}</span>
            </button>
            `;
          }).join('')}
        </div>

        <!-- State popup (hidden by default) -->
        <div class="map-popup hidden" id="map-popup">
          <div class="map-popup-inner">
            <button class="popup-close" id="popup-close">✕</button>
            <div class="popup-emoji" id="popup-emoji">🏝️</div>
            <h3 class="popup-name" id="popup-name">State Name</h3>
            <p class="popup-tagline" id="popup-tagline">Tagline</p>
            <div class="popup-badges" id="popup-badges"></div>
            <button class="btn-primary popup-explore-btn" id="popup-explore">
              🗺️ Explore This State!
            </button>
          </div>
        </div>
      </div>
    `;
  },

  init(screen) {
    const progress = Storage.getProgress();
    const unlocked = unlockedStates(progress).map(s => s.id);

    const showPopup = (stateId) => {
      const state = STATES_DATA.find(s => s.id === stateId);
      if (!state) return;
      const isCompleted = Storage.hasStamp(stateId);
      const sp = Storage.getStateProgress(stateId);

      screen.querySelector('#popup-emoji').textContent  = state.emoji;
      screen.querySelector('#popup-name').textContent   = state.name;
      screen.querySelector('#popup-tagline').textContent = state.tagline;

      const badges = screen.querySelector('#popup-badges');
      const tabs = ['story','culture','activity','quiz'];
      badges.innerHTML = tabs.map(t => `
        <span class="popup-badge ${sp[t] ? 'done' : ''}">${t}</span>
      `).join('');

      screen.querySelector('#map-popup').classList.remove('hidden');
      screen.querySelector('#popup-explore').dataset.state = stateId;
    };

    // SVG state click
    screen.querySelectorAll('.state-path.state-available, .state-path.state-completed').forEach(path => {
      path.addEventListener('click', () => showPopup(path.dataset.state));
    });

    // List item click
    screen.querySelectorAll('.state-list-item:not([disabled])').forEach(btn => {
      btn.addEventListener('click', () => showPopup(btn.dataset.state));
    });

    // Popup close
    screen.querySelector('#popup-close')?.addEventListener('click', () => {
      screen.querySelector('#map-popup').classList.add('hidden');
    });

    // Explore button
    screen.querySelector('#popup-explore')?.addEventListener('click', (e) => {
      const stateId = e.currentTarget.dataset.state;
      AppState.currentStateId = stateId;
      Storage.incrementVisit(stateId);
      navigate('narrative', { stateId });
    });

    // Recommended banner
    screen.querySelector('#banner-recommended')?.addEventListener('click', (e) => {
      const stateId = e.currentTarget.dataset.state;
      AppState.currentStateId = stateId;
      Storage.incrementVisit(stateId);
      navigate('narrative', { stateId });
    });
  },
};

// Helper: approximate centre x,y for each state label
function _pathCx(id) {
  const cx = {
    penang: 143, kelantan: 265, selangor: 213, melaka: 225,
    johor: 255, sabah: 620, sarawak: 480,
  };
  return cx[id] || 400;
}
function _pathCy(id) {
  const cy = {
    penang: 85, kelantan: 85, selangor: 185, melaka: 250,
    johor: 272, sabah: 195, sarawak: 240,
  };
  return cy[id] || 245;
}

export default MapPage;
