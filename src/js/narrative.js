// js/narrative.js — Narrative / Discovery Cards screen
// Redesign: collectible postcard carousel with scroll-snap,
// tap-to-reveal fun facts, per-card mascot narration, purple topbar.

import Storage from './utils/storage.js';
import { renderTopbar, renderNavbar, requireAuth, getStateParam } from './ui.js';
import { getState } from './data/states.js';
import { getMascot } from './data/mascots.js';
import { assetImg } from './utils/assetImg.js';
import Typewriter from './components/typewriter.js';
import { showPopup } from './components/popup.js';

// ── Auth guard ────────────────────────────────────────────────────────────
requireAuth();

// ── Load state from ?state= param (or last-visited fallback) ──────────────
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

// Track that this state has been opened
Storage.setCurrentState(stateId);
Storage.incrementVisit(stateId);

// ── Mascot (Rimau guides every state) ─────────────────────────────────────
// Render into the story + per-card speech-bubble figures as art slots
// (emoji fallback until assets/characters/rimau.png is added).
const mascot     = getMascot('rimau');
const mascotHTML = assetImg(mascot.img, mascot.emoji, { alt: mascot.name });
['story-mascot-figure', 'card-mascot-figure'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.innerHTML = mascotHTML;
});

// ── Topbar — always purple on this screen ─────────────────────────────────
// We pass null for color so renderTopbar() sets no inline background;
// the .narrative-topbar CSS class forces purple via !important.
// This keeps other screens unaffected by this decision.
renderTopbar({
  title:     state.name,
  showBack:  true,
  backHref:  'map.html',
  showPoints: true,
  color:     null,   // intentionally null — .narrative-topbar CSS handles purple
});

// ── Bottom navbar ─────────────────────────────────────────────────────────
// No active item highlighted since "narrative" isn't a nav destination
renderNavbar('');

// ── Hero banner ───────────────────────────────────────────────────────────
// Apply state colour as hero background; attempt to load a hero illustration.
const heroEl = document.getElementById('narrative-hero');
if (heroEl) {
  heroEl.style.background = state.color;
  // Attempt to load the state hero image — silently falls back to solid colour
  const heroImg = new Image();
  heroImg.onload = () => {
    heroEl.style.backgroundImage = `url(${heroImg.src})`;
    heroEl.style.backgroundSize  = 'cover';
    heroEl.style.backgroundPosition = 'center';
  };
  heroImg.src = `../assets/images/states/${stateId}-hero.png`;
}

// Populate hero text
document.getElementById('hero-emoji').innerHTML     = state.emoji;
document.getElementById('hero-name').textContent    = state.name;
document.getElementById('hero-tagline').textContent = state.tagline;

// ── CSS custom properties for state-themed colours ────────────────────────
// These let the tabs, dots, badges, etc. all pick up the state palette
// without any JS needing to know about specific colour values.
const screen = document.querySelector('.narrative-screen');
if (screen) {
  screen.style.setProperty('--state-color',       state.color);
  screen.style.setProperty('--state-color-light', state.colorLight || '#FEF0DC');
}

// ═══════════════════════════════════════════════════════════════════════════
// STORY TAB
// ═══════════════════════════════════════════════════════════════════════════
document.getElementById('story-text').textContent = state.story;

// Mascot typewriter: first ~120 chars of story as a teaser line
const storyMascotEl = document.getElementById('story-mascot-text');
if (storyMascotEl) {
  const teaser = state.story.slice(0, 120) + '…';
  new Typewriter(storyMascotEl, teaser, { speed: 28 }).start();
}

// Rimau guides every state — render the idle pose art (emoji fallback).
document.querySelectorAll('.narrative-mascot-figure').forEach(el => {
  el.innerHTML = mascotHTML;
});

// Mark story tab as visited immediately on page load
Storage.markCompleted(stateId, 'story');

// ═══════════════════════════════════════════════════════════════════════════
// DISCOVERY CARDS TAB — Scroll-snap postcard carousel
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Builds the postcard HTML for a single cultural card.
 * The fun-fact starts hidden behind a toggle button so children must tap
 * to reveal it — adds a discovery moment and light interactivity.
 *
 * @param {Object} card  - Card data from state.cards[i]
 * @param {number} index - Card index (used for animation stagger delay)
 * @returns {string}     HTML string for the postcard element
 */
