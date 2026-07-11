// js/mission.js — Mission Flow (Discover → Learn → Mini-game → Reward → Complete)
// ─────────────────────────────────────────────────────────────────────────────
// Launched from the Mission Hub (missions.html). Runs the pre-game stages
// (Discover + Learn), hands off to the existing mini-game tagged from=mission,
// and the game returns here with ?stage=reward for the post-game stages
// (Reward + Complete). Finishing returns to the hub with ?done=<id> so the row
// animates and the progress bar grows.
// ─────────────────────────────────────────────────────────────────────────────

import Storage from './utils/storage.js';
import { renderTopbar, requireAuth, getStateParam, flyPoints } from './ui.js';
import { getState } from './data/states.js';
import { missionFlow, MISSION_COUNT } from './data/missions.js';
import { showPopup } from './components/popup.js';
import { initHowToPlay } from './components/howToPlay.js';
import { renderMascot } from './data/mascots.js';
import { paramsFor } from './data/difficulty.js';
import { playMusic } from './utils/music.js';
import Sound from './utils/sound.js';
import Voice from './utils/voice.js';

requireAuth();

// ── Load state + mission ───────────────────────────────────────────────────────
const params    = new URLSearchParams(location.search);
const stateId   = getStateParam();
const missionId = params.get('mission');
const stageParam = params.get('stage');          // 'reward' when returning post-game
const state     = getState(stateId);
const flow      = state ? missionFlow(state, missionId) : null;

if (!flow) {
  showPopup({
    title: 'Mission not found',
    emoji: '🧭',
    message: "Let's head back to the map and pick a state first!",
    actions: [{ label: 'Back to Map', value: 'map', style: 'primary' }],
  }).then(() => { window.location.href = 'map.html'; });
  throw new Error('Mission not found: ' + stateId + '/' + missionId);
}

Storage.setCurrentState(stateId);

// Tag the page with the state id so per-state visual experiments can be scoped
// in CSS (e.g. the full-bleed blurred-fill spotlight currently trialled on Kedah).
document.documentElement.dataset.mnState = stateId;

// Voiceover key category per mission, so recorded VO clips are per-state+topic
// (e.g. `selangor_food_intro`) and match the hotspot keys (`selangor_food_1`).
// See docs/VOICEOVER_SCRIPT.md for the full clip list + registration in voice.js.
const voCat = { chef: 'food', dancer: 'costume', tourist: 'tour', festival: 'festival' }[missionId] || missionId;

// Background music for this mission (e.g. Cinta Sayang under the Kedah Festival).
// Loops softly, starts on the first tap if autoplay is blocked, respects mute.
if (flow.audio) playMusic(flow.audio, { volume: 0.25 });

const hubHref     = `missions.html?state=${stateId}`;
const hubDoneHref = `missions.html?state=${stateId}&done=${missionId}`;

// Tint with the state's accent colour.
const mainEl = document.getElementById('mn-main');
if (state.color) {
  mainEl.style.setProperty('--state-color', state.color);
  if (state.colorLight) mainEl.style.setProperty('--state-color-light', state.colorLight);
}

// Placeholder scene background for every mission of a state that ships one
// (e.g. Kedah's paddy field). Painted on the app-container so it also covers the
// transparent top bar; a soft white scrim keeps the mission content readable.
if (state.entryBg) {
  // Paint the scene as the FULL-SCREEN background (via --screen-bg on :root, so it
  // fills the body letterbox margins AND the frame — no cream strip anywhere).
  const bg = `linear-gradient(rgba(255,255,255,0.42), rgba(255,255,255,0.42)), url(${state.entryBg}) center / cover no-repeat fixed`;
  document.documentElement.style.setProperty('--screen-bg', bg);
  mainEl.style.background = 'transparent';
}

// ── Chrome ──────────────────────────────────────────────────────────────────
renderTopbar({
  title:      flow.title,
  showBack:   true,
  backHref:   hubHref,
  showPoints: true,
  color:      null,   // .mission-topbar CSS forces purple
});

document.getElementById('mn-badge').textContent = flow.badge;

