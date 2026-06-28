// js/data/costumes.js — culturally-themed costumes for the Avatar Shop.
//
// This catalogue mirrors the BACKEND costume table (the tested source of truth,
// see routes/progress.js + tests/fr6-costumes.test.js). `backendId` maps each
// costume to its numeric id in the DB so the Avatar Shop can unlock/equip via
// the API and persist across devices. `id` is the local string key used by
// Storage + the avatar overlay.
//
// `img` is the named art file to drop in (assets/costumes/<id>.png); until it
// exists the `emoji` is shown as a fallback (see js/utils/assetImg.js).
export const COSTUMES = [
  { id: 'school-uniform', backendId: 1, emoji: '🎒', name: 'School Uniform',        price: 0,  culture: 'Malaysian School',   img: '../assets/costumes/school-uniform.png' },
  { id: 'baju-melayu',    backendId: 2, emoji: '👔', name: 'Baju Melayu',           price: 50, culture: 'Malay Traditional',  img: '../assets/costumes/baju-melayu.png'    },
  { id: 'cheongsam',      backendId: 3, emoji: '👗', name: 'Cheongsam',             price: 50, culture: 'Chinese Traditional',img: '../assets/costumes/cheongsam.png'      },
  { id: 'saree',          backendId: 4, emoji: '🥻', name: 'Saree',                 price: 50, culture: 'Indian Traditional', img: '../assets/costumes/saree.png'          },
  { id: 'kadazan',        backendId: 5, emoji: '👘', name: 'Kadazan-Dusun Attire',  price: 80, culture: 'Sabah East Malaysian', img: '../assets/costumes/kadazan.png'      },
  { id: 'iban',           backendId: 6, emoji: '🪶', name: 'Iban Warrior',          price: 80, culture: 'Sarawak Iban',       img: '../assets/costumes/iban.png'           },
];

// The free costume every player starts with (always unlocked + equipped).
export const DEFAULT_COSTUME = 'school-uniform';

// Safe lookups.
export function getCostume(id) {
  return COSTUMES.find(c => c.id === id) || null;
}
export function getCostumeByBackendId(backendId) {
  return COSTUMES.find(c => c.backendId === Number(backendId)) || null;
}
