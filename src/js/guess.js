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
import Sound from './utils/sound.js';

// ── Auth guard: redirect to home.html if not logged in ───────────────────────
requireAuth();

// ── Journey vs standalone ─────────────────────────────────────────────────────
// When reached via ?state= (the per-state journey), play ONLY that state's round
// then continue to the quiz. Without ?state= (opened from elsewhere), play the
// full shuffled set and finish at the reward screen.
const journeyStateId = new URLSearchParams(location.search).get('state');
const journeyMode    = !!journeyStateId && GUESS_ROUNDS.some(r => r.answer === journeyStateId);

// ── Topbar & Navbar ───────────────────────────────────────────────────────────
renderTopbar({
  title:      'Guess My State!',
  showPoints: true,
  showBack:   journeyMode,
  backHref:   journeyMode ? `activity.html?state=${journeyStateId}` : 'map.html',
  color:      'linear-gradient(to right, #7c3aed, #9f67fa)',
});
renderNavbar();   // no active item — guess isn't in the nav, that's fine

// ══════════════════════════════════════════════════════════════════════════════
//  GAME STATE
// ══════════════════════════════════════════════════════════════════════════════

// Shuffle a fresh copy so the order changes each session.
// We spread into a new array to avoid mutating the imported constant.
const rounds = journeyMode
  ? GUESS_ROUNDS.filter(r => r.answer === journeyStateId)
  : [...GUESS_ROUNDS].sort(() => Math.random() - 0.5);

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

// ══════════════════════════════════════════════════════════════════════════════
//  loadRound(idx)
//  Sets up all UI for round `idx`: hint texts, visibility, buttons, options.
// ══════════════════════════════════════════════════════════════════════════════
function loadRound(idx) {
  const round = rounds[idx];
  solved        = false;
  hintsRevealed = 1;

  // ── Progress strip ──────────────────────────────────────────────────────────
  roundLabelEl.textContent  = `Round ${idx + 1} of ${rounds.length}`;
  // Fill the bar proportionally to rounds completed so far (not the current one)
  stripFillEl.style.width   = `${Math.round((idx / rounds.length) * 100)}%`;

  // ── Hint texts ──────────────────────────────────────────────────────────────
  // Write all three texts to the DOM up front; CSS .hidden controls visibility.
  hintTextEls.forEach((el, i) => {
    el.textContent = round.hints[i];
  });

  // Reset: only hint-0 (clue 1) is visible at the start of each round.
  hintItemEls[0].classList.remove('hidden');
  hintItemEls[1].classList.add('hidden');
  hintItemEls[2].classList.add('hidden');
  hintItemEls[3].classList.add('hidden');

  // ── Points badge ─────────────────────────────────────────────────────────
  // pointValues[0] is the max for this round before any clue is revealed.
  hintPointsEl.textContent = `Worth ${round.pointValues[0]} pts`;

  // ── Options ───────────────────────────────────────────────────────────────
  renderOptions(round);

  // ── Feedback ──────────────────────────────────────────────────────────────
  feedbackEl.classList.add('hidden');
  nextBtn.classList.remove('wiggle');
}

// ══════════════════════════════════════════════════════════════════════════════
//  renderOptions(round)
//  Builds the three state-choice buttons and wires their click handlers.
// ══════════════════════════════════════════════════════════════════════════════
function renderOptions(round) {
  // Shuffle a copy so the correct answer isn't always in the same spot.
  const opts = [...round.options].sort(() => Math.random() - 0.5);
  optionsEl.innerHTML = opts.map(opt => `
    <button
      class="guess-option"
      type="button"
      data-id="${opt.id}"
      aria-label="Guess ${opt.name}"
    >
      <span class="option-icon" aria-hidden="true">${opt.icon}</span>
      <span class="option-name">${opt.name}</span>
    </button>
  `).join('');

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
    Storage.addPoints(ptsEarned);
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

  if (hintsRevealed < round.hints.length) {
    hintItemEls[hintsRevealed].classList.remove('hidden');
    hintsRevealed++;
    hintPointsEl.textContent = `Worth ${round.pointValues[hintsRevealed - 1]} pts`;
    showToast('Not quite — here\'s another clue! 🔍');
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
  } else if (journeyMode) {
    // Per-state journey — continue to the state's quiz.
    window.location.href = `quiz.html?state=${journeyStateId}`;
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
