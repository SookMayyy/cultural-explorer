// js/home.js — home/splash screen interactions

import Storage from './utils/storage.js';

// If already logged in, skip to map
const session = Storage.getSession();
if (session) window.location.href = ' map.html';

// Guest button
document.getElementById('btn-guest')?.addEventListener('click', () => {
  const name = 'Explorer' + Math.floor(Math.random() * 1000);
  Storage.setGuest(name, 0);
  window.location.href = 'map.html';
});
