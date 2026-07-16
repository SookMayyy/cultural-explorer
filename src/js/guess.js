// js/guess.js — "Guess My State!" game page
//
// Game flow summary:
//   1. 7 rounds, shuffled from GUESS_ROUNDS data. Each round has 5 options.
//   2. Clue 1 shows first (worth 20 pts). A WRONG guess greys out that option
//      AND reveals the next clue, so the child keeps trying with more help —
//      the award steps down 20 → 15 → 10 → 5. They keep guessing until correct
//      (never stuck; a wrong guess always removes one option and adds a clue).
//   3. A CORRECT guess highlights green, awards points by the current clue, and
//      reveals the "Next Round →" button.
//   4. After all 7 rounds: redirect to reward.html?mode=guess&earned=X.

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

// ── Auth guard: redirect to home.html if not logged in ───────────────────────
requireAuth();

// ── Journey vs standalone ─────────────────────────────────────────────────────
// When reached via ?state= (the per-state journey), play ONLY that state's round
// then continue to the quiz. Without ?state= (opened from elsewhere), play the
// full shuffled set and finish at the reward screen.
const journeyStateId = new URLSearchParams(location.search).get('state');
const journeyMode    = !!journeyStateId && GUESS_ROUNDS.some(r => r.answer === journeyStateId);

// The pure ACTIVITY-HUB play (the full shuffled set, no ?state=) shows all of
// its clues up front instead of the per-state journey's progressive reveal —
// there's no "next round" narrative context to build suspense for, so the
// child gets every clue at once. journeyMode already covers BOTH the per-state
// journey AND the Tourist mission (both pass ?state=), so !journeyMode is the
// correct check for "standalone hub play".
const hubMode = !journeyMode;

// Mission takes priority over journeyMode (both pass ?state=).
const { fromActivities, fromMission, missionId, missionsHref, missionsDoneHref } =
  launchContext(journeyStateId);

// The Tourist mission plays TWO rounds: guess the state, then guess which
// famous landmark the tourist wants to visit.
const isTouristMission = fromMission && missionId === 'tourist';

// ── Topbar & Navbar ───────────────────────────────────────────────────────────
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

// ══════════════════════════════════════════════════════════════════════════════
//  GAME STATE
// ══════════════════════════════════════════════════════════════════════════════

// Shuffle a fresh copy so the order changes each session.
// We spread into a new array to avoid mutating the imported constant.
let rounds = journeyMode
  ? GUESS_ROUNDS.filter(r => r.answer === journeyStateId)
  : [...GUESS_ROUNDS].sort(() => Math.random() - 0.5);

// Tourist mission: after the state round, append the tourist's landmark wish.
if (isTouristMission) {
  const lmRound = landmarkRoundFor(journeyStateId);
  if (lmRound) rounds = [...rounds, lmRound];
}

// Difficulty tuning: Explorer shows fewer state choices but lets every clue be
// revealed (more help); Adventurer shows more choices and caps the clues so the
// child must commit sooner.
const gp = paramsFor('guess');

let roundIdx      = 0;   // which round we are on (0-based)
let hintsRevealed = 1;   // how many clues are currently visible (starts at 1)
let totalEarned   = 0;   // cumulative points earned across all rounds
let solved        = false; // true once the round is answered correctly

// ── DOM references ────────────────────────────────────────────────────────────
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
// Optional picture clue (round.image) — a photo the child already saw during
// that state's mission. Revealed once every text clue has been shown, as a
// last "does this match?" visual check. Rounds without an image are unaffected.
const clueImageEl   = document.getElementById('guess-clue-image');
const clueImageImg  = document.getElementById('guess-clue-image-img');

