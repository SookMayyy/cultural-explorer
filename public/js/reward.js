// js/reward.js — reward/celebration page

import Storage from './utils/storage.js';
import { requireAuth } from './ui.js';
import { getState, nextRecommended } from './data/states.js';

requireAuth();

// Read results from URL params (set by quiz.js)
const params    = new URLSearchParams(window.location.search);
const stateId   = params.get('state') || Storage.getCurrentState();
const score     = parseInt(params.get('score')  || '0');
const total     = parseInt(params.get('total')  || '4');
const earned    = parseInt(params.get('earned') || '0');
const stampEarned = params.get('stamp') === '1';

const state = getState(stateId);
const next  = nextRecommended(Storage.getProgress());

// ── Accent bar colour ─────────────────────────────────────────────────────────
document.getElementById('reward-accent').style.background = state?.color || '#C0392B';

// ── Result label ──────────────────────────────────────────────────────────────
const pass = score >= Math.ceil(total / 2);
document.getElementById('reward-result-label').textContent = pass ? '🎉 Excellent!' : '😊 Good try!';
document.getElementById('reward-score-num').textContent    = score;
document.getElementById('reward-score-denom').textContent  = `/${total}`;

// ── Stamp / no-stamp ──────────────────────────────────────────────────────────
if (stampEarned && state) {
  document.getElementById('stamp-emoji').innerHTML   = state.emoji;
  document.getElementById('stamp-name').textContent  = state.name;
  const stampEl = document.getElementById('reward-stamp');
  if (stampEl) stampEl.style.borderColor = state.color;

  // Try loading actual stamp image
  // 📸 IMAGE NEEDED: assets/images/stamps/{stateId}.png
  // Export from Figma → Stamps/{StateName} — round stamp design
  const img = new Image();
  img.onload = () => {
    const inner = document.getElementById('reward-stamp');
    if (inner) {
      inner.innerHTML = '';
      img.className = 'reward-stamp-img';
      img.alt = state.name + ' stamp';
      inner.appendChild(img);
    }
  };
  img.src = `assets/images/stamps/${stateId}.png`;
} else {
  document.getElementById('reward-stamp-container').classList.add('hidden');
  const noStamp = document.getElementById('reward-no-stamp');
  noStamp.classList.remove('hidden');
  document.getElementById('no-stamp-msg').textContent = `You got ${score}/${total} — keep practising!`;
}

// ── Points ────────────────────────────────────────────────────────────────────
const totalPts = Storage.getPoints();
document.getElementById('reward-pts-earned').textContent = `+${earned} ⭐`;
document.getElementById('reward-pts-total').textContent  = `Total: ${totalPts} pts`;

// ── Next recommendation ───────────────────────────────────────────────────────
const nextLink = document.getElementById('reward-next');
if (next && nextLink) {
  document.getElementById('reward-next-name').textContent = `${next.emoji} ${next.name}`;
  nextLink.href = `narrative.html?state=${next.id}`;
  nextLink.addEventListener('click', () => Storage.setCurrentState(next.id));
} else if (nextLink) {
  nextLink.innerHTML = '<span style="color:var(--clr-yellow)">🏆 All states explored!</span>';
  nextLink.style.pointerEvents = 'none';
}

// ── Mascot celebrate animation ────────────────────────────────────────────────
const mascot = document.getElementById('reward-mascot');
if (mascot) mascot.style.animation = 'mascot-celebrate 0.8s ease 0.4s both, mascot-float 3s 1.2s ease-in-out infinite';

// ── Stars ────────────────────────────────────────────────────────────────────
const starsEl = document.getElementById('reward-stars');
if (starsEl) {
  for (let i = 0; i < 20; i++) {
    const star = document.createElement('div');
    star.className = 'reward-star';
    star.textContent = '★';
    star.style.cssText = `
      left:${Math.random()*100}%;top:${Math.random()*60}%;
      animation-delay:${Math.random()*2}s;
      font-size:${12+Math.random()*16}px;
      opacity:${0.4+Math.random()*0.6};
    `;
    starsEl.appendChild(star);
  }
}

// ── Confetti ──────────────────────────────────────────────────────────────────
if (pass) {
  const COLORS = ['#C0392B','#FCD116','#1A3A5C','#27AE60','#E67E22','#8E44AD'];
  for (let i = 0; i < 40; i++) {
    const p = document.createElement('div');
    p.className = 'confetti-piece';
    p.style.cssText = `
      left:${Math.random()*100}vw;top:-10px;
      background:${COLORS[Math.floor(Math.random()*COLORS.length)]};
      animation-duration:${2+Math.random()*2}s;
      animation-delay:${Math.random()}s;
      transform:rotate(${Math.random()*360}deg);
    `;
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 4200);
  }
}
