/* activity.js — "Match the Culture!" activity page */

// Builds 3–4 drag-match pairs from the current state's cards and runs the DragMatch
// component. On completion, shows an overlay and links on to Guess My State.

import Storage from './utils/storage.js';
import { requireAuth, getStateParam, renderTopbar, renderNavbar } from './ui.js';
import { STATES_DATA } from './data/states.js';
import DragMatch from './components/dragMatch.js';
import Sound from './utils/sound.js';
import { renderMascot, setMascotPose } from './data/mascots.js';
import { initHowToPlay } from './components/howToPlay.js';
import { restartAnimation, escapeHtml } from './utils/dom.js';
import { launchContext } from './utils/launchContext.js';

const session = requireAuth();
if (!session) throw new Error('Not logged in');

/* Load state */
const stateId = getStateParam();
const state   = STATES_DATA.find(s => s.id === stateId);

/* Launch context (journey: back + CTA advance to the next game) */
const { fromActivities, fromMission, missionsHref, missionsDoneHref } = launchContext(stateId);
const activitiesHref = `activities.html${stateId ? `?state=${stateId}` : ''}`;
// From the hub, back undoes one step to the state picker (matches scramble/quiz).
const pickerHref = 'activity-states.html?game=dragmatch';

/* Shared chrome */
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

/* Build drag pairs — prefer curated dragPairs, else derive from cards */
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

/* HUD: progress bar initial state */
const matchedText  = document.getElementById('act-matched-text');
const progressFill = document.getElementById('act-progress-fill');

if (matchedText)  matchedText.textContent = `0 / ${totalPairs} MATCHED`;
if (progressFill) progressFill.style.width = '0%';

/* Mascot corner (Rimau) */
const mascotFig = document.getElementById('act-mascot-fig');
if (mascotFig) renderMascot(mascotFig, 'happy');

const bubbleText = document.getElementById('act-bubble-text');

// Mascot bubble messages — cycle on each correct match.
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

  if (matchedText)  matchedText.textContent = `${matchCount} / ${totalPairs} MATCHED`;
  if (progressFill) progressFill.style.width = `${(matchCount / totalPairs) * 100}%`;

  restartAnimation(mascotFig, 'react-happy');

  const msgIdx = Math.min(matchCount, BUBBLE_MESSAGES.length - 1);
  if (bubbleText) bubbleText.textContent = BUBBLE_MESSAGES[msgIdx];
}

/* DOM references */
const gameArea   = document.getElementById('act-game-area');
const completeEl = document.getElementById('act-complete');
const btnToQuiz  = document.getElementById('btn-to-quiz');

/* Build game via DragMatch component */
if (!pairs.length) {
  gameArea.innerHTML = `
    <p style="text-align:center;color:var(--clr-text-muted);padding:var(--sp-xl)">
      No activity data available for this state yet. Check back soon!
    </p>`;
} else {
  const gameContainer = document.createElement('div');
  gameArea.innerHTML  = '';
  gameArea.appendChild(gameContainer);

  const game = new DragMatch(gameContainer, pairs, onComplete, {
    title:      'MATCH THE TREASURE!',
    colHeading: 'TREASURES',
  });
  game.render();

  // DragMatch only fires onComplete at the end, so watch .correct-zone additions
  // for the per-match mascot reaction and progress bar.
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

/* Game completion handler */
function onComplete() {
  Storage.markCompleted(stateId || 'penang', 'activity');

  // In the mission flow the flat +25 bonus is the only reward, so the per-game
  // bonus isn't persisted (keeps a state worth exactly 100).
  const bonus = 20;
  if (!fromMission) Storage.addPoints(bonus);

  // Primary CTA: back to mission/hub when replaying, else on to Guess My State.
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

  const sub = document.getElementById('act-complete-sub');
  if (sub) {
    sub.textContent = (fromMission || fromActivities)
      ? `You earned +${bonus} pts! Nice match 🎉`
      : `You earned +${bonus} pts! Next up: Guess My State 🔍`;
  }

  if (mascotFig) setMascotPose(mascotFig, 'cheer');   // Rimau celebrates

  Sound.unlock();
  completeEl.classList.remove('hidden');
}

/* Kid-friendly "How to Play" — the demo uses a real pair from this round */
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
