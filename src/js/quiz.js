// js/quiz.js — Quiz mini-game screen
// ─────────────────────────────────────────────────────────────────────────────
// REDESIGN NOTE (June 2026):
//   Visual layer only — purple topbar, question card, option buttons, feedback
//   panel, and completion screen all restyled to match map/narrative screens.
//   Scoring, question selection, spaced-repetition logic, Storage calls, and
//   navigation destination (reward.html) are all UNCHANGED.
// ─────────────────────────────────────────────────────────────────────────────

import Storage from './utils/storage.js';
import { renderTopbar, renderNavbar, requireAuth, getStateParam, flyPoints } from './ui.js';
import { getState } from './data/states.js';
import { renderMascot, setMascotPose } from './data/mascots.js';
import { QUIZ_QUESTIONS } from './data/quizzes.js';
import { showPopup } from './components/popup.js';
import Sound from './utils/sound.js';

// ── Auth guard ────────────────────────────────────────────────────────────────
requireAuth();

const stateId = getStateParam();
const state   = getState(stateId);

if (!state) {
  showPopup({
    title: 'State not found',
    emoji: '🧭',
    message: "We couldn't find that state. Let's go back to the map and pick one!",
    actions: [{ label: 'Back to Map', value: 'map', style: 'primary' }],
  }).then(() => { window.location.href = 'map.html'; });
  throw new Error('State not found: ' + stateId);
}

// ── Render shared chrome ───────────────────────────────────────────────────────
// Pass color: null so quiz.css .quiz-topbar override (purple) wins via !important.
renderTopbar({
  title:    state.name + ' Quiz',
  showBack: true,
  backHref: `narrative.html?state=${stateId}`,
  showPoints: true,
  color:    null,   // keeps purple override in quiz.css intact
});

renderNavbar('quiz');

// ── Apply state accent color to quiz main (progress bar + card header) ────────
// quiz.css defaults everything to purple; setting --state-color here lets
// the fill bar and card header tint with the state's own colour for a bit of
// per-state personalisation (same technique as narrative.css uses for tab
// underlines and hero backgrounds).
const quizMain = document.getElementById('quiz-main');
if (quizMain && state.color) {
  quizMain.style.setProperty('--state-color', state.color);
  // The light tint colours the whole question card so each state's card is its own.
  if (state.colorLight) quizMain.style.setProperty('--state-color-light', state.colorLight);
}

// Drop the state flag into the question-card header so each state's quiz is
// visually distinct. state.emoji is an <img> of the state flag.
const stateFlagEl = document.getElementById('quiz-state-flag');
if (stateFlagEl) stateFlagEl.innerHTML = state.emoji;

// ── Build question pool ───────────────────────────────────────────────────────
// PER-STATE ONLY: the inline state.quizQuestion first, then this state's own
// questions from QUIZ_QUESTIONS. No padding with other states' questions —
// every state has at least 4 of its own (see data/quizzes.js).
const POINTS_PER_Q = 10;

const stateQs = QUIZ_QUESTIONS.filter(q => q.stateId === stateId);

// Always include the per-state inline question first
const mainQ = {
  id:      stateId + '-main',
  q:       state.quizQuestion.q,
  opts:    state.quizQuestion.opts,
  ans:     state.quizQuestion.ans,
  explain: state.quizQuestion.explain,
};

const pool = [mainQ, ...stateQs].slice(0, 4);

// ── State variables ───────────────────────────────────────────────────────────
let qIdx     = 0;   // current question index
let score    = 0;   // number of correct answers
let earned   = 0;   // total points earned this session
let answered = false; // prevents double-tapping before auto-advance

// ── DOM references ────────────────────────────────────────────────────────────
const counterEl     = document.getElementById('quiz-counter');
const progFill      = document.getElementById('quiz-prog-fill');
const questionEl    = document.getElementById('quiz-question-text');
const stateBadgeEl  = document.getElementById('quiz-state-badge');
const qNumEl        = document.getElementById('quiz-q-num');
const optionBtns    = document.querySelectorAll('.quiz-option');
const feedbackEl    = document.getElementById('quiz-feedback');
const feedbackIcon  = document.getElementById('feedback-icon');
const mascotEl      = document.getElementById('quiz-mascot-text');
const scoreEl       = document.getElementById('quiz-score-display');

