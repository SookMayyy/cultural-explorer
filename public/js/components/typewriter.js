// js/components/typewriter.js — Character-by-character text reveal

export default class Typewriter {
  constructor(el, text, { speed = 35, onDone } = {}) {
    this._el    = el;
    this._text  = text;
    this._speed = speed;
    this._done  = onDone;
    this._timer = null;
    this._idx   = 0;
  }

  start() {
    this.stop();
    this._idx = 0;
    this._el.textContent = '';
    this._tick();
    return this;
  }

  _tick() {
    if (this._idx >= this._text.length) {
      this._done?.();
      return;
    }
    this._el.textContent += this._text[this._idx++];
    this._timer = setTimeout(() => this._tick(), this._speed);
  }

  stop() {
    clearTimeout(this._timer);
    this._timer = null;
  }

  finish() {
    this.stop();
    this._el.textContent = this._text;
    this._done?.();
  }
}
