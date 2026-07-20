// js/tictactoe.js — Cultural Tic-Tac-Toe (Adventurer-only mini-game)
// ─────────────────────────────────────────────────────────────────────────────
// Noughts and crosses where you can't just tap a square — you have to earn it.
// Nine cultural photos fill the board and nine name pills sit beside them; drag
// a name onto the right photo and that square becomes yours (X for Player 1, O
// for Player 2 / the computer). Get it wrong and the turn passes as a penalty.
// Three in a line wins.
//
// The nine elements come from a MIX of states across food / costume / landmark /
// festival, so this is the one game that tests recall ACROSS everything a child
// has explored rather than one state at a time.
//
// ── The invariant that makes the rest simple ────────────────────────────────
// Each square holds one photo, and exactly one pill matches it. A pill is
// consumed ONLY on a correct match, which is also what claims the square. So:
//
//     available pill  ⟷  empty square        (always a bijection)
//
// That means `items[i]` is the answer for square `i`, an unused pill and an
// empty square are the same index, and the bot's "which square?" and "which
// word?" collapse into one decision. If a "pill used but square empty" state
// ever appears, claim() has a bug — don't paper over it.
//
// Note this page is NOT gated on difficulty: the Activity Hub card is the gate.
// Deep-linking here works at any level, which also keeps the UI tests simple.

import Storage from './utils/storage.js';
import { renderTopbar, renderNavbar, requireAuth, flyPoints } from './ui.js';
import { pickItems } from './data/tictactoeItems.js';
import { chooseSquare, winningLine, emptySquares } from './data/tictactoeBot.js';
import { paramsFor } from './data/difficulty.js';
import { showPopup } from './components/popup.js';
import { showHowToPlay, mountHelpButton } from './components/howToPlay.js';
import { initPointerDrag } from './utils/pointerDrag.js';
import { burstConfetti } from './utils/confetti.js';
import { shuffle } from './utils/shuffle.js';
import { escapeHtml } from './utils/dom.js';
import Sound from './utils/sound.js';

requireAuth();

// ── Tuning ────────────────────────────────────────────────────────────────────
/**
 * How often the computer answers correctly (0–1). THIS IS THE DIFFICULTY DIAL.
 * A bot that never misses makes the game unwinnable for a child, so keep it well
 * under 1. The per-level values live in data/difficulty.js; this constant is the
 * fallback and the thing to edit for a quick tweak.
 */
const BOT_ACCURACY  = paramsFor('tictactoe')?.botAccuracy ?? 0.72;
/** Beat before the bot moves, so children can follow what just happened. */
const BOT_DELAY_MIN = 700;
const BOT_DELAY_MAX = 1200;
/** Awarded for beating the computer only — two-player games score nothing. */
const WIN_POINTS    = 15;
const GRID_SIZE     = 9;

const BACK_HREF = 'activities.html';

// Artwork (paths are relative to views/, like every other asset path).
const TTT_ICON = '../assets/images/ui/tic_tac_toe_icon.png';
const MODE_ICONS = {
  bot:     '../assets/images/ui/computer_mode.png',
  hotseat: '../assets/images/ui/player_mode.png',
};

// ── Chrome ────────────────────────────────────────────────────────────────────
renderTopbar({ title: 'Tic-Tac-Toe', showBack: true, backHref: BACK_HREF });
renderNavbar('activities');

// ── Elements ──────────────────────────────────────────────────────────────────
const boardEl    = document.getElementById('ttt-board');
const pillsEl    = document.getElementById('ttt-pills');
const turnEl     = document.getElementById('ttt-turn');
const turnMarkEl = document.getElementById('ttt-turn-mark');
const turnTextEl = document.getElementById('ttt-turn-text');
const feedbackEl = document.getElementById('ttt-feedback');

// ── State ─────────────────────────────────────────────────────────────────────
let items      = [];                    // 9 items; index === square index
let pillOrder  = [];                    // square indices, in pill display order
let board      = Array(GRID_SIZE).fill(null);   // null | 'X' | 'O'
let turn       = 'X';                   // 'X' = Player 1, 'O' = Player 2 / bot
let mode       = 'bot';                 // 'bot' | 'hotseat'
let busy       = false;                 // input lock: bot thinking / result resolving
let selectedSq = null;                  // tap-to-select fallback
let over       = false;
let botTimer   = null;

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const isBotTurn   = () => mode === 'bot' && turn === 'O';
const isHumanTurn = () => !isBotTurn();

function playerName(mark) {
  if (mark === 'X') return 'Player 1';
  return mode === 'bot' ? 'The computer' : 'Player 2';
}

