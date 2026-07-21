/* storage.js — localStorage wrapper with typed accessors */

// The session (who is logged in) lives at one global key. All game data is
// namespaced per account via _k(), so different students on a shared machine
// never see each other's progress. The Express + Supabase backend is the
// server-side source of truth.

const PREFIX = 'ce_';
const KEY = {
  SESSION:   PREFIX + 'session',
  PROGRESS:  PREFIX + 'progress',
  POINTS:    PREFIX + 'points',
  STAMPS:    PREFIX + 'stamps',
  BEST:      PREFIX + 'best_score',
  STATE:     PREFIX + 'current_state',
  USERS:     PREFIX + 'users',       // registered user objects (legacy)
  COSTUMES:  PREFIX + 'costumes',    // unlocked costume ids
  COSTUME:   PREFIX + 'costume',     // equipped costume id
  MISSIONS:  PREFIX + 'missions',    // { stateId: [completed mission ids] }
  AVATARS:   PREFIX + 'avatars',     // owned avatar indices
  AVATAR:    PREFIX + 'avatar',      // equipped avatar index (per account)
  PROFILE_COLOR: PREFIX + 'profile_color',
  DIFFICULTY: PREFIX + 'difficulty', // chosen level id (see data/difficulty.js)
};

// Game-data keys namespaced per account (everything except session + legacy users).
const NAMESPACED = [KEY.PROGRESS, KEY.POINTS, KEY.STAMPS, KEY.BEST, KEY.STATE, KEY.COSTUMES, KEY.COSTUME, KEY.MISSIONS, KEY.AVATARS, KEY.AVATAR, KEY.PROFILE_COLOR, KEY.DIFFICULTY];

// Free costume every player owns (matches backend default avatar_costume_id = 1).
const DEFAULT_COSTUME_ID = 'school-uniform';

// Default profile background colour shown until the player picks one.
export const DEFAULT_PROFILE_COLOR = '#6a32c9';

