/* sync.js — best-effort sync between the backend and local storage */

// hydrateFromBackend() pulls completed states/stamps/points after login;
// pushStateComplete() persists a completed state. All failures are swallowed so
// offline play is never blocked. The backend keys states by numeric id, the
// frontend by string id ('penang') — mapped by name via GET /api/states.

import Storage from './storage.js';
import { STATES_DATA } from '../data/states.js';
import { apiGet, apiPost } from './api.js';

let numToStr = null;   // { 1: 'penang', ... }
let strToNum = null;   // { 'penang': 1, ... }

async function loadStateMaps() {
  if (numToStr && strToNum) return;
  const res = await apiGet('/api/states');
  numToStr = {};
  strToNum = {};
  for (const s of (res.data || [])) {
    // Match the backend row to a local state by name, falling back to sort order.
    const local = STATES_DATA.find(d => d.name === s.name)
               || STATES_DATA[(s.sort_order || 0) - 1];
    if (local) {
      numToStr[s.id]      = local.id;
      strToNum[local.id]  = s.id;
    }
  }
}

/**
 * Pull the logged-in account's progress from the backend into local storage.
 * Call right after a successful login (the session cookie must already be set).
 * Returns true if anything was hydrated, false on any failure (non-fatal).
 */
export async function hydrateFromBackend() {
  try {
    await loadStateMaps();

    // Keep the higher points total. Use the local-only setter — addPoints() would
    // push the restored total back to the server and double-count it.
    const me = await apiGet('/api/auth/me').catch(() => null);
    if (me?.user && typeof me.user.points === 'number') {
      Storage.setPointsLocal(Math.max(me.user.points, Storage.getPoints()));
    }

    // Completed states + stamps + best score.
    const prog = await apiGet('/api/progress');
    for (const row of (prog.data || [])) {
      const sid = numToStr[row.state_id];
      if (!sid) continue;
      if (row.is_completed)  Storage.markCompleted(sid, 'quiz');
      if (row.stamp_earned)  Storage.earnStamp(sid);
      if (row.last_quiz_score) Storage.saveBestScore(row.last_quiz_score);
    }
    return true;
  } catch {
    return false;   // offline / guest / server down — play continues locally
  }
}

/**
 * Tell the backend a state was completed (quiz passed), so the stamp + bonus
 * persist across devices. Fire-and-forget; returns the API result or null.
 */
export async function pushStateComplete(stringStateId, quizScore = 0) {
  try {
    await loadStateMaps();
    const num = strToNum[stringStateId];
    if (!num) return null;
    return await apiPost(`/api/progress/${num}/complete`, { quizScore });
  } catch {
    return null;   // non-fatal: local progress already recorded
  }
}
