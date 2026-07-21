/* costumes.js — culturally-themed costumes for the Avatar Shop */

// Mirrors the backend costume table. `backendId` maps to the DB id (unlock/equip
// via the API); `id` is the local string key; `img` falls back to `emoji`.
export const COSTUMES = [
  { id: 'school-uniform', backendId: 1, emoji: '🎒', name: 'School Uniform',        price: 0,  culture: 'Malaysian School',   img: '../assets/costumes/school-uniform.png' },
  { id: 'baju-melayu',    backendId: 2, emoji: '👔', name: 'Baju Melayu',           price: 50, culture: 'Malay Traditional',  img: '../assets/costumes/baju-melayu.png'    },
  { id: 'cheongsam',      backendId: 3, emoji: '👗', name: 'Cheongsam',             price: 50, culture: 'Chinese Traditional',img: '../assets/costumes/cheongsam.png'      },
  { id: 'saree',          backendId: 4, emoji: '🥻', name: 'Saree',                 price: 50, culture: 'Indian Traditional', img: '../assets/costumes/saree.png'          },
  { id: 'kadazan',        backendId: 5, emoji: '👘', name: 'Kadazan-Dusun Attire',  price: 80, culture: 'Sabah East Malaysian', img: '../assets/costumes/kadazan.png'      },
  { id: 'iban',           backendId: 6, emoji: '🪶', name: 'Iban Warrior',          price: 80, culture: 'Sarawak Iban',       img: '../assets/costumes/iban.png'           },
];
