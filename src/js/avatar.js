// js/avatar.js — Avatar customizer (showcase + tabbed item panel).
//
// Two tabs:
//   • Outfits  — culturally-themed costumes; unlock with points, then equip.
//   • Character — the base animal avatar.
// For a registered account, unlock/equip is backed by the server
// (/api/progress/costumes/*), so it persists across devices; guests/offline
// fall back to the local Storage prototype store. The equipped costume layers
// on top of the base animal everywhere via avatarStackHTML().

import Storage from './utils/storage.js';
import { AVATARS, avatarEmoji } from './data/avatars.js';
import { COSTUMES, getCostume, getCostumeByBackendId } from './data/costumes.js';
import { assetImg } from './utils/assetImg.js';
import { requireAuth, showToast } from './ui.js';
import { apiGet, apiPost } from './utils/api.js';
import Sound from './utils/sound.js';

const session = requireAuth();
if (!session) throw new Error('Not logged in');

const online = session.type === 'registered';

// Costumes are parked as "Coming Soon" for now (FR6 backend + UI are built and
// can be re-enabled by flipping this single flag back to false). The Character
// tab — picking the base animal avatar — stays fully usable.
const COSTUMES_COMING_SOON = true;

let currentTab = COSTUMES_COMING_SOON ? 'animal' : 'outfits';

// ── DOM ─────────────────────────────────────────────────────────────────────
const pointsEl  = document.getElementById('av-points');
const baseEl     = document.getElementById('av-hero-base');
const costumeEl  = document.getElementById('av-hero-costume');
const nameEl     = document.getElementById('av-name');
const hintEl     = document.getElementById('av-panel-hint');
const gridEl     = document.getElementById('av-grid');

nameEl.textContent = session.displayName || 'Explorer';

// Shuffle picks a random owned costume — meaningless while costumes are parked.
if (COSTUMES_COMING_SOON) document.getElementById('av-shuffle')?.remove();

// ── Showcase ─────────────────────────────────────────────────────────────────
function renderShowcase() {
  pointsEl.textContent = `⭐ ${Storage.getPoints()}`;
  baseEl.textContent   = avatarEmoji(session.avatarId ?? 0);
  const equipped = getCostume(Storage.getEquippedCostume());
  costumeEl.innerHTML = equipped ? assetImg(equipped.img, equipped.emoji, { alt: equipped.name }) : '';
  // re-pop the costume overlay on change
  costumeEl.style.animation = 'none'; void costumeEl.offsetWidth; costumeEl.style.animation = '';
}

// ── Tabs ─────────────────────────────────────────────────────────────────────
document.querySelectorAll('.av-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.av-tab').forEach(t => {
      t.classList.remove('active'); t.setAttribute('aria-selected', 'false');
    });
    tab.classList.add('active'); tab.setAttribute('aria-selected', 'true');
    currentTab = tab.dataset.tab;
    Sound.tap();
    renderGrid();
  });
});

// ── Item grids ────────────────────────────────────────────────────────────────
function outfitCard(c) {
  const equippedId = Storage.getEquippedCostume();
  const owned   = Storage.isCostumeUnlocked(c.id);
  const isEquip = c.id === equippedId;
  const cls = ['av-item', isEquip ? 'is-selected' : '', owned ? 'is-owned' : 'is-locked'].filter(Boolean).join(' ');
  const foot = isEquip
    ? `<span class="av-item-tag">Wearing</span>`
    : owned
    ? `<span class="av-item-sub">Tap to wear</span>`
    : `<span class="av-item-price">🪙 ${c.price}</span>`;
  return `
    <button class="${cls}" data-kind="outfit" data-id="${c.id}">
      <span class="av-item-thumb">${assetImg(c.img, c.emoji, { alt: c.name })}</span>
      <span class="av-item-name">${c.name}</span>
      ${foot}
      ${!owned ? '<span class="av-item-lock">🔒</span>' : ''}
    </button>`;
}

function animalCard(a, i) {
  const isSel = (session.avatarId ?? 0) === i;
  return `
    <button class="av-item ${isSel ? 'is-selected' : 'is-owned'}" data-kind="animal" data-id="${i}">
      <span class="av-item-thumb"><span class="av-item-emoji">${a.emoji}</span></span>
      <span class="av-item-name">${a.name}</span>
      ${isSel ? '<span class="av-item-tag">Chosen</span>' : '<span class="av-item-sub">Tap to pick</span>'}
    </button>`;
}