// Fisher–Yates shuffle — used to randomise the cook game's wrong-ingredient pool.
function shuffleArr(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Stage machine ─────────────────────────────────────────────────────────────
const STAGES = {
  spotlight: document.getElementById('stage-spotlight'),
  tour:      document.getElementById('stage-tour'),
  discover:  document.getElementById('stage-discover'),
  learn:     document.getElementById('stage-learn'),
  cook:      document.getElementById('stage-cook'),
  reward:    document.getElementById('stage-reward'),
};

// Set in enterReward: true only when THIS run finished the 4th mission and the
// state's stamp was not already collected. Drives whether the (single, merged)
// Reward stage's button sends the player to the Stamp Earned screen (first
// time) or straight back to the hub (replays — no need to show it again).
let stampJustEarned = false;

function showStage(name) {
  Voice.stop();                            // never let narration bleed across stages
  Object.entries(STAGES).forEach(([key, el]) => {
    el.classList.toggle('hidden', key !== name);
  });
  STAGES[name].classList.remove('mn-stage-in');
  void STAGES[name].offsetWidth;          // restart entrance animation
  STAGES[name].classList.add('mn-stage-in');
  mainEl.scrollTop = 0;
}

// Start this mission's PLAY step — the inline cook game (food) or the tagged
// mini-game page (other missions). Shared by the spotlight and the Learn carousel.
function launchGame() {
  if (flow.game?.type === 'cook') { Sound.tap?.(); startCook(); }
  else                            { window.location.href = flow.gameHref; }
}

// ══ STAGE 0 · DISCOVER SPOTLIGHT ══════════════════════════════════════════════
// Big image dimmed except one glowing hotspot. Tap all 3 (the 3-tap rule) — each
// speaks one short line + shows its caption — then Continue leads into the game.
function initSpotlight() {
  const sp = flow.spotlight;
  const imgEl     = document.getElementById('mn-spot-img');
  const bgEl      = document.getElementById('mn-spot-img-bg');
  const dimEl     = document.getElementById('mn-spot-dim');
  const spotsEl   = document.getElementById('mn-spot-hotspots');
  const captionEl = document.getElementById('mn-spot-caption');
  const progEl    = document.getElementById('mn-spot-progress');
  const listenBtn = document.getElementById('mn-spot-listen');
  const continueBtn = document.getElementById('mn-spot-continue');
  const titleEl   = document.getElementById('mn-spot-title');

  titleEl.textContent = flow.discoverTitle || 'Tap the glowing spot!';

  // Show a caption with its keyword highlighted. Text is escaped, then the first
  // occurrence of `key` is wrapped so it stands out for young readers. Used by
  // both the hotspot mode and the festival "learn cards" mode below.
  const escapeHtml = (s) => s.replace(/[&<>"]/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  function setCaption(text, key) {
    let html = escapeHtml(text);
    if (key) {
      const safe = escapeHtml(key).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      html = html.replace(new RegExp(`(${safe})`, 'i'), '<mark class="mn-spot-key">$1</mark>');
    }
    captionEl.innerHTML = html;
  }

  // ── Festival "learn cards" mode ──────────────────────────────────────────────
  // Some festivals ship SEVERAL photos (e.g. Penang Thaipusam, Kelantan Wayang
  // Kulit) instead of one scene. Show them one at a time INSIDE the card stage
  // (no hotspots, no dimming) with a line + Next, then the game.
  if (sp.cards && sp.cards.length) { initSpotlightCards(); return; }

  imgEl.src = sp.image;
  imgEl.alt = flow.discoverTitle || flow.title;
  // Same photo, blurred + cover, painted behind the sharp (contain) image to fill
  // the letterbox gaps — "covers the whole background" without cropping the photo
  // or shifting the hotspots. Shown only where CSS opts in (Kedah, for review).
  if (bgEl) bgEl.src = sp.image;

  const total = sp.hotspots.length;
  let index = 0;                           // which hotspot is currently glowing
  const done = new Array(total).fill(false);

  progEl.innerHTML = sp.hotspots.map(() => '<span class="mn-spot-pip"></span>').join('');
  const pips = [...progEl.children];

  // Render a sequence of festival photo cards in the stage (declared here so it
  // shares setCaption / the element refs above; hoisted, so the early call works).
  function initSpotlightCards() {
    const cards = sp.cards;
    if (dimEl)   dimEl.style.display = 'none';   // no dark dimming — show full photo
    if (spotsEl) spotsEl.innerHTML = '';         // no hotspots in card mode
    progEl.innerHTML = cards.map(() => '<span class="mn-spot-pip"></span>').join('');
    const cardPips = [...progEl.children];
    let idx = 0;
    const render = () => {
      const c = cards[idx];
      imgEl.src = c.image;
      imgEl.alt = c.name || c.text || '';
      if (bgEl) bgEl.src = c.image;
      titleEl.textContent = c.name || flow.discoverTitle || '';
      setCaption(c.text, c.key);
      cardPips.forEach((p, i) => p.classList.toggle('is-on', i <= idx));
      continueBtn.disabled = false;
      continueBtn.classList.add('mn-btn-ready');
      continueBtn.textContent = idx === cards.length - 1 ? "Let's Play! →" : 'Next →';
      Voice.play(c.vo || `${stateId}_${voCat}_${idx + 1}`, c.text);
    };
    listenBtn.addEventListener('click', () => Voice.play(null, cards[idx].text));
    continueBtn.addEventListener('click', () => {
      if (continueBtn.disabled) return;
      Sound.tap?.();
      if (idx < cards.length - 1) { idx++; render(); }
      else launchGame();
    });
    render();
  }

  // Cut a soft "hole" in the dim layer over the active hotspot so the child's
  // eye goes there (radial gradient centred on its {x,y}).
  function spotlightAt(hs) {
    if (!hs) { dimEl.style.background = 'rgba(0,0,0,0.28)'; return; }
    dimEl.style.background =
      `radial-gradient(circle at ${hs.x}% ${hs.y}%,` +
      ` rgba(0,0,0,0) 8%, rgba(0,0,0,0.12) 16%, rgba(0,0,0,0.55) 34%)`;
  }

  // Render the hotspot buttons; only the active, undiscovered one pulses.
  function renderSpots() {
    spotsEl.innerHTML = sp.hotspots.map((hs, i) => {
      const state = done[i] ? 'is-found' : (i === index ? 'is-active' : 'is-idle');
      return `<button class="mn-spot-dot ${state}" type="button" data-i="${i}"
                style="left:${hs.x}%;top:${hs.y}%" aria-label="Discovery ${i + 1}">
                ${done[i] ? '✓' : i + 1}
              </button>`;
    }).join('');
    spotsEl.querySelectorAll('.mn-spot-dot').forEach(btn => {
      btn.addEventListener('click', () => tapSpot(Number(btn.dataset.i)));
    });
  }

  function tapSpot(i) {
    const hs = sp.hotspots[i];
    // Re-tap an already-discovered spot → just replay its line (kids repeat a lot).
    if (done[i]) {
      Sound.tap?.();
      setCaption(hs.text, hs.key);
      Voice.play(hs.vo, hs.text);
      return;
    }
    // Otherwise guide them through in order — only the active spot responds.
    if (i !== index) return;
    done[i] = true;
    pips[i]?.classList.add('is-on');
    Sound.tap?.();
    setCaption(hs.text, hs.key);

    // Advance to the next undiscovered hotspot.
    const next = done.findIndex(d => !d);
    if (next === -1) {
      index = -1;
      spotlightAt(null);
      titleEl.textContent = 'Great exploring! 🎉';
      continueBtn.disabled = false;
      continueBtn.classList.add('mn-btn-ready');
      // Show + speak the transition only AFTER the LAST hotspot line has been
      // heard — chained on the line's real end (onEnd) instead of a fixed delay,
      // so it never cuts the last line short. A safety timer covers the rare
      // case where the browser TTS never fires its 'end' event.
      let shown = false;
      const showTransition = () => {
        if (shown || index !== -1) return;    // already shown, or a re-tap took over
        shown = true;
        setCaption(sp.transition || "Now let's play!");
        Voice.play(`${stateId}_${voCat}_transition`, sp.transition || '');
      };
      Voice.play(hs.vo, hs.text, showTransition);
      setTimeout(showTransition, 8000);
    } else {
      Voice.play(hs.vo, hs.text);
      index = next;
      spotlightAt(sp.hotspots[index]);
    }
    renderSpots();
  }

  // Intro line, spoken once when the spotlight opens. `introKey` (the costume
  // dance name, when set) is highlighted in the caption.
  setCaption(sp.intro || 'Tap the glowing spot to discover!', sp.introKey);
  spotlightAt(sp.hotspots[0]);
  renderSpots();
  Voice.play(`${stateId}_${voCat}_intro`, sp.intro || '');

  // Listen replays the current caption (kids re-tap a lot).
  listenBtn.addEventListener('click', () => Voice.play(null, captionEl.textContent));

  continueBtn.addEventListener('click', () => { if (!continueBtn.disabled) launchGame(); });
}

// ══ STAGE 0B · SPOTLIGHT TOUR ═════════════════════════════════════════════════
// A run of photo cards (Tourist mission). Each shows one spot's photo, speaks its
// lines, and offers a small "fun activity"; Next advances, and the last card's
// "Continue Mission" leads into the game (Discover → Play).
function initTour() {
  const tour      = flow.tour;
  const imgEl     = document.getElementById('mn-tour-img');
  const emojiEl   = document.getElementById('mn-tour-emoji');
  const nameEl    = document.getElementById('mn-tour-name');
  const voEl      = document.getElementById('mn-tour-vo');
  const nextBtn   = document.getElementById('mn-tour-next');
  const listenBtn = document.getElementById('mn-tour-listen');
  const progEl    = document.getElementById('mn-tour-progress');

  progEl.innerHTML = tour.map(() => '<span class="mn-tour-pip"></span>').join('');
  const pips = [...progEl.children];

  // Show the line with its important word highlighted (escaped first, then the
  // first match of `key` wrapped) — same treatment as the spotlight captions.
  const escapeHtml = (s) => s.replace(/[&<>"]/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  function highlight(text, key) {
    let html = escapeHtml(text);
    if (key) {
      const safe = escapeHtml(key).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      html = html.replace(new RegExp(`(${safe})`, 'i'), '<mark class="mn-tour-key">$1</mark>');
    }
    return html;
  }

  let idx = 0;

  // The mission page paints the state's entry background full-screen (see the
  // entryBg block near the top). During the tour we replace it with the current
  // landmark photo — full-cover, no dimming — so the landmark image is the whole
  // screen's background (body + frame) and the state background never shows through.

  // Two stacked photo layers for a seamless crossfade: the incoming photo loads
  // hidden, then fades in over the outgoing one (no blank flash on swap). `imgEl`
  // is the first layer; we clone a second one behind it.
  const layerB = imgEl.cloneNode(false);
  layerB.removeAttribute('id');
  imgEl.after(layerB);
  const layers = [imgEl, layerB];
  let front = 0;                                   // which layer is currently shown

  // Crossfade to `src`: show it on the back layer once loaded, hide the old one.
  function crossfade(src) {
    const incoming = layers[front ^ 1];
    const outgoing = layers[front];
    const reveal = () => {
      // Restart the Ken-Burns zoom: snap to zoomed-in with no transition, then let
      // the CSS transition ease it back out while the layer fades in.
      incoming.classList.remove('is-shown');
      void incoming.offsetWidth;
      incoming.classList.add('is-shown');
      outgoing.classList.remove('is-shown');
      front ^= 1;
      document.documentElement.style.setProperty('--screen-bg', `#000 url("${src}") center / cover no-repeat fixed`);
    };
    if (incoming.getAttribute('src') === src && incoming.complete) { reveal(); return; }
    incoming.onload = reveal;
    incoming.onerror = reveal;                     // still advance if a photo 404s
    incoming.src = src;
  }

  function render() {
    const card = tour[idx];
    imgEl.alt = card.name;
    crossfade(card.image);

    emojiEl.textContent = card.emoji;
    nameEl.textContent  = card.name;
    voEl.innerHTML      = highlight(card.text, card.key);

    pips.forEach((p, i) => p.classList.toggle('is-on', i <= idx));
    nextBtn.textContent = idx === tour.length - 1 ? 'Continue Mission →' : 'Next →';

    // VO key is category-aware so the festival tour (voCat 'festival') doesn't
    // reuse the landmark tour's clip names. Tourist keeps `<state>_tour_<n>`.
    Voice.play(`${stateId}_${voCat}_${idx + 1}`, card.text);
  }

  listenBtn.addEventListener('click', () => Voice.play(null, tour[idx].text));
  nextBtn.addEventListener('click', () => {
    Sound.tap?.();
    if (idx < tour.length - 1) { idx++; render(); }
    else launchGame();
  });

  render();
}

// ══ STAGE 1 · DISCOVER ════════════════════════════════════════════════════════
document.getElementById('mn-discover-title').textContent = flow.discoverTitle;
document.getElementById('mn-discover-sub').textContent   = flow.discoverSub;
const heroEmojiEl = document.getElementById('mn-hero-emoji');
if (flow.heroImage) {
  // Real dish photo (e.g. Kedah laksa) fills the circular frame; emoji fallback.
  document.querySelector('.mn-hero')?.classList.add('mn-hero--photo');
  heroEmojiEl.innerHTML =
    `<img src="${flow.heroImage}" alt="${flow.discoverTitle || ''}" ` +
    `onerror="this.closest('.mn-hero')?.classList.remove('mn-hero--photo');` +
    `this.replaceWith(document.createTextNode('${flow.heroEmoji}'))">`;
} else {
  heroEmojiEl.textContent = flow.heroEmoji;
}

// Real Rimau PNG with emoji fallback (same helper the activity page uses).
const heroMascot = document.getElementById('mn-hero-mascot-fig');
if (heroMascot) renderMascot(heroMascot, 'happy');

// Build the tappable culture cards.
const itemsEl = document.getElementById('mn-items');
itemsEl.innerHTML = flow.items.map((it, i) => `
  <button class="mn-item" type="button" data-i="${i}">
    <span class="mn-item-emoji" aria-hidden="true">${it.emoji}</span>
    <span class="mn-item-label">${it.label}</span>
  </button>
`).join('');

// Tapping a card opens the Learn carousel at that card.
itemsEl.querySelectorAll('.mn-item').forEach(btn => {
  btn.addEventListener('click', () => {
    Sound.tap?.();
    openLearn(Number(btn.dataset.i));
  });
});

document.getElementById('mn-discover-next').addEventListener('click', () => {
  Sound.tap?.();
  openLearn(0);
});

// ══ STAGE 1A · LEARN (carousel) ═══════════════════════════════════════════════
let learnIdx = 0;

const learnTitle = document.getElementById('mn-learn-title');
const learnEmoji = document.getElementById('mn-learn-emoji');
const learnBlurb = document.getElementById('mn-learn-blurb');
const dotsEl     = document.getElementById('mn-dots');

document.getElementById('mn-learn-play').textContent = flow.playLabel;

dotsEl.innerHTML = flow.items.map(() => `<span class="mn-dot"></span>`).join('');

function renderLearn() {
  const it = flow.items[learnIdx];
  if (!it) return;
  learnTitle.textContent = it.label;
  // Real ingredient photo in the Learn card when available; emoji fallback.
  if (it.image) {
    learnEmoji.innerHTML =
      `<img class="mn-learn-img" src="${it.image}" alt="" ` +
      `onerror="this.replaceWith(document.createTextNode('${it.emoji}'))">`;
  } else {
    learnEmoji.textContent = it.emoji;
  }
  learnBlurb.textContent = it.blurb;
  dotsEl.querySelectorAll('.mn-dot').forEach((d, i) =>
    d.classList.toggle('is-active', i === learnIdx));
  // Re-trigger the swap animation.
  learnEmoji.classList.remove('mn-pop');
  void learnEmoji.offsetWidth;
  learnEmoji.classList.add('mn-pop');
  // Voiceover-first: speak this card's blurb (young children skip long text).
  Voice.play(it.vo, it.blurb);
}

function openLearn(idx) {
  learnIdx = Math.max(0, Math.min(idx, flow.items.length - 1));
  // Show the stage FIRST (showStage stops any voice), then render so the
  // carousel's own voiceover isn't immediately cancelled.
  showStage('learn');
  renderLearn();
}

document.getElementById('mn-learn-prev').addEventListener('click', () => {
  learnIdx = (learnIdx - 1 + flow.items.length) % flow.items.length;
  Sound.tap?.();
  renderLearn();
});
document.getElementById('mn-learn-next').addEventListener('click', () => {
  learnIdx = (learnIdx + 1) % flow.items.length;
  Sound.tap?.();
  renderLearn();
});
document.getElementById('mn-learn-back').addEventListener('click', () => {
  Sound.tap?.();
  showStage('discover');
});

// Play → either the inline "cook the dish" game (food missions) or hand off to
// the existing mini-game page (other missions, tagged from=mission).
document.getElementById('mn-learn-play').addEventListener('click', launchGame);

// ══ STAGE 2 · COOK THE DISH (inline drag-into-pot game) ═══════════════════════
function flashPot() {
  const pot = document.getElementById('mn-cook-pot');
  pot.classList.remove('mn-pot-bump');
  void pot.offsetWidth;
  pot.classList.add('mn-pot-bump');
}

function startCook() {
  const g = flow.game;
  document.getElementById('mn-cook-prompt').textContent = g.prompt;
  // Real cooking-pot illustration (emoji fallback if it fails to load).
  document.getElementById('mn-cook-pot-emoji').innerHTML =
    `<img class="mn-cook-pot-img" src="../assets/images/ui/cooking_pot.png" alt="" ` +
    `onerror="this.replaceWith(document.createTextNode('${g.dishEmoji}'))">`;

  const cookMascot = document.getElementById('mn-cook-mascot');
  if (cookMascot) renderMascot(cookMascot, 'happy');

  const total      = g.correct.length;
  let   added      = 0;
  const countEl    = document.getElementById('mn-cook-count');
  const feedbackEl = document.getElementById('mn-cook-feedback');
  const trayEl     = document.getElementById('mn-cook-tray');
  countEl.textContent = `0 / ${total}`;
  feedbackEl.innerHTML = '&nbsp;';
  feedbackEl.className = 'mn-cook-feedback';

  // Pick a few wrong ingredients AT RANDOM from the cross-state pool (real
  // photos borrowed from every OTHER state's dish — see crossStateIngredientPool()
  // in data/foodMissions.js), then shuffle them in together with the correct
  // ones. How many wrong options appear is set by the difficulty level
  // (Explorer sees fewer; Adventurer/Master see more), capped at pool size.
  const distractorCap = paramsFor('cook').distractors;
  const distractors   = shuffleArr(g.distractors).slice(0, distractorCap);
  const cards = [
    ...g.correct.map(c => ({ ...c, ok: true })),
    ...distractors.map(c => ({ ...c, ok: false })),
  ].sort(() => Math.random() - 0.5);

  trayEl.innerHTML = cards.map((c, i) => {
    // Real ingredient photo when available (Kedah); emoji fallback otherwise.
    const icon = c.image
      ? `<img class="mn-ingredient-img" src="${c.image}" alt="" ` +
        `onerror="this.replaceWith(document.createTextNode('${c.emoji}'))">`
      : c.emoji;
    return `
    <button class="mn-ingredient" type="button" data-ok="${c.ok}" data-i="${i}">
      <span class="mn-ingredient-emoji" aria-hidden="true">${icon}</span>
      <span class="mn-ingredient-label">${c.name}</span>
    </button>`;
  }).join('');

  trayEl.querySelectorAll('.mn-ingredient').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.classList.contains('is-added') || btn.disabled) return;

      if (btn.dataset.ok === 'true') {
        // Correct ingredient → drops into the pot.
        btn.classList.add('is-added');
        btn.disabled = true;
        Sound.correct?.();
        added++;
        countEl.textContent = `${added} / ${total}`;
        feedbackEl.textContent = 'Yum! That goes in! 😋';
        feedbackEl.className = 'mn-cook-feedback is-good';
        flashPot();

        if (added >= total) {
          feedbackEl.textContent = `Delicious! Your ${g.dish} is ready! 🎉`;
          setTimeout(enterReward, 850);
        }
      } else {
        // Wrong ingredient → bounce it back.
        Sound.wrong?.();
        btn.classList.remove('mn-shake');
        void btn.offsetWidth;
        btn.classList.add('mn-shake', 'is-wrong');
        feedbackEl.textContent = `Yuck! That doesn't go in ${g.dish}! ❌`;
        feedbackEl.className = 'mn-cook-feedback is-bad';
        setTimeout(() => btn.classList.remove('is-wrong'), 550);
      }
    });
  });

  showStage('cook');

  // Kid-friendly "How to Play" for the cook game — shown the first time a child
  // reaches a cook stage, with a "?" button to re-open it.
  initHowToPlay('cook', {
    title: "Let's Cook!", emoji: '🍢',
    lines: ['🍢 Tap the food that goes in the dish.', '✅ Right food stays in the pot.', '❌ Wrong food bounces back!'],
    buttonLabel: 'Start Cooking!',
  });
}

