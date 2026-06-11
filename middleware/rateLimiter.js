const rateLimit = require('express-rate-limit');

// Applied to all login routes — prevents brute-force attacks
const loginLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max:      10,
  message:  { ok: false, error: 'Too many login attempts. Please wait a minute and try again.' },
  standardHeaders: true,
  legacyHeaders:   false,
});

// Applied to registration — prevents spam account creation
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max:      20,
  message:  { ok: false, error: 'Too many accounts created. Please try again later.' },
  standardHeaders: true,
  legacyHeaders:   false,
});

module.exports = { loginLimiter, registerLimiter };
