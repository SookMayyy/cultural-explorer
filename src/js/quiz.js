/* quiz.js — Quiz mini-game screen */

import Storage from './utils/storage.js';
import { renderTopbar, renderNavbar, requireAuth, getStateParam, flyPoints } from './ui.js';
import { getState } from './data/states.js';
import { renderMascot, setMascotPose } from './data/mascots.js';
import { QUIZ_QUESTIONS } from './data/quizzes.js';
import { paramsFor, missionCount } from './data/difficulty.js';
import { festivalMissionFor } from './data/festivalMissions.js';
import { foodMissionFor } from './data/foodMissions.js';
import { landmarkTourFor } from './data/landmarkMissions.js';
import { showPopup } from './components/popup.js';
import { initHowToPlay } from './components/howToPlay.js';
import { playMusic } from './utils/music.js';
import { shuffle } from './utils/shuffle.js';
import { launchContext } from './utils/launchContext.js';
import Sound from './utils/sound.js';

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

/* Launch context (journey: back → narrative, CTA → reward) */
const { fromActivities, fromMission, missionId, missionsHref, missionsDoneHref } =
  launchContext(stateId);
const activitiesHref = `activities.html?state=${stateId}`;

/* Shared chrome (the topbar is transparent — see base .topbar in style.css) */
renderTopbar({
  title:    state.name + ' Quiz',
  showBack: true,
  // From the hub, back undoes one step to the state picker.
  backHref: fromMission ? missionsHref
          : fromActivities ? 'activity-states.html?game=quiz'
          : `narrative.html?state=${stateId}`,
  showPoints: true,
  color:    null,   // no-op; the bar is transparent by design
});

renderNavbar('activities');

/* Apply the state accent to the quiz (progress bar + card header) */
const quizMain = document.getElementById('quiz-main');
if (quizMain && state.color) {
  quizMain.style.setProperty('--state-color', state.color);
  if (state.colorLight) quizMain.style.setProperty('--state-color-light', state.colorLight);
}

// Drop the state flag into the question-card header (state.emoji is an <img>).
const stateFlagEl = document.getElementById('quiz-state-flag');
if (stateFlagEl) stateFlagEl.innerHTML = state.emoji;

/* Build question pool — per-state only (inline question + this state's bank) */
const POINTS_PER_Q = 10;

// In the mission flow the reward is a flat +25 (not per question), so points
// shown here are "practice" only — label them so kids don't total them up.
const practicePoints = fromMission;

// Shuffled so a replay surfaces different questions from the bank each time.
const stateQs = shuffle(QUIZ_QUESTIONS.filter(q => q.stateId === stateId));

// Always include the per-state inline question first.
const mainQ = {
  id:      stateId + '-main',
  q:       state.quizQuestion.q,
  opts:    state.quizQuestion.opts,
  ans:     state.quizQuestion.ans,
  explain: state.quizQuestion.explain,
  image:   state.quizQuestion.image || null,
};

// Difficulty tunes the quiz: Explorer 3 questions × 3 options, Adventurer 4 × 4.
const qp = paramsFor('quiz');

// The Festival mission is a short focused set (Explorer 2, Adventurer 4) that
// guarantees one festival question and loops the state's festival music.
const isFestivalMission = fromMission && missionId === 'festival';
const qCount = isFestivalMission ? missionCount() : qp.count;
if (isFestivalMission) {
  const track = festivalMissionFor(stateId)?.audio;
  if (track) playMusic(track, { volume: 0.22 });
}

// Word banks to pad a question up to `n` real options (never a placeholder "—").
const FOODS = ['Nasi Lemak', 'Char Kway Teow', 'Satay', 'Roti Canai', 'Nasi Kandar', 'Cendol', 'Rendang'];
const PLACE_NAMES = ['Kuala Lumpur', 'Ipoh', 'Melaka', 'Genting Highlands', 'Cameron Highlands', 'Langkawi', 'Kuching', 'Kota Kinabalu'];

// Mascot reactions (the row is hidden on this screen, but writes stay guarded).
const PRAISE = [
  'Excellent! Well done!',
  'Correct! You are amazing!',
  'Brilliant! Keep it up!',
  'Yes! You got it!',
];
const ENCOURAGEMENT = [
  'Almost! You will get the next one!',
  'Keep going, you are doing great!',
  'Every wrong answer is a chance to learn!',
];

const randomOf = (list) => list[Math.floor(Math.random() * list.length)];

