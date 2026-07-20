// js/data/difficulty.js — grade-based difficulty tiers for the missions & games.
// ─────────────────────────────────────────────────────────────────────────────
// Supervisor feedback (see docs/MINIGAMES_CLAUDE_CODE_GUIDE.md §4): the grades
// must play at different difficulty. We keep the SAME screens and engines and
// only vary parameters per level, so there is one game — not two.
//
//   Level        Feel            Who plays it
//   ──────────   ─────────────   ────────────────────────────────────────────
//   explorer 🌱  gentle / guided  Grade 1–3 (locked here) + default for guests
//   adventurer 🔥 a real challenge Default for the older cohort (Grade 4–6)
//   master ⚡    hardest          Reserved — defined but not selectable yet
//
// * Grade→group note: the account stores a grade GROUP ('1-3','4-6'). The
//   younger group '1-3' is locked to Explorer (gentle tier); the older group
//   '4-6' is the "can choose" cohort — they DEFAULT to Adventurer but can drop
//   to Explorer. Master stays hidden (available:false) for a future release.
//
//   import { currentLevel, setLevel, paramsFor } from './data/difficulty.js';
//   const dp = paramsFor('cook');      // params for the active level

import Storage from '../utils/storage.js';

// ── Level catalogue ─────────────────────────────────────────────────────────
// `available:false` levels are defined (so games already have their params) but
// are not offered in the picker yet.
export const LEVELS = {
  explorer:   { id: 'explorer',   name: 'Explorer',   emoji: '🌱', tagline: 'Gentle and guided',  available: true  },
  adventurer: { id: 'adventurer', name: 'Adventurer', emoji: '🔥', tagline: 'A real challenge',    available: true  },
  master:     { id: 'master',     name: 'Master',     emoji: '⚡', tagline: 'Coming soon!',        available: false },
};

// ── Per-level, per-game parameters ──────────────────────────────────────────
// Each mini-game reads exactly the block it needs. Higher level = harder:
// fewer helping options, tighter timing, longer play, more distractors.
const PARAMS = {
  explorer: {
    cook:     { distractors: 1 },                                              // Help the Chef: fewer wrong ingredients
    scramble: { count: 4 },                                                    // Activities Hub: 4 random words
    guess:    { options: 3,  maxClues: 4 },                                    // fewer choices, all clues available
    quiz:     { count: 4,    options: 3 },                                     // 4 random questions, 3 options each
    // Unreachable today (the game is Adventurer-only), but tuned so opening it
    // up to Explorer is a one-line change in activities.js.
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

// ── Grade → level rules ──────────────────────────────────────────────────────
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

// ── Active level (session-aware) ─────────────────────────────────────────────
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

// Item count for the MISSION flow (Mission 2 Word Scramble, Mission 4 Quiz). The
// mission is a short, focused taste — Explorer 2, Adventurer 4 — whereas the
// Activities Hub uses the larger `paramsFor('quiz'/'scramble').count` (4 / 8) so
// children can explore many more questions/words there.
const MISSION_COUNTS = { explorer: 2, adventurer: 4, master: 4 };
export function missionCount(level = currentLevel()) {
  return MISSION_COUNTS[level] || 2;
}
