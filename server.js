require('dotenv').config();
const express    = require('express');
const session    = require('express-session');
const cors       = require('cors');
const path       = require('path');

const authRoutes     = require('./routes/auth');
const statesRoutes   = require('./routes/states');
const quizRoutes     = require('./routes/quiz');
const progressRoutes = require('./routes/progress');
// teacherRoutes — future implementation (CP3)

const app = express();

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(session({
  secret:            process.env.SESSION_SECRET || 'dev-secret-change-in-production',
  resave:            false,
  saveUninitialized: false,
  cookie: {
    httpOnly:  true,
    sameSite:  'strict',
    secure:    process.env.NODE_ENV === 'production',
    maxAge:    8 * 60 * 60 * 1000, // 8 hours — covers a full school day
  },
}));

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/states',   statesRoutes);
app.use('/api/quiz',     quizRoutes);
app.use('/api/progress', progressRoutes);
// /api/class — teacher dashboard routes (future implementation)

// ── Static files ──────────────────────────────────────────────────────────────
// Serve the public/ directory — HTML, CSS, JS, assets
app.use(express.static(path.join(__dirname, 'public')));

// For direct page navigation (e.g. /views/map.html typed in address bar),
// serve files from public/views/ as well
app.use('/views', express.static(path.join(__dirname, 'public', 'views')));

// Root → home page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'views', 'home.html'));
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ ok: false, error: err.message || 'Internal server error' });
});

// ── Start ─────────────────────────────────────────────────────────────────────
// Skip binding the port under test — Supertest drives the app handle directly.
if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Cultural Explorer running at http://localhost:${PORT}`);
  });
}

module.exports = app; // exported for Supertest
