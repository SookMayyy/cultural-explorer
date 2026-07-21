/* popup.js — reusable popup dialogs for the whole app */

// Styles inject once on first use, so any page can import and call these without
// markup or a link. Note: the CSS below is a template literal — never put a
// backtick in its comments.

let stylesInjected = false;

function injectStyles() {
  if (stylesInjected) return;
  stylesInjected = true;
  const css = `
  .ce-popup-overlay{
    position:fixed; inset:0; z-index:9999;
    display:flex; align-items:center; justify-content:center;
    padding:24px; background:rgba(20,12,8,0.55);
    opacity:0; transition:opacity .18s ease;
  }
  .ce-popup-overlay.show{ opacity:1; }
  .ce-popup-card{
    width:100%; max-width:440px; background:#fff;
    border-radius:22px; padding:30px 28px 24px; text-align:center;
    box-shadow:0 18px 50px rgba(0,0,0,.3);
    transform:translateY(12px) scale(.96); transition:transform .2s cubic-bezier(.34,1.56,.64,1);
    font-family:'Baloo 2',system-ui,sans-serif;
  }
  .ce-popup-overlay.show .ce-popup-card{ transform:translateY(0) scale(1); }
  .ce-popup-emoji{ font-size:52px; line-height:1; display:block; margin-bottom:10px; }
  /* Image icon variant — a UI illustration used in place of the emoji. */
  .ce-popup-emoji--img{ width:72px; height:72px; object-fit:contain; margin:0 auto 12px; }
  .ce-popup-title{ font-size:24px; font-weight:800; color:#2b2b2b; margin:0 0 12px; }
  /* Bigger, heavier, darker text so instructions read as clearly as the rest of
     the app. Short one-line messages stay centred; multi-step instructions get
     left-aligned (--steps) so the numbered/bulleted lines line up neatly. */
  .ce-popup-msg{ font-size:18px; font-weight:600; color:#3a3a3a; line-height:1.65; margin:0 0 22px; text-align:center; }
  .ce-popup-msg--steps{ text-align:left; }
  .ce-popup-actions{ display:flex; flex-direction:column; gap:10px; }
  /* Side-by-side picker cards — pair with an image on each action. */
  .ce-popup-actions--row{
    flex-direction:row; gap:14px; justify-content:center; align-items:stretch;
  }
  .ce-popup-actions--row .ce-popup-btn{
    flex:1 1 0; display:flex; flex-direction:column; align-items:center;
    justify-content:center; gap:10px; border-radius:18px; padding:20px 12px;
  }
  .ce-popup-btn-icon{ width:52px; height:52px; object-fit:contain; }
  .ce-popup-btn{
    width:100%; padding:14px 16px; border:none; border-radius:999px;
    font-family:inherit; font-size:17px; font-weight:700; cursor:pointer;
    transition:transform .1s, filter .12s;
  }
  .ce-popup-btn:active{ transform:scale(.97); filter:brightness(.97); }
  .ce-popup-btn--primary{ background:#FE6815; color:#fff; }
  .ce-popup-btn--ghost{ background:#eee; color:#555; }
  @media (prefers-reduced-motion: reduce){
    .ce-popup-overlay,.ce-popup-card{ transition:none; }
  }`;
  const el = document.createElement('style');
  el.id = 'ce-popup-styles';
  el.textContent = css;
  document.head.appendChild(el);
}

