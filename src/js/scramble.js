// js/scramble.js — Word Scramble (first activity in the per-state journey).
//
// Unscramble cultural keywords for the current state by tapping letter tiles
// into answer slots. On finishing all words, advance to the Drag-Match game.

import Storage from './utils/storage.js';
import { renderTopbar, renderNavbar, requireAuth, getStateParam, flyPoints } from './ui.js';
import { getState } from './data/states.js';
import { scrambleWordsFor } from './data/scramble.js';
import { costumeWordsFor } from './data/costumeMissions.js';
import { paramsFor } from './data/difficulty.js';
import { showPopup } from './components/popup.js';
import { initHowToPlay } from './components/howToPlay.js';
import { launchContext } from './utils/launchContext.js';
import Sound from './utils/sound.js';

requireAuth();

const stateId = getStateParam();
const state   = getState(stateId);

if (!state) {
  showPopup({
    title: 'State not found',
    emoji: '🧭',
    message: "We couldn't find that state. Let's go back to the map and pick one!",
    actions: [{ label: 'Back to Map', value: 'map', style: 'primary' }],
  }).then(() => { window.location.href = 'map.html'; });
  throw new Error('State not found: ' + stateId);
}

// ── Launch context ────────────────────────────────────────────────────────────
// In the linear journey the back button goes to narrative and the finish CTA
// on to Drag-Match.
const { fromActivities, fromMission, missionId, missionsHref, missionsDoneHref } =
  launchContext(stateId);
const activitiesHref = `activities.html?state=${stateId}`;
const nextHref = fromMission ? missionsDoneHref
              : fromActivities ? activitiesHref
              : `activity.html?state=${stateId}`;

// ── Chrome ──────────────────────────────────────────────────────────────────
renderTopbar({
  title:      'Word Scramble',
  showBack:   true,
  backHref:   fromMission ? missionsHref : fromActivities ? activitiesHref : `narrative.html?state=${stateId}`,
  showPoints: true,
  color:      null,
});
renderNavbar('activities');

// Finish button: back to the hub/mission when replaying, else forward to Drag-Match.
const scrNext = document.getElementById('scr-next');
scrNext.href = nextHref;
if (fromMission)         scrNext.textContent = '✅ Mission Complete!';
else if (fromActivities) scrNext.textContent = '🎮 Back to Activities';

// ── Data ──────────────────────────────────────────────────────────────────────
// Difficulty tunes the set size: Explorer plays only the shortest couple of
// words, Adventurer plays them all. Both levels can tap letters OR type them.
const scrParams = paramsFor('scramble');
// The Dancer mission teaches costume: reuse the exact garment names the mission
// spotlight just taught (Discover → Play), so unscrambling reinforces real
// vocabulary. Everywhere else, derive words from the state's own card data.
const costumeWords = (fromMission && missionId === 'dancer') ? costumeWordsFor(stateId) : [];
let words = costumeWords.length ? costumeWords : scrambleWordsFor(state);
if (scrParams.count !== 'all') {
  words = [...words]
    .sort((a, b) => a.answer.length - b.answer.length)
    .slice(0, scrParams.count);
}
const POINTS_PER_WORD = 10;
const HINT_COST = 5;

// DOM refs
const progressEl = document.getElementById('scr-progress');
const scoreEl    = document.getElementById('scr-score');
const emojiEl    = document.getElementById('scr-emoji');
const hintEl     = document.getElementById('scr-hint');
const slotsEl    = document.getElementById('scr-slots');
const tilesEl    = document.getElementById('scr-tiles');
const feedbackEl = document.getElementById('scr-feedback');
const clearBtn   = document.getElementById('scr-clear');
const hintBtn    = document.getElementById('scr-hint-btn');
const gameEl     = document.getElementById('scr-game');
const completeEl = document.getElementById('scr-complete');

let wordIdx  = 0;
let earned   = 0;
let placed   = [];     // tile indices placed into slots, in order
let locked   = false;  // true briefly after a correct answer
let hintUsed = false;  // one paid hint per word

