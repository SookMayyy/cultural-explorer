// js/activity.js — "Match the Culture!" activity page
//
// Pulls the current state from Storage/URL, builds 3–4 drag-match pairs
// from that state's cards, then uses the DragMatch component to run the game.
// On completion, shows a congratulation overlay and links to the quiz.

import Storage from './utils/storage.js';
import { requireAuth, getStateParam } from './ui.js';
import { STATES_DATA } from './data/states.js';
import { avatarStackHTML } from './utils/avatarDisplay.js';
import DragMatch from './components/dragMatch.js';

// ── Auth guard ───────────────────────────────────────────────────────────────
const session = requireAuth();
if (!session) throw new Error('Not logged in');

// ── Load state ───────────────────────────────────────────────────────────────
const stateId = getStateParam();
const state   = STATES_DATA.find(s => s.id === stateId);

// ── Topbar ────────────────────────────────────────────────────────────────────
const topbar = document.getElementById('topbar');
if (topbar && state) {
  topbar.style.background = state.color;
  document.getElementById('topbar-title').textContent = state.name + ' — Match!';
  document.getElementById('topbar-back').href = `narrative.html?state=${stateId}`;
}

document.getElementById('topbar-pts').textContent    = `⭐ ${Storage.getPoints()} pts`;
document.getElementById('topbar-avatar').innerHTML = avatarStackHTML(session.avatarId);

// ── Build drag pairs for this state ───────────────────────────────────────────
// Each pair is { food, state } where "food" = the chip the player taps, and
// "state" = the descriptor label shown in the drop zone.
// Prefer the curated `dragPairs` authored per state in states.js; if a state
// has none yet, fall back to deriving pairs from its cards array so the game
// still works during development.
function buildPairs(stateData) {
  if (stateData?.dragPairs?.length) return stateData.dragPairs;
  if (!stateData?.cards?.length)    return [];

  // Fallback: turn up to 4 cards into { food, state } pairs.
  // The "food" chip shows the emoji + title; the "state" zone shows the category.
  return stateData.cards.slice(0, 4).map(card => ({
    food:  `${card.icon} ${card.title}`,
    state: card.category,
  }));
}

// ── Fallback pairs (if state has no cards or state not found) ─────────────────
// Uses iconic Malaysian food ↔ state pairings so the game still works during dev.
const FALLBACK_PAIRS = [
  { food: '🍜 Char Kway Teow', state: 'Penang'   },
  { food: '🏛️ A Famosa',       state: 'Melaka'   },
  { food: '⛰️ Batu Caves',      state: 'Selangor' },
  { food: '🎋 Johor Bahru',     state: 'Johor'    },
];

const pairs = state ? buildPairs(state) : FALLBACK_PAIRS;

// ── DOM references ────────────────────────────────────────────────────────────
const gameArea      = document.getElementById('act-game-area');
const completeEl    = document.getElementById('act-complete');
const scoreBadge    = document.getElementById('act-score');
const roundPill     = document.getElementById('act-round-pill');
const gameTitle     = document.getElementById('act-game-title');
const bubbleText    = document.getElementById('act-bubble-text');
const btnToQuiz     = document.getElementById('btn-to-quiz');

// ── Set up round pill + title ─────────────────────────────────────────────────
if (state) {
  // Find which round this state is (1-indexed position in STATES_DATA)
  const stateIdx = STATES_DATA.findIndex(s => s.id === stateId);
  roundPill.textContent = `Activity ${stateIdx + 1} of ${STATES_DATA.length}`;
  gameTitle.textContent = `${state.emoji?.includes('img') ? '🏳️' : ''} ${state.name} Match!`;
}

// ── Mascot bubble messages ─────────────────────────────────────────────────────
// Cycle through different encouraging messages as matches are made.
const BUBBLE_MESSAGES = [
  'Can you match each clue to the right state?',
  'Great start! Keep going!',
  'You\'re doing amazing!',
  'Almost there — just a few more!',
  '🎉 You matched them all! Brilliant!',
];

let matchCount = 0;

function onMatchMade() {
  matchCount++;
  scoreBadge.textContent = `${matchCount} matched`;

  // Update the mascot bubble progressively
  const msgIdx = Math.min(matchCount, BUBBLE_MESSAGES.length - 1);
  bubbleText.textContent = BUBBLE_MESSAGES[msgIdx];

  // Briefly highlight the score badge on each match
  scoreBadge.style.background = '#d4edda';
  setTimeout(() => { scoreBadge.style.background = ''; }, 500);
}

// ── Build game using DragMatch component ──────────────────────────────────────
if (!pairs.length) {
  gameArea.innerHTML = `
    <p style="text-align:center;color:var(--clr-text-muted);padding:var(--sp-xl)">
      No activity data available for this state yet. Check back soon!
    </p>`;
} else {
  // Patch onMatchMade into the DragMatch component's _dropOnZone.
  // We do this by extending the class so we don't modify the component file.
  const gameContainer = document.createElement('div');
  gameArea.innerHTML  = '';
  gameArea.appendChild(gameContainer);

  // Create game — the third argument is the onComplete callback
  const game = new DragMatch(gameContainer, pairs, onComplete);
  game.render();

  // Intercept each correct match to update the score badge.
  // DragMatch fires onComplete when ALL pairs are done, but we want
  // per-match feedback too. We observe the DOM for .correct-zone additions.
  const matchObserver = new MutationObserver(() => {
    const corrects = gameContainer.querySelectorAll('.correct-zone').length;
    if (corrects > matchCount) {
      onMatchMade();
    }
  });
  matchObserver.observe(gameContainer, { subtree: true, attributes: true, attributeFilter: ['class'] });
}

// ── Game completion handler ───────────────────────────────────────────────────
function onComplete() {
  // Mark the activity tab complete in Storage
  Storage.markCompleted(stateId || 'penang', 'activity');

  // Award bonus points for completing the activity
  const bonus = 20;
  Storage.addPoints(bonus);

  // Update quiz link to carry the state param
  if (btnToQuiz && stateId) {
    btnToQuiz.href = `quiz.html?state=${stateId}`;
  }

  // Update completion card text
  const sub = document.getElementById('act-complete-sub');
  if (sub) {
    sub.textContent = `You earned +${bonus} pts! Now try the quiz to earn your stamp!`;
  }

  // Show the completion overlay
  completeEl.classList.remove('hidden');

  // Update topbar points
  document.getElementById('topbar-pts').textContent = `⭐ ${Storage.getPoints()} pts`;
}
