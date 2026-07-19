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
import Sound from './sound.js';
import { VO_CLIPS } from '../data/voClips.js';

const KEY = 'ce_voice';

// Recorded clips (id → MP3) are produced by `npm run voiceover` (ElevenLabs) and
// listed in the auto-generated data/voClips.js. Any id not present there falls
// back to the browser's Web Speech API below, so partial recordings are fine.
const CLIPS = VO_CLIPS;

// Muted when EITHER the app-wide "Sound" switch (ce_sfx — the master mute the
// Settings toggle flips) is off, OR the voice-specific pref (ce_voice) is off.
// Honouring the master here is what makes "Sound: Off" also silence narration.
export function isMuted() { return Sound.isMuted() || localStorage.getItem(KEY) === '0'; }
export function setMuted(muted) {
  localStorage.setItem(KEY, muted ? '0' : '1');
  if (muted) stop();
}

let current = null;   // the <Audio> element currently playing, if any
let gen = 0;          // bumped by stop(); retires the running line's callback

export function stop() {
  // Stopping retires whatever was playing, so bump the generation: the browser
  // fires 'end'/'error' on an utterance it CANCELS, and without this the line we
  // just cut short would run its onEnd as though it had been heard in full.
  gen++;
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
  // Nothing to hear → callers chaining on the end of this line run right away.
  if (isMuted()) { unduck(); onEnd?.(); return; }

  stop();                 // retires the previous line (gen++) before we start ours
  const myGen = gen;
  duck();

  // Run the caller's callback at most once, and only while THIS line is still the
  // one playing. The generation check is what keeps a chain honest: starting or
  // stopping another line cancels ours, and a cancelled utterance still emits
  // 'end' — so without it, replaying a line would fire the callback of the line it
  // replaced (e.g. releasing the spotlight's next number while audio still plays).
  let done = false;
  const finish = () => {
    if (done || myGen !== gen) return;
    done = true;
    unduck();
    onEnd?.();
  };

  const src = CLIPS[id];
  if (src) {
    const a = new Audio(src);
    current = a;
    a.addEventListener('ended', finish, { once: true });
    a.addEventListener('error', () => {
      // Recorded clip failed (missing/blocked) → fall back to spoken text.
      current = null;
      speak(fallbackText, finish, myGen);
    }, { once: true });
    a.play().catch(() => {
      current = null;
      speak(fallbackText, finish, myGen);
    });
    return;
  }
  speak(fallbackText, finish, myGen);
}

function speak(text, onEnd, myGen) {
  if (!text || !window.speechSynthesis) { unduck(); onEnd?.(); return; }
  const u = new SpeechSynthesisUtterance(text);
  u.rate = 0.95;   // a touch slow for young listeners
  u.pitch = 1.1;   // friendly, mascot-like
  u.lang = 'en-US';
  u.onend   = onEnd;
  u.onerror = onEnd;   // `finish` already un-ducks and is generation-guarded
  // Chrome applies speechSynthesis.cancel() asynchronously, so an utterance queued
  // in the same task as the cancel in stop() above gets swallowed — it either never
  // speaks or errors immediately, which would end the line before it starts. Queue
  // it a tick later, and only while it is still the line we want.
  setTimeout(() => { if (myGen === gen) speechSynthesis.speak(u); }, 60);
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
