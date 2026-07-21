/* guess.js — "Guess My State!" game page */

// Rounds shuffled from GUESS_ROUNDS. A wrong guess greys out that option and
// reveals the next clue (award steps down 20 → 15 → 10 → 5); a correct guess awards
// by the current clue and shows "Next Round". After all rounds → reward.html.

import Storage from './utils/storage.js';
import { renderTopbar, renderNavbar, requireAuth, showToast, flyPoints } from './ui.js';
import { GUESS_ROUNDS } from './data/guessRounds.js';
import { getState } from './data/states.js';
import { landmarkRoundFor } from './data/landmarkMissions.js';
import { paramsFor, currentLevel } from './data/difficulty.js';
import { renderMascot } from './data/mascots.js';
import { initHowToPlay } from './components/howToPlay.js';
import { launchContext } from './utils/launchContext.js';
import Sound from './utils/sound.js';

requireAuth();

/* Journey vs standalone */
// With ?state= (journey/mission) play that state's round then continue; without it
// (hub) play the full shuffled set and finish at reward. Hub mode shows all clues up front.
const journeyStateId = new URLSearchParams(location.search).get('state');
const journeyMode    = !!journeyStateId && GUESS_ROUNDS.some(r => r.answer === journeyStateId);
const hubMode = !journeyMode;

// Mission takes priority over journeyMode (both pass ?state=).
const { fromActivities, fromMission, missionId, missionsHref, missionsDoneHref } =
  launchContext(journeyStateId);

// The Tourist mission plays two rounds: the state, then the tourist's landmark wish.
const isTouristMission = fromMission && missionId === 'tourist';

/* Topbar & Navbar */
renderTopbar({
  title:      isTouristMission ? 'Help the Tourist!' : 'Guess My State!',
  showPoints: true,
  showBack:   journeyMode || fromActivities || fromMission,
  backHref:   fromMission    ? missionsHref
            : fromActivities ? 'activities.html'
            : journeyMode    ? `activity.html?state=${journeyStateId}`
            : 'map.html',
  color:      'linear-gradient(to right, #7c3aed, #9f67fa)',
});
renderNavbar('activities');   // reached from the Activities Hub

/* Game state */

// Shuffle a fresh copy (spread to avoid mutating the imported constant).
let rounds = journeyMode
  ? GUESS_ROUNDS.filter(r => r.answer === journeyStateId)
  : [...GUESS_ROUNDS].sort(() => Math.random() - 0.5);

// Tourist mission: after the state round, append the tourist's landmark wish.
if (isTouristMission) {
  const lmRound = landmarkRoundFor(journeyStateId);
  if (lmRound) rounds = [...rounds, lmRound];
}

// Difficulty tuning: Explorer = fewer choices, all clues; Adventurer = more choices, capped clues.
const gp = paramsFor('guess');

let roundIdx      = 0;   // which round we are on (0-based)
let hintsRevealed = 1;   // how many clues are currently visible (starts at 1)
let totalEarned   = 0;   // cumulative points earned across all rounds
let solved        = false; // true once the round is answered correctly

/* DOM references */
const roundLabelEl  = document.getElementById('guess-round-label');
const stripFillEl   = document.getElementById('guess-strip-fill');
const scoreDisplayEl = document.getElementById('guess-score-display');
const hintPointsEl  = document.getElementById('hints-points');
const hintTextEls   = [
  document.getElementById('hint-text-0'),
  document.getElementById('hint-text-1'),
  document.getElementById('hint-text-2'),
  document.getElementById('hint-text-3'),
];
const hintItemEls   = [
  document.getElementById('hint-0'),
  document.getElementById('hint-1'),
  document.getElementById('hint-2'),
  document.getElementById('hint-3'),
];
const optionsEl     = document.getElementById('guess-options');
const feedbackEl    = document.getElementById('guess-feedback');
const feedbackResult = document.getElementById('feedback-result');
const nextBtn       = document.getElementById('next-btn');
// Optional picture clue (round.image), revealed once every text clue is shown.
const clueImageEl   = document.getElementById('guess-clue-image');
const clueImageImg  = document.getElementById('guess-clue-image-img');

