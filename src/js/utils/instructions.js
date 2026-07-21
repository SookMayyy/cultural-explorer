/* instructions.js — shared formatting for kid instruction lines */

// Swaps each line's leading emoji for the app's point-form bullet so every
// instruction reads with the same pointer marker. Path is relative to src/views/.

// A <span> with the pointer as a background (not <img>) so it stays inline —
// the global `img { display:block }` reset would push a real <img> onto its own line.
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
