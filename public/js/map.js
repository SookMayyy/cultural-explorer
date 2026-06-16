// js/map.js — Journey Map screen
// Word Force–style winding path of state "level nodes".
// States unlock sequentially (West first, then East after all 5 West done).
// Each node shows: flag emoji, state name, lock/unlock/completed status.
// Tapping a node opens a bottom-sheet popup with a "Explore Now" CTA.

import Storage from './utils/storage.js';
import { renderTopbar, renderNavbar, requireAuth } from './ui.js';
import { STATES_DATA, unlockedStates, nextRecommended } from './data/states.js';

// ── Auth guard ────────────────────────────────────────────────────────────────
// Redirect to login if no active session
requireAuth();

// ── Render shared UI chrome ───────────────────────────────────────────────────
renderTopbar({
  title: 'My Map',
  showPoints: true,
  showAvatar: true,
  color: '#6B50CE',   // purple topbar — matches the map screen theme
});
renderNavbar('map');

// ── Load progress data ────────────────────────────────────────────────────────
const progress   = Storage.getProgress();
const stamps     = Storage.getStamps();           // array of completed state IDs
const completed  = Storage.completedCount();      // number of completed states
const unlocked   = unlockedStates(progress).map(s => s.id);
const nextUp     = nextRecommended(progress);     // first unlocked + not completed

// ── Update progress header ────────────────────────────────────────────────────
document.getElementById('map-completed').textContent = `${completed}/7`;
document.getElementById('map-pts').textContent       = `${Math.round((completed / 7) * 100)}%`;

// Animate the progress bar fill on load (delayed slightly so the animation is visible)
requestAnimationFrame(() => {
  const fill = document.getElementById('map-progress-fill');
  if (fill) {
    fill.style.width = `${Math.round((completed / 7) * 100)}%`;
  }
});

// ── Mascot greeting ───────────────────────────────────────────────────────────
// Rimau (tiger cub 🐯) greets West Malaysia; Wak (hornbill 🦅) for East.
// In the full build, swap the emoji for <img src="../assets/characters/rimau.svg">
// 📸 IMAGE NEEDED: assets/characters/rimau.svg and wak.svg (Loka Made–style)

const allWestDone = STATES_DATA
  .filter(s => s.region === 'west')
  .every(s => stamps.includes(s.id));

const mascotEmoji = allWestDone ? '🦅' : '🐯';
const mascotGreeting = completed === 0
  ? "Hi! I'm Rimau! Tap a state to begin your Malaysian adventure!"
  : completed < 5
  ? `Amazing! You've explored ${completed} state${completed > 1 ? 's' : ''}! Keep going!`
  : allWestDone
  ? "West Malaysia conquered! Cross the sea to East Malaysia — Wak is waiting!"
  : `Almost there! ${5 - completed} more West states before East Malaysia unlocks!`;

const mascotFigureEl = document.getElementById('map-mascot-figure');
const mascotTextEl   = document.getElementById('map-mascot-text');

if (mascotFigureEl) mascotFigureEl.textContent = mascotEmoji;
if (mascotTextEl)   mascotTextEl.textContent   = mascotGreeting;

// ── Build the journey node rows ───────────────────────────────────────────────
// Nodes alternate left/right for the winding-path feel (Word Force style).
// The east-gate divider is injected between West and East states.

const nodesContainer = document.getElementById('journey-path-nodes');
if (!nodesContainer) throw new Error('map.js: #journey-path-nodes not found');

// Separate states into West and East for two-section rendering
const westStates = STATES_DATA.filter(s => s.region === 'west');
const eastStates = STATES_DATA.filter(s => s.region === 'east');
const eastUnlocked = unlocked.some(id => eastStates.map(s => s.id).includes(id));

// Staggered animation delay counter (ms) — each node pops in later than the last
let nodeDelay = 0;
const DELAY_STEP = 80; // ms between each node's entrance

// Helper: determine the visual state of a node
function getNodeState(stateId) {
  if (stamps.includes(stateId))     return 'completed';
  if (unlocked.includes(stateId))   return 'unlocked';
  return 'locked';
}