// If a state yields no words, skip straight to the next destination.
if (!words.length) {
  window.location.href = nextHref;
}

// ── Shuffle helper (avoids returning the solved order for len > 1) ─────────────
function shuffled(letters) {
  const arr = [...letters];
  for (let attempt = 0; attempt < 6; attempt++) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    if (arr.length < 2 || arr.join('') !== letters.join('')) break;
  }
  return arr;
}

// ── Render the current word ────────────────────────────────────────────────────
function loadWord(idx) {
  locked = false;
  placed = [];
  hintUsed = false;
  if (hintBtn) { hintBtn.disabled = false; hintBtn.textContent = `💡 Hint (−${HINT_COST} pts)`; }
  const { answer, hint, emoji } = words[idx];

  progressEl.textContent = `Word ${idx + 1} of ${words.length}`;
  scoreEl.textContent    = `${earned} pts`;
  emojiEl.textContent    = emoji;
  hintEl.textContent     = hint;
  feedbackEl.innerHTML   = '&nbsp;';

  // Answer slots — one empty box per letter
  slotsEl.innerHTML = answer.split('').map((_, i) =>
    `<span class="scr-slot" data-slot="${i}"></span>`
  ).join('');

  // Scrambled tiles — keep tile index so duplicate letters are handled
  const order = shuffled(answer.split(''));
  tilesEl.innerHTML = order.map((ch, i) =>
    `<button class="scr-tile drop-in" type="button" style="--i:${i}" data-tile="${i}" data-letter="${ch}">${ch}</button>`
  ).join('');
}

// ── Place / remove letters ──────────────────────────────────────────────────────
// Placing is shared by tapping a tile AND typing on the keyboard, so both input
// methods stay in sync on the same answer slots.
function placeTile(tile) {
  if (!tile || locked || tile.classList.contains('used')) return;

  const slot = slotsEl.querySelector(`.scr-slot:not(.filled)`);
  if (!slot) return;

  slot.textContent = tile.dataset.letter;
  slot.classList.add('filled');
  slot.dataset.tile = tile.dataset.tile;
  tile.classList.add('used');
  placed.push(tile.dataset.tile);

  if (placed.length === words[wordIdx].answer.length) check();
}

// Remove one specific placed letter, returning its tile to the tray. Used both
// by tapping a placed (greyed) tile and — for the last letter — by Backspace.
// The freed slot becomes the next slot placeTile() fills, so removing a letter
// in the middle and retyping just drops back into the same gap.
function removeTile(tileIdx) {
  if (locked) return;
  const pos = placed.indexOf(tileIdx);
  if (pos === -1) return;
  placed.splice(pos, 1);
  const slot = slotsEl.querySelector(`.scr-slot[data-tile="${tileIdx}"]`);
  if (slot) {
    slot.textContent = '';
    slot.classList.remove('filled', 'wrong');
    delete slot.dataset.tile;
  }
  tilesEl.querySelector(`.scr-tile[data-tile="${tileIdx}"]`)?.classList.remove('used');
  feedbackEl.innerHTML = '&nbsp;';
}

// Remove the most recently placed letter (used by Backspace).
function removeLast() {
  if (locked || !placed.length) return;
  removeTile(placed[placed.length - 1]);
}

// Tap a tile: an unused tile drops into the next slot; a placed (greyed) tile
// pops back out — so tapping is both "place" and "un-place".
tilesEl.addEventListener('click', e => {
  const tile = e.target.closest('.scr-tile');
  if (!tile) return;
  if (tile.classList.contains('used')) removeTile(tile.dataset.tile);
  else placeTile(tile);
});

// Type on the keyboard: a letter fills the next slot using a matching unused
// tile; Backspace removes the last placed letter. Both input methods (tap +
// type) are always available. Case-insensitive match.
document.addEventListener('keydown', e => {
  if (locked) return;
  if (e.key === 'Backspace') { e.preventDefault(); removeLast(); return; }
  if (e.key.length !== 1) return;
  const ch = e.key.toUpperCase();
  if (ch < 'A' || ch > 'Z') return;
  const tile = [...tilesEl.querySelectorAll('.scr-tile:not(.used)')]
    .find(t => (t.dataset.letter || '').toUpperCase() === ch);
  if (tile) placeTile(tile);
});