// Pick `count` distractors not already in `existing` (food Qs prefer FOODS).
function extraDistractors(q, existing, count) {
  const used = new Set(existing.map(o => String(o).toLowerCase()));
  const isFoodQ = /food|dish|eat|taste|laksa|noodle/i.test(q.q || '');
  const pool = shuffle([...(isFoodQ ? [...FOODS, ...PLACE_NAMES] : [...PLACE_NAMES, ...FOODS])])
    .filter(o => !used.has(o.toLowerCase()));
  return pool.slice(0, count);
}

// Resize a question to exactly `n` options (trim or pad), keeping the correct one.
// Always reshuffle and recompute `ans` so it doesn't sit in its authored spot.
function trimOptions(q, n) {
  const correct = q.opts[q.ans];
  let opts = q.opts.length > n
    ? [correct, ...q.opts.filter((_, i) => i !== q.ans).slice(0, n - 1)]
    : [...q.opts];

  if (opts.length < n) {
    opts = [...opts, ...extraDistractors(q, opts, n - opts.length)];
  }

  opts = shuffle(opts);
  return { ...q, opts, ans: opts.indexOf(correct) };
}

/* Picture questions ("what is this?") — only where the state ships real photos */
function imageQuestions(st) {
  const out = [];
  const food = foodMissionFor(st.id);
  if (food?.image && food?.dish) {
    const distractors = shuffle(FOODS.filter(f => f.toLowerCase() !== food.dish.toLowerCase())).slice(0, 3);
    const opts = shuffle([food.dish, ...distractors]);
    out.push({
      id: st.id + '-imgfood', image: food.image, q: 'What food is this?',
      opts, ans: opts.indexOf(food.dish),
      explain: `This is ${food.dish}, a famous dish from ${st.name}!`,
    });
  }
  const tour = landmarkTourFor(st.id);
  if (tour.length >= 2) {
    const target = tour[0];
    const others = shuffle(tour.slice(1).map(t => t.name)).slice(0, 3);
    const opts = shuffle([target.name, ...others]);
    out.push({
      id: st.id + '-imgplace', image: target.image, q: 'Where is this place?',
      opts, ans: opts.indexOf(target.name),
      explain: `This is ${target.name} in ${st.name}!`,
    });
  }
  return out;
}

// Ordered candidates, then the first `qCount`. The festival mission prepends one
// festival question; free play shuffles the whole mixed pool for varied replays.
let ordered;
if (isFestivalMission) {
  const festQ = stateQs.find(q => q.category === 'festival');
  ordered = festQ
    ? [festQ, ...imageQuestions(state), mainQ, ...stateQs.filter(q => q !== festQ)]
    : [...imageQuestions(state), mainQ, ...stateQs];
} else {
  ordered = shuffle([mainQ, ...imageQuestions(state), ...stateQs]);
}
const pool = ordered.slice(0, qCount).map(q => trimOptions(q, qp.options));

/* State variables */
let qIdx     = 0;   // current question index
let score    = 0;   // correct answers
let earned   = 0;   // points earned this session
let answered = false; // prevents double-tapping before auto-advance

/* DOM references */
const counterEl     = document.getElementById('quiz-counter');
const progFill      = document.getElementById('quiz-prog-fill');
const questionEl    = document.getElementById('quiz-question-text');
const stateBadgeEl  = document.getElementById('quiz-state-badge');
const qNumEl        = document.getElementById('quiz-q-num');
const optionBtns    = document.querySelectorAll('.quiz-option');
const feedbackEl    = document.getElementById('quiz-feedback');
const feedbackIcon  = document.getElementById('feedback-icon');
const nextBtn       = document.getElementById('quiz-next-btn');
const mascotEl      = document.getElementById('quiz-mascot-text');
const scoreEl       = document.getElementById('quiz-score-display');

// Rimau guides every state (starts idle).
const mascotFig = document.getElementById('quiz-mascot-figure');
renderMascot(mascotFig, 'idle');

// Add a ✓/✗ shape badge so right/wrong reads without relying on colour alone.
function addOptMark(btn, glyph) {
  if (!btn || btn.querySelector('.opt-mark')) return;
  const mark = document.createElement('span');
  mark.className = 'opt-mark';
  mark.setAttribute('aria-hidden', 'true');
  mark.textContent = glyph;
  btn.appendChild(mark);
}

// Play a one-shot mascot reaction (removes + re-adds the class so it retriggers).
function react(el, cls) {
  if (!el) return;
  el.classList.remove('react-happy', 'react-sad', 'react-cheer');
  void el.offsetWidth;
  el.classList.add(cls);
}

