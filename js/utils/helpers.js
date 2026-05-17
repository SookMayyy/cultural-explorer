// js/utils/helpers.js
// Shared utility functions

const Helpers = (() => {

  /** Render HTML string into a container element */
  function render(selector, html) {
    const el = typeof selector === 'string'
      ? document.querySelector(selector)
      : selector;
    if (el) el.innerHTML = html;
    return el;
  }

  /** Delegate event on a parent */
  function on(parent, event, selector, handler) {
    (typeof parent === 'string' ? document.querySelector(parent) : parent)
      ?.addEventListener(event, e => {
        const target = e.target.closest(selector);
        if (target) handler(e, target);
      });
  }

  /** Shuffle an array (Fisher-Yates) */
  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  /** Get state data by id */
  function getState(id) {
    return STATES_DATA.find(s => s.id === id) || null;
  }

  /** Number of states the player can currently access */
  function unlockedUpTo() {
    for (let i = 0; i < STATES_DATA.length; i++) {
      if (!Storage.hasEarned(STATES_DATA[i].id)) return i;
    }
    return STATES_DATA.length - 1;
  }

  /** Animate element briefly */
  function pop(el) {
    el.classList.remove('anim-pop-in');
    void el.offsetWidth;
    el.classList.add('anim-pop-in');
  }

  /** Simple confetti burst */
  function confetti(container, count = 18) {
    const colors = ['#F0B429','#C0392B','#27AE60','#1A5276','#8E44AD'];
    for (let i = 0; i < count; i++) {
      const dot = document.createElement('div');
      dot.style.cssText = `
        position:absolute; width:8px; height:8px; border-radius:50%;
        background:${colors[i % colors.length]};
        left:${30 + Math.random() * 40}%; top:20%;
        animation: confettiDrop ${0.8 + Math.random() * 0.8}s ease forwards;
        animation-delay:${Math.random() * 0.3}s;
        pointer-events:none; z-index:999;
      `;
      container.appendChild(dot);
      setTimeout(() => dot.remove(), 1800);
    }
  }

  return { render, on, shuffle, getState, unlockedUpTo, pop, confetti };
})();