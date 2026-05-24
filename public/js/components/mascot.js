// js/components/mascot.js — Rimau / Wak mascot with speech bubble

import Typewriter from './typewriter.js';

const EMOJI = { rimau: '🦁', wak: '🦜' };

export default class Mascot {
  constructor(containerEl, mascotId = 'rimau') {
    this._el        = containerEl;
    this._id        = mascotId;
    this._emoji     = EMOJI[mascotId] || '🦁';
    this._tw        = null;
    this._figureEl  = null;
    this._textEl    = null;
  }

  // Render mascot + bubble into container; returns this for chaining
  render(bubbleText = '', { animate = true } = {}) {
    this._el.innerHTML = `
      <div class="mascot-container">
        <div class="mascot-bubble">
          <p class="mascot-bubble-text"></p>
        </div>
        <div class="mascot-figure ${animate ? '' : 'no-float'}">${this._emoji}</div>
      </div>
    `;
    this._figureEl = this._el.querySelector('.mascot-figure');
    this._textEl   = this._el.querySelector('.mascot-bubble-text');
    if (bubbleText) this.say(bubbleText);
    return this;
  }

  // Typewriter-reveal text in bubble
  say(text) {
    if (!this._textEl) return this;
    this._tw?.stop();
    this._tw = new Typewriter(this._textEl, text, { speed: 32 });
    this._tw.start();
    return this;
  }

  // Instant text
  sayInstant(text) {
    if (!this._textEl) return this;
    this._tw?.stop();
    this._textEl.textContent = text;
    return this;
  }

  celebrate() {
    if (!this._figureEl) return;
    this._figureEl.style.animation = 'none';
    void this._figureEl.offsetWidth;
    this._figureEl.style.animation = 'mascot-celebrate 0.8s ease';
    setTimeout(() => {
      if (this._figureEl) this._figureEl.style.animation = 'mascot-float 3s ease-in-out infinite';
    }, 800);
  }

  bounceIn() {
    if (!this._figureEl) return;
    this._figureEl.style.animation = 'mascot-bounce-in 0.6s cubic-bezier(0.34,1.56,0.64,1) both';
  }
}
