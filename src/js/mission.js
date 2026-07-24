/* mission.js — Mission Flow (Discover → Learn → Mini-game → Reward → Complete) */

// Launched from the Mission Hub. Runs the pre-game stages, hands off to the
// mini-game (from=mission), which returns with ?stage=reward for the post-game
// stages. Finishing returns to the hub with ?done=<id> to animate the row.

import Storage from './utils/storage.js';
import { renderTopbar, requireAuth, getStateParam, flyPoints } from './ui.js';
import { getState } from './data/states.js';
import { missionFlow, MISSION_COUNT } from './data/missions.js';
import { showPopup } from './components/popup.js';
import { initHowToPlay } from './components/howToPlay.js';
import { renderMascot } from './data/mascots.js';
import { paramsFor } from './data/difficulty.js';
import { playMusic } from './utils/music.js';
import { highlightKeyword, restartAnimation } from './utils/dom.js';
import { shuffle } from './utils/shuffle.js';
import Sound from './utils/sound.js';
import Voice from './utils/voice.js';

requireAuth();

/* Load state + mission */
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

// Tag the page with the state id so per-state CSS experiments can be scoped.
document.documentElement.dataset.mnState = stateId;

// Voiceover key category per mission, so clips are per-state+topic (e.g. selangor_food_1).
const voCat = { chef: 'food', dancer: 'costume', tourist: 'tour', festival: 'festival' }[missionId] || missionId;

// Background music for this mission (loops softly, starts on first tap, respects mute).
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
  // Full-screen scene via --screen-bg on :root. No `fixed` — background-attachment:fixed
  // mis-scales `cover` on mobile Safari/Chrome; default (scroll) stays responsive.
  const bg = `linear-gradient(rgba(255,255,255,0.42), rgba(255,255,255,0.42)), url(${state.entryBg}) center / cover no-repeat`;
  document.documentElement.style.setProperty('--screen-bg', bg);
  mainEl.style.background = 'transparent';
}

/* Chrome */
renderTopbar({
  title:      flow.title,
  showBack:   true,
  backHref:   hubHref,
  showPoints: true,
  color:      null,   // no-op; the bar is transparent by design
});

document.getElementById('mn-badge').textContent = flow.badge;

/* Stage machine */
const STAGES = {
  spotlight: document.getElementById('stage-spotlight'),
  tour:      document.getElementById('stage-tour'),
  discover:  document.getElementById('stage-discover'),
  learn:     document.getElementById('stage-learn'),
  cook:      document.getElementById('stage-cook'),
  reward:    document.getElementById('stage-reward'),
};

// True only when this run finished the 4th mission and the stamp wasn't already
// collected — drives whether Reward's button opens the Stamp Earned screen or the hub.
let stampJustEarned = false;

function showStage(name) {
  Voice.stop();                            // never let narration bleed across stages
  Object.entries(STAGES).forEach(([key, el]) => {
    el.classList.toggle('hidden', key !== name);
  });
  restartAnimation(STAGES[name], 'mn-stage-in');
  mainEl.scrollTop = 0;
}

// Start the PLAY step — the inline cook game (food) or the tagged mini-game page.
function launchGame() {
  if (flow.game?.type === 'cook') { Sound.tap?.(); startCook(); }
  else                            { window.location.href = flow.gameHref; }
}

