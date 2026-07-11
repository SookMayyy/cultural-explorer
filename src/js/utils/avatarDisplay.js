// js/utils/avatarDisplay.js — shared avatar renderer.
//
// Returns markup for the player's base animal avatar. (Costumes/clothing were
// removed — the avatar is just the chosen animal everywhere it appears: topbar,
// dashboard, settings, activity, …) The slot is sized in `em`, so it scales
// with the parent font-size.

import { avatarImg } from '../data/avatars.js';

// HTML string for the avatar. Use with innerHTML.
export function avatarStackHTML(avatarId) {
  const base = avatarImg(avatarId);
  return `<span class="avatar-stack"><span class="avatar-stack-base">${base}</span></span>`;
}
