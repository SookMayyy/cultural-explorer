# LokaLearn — Mini-Games Claude Code Guide

This guide tells Claude Code how to build the three core cultural mini-games:
**word scramble**, **drag & match**, and **guess the state**. It also covers the
content flow that leads into them. Use it alongside `CLAUDE.md` and
`BUILD_PROMPT.md`. Build each game, get it working, then refine.

---

## IMPORTANT — mascot inconsistency to resolve first

Your story content (Johor, Kedah, Kelantan...) uses **Maya the Tapir** as the
narrator. But your existing prototype, `CLAUDE.md`, and design skill use
**Rimau (tiger)** and **Wak (hornbill)**. These are two different mascot systems.

**Pick one before building.** This guide is written for **Maya the Tapir**, since
your written story content is built entirely around her. If you keep Rimau/Wak
instead, simply swap the mascot name and emoji in the dialogue strings. Whatever
you choose, use it consistently across every screen.

---

## The focused flow (MVP scope) — UPDATED

### The framing story (one-time, at the start)

The game opens with a single **Culture Day framing story**, not a separate full
story for every state:

> "It's **Malaysia Culture Day** at your school! Every classroom has been turned
> into a different state, each with its own food, costumes and traditions. Maya
> the Tapir is your guide — explore each state's booth and collect a stamp from
> every one!"

This sets up the whole game, gives a relatable school setting, and introduces Maya
once. It plays only on first entry (store a flag so returning children skip
straight to the map).

### Light per-state intro (not a full story each)

When a child enters a state, Maya gives a **short intro of a few sentences** — not
a 200-word story. Example for Johor:

> "Welcome to the Johor booth! Down south here they do things their own way — even
> their laksa is special. Let's take a look! 🐯"

The **content cards** then do the actual cultural teaching. This means **far less
story writing for you**, while the cultural learning is still fully delivered
through the cards, games, and voiceover. Use a short `intro` field (2–3 sentences)
per state instead of a long `story` field; your detailed written stories can still
inform the card content and fun facts.

### Per-state journey loop

```
Light state intro → Content cards → Word scramble → Drag & match
→ Reward (stamp) → back to map
```

### Activity hub (navbar) — replaces the old Quiz tab

The navbar is now: **Home · Map · Activities · Stamps** (Profile/Settings via the
gear icon). The **Activities** tab opens a menu of all four games so children can
**replay** any of them:

```
Activities tab → choose: Word Scramble | Drag & Match | Quiz | Guess the State
```

- Activity-hub games draw from **all explored states** (free practice/review mode).
- In-journey games (inside the state loop) stay scoped to **that one state**.
- **Guess the State** lives here, shown **locked until 3 states are explored**.

### Why these changes

- **Activity hub** lets children replay games (repetition aids learning), gives a
  clean home for the gated Guess the State, and separates *learning* (map journey)
  from *practice* (activity hub).
- **Guess the State gated behind 3 states**: guessing the state you're currently in
  is trivial; drawing a random target from explored states makes it real recall
  practice (spaced retrieval).
- **Quiz is flag/picture state-cards**: visual questions (show a flag/picture, pick
  the state — or vice versa) suit primary children far better than text-only ones.
- **Framing story + light intros**: much less content to write and verify, a warmer
  setup, while cards/games/voiceover still carry the cultural content your project
  is assessed on.

> Note on your "Core Features" vision (Wau Bulan flight studio, cooking
> simulators, Congkak, etc.): these are wonderful but each is a project on its own.
> They belong in your report's **Future Work** chapter, not in the month of build
> time you have. Building the focused loop above well — with real cultural content
> for several states — is a stronger submission than a half-finished grand version.

---

## Shared data structure

Before the games, set up the per-state content as data. Claude Code should create
`public/js/data/stateContent.js` with one object per state. Example for Johor
(use your written story content for the rest):

