// js/activity.js — "Match the Culture!" activity page
//
// Pulls the current state from Storage/URL, builds 3–4 drag-match pairs
// from that state's cards, then uses the DragMatch component to run the game.
// On completion, shows a congratulation overlay and links to Guess My State.
//
// Visual updates (Figma frame 226:323):
//   • No orange topbar — replaced by a HUD bar in the HTML (act-hud).
//   • Progress pill (act-matched-text) + gold bar (act-progress-fill) in HUD.
//   • Points pill (act-points-val) in HUD.
//   • Rimau mascot corner (act-mascot-corner) with a speech bubble.
//   • DragMatch options.title is passed so the heading can be re-skinned.

import Storage from './utils/storage.js';
import { requireAuth, getStateParam } from './ui.js';
import { STATES_DATA } from './data/states.js';
import DragMatch from './components/dragMatch.js';
import Sound from './utils/sound.js';
import { renderMascot, setMascotPose } from './data/mascots.js';
import { initHowToPlay } from './components/howToPlay.js';

// ── Auth guard ────────────────────────────────────────────────────────────────
const session = requireAuth();
if (!session) throw new Error('Not logged in');

// ── Load state ────────────────────────────────────────────────────────────────
const stateId = getStateParam();
const state   = STATES_DATA.find(s => s.id === stateId);

// ── Launch context ────────────────────────────────────────────────────────────
// Reached from the Activities Hub (replay), from a Mission (Help the Chef), or
// the linear journey. From the hub / a mission, the back button + completion CTA
// return there instead of advancing to the next journey game.
const _params = new URLSearchParams(location.search);
const fromActivities = _params.get('from') === 'activities';
const fromMission    = _params.get('from') === 'mission';
const missionId      = _params.get('mission');
const activitiesHref   = `activities.html${stateId ? `?state=${stateId}` : ''}`;
const missionsHref     = `missions.html?state=${stateId}`;
// Finishing a mission returns into the Mission Flow's Reward stage.
const missionsDoneHref = `mission.html?state=${stateId}&mission=${missionId}&stage=reward`;

// ── HUD: back pill ────────────────────────────────────────────────────────────
const backPill = document.getElementById('act-back');
if (backPill) {
  if (fromMission) {
    backPill.href = missionsHref;
    backPill.textContent = '🏰 BACK TO MISSIONS';
  } else if (fromActivities) {
    backPill.href = activitiesHref;
    backPill.textContent = '🎮 BACK TO ACTIVITIES';
  } else if (stateId) {
    backPill.href = `narrative.html?state=${stateId}`;
  }
}

// ── HUD: points pill ──────────────────────────────────────────────────────────
const pointsVal = document.getElementById('act-points-val');
if (pointsVal) pointsVal.textContent = Storage.getPoints().toLocaleString();

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

  // Rimau reacts happily
  if (mascotFig) {
    mascotFig.classList.remove('react-happy');
    void mascotFig.offsetWidth;          // trigger reflow to restart the animation
    mascotFig.classList.add('react-happy');
  }

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
  // Persist progress — these calls are unchanged from the original
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

  // Refresh points pill
  if (pointsVal) pointsVal.textContent = Storage.getPoints().toLocaleString();

  // Rimau celebrates
  if (mascotFig) setMascotPose(mascotFig, 'cheer');

  Sound.unlock();
  completeEl.classList.remove('hidden');
}

// ── Kid-friendly "How to Play" (first visit + a "?" button to re-open) ────────
// This mounts the single floating "?" button (howToPlay.js) that re-opens the
// illustrated instructions — the previous separate hint button was removed.
initHowToPlay('activity', {
  title: 'Match the Culture!', emoji: '🧩',
  lines: ['👆 Tap a card on the left.', '➡️ Then tap the box it matches.', '✅ Match them all to win!'],
});
