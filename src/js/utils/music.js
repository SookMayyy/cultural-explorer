// js/utils/music.js — looping background-music helper (one track at a time).
// ─────────────────────────────────────────────────────────────────────────────
// Unlike Sound (synthesised SFX blips), this plays a real audio FILE softly on
// loop under a screen — e.g. a state's festival track under all four of its
// missions. Autoplay is blocked until a user gesture, so if the first play() is
// refused we start on the first tap/keypress instead. Respects the shared mute
// (ce_sfx) so muting the app also silences the music.
//
//   import { playMusic, stopMusic } from './utils/music.js';
//   playMusic('../assets/content/Kedah/kedah_dance_music.mp3', { volume: 0.25 });
//
// music.js is the single OWNER of the currently-playing track, so callers that
// just need to get out of the way of narration (voice.js) call `duck()` /
// `unduck()` rather than touching the <audio> element themselves.

import Sound from './sound.js';

let el = null;
let pending = null;   // the "start on first gesture" listener, if armed
let baseVolume = 0.25; // the track's normal ("un-ducked") volume
let fadeTimer = null;  // interval id for an in-progress volume fade, if any

function disarm() {
  if (!pending) return;
  window.removeEventListener('pointerdown', pending);
  window.removeEventListener('keydown', pending);
  pending = null;
}

function clearFade() {
  if (fadeTimer) { clearInterval(fadeTimer); fadeTimer = null; }
}

// Smoothly ramp the current track's volume to `target` over `ms` ms. No-ops
// if nothing is playing — ducking must never throw just because music was
// already stopped, muted, or blocked by autoplay.
function fadeTo(target, ms = 220) {
  if (!el) return;
  clearFade();
  const start     = el.volume;
  const startedAt = performance.now();
  fadeTimer = setInterval(() => {
    const t = Math.min(1, (performance.now() - startedAt) / ms);
    if (el) el.volume = start + (target - start) * t;
    if (t >= 1) clearFade();
  }, 30);
}

// Duck the music down under a voice-over line (called by voice.js when a line
// starts speaking) so the narration is always clearly audible.
export function duck(level = 0.06) {
  fadeTo(level);
}

// Restore the music to its normal volume once the voice-over line ends.
export function unduck() {
  fadeTo(baseVolume);
}

export function stopMusic() {
  disarm();
  clearFade();
  if (el) { try { el.pause(); } catch {} el.src = ''; el = null; }
}

export function playMusic(url, { volume = 0.25, loop = true } = {}) {
  stopMusic();
  if (!url || (Sound.isMuted && Sound.isMuted())) return;

  baseVolume = volume;
  el = new Audio(url);
  el.loop = loop;
  el.volume = volume;

  const start = () => { if (el) el.play().catch(() => {}); };
  el.play().catch(() => {
    // Autoplay refused — begin as soon as the child interacts with the page.
    pending = () => { disarm(); start(); };
    window.addEventListener('pointerdown', pending, { once: true });
    window.addEventListener('keydown', pending, { once: true });
  });

  // Never let a track outlive its screen (both events, since browsers fire
  // different ones depending on how the page is left).
  window.addEventListener('pagehide', stopMusic, { once: true });
  window.addEventListener('beforeunload', stopMusic, { once: true });
}
