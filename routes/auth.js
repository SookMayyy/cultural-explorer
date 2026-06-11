const express   = require('express');
const bcrypt    = require('bcrypt');
const crypto    = require('crypto');
const { body, validationResult } = require('express-validator');

const pool = require('../db/connection');
const { loginLimiter, registerLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// ── Helpers ───────────────────────────────────────────────────────────────────

// Simple memorable auto-password for Grade 1–2 (e.g. "sun7cat")
const AUTO_PW_WORDS = ['sun','cat','dog','red','hat','map','fox','bee','ant','owl','cup','jam'];
function genAutoPassword() {
  const w1 = AUTO_PW_WORDS[Math.floor(Math.random() * AUTO_PW_WORDS.length)];
  const w2 = AUTO_PW_WORDS[Math.floor(Math.random() * AUTO_PW_WORDS.length)];
  const d  = Math.floor(Math.random() * 10);
  return `${w1}${d}${w2}`;
}

// Validate express-validator results and return 422 if any fail
function validate(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json({ ok: false, error: errors.array()[0].msg });
    return false;
  }
  return true;
}

// Build a safe session user object (never include password hashes)
function sessionUser(user) {
  return {
    id:               user.id,
    auth_type:        user.auth_type,
    display_name:     user.display_name,
    grade_group:      user.grade_group,
    points:           user.points,
    avatar_costume_id: user.avatar_costume_id,
  };
}

// ── POST /api/auth/register ───────────────────────────────────────────────────
// Grade-based account creation (international / private schools)
router.post('/register', registerLimiter, [
  body('display_name')
    .trim()
    .notEmpty().withMessage('Name is required.')
    .matches(/^[a-zA-Z ]{1,20}$/).withMessage('Name must be letters only, max 20 characters.'),
  body('grade_group')
    .isIn(['1-2','3-4','5-6']).withMessage('Please select a valid grade group.'),
  body('icon_key_1')
    .isInt({ min: 1, max: 12 }).withMessage('Please pick your first secret icon.'),
  body('icon_key_2')
    .isInt({ min: 1, max: 12 }).withMessage('Please pick your second secret icon.')
    .custom((val, { req }) => {
      if (parseInt(val) === parseInt(req.body.icon_key_1)) {
        throw new Error('Your two icons must be different.');
      }
      return true;
    }),
  body('password')
    .if(body('grade_group').isIn(['3-4','5-6']))
    .notEmpty().withMessage('Password is required for Grade 3 and above.')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters.'),
], async (req, res, next) => {
  try {
    if (!validate(req, res)) return;

    const { display_name, grade_group, icon_key_1, icon_key_2, password } = req.body;

    let password_hash  = null;
    let auto_password  = null;

    if (grade_group === '1-2') {
      // Generate a plain-text auto password — shown to teacher, cleared after first login
      auto_password = genAutoPassword();
    } else {
      password_hash = await bcrypt.hash(password, 10);
    }

    const [result] = await pool.execute(
      `INSERT INTO users
         (auth_type, display_name, grade_group, password_hash, auto_password, icon_key_1, icon_key_2)
       VALUES ('grade_account', ?, ?, ?, ?, ?, ?)`,
      [display_name.trim(), grade_group, password_hash, auto_password,
       parseInt(icon_key_1), parseInt(icon_key_2)]
    );

    const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [result.insertId]);
    const user = rows[0];

    req.session.user = sessionUser(user);

    const response = { ok: true };
    if (grade_group === '1-2') response.auto_password = auto_password;

    res.status(201).json(response);
  } catch (err) {
    next(err);
  }
});