```js
const STATE_CONTENT = {
  johor: {
    name: "Johor",
    intro: "Welcome to the Johor booth! Down south here they do things their own way — even their laksa is special. Let's take a look! 🐯",
    cards: [
      { type: "food",      title: "Laksa Johor",   emoji: "🍝",
        body: "A unique laksa made with spaghetti noodles in rich, spicy fish gravy — eaten with bare hands!",
        funFact: "The Sultan of Johor loved spaghetti so much he asked cooks to use it in laksa." },
      { type: "tradition", title: "Kuda Kepang",    emoji: "🐎",
        body: "A traditional dance where performers ride mock horses made of woven bamboo to gamelan music." },
      { type: "landmark",  title: "Tanjung Piai",   emoji: "🌳",
        body: "The southernmost tip of mainland Asia, famous for its beautiful mangrove forests." },
      { type: "dialect",   title: "Sakan",          emoji: "💬",
        body: "A Johor dialect word meaning awesome, very exciting, or done with great enthusiasm!" },
      { type: "costume",   title: "Baju Kurung Teluk Belanga", emoji: "👘",
        body: "A collarless traditional outfit with a special 'eel's bones' (tulang belut) stitched collar." }
    ],
    // words for the scramble game — drawn from the cards above
    scrambleWords: [
      { word: "LAKSA",   hint: "Johor's famous spaghetti noodle dish" },
      { word: "SAKAN",   hint: "Dialect word meaning awesome" },
      { word: "KUDA",    hint: "The bamboo horse dance: Kuda ___" },
      { word: "PIAI",    hint: "Tanjung ___, southernmost tip of Asia" }
    ],
    // pairs for drag & match
    matchPairs: [
      { item: "Laksa Johor",  emoji: "🍝", category: "Food" },
      { item: "Kuda Kepang",  emoji: "🐎", category: "Tradition" },
      { item: "Tanjung Piai", emoji: "🌳", category: "Landmark" },
      { item: "Sakan",        emoji: "💬", category: "Dialect" }
    ],
    // clues for guess-the-state (ordered: geography → food → landmark → fact)
    guessClues: [
      "I am the southern gateway of Peninsular Malaysia.",
      "My famous laksa is made with spaghetti noodles, not rice noodles!",
      "Tanjung Piai, the southernmost tip of mainland Asia, is in me.",
      "I am connected to Singapore by the famous Causeway bridge."
    ],
    quiz: [
      { q: "What type of noodles is uniquely used in Laksa Johor?",
        options: ["Spaghetti", "Rice noodles", "Egg noodles", "Glass noodles"], answer: 0 },
      { q: "What material is used to make the Kuda Kepang horses?",
        options: ["Woven bamboo", "Plastic", "Metal", "Cloth"], answer: 0 },
      { q: "What is special about Tanjung Piai?",
        options: ["Southernmost tip of mainland Asia", "Tallest mountain", "Oldest temple", "Longest river"], answer: 0 }
    ],
    stamp: { name: "The Southern Star Stamp", emoji: "⭐" }
  },
  // kedah: { ... }, kelantan: { ... }, etc.
};
```

This single structure feeds the cards AND all three games — so the content is
written once and reused.

---

## MINI-GAME 1 — Word Scramble

### Requirements (from your spec)
- Child can **type the answer** with the keyboard **OR tap letter tiles** to build it.
- Words relate to the state's food, landmark, tradition, dialect.
- Font is **big and sharp**.
- A **hint button** that **costs points** to use.
- Each round the word to unscramble is **randomized**.

### Files
```
public/views/scramble.html
public/css/scramble.css
public/js/pages/scramblePage.js
```

### Build instructions for Claude Code

**Setup**
1. On page load, read the active state id from `sessionStorage`.
2. Get `scrambleWords` for that state. **Shuffle the array** so the order is random
   each play, and pick the first word as the current round.
3. Scramble the chosen word's letters (Fisher–Yates shuffle on the characters);
   re-shuffle if the result accidentally equals the original.