const Storage = {
  /* Account namespacing */

  // Stable per-account suffix from the current session; 'anon' before login.
  _acctKey() {
    const s = this.getSession();
    if (!s) return 'anon';
    const name  = String(s.displayName || '').trim().toLowerCase().replace(/\s+/g, '-');
    const grade = s.grade_group || '';
    return `${s.type || 'x'}:${name}:${grade}`;
  },
  // Namespace a base key for the current account.
  _k(base) {
    return `${base}__${this._acctKey()}`;
  },

  /* Session */
  getSession() {
    try { return JSON.parse(localStorage.getItem(KEY.SESSION)); } catch { return null; }
  },
  setSession(data) {
    localStorage.setItem(KEY.SESSION, JSON.stringify(data));
  },
  clearSession() {
    // Only the session is cleared on logout — game data stays under the account's
    // namespace so it restores on the next login and stays hidden from others.
    localStorage.removeItem(KEY.SESSION);
  },
  setGuest(displayName, avatarId) {
    this.setSession({ type: 'guest', displayName, avatarId, points: 0 });
  },

  /* Progress — per-state tab completion */
  getProgress() {
    try { return JSON.parse(localStorage.getItem(this._k(KEY.PROGRESS))) || {}; } catch { return {}; }
  },
  getStateProgress(stateId) {
    const p = this.getProgress();
    return p[stateId] || { story: false, culture: false, activity: false, quiz: false, visits: 0 };
  },
  markCompleted(stateId, tab) {
    const p = this.getProgress();
    if (!p[stateId]) p[stateId] = { story: false, culture: false, activity: false, quiz: false, visits: 0 };
    p[stateId][tab] = true;
    localStorage.setItem(this._k(KEY.PROGRESS), JSON.stringify(p));
  },
  incrementVisit(stateId) {
    const p = this.getProgress();
    if (!p[stateId]) p[stateId] = { story: false, culture: false, activity: false, quiz: false, visits: 0 };
    p[stateId].visits = (p[stateId].visits || 0) + 1;
    localStorage.setItem(this._k(KEY.PROGRESS), JSON.stringify(p));
  },
  completedCount() {
    const p = this.getProgress();
    return Object.values(p).filter(s => s.quiz === true).length;
  },

  /* Points */
  getPoints() {
    return parseInt(localStorage.getItem(this._k(KEY.POINTS)) || '0', 10);
  },
  // Broadcast the new total so live UI (e.g. topbar badge) can update. No-op in Node.
  _emitPoints(total) {
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      window.dispatchEvent(new CustomEvent('ce:points', { detail: total }));
    }
  },
  addPoints(n) {
    const current = this.getPoints();
    const total   = current + n;
    localStorage.setItem(this._k(KEY.POINTS), String(total));
    const session = this.getSession();
    if (session) { session.points = total; this.setSession(session); }
    this._pushPointsDelta(n, session);   // mirror to backend for cross-device
    this._emitPoints(total);
    return total;
  },
  // Set the local points cache directly, WITHOUT pushing to the backend.
  // Used by the login hydrate so restoring the server total doesn't re-add it.
  setPointsLocal(total) {
    localStorage.setItem(this._k(KEY.POINTS), String(total));
    const session = this.getSession();
    if (session) { session.points = total; this.setSession(session); }
    this._emitPoints(total);
  },
  // Best-effort backend push for a registered account; never blocks offline play.
  _pushPointsDelta(delta, session) {
    if (!session || session.type !== 'registered' || delta <= 0) return;
    if (typeof fetch !== 'function') return;
    import('./api.js')
      .then(({ apiPost }) => apiPost('/api/progress/points', { delta }))
      .catch(() => { /* offline / server down — local copy already updated */ });
  },
  // Spend points (e.g. unlocking a costume). Returns false if not enough.
  spendPoints(n) {
    const current = this.getPoints();
    if (n > current) return false;
    const total = current - n;
    localStorage.setItem(this._k(KEY.POINTS), String(total));
    const session = this.getSession();
    if (session) { session.points = total; this.setSession(session); }
    this._emitPoints(total);
    return true;
  },

  /* Stamps */
  getStamps() {
    try { return JSON.parse(localStorage.getItem(this._k(KEY.STAMPS))) || []; } catch { return []; }
  },
  earnStamp(stateId) {
    const stamps = this.getStamps();
    if (!stamps.includes(stateId)) {
      stamps.push(stateId);
      localStorage.setItem(this._k(KEY.STAMPS), JSON.stringify(stamps));
    }
  },
  hasStamp(stateId) {
    return this.getStamps().includes(stateId);
  },
  stampCount() {
    return this.getStamps().length;
  },

  /* Costumes (Avatar Shop) */
  // The default free costume is always owned and equipped if nothing is set.
  getUnlockedCostumes() {
    let list;
    try { list = JSON.parse(localStorage.getItem(this._k(KEY.COSTUMES))) || []; } catch { list = []; }
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
      localStorage.setItem(this._k(KEY.COSTUMES), JSON.stringify(list));
    }
  },
  getEquippedCostume() {
    return localStorage.getItem(this._k(KEY.COSTUME)) || DEFAULT_COSTUME_ID;
  },
  setEquippedCostume(id) {
    localStorage.setItem(this._k(KEY.COSTUME), id);
  },

  /* Missions — per-state completion (Mission Hub) */
  // Stored as { stateId: [missionId, …] }; missions unlock sequentially.
  _getAllMissions() {
    try { return JSON.parse(localStorage.getItem(this._k(KEY.MISSIONS))) || {}; } catch { return {}; }
  },
  getMissions(stateId) {
    return this._getAllMissions()[stateId] || [];
  },
  isMissionDone(stateId, missionId) {
    return this.getMissions(stateId).includes(missionId);
  },
  completeMission(stateId, missionId) {
    const all = this._getAllMissions();
    const list = all[stateId] || [];
    if (!list.includes(missionId)) {
      list.push(missionId);
      all[stateId] = list;
      localStorage.setItem(this._k(KEY.MISSIONS), JSON.stringify(all));
    }
  },

  /* Difficulty — chosen game level */
  // Null when unpicked; data/difficulty.js then falls back to the grade default.
  getDifficulty() {
    return localStorage.getItem(this._k(KEY.DIFFICULTY)) || null;
  },
  setDifficulty(levelId) {
    if (levelId) localStorage.setItem(this._k(KEY.DIFFICULTY), String(levelId));
    else localStorage.removeItem(this._k(KEY.DIFFICULTY));
  },

  /* Avatars (owned characters) */
  // The sign-up pick is free; every other avatar is bought with points. The
  // equipped avatar is always treated as owned so no one is locked out of theirs.
  getOwnedAvatars() {
    let list;
    try { list = JSON.parse(localStorage.getItem(this._k(KEY.AVATARS))) || []; } catch { list = []; }
    list = list.map(Number);
    const cur = Number(this.getSession()?.avatarId ?? 0);
    if (!list.includes(cur)) list = [cur, ...list];
    return list;
  },
  ownsAvatar(i) {
    return this.getOwnedAvatars().includes(Number(i));
  },
  // The avatar this account last equipped, saved per account so it survives logout
  // (the global session is wiped then). Null when never picked.
  getCurrentAvatar() {
    const v = localStorage.getItem(this._k(KEY.AVATAR));
    return v == null ? null : Number(v);
  },
  addOwnedAvatar(i) {
    i = Number(i);
    let list;
    try { list = JSON.parse(localStorage.getItem(this._k(KEY.AVATARS))) || []; } catch { list = []; }
    if (!list.map(Number).includes(i)) {
      list.push(i);
      localStorage.setItem(this._k(KEY.AVATARS), JSON.stringify(list));
    }
  },

  /* Profile background colour */
  getProfileColor() {
    return localStorage.getItem(this._k(KEY.PROFILE_COLOR)) || DEFAULT_PROFILE_COLOR;
  },
  setProfileColor(hex) {
    localStorage.setItem(this._k(KEY.PROFILE_COLOR), hex);
  },

  /* Best quiz score */
  getBestScore() {
    return parseInt(localStorage.getItem(this._k(KEY.BEST)) || '0', 10);
  },
  saveBestScore(score) {
    if (score > this.getBestScore()) {
      localStorage.setItem(this._k(KEY.BEST), String(score));
    }
  },

  /* Current state (MPA page-to-page handoff) */
  getCurrentState() {
    return localStorage.getItem(this._k(KEY.STATE)) || null;
  },
  setCurrentState(id) {
    localStorage.setItem(this._k(KEY.STATE), id);
  },

  /* User accounts (legacy) */
  // Superseded by the Supabase backend auth. Kept for backward compatibility only.
  getUsers() {
    try { return JSON.parse(localStorage.getItem(KEY.USERS)) || []; } catch { return []; }
  },
  _saveUsers(users) {
    localStorage.setItem(KEY.USERS, JSON.stringify(users));
  },

  // Update the avatar in the session and (legacy) the user's saved record.
  setSessionAvatar(avatarId) {
    const session = this.getSession();
    if (!session) return;
    session.avatarId = avatarId;
    this.setSession(session);
    // Persist per account too, so the pick restores on next login.
    localStorage.setItem(this._k(KEY.AVATAR), String(Number(avatarId)));
    this.addOwnedAvatar(avatarId);   // equipping records it as owned
    if (session.username) {
      const users = this.getUsers();
      const user = users.find(u => u.username === session.username);
      if (user) { user.avatarId = avatarId; this._saveUsers(users); }
    }
  },

  /* Reset — clears only the current account's game data (session left intact) */
  reset() {
    NAMESPACED.forEach(base => localStorage.removeItem(this._k(base)));
  },
};

export default Storage;
