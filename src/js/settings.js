// js/settings.js — My Profile page

import Storage from './utils/storage.js';
import { requireAuth, applyProfileColor } from './ui.js';
import { STATES_DATA } from './data/states.js';
import { avatarStackHTML } from './utils/avatarDisplay.js';
import { confirmPopup, showPopup } from './components/popup.js';
import { apiPost } from './utils/api.js';
import Sound from './utils/sound.js';
import Voice from './utils/voice.js';
import { stopMusic } from './utils/music.js';

const session = requireAuth();
if (!session) throw new Error('Not logged in');

applyProfileColor();   // theme topbar + profile avatar with the chosen colour

// ── Real profile data (was hardcoded in the mockup) ──────────────────────────
const completed = Storage.completedCount();
const total     = STATES_DATA.length;

function levelLabel(n) {
  if (n === 0) return '🌱 Beginner Explorer';
  if (n <= 2)  return '🗺️ Junior Explorer';
  if (n <= 4)  return '⭐ Cultural Explorer';
  if (n <= 6)  return '🏆 Expert Explorer';
  return '👑 Master Explorer — All States!';
}

const avatarHTML = avatarStackHTML(session.avatarId ?? 0);
document.getElementById('set-topbar-pts').textContent    = `⭐ ${Storage.getPoints()} pts`;
document.getElementById('set-topbar-avatar').innerHTML   = avatarHTML;
document.getElementById('set-avatar').innerHTML          = avatarHTML;
document.getElementById('set-name').textContent          = session.displayName || 'Explorer';
document.getElementById('set-level').textContent         = levelLabel(completed);
document.getElementById('set-stamps').textContent        = Storage.stampCount();
document.getElementById('set-quizzes').textContent       = completed;
document.getElementById('set-complete').textContent      = `${Math.round((completed / total) * 100)}%`;

// ── Sound on/off toggle ───────────────────────────────────────────────────────
const soundBtn = document.getElementById('btn-sound');
function renderSound() {
  const muted = Sound.isMuted();
  document.getElementById('sound-icon').textContent  = muted ? '🔇' : '🔊';
  document.getElementById('sound-label').textContent = muted ? 'Sound: Off' : 'Sound: On';
}
renderSound();
soundBtn?.addEventListener('click', () => {
  const nowMuted = !Sound.isMuted();
  Sound.setMuted(nowMuted);       // ce_sfx is the master switch: SFX, music, and
                                  // (via voice.isMuted) narration all follow it.
  if (nowMuted) {
    Voice.stop();                 // cut any narration mid-sentence
    stopMusic();                  // and silence any looping state music now
  }
  renderSound();
  if (!nowMuted) Sound.tap();   // little confirmation blip when turning on
});

// ── Game Guide — a friendly "how to play" popup ───────────────────────────────
// No separate page needed: a single showPopup keeps it consistent with the app's
// other dialogs. Short lines + emoji, Grade 3–6 reading level.
document.getElementById('btn-guide')?.addEventListener('click', () => {
  Sound.tap?.();
  showPopup({
    title: 'How to Play',
    emoji: '🎮',
    message: [
      '🗺️ Tap a state on the Map to start exploring.',
      '⭐ Finish its 4 missions — Cook, Word Scramble, Guess the Place, and the Festival Quiz.',
      '🏅 Complete all 4 to earn that state\'s stamp!',
      '🛍️ Spend your points in the Avatar Shop.',
      '🐯 Rimau will guide you. Have fun exploring Malaysia!',
    ].join('<br><br>'),
    actions: [{ label: 'Got it!', value: true, style: 'primary' }],
  });
});

// ── Student Safety — a short wellbeing / privacy reminder ──────────────────────
// Age-appropriate: screen-time, keeping login secret, asking an adult, kindness.
// No external links (per the project's content-safety rules).
document.getElementById('btn-safety')?.addEventListener('click', () => {
  Sound.tap?.();
  showPopup({
    title: 'Stay Safe',
    emoji: '🛡️',
    message: [
      '⏰ Take a break and rest your eyes after playing.',
      '🔒 Keep your password and secret icons private.',
      '🙋 Ask your teacher or parent if you need help.',
      '💛 Be kind, and enjoy learning — it is not about winning!',
    ].join('<br><br>'),
    actions: [{ label: 'Okay!', value: true, style: 'primary' }],
  });
});

// ── Log out ──────────────────────────────────────────────────────────────────
// Ends the server session (express-session) and clears the local session, then
// returns to the landing page. We clear + redirect even if the API call fails
// (e.g. guest play or server down). Per-account progress is kept under its
// namespace, so logging back in restores it.
const logoutBtn = document.getElementById('btn-logout');
logoutBtn?.addEventListener('click', async () => {
  const yes = await confirmPopup('Log out now? Your stamps and points are saved.', {
    title: 'Log out?', emoji: '🚪', confirmText: 'Log Out', cancelText: 'Stay',
  });
  if (!yes) return;

  logoutBtn.disabled = true;
  try {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
  } catch {
    /* offline / guest — fall through and clear locally */
  }
  Storage.clearSession();
  window.location.href = 'home.html';
});

// ── Reset progress (double-confirmed) ─────────────────────────────────────────
// Wipes this account's stamps, points and costumes — on the server (registered)
// and in the local cache — then returns to Home with a fresh slate.
const resetBtn = document.getElementById('btn-reset');
resetBtn?.addEventListener('click', async () => {
  const yes = await confirmPopup(
    'This erases your stamps, points and costumes. This cannot be undone.',
    { title: 'Reset progress?', emoji: '⚠️', confirmText: 'Reset everything', cancelText: 'Keep my progress' },
  );
  if (!yes) return;

  resetBtn.disabled = true;
  if (session.type === 'registered') {
    try { await apiPost('/api/progress/reset'); } catch { /* offline — clear locally anyway */ }
  }
  Storage.reset();
  await showPopup({ title: 'All set!', emoji: '✨', message: 'Your progress has been reset. Time for a fresh adventure!' });
  window.location.href = 'dashboard.html';
});
