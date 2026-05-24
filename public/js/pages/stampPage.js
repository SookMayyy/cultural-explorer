// js/pages/stampPage.js — Stamp book screen

import { navigate, renderTopbar, renderNavbar, AppState } from '../app.js';
import Storage from '../utils/storage.js';
import { STATES_DATA } from '../data/states.js';

const StampPage = {
  render(screen) {
    const stamps    = Storage.getStamps();
    const earned    = stamps.length;
    const total     = STATES_DATA.length;

    renderTopbar({ title: 'Stamp Book', showPoints: true, showAvatar: true });
    renderNavbar('stampbook');

    screen.innerHTML = `
      <div class="stampbook-screen has-navbar">

        <!-- Stamp book header (leather look) -->
        <div class="stamp-book-header">
          <!-- 📸 IMAGE NEEDED: stampbook-cover.png — leather book cover texture
               Export from Figma → StampBook/Header background
               Place in: public/assets/images/ui/stampbook-cover.png -->
          <div class="stamp-book-title-row">
            <span class="stamp-book-icon">📚</span>
            <div>
              <h2 class="stamp-book-title">My Stamp Book</h2>
              <p class="stamp-book-sub">Collect stamps by exploring each state!</p>
            </div>
          </div>
          <div class="stamp-count-badge">
            ${earned} / ${total} stamps
          </div>
          <div class="stamp-book-progress">
            <div class="progress-track">
              <div class="progress-fill" style="width:${Math.round((earned/total)*100)}%"></div>
            </div>
          </div>
        </div>

        <!-- "Book pages" area -->
        <div class="stamp-book-pages">
          <h3 class="stamp-section-label">🇲🇾 West Malaysia</h3>
          <div class="stamp-grid">
            ${STATES_DATA.filter(s => s.region === 'west').map(state => _renderStamp(state, stamps.includes(state.id))).join('')}
          </div>

          <h3 class="stamp-section-label" style="margin-top:1.5rem">🌿 East Malaysia</h3>
          <div class="stamp-grid">
            ${STATES_DATA.filter(s => s.region === 'east').map(state => _renderStamp(state, stamps.includes(state.id))).join('')}
          </div>
        </div>

        <!-- Motivational footer -->
        ${earned === total
          ? `<div class="stamp-all-collected">🏆 Wow! You've collected ALL stamps! You're a true Cultural Explorer!</div>`
          : `<div class="stamp-motivation">Keep exploring to collect all ${total} stamps! 🗺️</div>`
        }
      </div>
    `;
  },

  init(screen) {
    const stamps = Storage.getStamps();

    screen.querySelectorAll('.stamp-shape').forEach(stamp => {
      stamp.addEventListener('click', () => {
        const stateId = stamp.dataset.state;
        const earned  = stamps.includes(stateId);

        if (earned) {
          _showToast(`${stamp.dataset.name} stamp collected! ✅`);
        } else {
          AppState.currentStateId = stateId;
          navigate('narrative', { stateId });
        }
      });
    });
  },
};

function _renderStamp(state, earned) {
  return `
    <div class="stamp-shape ${earned ? 'stamp-earned' : 'stamp-unearned'} stamp-${state.id}"
         data-state="${state.id}" data-name="${state.name}"
         style="${earned ? `--stamp-color:${state.color}` : ''}">
      <!-- 📸 IMAGE NEEDED: stamp-${state.id}.png — collectible stamp for ${state.name}
           Export from Figma → Stamps/${state.name} — round/square stamp design
           Place in: public/assets/images/stamps/${state.id}.png -->
      <div class="stamp-inner">
        <span class="stamp-emoji">${state.emoji}</span>
        <span class="stamp-state-name">${state.name}</span>
        ${earned ? '<span class="stamp-check">✓</span>' : '<span class="stamp-lock">🔒</span>'}
      </div>
    </div>
  `;
}

function _showToast(msg) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

export default StampPage;
