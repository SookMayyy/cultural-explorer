// js/utils/assetImg.js — drop-in art slot with emoji fallback.
//
// Returns markup for an <img> that sits over an emoji placeholder. The emoji
// shows by default; once the named image file exists and loads, the <img>
// takes over (CSS .is-loaded). No broken-image flash while assets are missing.
// Pair with the .img-slot styles in css/style.css. See assets/ASSETS.md for
// the full list of expected filenames.

// Returns an HTML string (use with innerHTML).
export function assetImg(src, emoji, { alt = '', cls = '' } = {}) {
  return (
    `<span class="img-slot ${cls}">` +
      `<img class="img-slot__img" src="${src}" alt="${alt}" ` +
        `onload="this.closest('.img-slot').classList.add('is-loaded')">` +
      `<span class="img-slot__fb">${emoji}</span>` +
    `</span>`
  );
}
