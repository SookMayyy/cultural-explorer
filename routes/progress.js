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

// POST /api/progress/points — add earned points (e.g. quiz/mini-game) to the
// logged-in user, so points persist across devices. Additive only (delta > 0);
// spending is handled by the costume-unlock route. Single path segment, so it
// does not collide with /:stateId/complete.
router.post('/points', requireLogin, async (req, res, next) => {
  try {
    const delta = parseInt(req.body.delta) || 0;
    if (delta > 0) {
      await pool.execute('UPDATE users SET points = points + ? WHERE id = ?', [delta, req.session.user.id]);
      req.session.user.points = (req.session.user.points || 0) + delta;
    }
    res.json({ ok: true, points: req.session.user.points });
  } catch (err) {
    next(err);
  }
});

// POST /api/progress/reset — wipe the current user's progress (states, stamps,
// costumes) and reset points. Single segment, so no conflict with the routes
// below. Used by Settings → Reset Progress (double-confirmed in the UI).
router.post('/reset', requireLogin, async (req, res, next) => {
  try {
    const uid = req.session.user.id;
    await pool.execute('DELETE FROM user_progress WHERE user_id = ?', [uid]);
    await pool.execute('DELETE FROM user_costumes WHERE user_id = ?', [uid]);
    await pool.execute('UPDATE users SET points = 0, avatar_costume_id = 1 WHERE id = ?', [uid]);
    req.session.user.points = 0;
    req.session.user.avatar_costume_id = 1;
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// POST /api/progress/:stateId/complete — mark state complete, award stamp.
// Points come entirely from the four missions (25 each = 100 per state), so
// there is NO separate completion bonus. This route records the stamp + score;
// `bonusPoints` stays 0 and is kept in the response for backward compatibility.
router.post('/:stateId/complete', requireLogin, async (req, res, next) => {
  try {
    const stateId   = parseInt(req.params.stateId);
    const quizScore = parseInt(req.body.quizScore) || 0;
    const userId    = req.session.user.id;
    const BONUS     = 0; // no completion bonus — a state is worth 4×25 from its missions

    // Was this state already completed? Decide the bonus before the upsert.
    const [[existing]] = await pool.execute(
      'SELECT stamp_earned FROM user_progress WHERE user_id = ? AND state_id = ? LIMIT 1',
      [userId, stateId]
    );
    const firstCompletion = !existing || !existing.stamp_earned;

    // Upsert progress row; keep the original completed_at on replays.
    await pool.execute(
      `INSERT INTO user_progress (user_id, state_id, is_completed, stamp_earned, last_quiz_score, completed_at)
       VALUES (?, ?, TRUE, TRUE, ?, NOW())
       ON CONFLICT (user_id, state_id) DO UPDATE SET
         is_completed = TRUE, stamp_earned = TRUE,
         last_quiz_score = EXCLUDED.last_quiz_score,
         completed_at = COALESCE(user_progress.completed_at, NOW())`,
      [userId, stateId, quizScore]
    );

    // Award the bonus only the first time the state is completed.
    let bonusPoints = 0;
    if (firstCompletion) {
      bonusPoints = BONUS;
      await pool.execute('UPDATE users SET points = points + ? WHERE id = ?', [bonusPoints, userId]);
      req.session.user.points += bonusPoints;
    }

    res.json({ ok: true, bonusPoints, alreadyCompleted: !firstCompletion });
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
              (uc.user_id IS NOT NULL)        AS is_unlocked,
              (u.avatar_costume_id = c.id)     AS is_equipped
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
