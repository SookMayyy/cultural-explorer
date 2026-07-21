/* difficulty.js — grade-based difficulty tiers for the missions & games */

// Same screens and engines, only parameters vary per level. Grade group '1-3' is
// locked to Explorer (gentle); '4-6' defaults to Adventurer but may drop to Explorer.
// Master is defined but not selectable yet (available:false).

import Storage from '../utils/storage.js';

/* Level catalogue (available:false = defined but not offered in the picker) */
export const LEVELS = {
  explorer:   { id: 'explorer',   name: 'Explorer',   emoji: '🌱', tagline: 'Gentle and guided',  available: true  },
  adventurer: { id: 'adventurer', name: 'Adventurer', emoji: '🔥', tagline: 'A real challenge',    available: true  },
  master:     { id: 'master',     name: 'Master',     emoji: '⚡', tagline: 'Coming soon!',        available: false },
};

/* Per-level, per-game parameters (higher level = harder) */
const PARAMS = {
  explorer: {
    cook:     { distractors: 1 },                                              // fewer wrong ingredients
    scramble: { count: 4 },                                                    // 4 random words
    guess:    { options: 3,  maxClues: 4 },                                    // fewer choices, all clues
    quiz:     { count: 4,    options: 3 },                                     // 4 questions, 3 options
    // Unreachable today (Adventurer-only), but tuned for a one-line opt-in.
    tictactoe: { botAccuracy: 0.55 },
  },
  adventurer: {
    cook:     { distractors: 2 },
    scramble: { count: 8 },                                                    // Activities Hub: 8 random words
    guess:    { options: 5,  maxClues: 2 },                                    // more choices, fewer clues before it's on you
    quiz:     { count: 8,    options: 4 },                                     // 8 random questions, 4 options each
    tictactoe: { botAccuracy: 0.72 },                                          // beatable on purpose — see js/tictactoe.js
  },
  // Reserved for a future release — tuned but not selectable yet.
  master: {
    cook:     { distractors: 3 },
    scramble: { count: 8 },
    guess:    { options: 5,  maxClues: 1 },
    quiz:     { count: 8,    options: 4 },
    tictactoe: { botAccuracy: 0.90 },
  },
};

/* Grade → level rules */
// Default level for a grade group when the child hasn't chosen one.
export function gradeDefault(group) {
  if (group === '4-6') return 'adventurer';
  return 'explorer';   // '1-3' and guests / unknown start gentle
}

// May this grade group change its difficulty? Grade 1–3 is locked to Explorer.
export function canChoose(group) {
  return group !== '1-3';
}

// The levels a grade group is allowed to pick from (Master hidden until ready).
export function allowedLevels(group) {
  const selectable = Object.values(LEVELS).filter(l => l.available).map(l => l.id);
  return canChoose(group) ? selectable : ['explorer'];
}

/* Active level (session-aware) */
function sessionGroup() {
  return (Storage.getSession && Storage.getSession()?.grade_group) || '';
}

// The level in effect right now: the child's saved choice if it's allowed for
// their grade, otherwise their grade's default.
export function currentLevel() {
  const group   = sessionGroup();
  const allowed = allowedLevels(group);
  const chosen  = Storage.getDifficulty && Storage.getDifficulty();
  if (chosen && allowed.includes(chosen)) return chosen;
  const def = gradeDefault(group);
  return allowed.includes(def) ? def : allowed[0];
}

// Persist a chosen level (ignored if not allowed for this grade).
export function setLevel(id) {
  const group = sessionGroup();
  if (!allowedLevels(group).includes(id)) return currentLevel();
  Storage.setDifficulty?.(id);
  return id;
}

// The parameter block for one game at the active (or given) level.
export function paramsFor(game, level = currentLevel()) {
  return (PARAMS[level] || PARAMS.explorer)[game];
}

// Item count for the mission flow (short taste: Explorer 2, Adventurer 4) —
// the Activities Hub uses the larger paramsFor().count instead.
const MISSION_COUNTS = { explorer: 2, adventurer: 4, master: 4 };
export function missionCount(level = currentLevel()) {
  return MISSION_COUNTS[level] || 2;
}
