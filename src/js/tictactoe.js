/* tictactoe.js — Cultural Tic-Tac-Toe (Adventurer-only mini-game) */

// Noughts and crosses where you earn a square by dragging the right name pill onto
// its photo (X = Player 1, O = Player 2 / computer). A wrong match passes the turn.
// The nine elements mix states across food/costume/landmark/festival.
//
// Invariant: each square holds one photo and exactly one pill matches it; a pill is
// consumed only on a correct match, which claims the square. So `items[i]` is the
// answer for square `i`, and an unused pill ⟷ an empty square (a bijection). A
// "pill used but square empty" state means claim() has a bug.
//
// This page is not gated on difficulty — the Activity Hub card is the gate.

import Storage from './utils/storage.js';
import { renderTopbar, renderNavbar, requireAuth, flyPoints } from './ui.js';
import { pickItems } from './data/tictactoeItems.js';
import { chooseSquare, winningLine, emptySquares } from './data/tictactoeBot.js';
import { paramsFor } from './data/difficulty.js';
import { showPopup } from './components/popup.js';
import { initHowToPlay } from './components/howToPlay.js';
import { initPointerDrag } from './utils/pointerDrag.js';
import { burstConfetti } from './utils/confetti.js';
import { shuffle } from './utils/shuffle.js';
import { escapeHtml } from './utils/dom.js';
import { assetImg } from './utils/assetImg.js';
import { mascotPose } from './data/mascots.js';
import Sound from './utils/sound.js';

requireAuth();

/* Tuning */
// How often the computer answers correctly (0–1) — the difficulty dial. Keep it
// well under 1 or the game is unwinnable. Per-level values live in difficulty.js.
const BOT_ACCURACY  = paramsFor('tictactoe')?.botAccuracy ?? 0.72;
// Beat before the bot moves, so children can follow what happened.
const BOT_DELAY_MIN = 700;
const BOT_DELAY_MAX = 1200;
const WIN_POINTS    = 15;   // beating the computer only — hotseat scores nothing
const GRID_SIZE     = 9;

// Rimau softens a loss (the moment a child is most likely to quit). Several lines
// so a run of losses doesn't feel canned; `wave`, not `happy`/`cheer` (no gloating).
const RIMAU_LINES = [
  "So close! Want to try again?",
  "Good try! You'll get it next time.",
  "Nice matching — one more game?",
  "Don't give up, you're learning lots!",
];

const BACK_HREF = 'activities.html';

// Artwork (paths are relative to views/, like every other asset path).
const TTT_ICON = '../assets/images/ui/tic_tac_toe_icon.png';
const MODE_ICONS = {
  bot:     '../assets/images/ui/computer_mode.png',
  hotseat: '../assets/images/ui/player_mode.png',
};

/* Chrome */
renderTopbar({ title: 'Tic-Tac-Toe', showBack: true, backHref: BACK_HREF });
renderNavbar('activities');

/* Elements */
const boardEl    = document.getElementById('ttt-board');
const pillsEl    = document.getElementById('ttt-pills');
const turnEl     = document.getElementById('ttt-turn');
const turnMarkEl = document.getElementById('ttt-turn-mark');
const turnTextEl = document.getElementById('ttt-turn-text');
const feedbackEl = document.getElementById('ttt-feedback');

/* State */
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

// vs the computer the child is player one ("You"); hotseat keeps numbered names.
function playerName(mark) {
  if (mode === 'bot') return mark === 'X' ? 'You' : 'The computer';
  return mark === 'X' ? 'Player 1' : 'Player 2';
}

// "You claimed …" but "You LOSE a turn" — the verb has to agree with "You".
function verb(mark, thirdPerson, secondPerson) {
  return (mode === 'bot' && mark === 'X') ? secondPerson : thirdPerson;
}

// "Player 1's turn" / "Player 2's turn", but "Your turn" — not "You's turn".
function turnLabel(mark) {
  return (mode === 'bot' && mark === 'X') ? 'Your turn' : `${playerName(mark)}'s turn`;
}

// "Player 1 wins!" / "The computer wins!", but "You win!" — not "You wins!".
function winLabel(mark) {
  return `${playerName(mark)} ${verb(mark, 'wins', 'win')}!`;
}

/* Rendering */
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
    : turnLabel(turn);
}

function say(message, tone = '') {
  feedbackEl.textContent = message || ' ';
  feedbackEl.className = `ttt-feedback${tone ? ' is-' + tone : ''}`;
}

