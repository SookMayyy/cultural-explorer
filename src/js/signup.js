// js/signup.js — standalone Create Account screen (grade-based).
//
// Flow:
//   1. Pick grade  → Grade 1–2 gets an auto-generated password (no field).
//   2. Enter name  (letters only, max 20 — matches backend validation).
//   3. Grade 3+    type a password (min 6); Grade 1–2 skip this.
//   4. Pick 2 secret icons IN ORDER → recovery key (icon_key_1 / icon_key_2).
//   5. POST /api/auth/register → on success, Grade 1–2 see their auto password,
//      then everyone picks an avatar and enters the game.
//
// Posts to the same backend route the home modal uses. A successful register
// sets an httpOnly session cookie; we mirror a lightweight session into
// localStorage so the rest of the MPA keeps working.

import Storage from './utils/storage.js';
import { AVATARS } from './data/avatars.js';
import { showError as popup } from './components/popup.js';

// The 12 secret icons — index+1 maps to icon_key values 1–12 stored at
// registration. Keep in sync with ICONS in home.js / recover.js.
const ICONS = ['🌺','🦋','⭐','🌙','🐘','🦜','🍃','🎈','🐠','🌈','🦁','🌻'];

let signupGrade   = null;   // selected grade group
const chosenIcons = [];     // up to 2 chosen icon ids (1–12), in tap order
let chosenAvatar  = null;   // numeric index into AVATARS

// ── DOM ────────────────────────────────────────────────────────────────────
const viewForm   = document.getElementById('view-form');
const viewDone   = document.getElementById('view-done');

const gradeWrap  = document.getElementById('signup-grade');
const nameInput  = document.getElementById('signup-name');
const pwLabel    = document.getElementById('signup-pw-label');
const pwInput    = document.getElementById('signup-password');
const pwAutoNote = document.getElementById('signup-pw-auto');
const iconGrid   = document.getElementById('signup-icons');
const countEl    = document.getElementById('signup-count');
const errorEl    = document.getElementById('signup-error');
const form       = document.getElementById('form-signup');

const autopwBox   = document.getElementById('autopw-box');
const autopwValue = document.getElementById('autopw-value');
const avatarGrid  = document.getElementById('signup-avatars');
const startBtn    = document.getElementById('btn-start');

// ── Helpers ──────────────────────────────────────────────────────────────────
// Errors surface as a friendly popup (inline element kept hidden as a fallback).
function showError(msg) { popup(msg); }
function clearError()   { errorEl?.classList.add('hidden'); }

// ── Grade selector ───────────────────────────────────────────────────────────
gradeWrap.querySelectorAll('.grade-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    gradeWrap.querySelectorAll('.grade-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    signupGrade = btn.dataset.grade;
    clearError();

    // Grade 1–2 gets an auto password — hide the password field, show the note.
    const isAuto = signupGrade === '1-2';
    pwLabel.classList.toggle('hidden', isAuto);
    pwInput.classList.toggle('hidden', isAuto);
    pwAutoNote.classList.toggle('hidden', !isAuto);
  });
});

// ── Icon picker — record up to 2 taps in order, with order badges ────────────
iconGrid.innerHTML = ICONS.map((ic, i) =>
  `<button type="button" class="icon-pick" data-icon="${i + 1}" aria-label="Secret icon ${i + 1}">${ic}</button>`
).join('');

function refreshIconBadges() {
  iconGrid.querySelectorAll('.icon-pick').forEach(btn => {
    const val = parseInt(btn.dataset.icon, 10);
    const order = chosenIcons.indexOf(val);
    btn.querySelector('.pick-order')?.remove();
    btn.classList.toggle('selected', order >= 0);
    if (order >= 0) {
      const badge = document.createElement('span');
      badge.className = 'pick-order';
      badge.textContent = order + 1;
      btn.appendChild(badge);
    }
  });
  countEl.textContent = chosenIcons.length;
}

iconGrid.querySelectorAll('.icon-pick').forEach(btn => {
  btn.addEventListener('click', () => {
    const val = parseInt(btn.dataset.icon, 10);
    const idx = chosenIcons.indexOf(val);
    if (idx >= 0) {
      chosenIcons.splice(idx, 1);
    } else if (chosenIcons.length < 2) {
      chosenIcons.push(val);
    }
    refreshIconBadges();
    clearError();
  });
});

// ── Submit registration ──────────────────────────────────────────────────────
form.addEventListener('submit', async e => {
  e.preventDefault();
  clearError();

  const name     = nameInput.value.trim();
  const password = pwInput.value;

  if (!signupGrade)                    return showError('❌ Please pick your grade.');
  if (!name)                           return showError('❌ Please enter your name.');
  if (!/^[a-zA-Z ]{1,20}$/.test(name)) return showError('❌ Name must be letters only (max 20).');
  if (signupGrade !== '1-2' && password.length < 6)
                                       return showError('❌ Password must be at least 6 characters.');
  if (chosenIcons.length !== 2)        return showError('❌ Pick exactly 2 secret icons (in order).');

  const body = {
    display_name: name,
    grade_group:  signupGrade,
    icon_key_1:   chosenIcons[0],
    icon_key_2:   chosenIcons[1],
  };
  if (signupGrade !== '1-2') body.password = password;

  const submitBtn = document.getElementById('btn-signup');
  submitBtn.disabled = true;

  try {
    const res = await fetch('/api/auth/register', {
      method:      'POST',
      headers:     { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));

    if (!res.ok || !data.ok) {
      submitBtn.disabled = false;
      return showError('❌ ' + (data.error || 'Registration failed. Try a different name.'));
    }

    // Session for the rest of the MPA (avatar chosen on the next step).
    Storage.setSession({ type: 'registered', displayName: name, grade_group: signupGrade, avatarId: null, points: 0 });

    // Grade 1–2: reveal the auto-generated password on the success step.
    if (data.auto_password) {
      autopwValue.textContent = data.auto_password;
      autopwBox.classList.remove('hidden');
    }

    // Swap to the success + avatar-pick step.
    viewForm.classList.add('hidden');
    viewDone.classList.add('show');

    // Cheer up the side mascot for the celebration moment.
    const sideImg    = document.getElementById('signup-mascot-img');
    const sideBubble = document.getElementById('signup-bubble');
    if (sideImg)    sideImg.src = '../assets/characters/rimau_cheer.png';
    if (sideBubble) sideBubble.textContent = 'Woohoo! You did it! Now pick your character! 🎉';
  } catch {
    submitBtn.disabled = false;
    showError('❌ Could not reach the server. Is it running (npm start)?');
  }
});

// ── Success step: avatar picker ──────────────────────────────────────────────
avatarGrid.innerHTML = AVATARS.map((a, i) =>
  `<button type="button" class="avatar-item" role="option" aria-selected="false"
           data-id="${i}" aria-label="${a.name}">${a.emoji}</button>`
).join('');

avatarGrid.querySelectorAll('.avatar-item').forEach(btn => {
  btn.addEventListener('click', () => {
    avatarGrid.querySelectorAll('.avatar-item').forEach(b => {
      b.classList.remove('selected');
      b.setAttribute('aria-selected', 'false');
    });
    btn.classList.add('selected');
    btn.setAttribute('aria-selected', 'true');
    chosenAvatar = parseInt(btn.dataset.id, 10);
    startBtn.disabled = false;
  });
});

startBtn.addEventListener('click', () => {
  if (chosenAvatar == null) return;
  Storage.setSessionAvatar(chosenAvatar);
  window.location.href = 'map.html';
});
