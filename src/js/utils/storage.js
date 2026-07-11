// Vanilla JavaScript (ES6 modules) — storage.js
// js/utils/storage.js — localStorage wrapper with typed accessors
//
// PER-ACCOUNT NAMESPACING
// ───────────────────────
// The session (who is logged in) lives at a single global key (`ce_session`).
// All *game data* (progress, points, stamps, best score, costumes, current
// state) is namespaced per account via `_k()`. This means:
//   • A different student logging in on the SAME shared classroom machine sees
//     their own (empty/own) data — never the previous child's stamps/points.
//   • Logging out then back in as the SAME account restores that account's data
//     (it was kept, just hidden under that account's namespace).
// This is the offline/prototype store. The Express + Supabase backend is the
// server-side source of truth (cross-device restore is future work).

const PREFIX = 'ce_';
const KEY = {
  SESSION:   PREFIX + 'session',
  PROGRESS:  PREFIX + 'progress',
  POINTS:    PREFIX + 'points',
  STAMPS:    PREFIX + 'stamps',
  BEST:      PREFIX + 'best_score',
  STATE:     PREFIX + 'current_state',
  USERS:     PREFIX + 'users',       // array of registered user objects (legacy)
  COSTUMES:  PREFIX + 'costumes',    // array of unlocked costume ids
  COSTUME:   PREFIX + 'costume',     // currently-equipped costume id
  MISSIONS:  PREFIX + 'missions',    // { stateId: [completed mission ids] }
  AVATARS:   PREFIX + 'avatars',     // array of OWNED avatar indices (bought/starter)
  AVATAR:    PREFIX + 'avatar',      // currently-equipped avatar index (per account)
  PROFILE_COLOR: PREFIX + 'profile_color', // chosen profile background colour
  DIFFICULTY: PREFIX + 'difficulty', // chosen game difficulty level id (see data/difficulty.js)
};

// Game-data keys that get namespaced per account (everything except the global
// session + the legacy users list).
const NAMESPACED = [KEY.PROGRESS, KEY.POINTS, KEY.STAMPS, KEY.BEST, KEY.STATE, KEY.COSTUMES, KEY.COSTUME, KEY.MISSIONS, KEY.AVATARS, KEY.AVATAR, KEY.PROFILE_COLOR, KEY.DIFFICULTY];

// Free costume every player owns from the start (see data/costumes.js).
// Matches the backend's default avatar_costume_id = 1 (School Uniform).
const DEFAULT_COSTUME_ID = 'school-uniform';

// Default profile background colour (purple) shown until the player picks one.
export const DEFAULT_PROFILE_COLOR = '#6a32c9';

