// js/login.js — standalone Log In screen (grade-based + teacher).
//
// Posts to the same backend routes the home modal uses:
//   POST /api/auth/login          (student: display_name + grade_group + password)
//   POST /api/auth/teacher-login  (teacher: email + password)
// A successful login sets an httpOnly session cookie server-side; we mirror a
// lightweight session into localStorage so the rest of the MPA (which gates on
// Storage.getSession()) keeps working. Sign Up lives on signup.html; password
// recovery on recover.html.

import Storage from './utils/storage.js';
import { showError as popup } from './components/popup.js';
import { hydrateFromBackend } from './utils/sync.js';

let loginGrade = null;   // selected grade group on the student login form

// ── DOM ────────────────────────────────────────────────────────────────────
const viewStudent = document.getElementById('view-student');
const viewTeacher = document.getElementById('view-teacher');

const nameInput   = document.getElementById('login-name');
const gradeWrap   = document.getElementById('login-grade');
const pwInput     = document.getElementById('login-password');
const loginError  = document.getElementById('login-error');
const formLogin   = document.getElementById('form-login');

const teacherEmail = document.getElementById('teacher-email');
const teacherPass  = document.getElementById('teacher-pass');
const teacherError = document.getElementById('teacher-error');
const formTeacher  = document.getElementById('form-teacher');

// ── Helpers ──────────────────────────────────────────────────────────────────
// Errors are shown as a friendly popup (the inline element is kept hidden for
// backward compatibility / screen readers).
function showError(_el, msg) { popup(msg); }
function clearError(el)      { el?.classList.add('hidden'); }

function enterGame() { window.location.href = 'map.html'; }

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

    // Preserve a previously-picked avatar/points if this browser has one.
    const prev = Storage.getSession();
    Storage.setSession({
      type:        'registered',
      displayName: name,
      grade_group: loginGrade,
      avatarId:    prev?.avatarId ?? 0,
      points:      prev?.points   ?? 0,
    });

    // Pull this account's saved progress (stamps/completed states/points) from
    // the backend so it restores even on a new device. Best-effort.
    await hydrateFromBackend();
    enterGame();
  } catch {
    showError(loginError, '❌ Could not reach the server. Is it running (npm start)?');
  }
});

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

// ── Teacher view toggle ──────────────────────────────────────────────────────
document.getElementById('link-teacher')?.addEventListener('click', () => {
  viewStudent.classList.add('hidden');
  viewTeacher.classList.remove('hidden');
});
document.getElementById('link-back-student')?.addEventListener('click', () => {
  viewTeacher.classList.add('hidden');
  viewStudent.classList.remove('hidden');
});

// Deep-link: login.html?mode=teacher opens the teacher form directly.
if (new URLSearchParams(location.search).get('mode') === 'teacher') {
  viewStudent.classList.add('hidden');
  viewTeacher.classList.remove('hidden');
}

// ── Teacher login ────────────────────────────────────────────────────────────
formTeacher.addEventListener('submit', async e => {
  e.preventDefault();
  clearError(teacherError);

  const email = teacherEmail.value.trim();
  const pass  = teacherPass.value;

  if (!email || !pass) return showError(teacherError, '❌ Please enter your email and password.');

  try {
    const res = await fetch('/api/auth/teacher-login', {
      method:      'POST',
      headers:     { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password: pass }),
    });
    const data = await res.json().catch(() => ({}));

    if (!res.ok || !data.ok) {
      return showError(teacherError, '❌ ' + (data.error || 'Email or password is incorrect.'));
    }

    Storage.setSession({ type: 'teacher', displayName: email, avatarId: null, points: 0 });
    window.location.href = 'teacher.html';
  } catch {
    showError(teacherError, '❌ Could not reach the server. Is it running (npm start)?');
  }
});
