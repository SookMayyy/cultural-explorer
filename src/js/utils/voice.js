/* voice.js — voiceover-first narration for the learning steps */

// Plays a recorded MP3 when one exists for the line, else speaks the caption via
// the Web Speech API. A learning aid, so it defaults ON (mute pref 'ce_voice').
// Ducks the background music (music.js) while a line speaks, then un-ducks it.

import { duck, unduck } from './music.js';
import Sound from './sound.js';
import { VO_CLIPS } from '../data/voClips.js';

const KEY = 'ce_voice';

// Recorded clips (id → MP3) come from `npm run voiceover`, listed in voClips.js.
// Any missing id falls back to Web Speech below, so partial recordings are fine.
const CLIPS = VO_CLIPS;

// Muted when either the master switch (ce_sfx) or the voice pref (ce_voice) is off.
export function isMuted() { return Sound.isMuted() || localStorage.getItem(KEY) === '0'; }
export function setMuted(muted) {
  localStorage.setItem(KEY, muted ? '0' : '1');
  if (muted) stop();
}

let current = null;   // the <Audio> element currently playing, if any
let gen = 0;          // bumped by stop(); retires the running line's callback

export function stop() {
  // Bump the generation: a cancelled utterance still fires 'end'/'error', and
  // this retires that stale callback so a cut-short line never runs its onEnd.
  gen++;
  if (current) { try { current.pause(); } catch {} current = null; }
  if (window.speechSynthesis) speechSynthesis.cancel();
  unduck();
}

// Speak one short line. `id` selects a recorded clip; otherwise `fallbackText` is
// spoken via TTS. Never throws. `onEnd` (optional) fires once the line finishes
// (or immediately when muted), so callers can chain the next line on real audio end.
export function play(id, fallbackText, onEnd) {
  if (isMuted()) { unduck(); onEnd?.(); return; }

  stop();                 // retires the previous line (gen++) before we start ours
  const myGen = gen;
  duck();

  // Run onEnd at most once, and only while THIS line is still current — the
  // generation guard stops a replaced line from firing the new line's callback.
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
  u.onerror = onEnd;
  // Chrome cancels asynchronously, so an utterance queued in the same task as
  // stop()'s cancel gets swallowed. Queue a tick later, only if still current.
  setTimeout(() => { if (myGen === gen) speechSynthesis.speak(u); }, 60);
}

// speechSynthesis is a tab-global queue that outlives navigation — cancel it as
// the page leaves so narration never bleeds into the next screen.
if (typeof window !== 'undefined') {
  window.addEventListener('pagehide', stop);
  window.addEventListener('beforeunload', stop);
}

export const Voice = { isMuted, setMuted, play, stop };
export default Voice;
