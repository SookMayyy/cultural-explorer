const express = require('express');
const pool    = require('../db/connection');

const router = express.Router();

// GET /api/states/:id/quiz — randomised 4-question set for a state
router.get('/state/:id', async (req, res, next) => {
  try {
    const stateId = parseInt(req.params.id);
    // Fetch up to 4 questions, mixing difficulties
    const [questions] = await pool.execute(
      `SELECT id, difficulty, question_text, opt_a, opt_b, opt_c, opt_d, correct_opt, explanation
       FROM quiz_questions WHERE state_id = ? ORDER BY RAND() LIMIT 4`,
      [stateId]
    );
    res.json({ ok: true, data: questions });
  } catch (err) {
    next(err);
  }
});

// POST /api/quiz/validate — check a single answer and return points
router.post('/validate', async (req, res, next) => {
  try {
    const { questionId, selectedOption } = req.body;
    if (!questionId || !selectedOption) {
      return res.status(422).json({ ok: false, error: 'questionId and selectedOption are required.' });
    }

    const [[q]] = await pool.execute(
      'SELECT correct_opt, explanation FROM quiz_questions WHERE id = ? LIMIT 1',
      [parseInt(questionId)]
    );
    if (!q) return res.status(404).json({ ok: false, error: 'Question not found.' });

    const correct      = selectedOption === q.correct_opt;
    const pointsAwarded = correct ? 10 : 0;

    // Award points to logged-in users
    if (correct && req.session?.user) {
      await pool.execute(
        'UPDATE users SET points = points + ? WHERE id = ?',
        [pointsAwarded, req.session.user.id]
      );
      req.session.user.points += pointsAwarded;
    }

    res.json({ ok: true, correct, explanation: q.explanation, pointsAwarded });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
