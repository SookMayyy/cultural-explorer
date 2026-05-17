// js/utils/storage.js
// Manages all localStorage persistence for the app
 
const Storage = (() => {
  const KEYS = {
    EARNED:   'ce_earned_stamps',
    POINTS:   'ce_points',
    PROGRESS: 'ce_state_progress',
    PLAYER:   'ce_player_name',
    QUIZ_SCORE: 'ce_quiz_score'
  };
 
  function get(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }
 
  function set(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  }
 
  // ── Stamps ──
  function getEarned() {
    return get(KEYS.EARNED) || {};
  }
  function earnStamp(stateId) {
    const earned = getEarned();
    earned[stateId] = true;
    set(KEYS.EARNED, earned);
  }
  function hasEarned(stateId) {
    return !!getEarned()[stateId];
  }
  function earnedCount() {
    return Object.keys(getEarned()).length;
  }
 
  // ── Points ──
  function getPoints() {
    return get(KEYS.POINTS) || 0;
  }
  function addPoints(n) {
    const p = getPoints() + n;
    set(KEYS.POINTS, p);
    return p;
  }
 
  // ── State progress (which tab completed per state) ──
  function getProgress(stateId) {
    const all = get(KEYS.PROGRESS) || {};
    return all[stateId] || { story: false, culture: false, activity: false, quiz: false };
  }
  function markProgress(stateId, tab) {
    const all = get(KEYS.PROGRESS) || {};
    if (!all[stateId]) all[stateId] = {};
    all[stateId][tab] = true;
    set(KEYS.PROGRESS, all);
  }
 
  // ── Player name ──
  function getPlayer() {
    return get(KEYS.PLAYER) || 'Explorer';
  }
  function setPlayer(name) {
    set(KEYS.PLAYER, name);
  }
 
  // ── Quiz score ──
  function getBestQuizScore() {
    return get(KEYS.QUIZ_SCORE) || 0;
  }
  function saveBestQuizScore(score) {
    const best = getBestQuizScore();
    if (score > best) set(KEYS.QUIZ_SCORE, score);
  }
 
  // ── Reset (for testing) ──
  function reset() {
    Object.values(KEYS).forEach(k => localStorage.removeItem(k));
  }
 
  return {
    getEarned, earnStamp, hasEarned, earnedCount,
    getPoints, addPoints,
    getProgress, markProgress,
    getPlayer, setPlayer,
    getBestQuizScore, saveBestQuizScore,
    reset
  };
})();