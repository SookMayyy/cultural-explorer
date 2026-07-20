// js/utils/confetti.js — the shared "you won!" confetti burst.
// ─────────────────────────────────────────────────────────────────────────────
// Drops a shower of paper flakes from the top of the viewport. This lived inline
// in reward.js until a second screen (Cultural Tic-Tac-Toe) needed the same
// celebration — same colours, same count, same timing, one implementation.
//
//   import { burstConfetti } from './utils/confetti.js';
//   burstConfetti();                    // 50 pieces, the flag palette
//   burstConfetti({ count: 30 });       // a smaller flurry
//
// The pieces are plain divs using the GLOBAL `.confetti-piece` class and
// `@keyframes confetti-fall` from css/style.css — no stylesheet needed here.
//
// A child who has asked their device to reduce motion still gets the win, just
// without the busy falling decoration, so the check lives inside: callers can
// fire this unconditionally.

const COLORS = ['#C0392B', '#FCD116', '#1A3A5C', '#27AE60', '#E67E22', '#8E44AD'];

export function burstConfetti({ count = 50, colors = COLORS, lifetime = 4200 } = {}) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'confetti-piece';
    // Mix round "dot" confetti in with the classic square flakes for variety.
    const round = Math.random() > 0.5;
    p.style.cssText = `
      left:${Math.random() * 100}vw;top:-10px;
      background:${colors[Math.floor(Math.random() * colors.length)]};
      border-radius:${round ? '50%' : '2px'};
      animation-duration:${2 + Math.random() * 2}s;
      animation-delay:${Math.random()}s;
      transform:rotate(${Math.random() * 360}deg);
    `;
    document.body.appendChild(p);
    setTimeout(() => p.remove(), lifetime);
  }
}

export default burstConfetti;