function buildPostcardHTML(card, index) {
  // Stagger animation delay: each card is slightly delayed so they cascade in
  const delay = `${index * 90}ms`;

  // Image placeholder — shows the card's icon until the real illustration loads.
  // The JS below this function attempts to load the real image.
  const imgAreaId = `img-wrap-${card.id}`;

  return `
    <article
      class="postcard"
      data-card-id="${card.id}"
      style="animation-delay: ${delay}"
      aria-label="${card.category}: ${card.title}"
    >
      <!-- Coloured header: category badge + icon + title -->
      <div class="postcard__header" style="background: ${state.color}">
        <span class="postcard__icon" aria-hidden="true">${card.icon}</span>
        <div class="postcard__header-meta">
          <span class="postcard__category">${card.category}</span>
          <h3 class="postcard__title">${card.title}</h3>
        </div>
      </div>

      <!-- Image area: emoji placeholder until real art loads -->
      <!-- 📸 IMAGE NEEDED: assets/images/cards/${stateId}/${card.id}.png
           Export from Figma → Cards/${state.name}/${card.category} — illustrated scene
           Place in: src/assets/images/cards/${stateId}/${card.id}.png -->
      <div class="postcard__img-wrap" id="${imgAreaId}" aria-hidden="true">
        ${card.icon}
      </div>

      <!-- Description + tap-to-reveal fun fact -->
      <div class="postcard__body">
        <p class="postcard__desc">${card.desc}</p>

        <!-- Fun-fact toggle button — tapping reveals the fun fact below -->
        <button
          class="postcard__funfact-toggle"
          data-card="${card.id}"
          aria-expanded="false"
          aria-controls="funfact-${card.id}"
        >
          💡 Tap to reveal a fun fact!
        </button>

        <!-- Fun-fact panel — hidden until toggle is pressed -->
        <div class="postcard__funfact-panel" id="funfact-${card.id}" aria-hidden="true">
          <div class="postcard__funfact-label">💡 Fun Fact!</div>
          <p class="postcard__funfact-text">${card.funFact}</p>
        </div>
      </div>
    </article>
  `;
}

// Render all postcards into the scroll-snap rail
const rail = document.getElementById('cards-scroll-rail');
if (rail && state.cards) {
  rail.innerHTML = state.cards.map((card, i) => buildPostcardHTML(card, i)).join('');

  // Attempt to load real card illustrations for each postcard
  state.cards.forEach(card => {
    const wrap = document.getElementById(`img-wrap-${card.id}`);
    if (!wrap) return;

    const img = new Image();
    img.onload = () => {
      // Replace emoji placeholder with the actual illustration
      wrap.innerHTML = '';
      wrap.classList.remove('postcard__img-wrap');   // remove placeholder styles
      wrap.classList.add('postcard__img-wrap--loaded');
      img.className = 'postcard__img-loaded';
      img.alt = card.title;
      wrap.appendChild(img);
    };
    img.src = `../assets/images/cards/${stateId}/${card.id}.png`;
  });
}

// ── Build dot indicators ────────────────────────────────────────────────
const dotsEl = document.getElementById('card-dots');
if (dotsEl && state.cards) {
  dotsEl.innerHTML = state.cards.map((_, i) =>
    `<button
       class="card-dot ${i === 0 ? 'active' : ''}"
       data-idx="${i}"
       aria-label="Card ${i + 1}"
     ></button>`
  ).join('');
}

// ── Track which card is currently centred in the scroll rail ────────────
// IntersectionObserver watches each postcard; when one is >60% visible,
// it becomes the "current" card and updates dots + counter + mascot.
let currentCardIdx = 0;

function updateCardUI(idx) {
  if (idx === currentCardIdx && idx !== 0) return; // avoid redundant updates
  currentCardIdx = idx;

  // Update dots
  document.querySelectorAll('.card-dot').forEach((dot, i) => {
    dot.classList.toggle('active', i === idx);
  });

  // Update counter
  const counter = document.getElementById('card-counter');
  if (counter) counter.textContent = `${idx + 1} / ${state.cards.length}`;

  // Update mascot speech bubble with a Typewriter animation
  const mascotEl   = document.getElementById('card-mascot-text');
  const card       = state.cards[idx];
  if (mascotEl && card?.mascotLine) {
    new Typewriter(mascotEl, card.mascotLine, { speed: 28 }).start();
  }
}

