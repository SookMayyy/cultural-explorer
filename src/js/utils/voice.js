// js/utils/voice.js — voiceover-first narration for the learning steps.
// ─────────────────────────────────────────────────────────────────────────────
// The Discover spotlight and section summaries SPEAK one short sentence per tap
// (supervisor feedback: young children skip text even with captions). Real MP3
// clips can be dropped in later; until then the Web Speech API (`speechSynthesis`)
// reads the caption text, so every learning step "speaks" today with no assets.
//
//   import Voice from './utils/voice.js';
//   Voice.play('kedah_food_1', 'Soft rice noodles soak up the tangy gravy.');
//
// Voiceover is a LEARNING aid, so unlike ambient SFX it defaults ON. The mute
// preference lives under 'ce_voice' and is honoured on every call.
//
// music.js owns whatever background track is playing (a state's festival
// music now loops under every mission — see data/missions.js `stateAudio`).
// So the narration line just DUCKS it while speaking and UNDUCKS it once the
// line ends, rather than touching the <audio> element itself.

import { duck, unduck } from './music.js';

const KEY = 'ce_voice';

// Register recorded clips here as they are produced (Canva / ElevenLabs export):
//   { kedah_food_1: '../assets/audio/vo/kedah_food_1.mp3', ... }
const CLIPS = {};

export function isMuted() { return localStorage.getItem(KEY) === '0'; }
export function setMuted(muted) {
  localStorage.setItem(KEY, muted ? '0' : '1');
  if (muted) stop();
}

let current = null;   // the <Audio> element currently playing, if any

export function stop() {
  if (current) { try { current.pause(); } catch {} current = null; }
  if (window.speechSynthesis) speechSynthesis.cancel();
  // Whatever line was speaking is done (or was cut short) — bring the music
  // back up. Safe to call even when nothing was ducked (music.js no-ops).
  unduck();
}

// Speak one short line. `id` selects a recorded clip when available; otherwise
// `fallbackText` is spoken via the browser's built-in TTS. Safe to call before
// any MP3s exist. Never throws (autoplay rejections are swallowed). Ducks the
// background music for the duration of the line, then un-ducks it on end.
//
// `onEnd` (optional) fires once the line finishes (or immediately when muted /
// there is nothing to speak), so callers can chain the NEXT line only after
// this one has actually been heard — e.g. the spotlight transition waits for
// the last hotspot line to end instead of guessing with a fixed delay.
export function play(id, fallbackText, onEnd) {
  // Run the caller's callback at most once, even if several end/error events fire.
  let done = false;
  const finish = () => { if (done) return; done = true; unduck(); onEnd?.(); };

  if (isMuted()) { finish(); return; }
  stop();
  duck();

  const src = CLIPS[id];
  if (src) {
    const a = new Audio(src);
    current = a;
    a.addEventListener('ended', finish, { once: true });
    a.addEventListener('error', () => {
      // Recorded clip failed (missing/blocked) → fall back to spoken text.
      current = null;
      speak(fallbackText, finish);
    }, { once: true });
    a.play().catch(() => {
      current = null;
      speak(fallbackText, finish);
    });
    return;
  }
  speak(fallbackText, finish);
}

function speak(text, onEnd) {
  if (!text || !window.speechSynthesis) { unduck(); onEnd?.(); return; }
  const u = new SpeechSynthesisUtterance(text);
  u.rate = 0.95;   // a touch slow for young listeners
  u.pitch = 1.1;   // friendly, mascot-like
  u.lang = 'en-US';
  u.onend   = () => { unduck(); onEnd?.(); };
  u.onerror = () => { unduck(); onEnd?.(); };
  speechSynthesis.speak(u);
}

// Never let narration bleed into the next screen. `speechSynthesis` is a single
// browser-global queue shared across same-tab navigations, so an utterance can
// keep speaking after the page changes — cancel it as the page is leaving.
if (typeof window !== 'undefined') {
  window.addEventListener('pagehide', stop);
  window.addEventListener('beforeunload', stop);
}

export const Voice = { isMuted, setMuted, play, stop };
export default Voice;
