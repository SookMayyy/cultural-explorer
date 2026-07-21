/* scramble.js — build a mixed cultural Word-Scramble bank for a state */

// Derived from each state's existing content (food/costume/landmark/festival +
// dialect), so it always stays in sync. Each entry has a category, hint, richer
// `desc` (paid Hint button) and emoji. Every state yields 10+ mixed words.

import { foodMissionFor } from './foodMissions.js';
import { costumeWordsFor } from './costumeMissions.js';
import { landmarkTourFor } from './landmarkMissions.js';
import { festivalMissionFor } from './festivalMissions.js';

// Longest alphabetic token — a one-word A–Z answer so the tile game stays clean
// (e.g. "Mount Kinabalu" → "KINABALU").
function longestToken(str) {
  return (String(str).match(/[A-Za-z]+/g) || [])
    .sort((a, b) => b.length - a.length)[0] || '';
}

// Generic/awkward tokens to skip so the puzzle stays recognisably "cultural".
const STOP = new Set([
  'LARD', 'MEAT', 'RICE', 'BLUE', 'FRIED', 'FRESH', 'WITH', 'THE', 'AND',
  'FESTIVAL', 'HERITAGE', 'TRADITIONAL', 'DRESS', 'FOOD', 'PLACE', 'CITY',
]);

export function scrambleWordsFor(state) {
  if (!state) return [];
  const out = [];
  const seen = new Set();

  // Add a candidate if it is a clean, new, non-generic word of a sensible length.
  const add = (raw, { category, hint, desc, emoji, min = 4 }) => {
    const word = longestToken(raw).toUpperCase();
    if (word.length < min || word.length > 11) return;
    if (STOP.has(word) || seen.has(word)) return;
    seen.add(word);
    out.push({ answer: word, hint, desc: desc || hint, emoji, category });
  };

  const stateName = state.name;

  // 🍜 FOOD — the dish's real ingredients (taught in the Chef mission).
  const food = foodMissionFor(state.id);
  if (food) {
    for (const ing of food.ingredients || []) {
      add(ing.name, {
        category: 'food',
        hint:  `An ingredient in ${food.dish}`,
        desc:  ing.blurb || `${ing.name} — used in ${stateName}'s ${food.dish}.`,
        emoji: ing.emoji || '🍜',
      });
    }
  }

  // 👗 COSTUME — the garment names taught in the Dancer mission spotlight.
  for (const c of costumeWordsFor(state.id)) {
    add(c.answer, { category: 'costume', hint: c.hint, desc: c.desc, emoji: c.emoji || '👗' });
  }

  // 📍 LANDMARK — famous places, from the guided tour + the state's landmark cards.
  for (const stop of landmarkTourFor(state.id)) {
    add(stop.name, {
      category: 'landmark', min: 5,
      hint:  `A famous place in ${stateName}`,
      desc:  stop.text || `${stop.name} — a famous place in ${stateName}.`,
      emoji: stop.emoji || '📍',
    });
  }
  for (const card of (state.cards || []).filter(c => c.category === 'Landmark')) {
    add(card.title, {
      category: 'landmark', min: 5,
      hint:  `A famous place in ${stateName}`,
      desc:  card.funFact || card.desc || `${card.title} — a famous place in ${stateName}.`,
      emoji: card.icon || '📍',
    });
  }

  // 🎉 FESTIVAL — the state's festival name, plus its festival/celebration card.
  const fest = festivalMissionFor(state.id);
  const festCard = (state.cards || []).find(c => c.category === 'Festival');
  if (fest?.festival) {
    add(fest.festival, {
      category: 'festival',
      hint:  `A festival celebrated in ${stateName}`,
      desc:  festCard?.funFact || `${fest.festival} — a festival celebrated in ${stateName}.`,
      emoji: festCard?.icon || '🎉',
    });
  }
  if (festCard) {
    add(festCard.title, {
      category: 'festival',
      hint:  `A festival celebrated in ${stateName}`,
      desc:  festCard.funFact || festCard.desc || `A festival celebrated in ${stateName}.`,
      emoji: festCard.icon || '🎉',
    });
  }

  // 💬 DIALECT — the state's special word (one extra, for flavour).
  if (state.dialectWord?.word) {
    add(state.dialectWord.word, {
      category: 'dialect',
      hint:  state.dialectWord.meaning,
      desc:  `A special ${stateName} word — ${state.dialectWord.meaning}.`,
      emoji: '💬',
    });
  }

  return out;
}
