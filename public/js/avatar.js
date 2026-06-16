// js/avatar.js — Avatar Shop page
//
// Lets students pick and equip one of 16 animal avatars.
// The selected avatar index is saved into localStorage via Storage,
// and shows up in the topbar on every screen.

import Storage from './utils/storage.js';
import { AVATARS, avatarEmoji } from './data/avatars.js';
import { requireAuth } from './ui.js';

// ── Auth guard — redirect home if no session ─────────────────────────────────
const session = requireAuth();
if (!session) throw new Error('Not logged in');

// ── State — track which card the player has clicked ─────────────────────────
// We store the "pending" selection separately so Equip is only enabled when
// the player has actually chosen a different avatar from what they have now.
let pendingIdx = session.avatarId ?? null;
const currentIdx = session.avatarId ?? null;

// ── DOM references ────────────────────────────────────────────────────────────
const heroPreview   = document.getElementById('av-hero-preview');
const heroName      = document.getElementById('av-hero-name');
const equippedBadge = document.getElementById('av-equipped-badge');
const grid          = document.getElementById('av-grid');
const confirmBtn    = document.getElementById('av-confirm');
const topbarPts     = document.getElementById('topbar-pts');
const topbarAvatar  = document.getElementById('topbar-avatar');

// ── Topbar fill ───────────────────────────────────────────────────────────────
topbarPts.textContent    = `⭐ ${Storage.getPoints()} pts`;
topbarAvatar.textContent = avatarEmoji(currentIdx);

// ── Badge text helper ─────────────────────────────────────────────────────────
function updateEquippedBadge(idx) {
  if (idx === null || idx === undefined) {
    equippedBadge.textContent = 'No avatar equipped';
    return;
  }
  const a = AVATARS[idx];
  equippedBadge.textContent = a ? `Equipped: ${a.name}` : 'No avatar equipped';
}

// ── Hero preview update ───────────────────────────────────────────────────────
// Triggers the CSS swap animation by briefly removing then re-adding the class.
function updateHeroPreview(idx) {
  const emoji = avatarEmoji(idx);
  const name  = idx !== null ? AVATARS[idx]?.name || 'Explorer' : 'Choose Your Explorer!';

  // Remove the class first so the animation re-triggers
  heroPreview.classList.remove('swap');
  // Use requestAnimationFrame to let the DOM register the removal
  requestAnimationFrame(() => {
    heroPreview.textContent = emoji;
    heroPreview.classList.add('swap');
    heroName.textContent    = name;
  });
}

// ── Build the avatar grid ─────────────────────────────────────────────────────
function buildGrid() {
  grid.innerHTML = AVATARS.map((av, idx) => {
    // Determine which visual state this card starts in
    const isEquipped = idx === currentIdx;
    const classes = ['av-card', isEquipped ? 'equipped selected' : ''].filter(Boolean).join(' ');

    // The equipped tag only shows on the currently-active avatar
    const equippedTag = isEquipped
      ? `<span class="av-card-equipped-tag">Equipped</span>`
      : '';

    return `
      <div class="${classes}"
           role="option"
           aria-selected="${isEquipped}"
           data-idx="${idx}"
           tabindex="0"
           aria-label="${av.name}${isEquipped ? ' (currently equipped)' : ''}">
        <span class="av-card-emoji">${av.emoji}</span>
        <span class="av-card-name">${av.name}</span>
        ${equippedTag}
      </div>
    `;
  }).join('');
}

// ── Handle avatar card selection ──────────────────────────────────────────────
function selectAvatar(idx) {
  pendingIdx = idx;

  // Update all card states
  grid.querySelectorAll('.av-card').forEach(card => {
    const cardIdx = parseInt(card.dataset.idx, 10);
    card.classList.toggle('selected', cardIdx === idx);
    card.setAttribute('aria-selected', cardIdx === idx ? 'true' : 'false');

    // Preserve the "equipped" visual on the currently-active avatar
    if (cardIdx === currentIdx) {
      card.classList.add('equipped');
    } else {
      card.classList.remove('equipped');
    }
  });

  // Update the big hero preview
  updateHeroPreview(idx);

  // Enable the confirm button only if the selection differs from current
  confirmBtn.disabled = (idx === currentIdx);
}

// ── Equip button handler ──────────────────────────────────────────────────────
function equipAvatar() {
  if (pendingIdx === null || pendingIdx === currentIdx) return;

  // Persist the choice
  Storage.setSessionAvatar(pendingIdx);

  // Visual feedback on the button
  confirmBtn.textContent = '✓ Equipped!';
  confirmBtn.classList.add('success');
  confirmBtn.disabled = true;

  // Update the topbar avatar immediately
  topbarAvatar.textContent = avatarEmoji(pendingIdx);

  // Update the equipped badge and mark the new card as equipped
  updateEquippedBadge(pendingIdx);

  // Mark the newly-equipped card
  grid.querySelectorAll('.av-card').forEach(card => {
    const cardIdx = parseInt(card.dataset.idx, 10);

    // Remove all equipped tags first
    const existingTag = card.querySelector('.av-card-equipped-tag');
    if (existingTag) existingTag.remove();

    if (cardIdx === pendingIdx) {
      card.classList.add('equipped');
      // Insert the "Equipped" tag after the name
      const nameEl = card.querySelector('.av-card-name');
      if (nameEl) {
        const tag = document.createElement('span');
        tag.className = 'av-card-equipped-tag';
        tag.textContent = 'Equipped';
        nameEl.after(tag);
      }
    } else {
      card.classList.remove('equipped');
    }
  });

  // After a short delay, reset the button so another change can be made
  setTimeout(() => {
    confirmBtn.textContent = '✓ Equip This Avatar';
    confirmBtn.classList.remove('success');
    // Re-enable only if a different unequipped avatar is selected
    confirmBtn.disabled = true;
  }, 1800);
}

// ── Event listeners ───────────────────────────────────────────────────────────

// Grid uses event delegation: one listener handles all card clicks/keypresses.
grid.addEventListener('click', e => {
  const card = e.target.closest('.av-card');
  if (!card) return;
  selectAvatar(parseInt(card.dataset.idx, 10));
});

// Keyboard accessibility — Enter/Space to select a card
grid.addEventListener('keydown', e => {
  if (e.key === 'Enter' || e.key === ' ') {
    const card = e.target.closest('.av-card');
    if (!card) return;
    e.preventDefault();
    selectAvatar(parseInt(card.dataset.idx, 10));
  }
});

confirmBtn.addEventListener('click', equipAvatar);

// ── Initial render ────────────────────────────────────────────────────────────
buildGrid();
updateEquippedBadge(currentIdx);
updateHeroPreview(currentIdx ?? null);

// If player has an avatar, show it big in the hero; otherwise show prompt
if (currentIdx === null) {
  heroPreview.textContent = '👤';
  heroName.textContent    = 'Choose Your Explorer!';
}
