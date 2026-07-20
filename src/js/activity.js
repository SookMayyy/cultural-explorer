// js/activity.js — "Match the Culture!" activity page
//
// Pulls the current state from Storage/URL, builds 3–4 drag-match pairs
// from that state's cards, then uses the DragMatch component to run the game.
// On completion, shows a congratulation overlay and links to Guess My State.

import Storage from './utils/storage.js';
import { requireAuth, getStateParam, renderTopbar, renderNavbar } from './ui.js';
import { STATES_DATA } from './data/states.js';
import DragMatch from './components/dragMatch.js';
import Sound from './utils/sound.js';
import { renderMascot, setMascotPose } from './data/mascots.js';
import { initHowToPlay } from './components/howToPlay.js';
import { restartAnimation, escapeHtml } from './utils/dom.js';
import { launchContext } from './utils/launchContext.js';

// ── Auth guard ────────────────────────────────────────────────────────────────
const session = requireAuth();
if (!session) throw new Error('Not logged in');

// ── Load state ────────────────────────────────────────────────────────────────
const stateId = getStateParam();
const state   = STATES_DATA.find(s => s.id === stateId);

// ── Launch context ────────────────────────────────────────────────────────────
// In the linear journey the back button + completion CTA advance to the next
// journey game rather than returning to a hub.
const { fromActivities, fromMission, missionsHref, missionsDoneHref } = launchContext(stateId);
const activitiesHref = `activities.html${stateId ? `?state=${stateId}` : ''}`;
// Reached from the Activities hub, the player picked a game and THEN a state.
// Back should undo one step — return to the state picker for this game, not all
// the way out to the hub. Matches scramble.js and quiz.js.
const pickerHref = 'activity-states.html?game=dragmatch';

// ── Shared chrome ─────────────────────────────────────────────────────────────
renderTopbar({
  title:      'Match the Culture!',
  showBack:   true,
  backHref:   fromMission    ? missionsHref
            : fromActivities ? pickerHref
            : stateId        ? `narrative.html?state=${stateId}`
            : 'map.html',
  showPoints: true,
});
renderNavbar('activities');

// ── Build drag pairs for this state ──────────────────────────────────────────
// Prefer the curated dragPairs authored per state in states.js; fall back to
// deriving pairs from cards so the game still works during development.
function buildPairs(stateData) {
  if (stateData?.dragPairs?.length) return stateData.dragPairs;
  if (!stateData?.cards?.length)    return [];
  return stateData.cards.slice(0, 4).map(card => ({
    food:  `${card.icon} ${card.title}`,
    state: card.category,
  }));
}

const FALLBACK_PAIRS = [
  { food: '🍜 Char Kway Teow', state: 'Penang'   },
  { food: '⛰️ Batu Caves',      state: 'Selangor' },
  { food: '🎭 Wayang Kulit',    state: 'Kelantan' },
  { food: '🏔️ Mount Kinabalu',  state: 'Sabah'    },
];

const pairs      = state ? buildPairs(state) : FALLBACK_PAIRS;
const totalPairs = pairs.length;

// ── HUD: progress bar initial state ──────────────────────────────────────────
const matchedText  = document.getElementById('act-matched-text');
const progressFill = document.getElementById('act-progress-fill');

if (matchedText)  matchedText.textContent = `0 / ${totalPairs} MATCHED`;
if (progressFill) progressFill.style.width = '0%';

// ── Mascot corner (Rimau) ─────────────────────────────────────────────────────
const mascotFig = document.getElementById('act-mascot-fig');
// renderMascot() swaps the emoji placeholder for the real PNG (with emoji fallback).
if (mascotFig) renderMascot(mascotFig, 'happy');

const bubbleText = document.getElementById('act-bubble-text');

// ── Mascot bubble messages — cycle on each correct match ──────────────────────
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
  Sound.correct();

  // Update HUD progress bar and matched counter
  if (matchedText)  matchedText.textContent = `${matchCount} / ${totalPairs} MATCHED`;
  if (progressFill) progressFill.style.width = `${(matchCount / totalPairs) * 100}%`;

  restartAnimation(mascotFig, 'react-happy');

  // Cycle the mascot bubble message as the player progresses
  const msgIdx = Math.min(matchCount, BUBBLE_MESSAGES.length - 1);
  if (bubbleText) bubbleText.textContent = BUBBLE_MESSAGES[msgIdx];
}

