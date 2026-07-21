/* tictactoeItems.js — the cultural element pool for Cultural Tic-Tac-Toe */

// A round needs 9 elements (photo + name), drawn from a mix of states for
// cross-state recall. Source of truth is each state's `dragPairs` in states.js
// (6 states × 4 in [food, costume, landmark, festival] order, all with real photos).
// Pure module (no DOM/storage), so it's unit-testable.

import { STATES_DATA } from './states.js';
import { shuffle } from '../utils/shuffle.js';

// dragPairs order is a fixed contract in states.js; index → category.
export const CATEGORIES = ['food', 'costume', 'landmark', 'festival'];

// "Do not use 9 items from one state" — capping at 2 keeps every round spread
// across at least 5 of the 6 states.
export const MAX_PER_STATE = 2;

// Every playable element, flattened across all states (6 × 4 = 24 today).
export function itemPool() {
  return STATES_DATA.flatMap(state =>
    (state.dragPairs || []).slice(0, CATEGORIES.length).map((pair, i) => ({
      id:        `${state.id}-${CATEGORIES[i]}`,
      label:     pair.label,
      image:     pair.image,
      icon:      pair.icon,        // emoji fallback if the photo 404s
      stateId:   state.id,
      stateName: state.name,
      category:  CATEGORIES[i],
    }))
  );
}

function tally(list, key) {
  return list.reduce((acc, it) => { acc[it[key]] = (acc[it[key]] || 0) + 1; return acc; }, {});
}

// Draw `n` elements for one round, spread across states and categories.
// Phase 1: one per state, rotating the category. Phase 2: top up from the
// least-used categories, honouring MAX_PER_STATE and never repeating a name.
export function pickItems(n = 9) {
  const pool = itemPool().filter(it => it.image && it.label);

  // Phase 1: breadth — one per state, rotating the category.
  const byState = pool.reduce((acc, it) => {
    (acc[it.stateId] = acc[it.stateId] || []).push(it);
    return acc;
  }, {});
  const cats   = shuffle(CATEGORIES);
  const chosen = [];

  shuffle(Object.keys(byState)).forEach((stateId, i) => {
    if (chosen.length >= n) return;
    const list = byState[stateId];
    const want = cats[i % cats.length];
    chosen.push(list.find(x => x.category === want) || list[0]);
  });

  // Phase 2: top up, preferring under-represented categories.
  const perState = tally(chosen, 'stateId');
  const perCat   = tally(chosen, 'category');
  const rest     = shuffle(pool.filter(x => !chosen.includes(x)))
    .sort((a, b) => (perCat[a.category] || 0) - (perCat[b.category] || 0));

  for (const it of rest) {
    if (chosen.length >= n) break;
    if ((perState[it.stateId] || 0) >= MAX_PER_STATE) continue;
    if (chosen.some(c => c.label === it.label)) continue;   // never two identical pills
    chosen.push(it);
    perState[it.stateId] = (perState[it.stateId] || 0) + 1;
    perCat[it.category]  = (perCat[it.category]  || 0) + 1;
  }

  // Final shuffle IS the grid order — square i shows chosen[i].
  return shuffle(chosen).slice(0, n);
}
