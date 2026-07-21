/* dom.js — small DOM helpers shared across screens */

// Escape text before injecting it into innerHTML.
export function escapeHtml(text) {
  return String(text).replace(/[&<>"]/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
}

// Wrap the first case-insensitive match of `key` in a <mark>.
export function highlightKeyword(text, key, markClass) {
  const html = escapeHtml(text);
  if (!key) return html;
  const safe = escapeHtml(key).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return html.replace(new RegExp(`(${safe})`, 'i'), `<mark class="${markClass}">$1</mark>`);
}

// Re-trigger a CSS animation (reading offsetWidth forces the reflow that replays it).
export function restartAnimation(el, className) {
  if (!el) return;
  el.classList.remove(className);
  void el.offsetWidth;
  el.classList.add(className);
}
