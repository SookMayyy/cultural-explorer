const express = require('express');
const pool    = require('../db/connection');
const { requireLogin } = require('../middleware/auth');

const router = express.Router();

// GET /api/progress — all progress rows for current user
router.get('/', requireLogin, async (req, res, next) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM user_progress WHERE user_id = ?',
      [req.session.user.id]
    );
    res.json({ ok: true, data: rows });
  } catch (err) {
    next(err);
  }
});

// POST /api/progress/:stateId/complete — mark state complete, award stamp + points
router.post('/:stateId/complete', requireLogin, async (req, res, next) => {
  try {
    const stateId   = parseInt(req.params.stateId);
    const quizScore = parseInt(req.body.quizScore) || 0;
    const userId    = req.session.user.id;
    const bonusPts  = 20; // state completion bonus

    // Upsert progress row
    await pool.execute(
      `INSERT INTO user_progress (user_id, state_id, is_completed, stamp_earned, last_quiz_score, completed_at)
       VALUES (?, ?, TRUE, TRUE, ?, NOW())
       ON DUPLICATE KEY UPDATE
         is_completed = TRUE, stamp_earned = TRUE,
         last_quiz_score = VALUES(last_quiz_score), completed_at = NOW()`,
      [userId, stateId, quizScore]
    );

    // Award bonus points
    await pool.execute(
      'UPDATE users SET points = points + ? WHERE id = ?',
      [bonusPts, userId]
    );
    req.session.user.points += bonusPts;

    res.json({ ok: true, bonusPoints: bonusPts });
  } catch (err) {
    next(err);
  }
});

// GET /api/costumes — all costumes with unlock status for current user
router.get('/costumes', requireLogin, async (req, res, next) => {
  try {
    const userId = req.session.user.id;
    const [costumes] = await pool.execute(
      `SELECT c.*,
              IF(uc.user_id IS NOT NULL, TRUE, FALSE) AS is_unlocked,
              IF(u.avatar_costume_id = c.id, TRUE, FALSE) AS is_equipped
       FROM costumes c
       LEFT JOIN user_costumes uc ON uc.costume_id = c.id AND uc.user_id = ?
       LEFT JOIN users u          ON u.id = ?
       ORDER BY c.points_cost ASC`,
      [userId, userId]
    );
    res.json({ ok: true, data: costumes });
  } catch (err) {
    next(err);
  }
});

// POST /api/costumes/:id/unlock — spend points to unlock a costume
router.post('/costumes/:id/unlock', requireLogin, async (req, res, next) => {
  try {
    const costumeId = parseInt(req.params.id);
    const userId    = req.session.user.id;

    const [[costume]] = await pool.execute('SELECT * FROM costumes WHERE id = ? LIMIT 1', [costumeId]);
    if (!costume) return res.status(404).json({ ok: false, error: 'Costume not found.' });

    const [[user]] = await pool.execute('SELECT points FROM users WHERE id = ? LIMIT 1', [userId]);
    if (user.points < costume.points_cost) {
      return res.status(400).json({ ok: false, error: `Not enough points. You need ${costume.points_cost} points.` });
    }

    // Check not already unlocked
    const [[existing]] = await pool.execute(
      'SELECT 1 FROM user_costumes WHERE user_id = ? AND costume_id = ? LIMIT 1',
      [userId, costumeId]
    );
    if (existing) return res.status(400).json({ ok: false, error: 'You already own this costume.' });

    await pool.execute('INSERT INTO user_costumes (user_id, costume_id) VALUES (?, ?)', [userId, costumeId]);
    await pool.execute('UPDATE users SET points = points - ? WHERE id = ?', [costume.points_cost, userId]);
    req.session.user.points -= costume.points_cost;

    res.json({ ok: true, newPoints: req.session.user.points });
  } catch (err) {
    next(err);
  }
});

// POST /api/costumes/:id/equip — set as active avatar costume
router.post('/costumes/:id/equip', requireLogin, async (req, res, next) => {
  try {
    const costumeId = parseInt(req.params.id);
    const userId    = req.session.user.id;

    // Must own it first (id=1 default is always available)
    if (costumeId !== 1) {
      const [[owned]] = await pool.execute(
        'SELECT 1 FROM user_costumes WHERE user_id = ? AND costume_id = ? LIMIT 1',
        [userId, costumeId]
      );
      if (!owned) return res.status(403).json({ ok: false, error: 'You need to unlock this costume first.' });
    }

    await pool.execute('UPDATE users SET avatar_costume_id = ? WHERE id = ?', [costumeId, userId]);
    req.session.user.avatar_costume_id = costumeId;
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