// ══════════════════════════════════════════════════════════════════════════════
//  loadRound(idx)
//  Sets up all UI for round `idx`: hint texts, visibility, buttons, options.
// ══════════════════════════════════════════════════════════════════════════════
function loadRound(idx) {
  const round = rounds[idx];
  solved        = false;
  // Hub mode: reveal the first 3 clues right away and never add more (there's
  // no wrong-guess reveal to build up to). Journey/mission mode keeps the
  // original progressive reveal, starting from just clue 1.
  hintsRevealed = hubMode ? Math.min(3, round.hints.length) : 1;

  // ── Per-round framing ─────────────────────────────────────────────────────
  // The state round asks "Who am I? / Which state am I?"; the tourist's landmark
  // round (round.title/prompt set) asks where the tourist wants to go.
  const hintsTitleEl   = document.querySelector('.hints-title');
  const optionsLabelEl = document.querySelector('.options-label');
  if (hintsTitleEl)   hintsTitleEl.textContent   = round.title  || 'Who am I?';
  if (optionsLabelEl) {
    optionsLabelEl.textContent = round.prompt
      || (hubMode ? 'Which state am I? Read all the clues, then take your best guess!'
                  : 'Which state am I? Wrong guesses unlock more clues!');
  }

  // ── Progress strip ──────────────────────────────────────────────────────────
  roundLabelEl.textContent  = `Round ${idx + 1} of ${rounds.length}`;
  // Fill the bar proportionally to rounds completed so far (not the current one)
  stripFillEl.style.width   = `${Math.round((idx / rounds.length) * 100)}%`;

  // ── Hint texts ──────────────────────────────────────────────────────────────
  // Write all texts to the DOM up front; CSS .hidden controls visibility. Rounds
  // may carry fewer than 4 hints (landmark round has 3), so guard against undef.
  hintTextEls.forEach((el, i) => {
    el.textContent = round.hints[i] || '';
  });

  // Reset hint visibility to match hintsRevealed: journey/mission mode starts
  // with only clue 1 shown; hub mode starts with clues 1-3 all shown at once.
  hintItemEls.forEach((el, i) => el.classList.toggle('hidden', i >= hintsRevealed));

  // ── Points badge ─────────────────────────────────────────────────────────
  // Reflects however many clues are visible right now — pointValues[0] before
  // any clue is revealed (journey mode), or pointValues[2] when hub mode has
  // already shown all 3 clues up front.
  hintPointsEl.textContent = `Worth ${round.pointValues[hintsRevealed - 1]} pts`;

  // ── Options ───────────────────────────────────────────────────────────────
  renderOptions(round);

  // ── Optional picture clue — hidden again until the last hint is revealed ──
  if (clueImageEl) {
    if (round.image && clueImageImg) {
      clueImageImg.src = round.image;
      clueImageEl.classList.add('hidden');
    } else {
      clueImageEl.classList.add('hidden');
    }
  }

  // ── Feedback ──────────────────────────────────────────────────────────────
  feedbackEl.classList.add('hidden');
  nextBtn.classList.remove('wiggle');
}

// ══════════════════════════════════════════════════════════════════════════════
//  renderOptions(round)
//  Builds the three state-choice buttons and wires their click handlers.
// ══════════════════════════════════════════════════════════════════════════════
function renderOptions(round) {
  // Trim to the difficulty's option count — always keeping the correct answer —
  // then shuffle so it isn't always in the same spot. Fewer options = easier.
  const answer = round.options.find(o => o.id === round.answer);
  // The landmark round scales with grade: Explorer chooses from a few spots,
  // older grades (Adventurer+) from all of them. State rounds keep the
  // difficulty's normal option count.
  const optCount = round.kind === 'landmark'
    ? (currentLevel() === 'explorer' ? 3 : round.options.length)
    : gp.options;
  const others = round.options
    .filter(o => o.id !== round.answer)
    .sort(() => Math.random() - 0.5)
    .slice(0, Math.max(0, optCount - 1));
  const opts = [answer, ...others].filter(Boolean).sort(() => Math.random() - 0.5);
  // State rounds show the real state FLAG as each option's icon (image-based
  // guessing — "which flag am I?"); landmark rounds keep their emoji icon.
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

  // Attach click listeners to the freshly rendered buttons.
  // We do this here (not via delegation) so each button knows its own id.
  optionsEl.querySelectorAll('.guess-option').forEach(btn => {
    btn.addEventListener('click', () => {
      evaluate(btn.dataset.id);
    });
  });
}

