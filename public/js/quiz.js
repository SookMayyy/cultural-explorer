// js/quiz.js — quiz page

import Storage from './utils/storage.js';
import { renderTopbar, requireAuth, getStateParam } from './ui.js';
import { getState } from './data/states.js';
import { QUIZ_QUESTIONS } from './data/quizzes.js';

requireAuth();

const stateId = getStateParam();
const state   = getState(stateId);

if (!state) {
  document.querySelector('main').innerHTML = '<p style="padding:2rem;text-align:center">State not found. <a href="map.html">Back to map</a></p>';
  throw new Error('State not found: ' + stateId);
}

renderTopbar({
  title:    state.name + ' Quiz',
  showBack: true,
  backHref: `narrative.html?state=${stateId}`,
  showPoints: true,
  color:    state.color,
});

// ── Build question pool ───────────────────────────────────────────────────────
const POINTS_PER_Q = 10;
const stateQs  = QUIZ_QUESTIONS.filter(q => q.stateId === stateId);
const others   = QUIZ_QUESTIONS.filter(q => q.stateId !== stateId).sort(() => Math.random() - 0.5);
// Always put the inline state quizQuestion first
const mainQ = {
  id:      stateId + '-main',
  q:       state.quizQuestion.q,
  opts:    state.quizQuestion.opts,
  ans:     state.quizQuestion.ans,
  explain: state.quizQuestion.explain,
};
const pool = [mainQ, ...stateQs, ...others].slice(0, 4);

let qIdx     = 0;
let score    = 0;
let earned   = 0;
let answered = false;

// ── DOM refs ──────────────────────────────────────────────────────────────────
const counterEl  = document.getElementById('quiz-counter');
const progFill   = document.getElementById('quiz-prog-fill');
const questionEl = document.getElementById('quiz-question-text');
const optionBtns = document.querySelectorAll('.quiz-option');
const feedbackEl = document.getElementById('quiz-feedback');
const mascotEl   = document.getElementById('quiz-mascot-text');
const scoreEl    = document.getElementById('quiz-score-display');

// ── Load question ─────────────────────────────────────────────────────────────
function loadQuestion(idx) {
  answered = false;
  const q = pool[idx];

  counterEl.textContent = `Question ${idx + 1} of ${pool.length}`;
  progFill.style.width  = `${Math.round(((idx + 1) / pool.length) * 100)}%`;
  questionEl.textContent = q.q;

  optionBtns.forEach((btn, i) => {
    btn.disabled = false;
    btn.classList.remove('correct', 'wrong');
    document.getElementById(`opt-${i}`).textContent = q.opts[i] ?? '—';
  });

  feedbackEl.classList.add('hidden');
  feedbackEl.className = 'quiz-feedback hidden';
}

loadQuestion(0);

// ── Evaluate answer ───────────────────────────────────────────────────────────
function evaluate(chosen) {
  if (answered) return;
  answered = true;

  const q       = pool[qIdx];
  const correct = chosen === q.ans;

  optionBtns.forEach((btn, i) => {
    btn.disabled = true;
    if (i === q.ans) btn.classList.add('correct');
    else if (i === chosen && !correct) btn.classList.add('wrong');
  });

  const resultEl  = document.getElementById('feedback-result');
  const explainEl = document.getElementById('feedback-explain');
  feedbackEl.className = `quiz-feedback ${correct ? 'correct-fb' : 'wrong-fb'}`;
  resultEl.textContent  = correct ? `✅ Correct! +${POINTS_PER_Q} pts` : '❌ Not quite!';
  explainEl.textContent = q.explain;
  feedbackEl.classList.remove('hidden');

  if (correct) {
    score++;
    earned += POINTS_PER_Q;
    Storage.addPoints(POINTS_PER_Q);
    scoreEl.textContent = earned;
    mascotEl.textContent = ['Excellent! 🌟','Correct! 🎉','Well done! ✅','Amazing! 🏆'][Math.floor(Math.random()*4)];
  } else {
    mascotEl.textContent = ['Almost! 😊','Try to remember! 💪','It\'s okay, keep going! 🤗'][Math.floor(Math.random()*3)];
  }

  setTimeout(() => {
    qIdx++;
    if (qIdx < pool.length) {
      loadQuestion(qIdx);
    } else {
      finish();
    }
  }, 1600);
}

optionBtns.forEach(btn => {
  btn.addEventListener('click', () => evaluate(parseInt(btn.dataset.idx)));
});

// ── Finish ────────────────────────────────────────────────────────────────────
function finish() {
  const pass = score >= Math.ceil(pool.length * 0.5);
  Storage.markCompleted(stateId, 'quiz');
  Storage.saveBestScore(earned);
  if (pass) Storage.earnStamp(stateId);

  // Pass results via URL params
  const params = new URLSearchParams({
    state:  stateId,
    score:  score,
    total:  pool.length,
    earned: earned,
    stamp:  pass ? '1' : '0',
  });
  window.location.href = `reward.html?${params}`;
}
