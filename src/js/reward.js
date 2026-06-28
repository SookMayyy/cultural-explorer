// js/reward.js — reward/celebration page (Figma "Stamp Earned" 273:382)

import Storage from './utils/storage.js';
import { requireAuth } from './ui.js';
import { STATES_DATA, getState, nextRecommended } from './data/states.js';
import { pushStateComplete } from './utils/sync.js';
import Sound from './utils/sound.js';

requireAuth();

// Read results from URL params (set by quiz.js)
const params      = new URLSearchParams(window.location.search);
const stateId     = params.get('state') || Storage.getCurrentState();
const score       = parseInt(params.get('score')  || '0', 10);
const total       = parseInt(params.get('total')  || '4', 10);
const earned      = parseInt(params.get('earned') || '0', 10);
const stampEarned = params.get('stamp') === '1';

const state = getState(stateId);
const pass  = score >= Math.ceil(total / 2);

// ── Accent bar colour ─────────────────────────────────────────────────────────
document.getElementById('reward-accent').style.background = state?.color || '#C0392B';

// ── Stamp / no-stamp branching ──────────────────────────────────────────────────
const headline = document.getElementById('reward-result-label');
const subline  = document.getElementById('reward-subline');

if (stampEarned && state) {
  // Make sure this state counts toward the "x/7" tally (idempotent).
  Storage.earnStamp(stateId);

  // Persist completion to the backend so the stamp + bonus survive across
  // devices/sessions. Best-effort (no-op for guests or when offline).
  pushStateComplete(stateId, score);

  // Juice: stamp "thunk" + sparkle on earning the stamp.
  Sound.stamp();

  headline.textContent = 'Amazing! 🎉';
  document.getElementById('stamp-state-name').textContent = state.name;
  document.getElementById('stamp-emoji').innerHTML  = state.emoji;
  document.getElementById('stamp-name').textContent = state.name;

  const stampEl = document.getElementById('reward-stamp');
  if (stampEl) stampEl.style.borderColor = state.color;

  // Try loading the real stamp illustration; fall back to emoji.
  // 📸 IMAGE NEEDED: assets/images/stamps/{stateId}.png
  const img = new Image();
  img.onload = () => {
    if (stampEl) {
      stampEl.innerHTML = '';
      img.className = 'reward-stamp-img';
      img.alt = state.name + ' stamp';
      stampEl.appendChild(img);
    }
  };
  img.src = `assets/images/stamps/${stateId}.png`;
} else {
  // No stamp this round — show the encouraging variant.
  headline.textContent = 'Good try! 😊';
  subline.classList.add('hidden');
  document.getElementById('reward-stamp-container').classList.add('hidden');

  const noStamp = document.getElementById('reward-no-stamp');
  noStamp.classList.remove('hidden');
  document.getElementById('no-stamp-msg').textContent =
    `You got ${score}/${total} — keep practising!`;
}

// ── Dual-stat card: points earned + stamps collected ────────────────────────────
const totalStates = STATES_DATA.length;
document.getElementById('reward-pts-earned').textContent   = `+${earned}`;
document.getElementById('reward-stamp-count').textContent  = `${Storage.stampCount()}/${totalStates}`;
document.getElementById('reward-stamp-count-label').textContent =
  Storage.stampCount() === 1 ? 'Stamp collected' : 'Stamps collected';

// ── "Continue Exploring!" → next recommended state, else back to map ─────────────
const next       = nextRecommended(Storage.getProgress());
const continueBtn = document.getElementById('reward-continue');
if (next && continueBtn) {
  continueBtn.href = `narrative.html?state=${next.id}`;
  continueBtn.addEventListener('click', () => Storage.setCurrentState(next.id));
} else if (continueBtn) {
  // Everything explored — celebrate and send back to the map.
  continueBtn.textContent = '🏆 All states explored! →';
  continueBtn.href = 'map.html';
}

// ── Mascot celebrate animation ──────────────────────────────────────────────────
const mascot = document.getElementById('reward-mascot');
if (mascot) {
  mascot.style.animation =
    'mascot-celebrate 0.8s ease 0.4s both, mascot-float 3s 1.2s ease-in-out infinite';
}

// ── Stars / confetti dots ───────────────────────────────────────────────────────
const starsEl = document.getElementById('reward-stars');
if (starsEl) {
  for (let i = 0; i < 20; i++) {
    const star = document.createElement('div');
    star.className = 'reward-star';
    star.textContent = '★';
    star.style.cssText = `
      left:${Math.random() * 100}%;top:${Math.random() * 70}%;
      animation-delay:${Math.random() * 2}s;
      font-size:${12 + Math.random() * 16}px;
      opacity:${0.4 + Math.random() * 0.6};
    `;
    starsEl.appendChild(star);
  }
}

// ── Falling confetti on a pass ──────────────────────────────────────────────────
if (pass) {
  const COLORS = ['#C0392B', '#FCD116', '#1A3A5C', '#27AE60', '#E67E22', '#8E44AD'];
  for (let i = 0; i < 40; i++) {
    const p = document.createElement('div');
    p.className = 'confetti-piece';
    p.style.cssText = `
      left:${Math.random() * 100}vw;top:-10px;
      background:${COLORS[Math.floor(Math.random() * COLORS.length)]};
      animation-duration:${2 + Math.random() * 2}s;
      animation-delay:${Math.random()}s;
      transform:rotate(${Math.random() * 360}deg);
    `;
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 4200);
  }
}
