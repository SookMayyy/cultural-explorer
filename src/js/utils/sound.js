// js/utils/sound.js — tiny Web Audio sound-effects helper.
//
// Sounds are SYNTHESISED in code (no audio files needed), so they work even
// while art/audio assets are missing. The AudioContext is created lazily on the
// first play (which happens on a user gesture, satisfying autoplay policies).
//
// A single device-level mute preference is stored in localStorage ('ce_sfx').
// Default: ON (short, game-y blips). Toggle it from Settings.
//
//   import Sound from './utils/sound.js';
//   Sound.correct();  Sound.wrong();  Sound.tap();  Sound.stamp();  Sound.unlock();

const KEY = 'ce_sfx';
let ctx = null;

function audio() {
  if (ctx) return ctx;
  try { ctx = new (window.AudioContext || window.webkitAudioContext)(); }
  catch { ctx = null; }
  return ctx;
}

export function isMuted() { return localStorage.getItem(KEY) === '0'; }
export function setMuted(muted) { localStorage.setItem(KEY, muted ? '0' : '1'); }

// One enveloped oscillator note.
function tone(freq, startOffset, dur, type = 'sine', gain = 0.18) {
  const ac = audio();
  if (!ac) return;
  const osc = ac.createOscillator();
  const g   = ac.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  osc.connect(g);
  g.connect(ac.destination);
  const t = ac.currentTime + startOffset;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.start(t);
  osc.stop(t + dur + 0.03);
}

// Play a sequence unless muted; resume the context if the browser suspended it.
function play(seq) {
  if (isMuted()) return;
  const ac = audio();
  if (!ac) return;
  if (ac.state === 'suspended') ac.resume();
  seq();
}

export const Sound = {
  isMuted,
  setMuted,
  // Light UI tap.
  tap()     { play(() => tone(330, 0, 0.08, 'triangle', 0.12)); },
  // Cheerful rising triad.
  correct() { play(() => { tone(523, 0, 0.12); tone(659, 0.10, 0.12); tone(784, 0.20, 0.18, 'sine', 0.2); }); },
  // Gentle "try again" descending buzz (soft, never harsh for kids).
  wrong()   { play(() => { tone(220, 0, 0.16, 'sawtooth', 0.1); tone(165, 0.12, 0.2, 'sawtooth', 0.1); }); },
  // Stamp "thunk" + sparkle.
  stamp()   { play(() => { tone(160, 0, 0.12, 'square', 0.18); tone(523, 0.08, 0.14); tone(880, 0.2, 0.24, 'sine', 0.16); }); },
  // Unlock fanfare arpeggio.
  unlock()  { play(() => { tone(523, 0, 0.1); tone(659, 0.09, 0.1); tone(784, 0.18, 0.1); tone(1047, 0.27, 0.26, 'sine', 0.18); }); },
};

export default Sound;