// ══ STAGE 3 · REWARD + MISSION COMPLETE (merged, one celebration) ═════════════
// Previously two stages (Reward → tap Continue → Complete → tap to leave). Now
// a single screen shows everything at once — what you earned, the mission's
// takeaway line, how many of the state's missions are done, and Rimau's
// thank-you — with ONE button back to the hub (or, the first time all four
// missions are done, on to the Stamp Earned screen).
function enterReward() {
  // "What you learned" — the mission's takeaway line + a picture of what they
  // just made / explored + the points earned. (e.g. "You cooked Laksa Kedah!")
  document.getElementById('mn-reward-title').textContent   = `Mission ${flow.num} Complete!`;
  document.getElementById('mn-reward-line').textContent     = flow.reward.line;
  document.getElementById('mn-reward-congrats').textContent = flow.reward.congrats;

  // Show the real dish/landmark photo (e.g. Laksa Kedah) when the state ships
  // one. No emoji fallback — the badge simply stays hidden without a photo.
  const photoEl = document.getElementById('mn-reward-photo');
  if (photoEl) {
    if (flow.heroImage) {
      photoEl.innerHTML =
        `<img class="mn-reward-img" src="${flow.heroImage}" alt="" ` +
        `onerror="this.closest('.mn-reward-photo').classList.add('hidden')">`;
      photoEl.classList.remove('hidden');
    } else {
      photoEl.classList.add('hidden');
    }
  }

  const ptsEl = document.getElementById('mn-reward-pts');

  // Award the mission bonus exactly once. We mark the mission done HERE (it is
  // idempotent on the hub too), so a refresh of the reward screen never
  // re-awards the points.
  const firstTime = !Storage.isMissionDone(stateId, missionId);
  if (firstTime) {
    Storage.addPoints(flow.reward.bonus);
    Storage.completeMission(stateId, missionId);
    Sound.win?.();
  }
  ptsEl.textContent = `+${flow.reward.bonus} ⭐`;

  // Completing all four missions of a state earns its stamp. Capture whether it
  // was JUST earned this run (vs already collected on an earlier playthrough) so
  // the button below only opens the Stamp Earned screen the first time.
  const doneCount = Storage.getMissions(stateId).length;
  const allDone   = doneCount >= MISSION_COUNT;
  stampJustEarned = allDone && !Storage.hasStamp(stateId);
  if (allDone) Storage.earnStamp(stateId);

  // Stamp progress line — "2 of 4 missions done" (or a finished-them-all beat).
  const progressEl = document.getElementById('mn-reward-progress');
  if (progressEl) {
    progressEl.textContent = allDone
      ? `🏅 All ${MISSION_COUNT} missions done!`
      : `${doneCount} of ${MISSION_COUNT} missions done`;
  }

  // ONE button back to the hub — except the FIRST time all four are finished
  // (stamp freshly earned), which sends the player to the Stamp Earned page
  // instead (it then offers Back to Map / Activity Hub). Replays of an
  // already-stamped state just return to the hub.
  const btn = document.getElementById('mn-complete-hub');
  if (stampJustEarned) {
    const params = new URLSearchParams({
      state:  stateId,
      stamp:  '1',
      earned: String(flow.reward.bonus),
      score:  '4',
      total:  '4',
      from:   'mission',
    });
    btn.textContent = 'Get Your Stamp!';
    btn.href = `reward.html?${params}`;
  } else {
    btn.textContent = 'Back to Missions';
    btn.href = hubDoneHref;   // hub animates the completed row
  }

  showStage('reward');
  Sound.unlock?.();

  if (firstTime) {
    // Float the points up from the prize badge.
    requestAnimationFrame(() => flyPoints(ptsEl, flow.reward.bonus));
  }
}

// ── Entry point ───────────────────────────────────────────────────────────────
// Post-game returns straight to Reward. A first run opens the interactive
// spotlight when the mission ships one (Discover → Play), else the tap-cards
// Discover.
if (stageParam === 'reward') {
  enterReward();
} else if (flow.spotlight) {
  // Show the stage FIRST (showStage calls Voice.stop), then init — otherwise the
  // intro / first-card voice-over starts and is immediately cancelled, so it never
  // auto-plays on entry. (Same ordering the tour uses below.)
  showStage('spotlight');
  initSpotlight();
} else if (flow.tour && flow.tour.length) {
  // Show the stage first (showStage stops any voice), then render so the tour's
  // own voiceover isn't immediately cancelled.
  showStage('tour');
  initTour();
} else {
  showStage('discover');
}
