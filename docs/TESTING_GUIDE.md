# LokaLearn — Testing Guide

This guide tells you what to test before your demo and UAT, with specific
**animation** and **audio** checkpoints (the two things your teacher interview said
were most important for young children). Work through it screen by screen.

---

## How to use this

For each test, note: ✅ pass / ❌ fail / ⚠️ partial. Anything failing goes on your
bug list. Run the whole guide once on a laptop (Chrome) and once on a tablet, since
that is how teachers will actually use it.

---

## 1. Flow & navigation tests

| # | Test | Expected |
|---|---|---|
| 1.1 | Tap a state on the map | Goes to that state's story narrative |
| 1.2 | Story → content cards | "Next" leads to the cards |
| 1.3 | Cards → word scramble | "I'm ready" leads to scramble |
| 1.4 | Scramble → drag & match | Completing scramble leads to match |
| 1.5 | Match → guess the state | Completing match leads to guess |
| 1.6 | Guess → reward | Correct guess OR all clues used leads to reward |
| 1.7 | Reward → quiz tab | Buttons lead to quiz / map correctly |
| 1.8 | Back buttons | Every back arrow returns to the right screen |
| 1.9 | Locked states | East Malaysia states cannot be opened until unlocked |

---

## 2. Mini-game logic tests

**Word scramble**
- 2.1 Letters can be entered by **tapping tiles**.
- 2.2 Letters can also be entered by **typing on the keyboard**.
- 2.3 Correct word → success feedback + points added.
- 2.4 Wrong word → retry allowed, slots clear, no crash.
- 2.5 Hint button subtracts points and reveals a hint.
- 2.6 Hint blocked when points are too low (friendly message).
- 2.7 The scrambled word is **different each time** you play (randomized).

**Drag & match**
- 2.8 A chip can be placed in a zone (drag and/or tap).
- 2.9 Correct match → zone turns green, chip locks.
- 2.10 Wrong match → chip deselects, error sound, retry.
- 2.11 All four correct → advances to next game.
- 2.12 Chip/zone positions vary between plays.

**Guess the state**
- 2.13 Clue 1 shows first; further clues reveal in order.
- 2.14 4th clue requires the hint button and costs points.
- 2.15 Earlier correct guess = more points (20 / 15 / 10 / 5).
- 2.16 All clues exhausted → still advances to reward (child never stuck).

---

## 3. ANIMATION checkpoints

Animation is what makes the game feel alive for children. Test each one actually
plays, is smooth, and is not too slow.

| # | Where | What to check |
|---|---|---|
| 3.1 | Mascot (all screens) | Gentle idle float loop plays continuously |
| 3.2 | Mascot entrance | Bounces in when a screen opens |
| 3.3 | Story text | Typewriter effect reveals text; tap skips to full text |
| 3.4 | Content card | "Did you know?" expands smoothly when tapped |
| 3.5 | Correct answer | Mascot celebrate animation + green flash on the answer |
| 3.6 | Wrong answer | Shake animation on the wrong item |
| 3.7 | Reward screen | Confetti falls; stamp drops in with a bounce (stamp-land) |
| 3.8 | Points badge | Updates visibly (and ideally a small pulse) when points change |
| 3.9 | Buttons | Press/active state is visible on tap |
| 3.10 | Speed | No animation feels sluggish (entrances < 0.6s); idle loops calm (~3s) |
| 3.11 | Reduced motion | With OS "reduce motion" on, animations are disabled and nothing breaks |

**How to test 3.11:** in Chrome DevTools → Rendering tab → "Emulate
prefers-reduced-motion" → reduce. The game should still work, just without motion.

---

## 4. AUDIO checkpoints

Audio (voiceover + sound effects) was rated essential for Grade 1–2 non-readers.
Test with the sound files in place (`assets/sfx/`).

| # | Event | What to check |
|---|---|---|
| 4.1 | Correct answer (any game) | A positive "correct" sound plays |
| 4.2 | Wrong answer (any game) | A gentle "wrong" sound plays |
| 4.3 | Reward screen | Reward + stamp sounds play |
| 4.4 | Button tap (where wired) | A soft tap sound plays |
| 4.5 | Story narration (voiceover) | Maya's story can be heard read aloud |
| 4.6 | Card narration | Tapping a card can play its text aloud (for non-readers) |
| 4.7 | Sound toggle ON/OFF | The Settings "Sound Effects" toggle truly mutes/unmutes |
| 4.8 | Voiceover toggle | Narration can be turned off separately |
| 4.9 | Default state | Audio is **off by default** (important for a shared classroom) |
| 4.10 | Missing file | If a sound file is absent, the game still runs silently (no error) |
| 4.11 | No overlap chaos | Rapid correct answers don't stack into garbled noise |

**Note on voiceover:** if you use pre-recorded MP3s, test they load and match the
text. If you use the browser's built-in speech (Web Speech API) as a fallback, test
it speaks clearly on the demo device.

---

## 5. Child-usability checks (quick pass)

| # | Check |
|---|---|
| 5.1 | All tappable things are big enough for small fingers (≥44px; tiles ≥56px) |
| 5.2 | Text is short and simple (no long sentences) |
| 5.3 | Wrong answers feel encouraging, never scolding |
| 5.4 | Colours have enough contrast to read easily |
| 5.5 | A child is never stuck with no clear next step |
| 5.6 | No external links or ads anywhere in the child UI |

---

## 6. Technical / robustness

| # | Check |
|---|---|
| 6.1 | No red errors in the browser console on any screen |
| 6.2 | Map screen loads in under ~3 seconds |
| 6.3 | Works on a tablet screen size (test ~768px and ~390px) |
| 6.4 | No horizontal scrolling at any size |
| 6.5 | Points/progress persist correctly between screens |
| 6.6 | Refreshing the page doesn't crash the app |

---

## 7. UAT (User Acceptance Testing) with real users

When you test with children and a teacher, record for each participant:
- Could they complete a full state loop **without help**?
- Which screen, if any, confused them?
- Did the animation and sound keep them engaged?
- Did they understand the cultural content (ask one simple recall question)?
- Overall enjoyment (simple smiley scale for children).

Aim for **5–8 participants**. Patterns across them are your findings for the report.
Remember to get ethics approval and parental consent before testing with minors.

---

## Suggested test record table (paste into your report)

| Test ID | Description | Expected | Result | Notes |
|---|---|---|---|---|
| 1.1 | Tap state opens story | Story opens | | |
| 2.3 | Scramble correct answer | Points added | | |
| 3.7 | Reward stamp animation | Stamp drops in | | |
| 4.7 | Sound toggle mutes | Sound stops | | |
| ... | | | | |
