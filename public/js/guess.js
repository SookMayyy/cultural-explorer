// js/guess.js — "Guess My State!" game page
//
// Game flow summary:
//   1. 7 rounds, shuffled from GUESS_ROUNDS data.
//   2. Each round: Hint 1 visible (worth 30 pts). Player can guess OR reveal
//      more hints (each reveal drops max points by 10).
//   3. After a guess: show correct/wrong highlight, update score, reveal
//      feedback row with "Next Round →" button.
//   4. After all 7 rounds: redirect to reward.html?mode=guess&earned=X.

import Storage from './utils/storage.js';
import { renderTopbar, renderNavbar, requireAuth } from './ui.js';
import { GUESS_ROUNDS } from './data/guessRounds.js';

// ── Auth guard: redirect to home.html if not logged in ───────────────────────
requireAuth();

// ── Topbar & Navbar ───────────────────────────────────────────────────────────
renderTopbar({
  title:      'Guess My State!',
  showPoints: true,
  color:      'linear-gradient(to right, #7c3aed, #9f67fa)',
});
renderNavbar();   // no active item — guess isn't in the nav, that's fine

// ══════════════════════════════════════════════════════════════════════════════
//  GAME STATE
// ══════════════════════════════════════════════════════════════════════════════

// Shuffle a fresh copy so the order changes each session.
// We spread into a new array to avoid mutating the imported constant.
const rounds = [...GUESS_ROUNDS].sort(() => Math.random() - 0.5);

let roundIdx      = 0;   // which round we are on (0-based)
let hintsRevealed = 1;   // how many hints are currently visible (starts at 1)
let totalEarned   = 0;   // cumulative points earned across all rounds
let answered      = false; // guard: prevent double-guessing

// ── DOM references ────────────────────────────────────────────────────────────
const roundLabelEl  = document.getElementById('guess-round-label');
const stripFillEl   = document.getElementById('guess-strip-fill');
const scoreDisplayEl = document.getElementById('guess-score-display');
const hintPointsEl  = document.getElementById('hints-points');
const hintTextEls   = [
  document.getElementById('hint-text-0'),
  document.getElementById('hint-text-1'),
  document.getElementById('hint-text-2'),
];
const hintItemEls   = [
  document.getElementById('hint-0'),
  document.getElementById('hint-1'),
  document.getElementById('hint-2'),
];
const revealBtn     = document.getElementById('reveal-btn');
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
  answered      = false;
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

  // Reset: only hint-0 is visible at the start of each round.
  hintItemEls[0].classList.remove('hidden');
  hintItemEls[1].classList.add('hidden');
  hintItemEls[2].classList.add('hidden');

  // ── Points badge ─────────────────────────────────────────────────────────
  // pointValues[0] is the max for this round before any hint is revealed.
  hintPointsEl.textContent = `Worth ${round.pointValues[0]} pts`;

  // ── Reveal button ─────────────────────────────────────────────────────────
  // Reset to enabled; it disables once all 3 hints are shown.
  revealBtn.disabled = false;
  revealBtn.textContent = 'Reveal next hint (−10 pts)';

  // ── Options ───────────────────────────────────────────────────────────────
  renderOptions(round);

  // ── Feedback ──────────────────────────────────────────────────────────────
  feedbackEl.classList.add('hidden');
}

// ══════════════════════════════════════════════════════════════════════════════
//  renderOptions(round)
//  Builds the three state-choice buttons and wires their click handlers.
// ══════════════════════════════════════════════════════════════════════════════
function renderOptions(round) {
  optionsEl.innerHTML = round.options.map(opt => `
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
  // Guard: player can only guess once per round.
  if (answered) return;
  answered = true;

  const round      = rounds[roundIdx];
  const isCorrect  = (chosenId === round.answer);
  // Points earned depend on how many hints were already shown:
  //   hintsRevealed=1 → index 0 → 30 pts
  //   hintsRevealed=2 → index 1 → 20 pts
  //   hintsRevealed=3 → index 2 → 10 pts
  const ptsEarned  = isCorrect ? round.pointValues[hintsRevealed - 1] : 0;

  // ── Disable all option buttons and highlight correct/wrong ─────────────────
  optionsEl.querySelectorAll('.guess-option').forEach(btn => {
    btn.disabled = true;
    if (btn.dataset.id === round.answer) {
      // Always highlight the correct answer — helps learning even on a wrong guess
      btn.classList.add('correct');
    } else if (btn.dataset.id === chosenId && !isCorrect) {
      btn.classList.add('wrong');
    }
  });

  // ── Update score ────────────────────────────────────────────────────────────
  if (isCorrect) {
    totalEarned += ptsEarned;
    Storage.addPoints(ptsEarned);
  }
  scoreDisplayEl.textContent = `${totalEarned} pts earned`;

  // ── Feedback message ────────────────────────────────────────────────────────
  if (isCorrect) {
    feedbackResult.textContent = `Correct! +${ptsEarned} pts`;
    feedbackResult.style.color = 'var(--clr-green)';
  } else {
    // Tell them what the right answer was so every round is a learning moment.
    const correctOption = round.options.find(o => o.id === round.answer);
    feedbackResult.textContent = `Not quite! It was ${correctOption.icon} ${correctOption.name}.`;
    feedbackResult.style.color = 'var(--clr-red)';
  }

  // Reveal the feedback row (it has .hidden by default).
  feedbackEl.classList.remove('hidden');

  // Also disable the reveal button — no point showing more hints after guessing.
  revealBtn.disabled = true;
}

// ══════════════════════════════════════════════════════════════════════════════
//  Reveal-next-hint button
// ══════════════════════════════════════════════════════════════════════════════
revealBtn.addEventListener('click', () => {
  // Guard: do nothing if already answered or all hints are showing.
  if (answered || hintsRevealed >= 3) return;

  // Show the next hint item (index = hintsRevealed, since we start at 1).
  hintItemEls[hintsRevealed].classList.remove('hidden');
  hintsRevealed++;

  const round = rounds[roundIdx];

  // Update the "Worth X pts" badge to reflect the new maximum.
  hintPointsEl.textContent = `Worth ${round.pointValues[hintsRevealed - 1]} pts`;

  // Once all 3 hints are visible, disable the button.
  if (hintsRevealed >= 3) {
    revealBtn.disabled = true;
    revealBtn.textContent = 'All hints shown';
  }
});

// ══════════════════════════════════════════════════════════════════════════════
//  Next Round button
// ══════════════════════════════════════════════════════════════════════════════
nextBtn.addEventListener('click', () => {
  roundIdx++;

  if (roundIdx < rounds.length) {
    // Advance to the next round.
    loadRound(roundIdx);
  } else {
    // All 7 rounds complete — head to the reward screen.
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