// ── DOM references ────────────────────────────────────────────────────────────
const gameArea   = document.getElementById('act-game-area');
const completeEl = document.getElementById('act-complete');
const btnToQuiz  = document.getElementById('btn-to-quiz');

// ── Build game via DragMatch component ────────────────────────────────────────
if (!pairs.length) {
  gameArea.innerHTML = `
    <p style="text-align:center;color:var(--clr-text-muted);padding:var(--sp-xl)">
      No activity data available for this state yet. Check back soon!
    </p>`;
} else {
  const gameContainer = document.createElement('div');
  gameArea.innerHTML  = '';
  gameArea.appendChild(gameContainer);

  // Pass the title as an option so future mission themes can override it.
  const game = new DragMatch(gameContainer, pairs, onComplete, {
    title:      'MATCH THE TREASURE!',
    colHeading: 'TREASURES',
  });
  game.render();

  // Watch for .correct-zone class additions to trigger per-match feedback.
  // DragMatch only fires onComplete when ALL pairs are done; we need the
  // per-match mascot reactions and progress bar updates too.
  const matchObserver = new MutationObserver(() => {
    const corrects = gameContainer.querySelectorAll('.correct-zone').length;
    if (corrects > matchCount) {
      onMatchMade();
    }
  });
  matchObserver.observe(gameContainer, {
    subtree:         true,
    attributes:      true,
    attributeFilter: ['class'],
  });
}

// ── Game completion handler ───────────────────────────────────────────────────
function onComplete() {
  // Persist progress
  Storage.markCompleted(stateId || 'penang', 'activity');

  // In the mission flow the flat +25 mission bonus is the only reward, so the
  // per-game bonus is NOT persisted (keeps a state worth exactly 100).
  const bonus = 20;
  if (!fromMission) Storage.addPoints(bonus);

  // Wire the primary CTA: back to the mission / hub when replaying, otherwise
  // advance the journey to the Guess My State game.
  if (btnToQuiz) {
    if (fromMission) {
      btnToQuiz.href = missionsDoneHref;
      btnToQuiz.textContent = '✅ Mission Complete!';
    } else if (fromActivities) {
      btnToQuiz.href = activitiesHref;
      btnToQuiz.textContent = '🎮 Back to Activities';
    } else if (stateId) {
      btnToQuiz.href = `guess.html?state=${stateId}`;
    }
  }

  // Update completion card subtitle
  const sub = document.getElementById('act-complete-sub');
  if (sub) {
    sub.textContent = (fromMission || fromActivities)
      ? `You earned +${bonus} pts! Nice match 🎉`
      : `You earned +${bonus} pts! Next up: Guess My State 🔍`;
  }

  // The topbar's points pill refreshes itself off the `ce:points` event that
  // Storage.addPoints fires, so there is nothing to update by hand here.

  // Rimau celebrates
  if (mascotFig) setMascotPose(mascotFig, 'cheer');

  Sound.unlock();
  completeEl.classList.remove('hidden');
}

// ── Kid-friendly "How to Play" (first visit + a "?" button to re-open) ────────
// This mounts the single floating "?" button (howToPlay.js) that re-opens the
// illustrated instructions — the previous separate hint button was removed.
// The demo uses a real pair from THIS round, so the child sees the actual
// treasure they are about to match rather than a generic example.
const demoPair  = pairs[0] || {};
const demoLabel = demoPair.label || demoPair.food || 'Treasure';
const demoZone  = demoPair.match || demoPair.state || 'Its matching clue';
const demoEmoji = demoPair.icon || '🧩';

const DEMO_HTML = `
  <div class="dm-demo" aria-hidden="true">
    <span class="dm-demo-chip">
      <span class="dm-demo-chip-emoji">${demoEmoji}</span>${escapeHtml(demoLabel)}
    </span>
    <span class="dm-demo-zone">
      ${escapeHtml(demoZone)}
      <span class="dm-demo-tick">✓</span>
    </span>
  </div>`;

initHowToPlay('activity', {
  title: 'Match the Culture!', emoji: '🧩',
  topHtml: DEMO_HTML,
  lines: ['👆 Tap a card on the left.', '➡️ Then tap the box it matches.', '✅ Match them all to win!'],
});
