// js/components/progressBar.js

const ProgressBar = {
  render({ current, total, label = '', color = 'var(--color-red)' }) {
    const pct = Math.round((current / total) * 100);
    return `
      <div class="progress-wrap">
        <span class="progress-label" style="white-space:nowrap;">${label || current + '/' + total}</span>
        <div class="progress-bar-track">
          <div class="progress-bar-fill" style="width:${pct}%; background:${color};"></div>
        </div>
        <span class="progress-label">${pct}%</span>
      </div>`;
  }
};