// Mascot figure — Rimau guides every state (starts in the idle pose)
const mascotFig = document.getElementById('quiz-mascot-figure');
renderMascot(mascotFig, 'idle');

// Play a one-shot mascot reaction (removes + re-adds the class so it retriggers).
function react(el, cls) {
  if (!el) return;
  el.classList.remove('react-happy', 'react-sad', 'react-cheer');
  void el.offsetWidth;
  el.classList.add(cls);
}

// ── Load a question ───────────────────────────────────────────────────────────
function loadQuestion(idx) {
  answered = false;

  const q = pool[idx];

  // Update the progress strip
  counterEl.textContent = `Question ${idx + 1} of ${pool.length}`;
  progFill.style.width  = `${Math.round(((idx) / pool.length) * 100)}%`;

  // Update the question card header
  if (stateBadgeEl) stateBadgeEl.textContent = state.name;
  if (qNumEl) qNumEl.textContent = `Q${idx + 1}`;

  // Update the question text
  questionEl.textContent = q.q;

  // Reset option buttons — remove feedback classes, re-enable, update text
  optionBtns.forEach((btn, i) => {
    btn.disabled = false;
    btn.classList.remove('correct', 'wrong', 'burst', 'shake');
    const textEl = document.getElementById(`opt-${i}`);
    if (textEl) textEl.textContent = q.opts[i] ?? '—';

    // Re-trigger the stagger entrance animation by cloning and re-inserting
    // This makes each new question feel fresh with the pop-in sequence.
    btn.style.animation = 'none';
    // Force reflow so the browser notices the animation was removed
    void btn.offsetWidth;
    btn.style.animation = '';
  });

  // Hide the feedback panel
  feedbackEl.classList.add('hidden');
  feedbackEl.className = 'quiz-feedback hidden';
}

// Load the first question immediately
loadQuestion(0);

// ── Evaluate an answer ────────────────────────────────────────────────────────
// LOGIC UNCHANGED: correct = +POINTS_PER_Q pts, both states highlighted,
// feedback panel shown, auto-advance after 1600ms.
function evaluate(chosen) {
  if (answered) return;
  answered = true;

  const q       = pool[qIdx];
  const correct = chosen === q.ans;

  // Disable all buttons so the player can't tap again before auto-advance
  optionBtns.forEach((btn, i) => {
    btn.disabled = true;
    if (i === q.ans) {
      btn.classList.add('correct');
      btn.classList.add('burst');             // satisfying scale + green glow
    } else if (i === chosen && !correct) {
      btn.classList.add('wrong');
      btn.classList.add('shake');             // wrong pick wobbles
    }
  });

  // Show the feedback panel with the right colour and explanation text
  const resultEl  = document.getElementById('feedback-result');
  const explainEl = document.getElementById('feedback-explain');

  if (correct) {
    feedbackEl.className = 'quiz-feedback correct-fb';
    if (feedbackIcon)    feedbackIcon.textContent = '✅';
    resultEl.textContent  = `Correct! +${POINTS_PER_Q} pts`;
    explainEl.textContent = q.explain;

    // Juice: happy sound + mascot bounce, switched to the cheering pose
    Sound.correct();
    setMascotPose(mascotFig, 'happy');
    react(mascotFig, 'react-happy');

    // Score bookkeeping
    score++;
    earned += POINTS_PER_Q;
    Storage.addPoints(POINTS_PER_Q);
    if (scoreEl) {
      scoreEl.textContent = earned;
      flyPoints(scoreEl, POINTS_PER_Q);       // "+10" floats up from the score
    }

    // Mascot says something encouraging
    mascotEl.textContent = [
      'Excellent! Well done!',
      'Correct! You are amazing!',
      'Brilliant! Keep it up!',
      'Yes! You got it!',
    ][Math.floor(Math.random() * 4)];

  } else {
    feedbackEl.className = 'quiz-feedback wrong-fb';
    if (feedbackIcon)    feedbackIcon.textContent = '❌';
    resultEl.textContent  = 'Not quite!';
    explainEl.textContent = q.explain;

    // Juice: gentle sound + mascot wobble, back to the neutral idle pose
    Sound.wrong();
    setMascotPose(mascotFig, 'idle');
    react(mascotFig, 'react-sad');

    // Mascot is gentle about wrong answers
    mascotEl.textContent = [
      'Almost! You will get the next one!',
      'Keep going, you are doing great!',
      'Every wrong answer is a chance to learn!',
    ][Math.floor(Math.random() * 3)];
  }

  // LOGIC UNCHANGED: 1600ms pause then advance
  setTimeout(() => {
    qIdx++;
    if (qIdx < pool.length) {
      loadQuestion(qIdx);
    } else {
      finish();
    }
  }, 1600);
}

