// js/components/dragMatch.js — Tap-to-select food chip → tap drop zone to match

export default class DragMatch {
  constructor(container, pairs, onComplete) {
    this._el         = container;
    this._pairs      = pairs;   // [{ food, state }]
    this._onComplete = onComplete;
    this._selected   = null;    // currently selected chip
    this._correct    = 0;
  }

  render() {
    this._el.innerHTML = `
      <div class="dragmatch-wrapper">
        <p class="dragmatch-instruction">Tap a food, then tap the matching state!</p>
        <div class="drag-chips">
          ${this._pairs.map((p, i) => `
            <div class="drag-chip" data-chip="${i}">${p.food}</div>
          `).join('')}
        </div>
        <div class="drag-zones">
          ${this._pairs.map((p, i) => `
            <div class="drag-zone" data-zone="${i}">
              <span class="drag-zone-label">${p.state}</span>
            </div>
          `).join('')}
        </div>
        <div class="dragmatch-score">
          <span class="score-label">Matched:</span>
          <span class="score-val">0 / ${this._pairs.length}</span>
        </div>
      </div>
    `;
    this._bindEvents();
  }

  _bindEvents() {
    this._el.querySelectorAll('.drag-chip').forEach(chip => {
      chip.addEventListener('click', () => this._selectChip(chip));
    });
    this._el.querySelectorAll('.drag-zone').forEach(zone => {
      zone.addEventListener('click', () => this._dropOnZone(zone));
    });
  }

  _selectChip(chip) {
    if (chip.classList.contains('placed')) return;
    this._el.querySelectorAll('.drag-chip').forEach(c => c.classList.remove('selected'));
    this._selected = chip;
    chip.classList.add('selected');
  }

  _dropOnZone(zone) {
    if (!this._selected) return;
    if (zone.classList.contains('filled')) return;

    const chipIdx = parseInt(this._selected.dataset.chip);
    const zoneIdx = parseInt(zone.dataset.zone);
    const correct = chipIdx === zoneIdx;

    if (correct) {
      zone.classList.add('correct-zone', 'filled');
      zone.innerHTML = `<span class="drag-zone-label">${this._pairs[zoneIdx].state}</span>
                        <span class="drag-chip-placed">${this._pairs[chipIdx].food}</span>`;
      this._selected.classList.add('placed', 'selected');
      this._selected = null;
      this._correct++;
      this._updateScore();
      if (this._correct === this._pairs.length) {
        setTimeout(() => this._onComplete?.(), 600);
      }
    } else {
      zone.classList.add('wrong-zone');
      setTimeout(() => zone.classList.remove('wrong-zone'), 600);
    }
  }

  _updateScore() {
    const el = this._el.querySelector('.score-val');
    if (el) el.textContent = `${this._correct} / ${this._pairs.length}`;
  }
}
