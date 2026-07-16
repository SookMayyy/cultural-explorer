// js/utils/shuffle.js — Fisher–Yates shuffle.
//
// Extracted from the identical copies that lived in mission.js and quiz.js.
// Behaviour is unchanged from those originals.
//
// Note: guess.js and the cook game's tray deliberately keep their own
// `sort(() => Math.random() - 0.5)`. That idiom is a *biased* shuffle, so
// swapping it for this one would change how their options are distributed —
// a behaviour change, not a refactor. Leave them as they are.

// Return a shuffled copy, leaving the input untouched (callers pass imported
// data constants).
export function shuffle(list) {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
