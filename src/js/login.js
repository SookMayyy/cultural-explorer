// js/login.js — standalone grade-based student Log In screen.
//
// Posts to the same backend route the home modal uses:
//   POST /api/auth/login   (student: display_name + grade_group + password)
// A successful login sets an httpOnly session cookie server-side; we mirror a
// lightweight session into localStorage so the rest of the MPA (which gates on
// Storage.getSession()) keeps working, then lands on the dashboard (home) page.
// Sign Up lives on signup.html; password recovery on recover.html.

import Storage from './utils/storage.js';
import { showError as popup } from './components/popup.js';
import { hydrateFromBackend } from './utils/sync.js';

let loginGrade = null;   // selected grade group on the student login form

// ── DOM ────────────────────────────────────────────────────────────────────
const nameInput   = document.getElementById('login-name');
const gradeWrap   = document.getElementById('login-grade');
const pwInput     = document.getElementById('login-password');
const loginError  = document.getElementById('login-error');
const formLogin   = document.getElementById('form-login');

// ── Helpers ──────────────────────────────────────────────────────────────────
// Errors are shown as a friendly popup (the inline element is kept hidden for
// backward compatibility / screen readers).
function showError(_el, msg) { popup(msg); }
function clearError(el)      { el?.classList.add('hidden'); }

function enterGame() { window.location.href = 'dashboard.html'; }

// ── Grade selector ───────────────────────────────────────────────────────────
gradeWrap.querySelectorAll('.grade-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    gradeWrap.querySelectorAll('.grade-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    loginGrade = btn.dataset.grade;
    clearError(loginError);
  });
});

// ── Student login ────────────────────────────────────────────────────────────
formLogin.addEventListener('submit', async e => {
  e.preventDefault();
  clearError(loginError);

  const name     = nameInput.value.trim();
  const password = pwInput.value;

  if (!name)       return showError(loginError, '❌ Please enter your name.');
  if (!loginGrade) return showError(loginError, '❌ Please choose your grade.');
  if (!password)   return showError(loginError, '❌ Please enter your password.');

  try {
    const res = await fetch('/api/auth/login', {
      method:      'POST',
      headers:     { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ display_name: name, grade_group: loginGrade, password }),
    });
    const data = await res.json().catch(() => ({}));

    if (!res.ok || !data.ok) {
      return showError(loginError, '❌ ' + (data.error || 'Login failed. Try again.'));
    }

    // Establish the session first so per-account storage resolves to this
    // account's namespace (display name + grade).
    const prev = Storage.getSession();
    Storage.setSession({
      type:        'registered',
      displayName: name,
      grade_group: loginGrade,
      avatarId:    0,
      points:      prev?.points ?? 0,
    });

    // Pull this account's saved progress (stamps/completed states/points) from
    // the backend so it restores even on a new device. Best-effort.
    await hydrateFromBackend();

    // Restore the avatar this account last equipped. It is saved per-account, so
    // it survives logout (which wipes the global session) — without this the
    // avatar would reset to Lion (index 0) on every login.
    const savedAvatar = Storage.getCurrentAvatar();
    if (savedAvatar != null) {
      const s = Storage.getSession();
      s.avatarId = savedAvatar;
      Storage.setSession(s);
    }
    enterGame();
  } catch {
    showError(loginError, '❌ Could not reach the server. Is it running (npm start)?');
  }
});

// ── Show/hide password (image icon toggle) ───────────────────────────────────
const PW_ICON_SHOW = '../assets/images/ui/show_password.png';
const PW_ICON_HIDE = '../assets/images/ui/hide_password.png';
function wirePwToggle(btnId, inputId) {
  const btn   = document.getElementById(btnId);
  const input = document.getElementById(inputId);
  const icon  = btn?.querySelector('.auth-pw-icon');
  if (!btn || !input || !icon) return;
  btn.addEventListener('click', () => {
    const reveal = input.type === 'password';   // true = about to reveal the password
    input.type = reveal ? 'text' : 'password';
    icon.src = reveal ? PW_ICON_HIDE : PW_ICON_SHOW;
    btn.setAttribute('aria-label', reveal ? 'Hide password' : 'Show password');
    btn.setAttribute('aria-pressed', String(reveal));
    input.focus();
  });
}
wirePwToggle('toggle-login-pw', 'login-password');

// ── Forgot password → standalone recover screen ──────────────────────────────
document.getElementById('link-forgot')?.addEventListener('click', () => {
  window.location.href = 'recover.html';
});

// ── Guest mode ───────────────────────────────────────────────────────────────
document.getElementById('btn-guest')?.addEventListener('click', () => {
  const guestName = 'Explorer' + Math.floor(Math.random() * 9000 + 1000);
  Storage.setGuest(guestName, 0);
  enterGame();
});