// Wire up option button click listeners
optionBtns.forEach(btn => {
  btn.addEventListener('click', () => evaluate(parseInt(btn.dataset.idx, 10)));
});

// ── Finish (completion screen) ────────────────────────────────────────────────
// LOGIC UNCHANGED: pass threshold = 50%, marks quiz complete, saves best score,
// earns stamp if pass, navigates to reward.html with URL params.
// Visual addition: the completion screen is revealed in-page before the redirect,
// giving the player a reward beat (mascot + score tally + stamp banner).
function finish() {
  const pass = score >= Math.ceil(pool.length * 0.5);

  // Persist progress — UNCHANGED
  Storage.markCompleted(stateId, 'quiz');
  Storage.saveBestScore(earned);
  if (pass) Storage.earnStamp(stateId);

  // Update the progress strip to 100% on completion
  progFill.style.width = '100%';

  // ── Reveal the completion screen ──
  const questionView = document.getElementById('quiz-question-view');
  const completeView = document.getElementById('quiz-complete-view');
  if (questionView) questionView.classList.add('hidden');
  if (completeView) completeView.classList.remove('hidden');

  // Fill in completion screen details
  const completeStateName  = document.getElementById('complete-state-name');
  const completeBadge      = document.getElementById('complete-badge');
  const completeScoreNum   = document.getElementById('complete-score-num');
  const completeScoreTotal = document.getElementById('complete-score-total');
  const completePtsEarned  = document.getElementById('complete-pts-earned');
  const completeMascotMsg  = document.getElementById('complete-mascot-message');
  const completeStampBanner = document.getElementById('complete-stamp-banner');
  const completeStampSub   = document.getElementById('complete-stamp-sub');
  const completeMascotFig  = document.getElementById('complete-mascot-figure');

  // Cheering pose for a pass, idle (gentle) otherwise.
  renderMascot(completeMascotFig, pass ? 'cheer' : 'idle');

  // Juice: celebrate a pass (mascot cheer + unlock fanfare), gentle otherwise.
  if (pass) { react(completeMascotFig, 'react-cheer'); Sound.unlock(); }
  else      { Sound.wrong(); }
  const completeStateFlag = document.getElementById('complete-state-flag');
  if (completeStateFlag) completeStateFlag.innerHTML = state.emoji;
  if (completeStateName) completeStateName.textContent = state.name;
  if (completeBadge)     completeBadge.textContent = pass ? '🏆 Passed!' : '📚 Keep trying!';
  if (completeScoreNum)  completeScoreNum.textContent = score;
  if (completeScoreTotal) completeScoreTotal.textContent = pool.length;
  if (completePtsEarned) completePtsEarned.textContent = earned;

  // Mascot message depends on score
  if (completeMascotMsg) {
    if (score === pool.length) {
      completeMascotMsg.textContent = `Perfect score! You are a ${state.name} expert! Amazing work!`;
    } else if (pass) {
      completeMascotMsg.textContent = `Well done! You passed the ${state.name} quiz! Keep exploring Malaysia!`;
    } else {
      completeMascotMsg.textContent = `Good effort! Go back and learn more about ${state.name}, then try again!`;
    }
  }

  // Show the stamp banner only if the player earned a stamp
  if (completeStampBanner && completeStampSub) {
    if (pass) {
      completeStampBanner.classList.remove('hidden');
      completeStampSub.textContent = `You've unlocked the ${state.name} stamp!`;
    } else {
      completeStampBanner.classList.add('hidden');
    }
  }

  // ── CTA button navigates to reward.html (EXISTING FLOW UNCHANGED) ──
  const ctaBtn = document.getElementById('complete-cta-btn');
  if (ctaBtn) {
    const params = new URLSearchParams({
      state:  stateId,
      score:  score,
      total:  pool.length,
      earned: earned,
      stamp:  pass ? '1' : '0',
    });
    ctaBtn.addEventListener('click', () => {
      window.location.href = `reward.html?${params}`;
    });
  }
}