// Helper: build the HTML for one node row
// isRight: true = node sits on the right half (zigzag pattern)
function buildNodeRow(state, index) {
  const isRight      = index % 2 === 1;     // alternate left/right
  const nodeState    = getNodeState(state.id);
  const isCurrentNext = nextUp && nextUp.id === state.id;
  const isLocked     = nodeState === 'locked';
  const isCompleted  = nodeState === 'completed';

  // Pick coin style class
  let coinClass = '';
  if (isCompleted)      coinClass = 'node-coin--completed';
  else if (isCurrentNext) coinClass = 'node-coin--current';
  else if (isLocked)    coinClass = 'node-coin--locked';

  // Badge overlay: checkmark for done, padlock for locked
  let badgeHtml = '';
  if (isCompleted) {
    badgeHtml = `<span class="node-badge--done" aria-hidden="true">✓</span>`;
  } else if (isLocked) {
    badgeHtml = `<span class="node-badge--locked" aria-hidden="true">🔒</span>`;
  }

  // "Next Up" arrow beneath the current recommended node
  const nextArrowHtml = isCurrentNext && !isLocked
    ? `<span class="node-next-arrow" aria-hidden="true">▼</span>`
    : '';

  // State label status line
  const statusLine = isCompleted
    ? '✅ Completed!'
    : isCurrentNext
    ? '▶ Play now!'
    : isLocked
    ? '🔒 Locked'
    : state.tagline;

  // Accessibility: locked nodes get a descriptive label
  const ariaLabel = isLocked
    ? `${state.name} — locked. Complete earlier states to unlock.`
    : `${state.name} — ${isCompleted ? 'completed' : 'explore now'}`;

  // Emoji fallback for the flag image
  // 📸 IMAGE NEEDED: replace the innerHTML of .node-coin with:
  //   <img src="../assets/flags/${state.id}-flag.png" alt="${state.name} flag">
  // once flag illustrations are exported from Figma.
  const flagHtml = state.emoji
    ? state.emoji   // already an <img> tag or emoji from states.js
    : '🏳️';

  // Build the row HTML
  // --node-delay is a CSS custom property that drives the staggered animation
  const row = document.createElement('div');
  row.className = `node-row${isRight ? ' node-row--right' : ''}`;
  row.innerHTML = `
    <button
      class="journey-node"
      data-state="${state.id}"
      style="--node-delay: ${nodeDelay}ms"
      aria-label="${ariaLabel}"
      ${isLocked ? 'disabled' : ''}
    >
      <div class="node-coin ${coinClass}">
        ${flagHtml}
        ${badgeHtml}
      </div>
      <div class="node-label">
        <p class="node-name">${state.name}</p>
        <p class="node-tagline">${statusLine}</p>
      </div>
      ${nextArrowHtml}
    </button>
  `;

  nodeDelay += DELAY_STEP;
  return row;
}

// Build East Malaysia gate divider (shown between West and East sections)
function buildEastGate() {
  const gateEl = document.createElement('div');
  gateEl.className = 'journey-gate';
  gateEl.id = 'east-gate';

  if (eastUnlocked) {
    // Gate is open — show the "Cross to East Malaysia" divider
    gateEl.innerHTML = `
      <div class="journey-gate__line"></div>
      <div class="journey-gate__label">
        ✈️ East Malaysia — Borneo
      </div>
      <div class="journey-gate__line"></div>
    `;
  } else {
    // Gate is locked — show how many states remain
    const remaining = 5 - completed;
    gateEl.innerHTML = `
      <div class="journey-gate__line"></div>
      <div class="journey-gate__label">
        🔒 East Malaysia
      </div>
      <p class="journey-gate__locked">
        Complete all 5 West Malaysia states to cross to Borneo!
        ${remaining > 0 ? `(${remaining} more to go)` : ''}
      </p>
      <div class="journey-gate__line"></div>
    `;
  }
  return gateEl;
}

