// js/data/avatars.js — single source of truth for selectable avatars.
//
// Avatars are stored in the session as a NUMERIC INDEX into this array
// (session.avatarId). Every screen imports this list and looks up by index,
// so the avatar a student picks shows consistently on the home modal,
// the topbar, and the dashboard.

export const AVATARS = [
  { emoji: '🦁', name: 'Lion'     },
  { emoji: '🐘', name: 'Elephant' },
  { emoji: '🦧', name: 'Orangutan'},
  { emoji: '🦜', name: 'Parrot'   },
  { emoji: '🐯', name: 'Tiger'    },
  { emoji: '🦊', name: 'Fox'      },
  { emoji: '🦎', name: 'Lizard'   },
  { emoji: '🦀', name: 'Crab'     },
  { emoji: '🐊', name: 'Croc'     },
  { emoji: '🦋', name: 'Butterfly'},
  { emoji: '🦚', name: 'Peacock'  },
  { emoji: '🐢', name: 'Turtle'   },
  { emoji: '🐬', name: 'Dolphin'  },
  { emoji: '🦦', name: 'Otter'    },
  { emoji: '🦉', name: 'Owl'      },
  { emoji: '🐼', name: 'Panda'    },
];

// Safe lookup — always returns a usable emoji even for a bad/missing index.
export function avatarEmoji(index) {
  const a = AVATARS[Number(index)];
  return a ? a.emoji : '👤';
}