// Set up IntersectionObserver on the scroll rail
if (rail && state.cards?.length > 0) {
  const postcards = rail.querySelectorAll('.postcard');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.intersectionRatio >= 0.6) {
        const cardEl  = entry.target;
        const allCards = Array.from(postcards);
        const idx     = allCards.indexOf(cardEl);
        if (idx !== -1) updateCardUI(idx);
      }
    });
  }, {
    root: rail,          // observe within the scroll rail itself
    threshold: 0.6,      // trigger when 60% of the card is visible
  });

  postcards.forEach(card => observer.observe(card));

  // Fire initial state (first card)
  updateCardUI(0);
}

// ── Dot click: scroll the rail to the clicked card ───────────────────────
dotsEl?.addEventListener('click', e => {
  const btn = e.target.closest('.card-dot');
  if (!btn) return;

  const idx      = parseInt(btn.dataset.idx, 10);
  const postcards = rail?.querySelectorAll('.postcard');
  if (!postcards || !postcards[idx]) return;

  postcards[idx].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
});

// ── Fun-fact tap-to-reveal logic ──────────────────────────────────────────
// Event delegation on the whole rail — one listener handles all cards.
rail?.addEventListener('click', e => {
  const toggleBtn = e.target.closest('.postcard__funfact-toggle');
  if (!toggleBtn) return;

  const cardId = toggleBtn.dataset.card;
  const panel  = document.getElementById(`funfact-${cardId}`);
  if (!panel) return;

  // Reveal the panel
  panel.classList.add('revealed');
  panel.removeAttribute('aria-hidden');

  // Hide the toggle button (it's no longer needed)
  toggleBtn.classList.add('hidden');
  toggleBtn.setAttribute('aria-expanded', 'true');
});

// ── Swipe support (touchstart / touchend fallback) ────────────────────────
// scroll-snap handles most swipe cases natively on mobile, but this
// provides a fallback nudge for browsers where snap is not smooth.
let touchStartX = 0;

rail?.addEventListener('touchstart', e => {
  touchStartX = e.touches[0].clientX;
}, { passive: true });

rail?.addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  const postcards = rail.querySelectorAll('.postcard');

  if (Math.abs(dx) < 40) return; // ignore micro-movements

  const nextIdx = dx < 0
    ? Math.min(currentCardIdx + 1, state.cards.length - 1)
    : Math.max(currentCardIdx - 1, 0);

  if (postcards[nextIdx]) {
    postcards[nextIdx].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// DIALECT TAB
// ═══════════════════════════════════════════════════════════════════════════
const d = state.dialectWord;
document.getElementById('dialect-word').textContent    = `"${d.word}"`;
document.getElementById('dialect-pron').textContent    = `/${d.pronunciation}/`;
document.getElementById('dialect-meaning').textContent = d.meaning;
document.getElementById('dialect-badge').textContent   = `${state.name} dialect`;

// ═══════════════════════════════════════════════════════════════════════════
// TAB SWITCHING
// ═══════════════════════════════════════════════════════════════════════════
document.querySelectorAll('.ntab').forEach(tab => {
  tab.addEventListener('click', () => {
    // Deactivate all tabs
    document.querySelectorAll('.ntab').forEach(t => {
      t.classList.remove('active');
      t.setAttribute('aria-selected', 'false');
    });
    // Hide all panels
    document.querySelectorAll('.ntab-content').forEach(c => c.classList.add('hidden'));

    // Activate clicked tab
    tab.classList.add('active');
    tab.setAttribute('aria-selected', 'true');

    const panelId = `tab-${tab.dataset.tab}`;
    const panel   = document.getElementById(panelId);
    if (panel) {
      panel.classList.remove('hidden');
    }

    // Map tab name → Storage progress key
    const progressMap = {
      story:   'story',
      cards:   'culture',
      dialect: 'activity',
    };
    const key = progressMap[tab.dataset.tab];
    if (key) Storage.markCompleted(stateId, key);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// CTA BUTTONS
// ═══════════════════════════════════════════════════════════════════════════

// "Discover More" — jump to the cards tab
document.getElementById('cta-to-cards')?.addEventListener('click', () => {
  document.querySelector('[data-tab="cards"]')?.click();
});

// "Play the Games!" — mark culture done, start the activity chain (Word Scramble
// → Drag-Match → Guess My State → Quiz → Reward).
document.getElementById('cta-to-quiz')?.addEventListener('click', () => {
  Storage.markCompleted(stateId, 'culture');
  window.location.href = `scramble.html?state=${stateId}`;
});

// "Try an Activity" (dialect tab) — also enters the activity chain at the start.
document.getElementById('cta-to-activity')?.addEventListener('click', () => {
  window.location.href = `scramble.html?state=${stateId}`;
});
