// js/avatar.js — Avatar shop (character picker + background colour).
//
// The player picks ONE avatar free at sign-up (recorded as owned). Every other
// avatar must be BOUGHT with points here; owned ones can be equipped freely.
// The shop also lets the player choose a profile background colour, which themes
// their profile everywhere via the --profile-color CSS variable (default purple).

import Storage from './utils/storage.js';
import { AVATARS, avatarImg } from './data/avatars.js';
import { requireAuth, showToast, applyProfileColor } from './ui.js';
import { apiGet } from './utils/api.js';
import { confirmPopup } from './components/popup.js';
import Sound from './utils/sound.js';

const session = requireAuth();
if (!session) throw new Error('Not logged in');

const online = session.type === 'registered';

// Cost (in points) to buy any non-starter avatar.
const AVATAR_COST = 100;

// Selectable profile background colours. The first is the default (purple).
const PROFILE_COLORS = [
  '#6a32c9', // purple (default)
  '#2b6cb0', // blue
  '#0e9aa7', // teal
  '#2e8b57', // green
  '#e67e22', // orange
  '#d6336c', // pink
  '#c0392b', // red
  '#3b3b98', // indigo
];

// ── DOM ─────────────────────────────────────────────────────────────────────
const pointsEl = document.getElementById('av-points');
const baseEl   = document.getElementById('av-hero-base');
const nameEl   = document.getElementById('av-name');
const hintEl   = document.getElementById('av-panel-hint');
const gridEl   = document.getElementById('av-grid');
const colorsEl = document.getElementById('av-colors');

nameEl.textContent = session.displayName || 'Explorer';

// ── Showcase ─────────────────────────────────────────────────────────────────
function renderShowcase() {
  pointsEl.textContent = `⭐ ${Storage.getPoints()}`;
  baseEl.innerHTML     = avatarImg(session.avatarId ?? 0);
}

// ── Character grid (owned = equip, locked = buy) ──────────────────────────────
function animalCard(a, i) {
  const isSel   = (session.avatarId ?? 0) === i;
  const owned   = Storage.ownsAvatar(i);
  if (isSel) {
    return `
      <button class="av-item is-selected" data-id="${i}" data-owned="1">
        <span class="av-item-thumb">${avatarImg(i)}</span>
        <span class="av-item-name">${a.name}</span>
        <span class="av-item-tag">Chosen</span>
      </button>`;
  }
  if (owned) {
    return `
      <button class="av-item is-owned" data-id="${i}" data-owned="1">
        <span class="av-item-thumb">${avatarImg(i)}</span>
        <span class="av-item-name">${a.name}</span>
        <span class="av-item-sub">Tap to wear</span>
      </button>`;
  }
  return `
    <button class="av-item is-locked" data-id="${i}" data-owned="0">
      <span class="av-item-thumb">${avatarImg(i)}</span>
      <span class="av-item-name">${a.name}</span>
      <span class="av-item-price">⭐ ${AVATAR_COST}</span>
    </button>`;
}

function renderGrid() {
  hintEl.textContent = 'Wear an avatar, or buy a new one with ⭐!';
  gridEl.innerHTML = AVATARS.map(animalCard).join('');
}

// ── Colour swatches ───────────────────────────────────────────────────────────
function renderColors() {
  const current = Storage.getProfileColor();
  colorsEl.innerHTML = PROFILE_COLORS.map(c => {
    const sel = c.toLowerCase() === current.toLowerCase();
    return `<button class="av-color ${sel ? 'is-selected' : ''}" data-color="${c}"
                    style="--sw:${c}" aria-label="Background colour ${c}"
                    aria-pressed="${sel}">${sel ? '✓' : ''}</button>`;
  }).join('');
}

// ── Actions ──────────────────────────────────────────────────────────────────
function equipAnimal(i) {
  Sound.tap();
  Storage.setSessionAvatar(i);
  session.avatarId = i;
  renderShowcase();
  renderGrid();
  showToast(`${AVATARS[i].name} equipped!`);
}

async function buyAnimal(i) {
  if (Storage.getPoints() < AVATAR_COST) {
    Sound.wrong?.();
    showToast(`You need ${AVATAR_COST} ⭐ to unlock ${AVATARS[i].name}. Keep playing!`);
    return;
  }

  // Confirm before spending — points are hard-earned, so make the purchase a
  // deliberate choice rather than an accidental tap.
  Sound.tap?.();
  const confirmed = await confirmPopup(
    `Spend ⭐ ${AVATAR_COST} points to unlock <b>${AVATARS[i].name}</b>?`,
    {
      title:       'Buy this avatar?',
      // Show the actual animal they're about to buy so they can confirm it's the
      // right one; the avatar's own emoji is the fallback if the art fails to load.
      image:       AVATARS[i].img,
      emoji:       AVATARS[i].emoji,
      confirmText: `Buy for ⭐ ${AVATAR_COST}`,
      cancelText:  'Not now',
    },
  );
  if (!confirmed) return;

  // Re-check the balance in case it changed while the popup was open.
  if (Storage.getPoints() < AVATAR_COST) {
    Sound.wrong?.();
    showToast(`You need ${AVATAR_COST} ⭐ to unlock ${AVATARS[i].name}. Keep playing!`);
    return;
  }
  Storage.spendPoints(AVATAR_COST);
  Storage.addOwnedAvatar(i);
  Sound.win?.();
  showToast(`Unlocked ${AVATARS[i].name}! 🎉`);
  equipAnimal(i);              // equip the newly-bought avatar right away
}

gridEl.addEventListener('click', e => {
  const btn = e.target.closest('.av-item');
  if (!btn) return;
  const i = parseInt(btn.dataset.id, 10);
  if (btn.dataset.owned === '1') equipAnimal(i);
  else                           buyAnimal(i);
});

function pickColor(hex) {
  Sound.tap?.();
  Storage.setProfileColor(hex);
  applyProfileColor();         // update the live --profile-color immediately
  renderColors();
  showToast('Background colour updated!');
}

colorsEl.addEventListener('click', e => {
  const sw = e.target.closest('.av-color');
  if (sw) pickColor(sw.dataset.color);
});

// Name edit — names are set at sign-up (changing it would orphan per-account
// saved progress), so we explain that gently.
document.getElementById('av-name-edit')?.addEventListener('click', () => {
  showToast('Your name is set when you sign up 😊');
});

// ── Hydrate points from backend, then render ──────────────────────────────────
async function init() {
  applyProfileColor();
  if (online) {
    try {
      const me = await apiGet('/api/auth/me').catch(() => null);
      if (me?.user && typeof me.user.points === 'number') {
        Storage.setPointsLocal(Math.max(me.user.points, Storage.getPoints()));
      }
    } catch { /* offline — local state */ }
  }
  renderShowcase();
  renderGrid();
  renderColors();
}

init();
