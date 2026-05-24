// js/utils/storage.js — localStorage wrapper with typed accessors

const PREFIX = 'ce_';
const KEY = {
  SESSION:   PREFIX + 'session',
  PROGRESS:  PREFIX + 'progress',
  POINTS:    PREFIX + 'points',
  STAMPS:    PREFIX + 'stamps',
  BEST:      PREFIX + 'best_score',
  STATE:     PREFIX + 'current_state',
};

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

  // ── Reset ───────────────────────────────────────────────────────────
  reset() {
    Object.values(KEY).forEach(k => localStorage.removeItem(k));
  },
};

export default Storage;