/* Stage 0 · Discover spotlight */
// Big image dimmed except one glowing hotspot; tap each (short line + caption),
// then Continue leads into the game.
function initSpotlight() {
  const sp = flow.spotlight;
  const stageEl   = document.getElementById('mn-spot-stage');
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

  // Used by both the hotspot mode and the festival "learn cards" mode below.
  function setCaption(text, key) {
    captionEl.innerHTML = highlightKeyword(text, key, 'mn-spot-key');
  }

  // Festival "learn cards" mode: some festivals ship several photos instead of one
  // scene — show them one at a time (no hotspots/dimming) with a line + Next.
  if (sp.cards && sp.cards.length) { initSpotlightCards(); return; }

  imgEl.src = sp.image;
  imgEl.alt = flow.discoverTitle || flow.title;
  // Same photo, blurred + cover, behind the sharp (contain) image to fill letterbox gaps.
  if (bgEl) bgEl.src = sp.image;

  const total = sp.hotspots.length;
  let index = 0;                           // which hotspot is currently glowing
  const done = new Array(total).fill(false);

  progEl.innerHTML = sp.hotspots.map(() => '<span class="mn-spot-pip"></span>').join('');
  const pips = [...progEl.children];

  // Render a sequence of festival photo cards (hoisted, so the early call works).
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

  // The image is object-fit:contain, so it letterboxes. Hotspot %s are relative to
  // the PHOTO, so measure its on-screen rect and size the overlay to match (recomputed
  // on load + resize). `fit` also lets the spotlight hole land on the right pixel.
  let fit = null;
  function layoutStage() {
    const cw = stageEl.clientWidth,  ch = stageEl.clientHeight;
    const iw = imgEl.naturalWidth,   ih = imgEl.naturalHeight;
    if (!iw || !ih || !cw || !ch) return;
    const scale = Math.min(cw / iw, ch / ih);
    const dw = iw * scale, dh = ih * scale;
    const left = (cw - dw) / 2, top = (ch - dh) / 2;
    fit = { left, top, dw, dh };
    // Overlay now exactly covers the visible photo, so a dot at hs.x%/hs.y% is stable.
    spotsEl.style.left   = `${left}px`;
    spotsEl.style.top    = `${top}px`;
    spotsEl.style.width  = `${dw}px`;
    spotsEl.style.height = `${dh}px`;
    spotsEl.style.right  = 'auto';
    spotsEl.style.bottom = 'auto';
    spotlightAt(index >= 0 ? sp.hotspots[index] : null);
  }

  // Cut a soft "hole" in the dim layer over the active hotspot, placed in pixels
  // (mapped through `fit`) so it tracks the photo through letterboxing.
  function spotlightAt(hs) {
    if (!hs || !fit) { dimEl.style.background = 'rgba(0,0,0,0.28)'; return; }
    const px = fit.left + (hs.x / 100) * fit.dw;
    const py = fit.top  + (hs.y / 100) * fit.dh;
    dimEl.style.background =
      `radial-gradient(circle at ${px}px ${py}px,` +
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

  // The line currently holding the next number back, and its release callback.
  let heldBy  = -1;
  let release = null;

  // Speak hotspot `i`'s line, then run `after` (idempotent). The timer is a safety
  // net for browsers whose TTS never fires its 'end' event.
  function narrate(i, hs, after) {
    heldBy  = i;
    release = after;
    Voice.play(hs.vo, hs.text, after);
    setTimeout(after, 8000);
  }

  // Let the child into the game, once the transition line has been heard (idempotent).
  function unlockContinue() {
    if (!continueBtn.disabled) return;
    continueBtn.disabled = false;
    continueBtn.classList.add('mn-btn-ready');
  }

  function tapSpot(i) {
    const hs = sp.hotspots[i];
    // Re-tap an already-discovered spot → replay its line (kids repeat a lot).
    if (done[i]) {
      Sound.tap?.();
      setCaption(hs.text, hs.key);
      // Replaying stops the current line and its callback — so if this line was
      // holding the next number back, hand that hold to the replay.
      if (heldBy === i && release) narrate(i, hs, release);
      else                         Voice.play(hs.vo, hs.text);
      return;
    }
    // Otherwise guide them through in order — only the active spot responds.
    if (i !== index) return;
    done[i] = true;
    pips[i]?.classList.add('is-on');
    Sound.tap?.();
    setCaption(hs.text, hs.key);

    // Hold the NEXT number until THIS spot's voice-over finishes, so the glowing
    // number and the spoken line always match. While it plays there's no active spot
    // (index = -1). When muted, onEnd fires immediately, so the number unlocks at once.
    const next = done.findIndex(d => !d);
    index = -1;
    spotlightAt(hs);            // keep the light on the spot being narrated
    renderSpots();             // current → found, next → still hidden

    if (next === -1) {
      titleEl.textContent = 'Great exploring!';
      // Show + speak the transition only after the last hotspot line is heard
      // (chained on onEnd, not a fixed delay). A safety timer covers a missing 'end'.
      let shown = false;
      const showTransition = () => {
        if (shown || index !== -1) return;    // already shown, or a re-tap took over
        shown = true;
        heldBy = -1; release = null;
        spotlightAt(null);
        setCaption(sp.transition || "Now let's play!");
        // Continue stays locked until the transition line is heard, so the child
        // never skips the takeaway. The safety timer guarantees it can't stay stuck.
        Voice.play(`${stateId}_${voCat}_transition`, sp.transition || '', unlockContinue);
        setTimeout(unlockContinue, 8000);
      };
      narrate(i, hs, showTransition);
    } else {
      // Unlock the next number once the current line ends (guarded to run once).
      let advanced = false;
      const advance = () => {
        if (advanced || index !== -1) return;  // already advanced, or a re-tap took over
        advanced = true;
        heldBy = -1; release = null;
        index = next;
        spotlightAt(sp.hotspots[index]);
        renderSpots();
      };
      narrate(i, hs, advance);
    }
  }

  // Intro line, spoken once when the spotlight opens (introKey highlighted).
  setCaption(sp.intro || 'Tap the glowing spot to discover!', sp.introKey);
  renderSpots();
  // Size the overlay to the photo once both have a size, and keep it aligned on
  // resize. layoutStage also re-points the hole, so this first lights spot 0.
  imgEl.addEventListener('load', layoutStage);
  if (imgEl.complete && imgEl.naturalWidth) layoutStage();
  window.addEventListener('resize', layoutStage);
  spotlightAt(sp.hotspots[0]);   // fallback dim until layoutStage runs
  Voice.play(`${stateId}_${voCat}_intro`, sp.intro || '');

  // Listen replays the current caption (kids re-tap a lot).
  listenBtn.addEventListener('click', () => Voice.play(null, captionEl.textContent));

  continueBtn.addEventListener('click', () => { if (!continueBtn.disabled) launchGame(); });
}

/* Stage 0B · Spotlight tour (Tourist mission) */
// A run of photo cards; Next advances, the last card leads into the game.
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

  let idx = 0;

  // During the tour the current landmark photo becomes the full-screen background.
  // Two stacked layers give a seamless crossfade (incoming loads hidden, then fades in).
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
      // Restart the Ken-Burns zoom, then fade the layer in.
      restartAnimation(incoming, 'is-shown');
      outgoing.classList.remove('is-shown');
      front ^= 1;
      document.documentElement.style.setProperty('--screen-bg', `#000 url("${src}") center / cover no-repeat`);
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
    voEl.innerHTML      = highlightKeyword(card.text, card.key, 'mn-tour-key');

    pips.forEach((p, i) => p.classList.toggle('is-on', i <= idx));
    nextBtn.textContent = idx === tour.length - 1 ? 'Continue Mission →' : 'Next →';

    // VO key is category-aware so festival and landmark tours don't share clip names.
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

/* Stage 1 · Discover */
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

/* Stage 1A · Learn (carousel) */
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
  restartAnimation(learnEmoji, 'mn-pop');
  // Voiceover-first: speak this card's blurb (young children skip long text).
  Voice.play(it.vo, it.blurb);
}