**The two input methods**
- **Letter tiles:** render each scrambled letter as a big tappable tile. Tapping a
  tile moves it into the answer slot (and grays out the source tile). Tapping a
  filled answer slot removes that letter back.
- **Keyboard typing:** also render a hidden/standard text input, OR listen for
  `keydown` so a child who prefers typing can just type. Whichever letter they
  type fills the next answer slot and consumes the matching tile.
- Keep both in sync — typing and tapping update the same `answer` array.

**Checking**
- When the answer slots are full, compare to the target word.
- Correct → green flash on the slots, `SoundManager.play('correct')`, +10 points,
  mascot says "Sakan! You got it!", then load the next scrambled word (or move on
  to drag & match if all words are done).
- Wrong → shake the answer row, `SoundManager.play('wrong')`, clear the slots so
  they can retry. No points lost for a wrong guess.

**Hint button (costs points)**
- A "💡 Hint (−5 points)" button. On tap:
  - If the player has ≥5 points: subtract 5, reveal the word's hint text in a
    pop-up, and reveal the first still-empty letter in the answer.
  - If they have <5 points: show "You need more points! Keep playing to earn some."
- Update the points display immediately.

**Styling (big & sharp)**
- Use `--font-display` (Fredoka One) for the letter tiles at ~36px.
- Tiles: white, rounded `--r-md`, bold, with a clear shadow. Min 56×56px (child
  touch target). Generous gaps so small fingers don't mis-tap.

**Key state in scramblePage.js**
```js
let words = shuffle([...STATE_CONTENT[stateId].scrambleWords]);
let roundIndex = 0;
let current = words[roundIndex];      // { word, hint }
let scrambled = scramble(current.word);
let answer = [];                       // letters placed so far
let points = getPoints();              // from progress store
```

---

## MINI-GAME 2 — Drag & Match

### Requirements (from your spec)
- **Actual drag-and-drop** to the correct zone.
- **4 pairs** (food, tradition, landmark, dialect/fun fact).
- Culturally themed items matched to their **states or categories**.
- Correct → drop-zone turns **green**, chip marked placed.
- Wrong → chip **deselects**, **error sound**, try again.
- Images are **clear**.

### Files
```
public/views/dragmatch.html
public/css/dragmatch.css
public/js/pages/dragMatchPage.js
```

### Build instructions for Claude Code

**Setup**
1. Read active state id, get `matchPairs` (4 items, each with item + emoji + category).
2. Render two columns: **draggable chips** on the left, **category drop-zones** on
   the right. Shuffle both columns independently so positions vary each play.

**Drag and drop (HTML5 Drag and Drop API)**
- Each chip: `draggable="true"`, with `dragstart` storing its category in
  `dataTransfer`.
- Each drop-zone: handle `dragover` (call `e.preventDefault()` to allow dropping)
  and `drop`.
- On drop, compare the chip's category to the zone's category.

> Accessibility note: HTML5 drag-and-drop is hard for young children on
> touchscreens. Build a **tap-to-select fallback too**: tap a chip to select it
> (highlight), then tap a zone to place it. Support both. Your current prototype
> already uses tap-to-match — keep that and add real dragging on top for older kids.

**Feedback**
- Correct → the drop-zone turns green (`--green` border + tint), the chip locks in
  place with a ✓, `SoundManager.play('correct')`, +10 points.
- Wrong → the chip returns/deselects, the zone flashes red briefly,
  `SoundManager.play('wrong')`, mascot says "Not quite — try again!"
- When all 4 are placed correctly → short celebration, then navigate to the next
  game (guess the state).

**Clear images**
- For the prototype, emoji are fine. For the real version, drop in transparent PNG
  images of each food/landmark (see the asset guide). Use an `<img>` with the emoji
  as `onerror` fallback so it never breaks.

**Key state in dragMatchPage.js**
```js
let pairs = STATE_CONTENT[stateId].matchPairs;
let chips = shuffle([...pairs]);
let zones = shuffle(pairs.map(p => p.category));
let placed = 0;
let selectedChip = null;   // for the tap-to-match fallback
```

