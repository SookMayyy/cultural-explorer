function requireLogin(req, res, next) {
  if (!req.session?.user) {
    return res.status(401).json({ ok: false, error: 'Not logged in' });
  }
  next();
}

function requireTeacher(req, res, next) {
  if (!req.session?.user || req.session.user.auth_type !== 'teacher') {
    return res.status(403).json({ ok: false, error: 'Teacher access only' });
  }
  next();
}

module.exports = { requireLogin, requireTeacher };