function openLearn(idx) {
  learnIdx = Math.max(0, Math.min(idx, flow.items.length - 1));
  // Show the stage first (showStage stops voice), then render, so the carousel's
  // voiceover isn't immediately cancelled.
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

document.getElementById('mn-learn-play').addEventListener('click', launchGame);

/* Stage 2 · Cook the dish (inline drag-into-pot game) */
function flashPot() {
  restartAnimation(document.getElementById('mn-cook-pot'), 'mn-pot-bump');
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

  // Random wrong ingredients from the cross-state pool, shuffled in with the
  // correct ones. How many appear is set by the difficulty level, capped at pool size.
  const distractorCap = paramsFor('cook').distractors;
  const distractors   = shuffle(g.distractors).slice(0, distractorCap);
  const cards = [
    ...g.correct.map(c => ({ ...c, ok: true })),
    ...distractors.map(c => ({ ...c, ok: false })),
  ].sort(() => Math.random() - 0.5);

  trayEl.innerHTML = cards.map((c, i) => {
    // Real ingredient photo when available; emoji fallback otherwise.
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
        feedbackEl.textContent = 'Yum! That goes in!';
        feedbackEl.className = 'mn-cook-feedback is-good';
        flashPot();

        if (added >= total) {
          feedbackEl.textContent = `Delicious! Your ${g.dish} is ready!`;
          setTimeout(enterReward, 850);
        }
      } else {
        // Wrong ingredient → bounce it back.
        Sound.wrong?.();
        restartAnimation(btn, 'mn-shake');
        btn.classList.add('is-wrong');
        feedbackEl.textContent = `Yuck! That doesn't go in ${g.dish}! ❌`;
        feedbackEl.className = 'mn-cook-feedback is-bad';
        setTimeout(() => btn.classList.remove('is-wrong'), 550);
      }
    });
  });

  showStage('cook');

  /* Kid-friendly "How to Play" for the cook game (first reach + a "?" button) */
  initHowToPlay('cook', {
    title: "Let's Cook!", emoji: '🍢',
    lines: ['🍢 Tap the food that goes in the dish.', '✅ Right food stays in the pot.', '❌ Wrong food bounces back!'],
    buttonLabel: 'Start Cooking!',
  });
}