---

## MINI-GAME 3 — Guess the State (REVIEW GAME — gated)

> **This is NOT part of the per-state loop.** It is a separate review challenge
> opened from the **Activities tab**, and it **only unlocks after the child has explored 3
> states**. It draws its target from **any explored state** (chosen at random), so
> the child cannot simply pick the state they are currently in. This is what makes
> it a real recall test instead of a giveaway.

### Requirements
- Locked until **3+ states explored**. Show it on the map as a special "Challenge"
  button that is greyed out with a "Explore 3 states to unlock!" message until then.
- Target state is **picked at random from the explored states**.
- **Three clues given**; a **fourth clue** needs the **hint button** which **costs points**.
- Clue order: **Clue 1** vague/geography · **Clue 2** food · **Clue 3** landmark ·
  **Clue 4** specific fact.
- Correct guess **OR** all 4 clues exhausted → **Bonus reward**.

### Files
```
public/views/guess.html
public/css/guess.css
public/js/pages/guessPage.js
```

### Build instructions for Claude Code

**Unlock gate (do this first)**
- In the **Activities tab**, check how many states have `is_completed` / explored = true.
- If fewer than 3: the Guess the State button is disabled with a lock icon and the
  message "Explore 3 states to unlock this challenge!"
- If 3 or more: the button is active and tappable.

**Setup when opened**
1. Build a list of explored state ids. **Pick one at random** as the target — never
   default to the current state.
2. Get the target's `guessClues` array (4 clues, already ordered).
3. Build answer options: the correct state name + 2–3 decoy names chosen from the
   OTHER explored states (so all options are plausible), then shuffle.

**Clue reveal logic**
- Show **Clue 1** immediately. Clues 2 and 3 reveal as the child makes wrong
  guesses (or reveal the first three progressively — your choice; the spec says
  three are "given" and the fourth is gated).
- The **4th clue** is behind a "💡 Need another clue? (−5 points)" button:
  - ≥5 points → reveal clue 4, subtract 5 points.
  - <5 points → "You need more points to unlock the last clue!"

**Scoring by speed (rewards early guesses)**
- Correct on clue 1 → +20 points · clue 2 → +15 · clue 3 → +10 · clue 4 → +5
- Track which clue is currently visible to know the award.

**End conditions**
- Correct guess → mascot celebrates, `SoundManager.play('correct')`, award points,
  go to the bonus reward.
