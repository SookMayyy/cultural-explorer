// js/pages/quizPage.js — Quiz screen (4-question pool per state)

import { navigate, renderTopbar, AppState } from '../app.js';
import Storage from '../utils/storage.js';
import { getState } from '../data/states.js';
import { QUIZ_QUESTIONS } from '../data/quizzes.js';
import QuizWidget from '../components/quizWidget.js';

const LETTERS = ['A','B','C','D'];
const POINTS_PER_Q = 10;

const QuizPage = {
  _stateId:   null,
  _state:     null,
  _questions: [],
  _qIdx:      0,
  _score:     0,
  _earned:    0,

  render(screen, params = {}) {
    this._stateId = params.stateId || AppState.currentStateId;
    this._state   = getState(this._stateId);
    this._qIdx    = 0;
    this._score   = 0;
    this._earned  = 0;

    if (!this._state) {
      screen.innerHTML = '<p style="padding:2rem">State not found.</p>';
      return;
    }

    const s = this._state;
    renderTopbar({
      title:      s.name + ' Quiz',
      showBack:   true,
      backTarget: 'narrative',
      showPoints: true,
      accentColor: s.color,
    });

    // Build question pool: state-specific Q first + fill up to 4 from others
    const stateQs   = QUIZ_QUESTIONS.filter(q => q.stateId === this._stateId);
    const othersPool = QUIZ_QUESTIONS.filter(q => q.stateId !== this._stateId).sort(() => Math.random() - 0.5);
    const pool = [...stateQs, ...othersPool].slice(0, 4);
    // Include the inline state quiz question as question #1
    pool.unshift({
      id:      s.id + '-main',
      stateId: s.id,
      q:       s.quizQuestion.q,
      opts:    s.quizQuestion.opts,
      ans:     s.quizQuestion.ans,
      explain: s.quizQuestion.explain,
    });
    this._questions = pool.slice(0, 4);

    screen.innerHTML = `
      <div class="quiz-screen">

        <!-- Mascot row -->
        <div class="quiz-mascot-area">
          <div class="quiz-mascot-figure">🦁</div>
          <div class="quiz-mascot-bubble">
            <p id="quiz-mascot-text">Let's test what you know about ${s.name}! You've got this! 🌟</p>
          </div>
        </div>

        <!-- Question area -->
        <div class="quiz-question-area" id="quiz-question-area">
          <!-- QuizWidget renders here -->
        </div>

        <!-- Score tracker -->
        <div class="quiz-score-tracker">
          Score: <strong id="quiz-score-display">0</strong> / ${this._questions.length * POINTS_PER_Q} pts
        </div>
      </div>
    `;

    this._renderQuestion(screen, 0);
  },

  init() {},

  _renderQuestion(screen, idx) {
    const container = screen.querySelector('#quiz-question-area');
    if (!container || idx >= this._questions.length) return;

    const q = this._questions[idx];
    const widget = new QuizWidget(container, q, {
      num:   idx + 1,
      total: this._questions.length,
      points: POINTS_PER_Q,
      onCorrect: (pts) => {
        this._score++;
        this._earned += pts;
        Storage.addPoints(pts);
        screen.querySelector('#quiz-score-display').textContent = this._earned;
        this._updateMascot(screen, true);
        if (idx + 1 < this._questions.length) {
          setTimeout(() => this._renderQuestion(screen, idx + 1), 400);
        } else {
          setTimeout(() => this._finish(screen), 600);
        }
      },
      onWrong: () => {
        this._updateMascot(screen, false);
        if (idx + 1 < this._questions.length) {
          setTimeout(() => this._renderQuestion(screen, idx + 1), 400);
        } else {
          setTimeout(() => this._finish(screen), 600);
        }
      },
    });
    widget.render();
  },

  _updateMascot(screen, correct) {
    const el = screen.querySelector('#quiz-mascot-text');
    if (!el) return;
    const praise   = ['Excellent! 🌟', 'Correct! 🎉', 'Well done! ✅', 'Amazing! 🏆'];
    const comfort  = ['Almost! 😊', 'Try to remember! 💪', 'It\'s okay, keep going! 🤗'];
    el.textContent = correct
      ? praise[Math.floor(Math.random() * praise.length)]
      : comfort[Math.floor(Math.random() * comfort.length)];
  },

  _finish(screen) {
    const s = this._state;
    const pass = this._score >= Math.ceil(this._questions.length * 0.5);

    Storage.markCompleted(s.id, 'quiz');
    Storage.saveBestScore(this._earned);
    if (pass) Storage.earnStamp(s.id);

    navigate('reward', {
      stateId:   s.id,
      score:     this._score,
      total:     this._questions.length,
      earned:    this._earned,
      stampEarned: pass,
    });
  },
};

export default QuizPage;
