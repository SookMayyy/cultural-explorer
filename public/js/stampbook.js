// js/stampbook.js — stamp book page

import Storage from './utils/storage.js';
import { renderTopbar, renderNavbar, requireAuth, showToast } from './ui.js';
import { STATES_DATA } from './data/states.js';

requireAuth();
renderTopbar({ title: 'Stamp Book', showPoints: true, showAvatar: true });
renderNavbar('stampbook');

const stamps    = Storage.getStamps();
const earned    = stamps.length;
const total     = STATES_DATA.length;

// Update header
document.getElementById('stamp-count-badge').textContent = `${earned} / ${total} stamps`;
document.getElementById('stamp-progress-fill').style.width = `${Math.round((earned/total)*100)}%`;

// Footer message
const footer = document.getElementById('stamp-footer-msg');
if (earned === total) {
  footer.className    = 'stamp-all-collected';
  footer.textContent  = '🏆 Wow! You\'ve collected ALL stamps! You\'re a true Cultural Explorer!';
}

// ── Render stamps ─────────────────────────────────────────────────────────────
function renderStamps(containerId, regionFilter) {
  const el = document.getElementById(containerId);
  if (!el) return;

  el.innerHTML = STATES_DATA
    .filter(s => s.region === regionFilter)
    .map(state => {
      const isEarned = stamps.includes(state.id);
      return `
        <div class="stamp-shape ${isEarned ? 'stamp-earned' : 'stamp-unearned'} stamp-${state.id}"
             data-state="${state.id}" data-name="${state.name}"
             style="${isEarned ? `--stamp-color:${state.color}` : ''}"
             role="button" tabindex="0">
          <!-- 📸 IMAGE NEEDED: assets/images/stamps/${state.id}.png
               Export from Figma → Stamps/${state.name}
               Replace inner content with: <img src="assets/images/stamps/${state.id}.png" alt="${state.name} stamp"> -->
          <div class="stamp-inner">
            <span class="stamp-emoji">${state.emoji}</span>
            <span class="stamp-state-name">${state.name}</span>
            ${isEarned ? '<span class="stamp-check">✓</span>' : '<span class="stamp-lock">🔒</span>'}
          </div>
        </div>
      `;
    }).join('');
}

renderStamps('west-stamps', 'west');
renderStamps('east-stamps', 'east');

// ── Stamp click ───────────────────────────────────────────────────────────────
document.querySelectorAll('.stamp-shape').forEach(stamp => {
  stamp.addEventListener('click', () => {
    const id       = stamp.dataset.state;
    const isEarned = stamps.includes(id);

    if (isEarned) {
      showToast(`${stamp.dataset.name} stamp collected! ✅`);
    } else {
      Storage.setCurrentState(id);
      window.location.href = `narrative.html?state=${id}`;
    }
  });
});
