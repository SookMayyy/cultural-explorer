// js/login.js — login page interactions

import Storage from './utils/storage.js';

const AVATARS = [
  '🦁','🐘','🦧','🦜','🐯','🦊','🦎','🦀','🐊','🦋',
  '🦚','🦃','🦤','🦞','🦅','🦩','🐢','🐬','🦈','🦦',
];

let selectedAvatar = 0;

// Pre-fill avatar grid
const grid = document.getElementById('avatar-grid');
if (grid) {
  grid.innerHTML = AVATARS.map((a, i) => `
    <button class="avatar-item ${i === 0 ? 'selected' : ''}" data-avatar="${i}" aria-label="${a}">
      ${a}
    </button>
  `).join('');

  grid.querySelectorAll('.avatar-item').forEach(btn => {
    btn.addEventListener('click', () => {
      grid.querySelectorAll('.avatar-item').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedAvatar = parseInt(btn.dataset.avatar);
      const nameAvatar = document.getElementById('name-avatar');
      if (nameAvatar) nameAvatar.textContent = AVATARS[selectedAvatar];
    });
  });
}

// Check URL for pre-set mode (e.g. login.html?mode=teacher)
const mode = new URLSearchParams(window.location.search).get('mode');
if (mode === 'teacher') showView('view-teacher');

// ── View switching ──────────────────────────────────────────────────────────
function showView(id) {
  document.querySelectorAll('.login-body').forEach(v => v.classList.add('hidden'));
  document.getElementById(id)?.classList.remove('hidden');
}

function showStep(id) {
  document.querySelectorAll('.login-step').forEach(s => s.classList.add('hidden'));
  document.getElementById(id)?.classList.remove('hidden');
}

// Path card buttons
document.getElementById('btn-moe')?.addEventListener('click', () => showView('view-moe'));
document.getElementById('btn-class')?.addEventListener('click', () => showView('view-class'));
document.getElementById('btn-teacher-link')?.addEventListener('click', () => showView('view-teacher'));

document.getElementById('btn-guest')?.addEventListener('click', () => {
  const name = 'Explorer' + Math.floor(Math.random() * 1000);
  Storage.setGuest(name, 0);
  window.location.href = 'map.html';
});

// Back buttons (data-back attribute = target view id)
document.querySelectorAll('.login-back-btn[data-back]').forEach(btn => {
  btn.addEventListener('click', () => showView(btn.dataset.back));
});

// ── MOE / Student ID form ────────────────────────────────────────────────────
document.getElementById('btn-moe-submit')?.addEventListener('click', () => {
  const ic   = document.getElementById('moe-ic')?.value.trim();
  const name = document.getElementById('moe-name')?.value.trim();
  const err  = document.getElementById('moe-error');

  if (!ic || ic.length !== 12 || !/^\d+$/.test(ic)) {
    err.textContent = 'Please enter a valid 12-digit IC number.';
    err.classList.remove('hidden');
    return;
  }
  if (!name) {
    err.textContent = 'Please enter your name.';
    err.classList.remove('hidden');
    return;
  }

  Storage.setSession({ type: 'moe', displayName: name, avatarId: 0, icNumber: ic, points: 0 });
  window.location.href = 'map.html';
});

// ── Class PIN — digit auto-advance ───────────────────────────────────────────
const pinDigits = document.querySelectorAll('.pin-digit');
pinDigits.forEach((input, i) => {
  input.addEventListener('input', () => {
    input.value = input.value.replace(/\D/, '');
    if (input.value && i < pinDigits.length - 1) pinDigits[i + 1].focus();
  });
  input.addEventListener('keydown', e => {
    if (e.key === 'Backspace' && !input.value && i > 0) pinDigits[i - 1].focus();
  });
});

document.getElementById('btn-pin-next')?.addEventListener('click', () => {
  const pin = [...pinDigits].map(d => d.value).join('');
  const err = document.getElementById('pin-error');
  if (pin.length !== 6) {
    err.textContent = 'Please enter the full 6-digit PIN.';
    err.classList.remove('hidden');
    return;
  }
  err.classList.add('hidden');
  showStep('step-avatar');
});

document.getElementById('btn-avatar-next')?.addEventListener('click', () => {
  showStep('step-name');
});

// Live name preview
document.getElementById('class-name')?.addEventListener('input', e => {
  const label = document.getElementById('name-label');
  if (label) label.textContent = e.target.value || 'Explorer';
});

document.getElementById('btn-name-submit')?.addEventListener('click', () => {
  const name = document.getElementById('class-name')?.value.trim();
  if (!name) { document.getElementById('class-name')?.focus(); return; }
  Storage.setSession({ type: 'class', displayName: name, avatarId: selectedAvatar, points: 0 });
  window.location.href = 'map.html';
});

// ── Teacher form ──────────────────────────────────────────────────────────────
document.getElementById('btn-teacher-submit')?.addEventListener('click', () => {
  const email = document.getElementById('teacher-email')?.value.trim();
  const pass  = document.getElementById('teacher-pass')?.value;
  const err   = document.getElementById('teacher-error');

  if (!email || !pass) {
    err.textContent = 'Please enter your email and password.';
    err.classList.remove('hidden');
    return;
  }
  // Demo: accept any credentials, navigate to teacher dashboard
  Storage.setSession({ type: 'teacher', displayName: email, avatarId: null, points: 0 });
  window.location.href = 'teacher.html';
});
