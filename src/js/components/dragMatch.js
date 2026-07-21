/* dragMatch.js — tap-to-select chip → tap drop zone to match */

// Constructor: new DragMatch(container, pairs, onComplete, options?), then render().
// Pairs take two mixable forms:
//   Legacy emoji chip: { food: '🍜 Char Kway Teow', state: 'Smoky fried noodles' }
//   Photo chip:        { image, icon, label, match }  (icon is the <img onerror> fallback)

// Pastel tile tints, cycled by chip index so every chip gets a distinct colour.
const TILE_COLORS = [
  'dm-tile--peach',
  'dm-tile--yellow',
  'dm-tile--mint',
  'dm-tile--sky',
  'dm-tile--lavend',
  'dm-tile--rose',
  'dm-tile--lime',
  'dm-tile--sand',
];

export default class DragMatch {
  // (container, pairs, onComplete, options?) — options override the visible text.
  constructor(container, pairs, onComplete, options = {}) {
    this._el         = container;
    this._pairs      = pairs;
    this._onComplete = onComplete;
    this._selected   = null;   // currently selected chip element
    this._correct    = 0;

    // Parameterised so the component re-themes for different mission types.
    this._title      = options.title      || 'MATCH THE TREASURE!';
    this._colHeading = options.colHeading || 'TREASURES';
  }

  /* Public */

  render() {
    // Separate chip indices into left column (even) and right column (odd).
    // This balances the columns: 4 pairs → 2 + 2; 3 pairs → 2 + 1.
    const leftIdxs  = this._pairs.map((_, i) => i).filter(i => i % 2 === 0);
    const rightIdxs = this._pairs.map((_, i) => i).filter(i => i % 2 !== 0);

    // Shuffle zone display order so answers don't sit directly under their chip.
    // data-zone holds the true pair index; data-pos holds the display position (1-based).
    const zoneOrder = this._shuffledOrder(this._pairs.length);

    this._el.innerHTML = `
      <div class="dragmatch-wrapper">

        <!-- Left column: even-indexed chips -->
        <div class="dm-col dm-col--left">
          <h3 class="dm-col-heading">${this._colHeading}</h3>
          ${leftIdxs.map(i => this._chipCard(this._pairs[i], i)).join('')}
        </div>

        <!-- Centre play card with drop zones -->
        <div class="dm-play-card">
          <!-- Corner doodles (☁ cloud top-left, 〰 waves bottom-right) -->
          <span class="dm-play-deco dm-play-deco--tl" aria-hidden="true">☁</span>
          <span class="dm-play-deco dm-play-deco--br" aria-hidden="true">〰</span>

          <h2 class="dm-play-title">${this._title}</h2>

          <div class="drag-zones">
            ${zoneOrder.map((pairIdx, displayPos) => `
              <div class="drag-zone"
                   data-zone="${pairIdx}"
                   data-pos="${displayPos + 1}">
                <span class="dm-zone-badge">${displayPos + 1}</span>
                <span class="drag-zone-label">${this._zoneLabel(this._pairs[pairIdx])}</span>
                <div class="dm-zone-drop">
                  <span class="dm-zone-plus">+</span>
                </div>
              </div>
            `).join('')}
          </div>

          <!-- Secondary score counter (small, inside card) -->
          <div class="dragmatch-score">
            <span class="score-label">Matched: </span>
            <span class="score-val">0 / ${this._pairs.length}</span>
          </div>
        </div>

        <!-- Right column: odd-indexed chips -->
        <div class="dm-col dm-col--right">
          <h3 class="dm-col-heading">${this._colHeading}</h3>
          ${rightIdxs.map(i => this._chipCard(this._pairs[i], i)).join('')}
        </div>

      </div>
    `;

    this._bindEvents();
  }

  /* Private helpers */

  // Drop-zone label: the `match` field when present, else legacy `state`.
  _zoneLabel(pair) {
    return pair.match || pair.state;
  }

