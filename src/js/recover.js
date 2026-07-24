/* recover.js — standalone Forgot Password page */

// Identify by name + grade, tap the 2 secret icons in order, then (Grade 4+) set
// a new password. Posts to POST /api/auth/recover.

import { showError as popup, showPopup } from './components/popup.js';
import { SECRET_ICONS as ICONS } from './data/secretIcons.js';

let recoverGrade = null;
const recoverIcons = [];   // up to 2 chosen icon ids (1–12), in tap order

const nameInput  = document.getElementById('recover-name');
const gradeWrap  = document.getElementById('recover-grade');
const iconGrid   = document.getElementById('recover-icons');
const countEl    = document.getElementById('recover-count');
const newpwInput = document.getElementById('recover-newpw');
const newpwLabel = document.getElementById('recover-newpw-label');
const errorEl    = document.getElementById('recover-error');
const successEl  = document.getElementById('recover-success');
const form       = document.getElementById('form-recover');

/* Helpers */
function showError(msg) {
  successEl.classList.add('hidden');
  popup(msg);
}
function clearError() { errorEl.classList.add('hidden'); }

/* Grade selector */
gradeWrap.querySelectorAll('.grade-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    gradeWrap.querySelectorAll('.grade-btn').forEach(b => {
      b.classList.remove('selected');
      b.setAttribute('aria-checked', 'false');
    });
    btn.classList.add('selected');
    btn.setAttribute('aria-checked', 'true');
    recoverGrade = btn.dataset.grade;
    clearError();
    // Grade 1–3 gets an auto-generated password — no field needed.
    const needsPw = recoverGrade !== '1-3';
    newpwInput.classList.toggle('hidden', !needsPw);
    newpwLabel.classList.toggle('hidden', !needsPw);
  });
});

/* Icon picker — record up to 2 taps in order */
iconGrid.innerHTML = ICONS.map((ic, i) =>
  `<button type="button" class="icon-pick" data-icon="${i + 1}" aria-label="Secret icon ${i + 1}">${ic}</button>`
).join('');

iconGrid.querySelectorAll('.icon-pick').forEach(btn => {
  btn.addEventListener('click', () => {
    const val = parseInt(btn.dataset.icon, 10);
    const idx = recoverIcons.indexOf(val);
    if (idx >= 0) {
      recoverIcons.splice(idx, 1);
      btn.classList.remove('selected');
    } else if (recoverIcons.length < 2) {
      recoverIcons.push(val);
      btn.classList.add('selected');
    }
    countEl.textContent = recoverIcons.length;
    clearError();
  });
});

/* Submit */
form.addEventListener('submit', async e => {
  e.preventDefault();
  clearError();
  successEl.classList.add('hidden');

  const name  = nameInput.value.trim();
  const newpw = newpwInput.value;

  if (!name)                     return showError('❌ Please enter your name.');
  if (!recoverGrade)             return showError('❌ Please choose your grade.');
  if (recoverIcons.length !== 2) return showError('❌ Tap your 2 secret icons (in order).');
  if (recoverGrade !== '1-3' && newpw.length < 6)
    return showError('❌ New password must be at least 6 characters.');

  const body = {
    display_name: name,
    grade_group:  recoverGrade,
    icon_key_1:   recoverIcons[0],
    icon_key_2:   recoverIcons[1],
  };
  if (recoverGrade !== '1-3') body.new_password = newpw;

  try {
    const res  = await fetch('/api/auth/recover', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return showError('❌ ' + (data.error || 'Recovery failed. Check your details.'));
    }

    // Require an explicit acknowledgement so the revealed password isn't missed.
    document.getElementById('recover-submit').disabled = true;

    if (data.revealed_password) {
      await showPopup({
        title: 'Success! 🎉',
        emoji: '🔑',
        message: `Your password is<br>
          <strong style="font-size:22px; letter-spacing:1px;">${data.revealed_password}</strong><br><br>
          Write it down — you'll use it to log in!`,
        actions: [{ label: "Got it!", value: true, style: 'primary' }],
      });
    } else {
      await showPopup({
        title: 'Password updated! ✅',
        emoji: '🔓',
        message: 'You can log in now with your new password.',
        actions: [{ label: 'Go to login', value: true, style: 'primary' }],
      });
    }
    window.location.href = 'login.html';
  } catch {
    showError('❌ Could not reach the server. Is it running (npm start)?');
  }
});