const cellEl = sq => boardEl.querySelector(`.ttt-cell[data-square="${sq}"]`);
const pillEl = sq => pillsEl.querySelector(`.ttt-pill[data-square="${sq}"]`);

/* Selection (tap fallback) */
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

/* Core turn logic */
// Drop the pill for `pillSq` onto `targetSq` — a match iff the indices are equal.
// Either way the turn passes (a wrong answer costs your go).
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
    say(`Not a match — ${playerName(turn)} ${verb(turn, 'loses', 'lose')} a turn!`, 'wrong');
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

/* End of game */
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
    say(winLabel(result), result === 'X' ? 'good' : 'wrong');
    Sound.unlock();
  }

  // Confetti only when a person wins.
  if (humanWon) burstConfetti();

  // Points are for beating the computer; hotseat scores nothing.
  let earned = 0;
  if (!draw && result === 'X' && mode === 'bot') {
    earned = WIN_POINTS;
    Storage.addPoints(earned);
    flyPoints(turnEl, earned);
  }

  // Beaten by the computer: Rimau encourages instead of a bare "you lost" (bot mode only).
  const lostToBot = !draw && result === 'O' && mode === 'bot';

  let message = '';
  if (draw) message = 'The board is full and nobody got three in a row. Great effort!';
  else if (earned) message = `Three in a row! You earned ${earned} points.`;
  else if (result === 'X') message = 'Three in a row — nice matching!';
  else if (!lostToBot) message = 'Good game! Start a new one and take it back.';
  // lostToBot leaves `message` empty — Rimau's speech bubble says it instead.

  const rimauHtml = lostToBot ? `
    <div class="ttt-rimau">
      <p class="ttt-rimau-bubble">${escapeHtml(
        RIMAU_LINES[Math.floor(Math.random() * RIMAU_LINES.length)])}</p>
      ${assetImg(mascotPose('wave'), '🐯', { alt: 'Rimau', cls: 'ttt-rimau-fig' })}
    </div>` : '';

  const again = await showPopup({
    cls: lostToBot ? 'ttt-win ttt-win--lost' : 'ttt-win',
    emoji: '',
    dismissible: false,
    title: draw ? "It's a draw!" : winLabel(result),
    topHtml: rimauHtml,
    message,
    actions: [
      { label: 'Play again',         value: true,  style: 'primary' },
      { label: 'Back to Activities', value: false, style: 'ghost'   },
    ],
  });

  if (again) resetGame();
  else window.location.href = BACK_HREF;
}

/* The computer opponent */
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

  // The square it wants (strategy: win → block → centre → corner → any).
  const target = chooseSquare(board, 'O', 'X');

  // The accuracy roll decides if it answers right. On a miss it still drags onto
  // the target square with the wrong word, forfeiting the turn like a human miss.
  let pill = target;
  if (Math.random() >= BOT_ACCURACY) {
    const wrongOptions = empties.filter(i => i !== target);
    // With one square left there's no wrong pill to drag, so the bot is forced correct.
    if (wrongOptions.length) pill = wrongOptions[Math.floor(Math.random() * wrongOptions.length)];
  }

  busy = false;                                   // attempt() re-locks immediately
  animateBotDrag(pill, target, () => attempt(pill, target));
}

// Slide a ghost pill onto the target square, so the bot's move is visible.
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

/* Input wiring (delegated, so it survives re-renders and is set up once) */
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

// Route Enter/Space explicitly (pointerdown has no click of its own).
pillsEl.addEventListener('keydown', e => {
  if (e.key !== 'Enter' && e.key !== ' ') return;
  const pill = e.target.closest('.ttt-pill');
  if (!pill || busy || over || !isHumanTurn()) return;
  e.preventDefault();
  selectPill(Number(pill.dataset.square));
});

/* Round lifecycle */
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

/* Boot — deal first so the instruction demo can show a real photo from this round */
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
  topHtml: DEMO_HTML,   // children look at the demo first and often need nothing else
  lines: [
    '👆 Drag a name onto the picture it belongs to.',
    '✅ Get it right and the square is yours.',
    '❌ Get it wrong and your turn passes!',
    '🏆 Three squares in a line wins the game.',
  ],
  buttonLabel: 'Play',
};

// First visit shows the rules, then the mode picker (awaited so they never stack).
initHowToPlay('tictactoe', HOW_TO_PLAY).then(chooseMode);
