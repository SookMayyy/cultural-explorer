// js/utils/dom.js — small DOM helpers shared across screens.

// Escape text before injecting it into innerHTML. Content is authored data
// (state names, captions), but it still flows through innerHTML, so escape it.
export function escapeHtml(text) {
  return String(text).replace(/[&<>"]/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
}

// Wrap the first occurrence of `key` in a <mark> so young readers can spot the
// important word. Text is escaped first, then the key is matched case-insensitively.
export function highlightKeyword(text, key, markClass) {
  const html = escapeHtml(text);
  if (!key) return html;
  const safe = escapeHtml(key).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return html.replace(new RegExp(`(${safe})`, 'i'), `<mark class="${markClass}">$1</mark>`);
}

// Re-trigger a CSS animation. Removing the class alone won't replay it — the
// browser only restarts the animation after a reflow, which reading offsetWidth forces.
export function restartAnimation(el, className) {
  if (!el) return;
  el.classList.remove(className);
  void el.offsetWidth;
  el.classList.add(className);
}