/* Load a question */
function loadQuestion(idx) {
  answered = false;

  const q = pool[idx];

  counterEl.textContent = `Question ${idx + 1} of ${pool.length}`;
  progFill.style.width  = `${Math.round((idx / pool.length) * 100)}%`;

  if (stateBadgeEl) stateBadgeEl.textContent = state.name;
  if (qNumEl) qNumEl.textContent = `Q${idx + 1}`;

  questionEl.textContent = q.q;

  // Show the question photo for image ("what is this?") questions; hide otherwise.
  const imageEl = document.getElementById('quiz-question-image');
  if (imageEl) {
    if (q.image) {
      imageEl.innerHTML = `<img src="${q.image}" alt="">`;
      imageEl.classList.remove('hidden');
    } else {
      imageEl.innerHTML = '';
      imageEl.classList.add('hidden');
    }
  }

  // Explorer questions carry fewer options, so surplus buttons are hidden.
  optionBtns.forEach((btn, i) => {
    const has = i < q.opts.length;
    // `hidden` alone is overridden by .quiz-option { display:flex }, so force display off too.
    btn.hidden = !has;
    btn.style.display = has ? '' : 'none';
    btn.classList.remove('correct', 'wrong', 'burst', 'shake');
    btn.querySelector('.opt-mark')?.remove();   // clear last question's ✓/✗ badge
    if (!has) return;
    btn.disabled = false;
    const textEl = document.getElementById(`opt-${i}`);
    if (textEl) textEl.textContent = q.opts[i] ?? '—';

    // Restart the stagger entrance so each new question pops in fresh.
    btn.style.animation = 'none';
    void btn.offsetWidth;
    btn.style.animation = '';
  });

  feedbackEl.className = 'quiz-feedback hidden';
  nextBtn?.classList.add('hidden');   // button lives outside the panel now
}

loadQuestion(0);

/* Evaluate an answer */
function evaluate(chosen) {
  if (answered) return;
  answered = true;

  const q       = pool[qIdx];
  const correct = chosen === q.ans;

  // Disabled so the player can't tap again before the auto-advance.
  optionBtns.forEach((btn, i) => {
    btn.disabled = true;
    if (i === q.ans) {
      btn.classList.add('correct', 'burst');
      addOptMark(btn, '✓');   // non-colour cue: shape, not just green
    } else if (i === chosen && !correct) {
      btn.classList.add('wrong', 'shake');
      addOptMark(btn, '✗');   // non-colour cue: shape, not just red
    }
  });

  const resultEl  = document.getElementById('feedback-result');
  const explainEl = document.getElementById('feedback-explain');

  if (correct) {
    feedbackEl.className = 'quiz-feedback correct-fb';
    if (feedbackIcon)    feedbackIcon.textContent = '✅';
    resultEl.textContent  = practicePoints
      ? `Correct! +${POINTS_PER_Q} practice pts`
      : `Correct! +${POINTS_PER_Q} pts`;
    explainEl.textContent = q.explain;

    Sound.correct();
    setMascotPose(mascotFig, 'happy');
    react(mascotFig, 'react-happy');

    score++;
    earned += POINTS_PER_Q;
    // In the mission flow the flat +25 bonus is the only reward, so per-question
    // points aren't persisted (keeps a state worth exactly 100).
    if (!fromMission) Storage.addPoints(POINTS_PER_Q);
    if (scoreEl) {
      scoreEl.textContent = earned;
      flyPoints(scoreEl, POINTS_PER_Q);       // "+10" floats up from the score
    }

    if (mascotEl) mascotEl.textContent = randomOf(PRAISE);

  } else {
    feedbackEl.className = 'quiz-feedback wrong-fb';
    if (feedbackIcon)    feedbackIcon.textContent = '❌';
    resultEl.textContent  = 'Not quite!';
    explainEl.textContent = q.explain;

    Sound.wrong();
    setMascotPose(mascotFig, 'idle');
    react(mascotFig, 'react-sad');

    if (mascotEl) mascotEl.textContent = randomOf(ENCOURAGEMENT);
  }

  // Advance only when the child taps Next, so the explanation can be read at
  // any pace. The button is part of the feedback panel, so it appears with it.
  if (nextBtn) {
    nextBtn.textContent = qIdx < pool.length - 1 ? 'Next →' : 'See Results →';
    nextBtn.classList.remove('hidden');
    nextBtn.focus();
  }
}

// Advance to the next question, or the completion screen after the last one.
function advance() {
  qIdx++;
  if (qIdx < pool.length) loadQuestion(qIdx);
  else finish();
}

