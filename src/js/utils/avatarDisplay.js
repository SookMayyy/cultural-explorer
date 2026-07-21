/* avatarDisplay.js — shared avatar renderer */

import { avatarImg } from '../data/avatars.js';

// HTML for the player's base animal avatar (sized in em, so it scales with font-size).
export function avatarStackHTML(avatarId) {
  const base = avatarImg(avatarId);
  return `<span class="avatar-stack"><span class="avatar-stack-base">${base}</span></span>`;
}
