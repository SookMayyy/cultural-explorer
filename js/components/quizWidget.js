// js/components/quizWidget.js
// Reusable MCQ quiz component used in both narrative mini-quiz and the full quiz page

const QuizWidget = (() => {

  function render(question, opts, questionNum, total) {
    return `
      <div class="quiz-widget" id="quiz-widget">
        ${total ? `
        <div class="quiz-progress-row">
          <div class="quiz-pbar-track"><div class="quiz-pbar-fill" style="width:${Math.round((questionNum/total)*100)}%"></div></div>
          <span class="quiz-counter">${questionNum} / ${total}</span>
        </div>` : ''}
        <div class="quiz-mascot">🦁</div>
        <p class="quiz-question">${question}</p>
        <div class="quiz-options-grid">
          ${opts.map((o, i) => `<button class="quiz-option" data-idx="${i}">${o}</button>`).join('')}
        </div>
        <p class="feedback" id="qw-feedback"></p>
      </div>`;
  }

  function init(containerEl, correctIndex, onResult) {
    containerEl.querySelectorAll('.quiz-option').forEach(btn => {
      btn.addEventListener('click', () => {
        const chosen = parseInt(btn.dataset.idx);
        containerEl.querySelectorAll('.quiz-option').forEach(b => b.disabled = true);
        const fb = containerEl.querySelector('#qw-feedback');

        if (chosen === correctIndex) {
          btn.classList.add('correct');
          fb.textContent = '🎉 Correct! Well done!';
          fb.className = 'feedback feedback--ok';
          if (onResult) onResult(true);
        } else {
          btn.classList.add('wrong');
          fb.textContent = '❌ Not quite! Check the Discover cards for hints.';
          fb.className = 'feedback feedback--bad';
          // Re-enable after delay for retry
          setTimeout(() => {
            containerEl.querySelectorAll('.quiz-option').forEach(b => {
              b.disabled = false;
              b.classList.remove('wrong', 'correct');
            });
            fb.textContent = '';
            fb.className = 'feedback';
          }, 2000);
          if (onResult) onResult(false);
        }
      });
    });
  }

  return { render, init };
})();