const Storage = {
  // ── Account namespacing ─────────────────────────────────────────────
  // Build a stable per-account suffix from the current session. Falls back
  // to 'anon' before login (guest/first-run writes).
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

  // ── Session ─────────────────────────────────────────────────────────
  getSession() {
    try { return JSON.parse(localStorage.getItem(KEY.SESSION)); } catch { return null; }
  },
  setSession(data) {
    localStorage.setItem(KEY.SESSION, JSON.stringify(data));
  },
  clearSession() {
    // Only the session is cleared on logout — game data stays under the
    // account's namespace so it restores when that account logs back in,
    // and stays invisible to any other account on this machine.
    localStorage.removeItem(KEY.SESSION);
  },
  setGuest(displayName, avatarId) {
    this.setSession({ type: 'guest', displayName, avatarId, points: 0 });
  },

  // ── Progress — per-state tab completion ────────────────────────────
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

  // ── Points ──────────────────────────────────────────────────────────
  getPoints() {
    return parseInt(localStorage.getItem(this._k(KEY.POINTS)) || '0', 10);
  },
  // Broadcast the new total so any live UI (e.g. the topbar ⭐ badge) can
  // update in real time. Guarded so it's a no-op in Node/test environments.
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
    // Mirror the gain to the backend so points persist across devices.
    this._pushPointsDelta(n, session);
    this._emitPoints(total);
    return total;
  },
  // Set the local points cache directly WITHOUT pushing to the backend.
  // Used by the login hydrate so restoring the server total doesn't re-add it.
  setPointsLocal(total) {
    localStorage.setItem(this._k(KEY.POINTS), String(total));
    const session = this.getSession();
    if (session) { session.points = total; this.setSession(session); }
    this._emitPoints(total);
  },
  // Best-effort: tell the backend about earned points for a registered account.
  // Guarded so it never breaks offline play, guests, or the test environment.
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

  // ── Stamps ──────────────────────────────────────────────────────────
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

  // ── Costumes (Avatar Shop) ───────────────────────────────────────────
  // Unlocked costumes are stored as an array of ids; the default free
  // costume is always considered owned and equipped if nothing is set.
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

  // ── Missions — per-state mission completion (Mission Hub) ────────────
  // Stored as { stateId: [missionId, …] }. Missions unlock sequentially, so
  // the hub reads this to know which are done and which is next.
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

  // ── Difficulty — chosen game level ("explorer"/"adventurer") ─────────
  // Null when the child hasn't picked one; data/difficulty.js then falls back
  // to their grade's default. Namespaced per account, so each child on a shared
  // machine keeps their own choice.
  getDifficulty() {
    return localStorage.getItem(this._k(KEY.DIFFICULTY)) || null;
  },
  setDifficulty(levelId) {
    if (levelId) localStorage.setItem(this._k(KEY.DIFFICULTY), String(levelId));
    else localStorage.removeItem(this._k(KEY.DIFFICULTY));
  },

  // ── Avatars (owned characters) ──────────────────────────────────────
  // The avatar picked at sign-up is free (recorded via setSessionAvatar); every
  // other avatar must be BOUGHT with points in the shop. The currently-equipped
  // avatar is always treated as owned so no one is ever locked out of their own.
  getOwnedAvatars() {
    let list;
    try { list = JSON.parse(localStorage.getItem(this._k(KEY.AVATARS))) || []; } catch { list = []; }
    list = list.map(Number);
    // The currently-shown avatar is always owned. avatarId falls back to 0 (the
    // default shown by avatarImg) so guests / not-yet-picked users still own the
    // avatar they see, while registered users only get their sign-up pick free.
    const cur = Number(this.getSession()?.avatarId ?? 0);
    if (!list.includes(cur)) list = [cur, ...list];
    return list;
  },
  ownsAvatar(i) {
    return this.getOwnedAvatars().includes(Number(i));
  },
  // The avatar this account last equipped, saved PER ACCOUNT so it survives a
  // logout (the global session — and its avatarId — is wiped on logout). Returns
  // null when the account has never picked one. Used on login to restore the pick
  // instead of falling back to avatar 0 (Lion).
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

  // ── Profile background colour ────────────────────────────────────────
  getProfileColor() {
    return localStorage.getItem(this._k(KEY.PROFILE_COLOR)) || DEFAULT_PROFILE_COLOR;
  },
  setProfileColor(hex) {
    localStorage.setItem(this._k(KEY.PROFILE_COLOR), hex);
  },

  // ── Best quiz score ─────────────────────────────────────────────────
  getBestScore() {
    return parseInt(localStorage.getItem(this._k(KEY.BEST)) || '0', 10);
  },
  saveBestScore(score) {
    if (score > this.getBestScore()) {
      localStorage.setItem(this._k(KEY.BEST), String(score));
    }
  },

  // ── Current state (MPA page-to-page handoff) ────────────────────────
  getCurrentState() {
    return localStorage.getItem(this._k(KEY.STATE)) || null;
  },
  setCurrentState(id) {
    localStorage.setItem(this._k(KEY.STATE), id);
  },

  // ── User Accounts (LEGACY) ───────────────────────────────────────────
  // Superseded by the Express + Supabase backend auth (grade-based register/
  // login/recover). Kept only for backward compatibility; not used by the
  // current auth screens.
  getUsers() {
    try { return JSON.parse(localStorage.getItem(KEY.USERS)) || []; } catch { return []; }
  },
  _saveUsers(users) {
    localStorage.setItem(KEY.USERS, JSON.stringify(users));
  },

  // Update the avatar in both the session and (legacy) the user's saved record
  setSessionAvatar(avatarId) {
    const session = this.getSession();
    if (!session) return;
    session.avatarId = avatarId;
    this.setSession(session);
    // Persist the equipped avatar PER ACCOUNT too — the global session is wiped
    // on logout, so this is what restores the pick on the next login (otherwise
    // it defaulted to avatar 0 / Lion).
    localStorage.setItem(this._k(KEY.AVATAR), String(Number(avatarId)));
    // Equipping an avatar also records it as owned (the starter pick becomes
    // free-owned; bought avatars are added at purchase time).
    this.addOwnedAvatar(avatarId);
    if (session.username) {
      const users = this.getUsers();
      const user = users.find(u => u.username === session.username);
      if (user) { user.avatarId = avatarId; this._saveUsers(users); }
    }
  },

  // ── Reset — clears only the CURRENT account's game data ───────────────
  // (Settings → Reset Progress.) The session is left intact so the player
  // stays logged in with a fresh, empty progress slate.
  reset() {
    NAMESPACED.forEach(base => localStorage.removeItem(this._k(base)));
  },
};

export default Storage;
