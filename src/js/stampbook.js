/* stampbook.js — stamp book page (dynamic; reflects real progress) */

import Storage from './utils/storage.js';
import { renderTopbar, renderNavbar, requireAuth, showToast } from './ui.js';
import { STATES_DATA, stampImgFor } from './data/states.js';
import { assetImg } from './utils/assetImg.js';
import { showPopup } from './components/popup.js';

requireAuth();
renderTopbar({ title: 'My Stamp Book', showBack: true, backHref: 'dashboard.html', showPoints: true, color: '#6b50ce' });
renderNavbar('stampbook');

const stamps = Storage.getStamps();
const earned = stamps.length;
const total  = STATES_DATA.length;

/* Collection Progress card */
document.getElementById('sb-fill').style.width = `${total ? Math.round((earned / total) * 100) : 0}%`;
document.getElementById('sb-count').textContent = `${earned} of ${total} stamps earned`;
document.getElementById('sb-big').textContent   = `${earned}/${total}`;

/* Region sections (West / East Malaysia) */
// Earned → coloured circle with the state's stamp + ✓; not yet → a "?" mystery circle.
const REGIONS = [
  { id: 'west', label: 'WEST<br>MALAYSIA' },
  { id: 'east', label: 'EAST<br>MALAYSIA' },
];

function slotHTML(state) {
  const isEarned = stamps.includes(state.id);
  if (isEarned) {
    // Prefer the state's own stamp illustration; fall back to the flag/emoji.
    const stampSrc = stampImgFor(state.id);
    const inner = stampSrc
      ? assetImg(stampSrc, state.emoji, { alt: `${state.name} stamp`, cls: 'sb-slot-img' })
      : (state.emoji.includes('<img')
          ? state.emoji.replace('<img', '<img class="sb-slot-img"')
          : `<span class="sb-slot-emoji">${state.emoji}</span>`);
    return `<div class="sb-slot earned" data-state="${state.id}" data-name="${state.name}"
                 role="button" tabindex="0" aria-label="${state.name} — collected" title="${state.name}">
              <div class="sb-slot-circle" style="--stamp-clr:${state.color}">${inner}</div>
              <span class="sb-slot-check" aria-hidden="true">✓</span>
            </div>`;
  }
  return `<div class="sb-slot locked" data-state="${state.id}" data-name="${state.name}"
               role="button" tabindex="0" aria-label="${state.name} — not collected yet" title="${state.name}">
            <div class="sb-slot-circle">?</div>
          </div>`;
}

const sectionsEl = document.getElementById('sb-sections');
sectionsEl.innerHTML = REGIONS.map(region => {
  const states = STATES_DATA.filter(s => s.region === region.id);
  const got    = states.filter(s => stamps.includes(s.id)).length;
  return `<div class="sb-region">
            <div class="sb-region-head">
              <h2 class="sb-region-title">${region.label}</h2>
              <span class="sb-region-count">${got} / ${states.length} Stamps</span>
            </div>
            <div class="sb-region-slots">
              ${states.map(slotHTML).join('')}
            </div>
          </div>`;
}).join('');

/* Footer celebration when all collected */
if (earned === total && earned > 0) {
  showToast('🏆 Wow! You collected ALL stamps — a true Cultural Explorer!', 3500);
}

/* Interaction */
// Earned → confirmation toast. Locked → a popup explaining how to earn it, with
// an explicit choice to explore that state (not a silent navigation on tap).
async function handle(slot) {
  const id   = slot.dataset.state;
  const name = slot.dataset.name;
  if (stamps.includes(id)) {
    showToast(`${name} stamp collected! ✅`);
    return;
  }

  const choice = await showPopup({
    title: 'Not collected yet',
    emoji: '🔒',
    message: `Explore <strong>${name}</strong> and finish all its missions to earn this stamp!`,
    actions: [
      { label: `Explore ${name}`, value: 'go',  style: 'primary' },
      { label: 'Maybe later',     value: null, style: 'ghost'   },
    ],
  });

  if (choice === 'go') {
    Storage.setCurrentState(id);
    window.location.href = `narrative.html?state=${id}`;
  }
  // Otherwise (Maybe later / backdrop / Esc) → stay on the stamp book.
}

sectionsEl.querySelectorAll('.sb-slot').forEach(slot => {
  slot.addEventListener('click', () => handle(slot));
  slot.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handle(slot); }
  });
});
