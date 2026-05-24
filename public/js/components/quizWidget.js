// js/components/quizWidget.js — MCQ question card with A/B/C/D options

const LETTERS = ['A', 'B', 'C', 'D'];

export default class QuizWidget {
  constructor(container, question, config = {}) {
    this._el       = container;
    this._q        = question;   // { q, opts, ans, explain }
    this._config   = {
      num:       config.num       || 1,
      total:     config.total     || 1,
      onCorrect: config.onCorrect || (() => {}),
      onWrong:   config.onWrong   || (() => {}),
      points:    config.points    || 10,
    };
    this._answered = false;
  }

  render() {
    const { num, total } = this._config;
    this._el.innerHTML = `
      <div class="quiz-widget">
        <div class="quiz-progress-row">
          <span class="quiz-counter">Question ${num} of ${total}</span>
          <div class="progress-track quiz-prog-track">
            <div class="progress-fill" style="width:${(num/total)*100}%"></div>
          </div>
        </div>

        <div class="quiz-question-card card">
          <p class="quiz-question-text">${this._q.q}</p>
        </div>

        <div class="quiz-options">
          ${this._q.opts.map((opt, i) => `
            <button class="quiz-option" data-idx="${i}">
              <span class="quiz-option-letter">${LETTERS[i]}</span>
              <span class="quiz-option-label">${opt}</span>
            </button>
          `).join('')}
        </div>

        <div class="quiz-feedback hidden"></div>
      </div>
    `;

    this._el.querySelectorAll('.quiz-option').forEach(btn => {
      btn.addEventListener('click', () => this._evaluate(parseInt(btn.dataset.idx)));
    });
  }

  _evaluate(chosen) {
    if (this._answered) return;
    this._answered = true;

    const correct  = chosen === this._q.ans;
    const feedback = this._el.querySelector('.quiz-feedback');
    const options  = this._el.querySelectorAll('.quiz-option');

    options.forEach((btn, i) => {
      btn.disabled = true;
      if (i === this._q.ans) btn.classList.add('correct');
      else if (i === chosen && !correct) btn.classList.add('wrong');
    });

    feedback.classList.remove('hidden');
    feedback.className = `quiz-feedback ${correct ? 'correct-fb' : 'wrong-fb'}`;
    feedback.innerHTML = correct
      ? `<span>✅ Correct! +${this._config.points} pts</span><p>${this._q.explain}</p>`
      : `<span>❌ Not quite!</span><p>${this._q.explain}</p>`;

    setTimeout(() => {
      if (correct) this._config.onCorrect(this._config.points);
      else         this._config.onWrong();
    }, 1600);
  }
}
