// js/settings.js — My Profile page interactions

import Storage from './utils/storage.js';

// ── Log out ───────────────────────────────────────────────────────
// Ends the server session (express-session) and clears the local
// localStorage session, then returns to the home screen. We clear and
// redirect even if the API call fails (e.g. guest play or server down).
const logoutBtn = document.getElementById('btn-logout');
logoutBtn?.addEventListener('click', async () => {
  logoutBtn.disabled = true;
  try {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
  } catch {
    /* offline / guest — fall through and clear locally */
  }
  Storage.clearSession();
  window.location.href = 'home.html';
});
