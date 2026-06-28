// js/data/scramble.js — derive Word Scramble words from a state's own data.
//
// Reuses existing content (no new word lists to maintain): the state's dialect
// word + the most iconic single word from each cultural card title. Returns up
// to 3 longer, recognisable words with a kid-friendly hint and an emoji.

// Longest single alphabetic token in a string — guarantees a one-word, A–Z
// answer (no spaces/hyphens) so the letter-tile game stays clean.
function longestToken(str) {
  return (String(str).match(/[A-Za-z]+/g) || [])
    .sort((a, b) => b.length - a.length)[0] || '';
}

export function scrambleWordsFor(state) {
  if (!state) return [];

  const candidates = [];

  // Dialect word — reduce to its longest single token; hint is its meaning.
  // `desc` is the richer explanation shown when the player taps the Hint button.
  if (state.dialectWord?.word) {
    const tok = longestToken(state.dialectWord.word);
    if (tok.length >= 4) {
      candidates.push({
        word:  tok,
        hint:  state.dialectWord.meaning,
        desc:  `A special ${state.name} word — ${state.dialectWord.meaning}.`,
        emoji: '💬',
      });
    }
  }

  // From each card title, take the longest word (usually the iconic name, e.g.
  // "Georgetown", "Thaipusam"). Hint = category, so it never reveals the answer;
  // `desc` carries the card's fun fact for the in-game Hint button.
  (state.cards || []).forEach(card => {
    const tok = longestToken(card.title);
    if (tok.length >= 4) {
      candidates.push({
        word:  tok,
        hint:  `${card.category} of ${state.name}`,
        desc:  card.funFact || card.desc || `${card.category} of ${state.name}.`,
        emoji: card.icon || '🃏',
      });
    }
  });

  // Dedupe (case-insensitive), prefer longer words, keep up to 3.
  const seen = new Set();
  return candidates
    .filter(c => {
      const k = c.word.toLowerCase();
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    })
    .sort((a, b) => b.word.length - a.word.length)
    .slice(0, 3)
    .map(c => ({ answer: c.word.toUpperCase(), hint: c.hint, desc: c.desc, emoji: c.emoji }));
}
