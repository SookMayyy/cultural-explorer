// js/utils/pointerDrag.js — drag-and-drop that works with a finger.
// ─────────────────────────────────────────────────────────────────────────────
// The HTML5 drag-and-drop API (what dragMatch.js uses) does not fire on touch at
// all, so tablets get no dragging from it. This is a Pointer Events
// implementation instead: one code path covering mouse, pen and touch.
//
//   const drag = initPointerDrag({
//     sourceRoot:     pillsEl,          // delegate from here, survives re-renders
//     sourceSelector: '.ttt-pill',
//     targetSelector: '.ttt-cell',
//     createGhost:    el => el.cloneNode(true),
//     onTap:   el          => selectPill(el),
//     onDrop:  (el, target) => target && drop(el, target),
//     isEnabled: () => !busy,
//   });
//   drag.destroy();
//
// Design notes worth keeping:
//
// • A press that never moves more than `threshold` px resolves as onTap, not a
//   drag. That is what lets ONE element serve both the drag and the
//   tap-to-select-then-tap-target fallback — important for small fingers.
//   For the same reason we bind no `click` handler: it would double-fire after
//   pointerup.
//
// • setPointerCapture keeps pointermove flowing even once the finger has left
//   the pill, and guarantees a terminal event, so a drag can never get stuck.
//
// • The ghost MUST be pointer-events:none, or elementFromPoint returns the ghost
//   itself on every single move and no drop target is ever found.
//
// • Draggable elements need `touch-action:none` in CSS, or the browser claims
//   the gesture as a scroll and fires pointercancel on the first move.

export function initPointerDrag({
  sourceRoot,
  sourceSelector,
  targetSelector,
  threshold = 8,
  createGhost,
  onTap,
  onDragStart,
  onDragOver,
  onDrop,
  isEnabled = () => true,
} = {}) {
  if (!sourceRoot) return { destroy() {} };

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let pointerId = null;   // the one pointer we're tracking
  let source    = null;   // the element being pressed / dragged
  let startX = 0, startY = 0;
  let grabDX = 0, grabDY = 0;   // pointer offset INSIDE the source, so it doesn't jump
  let dragging = false;
  let ghost   = null;
  let lastOver = null;
  let rafId = null, pendingX = 0, pendingY = 0;

  function onPointerDown(e) {
    if (pointerId !== null) return;              // already tracking one
    if (e.button !== undefined && e.button > 0) return;   // ignore right/middle
    const el = e.target.closest(sourceSelector);
    if (!el || !sourceRoot.contains(el)) return;
    if (!isEnabled(el)) return;

    pointerId = e.pointerId;
    source    = el;
    startX = e.clientX; startY = e.clientY;
    const rect = el.getBoundingClientRect();
    grabDX = e.clientX - rect.left;
    grabDY = e.clientY - rect.top;
    dragging = false;

    try { el.setPointerCapture(e.pointerId); } catch { /* capture unsupported */ }
    el.addEventListener('pointermove',   onPointerMove);
    el.addEventListener('pointerup',     onPointerUp);
    el.addEventListener('pointercancel', onPointerCancel);
    el.addEventListener('lostpointercapture', onPointerCancel);
  }

  function beginDrag(x, y) {
    dragging = true;
    const rect = source.getBoundingClientRect();
    ghost = createGhost ? createGhost(source) : source.cloneNode(true);
    ghost.classList.add('ce-drag-ghost');
    ghost.style.position      = 'fixed';
    ghost.style.left          = '0';
    ghost.style.top           = '0';
    ghost.style.width         = `${rect.width}px`;
    ghost.style.height        = `${rect.height}px`;
    ghost.style.margin        = '0';
    ghost.style.zIndex        = '10000';
    ghost.style.pointerEvents = 'none';           // critical for elementFromPoint
    ghost.style.willChange    = 'transform';
    // The clone inherits the source's transition (pills animate their transform
    // on hover/press). Left in place, EVERY drag frame would be eased over
    // ~120ms and the ghost would visibly lag the finger — kill it outright.
    ghost.style.transition    = 'none';
    ghost.style.animation     = 'none';
    // Position it before it is ever painted, or it flashes at the viewport
    // corner for one frame.
    ghost.style.transform     = `translate3d(${x - grabDX}px, ${y - grabDY}px, 0)`;
    document.body.appendChild(ghost);
    onDragStart?.(source, ghost);
  }

  // Coalesce moves into one rAF — a 120Hz screen would otherwise queue layout work.
  function flush() {
    rafId = null;
    if (!ghost) return;
    ghost.style.transform = `translate3d(${pendingX - grabDX}px, ${pendingY - grabDY}px, 0)`;
  }

  function onPointerMove(e) {
    if (e.pointerId !== pointerId) return;

    if (!dragging) {
      if (Math.hypot(e.clientX - startX, e.clientY - startY) < threshold) return;
      beginDrag(e.clientX, e.clientY);
    }

    // getCoalescedEvents gives every sample the OS captured between frames, so
    // on a 120Hz digitiser the ghost lands on the freshest position rather than
    // whichever sample happened to fire last.
    const last = e.getCoalescedEvents ? (e.getCoalescedEvents().at(-1) || e) : e;
    pendingX = last.clientX; pendingY = last.clientY;
    if (rafId === null) rafId = requestAnimationFrame(flush);

    const over = targetUnder(e.clientX, e.clientY);
    if (over !== lastOver) {
      onDragOver?.(over, lastOver);
      lastOver = over;
    }
  }

  // clientX/Y and elementFromPoint are both viewport-space, so page scroll needs
  // no correction here.
  function targetUnder(x, y) {
    const hit = document.elementFromPoint(x, y);
    return hit ? hit.closest(targetSelector) : null;
  }

  function onPointerUp(e) {
    if (e.pointerId !== pointerId) return;
    const wasDragging = dragging;
    const target = wasDragging ? targetUnder(e.clientX, e.clientY) : null;
    const el = source;
    cleanup();
    if (wasDragging) onDrop?.(el, target);
    else onTap?.(el);
  }

  function onPointerCancel(e) {
    if (e.pointerId !== undefined && e.pointerId !== pointerId) return;
    cleanup();
  }

  function cleanup() {
    if (source) {
      source.removeEventListener('pointermove',   onPointerMove);
      source.removeEventListener('pointerup',     onPointerUp);
      source.removeEventListener('pointercancel', onPointerCancel);
      source.removeEventListener('lostpointercapture', onPointerCancel);
      try { source.releasePointerCapture(pointerId); } catch { /* already released */ }
    }
    if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; }
    if (lastOver) { onDragOver?.(null, lastOver); lastOver = null; }
    ghost?.remove();
    ghost = null;
    source = null;
    pointerId = null;
    dragging = false;
  }

  sourceRoot.addEventListener('pointerdown', onPointerDown);

  return {
    /** True while a real drag (past the threshold) is in flight. */
    get isDragging() { return dragging; },
    reduceMotion,
    destroy() {
      cleanup();
      sourceRoot.removeEventListener('pointerdown', onPointerDown);
    },
  };
}

export default initPointerDrag;