function renderGrid() {
  if (currentTab === 'outfits') {
    if (COSTUMES_COMING_SOON) {
      hintEl.textContent = 'New cultural outfits are on the way!';
      gridEl.innerHTML = `
        <div class="av-soon">
          <span class="av-soon-emoji">🎁</span>
          <p class="av-soon-title">Costume Shop — Coming Soon!</p>
          <p class="av-soon-sub">Keep earning ⭐ points exploring states. Soon you'll be able to spend them on Baju Melayu, Cheongsam, Saree and more to dress up your explorer!</p>
        </div>`;
      return;
    }
    hintEl.textContent = 'Tap an outfit to wear it. Unlock new ones with ⭐ points!';
    gridEl.innerHTML = COSTUMES.map(outfitCard).join('');
  } else {
    hintEl.textContent = 'Pick your character — your outfit stays on top!';
    gridEl.innerHTML = AVATARS.map(animalCard).join('');
  }
}

// ── Actions ──────────────────────────────────────────────────────────────────
function applyEquip(id) {
  Storage.setEquippedCostume(id);
  renderShowcase();
  renderGrid();
}

async function equip(id) {
  const c = getCostume(id);
  if (!c) return;
  Sound.tap();
  if (online) { try { await apiPost(`/api/progress/costumes/${c.backendId}/equip`); } catch { /* keep local */ } }
  applyEquip(id);
  showToast(`${c.emoji} ${c.name} on!`);
}

async function unlock(id) {
  const c = getCostume(id);
  if (!c) return;

  if (online) {
    try {
      const r = await apiPost(`/api/progress/costumes/${c.backendId}/unlock`);
      Storage.unlockCostume(id);
      if (typeof r.newPoints === 'number') Storage.setPointsLocal(r.newPoints);
      try { await apiPost(`/api/progress/costumes/${c.backendId}/equip`); } catch { /* keep local */ }
      Sound.unlock();
      applyEquip(id);
      renderShowcase();
      showToast(`🎉 Unlocked ${c.name}!`);
    } catch (e) {
      Sound.wrong();
      showToast(e.message || `Need ${c.price} pts — keep exploring! ⭐`);
    }
    return;
  }

  // Guest / offline fallback
  if (!Storage.spendPoints(c.price)) {
    Sound.wrong();
    showToast(`Need ${c.price} pts — keep exploring to earn more! ⭐`);
    return;
  }
  Storage.unlockCostume(id);
  Sound.unlock();
  applyEquip(id);
  renderShowcase();
  showToast(`🎉 Unlocked ${c.name}!`);
}

function setAnimal(i) {
  Sound.tap();
  Storage.setSessionAvatar(i);
  session.avatarId = i;
  renderShowcase();
  renderGrid();
  showToast(`${AVATARS[i].emoji} ${AVATARS[i].name} chosen!`);
}

// Click delegation on the grid
gridEl.addEventListener('click', e => {
  const btn = e.target.closest('.av-item');
  if (!btn) return;
  const { kind, id } = btn.dataset;
  if (kind === 'animal') { setAnimal(parseInt(id, 10)); return; }
  // outfit
  if (btn.classList.contains('is-locked')) unlock(id);
  else equip(id);
});

// Shuffle — equip a random owned costume for a fun surprise.
document.getElementById('av-shuffle')?.addEventListener('click', () => {
  const owned = COSTUMES.filter(c => Storage.isCostumeUnlocked(c.id));
  if (owned.length < 2) { showToast('Unlock more outfits to shuffle! ✨'); return; }
  let pick;
  do { pick = owned[Math.floor(Math.random() * owned.length)]; }
  while (pick.id === Storage.getEquippedCostume() && owned.length > 1);
  equip(pick.id);
});

// Name edit — kept simple: names are set at sign-up (changing it would orphan
// saved progress, which is keyed per account), so we explain that gently.
document.getElementById('av-name-edit')?.addEventListener('click', () => {
  showToast('Your name is set when you sign up 😊');
});

// ── Hydrate from backend, then render ─────────────────────────────────────────
async function init() {
  if (online) {
    try {
      const me = await apiGet('/api/auth/me').catch(() => null);
      if (me?.user && typeof me.user.points === 'number') {
        Storage.setPointsLocal(Math.max(me.user.points, Storage.getPoints()));
      }
      const r = await apiGet('/api/progress/costumes');
      for (const bc of (r.data || [])) {
        const c = getCostumeByBackendId(bc.id);
        if (!c) continue;
        if (bc.is_unlocked) Storage.unlockCostume(c.id);
        if (bc.is_equipped) Storage.setEquippedCostume(c.id);
      }
    } catch { /* offline — local state */ }
  }
  // Mark the starting tab active (Character by default while costumes are parked).
  document.querySelectorAll('.av-tab').forEach(t => {
    const on = t.dataset.tab === currentTab;
    t.classList.toggle('active', on);
    t.setAttribute('aria-selected', on ? 'true' : 'false');
  });
  renderShowcase();
  renderGrid();
}

init();
