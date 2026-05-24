// js/pages/narrativePage.js — Discovery cards screen (story + culture + activity + quiz)

import { navigate, renderTopbar, AppState } from '../app.js';
import Storage from '../utils/storage.js';
import { getState } from '../data/states.js';
import Typewriter from '../components/typewriter.js';

const NarrativePage = {
  _stateId: null,
  _state:   null,
  _cardIdx: 0,
  _tw:      null,

  render(screen, params = {}) {
    this._stateId = params.stateId || AppState.currentStateId;
    this._state   = getState(this._stateId);
    this._cardIdx = 0;

    if (!this._state) {
      screen.innerHTML = '<p style="padding:2rem">State not found.</p>';
      return;
    }

    const s = this._state;

    renderTopbar({
      title:       s.name,
      showBack:    true,
      backTarget:  'map',
      showPoints:  true,
      accentColor: s.color,
    });

    screen.innerHTML = `
      <div class="narrative-screen" style="--state-color:${s.color}; --state-color-light:${s.colorLight}">

        <!-- State hero banner -->
        <div class="narrative-hero" style="background:${s.color}">
          <!-- 📸 IMAGE NEEDED: {stateId}-hero.png — scenic hero illustration for ${s.name}
               Export from Figma → States/${s.name}/Hero image
               Place in: public/assets/images/states/${s.id}-hero.png -->
          <div class="narrative-hero-overlay">
            <span class="narrative-hero-emoji">${s.emoji}</span>
            <h2 class="narrative-hero-name">${s.name}</h2>
            <p class="narrative-hero-tagline">${s.tagline}</p>
          </div>
        </div>

        <!-- Tab navigation: Story / Cards / Dialect -->
        <div class="narrative-tabs">
          <button class="ntab active" data-tab="story">📖 Story</button>
          <button class="ntab" data-tab="cards">🃏 Discover</button>
          <button class="ntab" data-tab="dialect">💬 Dialect</button>
        </div>

        <!-- Tab content -->
        <div id="tab-story" class="ntab-content active">
          <div class="narrative-story-body">
            <div class="narrative-mascot-row">
              <div class="narrative-mascot-figure">🦁</div>
              <div class="narrative-story-bubble">
                <p id="story-text"></p>
              </div>
            </div>
            <div class="story-text-card card">
              <p class="story-full-text">${s.story}</p>
            </div>
            <button class="btn-primary narrative-cta" id="cta-to-cards">
              Discover More 🃏
            </button>
          </div>
        </div>

        <div id="tab-cards" class="ntab-content hidden">
          <!-- Card navigation -->
          <div class="card-nav-row">
            <button class="card-nav-btn" id="card-prev" disabled>‹</button>
            <span class="card-counter" id="card-counter">1 / ${s.cards.length}</span>
            <button class="card-nav-btn" id="card-next">›</button>
          </div>
          <!-- Card dots -->
          <div class="card-dots" id="card-dots">
            ${s.cards.map((_, i) => `<span class="card-dot ${i === 0 ? 'active' : ''}"></span>`).join('')}
          </div>
          <!-- Card area -->
          <div class="card-area" id="card-area"></div>
          <!-- Mascot row -->
          <div class="narrative-mascot-row" id="card-mascot-row">
            <div class="narrative-mascot-figure">🦁</div>
            <div class="narrative-card-bubble">
              <p id="card-mascot-text">Let's explore ${s.name}!</p>
            </div>
          </div>
          <!-- Challenge button -->
          <button class="btn-primary narrative-cta" id="cta-to-quiz">
            🎯 Take the Quiz!
          </button>
        </div>

        <div id="tab-dialect" class="ntab-content hidden">
          <div class="dialect-card card">
            <div class="dialect-icon">💬</div>
            <h3 class="dialect-word">"${s.dialectWord.word}"</h3>
            <p class="dialect-pronunciation">/${s.dialectWord.pronunciation}/</p>
            <p class="dialect-meaning">${s.dialectWord.meaning}</p>
            <div class="dialect-region-badge">${s.name} dialect</div>
          </div>
          <div class="dialect-fun-fact card">
            <h4>Did you know?</h4>
            <p>Malaysia has many different languages and dialects! Each state has its own unique words and expressions.</p>
          </div>
          <button class="btn-primary narrative-cta" id="cta-to-activity">
            🎮 Try an Activity!
          </button>
        </div>

      </div>
    `;

    // Render first card
    this._renderCard(screen, 0);

    // Start story typewriter
    const storyEl = screen.querySelector('#story-text');
    if (storyEl) {
      const snippet = s.story.slice(0, 140) + '…';
      this._tw = new Typewriter(storyEl, snippet, { speed: 28 });
      this._tw.start();
    }
  },

  init(screen, params = {}) {
    const s = this._state;
    if (!s) return;

    // Tab switching
    screen.querySelectorAll('.ntab').forEach(tab => {
      tab.addEventListener('click', () => {
        screen.querySelectorAll('.ntab').forEach(t => t.classList.remove('active'));
        screen.querySelectorAll('.ntab-content').forEach(c => c.classList.add('hidden'));
        tab.classList.add('active');
        const content = screen.querySelector('#tab-' + tab.dataset.tab);
        content?.classList.remove('hidden');
        content?.classList.add('active');
        if (tab.dataset.tab === 'story') Storage.markCompleted(s.id, 'story');
        if (tab.dataset.tab === 'cards') Storage.markCompleted(s.id, 'culture');
        if (tab.dataset.tab === 'dialect') Storage.markCompleted(s.id, 'activity');
      });
    });

    // Card prev/next
    screen.querySelector('#card-prev')?.addEventListener('click', () => {
      if (this._cardIdx > 0) this._renderCard(screen, --this._cardIdx);
    });
    screen.querySelector('#card-next')?.addEventListener('click', () => {
      if (this._cardIdx < s.cards.length - 1) this._renderCard(screen, ++this._cardIdx);
    });

    // Swipe support
    let touchStartX = 0;
    const cardArea = screen.querySelector('#card-area');
    cardArea?.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    cardArea?.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (dx < -50 && this._cardIdx < s.cards.length - 1) this._renderCard(screen, ++this._cardIdx);
      if (dx >  50 && this._cardIdx > 0)                   this._renderCard(screen, --this._cardIdx);
    });

    // CTA buttons
    screen.querySelector('#cta-to-cards')?.addEventListener('click', () => {
      screen.querySelectorAll('.ntab').forEach(t => t.classList.remove('active'));
      screen.querySelectorAll('.ntab-content').forEach(c => { c.classList.add('hidden'); c.classList.remove('active'); });
      screen.querySelector('[data-tab="cards"]')?.classList.add('active');
      screen.querySelector('#tab-cards')?.classList.remove('hidden');
      Storage.markCompleted(s.id, 'story');
    });

    screen.querySelector('#cta-to-quiz')?.addEventListener('click', () => {
      Storage.markCompleted(s.id, 'culture');
      navigate('quiz', { stateId: s.id });
    });

    screen.querySelector('#cta-to-activity')?.addEventListener('click', () => {
      Storage.markCompleted(s.id, 'activity');
      navigate('quiz', { stateId: s.id });
    });

    Storage.markCompleted(s.id, 'story');
  },

  _renderCard(screen, idx) {
    const card    = this._state.cards[idx];
    const cardArea = screen.querySelector('#card-area');
    const counter  = screen.querySelector('#card-counter');
    const dots     = screen.querySelectorAll('.card-dot');
    const prevBtn  = screen.querySelector('#card-prev');
    const nextBtn  = screen.querySelector('#card-next');
    const mascotTxt = screen.querySelector('#card-mascot-text');

    if (!cardArea || !card) return;

    cardArea.innerHTML = `
      <div class="culture-card card">
        <div class="culture-card-header" style="background:${this._state.color}">
          <span class="culture-card-icon">${card.icon}</span>
          <div>
            <span class="culture-card-category">${card.category}</span>
            <h3 class="culture-card-title">${card.title}</h3>
          </div>
        </div>
        <div class="culture-card-body">
          ${card.image
            ? `<!-- 📸 IMAGE NEEDED: ${this._state.id}-${card.id}.png
                    Export from Figma → Cards/${this._state.name}/${card.category}
                    Place in: public/assets/images/cards/${this._state.id}/${card.id}.png -->
               <img src="assets/images/cards/${this._state.id}/${card.id}.png" class="culture-card-img" alt="${card.title}">`
            : `<!-- 📸 IMAGE NEEDED: ${card.id}.png
                    Export from Figma → Cards/${this._state.name}/${card.category} — ${card.title} illustration
                    Place in: public/assets/images/cards/${this._state.id}/${card.id}.png -->
               <div class="culture-card-img-placeholder">
                 <span>${card.icon}</span>
               </div>`
          }
          <p class="culture-card-desc">${card.desc}</p>
          <div class="culture-card-funfact">
            <span class="funfact-label">💡 Fun Fact!</span>
            <p>${card.funFact}</p>
          </div>
        </div>
      </div>
    `;

    if (counter) counter.textContent = `${idx + 1} / ${this._state.cards.length}`;
    dots.forEach((d, i) => d.classList.toggle('active', i === idx));
    if (prevBtn) prevBtn.disabled = idx === 0;
    if (nextBtn) nextBtn.disabled = idx === this._state.cards.length - 1;

    // Mascot typewriter
    if (mascotTxt && card.mascotLine) {
      this._tw?.stop();
      this._tw = new Typewriter(mascotTxt, card.mascotLine, { speed: 30 });
      this._tw.start();
    }
  },
};

export default NarrativePage;