// ── Rendering ─────────────────────────────────────────────────────────────────
function renderBoard() {
  boardEl.innerHTML = items.map((item, i) => `
    <button class="ttt-cell" type="button" role="gridcell" data-square="${i}"
            aria-label="${escapeHtml(item.category)} picture ${i + 1}">
      <img class="ttt-cell-img" src="${item.image}" alt="" loading="lazy"
           onerror="this.replaceWith(Object.assign(document.createElement('span'),
                    {className:'ttt-cell-fallback',textContent:'${item.icon || '🖼️'}'}))">
    </button>`).join('');
}

function renderPills() {
  pillsEl.innerHTML = pillOrder.map(sq => `
    <button class="ttt-pill" type="button" role="listitem" data-square="${sq}">
      ${escapeHtml(items[sq].label)}
    </button>`).join('');
}

function renderTurn() {
  const thinking = isBotTurn() && busy;
  turnEl.classList.toggle('ttt-turn--bot', thinking);
  turnMarkEl.textContent = turn;
  turnMarkEl.classList.toggle('is-x', turn === 'X');
  turnMarkEl.classList.toggle('is-o', turn === 'O');
  turnTextEl.textContent = thinking
    ? 'Rimau is thinking'
    : `${playerName(turn)}'s turn`;
}

function say(message, tone = '') {
  feedbackEl.textContent = message || ' ';
  feedbackEl.className = `ttt-feedback${tone ? ' is-' + tone : ''}`;
}

const cellEl = sq => boardEl.querySelector(`.ttt-cell[data-square="${sq}"]`);
const pillEl = sq => pillsEl.querySelector(`.ttt-pill[data-square="${sq}"]`);

// ── Selection (tap fallback) ──────────────────────────────────────────────────
function selectPill(sq) {
  if (board[sq] !== null) return;                 // its square is already claimed
  selectedSq = selectedSq === sq ? null : sq;     // tapping again deselects
  pillsEl.querySelectorAll('.ttt-pill').forEach(p => {
    p.classList.toggle('is-selected', Number(p.dataset.square) === selectedSq);
  });
  if (selectedSq !== null) Sound.tap();
}

function clearSelection() {
  selectedSq = null;
  pillsEl.querySelectorAll('.ttt-pill.is-selected').forEach(p => p.classList.remove('is-selected'));
}

// ── Core turn logic ───────────────────────────────────────────────────────────
/**
 * One attempt: drop the pill for `pillSq` onto square `targetSq`. They match
 * when the indices are equal (see the invariant at the top of the file).
 * Either way the turn passes — a wrong answer costs you your go.
 */
function attempt(pillSq, targetSq) {
  if (busy || over) return;
  if (board[targetSq] !== null) return;           // already claimed: silent no-op

  busy = true;
  clearSelection();

  if (pillSq === targetSq) {
    Sound.correct();
    claim(targetSq, turn);
    say(`${playerName(turn)} claimed ${items[targetSq].label}!`, 'good');

    const line = winningLine(board, turn);
    if (line) {
      line.forEach(i => cellEl(i)?.classList.add('is-win'));
      busy = false;
      endGame(turn);
      return;
    }
    if (board.every(Boolean)) {                   // must be checked after EVERY claim
      busy = false;
      endGame('draw');
      return;
    }
    passTurn();
  } else {
    Sound.wrong();
    const cell = cellEl(targetSq);
    cell?.classList.add('is-wrong');
    setTimeout(() => cell?.classList.remove('is-wrong'), 600);
    say(`Not a match — ${playerName(turn)} loses a turn!`, 'wrong');
    passTurn();
  }

  busy = false;
  renderTurn();
  if (isBotTurn() && !over) scheduleBot();
}

function claim(sq, mark) {
  board[sq] = mark;
  const cell = cellEl(sq);
  if (cell) {
    cell.classList.add(mark === 'X' ? 'is-x' : 'is-o');
    cell.setAttribute('aria-label', `${items[sq].label} — claimed by ${playerName(mark)}`);
    const badge = document.createElement('span');
    badge.className = 'ttt-cell-mark';
    badge.textContent = mark;
    cell.appendChild(badge);
  }
  pillEl(sq)?.classList.add('is-used');
}

function passTurn() {
  turn = turn === 'X' ? 'O' : 'X';
  clearSelection();
  renderTurn();
}

