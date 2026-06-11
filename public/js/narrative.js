// js/narrative.js — narrative/discovery cards page

import Storage from './utils/storage.js';
import { renderTopbar, requireAuth, getStateParam } from './ui.js';
import { getState } from './data/states.js';
import Typewriter from './components/typewriter.js';

requireAuth();

const stateId = getStateParam();
const state   = getState(stateId);

if (!state) {
  document.querySelector('main').innerHTML = '<p style="padding:2rem;text-align:center">State not found. <a href="map.html">Back to map</a></p>';
  throw new Error('State not found: ' + stateId);
}

// Set state in storage for other pages
Storage.setCurrentState(stateId);
Storage.incrementVisit(stateId);

renderTopbar({
  title:    state.name,
  showBack: true,
  backHref: 'map.html',
  showPoints: true,
  color:    state.color,
});

// ── Hero banner ───────────────────────────────────────────────────────────────
const hero = document.getElementById('narrative-hero');
if (hero) {
  hero.style.background = state.color;
  // Try to load state hero image
  const heroImg = new Image();
  heroImg.onload = () => { hero.style.backgroundImage = `url(${heroImg.src})`; hero.style.backgroundSize = 'cover'; };
  heroImg.src = `assets/images/states/${stateId}-hero.png`;
}
document.getElementById('hero-emoji').innerHTML     = state.emoji;
document.getElementById('hero-name').textContent    = state.name;
document.getElementById('hero-tagline').textContent = state.tagline;

// CSS custom property for tab underline colour
document.querySelector('.narrative-screen')?.style.setProperty('--state-color', state.color);
document.querySelector('.narrative-screen')?.style.setProperty('--state-color-light', state.colorLight);

// ── Story tab ─────────────────────────────────────────────────────────────────
document.getElementById('story-text').textContent = state.story;

const storyMascotEl = document.getElementById('story-mascot-text');
if (storyMascotEl) {
  const snippet = state.story.slice(0, 120) + '…';
  new Typewriter(storyMascotEl, snippet, { speed: 28 }).start();
}

// ── Cards tab ─────────────────────────────────────────────────────────────────
let cardIdx = 0;

function renderCard(idx) {
  const card = state.cards[idx];
  if (!card) return;

  const area = document.getElementById('card-area');

  // Image: try to load, fall back to placeholder
  const imgHtml = `
    <div class="culture-card-img-placeholder" id="card-img-wrap">
      <span>${card.icon}</span>
      <!-- 📸 IMAGE NEEDED: assets/images/cards/${stateId}/${card.id}.png
           Export from Figma → Cards/${state.name}/${card.category} — ${card.title} illustration -->
    </div>
  `;

  area.innerHTML = `
    <div class="culture-card card">
      <div class="culture-card-header" style="background:${state.color}">
        <span class="culture-card-icon">${card.icon}</span>
        <div>
          <span class="culture-card-category">${card.category}</span>
          <h3 class="culture-card-title">${card.title}</h3>
        </div>
      </div>
      <div class="culture-card-body">
        ${imgHtml}
        <p class="culture-card-desc">${card.desc}</p>
        <div class="culture-card-funfact">
          <span class="funfact-label">💡 Fun Fact!</span>
          <p>${card.funFact}</p>
        </div>
      </div>
    </div>
  `;

  // Try loading actual image
  const imgWrap = document.getElementById('card-img-wrap');
  if (imgWrap) {
    const img = new Image();
    img.onload = () => {
      imgWrap.innerHTML = '';
      imgWrap.classList.remove('culture-card-img-placeholder');
      imgWrap.classList.add('culture-card-img-loaded');
      img.className = 'culture-card-img';
      img.alt = card.title;
      imgWrap.appendChild(img);
    };
    img.src = `assets/images/cards/${stateId}/${card.id}.png`;
  }

  // Update counter + dots
  const counter = document.getElementById('card-counter');
  if (counter) counter.textContent = `${idx + 1} / ${state.cards.length}`;

  document.querySelectorAll('.card-dot').forEach((dot, i) => {
    dot.classList.toggle('active', i === idx);
  });

  document.getElementById('card-prev').disabled = idx === 0;
  document.getElementById('card-next').disabled = idx === state.cards.length - 1;

  // Mascot typewriter
  const mascotEl = document.getElementById('card-mascot-text');
  if (mascotEl && card.mascotLine) {
    new Typewriter(mascotEl, card.mascotLine, { speed: 30 }).start();
  }
}

// Build card dots
const dotsEl = document.getElementById('card-dots');
if (dotsEl) {
  dotsEl.innerHTML = state.cards.map((_, i) =>
    `<span class="card-dot ${i === 0 ? 'active' : ''}"></span>`
  ).join('');
}

renderCard(0);

document.getElementById('card-prev')?.addEventListener('click', () => {
  if (cardIdx > 0) renderCard(--cardIdx);
});
document.getElementById('card-next')?.addEventListener('click', () => {
  if (cardIdx < state.cards.length - 1) renderCard(++cardIdx);
});

// Swipe support
let touchX = 0;
const cardArea = document.getElementById('card-area');
cardArea?.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, { passive: true });
cardArea?.addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - touchX;
  if (dx < -50 && cardIdx < state.cards.length - 1) renderCard(++cardIdx);
  if (dx > 50  && cardIdx > 0)                      renderCard(--cardIdx);
});

// ── Dialect tab ───────────────────────────────────────────────────────────────
const d = state.dialectWord;
document.getElementById('dialect-word').textContent  = `"${d.word}"`;
document.getElementById('dialect-pron').textContent  = `/${d.pronunciation}/`;
document.getElementById('dialect-meaning').textContent = d.meaning;
document.getElementById('dialect-badge').textContent = `${state.name} dialect`;

// ── Tab switching ─────────────────────────────────────────────────────────────
document.querySelectorAll('.ntab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.ntab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.ntab-content').forEach(c => c.classList.add('hidden'));
    tab.classList.add('active');
    document.getElementById('tab-' + tab.dataset.tab)?.classList.remove('hidden');

    // Mark progress
    const tabMap = { story: 'story', cards: 'culture', dialect: 'activity' };
    if (tabMap[tab.dataset.tab]) Storage.markCompleted(stateId, tabMap[tab.dataset.tab]);
  });
});

Storage.markCompleted(stateId, 'story');

// ── CTA buttons ───────────────────────────────────────────────────────────────
document.getElementById('cta-to-cards')?.addEventListener('click', () => {
  document.querySelector('[data-tab="cards"]')?.click();
});
document.getElementById('cta-to-quiz')?.addEventListener('click', () => {
  Storage.markCompleted(stateId, 'culture');
  window.location.href = `quiz.html?state=${stateId}`;
});
document.getElementById('cta-to-activity')?.addEventListener('click', () => {
  Storage.markCompleted(stateId, 'activity');
  window.location.href = `quiz.html?state=${stateId}`;
});