- All 4 clues shown and still wrong → reveal the answer kindly ("It was Johor!
  You'll get the next one!"), then go to the bonus reward anyway so the child is
  never stuck.

**Feedback**
- Wrong guess → that option flashes red, `SoundManager.play('wrong')`, the next
  clue reveals, mascot encourages.

**Key state in guessPage.js**
```js
const explored = getExploredStateIds();          // e.g. ['johor','kedah','penang']
if (explored.length < 3) { /* show locked message, return */ }
const targetId = explored[Math.floor(Math.random()*explored.length)];
let target = STATE_CONTENT[targetId];
let clues = target.guessClues;       // 4, ordered
let clueShown = 1;
const pointsByClue = { 1:20, 2:15, 3:10, 4:5 };
const decoys = shuffle(explored.filter(id => id !== targetId)).slice(0,2)
                 .map(id => STATE_CONTENT[id].name);
let options = shuffle([target.name, ...decoys]);
```

---

## MINI-GAME 4 — Quiz (flag / picture state-cards)

This replaces the plain text quiz. It ends the per-state loop, and it is **visual**
— ideal for primary-age children.

### Requirements
- Show a **grid of quiz cards**, one card per explored state.
- Each question is **visual**: it shows a **state flag or a picture** and asks the
  child to pick the correct **state name** — OR shows the state name and asks them
  to pick the correct **flag/picture**. Mix both directions to keep it fresh.
- Provide a **picture** with the question wherever possible (flag, dish, landmark).

### Files
```
public/views/quiz.html
public/css/quiz.css
public/js/pages/quizPage.js
```

### Build instructions for Claude Code

**Card grid**
1. Show one card per explored state (locked states are not shown).
2. Each card shows the state flag thumbnail + state name + a "Play" badge. Tapping
   a card opens that state's question set.

**Question types (alternate between them)**
- **Type A — flag → name:** show the flag image, ask "Which state has this flag?",
  give 4 state-name options.
- **Type B — name → flag:** show the state name, ask "Which flag belongs to
  [state]?", give 4 flag thumbnails as options.
- **Type C — picture → name:** show a picture of the state's food or landmark, ask
  "Which state is this [dish/landmark] from?", give 4 name options.

Pull the flag/picture references from each state's data. Add a `flag` and
`image` field to `STATE_CONTENT` (filenames in `assets/flags/` and
`assets/content/`), with emoji fallback while images are missing.

**Feedback**
- Correct → green highlight + `SoundManager.play('correct')` + points + mascot
  celebrate.
- Wrong → red highlight, correct option shown in green, `SoundManager.play('wrong')`,
  short explanation.

**Data note** — extend each state object:
```js
johor: {
  // ...existing fields...
  flag: "johor.svg",            // assets/flags/johor.svg
  image: "laksa-johor.png",     // assets/content/laksa-johor.png
  quiz: [
    { type: "flagToName", q: "Which state has this flag?",
      options: ["Johor","Kedah","Melaka","Pahang"], answer: 0 },
    { type: "pictureToName", image: "laksa-johor.png",
      q: "Which state is this Laksa from?",
      options: ["Johor","Penang","Kelantan","Melaka"], answer: 0 },
    { type: "nameToFlag", q: "Which flag belongs to Johor?",
      options: ["johor.svg","kedah.svg","perak.svg","sabah.svg"], answer: 0 }
  ]
}
```

---

## Shared helpers Claude Code should create

`public/js/utils/helpers.js`:
```js
// Fisher–Yates shuffle (used by all three games to randomize)
function shuffle(arr){
  const a = [...arr];
  for(let i=a.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [a[i],a[j]] = [a[j],a[i]];
  }
  return a;
}

// scramble a word's letters (re-shuffle if unchanged)
function scramble(word){
  let s = word;
  while(s === word){ s = shuffle(word.split('')).join(''); }
  return s;
}

// points helpers (swap localStorage for an API call when backend is ready)
function getPoints(){ return parseInt(localStorage.getItem('points')||'0'); }
function addPoints(n){ const p=getPoints()+n; localStorage.setItem('points',p); updatePtsDisplay(p); return p; }
function spendPoints(n){ const p=getPoints(); if(p<n) return false; localStorage.setItem('points',p-n); updatePtsDisplay(p-n); return true; }
```

The `SoundManager` object (already in your prototype) handles all the
correct/wrong/reward sounds — reuse it.

---

## Build order for Claude Code

1. Create `stateContent.js` with Johor fully filled in (copy from your story docs):
   the short `intro`, the `cards`, `scrambleWords`, `matchPairs`, `guessClues`, and
   the new `flag`, `image`, and visual `quiz` fields.
2. Build the **Culture Day framing story** (one-time intro → map). Store a flag so
   it only shows on first entry.
3. Build **word scramble** end-to-end with Johor data. Test it.
4. Build **drag & match**. Test it.
5. Build the **flag/picture quiz** cards. Test it.
6. Wire the **per-state loop**: light intro → cards → scramble → drag & match →
   reward → back to map (follow the revised flow diagram).
7. Build the **Activities tab** (navbar): a menu opening all four games, drawing
   from explored states. Replace the old Quiz navbar tab with this.
8. Build **Guess the State** inside the Activities tab, **locked until 3 states are
   explored**, pulling a random target from explored states. Test the gate.
9. Add the remaining states' content to `stateContent.js`.
10. Refine visuals, animations, and sounds.

Each game is independent, so build and test one at a time before moving on.