// ── End of game ───────────────────────────────────────────────────────────────
async function endGame(result) {
  over = true;
  clearSelection();
  clearTimeout(botTimer);

  const draw      = result === 'draw';
  const humanWon  = !draw && (result === 'X' || mode === 'hotseat');

  if (draw) {
    say('A draw — nobody got three in a row!');
    Sound.tap();
  } else {
    say(`${playerName(result)} wins!`, result === 'X' ? 'good' : 'wrong');
    Sound.unlock();
  }

  // Confetti only when a person wins — celebrating a child's loss reads badly.
  if (humanWon) burstConfetti();

  // Points are for beating the computer. Two kids on one tablet could trade
  // wins all afternoon, so hotseat scores nothing.
  let earned = 0;
  if (!draw && result === 'X' && mode === 'bot') {
    earned = WIN_POINTS;
    Storage.addPoints(earned);
    flyPoints(turnEl, earned);
  }

  let message = '';
  if (draw) message = 'The board is full and nobody got three in a row. Great effort!';
  else if (earned) message = `Three in a row! You earned ${earned} points.`;
  else if (result === 'X') message = 'Three in a row!';
  else message = 'Good try — start a new game and take it back!';

  const again = await showPopup({
    cls: 'ttt-win',
    emoji: '',
    dismissible: false,
    title: draw ? "It's a draw!" : `${playerName(result)} wins!`,
    message,
    actions: [
      { label: 'Play again',         value: true,  style: 'primary' },
      { label: 'Back to Activities', value: false, style: 'ghost'   },
    ],
  });

  if (again) resetGame();
  else window.location.href = BACK_HREF;
}

// ── The computer opponent ─────────────────────────────────────────────────────
function scheduleBot() {
  busy = true;
  renderTurn();                                   // shows "Rimau is thinking…"
  clearTimeout(botTimer);
  botTimer = setTimeout(botMove, BOT_DELAY_MIN + Math.random() * (BOT_DELAY_MAX - BOT_DELAY_MIN));
}

function botMove() {
  if (over) { busy = false; return; }

  const empties = emptySquares(board);
  if (!empties.length) { busy = false; return; }

  // Which square it WANTS — standard strategy: win, else block, else centre,
  // else a corner, else anything.
  const target = chooseSquare(board, 'O', 'X');

  // Then the accuracy roll decides whether it actually gets the answer right.
  // On a miss it still drags onto the square it was going for, just with the
  // wrong word — so its thinking stays legible to the child, and it forfeits
  // the turn exactly like a human wrong answer.
  let pill = target;
  if (Math.random() >= BOT_ACCURACY) {
    const wrongOptions = empties.filter(i => i !== target);
    // With one square left a miss is inexpressible (no other pill to drag), so
    // the bot is forced correct. Harmless — the game ends on that move anyway.
    if (wrongOptions.length) pill = wrongOptions[Math.floor(Math.random() * wrongOptions.length)];
  }

  busy = false;                                   // attempt() re-locks immediately
  animateBotDrag(pill, target, () => attempt(pill, target));
}

/**
 * Slide a ghost pill from the pill column onto the target square, so the bot's
 * move is something a child can SEE rather than a square silently flipping.
 */
function animateBotDrag(pillSq, targetSq, done) {
  const from = pillEl(pillSq);
  const to   = cellEl(targetSq);
  if (reduceMotion || !from || !to) { done(); return; }

  const a = from.getBoundingClientRect();
  const b = to.getBoundingClientRect();

  const ghost = from.cloneNode(true);
  ghost.classList.add('ce-drag-ghost');
  ghost.style.cssText = `
    position:fixed; left:0; top:0; margin:0; z-index:10000; pointer-events:none;
    width:${a.width}px; height:${a.height}px;
    transform:translate3d(${a.left}px, ${a.top}px, 0);
    transition:transform .45s cubic-bezier(.34,1.1,.64,1);
  `;
  document.body.appendChild(ghost);

  // Aim at the centre of the target square.
  const endX = b.left + (b.width - a.width) / 2;
  const endY = b.top  + (b.height - a.height) / 2;
  requestAnimationFrame(() => {
    ghost.style.transform = `translate3d(${endX}px, ${endY}px, 0)`;
  });

  setTimeout(() => { ghost.remove(); done(); }, 480);
}

