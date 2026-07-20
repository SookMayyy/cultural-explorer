// js/components/howToPlay.js — kid-friendly "How to Play" instruction popups.
// ─────────────────────────────────────────────────────────────────────────────
// A tiny wrapper over popup.js that shows a short, friendly instruction card for
// young children (age 7–12): a big title, a friendly mascot emoji, and 1–3 short
// lines each starting with an icon. It also mounts an always-visible "?" help
// button so a child can re-open the instructions any time.
//
//   initHowToPlay('quiz', {                       // auto-shows the FIRST visit,
//     title: 'Quiz Time!', emoji: '🧠',           // then just the "?" button
//     lines: ['🤔 Read the question.', '👆 Tap the best answer.'],
//   });
//
//   showHowToPlay({ title, emoji, lines })         // show it on demand (returns a Promise)
//
// The "seen" flag is stored in localStorage (key `ce_howto_<key>`) so the popup
// doesn't nag on every visit — but the "?" button always re-opens it.
// ─────────────────────────────────────────────────────────────────────────────

import { showPopup } from './popup.js';
import { withPointBullet } from '../utils/instructions.js';

const SEEN_PREFIX = 'ce_howto_';
let stylesInjected = false;

function injectStyles() {
  if (stylesInjected) return;
  stylesInjected = true;
  const css = `
  .ce-howto-list{ list-style:none; margin:4px 0 2px; padding:0; text-align:left; }
  .ce-howto-list li{
    font-size:19px; line-height:1.6; color:#3a3440; font-weight:600;
    padding:12px 8px; border-radius:12px;
  }
  .ce-howto-list li + li{ border-top:1px solid #f0edf6; }
  .ce-help-fab{
    position:fixed; right:16px; bottom:90px; z-index:9000;
    width:46px; height:46px; border-radius:50%; border:none;
    background:var(--clr-purple, #6B50CE); color:#fff;
    font-family:'Baloo 2',system-ui,sans-serif; font-size:24px; font-weight:800;
    line-height:1; cursor:pointer; box-shadow:0 6px 16px rgba(0,0,0,.28);
    display:flex; align-items:center; justify-content:center;
    transition:transform .12s ease, filter .12s ease;
  }
  /* Mounted inside the phone frame when a page has one (see mountHelpButton), so
     it anchors to the screen's own content rather than the viewport — on a wide
     window, position:fixed parks it out in the cream margin beside the frame. */
  .app-container .ce-help-fab{ position:absolute; }
  .ce-help-fab:hover{ filter:brightness(1.06); }
  .ce-help-fab:active{ transform:scale(.9); }
  @media (prefers-reduced-motion: reduce){ .ce-help-fab{ transition:none; } }`;
  const el = document.createElement('style');
  el.id = 'ce-howto-styles';
  el.textContent = css;
  document.head.appendChild(el);
}

function linesToHtml(lines) {
  // Each line begins with an emoji; swap it for the shared point-form bullet.
  return `<ul class="ce-howto-list">${(lines || []).map(l => `<li>${withPointBullet(l)}</li>`).join('')}</ul>`;
}

/**
 * Show a How-to-Play popup now. Resolves when the child taps the button.
 * `cls` and `bodyHtml` are passed straight through to showPopup, so a game can
 * reskin the card or slot in an illustrated demo below the instruction lines.
 */
export function showHowToPlay({
  title = 'How to Play', emoji = '🎮', lines = [], buttonLabel = "Let's Play!",
  cls = '', bodyHtml = '',
} = {}) {
  injectStyles();
  return showPopup({
    title, emoji, cls, bodyHtml,
    message: linesToHtml(lines),
    actions: [{ label: buttonLabel, value: true, style: 'primary' }],
  });
}

/** Mount the floating "?" help button (once) that re-opens the instructions. */
function mountHelpButton(config) {
  injectStyles();
  if (document.getElementById('ce-help-fab')) return;
  const btn = document.createElement('button');
  btn.id = 'ce-help-fab';
  btn.className = 'ce-help-fab';
  btn.type = 'button';
  btn.textContent = '?';
  btn.setAttribute('aria-label', 'How to play');
  btn.addEventListener('click', () => showHowToPlay(config));
  // Prefer the page's phone frame (position:relative) so the "?" sits ON the
  // screen content; body is the fallback for any page without one.
  (document.querySelector('.app-container') || document.body).appendChild(btn);
}

/**
 * Auto-show the instructions the FIRST time a child opens this activity, then
 * mount the "?" help button so they can re-open it. `key` namespaces the "seen"
 * flag so each activity remembers on its own.
 *
 * Returns a Promise that resolves once the popup is dismissed — or immediately
 * when it has been seen before. Games that follow up with a second dialog (e.g.
 * Tic-Tac-Toe's mode picker) await it so the two never stack on top of each
 * other; the older call sites simply ignore the return value.
 */
export function initHowToPlay(key, config, { button = true } = {}) {
  const seenKey = SEEN_PREFIX + key;
  let seen = false;
  try { seen = localStorage.getItem(seenKey) === '1'; } catch { /* private mode */ }

  const shown = seen
    ? Promise.resolve()
    : showHowToPlay(config).then(() => {
        try { localStorage.setItem(seenKey, '1'); } catch { /* ignore */ }
      });

  if (button) mountHelpButton(config);
  return shown;
}
