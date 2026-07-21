/* assetImg.js — art slot with emoji fallback */

// <img> over an emoji placeholder; the image takes over on load (.is-loaded),
// so a missing asset never flashes a broken image. Pair with .img-slot in style.css.
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
