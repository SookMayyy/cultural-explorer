// js/utils/sync.js — best-effort sync between the backend and local storage.
//
// The frontend plays on localStorage (namespaced per account in storage.js).
// The Express + Supabase backend is the cross-device source of truth for
// COMPLETED STATES + STAMPS (state completion pays no points bonus — points come
// from the four missions, 25 each = 100 per state). This module:
//
//   hydrateFromBackend()  — after login: pull the account's completed states,
//                           stamps and points into local storage so progress
//                           shows up even on a brand-new device/browser.
//   pushStateComplete()   — when a state is completed (quiz passed): tell the
//                           backend so it persists for next time / other devices.
//
// Everything is best-effort: any failure (offline, guest, server down) is
// swallowed so offline play is never blocked. The backend keys states by a
// NUMERIC id; the frontend uses string ids ('penang'). We map the two by name
// via GET /api/states (cached for the page).

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
    // Match the backend row to a local state by exact name (seed uses the
    // same names as STATES_DATA), falling back to sort order.
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

    // Points: keep whichever is higher so nothing already earned locally is lost.
    // Use the local-only setter — addPoints() would push the restored total
    // straight back to the server and double-count it.
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