function clearWord() {
  if (locked) return;
  placed = [];
  slotsEl.querySelectorAll('.scr-slot').forEach(s => {
    s.textContent = '';
    s.classList.remove('filled', 'correct', 'wrong', 'shake', 'burst');
    delete s.dataset.tile;
  });
  tilesEl.querySelectorAll('.scr-tile').forEach(t => t.classList.remove('used'));
  feedbackEl.innerHTML = '&nbsp;';
}
clearBtn.addEventListener('click', clearWord);

// ── Hint: reveal the first letter + a fuller description (costs points) ─────────
function useHint() {
  if (locked || hintUsed) return;

  if (!Storage.spendPoints(HINT_COST)) {
    Sound.wrong();
    feedbackEl.textContent = `Need ${HINT_COST} pts for a hint — keep playing to earn more! ⭐`;
    return;
  }

  hintUsed = true;
  hintBtn.disabled = true;
  Sound.tap();
  flyPoints(scoreEl, -HINT_COST);            // "−5" floats up from the score

  const { answer, desc } = words[wordIdx];

  // Show the richer description (fun fact / meaning) in place of the short hint.
  if (desc) hintEl.textContent = desc;

  // Reveal the first letter: clear the row, then drop the matching tile into slot 1.
  clearWord();
  const firstCh = answer[0];
  const tile = [...tilesEl.querySelectorAll('.scr-tile:not(.used)')]
    .find(t => (t.dataset.letter || '').toUpperCase() === firstCh.toUpperCase());
  if (tile) placeTile(tile);

  feedbackEl.textContent = `💡 The first letter is "${firstCh}"`;
}
hintBtn.addEventListener('click', useHint);

// ── Check the assembled answer ────────────────────────────────────────────────
function check() {
  const guess  = [...slotsEl.querySelectorAll('.scr-slot')].map(s => s.textContent).join('');
  const answer = words[wordIdx].answer;

  if (guess === answer) {
    locked = true;
    Sound.correct();
    slotsEl.querySelectorAll('.scr-slot').forEach(s => s.classList.add('correct', 'burst'));
    earned += POINTS_PER_WORD;
    // In the mission flow the flat +25 mission bonus is the only reward, so the
    // per-word points are NOT persisted (keeps a state worth exactly 100).
    if (!fromMission) Storage.addPoints(POINTS_PER_WORD);
    scoreEl.textContent  = `${earned} pts`;
    flyPoints(scoreEl, POINTS_PER_WORD);       // "+N" floats up from the score
    feedbackEl.textContent = `✅ Correct! +${POINTS_PER_WORD} pts`;

    setTimeout(() => {
      wordIdx++;
      if (wordIdx < words.length) loadWord(wordIdx);
      else finish();
    }, 1100);
  } else {
    Sound.wrong();
    slotsEl.querySelectorAll('.scr-slot').forEach(s => s.classList.add('wrong', 'shake'));
    feedbackEl.textContent = '❌ Not quite — try again!';
    setTimeout(clearWord, 700);
  }
}

// ── Finish → advance to the next game (Drag-Match) ─────────────────────────────
function finish() {
  Sound.unlock();
  gameEl.classList.add('hidden');
  document.getElementById('scr-complete-sub').textContent =
    `You earned +${earned} pts unscrambling ${state.name}'s words!`;
  completeEl.classList.remove('hidden');
}

// ── Kick off ────────────────────────────────────────────────────────────────────
if (words.length) loadWord(0);

// ── Kid-friendly "How to Play" (first visit + a "?" button to re-open) ────────
initHowToPlay('scramble', {
  title: 'Word Scramble!', emoji: '🔤',
  lines: ['🔀 The letters are all mixed up.', '👆 Tap them in the right order.', '📝 Spell the word to win!'],
});