// Show a popup; resolves with the chosen action's value (null if dismissed).
//   actions:       [{ label, value, style: 'primary'|'ghost', image }]
//   cls            extra class on the overlay, for a page-specific reskin
//   topHtml        markup between title and message; bodyHtml between message and buttons
//   dismissible    false drops backdrop-click + Esc, for a required choice
//   actionsLayout  'stack' (default) or 'row' (side-by-side picker cards)
export function showPopup({
  title = '', message = '', emoji = '💬', image = '', actions,
  cls = '', topHtml = '', bodyHtml = '', dismissible = true, actionsLayout = 'stack',
} = {}) {
  injectStyles();
  const acts = actions && actions.length ? actions : [{ label: 'OK', value: true, style: 'primary' }];

  // A UI illustration (e.g. the shop bag) replaces the emoji when `image` is set;
  // the emoji stays the graceful fallback if the file ever fails to load.
  const iconHtml = image
    ? `<img class="ce-popup-emoji ce-popup-emoji--img" src="${image}" alt="" aria-hidden="true"` +
      ` onerror="this.replaceWith(Object.assign(document.createElement('span'),` +
      `{className:'ce-popup-emoji',textContent:'${emoji}'}))">`
    : `<span class="ce-popup-emoji" aria-hidden="true">${emoji}</span>`;

  return new Promise(resolve => {
    const overlay = document.createElement('div');
    overlay.className = `ce-popup-overlay${cls ? ' ' + cls : ''}`;
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');

    // Multi-line messages (numbered/bulleted instructions joined by <br>) are
    // left-aligned so the steps line up; single-line messages stay centred.
    const isSteps = /<br\s*\/?>/i.test(message);

    overlay.innerHTML = `
      <div class="ce-popup-card">
        ${iconHtml}
        ${title ? `<h2 class="ce-popup-title">${title}</h2>` : ''}
        ${topHtml}
        ${message ? `<p class="ce-popup-msg${isSteps ? ' ce-popup-msg--steps' : ''}">${message}</p>` : ''}
        ${bodyHtml}
        <div class="ce-popup-actions ce-popup-actions--${actionsLayout}"></div>
      </div>`;

    const actionsEl = overlay.querySelector('.ce-popup-actions');
    acts.forEach(a => {
      const btn = document.createElement('button');
      btn.className = `ce-popup-btn ce-popup-btn--${a.style || 'primary'}`;
      btn.type = 'button';
      if (a.image) {
        const img = document.createElement('img');
        img.className = 'ce-popup-btn-icon';
        img.src = a.image;
        img.alt = '';
        btn.appendChild(img);
      }
      const label = document.createElement('span');
      label.className = 'ce-popup-btn-label';
      label.textContent = a.label;
      btn.appendChild(label);
      btn.addEventListener('click', () => close(a.value));
      actionsEl.appendChild(btn);
    });

    function close(value) {
      overlay.classList.remove('show');
      document.removeEventListener('keydown', onKey);
      setTimeout(() => { overlay.remove(); resolve(value); }, 180);
    }
    function onKey(e) { if (e.key === 'Escape') close(null); }

    // Tap the dark backdrop to dismiss (resolves null). Both escape hatches are
    // skipped when `dismissible:false` — the caller needs a real choice.
    if (dismissible) {
      overlay.addEventListener('click', e => { if (e.target === overlay) close(null); });
      document.addEventListener('keydown', onKey);
    }

    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('show'));
    setTimeout(() => overlay.querySelector('.ce-popup-btn')?.focus(), 200);
  });
}

// Friendly error popup (strips a leading emoji from the message).
export function showError(message, { title = 'Oops!', emoji = '😅' } = {}) {
  const clean = String(message || 'Something went wrong. Please try again.')
    .replace(/^[❌⚠️\s]+/, '').trim();
  return showPopup({ title, message: clean, emoji, actions: [{ label: 'OK', value: true, style: 'primary' }] });
}

// Yes/No confirmation. Resolves true (confirm) or false (cancel/dismiss).
export async function confirmPopup(message, { title = 'Are you sure?', emoji = '🤔', image = '', confirmText = 'Yes', cancelText = 'Cancel' } = {}) {
  const result = await showPopup({
    title, message, emoji, image,
    actions: [
      { label: confirmText, value: true,  style: 'primary' },
      { label: cancelText,  value: false, style: 'ghost'   },
    ],
  });
  return result === true;
}
