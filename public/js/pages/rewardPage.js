// js/pages/rewardPage.js — Celebration / reward screen after quiz

import { navigate, AppState } from '../app.js';
import Storage from '../utils/storage.js';
import { getState, nextRecommended } from '../data/states.js';

const RewardPage = {
  render(screen, params = {}) {
    const stateId     = params.stateId || AppState.currentStateId;
    const state       = getState(stateId);
    const score       = params.score       || 0;
    const total       = params.total       || 4;
    const earned      = params.earned      || 0;
    const stampEarned = params.stampEarned !== false;

    // Hide topbar + navbar for full-screen celebration
    const topbarEl = document.getElementById('topbar');
    const navbarEl = document.getElementById('navbar');
    if (topbarEl) topbarEl.hidden = true;
    if (navbarEl) navbarEl.hidden = true;

    const next = nextRecommended(Storage.getProgress());
    const totalPts = Storage.getPoints();

    screen.innerHTML = `
      <div class="reward-screen">

        <!-- Animated stars background -->
        <div class="reward-stars" id="reward-stars" aria-hidden="true"></div>

        <!-- State colour accent bar at top -->
        <div class="reward-accent-bar" style="background:${state?.color || '#C0392B'}"></div>

        <!-- Mascot celebration -->
        <div class="reward-mascot" id="reward-mascot">🦁</div>

        <!-- Score -->
        <div class="reward-score-area">
          <p class="reward-result-label">${score >= Math.ceil(total/2) ? '🎉 Excellent!' : '😊 Good try!'}</p>
          <p class="reward-score-fraction">${score}<span>/${total}</span></p>
          <p class="reward-score-sub">questions correct</p>
        </div>

        <!-- Stamp reveal (if earned) -->
        ${stampEarned ? `
        <div class="reward-stamp-container">
          <div class="reward-stamp" style="border-color:${state?.color}; box-shadow: 0 0 32px ${state?.color}88">
            <!-- 📸 IMAGE NEEDED: stamp-${stateId}.png — collectible stamp design for ${state?.name}
                 Export from Figma → Stamps/${state?.name} — round stamp illustration
                 Place in: public/assets/images/stamps/${stateId}.png -->
            <div class="reward-stamp-inner">
              <span class="reward-stamp-emoji">${state?.emoji || '🗺️'}</span>
              <span class="reward-stamp-name">${state?.name}</span>
              <span class="reward-stamp-label">STAMP EARNED!</span>
            </div>
          </div>
        </div>
        ` : `
        <div class="reward-no-stamp card">
          <p>Score at least 50% to earn a stamp! 💪</p>
          <p class="text-muted">You got ${score}/${total} — keep practising!</p>
        </div>
        `}

        <!-- Points earned -->
        <div class="reward-points-card">
          <span class="reward-pts-label">Points earned this round</span>
          <span class="reward-pts-value">+${earned} ⭐</span>
          <span class="reward-pts-total">Total: ${totalPts} pts</span>
        </div>

        <!-- Next recommendation -->
        ${next ? `
        <div class="reward-next-card" id="reward-next" data-state="${next.id}">
          <span class="reward-next-label">Next Adventure:</span>
          <span class="reward-next-name">${next.emoji} ${next.name}</span>
          <span class="reward-next-arrow">›</span>
        </div>
        ` : `
        <div class="reward-all-done">
          🏆 You've explored all available states! Amazing!
        </div>
        `}

        <!-- Action buttons -->
        <div class="reward-actions">
          <button class="btn-primary reward-btn-map" id="reward-btn-map">
            🗺️ Back to Map
          </button>
          <button class="btn-secondary reward-btn-stamps" id="reward-btn-stamps">
            📚 View Stamp Book
          </button>
        </div>

      </div>
    `;
  },

  init(screen, params = {}) {
    // Animate stars
    this._spawnStars(screen);
    this._spawnConfetti();

    // Animate mascot
    const mascot = screen.querySelector('#reward-mascot');
    if (mascot) {
      mascot.style.animation = 'mascot-celebrate 0.8s ease 0.5s both';
    }

    // Next state button
    screen.querySelector('#reward-next')?.addEventListener('click', (e) => {
      const stateId = e.currentTarget.dataset.state;
      AppState.currentStateId = stateId;
      Storage.incrementVisit(stateId);
      navigate('narrative', { stateId });
    });

    screen.querySelector('#reward-btn-map')?.addEventListener('click', () => navigate('map'));
    screen.querySelector('#reward-btn-stamps')?.addEventListener('click', () => navigate('stampbook'));
  },

  _spawnStars(screen) {
    const container = screen.querySelector('#reward-stars');
    if (!container) return;
    for (let i = 0; i < 20; i++) {
      const star = document.createElement('div');
      star.className = 'reward-star';
      star.textContent = '★';
      star.style.cssText = `
        left: ${Math.random() * 100}%;
        top:  ${Math.random() * 60}%;
        animation-delay: ${Math.random() * 2}s;
        font-size: ${12 + Math.random() * 16}px;
        opacity: ${0.4 + Math.random() * 0.6};
      `;
      container.appendChild(star);
    }
  },

  _spawnConfetti() {
    const COLORS = ['#C0392B','#FCD116','#1A3A5C','#27AE60','#E67E22','#8E44AD'];
    for (let i = 0; i < 40; i++) {
      const piece = document.createElement('div');
      piece.className = 'confetti-piece';
      piece.style.cssText = `
        left: ${Math.random() * 100}vw;
        top: -10px;
        background: ${COLORS[Math.floor(Math.random() * COLORS.length)]};
        animation-duration: ${2 + Math.random() * 2}s;
        animation-delay: ${Math.random() * 1}s;
        transform: rotate(${Math.random() * 360}deg);
      `;
      document.body.appendChild(piece);
      setTimeout(() => piece.remove(), 4000);
    }
  },
};

export default RewardPage;
