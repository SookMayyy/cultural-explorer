/* music.js — looping background-music helper (one track at a time) */

// Plays a real audio file softly on loop under a screen. If autoplay is refused,
// starts on the first tap/keypress. Respects the shared mute (ce_sfx). This module
// owns the current track, so voice.js ducks it via duck()/unduck() rather than
// touching the <audio> element itself.

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

// Ramp the current track's volume to `target` over `ms`. No-ops if nothing is playing.
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

// Duck the music under a voice-over line (called by voice.js while it speaks).
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

// A bfcache restore resumes the paused <audio> without re-running playMusic(),
// so re-check the master mute on pageshow and cut a muted track.
if (typeof window !== 'undefined') {
  window.addEventListener('pageshow', () => {
    if (Sound.isMuted && Sound.isMuted()) stopMusic();
  });
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
