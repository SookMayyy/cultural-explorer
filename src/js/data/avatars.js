/* avatars.js — single source of truth for selectable avatars */

// Stored in the session as a numeric index (session.avatarId). Each has an
// illustrated PNG with an emoji fallback; render with avatarImg().

import { assetImg } from '../utils/assetImg.js';

export const AVATARS = [
  { img: '../assets/characters/avatar_lion.png',   emoji: '🦁', name: 'Lion'   },
  { img: '../assets/characters/avatar_tiger.png',  emoji: '🐯', name: 'Tiger'  },
  { img: '../assets/characters/avatar_bear.png',   emoji: '🐻', name: 'Bear'   },
  { img: '../assets/characters/avatar_fox.png',    emoji: '🦊', name: 'Fox'    },
  { img: '../assets/characters/avatar_deer.png',   emoji: '🦌', name: 'Deer'   },
  { img: '../assets/characters/avatar_frog.png',   emoji: '🐸', name: 'Frog'   },
  { img: '../assets/characters/avatar_monkey.png', emoji: '🐵', name: 'Monkey' },
  { img: '../assets/characters/avatar_mouse.png',  emoji: '🐭', name: 'Mouse'  },
  { img: '../assets/characters/avatar_cat.png',    emoji: '🐱', name: 'Cat'    },
  { img: '../assets/characters/avatar_tapir.png',  emoji: '🐾', name: 'Tapir'  },
];

// HTML for the avatar's illustration with emoji fallback (use with innerHTML).
export function avatarImg(index, opts = {}) {
  const a = AVATARS[Number(index)] || AVATARS[0];
  return assetImg(a.img, a.emoji, { alt: a.name, ...opts });
}
