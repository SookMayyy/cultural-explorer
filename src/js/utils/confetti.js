/* confetti.js — the shared "you won!" confetti burst */

// Plain divs using the global .confetti-piece class + @keyframes confetti-fall
// (css/style.css). The reduced-motion check lives inside, so callers can fire
// this unconditionally.
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
