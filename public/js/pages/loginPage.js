// js/pages/loginPage.js — Login / sign-in screen (student + teacher paths)

import { navigate } from '../app.js';
import Storage from '../utils/storage.js';

const AVATARS = [
  '🦁','🐘','🦧','🦜','🐯','🦊','🦎','🦀','🐊','🦋',
  '🦚','🦃','🦤','🦞','🦅','🦩','🐢','🐬','🦈','🦦',
];

const LoginPage = {
  _selectedAvatar: 0,
  _mode: 'student', // 'student' | 'guest' | 'teacher'

  render(screen, params = {}) {
    this._mode = params.mode || 'student';

    screen.innerHTML = `
      <div class="login-wrapper">

        <!-- Header -->
        <div class="login-header">
          <!-- 📸 IMAGE NEEDED: batik-pattern.png — batik background texture
               Already in: public/assets/images/ui/batik-pattern.png -->
          <img src="assets/images/ui/top-left.png"  class="login-deco login-deco--tl" alt="">
          <img src="assets/images/ui/top-right.png" class="login-deco login-deco--tr" alt="">

          <!-- 📸 IMAGE NEEDED: rimau-welcome.png — Rimau waving welcome pose
               Export from Figma → Login/Rimau welcoming pose
               Place in: public/assets/images/mascots/rimau-welcome.png -->
          <div class="login-mascot" id="login-mascot">
            <div class="mascot-figure">🦁</div>
            <div class="login-mascot-bubble">
              <p id="mascot-bubble-text">Hello! I'm Rimau. Let's explore Malaysia together!</p>
            </div>
          </div>

          <h1 class="login-title">Cultural Explorer</h1>
          <p class="login-subtitle">Malaysia Adventure</p>
        </div>

        <!-- Path selection (default view) -->
        <div id="view-paths" class="login-body">
          <p class="login-prompt">How do you want to play?</p>

          <div class="login-path-cards">
            <button class="login-path-card" id="btn-moe">
              <span class="path-icon">🎓</span>
              <span class="path-label">Student Login</span>
              <span class="path-desc">Use your school ID (IC number)</span>
            </button>
            <button class="login-path-card" id="btn-class">
              <span class="path-icon">🏫</span>
              <span class="path-label">Class PIN</span>
              <span class="path-desc">Enter the PIN from your teacher</span>
            </button>
          </div>

          <button class="login-guest-btn" id="btn-guest">
            👤 Play as Guest (no account needed)
          </button>

          <button class="login-teacher-link" id="btn-teacher-link">
            🔑 Teacher Login
          </button>
        </div>

        <!-- MOE Student ID form -->
        <div id="view-moe" class="login-body hidden">
          <button class="login-back-btn" id="back-from-moe">‹ Back</button>
          <h2 class="login-form-title">Student Login</h2>
          <p class="login-form-desc">Enter your 12-digit IC number (without dashes)</p>

          <div class="login-form">
            <div class="input-group">
              <label class="input-label">IC Number</label>
              <input type="tel" id="moe-ic" class="login-input" placeholder="e.g. 120101010001"
                     maxlength="12" inputmode="numeric" pattern="[0-9]*">
              <span class="input-hint">12 digits, no dashes</span>
            </div>
            <div class="input-group">
              <label class="input-label">Display Name</label>
              <input type="text" id="moe-name" class="login-input" placeholder="What should we call you?"
                     maxlength="20">
            </div>
            <p class="input-error hidden" id="moe-error"></p>
            <button class="btn-primary" id="btn-moe-submit">Let's Go! 🚀</button>
          </div>
        </div>

        <!-- Class PIN flow — 3 steps -->
        <div id="view-class" class="login-body hidden">
          <button class="login-back-btn" id="back-from-class">‹ Back</button>

          <!-- Step 1: Enter PIN -->
          <div id="step-pin" class="login-step">
            <h2 class="login-form-title">Class PIN</h2>
            <p class="login-form-desc">Enter the 6-digit PIN from your teacher</p>
            <div class="pin-input-row">
              ${Array.from({length: 6}, (_, i) => `<input type="tel" class="pin-digit" maxlength="1" inputmode="numeric" data-pos="${i}">`).join('')}
            </div>
            <p class="input-error hidden" id="pin-error"></p>
            <button class="btn-primary" id="btn-pin-next">Next ›</button>
          </div>

          <!-- Step 2: Choose avatar -->
          <div id="step-avatar" class="login-step hidden">
            <h2 class="login-form-title">Pick Your Animal!</h2>
            <p class="login-form-desc">This is your character in the game</p>
            <div class="avatar-grid" id="avatar-grid">
              ${AVATARS.map((a, i) => `
                <button class="avatar-item ${i === 0 ? 'selected' : ''}" data-avatar="${i}" aria-label="Avatar ${a}">
                  ${a}
                </button>
              `).join('')}
            </div>
            <button class="btn-primary" id="btn-avatar-next">Next ›</button>
          </div>

          <!-- Step 3: Enter name -->
          <div id="step-name" class="login-step hidden">
            <h2 class="login-form-title">What's Your Name?</h2>
            <p class="login-form-desc">This is how other players will see you</p>
            <div class="name-preview" id="name-preview">
              <span class="name-avatar-preview" id="name-avatar">🦁</span>
              <span class="name-label-preview" id="name-label">Explorer</span>
            </div>
            <div class="input-group">
              <input type="text" id="class-name" class="login-input" placeholder="Your nickname"
                     maxlength="20" autocomplete="off">
            </div>
            <div class="step-dots">
              <span class="step-dot done"></span>
              <span class="step-dot done"></span>
              <span class="step-dot active"></span>
            </div>
            <button class="btn-primary" id="btn-name-submit">Start Exploring! 🗺️</button>
          </div>
        </div>

        <!-- Teacher login form -->
        <div id="view-teacher" class="login-body hidden">
          <button class="login-back-btn" id="back-from-teacher">‹ Back</button>
          <h2 class="login-form-title">🏫 Teacher Login</h2>
          <div class="login-form">
            <div class="input-group">
              <label class="input-label">Email</label>
              <input type="email" id="teacher-email" class="login-input" placeholder="teacher@school.edu.my">
            </div>
            <div class="input-group">
              <label class="input-label">Password</label>
              <input type="password" id="teacher-pass" class="login-input" placeholder="Password">
            </div>
            <p class="input-error hidden" id="teacher-error"></p>
            <button class="btn-primary" id="btn-teacher-submit">Login</button>
          </div>
          <p class="login-register-link">No account? Contact your school admin.</p>
        </div>

      </div>
    `;
  },

  init(screen, params = {}) {
    const onLogin = params.onLogin || (() => navigate('map'));
    this._selectedAvatar = 0;

    // If mode pre-set, jump directly
    if (params.mode === 'guest') {
      this._doGuestLogin(onLogin);
      return;
    }
    if (params.mode === 'teacher') {
      this._showView(screen, 'view-teacher');
    }

    // Path cards
    screen.querySelector('#btn-moe')?.addEventListener('click', () => this._showView(screen, 'view-moe'));
    screen.querySelector('#btn-class')?.addEventListener('click', () => this._showView(screen, 'view-class'));
    screen.querySelector('#btn-guest')?.addEventListener('click', () => this._doGuestLogin(onLogin));
    screen.querySelector('#btn-teacher-link')?.addEventListener('click', () => this._showView(screen, 'view-teacher'));

    // Back buttons
    screen.querySelector('#back-from-moe')?.addEventListener('click', () => this._showView(screen, 'view-paths'));
    screen.querySelector('#back-from-class')?.addEventListener('click', () => this._showView(screen, 'view-paths'));
    screen.querySelector('#back-from-teacher')?.addEventListener('click', () => this._showView(screen, 'view-paths'));

    // MOE submit
    screen.querySelector('#btn-moe-submit')?.addEventListener('click', () => {
      const ic   = screen.querySelector('#moe-ic')?.value.trim();
      const name = screen.querySelector('#moe-name')?.value.trim();
      const err  = screen.querySelector('#moe-error');
      if (!ic || ic.length !== 12 || !/^\d+$/.test(ic)) {
        err.textContent = 'Please enter a valid 12-digit IC number.';
        err.classList.remove('hidden');
        return;
      }
      if (!name) {
        err.textContent = 'Please enter your name.';
        err.classList.remove('hidden');
        return;
      }
      onLogin({ type: 'moe', displayName: name, avatarId: 0, icNumber: ic, points: 0 });
    });

    // PIN digit auto-advance
    const pinDigits = screen.querySelectorAll('.pin-digit');
    pinDigits.forEach((input, i) => {
      input.addEventListener('input', () => {
        input.value = input.value.replace(/\D/, '');
        if (input.value && i < pinDigits.length - 1) pinDigits[i + 1].focus();
      });
      input.addEventListener('keydown', e => {
        if (e.key === 'Backspace' && !input.value && i > 0) pinDigits[i - 1].focus();
      });
    });

    screen.querySelector('#btn-pin-next')?.addEventListener('click', () => {
      const pin = [...pinDigits].map(d => d.value).join('');
      const err = screen.querySelector('#pin-error');
      if (pin.length !== 6) {
        err.textContent = 'Please enter the full 6-digit PIN.';
        err.classList.remove('hidden');
        return;
      }
      err.classList.add('hidden');
      // In guest/demo mode accept any 6-digit PIN
      this._showStep(screen, 'step-avatar');
    });

    // Avatar selection
    screen.querySelector('#avatar-grid')?.querySelectorAll('.avatar-item').forEach(btn => {
      btn.addEventListener('click', () => {
        screen.querySelectorAll('.avatar-item').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        this._selectedAvatar = parseInt(btn.dataset.avatar);
        // Update name step preview
        const previewAvatar = screen.querySelector('#name-avatar');
        if (previewAvatar) previewAvatar.textContent = AVATARS[this._selectedAvatar];
      });
    });

    screen.querySelector('#btn-avatar-next')?.addEventListener('click', () => {
      this._showStep(screen, 'step-name');
    });

    // Name input live preview
    screen.querySelector('#class-name')?.addEventListener('input', (e) => {
      const label = screen.querySelector('#name-label');
      if (label) label.textContent = e.target.value || 'Explorer';
    });

    // Final submit
    screen.querySelector('#btn-name-submit')?.addEventListener('click', () => {
      const name = screen.querySelector('#class-name')?.value.trim();
      if (!name) { screen.querySelector('#class-name')?.focus(); return; }
      onLogin({ type: 'class', displayName: name, avatarId: this._selectedAvatar, points: 0 });
    });

    // Teacher submit (demo only)
    screen.querySelector('#btn-teacher-submit')?.addEventListener('click', () => {
      const email = screen.querySelector('#teacher-email')?.value.trim();
      const pass  = screen.querySelector('#teacher-pass')?.value;
      const err   = screen.querySelector('#teacher-error');
      if (!email || !pass) {
        err.textContent = 'Please enter your email and password.';
        err.classList.remove('hidden');
        return;
      }
      onLogin({ type: 'teacher', displayName: email, avatarId: null, points: 0 });
    });
  },

  _showView(screen, viewId) {
    screen.querySelectorAll('.login-body').forEach(v => v.classList.add('hidden'));
    screen.querySelector('#' + viewId)?.classList.remove('hidden');
  },

  _showStep(screen, stepId) {
    screen.querySelectorAll('.login-step').forEach(s => s.classList.add('hidden'));
    screen.querySelector('#' + stepId)?.classList.remove('hidden');
  },

  _doGuestLogin(onLogin) {
    const guestName = 'Explorer' + Math.floor(Math.random() * 1000);
    Storage.setGuest(guestName, 0);
    onLogin({ type: 'guest', displayName: guestName, avatarId: 0, points: 0 });
  },
};

export default LoginPage;
