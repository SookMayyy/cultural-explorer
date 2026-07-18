// js/utils/instructions.js — shared formatting for kid instruction lines.
//
// Instruction lists (the "How to Play" popups, the settings Game Guide / Safety
// popups) are written as short lines that each begin with an emoji, e.g.
// "🤔 Read the question.". We swap that leading emoji for the app's point-form
// bullet image so every instruction reads with the same pointer marker instead
// of a grab-bag of differently-styled OS emoji.
//
// Path note: the <img> is inserted into a page under src/views/, so the asset
// path is relative to there ("../assets/..."), matching assetImg.js et al.

// The double-chevron pointer used as the instruction bullet. A <span> with the
// pointer as a background (not an <img>) so it stays INLINE and the instruction
// text continues right after it — the global `img { display:block }` reset would
// otherwise force the bullet onto its own line. Inline styles keep it
// self-contained so it works in any popup without a shared CSS class.
const POINT_BULLET =
  '<span aria-hidden="true" style="' +
  'display:inline-block;width:1.05em;height:1.05em;margin-right:8px;vertical-align:-0.15em;' +
  "background:url('../assets/images/ui/point_form.png') center/contain no-repeat;\"></span>";

// A leading emoji: one Extended_Pictographic code point plus any variation
// selector (️), ZWJ-joined pictographs (‍…), or skin-tone modifiers,
// followed by trailing space.
const LEADING_EMOJI =
  /^\s*\p{Extended_Pictographic}(?:️|‍\p{Extended_Pictographic}|[\u{1F3FB}-\u{1F3FF}])*\s*/u;

// Replace a line's leading emoji with the point-form bullet. Lines that don't
// start with an emoji (e.g. numbered "1. …" steps) are returned unchanged.
export function withPointBullet(line) {
  const str = String(line);
  return LEADING_EMOJI.test(str) ? POINT_BULLET + str.replace(LEADING_EMOJI, '') : str;
}
