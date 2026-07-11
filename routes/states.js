const express = require('express');
const pool    = require('../db/connection');

const router = express.Router();

// GET /api/states — all states with unlock status for current user
router.get('/', async (req, res, next) => {
  try {
    const [states] = await pool.execute(
      'SELECT * FROM states ORDER BY sort_order ASC'
    );

    // Free exploration: no state is ever locked. We still overlay completion
    // status for logged-in users so the map can show ✓ on finished states.
    if (req.session?.user) {
      const userId = req.session.user.id;
      const [progress] = await pool.execute(
        'SELECT state_id, is_completed FROM user_progress WHERE user_id = ?',
        [userId]
      );
      const completedSet = new Set(progress.filter(p => p.is_completed).map(p => p.state_id));

      states.forEach(s => {
        s.is_completed = completedSet.has(s.id);
        s.is_locked    = false;
      });
    } else {
      // Guest: everything open, nothing completed yet.
      states.forEach(s => {
        s.is_completed = false;
        s.is_locked    = false;
      });
    }

    res.json({ ok: true, data: states });
  } catch (err) {
    next(err);
  }
});

// GET /api/states/:id — one state with content cards + dialogue
router.get('/:id', async (req, res, next) => {
  try {
    const stateId = parseInt(req.params.id);
    const [[state]] = await pool.execute('SELECT * FROM states WHERE id = ? LIMIT 1', [stateId]);
    if (!state) return res.status(404).json({ ok: false, error: 'State not found' });

    const [cards]    = await pool.execute(
      'SELECT * FROM cultural_content WHERE state_id = ? ORDER BY sort_order ASC', [stateId]
    );
    const [[dialogue]] = await pool.execute(
      'SELECT * FROM state_dialogue WHERE state_id = ? LIMIT 1', [stateId]
    );

    res.json({ ok: true, data: { ...state, cultural_content: cards, state_dialogue: dialogue || null } });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