// ── Render West Malaysia nodes ────────────────────────────────────────────────
westStates.forEach((state, idx) => {
  nodesContainer.appendChild(buildNodeRow(state, idx));
});

// ── Insert region label for East Malaysia ────────────────────────────────────
// The gate divider goes AFTER all West nodes
nodesContainer.appendChild(buildEastGate());

// Region label for East Malaysia
const eastLabel = document.createElement('div');
eastLabel.className = 'region-label';
eastLabel.innerHTML = `<span>East Malaysia — Borneo</span>`;
nodesContainer.appendChild(eastLabel);

// ── Render East Malaysia nodes ────────────────────────────────────────────────
// Index offset: eastStates stagger continues from where westStates left off
eastStates.forEach((state, idx) => {
  nodesContainer.appendChild(buildNodeRow(state, westStates.length + idx));
});

// ── Popup logic ────────────────────────────────────────────────────────────────
// Opens a bottom-sheet with state info and an "Explore Now" CTA.

function openPopup(stateId) {
  const state = STATES_DATA.find(s => s.id === stateId);
  if (!state) return;

  const sp   = Storage.getStateProgress(stateId);
  const tabs = ['story', 'culture', 'activity', 'quiz'];
  const isLocked = !unlocked.includes(stateId);

  // Populate emoji / flag
  const emojiEl = document.getElementById('popup-emoji');
  if (emojiEl) {
    // state.emoji is either an <img> tag or emoji string from states.js
    emojiEl.innerHTML = state.emoji || '🏳️';
  }

  document.getElementById('popup-name').textContent    = state.name;
  document.getElementById('popup-tagline').textContent = state.tagline;

  // Tab completion badges
  document.getElementById('popup-badges').innerHTML = tabs.map(t => `
    <span class="popup-badge ${sp[t] ? 'done' : ''}">
      ${sp[t] ? '✓ ' : ''}${t}
    </span>
  `).join('');

  // "Explore Now" button state
  const exploreBtn = document.getElementById('popup-explore');
  if (isLocked) {
    exploreBtn.href      = '#';
    exploreBtn.className = 'popup-explore-btn popup-explore-btn--locked';
    exploreBtn.textContent = '🔒 Locked';
  } else {
    exploreBtn.href      = `narrative.html?state=${stateId}`;
    exploreBtn.className = 'popup-explore-btn';
    exploreBtn.textContent = 'Explore Now ›';
    // Store which state we're navigating to
    exploreBtn.onclick = () => Storage.setCurrentState(stateId);
  }

  // Show the popup
  document.getElementById('map-popup').classList.remove('hidden');

  // Scroll the popup into view on iOS where position:fixed can misbehave
  document.getElementById('map-popup').scrollTop = 0;
}

function closePopup() {
  document.getElementById('map-popup').classList.add('hidden');
}

// ── Event delegation for node taps ────────────────────────────────────────────
// Using event delegation: one listener on the container, not one per node.
// This is more performant with 7+ nodes and stays correct after re-renders.
document.getElementById('journey-path').addEventListener('click', e => {
  const btn = e.target.closest('.journey-node:not([disabled])');
  if (btn && btn.dataset.state) {
    openPopup(btn.dataset.state);
  }
});

// ── Popup close handlers ──────────────────────────────────────────────────────
document.getElementById('popup-close')?.addEventListener('click', closePopup);

// Close when tapping the semi-transparent backdrop (outside the card)
document.getElementById('map-popup')?.addEventListener('click', e => {
  if (e.target === document.getElementById('map-popup')) closePopup();
});

// Close on Escape key for keyboard accessibility
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closePopup();
});

// ── Scroll to "next up" node on load ─────────────────────────────────────────
// Gently scrolls to the first uncompleted unlocked node so it's centred,
// giving the player a clear "where am I?" orientation like Word Force does.
if (nextUp) {
  // A short delay lets the entrance animations play first
  setTimeout(() => {
    const nextBtn = document.querySelector(`.journey-node[data-state="${nextUp.id}"]`);
    if (nextBtn) {
      nextBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, 600);
}