/* loadRound(idx) — set up all UI for round `idx` */
function loadRound(idx) {
  const round = rounds[idx];
  solved        = false;
  // Hub mode reveals the first 3 clues at once; journey/mission starts at clue 1.
  hintsRevealed = hubMode ? Math.min(3, round.hints.length) : 1;

  // Per-round framing: the state round vs the tourist's landmark round.
  const hintsTitleEl   = document.querySelector('.hints-title');
  const optionsLabelEl = document.querySelector('.options-label');
  if (hintsTitleEl)   hintsTitleEl.textContent   = round.title  || 'Who am I?';
  if (optionsLabelEl) {
    optionsLabelEl.textContent = round.prompt
      || (hubMode ? 'Which state am I? Read all the clues, then take your best guess!'
                  : 'Which state am I? Wrong guesses unlock more clues!');
  }

  /* Progress strip (fills by rounds completed, not the current one) */
  roundLabelEl.textContent  = `Round ${idx + 1} of ${rounds.length}`;
  stripFillEl.style.width   = `${Math.round((idx / rounds.length) * 100)}%`;

  // Write all hint texts up front (CSS .hidden controls visibility); guard undef.
  hintTextEls.forEach((el, i) => {
    el.textContent = round.hints[i] || '';
  });

  // Reset hint visibility to match hintsRevealed.
  hintItemEls.forEach((el, i) => el.classList.toggle('hidden', i >= hintsRevealed));

  // Points badge reflects the clues visible right now.
  hintPointsEl.textContent = `Worth ${round.pointValues[hintsRevealed - 1]} pts`;

  renderOptions(round);

  // Optional picture clue — hidden until the last hint is revealed.
  if (clueImageEl) {
    if (round.image && clueImageImg) {
      clueImageImg.src = round.image;
      clueImageEl.classList.add('hidden');
    } else {
      clueImageEl.classList.add('hidden');
    }
  }

  feedbackEl.classList.add('hidden');
  nextBtn.classList.remove('wiggle');
}

/* renderOptions(round) — build the choice buttons and wire their handlers */
function renderOptions(round) {
  // Keep the answer, trim to the difficulty's option count, then shuffle.
  const answer = round.options.find(o => o.id === round.answer);
  // Landmark rounds scale with grade (Explorer few, Adventurer all); state rounds use gp.options.
  const optCount = round.kind === 'landmark'
    ? (currentLevel() === 'explorer' ? 3 : round.options.length)
    : gp.options;
  const others = round.options
    .filter(o => o.id !== round.answer)
    .sort(() => Math.random() - 0.5)
    .slice(0, Math.max(0, optCount - 1));
  const opts = [answer, ...others].filter(Boolean).sort(() => Math.random() - 0.5);
  // State rounds show the state flag as each option's icon; landmark rounds keep the emoji.
  const isLandmark = round.kind === 'landmark';
  optionsEl.innerHTML = opts.map(opt => {
    const flag = isLandmark ? null : getState(opt.id)?.emoji;
    return `
    <button
      class="guess-option"
      type="button"
      data-id="${opt.id}"
      aria-label="Guess ${opt.name}"
    >
      <span class="option-icon" aria-hidden="true">${flag || opt.icon}</span>
      <span class="option-name">${opt.name}</span>
    </button>`;
  }).join('');

  optionsEl.querySelectorAll('.guess-option').forEach(btn => {
    btn.addEventListener('click', () => {
      evaluate(btn.dataset.id);
    });
  });
}