optionBtns.forEach(btn => {
  btn.addEventListener('click', () => evaluate(parseInt(btn.dataset.idx, 10)));
});
nextBtn?.addEventListener('click', advance);

/* Finish (in-page completion screen: mascot + score tally + stamp banner) */
function finish() {
  const pass = score >= Math.ceil(pool.length * 0.5);

  Storage.markCompleted(stateId, 'quiz');
  Storage.saveBestScore(earned);
  // Stamps are earned only by completing all four missions (mission.js), not here.

  progFill.style.width = '100%';

  // Reveal the completion screen.
  const questionView = document.getElementById('quiz-question-view');
  const completeView = document.getElementById('quiz-complete-view');
  if (questionView) questionView.classList.add('hidden');
  if (completeView) completeView.classList.remove('hidden');

  // Fill in completion screen details.
  const completeStateName  = document.getElementById('complete-state-name');
  const completeBadge      = document.getElementById('complete-badge');
  const completeScoreNum   = document.getElementById('complete-score-num');
  const completeScoreTotal = document.getElementById('complete-score-total');
  const completePtsEarned  = document.getElementById('complete-pts-earned');
  const completeMascotMsg  = document.getElementById('complete-mascot-message');
  const completeStampBanner = document.getElementById('complete-stamp-banner');
  const completeStampSub   = document.getElementById('complete-stamp-sub');
  const completeMascotFig  = document.getElementById('complete-mascot-figure');

  // Cheer for a pass, idle otherwise.
  renderMascot(completeMascotFig, pass ? 'cheer' : 'idle');
  if (pass) { react(completeMascotFig, 'react-cheer'); Sound.unlock(); }
  else      { Sound.wrong(); }
  const completeStateFlag = document.getElementById('complete-state-flag');
  if (completeStateFlag) completeStateFlag.innerHTML = state.emoji;
  if (completeStateName) completeStateName.textContent = state.name;
  if (completeBadge)     completeBadge.textContent = pass ? '🏆 Passed!' : '📚 Keep trying!';
  if (completeScoreNum)  completeScoreNum.textContent = score;
  if (completeScoreTotal) completeScoreTotal.textContent = pool.length;
  if (completePtsEarned) completePtsEarned.textContent = earned;

  // Mascot message depends on score.
  if (completeMascotMsg) {
    if (score === pool.length) {
      completeMascotMsg.textContent = `Perfect score! You are a ${state.name} expert! Amazing work!`;
    } else if (pass) {
      completeMascotMsg.textContent = `Well done! You passed the ${state.name} quiz! Keep exploring Malaysia!`;
    } else {
      completeMascotMsg.textContent = `Good effort! Go back and learn more about ${state.name}, then try again!`;
    }
  }

  // Show the stamp banner only if the stamp is actually held. Passing a quiz
  // never earns a stamp (only completing all four missions does), so gating on
  // `pass` alone promised a stamp the child wouldn't find in the stamp book.
  if (completeStampBanner && completeStampSub) {
    if (Storage.getStamps().includes(stateId)) {
      completeStampBanner.classList.remove('hidden');
      completeStampSub.textContent = `You've earned the ${state.name} stamp!`;
    } else {
      completeStampBanner.classList.add('hidden');
    }
  }

  // Mission-flow points are practice only (flat +25 is the real reward), so the
  // tally reads "practice points" rather than implying banked points.
  const ptsTextEl = document.querySelector('.complete-pts-text');
  if (ptsTextEl && practicePoints) ptsTextEl.textContent = ' practice points';

  // CTA: replay from the hub → Activities; linear journey → reward.html.
  const ctaBtn = document.getElementById('complete-cta-btn');
  if (ctaBtn) {
    const params = new URLSearchParams({
      state:  stateId,
      score:  score,
      total:  pool.length,
      earned: earned,
      stamp:  pass ? '1' : '0',
    });
    if (fromMission)         ctaBtn.textContent = '✅ Mission Complete!';
    else if (fromActivities) ctaBtn.textContent = '🎮 Back to Activities';
    ctaBtn.addEventListener('click', () => {
      window.location.href = fromMission ? missionsDoneHref
                           : fromActivities ? activitiesHref
                           : `reward.html?${params}`;
    });
  }
}

/* Kid-friendly "How to Play" (first visit + a "?" button to re-open) */
initHowToPlay('quiz', {
  title: 'Quiz Time!', emoji: '🧠',
  lines: ['🤔 Read the question.', '👆 Tap the best answer.', '⭐ Get it right to win points!'],
});
