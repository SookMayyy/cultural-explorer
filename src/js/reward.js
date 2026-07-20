// js/reward.js — reward/celebration page (Figma "Stamp Earned" 273:382)

import Storage from './utils/storage.js';
import { requireAuth } from './ui.js';
import { STATES_DATA, getState, nextRecommended, stampImgFor } from './data/states.js';
import { pushStateComplete } from './utils/sync.js';
import Sound from './utils/sound.js';
import { burstConfetti } from './utils/confetti.js';

requireAuth();

// Read results from URL params (set by quiz.js)
const params      = new URLSearchParams(window.location.search);
const stateId     = params.get('state') || Storage.getCurrentState();
const score       = parseInt(params.get('score')  || '0', 10);
const total       = parseInt(params.get('total')  || '4', 10);
const earned      = parseInt(params.get('earned') || '0', 10);
// Stamps are earned ONLY by completing all four of a state's missions, so the
// stamp celebration here fires solely when we arrive from that mission flow
// (from=mission). A standalone quiz/guess reaching this page shows no stamp.
const stampEarned = params.get('stamp') === '1' && params.get('from') === 'mission';

const state = getState(stateId);
const pass  = score >= Math.ceil(total / 2);

// ── Accent bar colour ─────────────────────────────────────────────────────────
document.getElementById('reward-accent').style.background = state?.color || '#C0392B';

// ── Stamp / no-stamp branching ──────────────────────────────────────────────────
const headline = document.getElementById('reward-result-label');
const subline  = document.getElementById('reward-subline');

if (stampEarned && state) {
  // Make sure this state counts toward the "x/6" tally (idempotent).
  Storage.earnStamp(stateId);

  // Persist completion to the backend so the stamp survives across
  // devices/sessions (completion pays no points bonus — the four missions
  // already awarded 100). Best-effort (no-op for guests or when offline).
  pushStateComplete(stateId, score);

  // Juice: stamp "thunk" + sparkle on earning the stamp.
  Sound.stamp();

  headline.textContent = 'Amazing! 🎉';
  document.getElementById('stamp-state-name').textContent = state.name;
  document.getElementById('stamp-emoji').innerHTML  = state.emoji;
  document.getElementById('stamp-name').textContent = state.name;

  const stampEl = document.getElementById('reward-stamp');
  if (stampEl) stampEl.style.borderColor = state.color;

  // Try loading the state's real stamp illustration; fall back to emoji.
  const stampSrc = stampImgFor(stateId);
  if (stampSrc) {
    const img = new Image();
    img.onload = () => {
      if (stampEl) {
        stampEl.innerHTML = '';
        img.className = 'reward-stamp-img';
        img.alt = state.name + ' stamp';
        stampEl.appendChild(img);
      }
    };
    img.src = stampSrc;
  }
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

// ── Action buttons ──────────────────────────────────────────────────────────────
const continueBtn  = document.getElementById('reward-continue');
const secondaryBtn = document.querySelector('.reward-btn-secondary');

if (params.get('from') === 'mission') {
  // Arrived from finishing all 4 missions of a state. This IS the stamp-earned
  // moment, so the CTAs head back to the Map or into the state's Activity Hub
  // (replay games) rather than continuing the linear quiz journey.
  if (continueBtn) {
    continueBtn.textContent = '🗺️ Back to Map';
    continueBtn.href = 'map.html';
  }
  if (secondaryBtn) {
    secondaryBtn.textContent = '🎮 Activity Hub';
    secondaryBtn.href = `activities.html?state=${stateId}`;
  }
} else {
  // Linear journey: "Continue Exploring!" → next recommended state, else map.
  const next = nextRecommended(Storage.getProgress());
  if (next && continueBtn) {
    continueBtn.href = `narrative.html?state=${next.id}`;
    continueBtn.addEventListener('click', () => Storage.setCurrentState(next.id));
  } else if (continueBtn) {
    // Everything explored — celebrate and send back to the map.
    continueBtn.textContent = '🏆 All states explored! →';
    continueBtn.href = 'map.html';
  }
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

// A child who has asked their device to reduce motion still gets the win —
// just without the busy falling/bursting decoration.
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ── Falling confetti on a pass ──────────────────────────────────────────────────
// burstConfetti() does its own reduced-motion check, so this only gates on `pass`.
if (pass) burstConfetti();

// ── Sparkle burst radiating from the stamp on reveal ─────────────────────────────
// A quick ring of ✨ that pops outward right as the stamp lands — extra "juice"
// for the win moment now that the corner mascot no longer fills that space.
if (pass && !reduceMotion) {
  const stampContainer = document.getElementById('reward-stamp-container');
  if (stampContainer) {
    const SPARKLES = ['✨', '⭐', '🌟'];
    const COUNT = 10;
    for (let i = 0; i < COUNT; i++) {
      const s = document.createElement('span');
      s.className = 'reward-sparkle';
      s.textContent = SPARKLES[Math.floor(Math.random() * SPARKLES.length)];
      const angle = (i / COUNT) * 360;
      s.style.setProperty('--angle', `${angle}deg`);
      s.style.animationDelay = `${0.9 + Math.random() * 0.15}s`;
      stampContainer.appendChild(s);
      setTimeout(() => s.remove(), 1500);
    }
  }
}
