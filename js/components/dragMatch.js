// js/components/dragMatch.js
// Tap-to-select-and-place food matching mini-game

const DragMatch = (() => {
    let selected = null;   // currently selected chip text
    let matchedCount = 0;
    let totalPairs = 0;
    let onComplete = null;
  
    function render(pairs) {
      // pairs: [{ food, state }]
      totalPairs = pairs.length;
      matchedCount = 0;
      selected = null;
  
      // Build two food chips + one target per pair
      const chips = Helpers.shuffle(pairs.map(p => p.food));
      const targets = pairs; // keep original order for drop zones
  
      return `
        <div class="drag-match-wrap">
          <p class="drag-match-hint">Tap a food 👆 then tap the correct state!</p>
          <div class="drag-chips-row" id="dm-chips">
            ${chips.map(f => `
              <button class="drag-chip" data-food="${f}">${f}</button>`).join('')}
          </div>
          <div class="drag-drops-row" id="dm-drops">
            ${targets.map(p => `
              <div class="drop-box" data-state="${p.state}" data-correct="${p.food}">
                <span class="drop-label">${p.state}</span>
              </div>`).join('')}
          </div>
          <p class="feedback" id="dm-fb"></p>
        </div>`;
    }
  
    function init(containerEl, pairs, completeCb) {
      onComplete = completeCb;
      totalPairs = pairs.length;
      matchedCount = 0;
      selected = null;
  
      containerEl.querySelectorAll('.drag-chip').forEach(btn => {
        btn.addEventListener('click', () => selectChip(btn, containerEl));
      });
      containerEl.querySelectorAll('.drop-box').forEach(box => {
        box.addEventListener('click', () => drop(box, containerEl));
      });
    }
  
    function selectChip(btn, container) {
      container.querySelectorAll('.drag-chip').forEach(b => b.classList.remove('selected'));
      if (btn.classList.contains('placed')) return;
      selected = btn.dataset.food;
      btn.classList.add('selected');
      setFeedback(container, '', '');
    }
  
    function drop(box, container) {
      if (!selected) {
        setFeedback(container, 'bad', 'Tap a food chip first!');
        return;
      }
      if (box.classList.contains('correct')) return; // already matched
  
      if (selected === box.dataset.correct) {
        // ✅ Correct
        box.classList.add('correct');
        box.innerHTML = `<span>${selected} ✓</span>`;
        container.querySelectorAll('.drag-chip').forEach(b => {
          if (b.dataset.food === selected) { b.classList.add('placed'); b.classList.remove('selected'); }
        });
        matchedCount++;
        selected = null;
        setFeedback(container, 'ok', matchedCount === totalPairs ? '🎉 All matched! Excellent!' : '✅ Correct match!');
        if (matchedCount === totalPairs && onComplete) setTimeout(onComplete, 900);
      } else {
        // ❌ Wrong
        container.querySelectorAll('.drag-chip').forEach(b => b.classList.remove('selected'));
        selected = null;
        setFeedback(container, 'bad', '❌ Not quite — try another!');
        setTimeout(() => setFeedback(container, '', ''), 1400);
      }
    }
  
    function setFeedback(container, type, msg) {
      const fb = container.querySelector('#dm-fb');
      if (!fb) return;
      fb.textContent = msg;
      fb.className = 'feedback' + (type ? ' feedback--' + type : '');
    }
  
    return { render, init };
  })();