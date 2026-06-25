// js/avatar.js — Avatar Shop (Figma "Avatar Shop" 273:280)
//
// Players unlock culturally-themed costumes by spending points, then equip
// them onto their base animal avatar. Unlock/equip state persists via Storage
// (the offline prototype store). The base avatar is chosen at registration.

import Storage from './utils/storage.js';
import { avatarEmoji } from './data/avatars.js';
import { COSTUMES, getCostume } from './data/costumes.js';
import { requireAuth, showToast } from './ui.js';

const session = requireAuth();
if (!session) throw new Error('Not logged in');

// ── DOM references ──────────────────────────────────────────────────────────
const heroBase    = document.getElementById('av-hero-base');
const heroCostume = document.getElementById('av-hero-costume');
const wearingName = document.getElementById('av-wearing-name');
const grid        = document.getElementById('av-grid');
const topbarPts   = document.getElementById('topbar-pts');

// Base animal avatar (chosen at registration) sits under every costume.
heroBase.textContent = avatarEmoji(session.avatarId ?? null);

// ── Renderers ───────────────────────────────────────────────────────────────
function renderPoints() {
  topbarPts.textContent = `⭐ ${Storage.getPoints()} pts`;
}

function renderPreview() {
  const equipped = getCostume(Storage.getEquippedCostume());
  heroCostume.textContent = equipped ? equipped.emoji : '';
  wearingName.textContent = equipped ? equipped.name : '—';
}

function cardStateMarkup(c) {
  const equippedId = Storage.getEquippedCostume();
  if (c.id === equippedId) {
    return `<span class="av-card-equipped-tag">Equipped</span>`;
  }
  if (Storage.isCostumeUnlocked(c.id)) {
    return `<button class="av-card-btn av-card-btn--equip" data-action="equip" data-id="${c.id}">Equip</button>`;
  }
  return `
    <span class="av-card-price">🪙 ${c.price}</span>
    <button class="av-card-btn av-card-btn--unlock" data-action="unlock" data-id="${c.id}">Unlock</button>
  `;
}

function buildGrid() {
  const equippedId = Storage.getEquippedCostume();
  grid.innerHTML = COSTUMES.map(c => {
    const owned    = Storage.isCostumeUnlocked(c.id);
    const isEquip  = c.id === equippedId;
    const classes  = ['av-card', isEquip ? 'is-equipped' : '', owned ? 'is-owned' : 'is-locked']
      .filter(Boolean).join(' ');
    return `
      <div class="${classes}" data-id="${c.id}">
        <div class="av-card-icon"><span>${c.emoji}</span></div>
        <span class="av-card-name">${c.name}</span>
        <div class="av-card-foot">${cardStateMarkup(c)}</div>
      </div>
    `;
  }).join('');
}

// ── Actions ─────────────────────────────────────────────────────────────────
function equip(id) {
  Storage.setEquippedCostume(id);
  renderPreview();
  buildGrid();
  const c = getCostume(id);
  if (c) showToast(`${c.emoji} ${c.name} equipped!`);
}

function unlock(id) {
  const c = getCostume(id);
  if (!c) return;
  if (!Storage.spendPoints(c.price)) {
    showToast(`Need ${c.price} pts — keep exploring to earn more! ⭐`);
    return;
  }
  Storage.unlockCostume(id);
  renderPoints();
  // Auto-equip the freshly unlocked costume for a satisfying reveal.
  equip(id);
  showToast(`🎉 Unlocked ${c.name}!`);
}

// ── Event delegation ────────────────────────────────────────────────────────
grid.addEventListener('click', e => {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;
  const { action, id } = btn.dataset;
  if (action === 'unlock') unlock(id);
  else if (action === 'equip') equip(id);
});

// ── Initial render ──────────────────────────────────────────────────────────
renderPoints();
renderPreview();
buildGrid();