// ══════════════════════════════════════════════════════════════════════════════
//  evaluate(chosenId)
//  Checks the guess, marks buttons correct/wrong, awards points, shows feedback.
// ══════════════════════════════════════════════════════════════════════════════
function evaluate(chosenId) {
  // Round is over once solved — ignore further taps.
  if (solved) return;

  const round = rounds[roundIdx];
  const btn   = optionsEl.querySelector(`.guess-option[data-id="${chosenId}"]`);
  if (!btn || btn.disabled) return;   // ignore already-eliminated options

  // ── Correct guess: award by the clue currently shown, end the round ─────────
  if (chosenId === round.answer) {
    solved = true;
    const ptsEarned = round.pointValues[hintsRevealed - 1];

    btn.classList.add('correct', 'burst');
    optionsEl.querySelectorAll('.guess-option').forEach(b => { b.disabled = true; });

    Sound.correct();
    totalEarned += ptsEarned;
    // In the mission flow the flat +25 mission bonus is the only reward, so the
    // per-round points are NOT persisted (keeps a state worth exactly 100).
    if (!fromMission) Storage.addPoints(ptsEarned);
    scoreDisplayEl.textContent = `${totalEarned} pts earned`;
    flyPoints(scoreDisplayEl, ptsEarned);   // "+N" floats up from the score

    feedbackResult.textContent = `Correct! +${ptsEarned} pts`;
    feedbackResult.style.color = 'var(--clr-green)';
    feedbackEl.classList.remove('hidden');
    nextBtn.classList.add('wiggle');        // invite the tap to continue
    return;
  }

  // ── Wrong guess: grey out this option, reveal the next clue, keep trying ─────
  Sound.wrong();
  btn.classList.add('wrong');
  btn.disabled = true;

  // Hub mode already showed every clue it's going to show up front — no more
  // to reveal, so just nudge the child to try again with what they've got.
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

// ══════════════════════════════════════════════════════════════════════════════
//  Next Round button
// ══════════════════════════════════════════════════════════════════════════════
nextBtn.addEventListener('click', () => {
  roundIdx++;

  if (roundIdx < rounds.length) {
    // Advance to the next round.
    loadRound(roundIdx);
  } else if (fromMission) {
    // Mission (Help the Tourist) — return to the Mission Hub, marking it done.
    window.location.href = missionsDoneHref;
  } else if (journeyMode) {
    // Per-state journey — continue to the state's quiz.
    window.location.href = `quiz.html?state=${journeyStateId}`;
  } else if (fromActivities) {
    // Replay from the hub — return to the Activities tab.
    window.location.href = 'activities.html';
  } else {
    // Standalone game complete — head to the reward screen.
    // We pass mode=guess so reward.html can show a guess-specific summary,
    // and earned=X so it can display and save the final score.
    const params = new URLSearchParams({
      mode:   'guess',
      earned: totalEarned,
    });
    window.location.href = `reward.html?${params}`;
  }
});

// ── Kick off the first round ─────────────────────────────────────────────────
loadRound(0);

// Tourist mission: after the landmark tour, Rimau slides in from the left and
// asks the child to guide the tourist — then the guessing begins.
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

// ── Kid-friendly "How to Play" (first visit + a "?" button to re-open) ────────
initHowToPlay('guess', {
  title: 'Guess My State!', emoji: '🗺️',
  lines: ['🔍 Read the clues one by one.', '👆 Tap the state you think it is.', '⚡ Guess early to win more points!'],
});