/* Stage 3 · Reward + mission complete (merged) */
// One screen: points earned, the takeaway line, missions-done count, and Rimau,
// with one button back to the hub (or, the first full state, to Stamp Earned).
function enterReward() {
  document.getElementById('mn-reward-title').textContent   = `Mission ${flow.num} Complete!`;
  document.getElementById('mn-reward-line').textContent     = flow.reward.line;
  document.getElementById('mn-reward-congrats').textContent = flow.reward.congrats;

  // Show the real dish/landmark photo when the state ships one (else stays hidden).
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

  // Award the bonus exactly once; marking done here (idempotent) stops a refresh
  // from re-awarding it.
  const firstTime = !Storage.isMissionDone(stateId, missionId);
  if (firstTime) {
    Storage.addPoints(flow.reward.bonus);
    Storage.completeMission(stateId, missionId);
    Sound.win?.();
  }
  ptsEl.textContent = `+${flow.reward.bonus} ⭐`;

  // All four missions earn the stamp. Capture whether it was just earned this run
  // so the button only opens the Stamp Earned screen the first time.
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

  // One button back to the hub — except the first time all four finish (stamp
  // freshly earned), which opens the Stamp Earned page instead.
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
    requestAnimationFrame(() => flyPoints(ptsEl, flow.reward.bonus));   // float points up
  }
}

/* Entry point */
// Post-game returns to Reward. A first run opens the spotlight (or tour) when the
// mission ships one, else the tap-cards Discover. Show the stage before init/render
// so the auto-play voiceover isn't immediately cancelled by showStage's Voice.stop.
if (stageParam === 'reward') {
  enterReward();
} else if (flow.spotlight) {
  showStage('spotlight');
  initSpotlight();
} else if (flow.tour && flow.tour.length) {
  showStage('tour');
  initTour();
} else {
  showStage('discover');
}
