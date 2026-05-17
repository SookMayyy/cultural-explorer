// js/components/topbar.js

const Topbar = {
  render(options = {}) {
    const { showBack = false, backTarget = 'home', title = null } = options;
    const pts  = Storage.getPoints();
    const name = Storage.getPlayer().slice(0, 3).toUpperCase();

    if (title) {
      return `
        <div class="topbar">
          ${showBack ? `<button class="back-btn" data-nav="${backTarget}">← Back</button>` : '<div style="width:60px"></div>'}
          <span class="topbar__logo" style="font-size:15px;">${title}</span>
          <div class="topbar__right">
            <div class="topbar__pts" id="pts-display">⭐ ${pts}</div>
            <div class="topbar__avatar">${name}</div>
          </div>
        </div>`;
    }

    return `
      <div class="topbar">
        <div class="topbar__logo">Cultural <span>Explorer</span> 🇲🇾</div>
        <div class="topbar__right">
          <div class="topbar__pts" id="pts-display">⭐ ${pts}</div>
          <div class="topbar__avatar">${name}</div>
        </div>
      </div>`;
  },

  updatePoints() {
    const el = document.getElementById('pts-display');
    if (el) el.textContent = '⭐ ' + Storage.getPoints();
  }
};