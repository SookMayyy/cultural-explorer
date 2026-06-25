// js/data/costumes.js — culturally-themed costumes for the Avatar Shop.
//
// Mirrors the Figma "Avatar Shop" frame (273:280). Each costume layers a
// traditional outfit on top of the player's base animal avatar. The first
// costume (Baju Melayu) is free and equipped by default; the rest are
// unlocked by spending points earned through gameplay.

export const COSTUMES = [
  { id: 'baju-melayu',   emoji: '👔', name: 'Baju Melayu',   price: 0,   culture: 'Malay'   },
  { id: 'cheongsam',     emoji: '👗', name: 'Cheongsam',     price: 50,  culture: 'Chinese' },
  { id: 'kadazan-dress', emoji: '👘', name: 'Kadazan Dress', price: 100, culture: 'Kadazan' },
  { id: 'sari',          emoji: '🥻', name: 'Sari',          price: 100, culture: 'Indian'  },
  { id: 'iban-warrior',  emoji: '🪶', name: 'Iban Warrior',  price: 150, culture: 'Iban'    },
  { id: 'sarawak-dress', emoji: '🌺', name: 'Sarawak Dress', price: 150, culture: 'Sarawak' },
];

// The free costume every player starts with (always unlocked).
export const DEFAULT_COSTUME = 'baju-melayu';

// Safe lookup by id.
export function getCostume(id) {
  return COSTUMES.find(c => c.id === id) || null;
}
