/* difficultyChip.js — the difficulty selector shown on the hubs */

// Grade 1–3 see a locked "Explorer Mode" badge; older cohorts get a segmented
// Explorer/Adventurer control, saved per account and read by every mini-game.

import Storage from '../utils/storage.js';
import { LEVELS, allowedLevels, currentLevel, setLevel, canChoose } from '../data/difficulty.js';
import Sound from '../utils/sound.js';

export function renderDifficultyChip(container, { onChange } = {}) {
  if (!container) return;
  const group = (Storage.getSession && Storage.getSession()?.grade_group) || '';

  // Locked (Grade 1–3): static badge, no choice.
  if (!canChoose(group)) {
    const lv = LEVELS[currentLevel()];
    container.innerHTML = `
      <div class="diff-chip diff-chip--locked" role="group" aria-label="Difficulty">
        <span class="diff-chip-label">Difficulty</span>
        <span class="diff-badge">${lv.emoji} ${lv.name} Mode</span>
      </div>`;
    return;
  }

  const allowed = allowedLevels(group);

  function paint() {
    const active = currentLevel();
    container.innerHTML = `
      <div class="diff-chip" role="group" aria-label="Choose difficulty">
        <span class="diff-chip-label">Difficulty</span>
        <div class="diff-seg">
          ${allowed.map(id => {
            const lv = LEVELS[id];
            const on = id === active;
            return `<button type="button" class="diff-opt ${on ? 'is-active' : ''}"
                       data-level="${id}" aria-pressed="${on}">
                      <span class="diff-opt-emoji" aria-hidden="true">${lv.emoji}</span>${lv.name}
                    </button>`;
          }).join('')}
        </div>
        <span class="diff-hint" id="diff-hint">${LEVELS[active].tagline}</span>
      </div>`;

    container.querySelectorAll('.diff-opt').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.level;
        if (id === currentLevel()) return;
        setLevel(id);
        Sound.tap?.();
        paint();
        onChange?.(id);
      });
    });
  }

  paint();
}