// ── Input wiring ──────────────────────────────────────────────────────────────
// Delegated, so it survives every re-render and only needs setting up once.
initPointerDrag({
  sourceRoot:     pillsEl,
  sourceSelector: '.ttt-pill',
  targetSelector: '.ttt-cell',
  isEnabled: el => !busy && !over && isHumanTurn() && !el.classList.contains('is-used'),
  createGhost: el => {
    const g = el.cloneNode(true);
    g.classList.remove('is-selected');
    return g;
  },
  onDragStart: el => { clearSelection(); el.classList.add('is-dragging'); },
  onDragOver:  (over_, prev) => {
    prev?.classList.remove('is-over');
    if (over_ && !over_.classList.contains('is-x') && !over_.classList.contains('is-o')) {
      over_.classList.add('is-over');
    }
  },
  onTap: el => selectPill(Number(el.dataset.square)),
  onDrop: (el, target) => {
    el.classList.remove('is-dragging');
    boardEl.querySelectorAll('.ttt-cell.is-over').forEach(c => c.classList.remove('is-over'));
    // Released outside any square: no turn lost, the pill just goes home.
    if (target) attempt(Number(el.dataset.square), Number(target.dataset.square));
  },
});

// Tap a square to drop the pill you've already selected (the fallback path),
// and the keyboard route for the same thing.
boardEl.addEventListener('click', e => {
  const cell = e.target.closest('.ttt-cell');
  if (!cell || busy || over || !isHumanTurn()) return;
  if (selectedSq === null) {
    say('Pick a name card first, then tap its picture.');
    return;
  }
  attempt(selectedSq, Number(cell.dataset.square));
});

// Pills are <button>s, so Enter/Space already fire `click` — but pointerdown has
// no click of its own, so route the key explicitly and skip click entirely.
pillsEl.addEventListener('keydown', e => {
  if (e.key !== 'Enter' && e.key !== ' ') return;
  const pill = e.target.closest('.ttt-pill');
  if (!pill || busy || over || !isHumanTurn()) return;
  e.preventDefault();
  selectPill(Number(pill.dataset.square));
});

// ── Round lifecycle ───────────────────────────────────────────────────────────
function dealRound() {
  items     = pickItems(GRID_SIZE);
  pillOrder = shuffle(items.map((_, i) => i));   // pill order is independent of grid order
  board     = Array(GRID_SIZE).fill(null);
  turn      = 'X';
  busy      = false;
  over      = false;
  selectedSq = null;
  clearTimeout(botTimer);

  renderBoard();
  renderPills();
  renderTurn();
  say('Drag a name onto its picture!');
}

async function chooseMode() {
  const choice = await showPopup({
    cls: 'ttt-mode',
    emoji: '',
    dismissible: false,
    title: 'Choose a play mode:',
    message: '',
    actionsLayout: 'row',
    actions: [
      { label: 'Play against the computer', value: 'bot',     style: 'mode', image: MODE_ICONS.bot },
      { label: 'Two player game',           value: 'hotseat', style: 'mode', image: MODE_ICONS.hotseat },
    ],
  });
  mode = choice || 'bot';
  renderTurn();
}

async function resetGame() {
  document.querySelectorAll('.ce-drag-ghost, .confetti-piece').forEach(n => n.remove());
  dealRound();
  await chooseMode();
}

// ── Boot ──────────────────────────────────────────────────────────────────────
// Deal first so the instruction demo can show a real photo from this round.
dealRound();

const demoItem = items[0];
const DEMO_HTML = `
  <div class="ttt-demo" aria-hidden="true">
    <div class="ttt-demo-card">
      <img src="${demoItem.image}" alt=""
           onerror="this.replaceWith(Object.assign(document.createElement('span'),
                    {className:'ttt-cell-fallback',textContent:'${demoItem.icon || '🖼️'}'}))">
      <span class="ttt-demo-tick">✓</span>
    </div>
    <span class="ttt-demo-pill">${escapeHtml(demoItem.label)}</span>
  </div>`;

const HOW_TO_PLAY = {
  title: 'Match each word with the correct picture!',
  emoji: '',
  image: TTT_ICON,
  cls: 'ttt-howto',
  // Above the words: children look at the demo first and often need nothing else.
  topHtml: DEMO_HTML,
  lines: [
    '👆 Drag a name onto the picture it belongs to.',
    '✅ Get it right and the square is yours.',
    '❌ Get it wrong and your turn passes!',
    '🏆 Three squares in a line wins the game.',
  ],
  buttonLabel: 'Play',
};

// The rules come first EVERY time the page is opened, then the mode picker —
// never both at once. `initHowToPlay` is deliberately not used here: it only
// auto-shows on the first visit, and this game is meant to re-teach the rule
// each session. It still mounts the "?" button to re-open on demand.
mountHelpButton(HOW_TO_PLAY);
showHowToPlay(HOW_TO_PLAY).then(chooseMode);
