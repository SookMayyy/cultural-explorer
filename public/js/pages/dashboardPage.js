// js/pages/dashboardPage.js — Student progress dashboard

import { navigate, renderTopbar, renderNavbar, AppState } from '../app.js';
import Storage from '../utils/storage.js';
import { STATES_DATA, nextRecommended } from '../data/states.js';

const AVATARS = [
  '🦁','🐘','🦧','🦜','🐯','🦊','🦎','🦀','🐊','🦋',
  '🦚','🦃','🦤','🦞','🦅','🦩','🐢','🐬','🦈','🦦',
];

const DashboardPage = {
  render(screen) {
    const session   = AppState.session || {};
    const points    = Storage.getPoints();
    const stamps    = Storage.getStamps();
    const progress  = Storage.getProgress();
    const completed = Storage.completedCount();
    const bestScore = Storage.getBestScore();
    const next      = nextRecommended(progress);
    const avatarEmoji = AVATARS[session.avatarId ?? 0] || '👤';

    renderTopbar({ title: 'My Progress', showAvatar: true, showPoints: true });
    renderNavbar('dashboard');

    screen.innerHTML = `
      <div class="dashboard-screen has-navbar">

        <!-- Hero: avatar + name + level -->
        <div class="dashboard-hero">
          <!-- 📸 IMAGE NEEDED: batik-pattern.png — batik texture for hero background
               Already in: public/assets/images/ui/batik-pattern.png -->
          <img src="assets/images/ui/top-left.png"  class="dash-deco dash-deco--tl" alt="">
          <img src="assets/images/ui/top-right.png" class="dash-deco dash-deco--tr" alt="">

          <div class="dashboard-avatar">${avatarEmoji}</div>
          <h2 class="dashboard-name">${session.displayName || 'Explorer'}</h2>
          <p class="dashboard-level">${_levelLabel(completed)}</p>
        </div>

        <!-- Stats row -->
        <div class="dashboard-stats">
          <div class="stat-card">
            <span class="stat-value">${completed}</span>
            <span class="stat-label">States</span>
          </div>
          <div class="stat-card">
            <span class="stat-value">${stamps.length}</span>
            <span class="stat-label">Stamps</span>
          </div>
          <div class="stat-card">
            <span class="stat-value">${points}</span>
            <span class="stat-label">Points ⭐</span>
          </div>
        </div>

        <!-- Mini stamp preview -->
        <div class="dashboard-section">
          <h3 class="section-heading">My Stamps</h3>
          <div class="mini-stamp-grid">
            ${STATES_DATA.map(state => `
              <div class="mini-stamp ${stamps.includes(state.id) ? 'earned' : ''}"
                   title="${state.name}"
                   style="${stamps.includes(state.id) ? `background:${state.color}` : ''}">
                ${state.emoji}
              </div>
            `).join('')}
          </div>
          <button class="btn-ghost" id="dash-view-stamps">View full stamp book ›</button>
        </div>

        <!-- Per-state progress -->
        <div class="dashboard-section">
          <h3 class="section-heading">State Progress</h3>
          <div class="state-score-list">
            ${STATES_DATA.map(state => {
              const sp   = Storage.getStateProgress(state.id);
              const tabs = ['story','culture','activity','quiz'];
              const done = tabs.filter(t => sp[t]).length;
              const pct  = Math.round((done / tabs.length) * 100);
              return `
              <div class="state-score-row">
                <span class="state-score-emoji" style="background:${state.colorLight}">${state.emoji}</span>
                <div class="state-score-info">
                  <span class="state-score-name">${state.name}</span>
                  <div class="progress-track state-prog">
                    <div class="progress-fill" style="width:${pct}%; background:${state.color}"></div>
                  </div>
                </div>
                <span class="state-score-pct">${pct}%</span>
              </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Recommended next -->
        ${next ? `
        <div class="dashboard-section">
          <h3 class="section-heading">Recommended Next</h3>
          <div class="recommended-card" id="dash-recommended" data-state="${next.id}"
               style="background:linear-gradient(135deg, ${next.color}, ${next.color}CC)">
            <span class="rec-emoji">${next.emoji}</span>
            <div>
              <p class="rec-name">${next.name}</p>
              <p class="rec-desc">${next.tagline}</p>
            </div>
            <span class="rec-arrow">›</span>
          </div>
        </div>
        ` : ''}

        <!-- Best score + logout -->
        <div class="dashboard-section">
          <div class="best-score-row">
            <span>🏆 Best quiz score:</span>
            <strong>${bestScore} pts</strong>
          </div>
          <button class="btn-ghost dash-logout" id="dash-logout">Log out</button>
        </div>

      </div>
    `;
  },

  init(screen) {
    screen.querySelector('#dash-view-stamps')?.addEventListener('click', () => navigate('stampbook'));

    screen.querySelector('#dash-recommended')?.addEventListener('click', (e) => {
      const stateId = e.currentTarget.dataset.state;
      AppState.currentStateId = stateId;
      Storage.incrementVisit(stateId);
      navigate('narrative', { stateId });
    });

    screen.querySelector('#dash-logout')?.addEventListener('click', () => {
      if (confirm('Log out? Your progress is saved.')) {
        Storage.clearSession();
        AppState.session = null;
        navigate('home');
      }
    });
  },
};

function _levelLabel(completed) {
  if (completed === 0) return '🌱 Beginner Explorer';
  if (completed <= 2)  return '🗺️ Junior Explorer';
  if (completed <= 4)  return '⭐ Cultural Explorer';
  if (completed <= 6)  return '🏆 Expert Explorer';
  return '👑 Master Explorer — All States!';
}

export default DashboardPage;