// ── POST /api/auth/login ──────────────────────────────────────────────────────
// Grade-based login
router.post('/login', loginLimiter, [
  body('display_name').trim().notEmpty().withMessage('Please enter your name.'),
  body('grade_group').isIn(['1-2','3-4','5-6']).withMessage('Please select your grade.'),
  body('password').notEmpty().withMessage('Please enter your password.'),
], async (req, res, next) => {
  try {
    if (!validate(req, res)) return;

    const { display_name, grade_group, password } = req.body;

    const [rows] = await pool.execute(
      `SELECT * FROM users
       WHERE display_name = ? AND grade_group = ? AND auth_type = 'grade_account'
       LIMIT 1`,
      [display_name.trim(), grade_group]
    );

    if (!rows.length) {
      return res.status(401).json({ ok: false, error: 'Name or password is incorrect. Try again!' });
    }

    const user = rows[0];
    let authenticated = false;

    if (grade_group === '1-2') {
      // Grade 1–2: check against auto_password first, then password_hash if set
      if (user.auto_password && user.auto_password === password) {
        authenticated = true;
        // First successful login — hash the password and clear the plain-text auto_password
        const newHash = await bcrypt.hash(password, 10);
        await pool.execute(
          'UPDATE users SET password_hash = ?, auto_password = NULL, last_login = NOW() WHERE id = ?',
          [newHash, user.id]
        );
      } else if (user.password_hash) {
        authenticated = await bcrypt.compare(password, user.password_hash);
        if (authenticated) {
          await pool.execute('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);
        }
      }
    } else {
      // Grade 3+: bcrypt compare
      if (user.password_hash) {
        authenticated = await bcrypt.compare(password, user.password_hash);
        if (authenticated) {
          await pool.execute('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);
        }
      }
    }

    if (!authenticated) {
      return res.status(401).json({ ok: false, error: 'Name or password is incorrect. Try again!' });
    }

    req.session.user = sessionUser(user);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/auth/moe-login ──────────────────────────────────────────────────
// MOE government school — IC number as credential
router.post('/moe-login', loginLimiter, [
  body('ic_number')
    .trim()
    .matches(/^\d{12}$/).withMessage('Please enter a valid 12-digit IC number (numbers only, no dashes).'),
  body('display_name')
    .optional()
    .trim()
    .matches(/^[a-zA-Z ]{1,20}$/).withMessage('Name must be letters only, max 20 characters.'),
], async (req, res, next) => {
  try {
    if (!validate(req, res)) return;

    const { ic_number, display_name } = req.body;

    // Hash the IC number — never store the plain IC
    const ic_hash = crypto.createHash('sha256').update(ic_number.trim()).digest('hex');

    const [rows] = await pool.execute(
      `SELECT * FROM users WHERE ic_hash = ? AND auth_type = 'moe' LIMIT 1`,
      [ic_hash]
    );

    let user;
    if (rows.length) {
      // Existing account — log in
      user = rows[0];
      await pool.execute('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);
    } else {
      // New account — auto-register with just the IC hash
      const name = (display_name || 'Explorer').trim();
      const [result] = await pool.execute(
        `INSERT INTO users (auth_type, display_name, ic_hash) VALUES ('moe', ?, ?)`,
        [name, ic_hash]
      );
      const [newRows] = await pool.execute('SELECT * FROM users WHERE id = ?', [result.insertId]);
      user = newRows[0];
    }

    req.session.user = sessionUser(user);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/auth/recover ────────────────────────────────────────────────────
// Icon-based password recovery
// Grade 1–2: verifies icons → reveals original password
// Grade 3+:  verifies icons → allows setting a new password
router.post('/recover', [
  body('display_name').trim().notEmpty().withMessage('Please enter your name.'),
  body('grade_group').isIn(['1-2','3-4','5-6']).withMessage('Please select your grade.'),
  body('icon_key_1').isInt({ min: 1, max: 12 }).withMessage('Please pick your first secret icon.'),
  body('icon_key_2').isInt({ min: 1, max: 12 }).withMessage('Please pick your second secret icon.'),
  body('new_password')
    .if(body('grade_group').isIn(['3-4','5-6']))
    .notEmpty().withMessage('Please enter your new password.')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters.'),
], async (req, res, next) => {
  try {
    if (!validate(req, res)) return;

    const { display_name, grade_group, icon_key_1, icon_key_2, new_password } = req.body;

    const [rows] = await pool.execute(
      `SELECT * FROM users
       WHERE display_name = ? AND grade_group = ? AND auth_type = 'grade_account'
       LIMIT 1`,
      [display_name.trim(), grade_group]
    );

    if (!rows.length) {
      return res.status(404).json({ ok: false, error: "We couldn't find that account. Check your name and grade." });
    }

    const user = rows[0];

    // Verify both icons in order — order matters (12 × 11 = 132 combinations)
    if (parseInt(icon_key_1) !== user.icon_key_1 || parseInt(icon_key_2) !== user.icon_key_2) {
      return res.status(401).json({ ok: false, error: "Those icons don't match. Try again!" });
    }

    if (grade_group === '1-2') {
      // Reveal the stored password (auto_password for Grade 1–2)
      // If auto_password was already cleared (first login happened), reveal from password_hash is not possible
      // In that case, reset with a new auto password
      let revealedPassword = user.auto_password;
      if (!revealedPassword) {
        revealedPassword = genAutoPassword();
        const newHash = await bcrypt.hash(revealedPassword, 10);
        await pool.execute(
          'UPDATE users SET auto_password = ?, password_hash = ? WHERE id = ?',
          [revealedPassword, newHash, user.id]
        );
      }
      return res.json({ ok: true, revealed_password: revealedPassword });
    } else {
      // Grade 3+: set a new password
      const newHash = await bcrypt.hash(new_password, 10);
      await pool.execute('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, user.id]);
      return res.json({ ok: true });
    }
  } catch (err) {
    next(err);
  }
});

// ── POST /api/auth/teacher-login ──────────────────────────────────────────────
router.post('/teacher-login', loginLimiter, [
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email address.'),
  body('password').notEmpty().withMessage('Please enter your password.'),
], async (req, res, next) => {
  try {
    if (!validate(req, res)) return;

    const { email, password } = req.body;

    const [rows] = await pool.execute(
      `SELECT * FROM users WHERE email = ? AND auth_type = 'teacher' LIMIT 1`,
      [email]
    );

    if (!rows.length) {
      return res.status(401).json({ ok: false, error: 'Email or password is incorrect.' });
    }

    const teacher = rows[0];
    const match   = await bcrypt.compare(password, teacher.teacher_pw_hash);

    if (!match) {
      return res.status(401).json({ ok: false, error: 'Email or password is incorrect.' });
    }

    await pool.execute('UPDATE users SET last_login = NOW() WHERE id = ?', [teacher.id]);
    req.session.user = sessionUser(teacher);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/auth/logout ─────────────────────────────────────────────────────
router.post('/logout', (req, res, next) => {
  req.session.destroy(err => {
    if (err) return next(err);
    res.json({ ok: true });
  });
});

// ── GET /api/auth/me ──────────────────────────────────────────────────────────
router.get('/me', (req, res) => {
  if (!req.session?.user) {
    return res.status(401).json({ ok: false, error: 'Not logged in' });
  }
  res.json({ ok: true, user: req.session.user });
});

module.exports = router;
