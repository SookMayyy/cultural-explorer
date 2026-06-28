# Fun UI Animations (Blooket / Wordwall style)

Ready-to-use CSS that gives the bouncy, satisfying, kid-game feel of Blooket,
Wordwall, and Kahoot — built only with CSS keyframes, matching the existing design
tokens. Copy what you need into `global.css` and apply the class. Keep everything
wrapped so reduced-motion users opt out (see bottom).

## 1. Chunky button press (Blooket-style)
A thick bottom edge that "presses down" on tap. Your `.btn--gold` / `.btn--purple`
already do this via the `0 5px 0` shadow — this is the explicit pattern:
```css
.btn-3d{ box-shadow:0 6px 0 var(--gold-dark); transition:transform .08s, box-shadow .08s; }
.btn-3d:active{ transform:translateY(4px); box-shadow:0 2px 0 var(--gold-dark); }
```

## 2. Card flip (Wordwall reveal)
Flip a card to reveal its content — great for content cards and quiz cards.
```css
.flip{ perspective:800px; }
.flip__inner{ transition:transform .5s; transform-style:preserve-3d; position:relative; }
.flip.flipped .flip__inner{ transform:rotateY(180deg); }
.flip__front,.flip__back{ backface-visibility:hidden; position:absolute; inset:0; }
.flip__back{ transform:rotateY(180deg); }
```

## 3. Answer-reveal pop
The selected answer "pops" when chosen — satisfying tactile feedback.
```css
@keyframes pop{ 0%{transform:scale(1)} 40%{transform:scale(1.12)} 100%{transform:scale(1)} }
.pop{ animation:pop .35s ease; }
```

## 4. Correct-answer burst (Kahoot/Blooket joy)
A quick scale + glow when an answer is right.
```css
@keyframes burst{
  0%{transform:scale(1); box-shadow:0 0 0 0 rgba(39,174,96,.5)}
  50%{transform:scale(1.06)}
  100%{transform:scale(1); box-shadow:0 0 0 16px rgba(39,174,96,0)}
}
.burst{ animation:burst .6s ease; }
```

## 5. Countdown pulse (timed-question tension)
For a timer that pulses faster as it runs low.
```css
@keyframes count-pulse{ 0%,100%{transform:scale(1)} 50%{transform:scale(1.15)} }
.count-pulse{ animation:count-pulse 1s ease-in-out infinite; }
.count-pulse.urgent{ animation-duration:.5s; color:var(--red-text); }
```

## 6. Coin / points fly-up
When points are earned, a little "+10" floats up and fades.
```css
@keyframes fly-up{ 0%{transform:translateY(0); opacity:1} 100%{transform:translateY(-40px); opacity:0} }
.fly-up{ animation:fly-up .8s ease-out forwards; font-family:var(--font-display); color:var(--green); }
```
```js
// show a +N that floats up from an element
function showPoints(el, n){
  const t=document.createElement('span');
  t.className='fly-up'; t.textContent='+'+n;
  t.style.position='absolute';
  el.appendChild(t); setTimeout(()=>t.remove(),800);
}
```

## 7. Wiggle (invite a tap)
Gently wiggle the next button to draw the child's attention.
```css
@keyframes wiggle{ 0%,100%{transform:rotate(0)} 25%{transform:rotate(-4deg)} 75%{transform:rotate(4deg)} }
.wiggle{ animation:wiggle .5s ease-in-out 2; }
```

## 8. Tile drop-in (staggered entrance)
Quiz options / cards drop in one after another for a lively entrance.
```css
@keyframes drop-in{ from{opacity:0; transform:translateY(-20px)} to{opacity:1; transform:translateY(0)} }
.drop-in{ animation:drop-in .4s ease forwards; opacity:0; }
/* stagger with inline style: style="animation-delay:.08s" on each item */
```

## Timing & taste

- Keep feedback animations 0.3–0.6s — fast enough to feel snappy.
- Stagger entrances by ~0.06–0.10s per item; more feels slow.
- One or two animated focal points per screen, never the whole screen moving.
- Bouncy easing for rewards: `cubic-bezier(.22,.68,0,1.2)`.

## Reduced motion (always include)
```css
@media (prefers-reduced-motion: reduce){
  *{ animation:none !important; transition:none !important; }
}
```

These pair with the existing keyframes in `animations.md` (float, bounce-in,
celebrate, stamp-land, shake, confetti). Use those for mascots and rewards, and
these for buttons, cards, quiz feedback, and points.