/* evaluate(chosenId) — check the guess, mark buttons, award points, show feedback */
function evaluate(chosenId) {
  if (solved) return;   // round already over

  const round = rounds[roundIdx];
  const btn   = optionsEl.querySelector(`.guess-option[data-id="${chosenId}"]`);
  if (!btn || btn.disabled) return;   // ignore already-eliminated options

  // Correct guess: award by the clue currently shown, end the round.
  if (chosenId === round.answer) {
    solved = true;
    const ptsEarned = round.pointValues[hintsRevealed - 1];

    btn.classList.add('correct', 'burst');
    optionsEl.querySelectorAll('.guess-option').forEach(b => { b.disabled = true; });

    Sound.correct();
    totalEarned += ptsEarned;
    // In the mission flow the flat +25 bonus is the only reward, so per-round
    // points aren't persisted (keeps a state worth exactly 100).
    if (!fromMission) Storage.addPoints(ptsEarned);
    scoreDisplayEl.textContent = `${totalEarned} pts earned`;
    flyPoints(scoreDisplayEl, ptsEarned);   // "+N" floats up from the score

    feedbackResult.textContent = `Correct! +${ptsEarned} pts`;
    feedbackResult.style.color = 'var(--clr-green)';
    feedbackEl.classList.remove('hidden');
    nextBtn.classList.add('wiggle');        // invite the tap to continue
    return;
  }

  // Wrong guess: grey out this option, reveal the next clue, keep trying.
  Sound.wrong();
  btn.classList.add('wrong');
  btn.disabled = true;

  // Hub mode already showed every clue — just nudge them to try again.
  if (hubMode) {
    showToast('Keep trying — you can do it! 💪');
    return;
  }

  if (hintsRevealed < Math.min(round.hints.length, gp.maxClues)) {
    const revealedIdx = hintsRevealed;   // index of the hint just revealed
    hintItemEls[hintsRevealed].classList.remove('hidden');
    hintsRevealed++;
    hintPointsEl.textContent = `Worth ${round.pointValues[hintsRevealed - 1]} pts`;
    showToast('Not quite — here\'s another clue! 🔍');

    // The last text clue just went up — reveal the optional picture clue too.
    if (revealedIdx === round.hints.length - 1 && round.image && clueImageEl) {
      clueImageEl.classList.remove('hidden');
    }
  } else {
    // All clues already shown; just nudge them to try the ones left.
    showToast('Keep trying — you can do it! 💪');
  }
}

/* Next Round button */
nextBtn.addEventListener('click', () => {
  roundIdx++;

  if (roundIdx < rounds.length) {
    loadRound(roundIdx);
  } else if (fromMission) {
    window.location.href = missionsDoneHref;      // mission done → hub
  } else if (journeyMode) {
    window.location.href = `quiz.html?state=${journeyStateId}`;   // journey → quiz
  } else if (fromActivities) {
    window.location.href = 'activities.html';     // replay → hub
  } else {
    // Standalone complete → reward screen (mode + earned drive its summary).
    const params = new URLSearchParams({
      mode:   'guess',
      earned: totalEarned,
    });
    window.location.href = `reward.html?${params}`;
  }
});

/* Kick off the first round */
loadRound(0);

// Tourist mission: Rimau slides in to ask the child to guide the tourist.
if (isTouristMission) {
  const introEl  = document.getElementById('guess-intro');
  const mascotEl = document.getElementById('guess-intro-mascot');
  const btnEl    = document.getElementById('guess-intro-btn');
  if (introEl && mascotEl && btnEl) {
    renderMascot(mascotEl, 'wave');
    introEl.classList.remove('hidden');
    requestAnimationFrame(() => introEl.classList.add('show'));
    btnEl.addEventListener('click', () => {
      Sound.tap?.();
      introEl.classList.remove('show');
      setTimeout(() => introEl.classList.add('hidden'), 260);
    });
  }
}

/* Kid-friendly "How to Play" (first visit + a "?" button to re-open) */
initHowToPlay('guess', {
  title: 'Guess My State!', emoji: '🗺️',
  lines: ['🔍 Read the clues one by one.', '👆 Tap the state you think it is.', '⚡ Guess early to win more points!'],
});
