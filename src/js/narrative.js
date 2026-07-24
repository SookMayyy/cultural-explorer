/* narrative.js — Story-Entry / "Enter State" screen */

// The first screen after picking a state on the map: banner, Rimau, and a welcome
// bubble. "Let's Explore!" leads into the state's Mission Hub.

import Storage from './utils/storage.js';
import { renderTopbar, renderNavbar, requireAuth, getStateParam } from './ui.js';
import { getState } from './data/states.js';
import { getMascot, mascotPose } from './data/mascots.js';
import { assetImg } from './utils/assetImg.js';
import Typewriter from './components/typewriter.js';
import { showPopup } from './components/popup.js';
import { initHowToPlay } from './components/howToPlay.js';

requireAuth();

/* Load state from ?state= (or last-visited fallback) */
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

// Track that this state has been opened.
Storage.setCurrentState(stateId);
Storage.incrementVisit(stateId);
Storage.markCompleted(stateId, 'story');

/* Topbar — transparent bar, pinned to the top by .narrative-topbar CSS */
renderTopbar({
  title:      state.name,
  showBack:   true,
  backHref:   'map.html',
  showPoints: true,
  color:      null,
});

renderNavbar('');   // story entry isn't a nav destination

/* State-themed colours */
const screen = document.getElementById('story-entry');
if (screen) {
  screen.style.setProperty('--state-color',       state.color);
  screen.style.setProperty('--state-color-light', state.colorLight || '#FEF0DC');
}

/* Banner + tagline */
document.getElementById('story-state-name').textContent = state.name;
document.getElementById('story-tagline').textContent     = state.tagline;

/* Scene backdrop — load a full illustration; keep the gradient if it's missing */
const sceneCard = document.getElementById('story-scene-card');
if (sceneCard) {
  const sceneImg = new Image();
  sceneImg.onload = () => {
    sceneCard.style.setProperty('--scene-image', `url(${sceneImg.src})`);
    sceneCard.classList.add('has-scene');
    // Full-bleed entry: the illustration becomes the whole-screen background.
    screen.style.setProperty('--scene-image', `url(${sceneImg.src})`);
    screen.classList.add('story-entry--fullbg');
    // Paint it as the full-screen background (--screen-bg on :root) so it fills
    // the letterbox margins and the frame too — one seamless layer.
    document.documentElement.style.setProperty('--screen-bg',
      `linear-gradient(180deg, rgba(0,0,0,0.04) 0%, rgba(0,0,0,0.30) 100%), ` +
      `url(${sceneImg.src}) center / cover no-repeat`);
    screen.style.background = 'transparent';
  };
  // Prefer a state-provided entry background, else the conventional filename.
  sceneImg.src = state.entryBg || `../assets/images/states/${stateId}-scene.png`;
}

/* Mascot (Rimau guides every state) */
const mascot   = getMascot('rimau');
const mascotEl = document.getElementById('story-mascot');
if (mascotEl) {
  mascotEl.innerHTML = assetImg(mascotPose('wave'), mascot.emoji, { alt: mascot.name });
}

/* Welcome bubble */
// Build a discovery hook from the state's content (Festival card, then Tradition/Heritage).
function festivalHook(stateData) {
  const cards = stateData.cards || [];
  const byCat = cat => cards.find(c => c.category === cat);
  const festival  = byCat('Festival');
  const tradition = byCat('Tradition') || byCat('Heritage') || byCat('Costume');

  if (festival)  return `Let's discover ${festival.title}!`;
  if (tradition) return `It's time to discover ${tradition.title}!`;
  return "There's so much waiting to be discovered!";
}

const line1 = document.getElementById('story-line-1');
const line2 = document.getElementById('story-line-2');
const line3 = document.getElementById('story-line-3');

// A state can provide its own 3-line entry dialogue (greeting → story → CTA);
// otherwise fall back to a generated welcome + discovery hook.
const dlg = Array.isArray(state.entryDialogue) ? state.entryDialogue : null;

if (line1) line1.textContent = dlg ? dlg[0] : `Welcome to ${state.name}!`;
if (line2) {
  const hook = dlg ? dlg[1] : festivalHook(state);
  // Typewriter the middle line so the bubble feels like Rimau is speaking.
  new Typewriter(line2, hook, { speed: 30 }).start();
}
if (line3 && dlg && dlg[2]) line3.textContent = dlg[2];

/* "Let's Explore!" → Mission Hub */
document.getElementById('story-help-btn')?.addEventListener('click', () => {
  window.location.href = `missions.html?state=${stateId}`;
});

/* Friendly welcome on first entry (no "?" button — this leads straight into missions) */
initHowToPlay('narrative', {
  title: 'Welcome, Explorer!', emoji: '📖',
  lines: ['📖 Learn about this special state.', '🎮 Play fun games to explore it.', '⭐ Collect points and a stamp!'],
  buttonLabel: "Let's Explore!",
}, { button: false });