  // Build a chip card (photo tile for `image` pairs, else emoji-split legacy chip).
  _chipCard(pair, index) {
    const tileColor = TILE_COLORS[index % TILE_COLORS.length];

    if (pair.image) {
      const fallback = pair.icon || '🖼️';
      return `
        <div class="drag-chip" data-chip="${index}" draggable="true">
          <div class="drag-chip__tile drag-chip__tile--photo ${tileColor}" aria-hidden="true">
            <img class="drag-chip__img" src="${pair.image}" alt="" loading="lazy"
                 onerror="this.replaceWith(document.createTextNode('${fallback}'))">
          </div>
          <div class="drag-chip__label">${pair.label}</div>
        </div>`;
    }

    // Legacy emoji-split chip — first token is almost always an emoji;
    // the rest of the string is the label.
    const parts = pair.food.split(' ');
    const icon  = parts[0];
    const label = parts.length > 1 ? parts.slice(1).join(' ') : pair.food;

    return `
      <div class="drag-chip" data-chip="${index}" draggable="true">
        <div class="drag-chip__tile ${tileColor}" aria-hidden="true">${icon}</div>
        <div class="drag-chip__label">${label}</div>
      </div>`;
  }

  // Returns indices 0..n-1 in random order, avoiding the identity permutation
  // (every answer directly under its chip) when n > 1.
  _shuffledOrder(n) {
    const order = Array.from({ length: n }, (_, i) => i);
    for (let attempt = 0; attempt < 5; attempt++) {
      for (let i = order.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [order[i], order[j]] = [order[j], order[i]];
      }
      if (n < 2 || order.some((v, i) => v !== i)) break;
    }
    return order;
  }

  _bindEvents() {
    /* Chip events (tap-to-select + HTML5 drag) */
    this._el.querySelectorAll('.drag-chip').forEach(chip => {
      // Tap/click selects a chip (primary interaction for young children).
      chip.addEventListener('click', () => this._selectChip(chip));

      // HTML5 drag (mouse/trackpad — touch uses the tap path above).
      chip.addEventListener('dragstart', e => {
        if (chip.classList.contains('placed')) { e.preventDefault(); return; }
        this._selectChip(chip);
        chip.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', chip.dataset.chip);
      });
      chip.addEventListener('dragend', () => {
        chip.classList.remove('dragging');
        this._el.querySelectorAll('.drag-zone.drag-over')
          .forEach(z => z.classList.remove('drag-over'));
      });
    });

    /* Zone events (tap-to-drop + HTML5 drop) */
    this._el.querySelectorAll('.drag-zone').forEach(zone => {
      // Tap/click on the zone drops the selected chip.
      zone.addEventListener('click', () => this._dropOnZone(zone));

      // dragover must preventDefault to allow a drop.
      zone.addEventListener('dragover', e => {
        if (zone.classList.contains('filled')) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        zone.classList.add('drag-over');
      });

      // Only drop the highlight when the pointer really leaves the zone,
      // not when it moves onto a child element.
      zone.addEventListener('dragleave', e => {
        if (!zone.contains(e.relatedTarget)) {
          zone.classList.remove('drag-over');
        }
      });

      zone.addEventListener('drop', e => {
        e.preventDefault();
        zone.classList.remove('drag-over');
        // _selected is already set by dragstart, so _dropOnZone works correctly.
        this._dropOnZone(zone);
      });
    });
  }

  _selectChip(chip) {
    if (chip.classList.contains('placed')) return;
    // Deselect all chips, then select this one
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
      const pair = this._pairs[chipIdx];
      // Photo pairs fill the zone with the same photo (emoji fallback);
      // legacy pairs use just the icon token from "food".
      const filledContent = pair.image
        ? `<img class="drag-chip__img drag-chip__img--zone" src="${pair.image}" alt="" ` +
          `onerror="this.replaceWith(document.createTextNode('${pair.icon || '✓'}'))">`
        : pair.food.split(' ')[0];

      // Show the matched state: ✓ badge + filled drop area.
      zone.classList.add('correct-zone', 'filled', 'burst');
      zone.innerHTML = `
        <span class="dm-zone-badge dm-zone-badge--check">✓</span>
        <span class="drag-zone-label">${this._zoneLabel(this._pairs[zoneIdx])}</span>
        <div class="dm-zone-drop dm-zone-drop--filled">${filledContent}</div>
      `;

      // Grey out the matched chip in the side column
      this._selected.classList.add('placed');
      this._selected.classList.remove('selected');
      this._selected = null;

      this._correct++;
      this._updateScore();

      if (this._correct === this._pairs.length) {
        // Small delay lets the last burst animation play before the overlay appears
        setTimeout(() => this._onComplete?.(), 600);
      }
    } else {
      // Wrong match: flash the zone red and shake it
      zone.classList.add('wrong-zone');
      setTimeout(() => zone.classList.remove('wrong-zone'), 600);
    }
  }

  _updateScore() {
    const el = this._el.querySelector('.score-val');
    if (el) el.textContent = `${this._correct} / ${this._pairs.length}`;
  }
}
