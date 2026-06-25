// js/utils/avatarDisplay.js — shared avatar renderer.
//
// Returns markup for the player's base animal avatar with their equipped
// costume layered on top, so the costume the player buys in the Avatar Shop
// follows them across every screen (topbar, dashboard, activity, …).
// The overlay is sized in `em`, so it scales with the parent font-size.

import Storage from './storage.js';
import { avatarEmoji } from '../data/avatars.js';
import { getCostume } from '../data/costumes.js';

// HTML string for the stacked avatar. Use with innerHTML.
export function avatarStackHTML(avatarId) {
  const base    = avatarEmoji(avatarId);
  const costume = getCostume(Storage.getEquippedCostume());
  const overlay = costume
    ? `<span class="avatar-stack-costume">${costume.emoji}</span>`
    : '';
  return `<span class="avatar-stack"><span class="avatar-stack-base">${base}</span>${overlay}</span>`;
}
