// Vanilla JavaScript (ES6 modules) — storage.js
// js/utils/storage.js — localStorage wrapper with typed accessors

const PREFIX = 'ce_';
const KEY = {
  SESSION:   PREFIX + 'session',
  PROGRESS:  PREFIX + 'progress',
  POINTS:    PREFIX + 'points',
  STAMPS:    PREFIX + 'stamps',
  BEST:      PREFIX + 'best_score',
  STATE:     PREFIX + 'current_state',
  USERS:     PREFIX + 'users',       // array of registered user objects
  COSTUMES:  PREFIX + 'costumes',    // array of unlocked costume ids
  COSTUME:   PREFIX + 'costume',     // currently-equipped costume id
};

// Free costume every player owns from the start (see data/costumes.js).
const DEFAULT_COSTUME_ID = 'baju-melayu';

const Storage = {
  // ── Session ─────────────────────────────────────────────────────────
  getSession() {
    try { return JSON.parse(localStorage.getItem(KEY.SESSION)); } catch { return null; }
  },
  setSession(data) {
    localStorage.setItem(KEY.SESSION, JSON.stringify(data));
  },
  clearSession() {
    localStorage.removeItem(KEY.SESSION);
  },
  setGuest(displayName, avatarId) {
    this.setSession({ type: 'guest', displayName, avatarId, points: 0 });
  },

  // ── Progress — per-state tab completion ────────────────────────────
  getProgress() {
    try { return JSON.parse(localStorage.getItem(KEY.PROGRESS)) || {}; } catch { return {}; }
  },
  getStateProgress(stateId) {
    const p = this.getProgress();
    return p[stateId] || { story: false, culture: false, activity: false, quiz: false, visits: 0 };
  },
  markCompleted(stateId, tab) {
    const p = this.getProgress();
    if (!p[stateId]) p[stateId] = { story: false, culture: false, activity: false, quiz: false, visits: 0 };
    p[stateId][tab] = true;
    localStorage.setItem(KEY.PROGRESS, JSON.stringify(p));
  },
  incrementVisit(stateId) {
    const p = this.getProgress();
    if (!p[stateId]) p[stateId] = { story: false, culture: false, activity: false, quiz: false, visits: 0 };
    p[stateId].visits = (p[stateId].visits || 0) + 1;
    localStorage.setItem(KEY.PROGRESS, JSON.stringify(p));
  },
  completedCount() {
    const p = this.getProgress();
    return Object.values(p).filter(s => s.quiz === true).length;
  },

  // ── Points ──────────────────────────────────────────────────────────
  getPoints() {
    return parseInt(localStorage.getItem(KEY.POINTS) || '0', 10);
  },
  addPoints(n) {
    const current = this.getPoints();
    localStorage.setItem(KEY.POINTS, String(current + n));
    const session = this.getSession();
    if (session) { session.points = current + n; this.setSession(session); }
    return current + n;
  },
  // Spend points (e.g. unlocking a costume). Returns false if not enough.
  spendPoints(n) {
    const current = this.getPoints();
    if (n > current) return false;
    localStorage.setItem(KEY.POINTS, String(current - n));
    const session = this.getSession();
    if (session) { session.points = current - n; this.setSession(session); }
    return true;
  },

  // ── Stamps ──────────────────────────────────────────────────────────
  getStamps() {
    try { return JSON.parse(localStorage.getItem(KEY.STAMPS)) || []; } catch { return []; }
  },
  earnStamp(stateId) {
    const stamps = this.getStamps();
    if (!stamps.includes(stateId)) {
      stamps.push(stateId);
      localStorage.setItem(KEY.STAMPS, JSON.stringify(stamps));
    }
  },
  hasStamp(stateId) {
    return this.getStamps().includes(stateId);
  },
  stampCount() {
    return this.getStamps().length;
  },

  // ── Costumes (Avatar Shop) ───────────────────────────────────────────
  // Unlocked costumes are stored as an array of ids; the default free
  // costume is always considered owned and equipped if nothing is set.
  getUnlockedCostumes() {
    let list;
    try { list = JSON.parse(localStorage.getItem(KEY.COSTUMES)) || []; } catch { list = []; }
    if (!list.includes(DEFAULT_COSTUME_ID)) list.unshift(DEFAULT_COSTUME_ID);
    return list;
  },
  isCostumeUnlocked(id) {
    return this.getUnlockedCostumes().includes(id);
  },
  unlockCostume(id) {
    const list = this.getUnlockedCostumes();
    if (!list.includes(id)) {
      list.push(id);
      localStorage.setItem(KEY.COSTUMES, JSON.stringify(list));
    }
  },
  getEquippedCostume() {
    return localStorage.getItem(KEY.COSTUME) || DEFAULT_COSTUME_ID;
  },
  setEquippedCostume(id) {
    localStorage.setItem(KEY.COSTUME, id);
  },

  // ── Best quiz score ─────────────────────────────────────────────────
  getBestScore() {
    return parseInt(localStorage.getItem(KEY.BEST) || '0', 10);
  },
  saveBestScore(score) {
    if (score > this.getBestScore()) {
      localStorage.setItem(KEY.BEST, String(score));
    }
  },

  // ── Current state (MPA page-to-page handoff) ────────────────────────
  getCurrentState() {
    return localStorage.getItem(KEY.STATE) || null;
  },
  setCurrentState(id) {
    localStorage.setItem(KEY.STATE, id);
  },

  // ── User Accounts ────────────────────────────────────────────────────
  // We store users as an array: [{nickname, username, password, avatarId, points}]
  // This is suitable for a school prototype. A real app would use a backend.
  getUsers() {
    try { return JSON.parse(localStorage.getItem(KEY.USERS)) || []; } catch { return []; }
  },
  _saveUsers(users) {
    localStorage.setItem(KEY.USERS, JSON.stringify(users));
  },

  registerUser(nickname, username, password) {
    if (!nickname.trim() || !username.trim() || !password) {
      return { ok: false, error: 'Please fill in all fields.' };
    }
    if (password.length < 4) {
      return { ok: false, error: 'Password must be at least 4 characters.' };
    }
    const users = this.getUsers();
    if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
      return { ok: false, error: 'That username is already taken. Try another!' };
    }
    const newUser = { nickname: nickname.trim(), username: username.trim(), password, avatarId: null, points: 0 };
    users.push(newUser);
    this._saveUsers(users);
    // Auto-login immediately after registering
    this.setSession({ type: 'registered', displayName: newUser.nickname, avatarId: null, points: 0, username: newUser.username });
    return { ok: true, user: newUser };
  },

  loginUser(username, password) {
    if (!username.trim() || !password) {
      return { ok: false, error: 'Please enter your username and password.' };
    }
    const users = this.getUsers();
    const user = users.find(u =>
      u.username.toLowerCase() === username.trim().toLowerCase() && u.password === password
    );
    if (!user) {
      return { ok: false, error: 'Wrong username or password. Try again!' };
    }
    this.setSession({ type: 'registered', displayName: user.nickname, avatarId: user.avatarId, points: user.points, username: user.username });
    return { ok: true, user };
  },

  // Update the avatar in both the session and the user's saved record
  setSessionAvatar(avatarId) {
    const session = this.getSession();
    if (!session) return;
    session.avatarId = avatarId;
    this.setSession(session);
    if (session.username) {
      const users = this.getUsers();
      const user = users.find(u => u.username === session.username);
      if (user) { user.avatarId = avatarId; this._saveUsers(users); }
    }
  },

  // ── Reset ───────────────────────────────────────────────────────────
  reset() {
    Object.values(KEY).forEach(k => localStorage.removeItem(k));
  },
};

export default Storage;
