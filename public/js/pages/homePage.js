// js/pages/homePage.js — Splash / landing screen

import { navigate } from '../app.js';

const HomePage = {
  render(screen) {
    // Full-screen splash — hide topbar and navbar
    const topbarEl = document.getElementById('topbar');
    const navbarEl = document.getElementById('navbar');
    if (topbarEl) topbarEl.hidden = true;
    if (navbarEl) navbarEl.hidden = true;

    screen.innerHTML = `
      <div class="home-screen">

        <!-- Background diagonal pattern -->
        <div class="home-bg-pattern" aria-hidden="true"></div>

        <!-- Decorative batik corners -->
        <!-- 📸 IMAGE NEEDED: top-left.png — batik corner decoration (top-left)
             Already in: public/assets/images/ui/top-left.png -->
        <img src="assets/images/ui/top-left.png"     class="home-corner home-corner--tl" alt="">
        <img src="assets/images/ui/top-right.png"    class="home-corner home-corner--tr" alt="">
        <img src="assets/images/ui/bottom-left.png"  class="home-corner home-corner--bl" alt="">
        <img src="assets/images/ui/bottom-right.png" class="home-corner home-corner--br" alt="">

        <!-- Top: flag + title -->
        <div class="home-top">
          <!-- 📸 IMAGE NEEDED: Malaysia-flag.png — Malaysian flag with crescent & stars
               Already in: public/assets/images/ui/Malaysia-flag.png -->
          <img src="assets/images/ui/Malaysia-flag.png" class="home-flag" alt="Malaysian flag">

          <div class="home-title-row">
            <span class="home-tagline-top">🇲🇾 Malaysia Adventure</span>
            <h1 class="home-title">Cultural<br>Explorer</h1>
            <p class="home-subtitle">Jelajah Budaya Malaysia!</p>
          </div>
        </div>

        <!-- Speech bubbles above mascots -->
        <div class="home-bubble-row">
          <div class="home-bubble">Selamat<br>datang! 👋</div>
          <div class="home-bubble">Let's<br>explore! 🗺️</div>
        </div>

        <!-- Mascots -->
        <div class="home-mascots">
          <div class="home-mascot-block">
            <!-- 📸 IMAGE NEEDED: rimau-mascot.png — Rimau tiger mascot full body
                 Export from Figma → Characters/Rimau
                 Place in: public/assets/images/mascots/rimau.png -->
            <div class="home-mascot-emoji" id="mascot-rimau">🦁</div>
            <span class="home-mascot-name">Rimau</span>
            <span class="home-mascot-region">West Malaysia</span>
          </div>

          <div class="home-mascot-block">
            <!-- 📸 IMAGE NEEDED: wak-mascot.png — Wak hornbill mascot full body
                 Export from Figma → Characters/Wak
                 Place in: public/assets/images/mascots/wak.png -->
            <div class="home-mascot-emoji home-mascot-emoji--wak" id="mascot-wak">🦜</div>
            <span class="home-mascot-name">Wak</span>
            <span class="home-mascot-region">East Malaysia</span>
          </div>
        </div>

        <!-- CTA buttons -->
        <div class="home-bottom">
          <button class="home-btn-primary" id="home-start">
            🎮 Start Exploring!
          </button>
          <button class="home-btn-secondary" id="home-guest">
            👤 Play as Guest
          </button>
          <button class="home-guest-link" id="home-teacher">
            🏫 Teacher / Parent Login
          </button>
        </div>

        <p class="home-version">Cultural Explorer MY · v2.0 · Sunway University FYP</p>
      </div>
    `;
  },

  init(screen, params = {}) {
    screen.querySelector('#home-start')?.addEventListener('click', () => {
      navigate('login', { mode: 'student', ...(params.onLogin ? { onLogin: params.onLogin } : {}) });
    });

    screen.querySelector('#home-guest')?.addEventListener('click', () => {
      navigate('login', { mode: 'guest', ...(params.onLogin ? { onLogin: params.onLogin } : {}) });
    });

    screen.querySelector('#home-teacher')?.addEventListener('click', () => {
      navigate('login', { mode: 'teacher', ...(params.onLogin ? { onLogin: params.onLogin } : {}) });
    });
  },
};

export default HomePage;
