# Asset Manifest — drop-in art slots

Every art placeholder in the app is (or will be) a named **image slot** with an
emoji fallback. To add real art: **export a PNG, save it at the exact path below,
done** — the image auto-replaces the emoji on next load. No code changes needed.

- Slots use `js/utils/assetImg.js` + the `.img-slot` styles in `css/style.css`.
- The emoji keeps showing until the file exists, so the app always looks complete.
- Transparent PNG recommended; suggested sizes are guidance, not hard limits.

**Status:** ✅ slot wired (drop the file in and it appears) · 🔜 still emoji, slot not wired yet

---

## Mascots — `assets/characters/`

Rimau (tiger cub) is the single guide across the app, in three poses. The data
layer (`js/data/mascots.js`) maps logical poses → files; screens pick a pose
(`renderMascot`/`setMascotPose`). Quiz/map/narrative/reward switch poses with the
game state (correct → happy, pass/celebrate → cheer).

| File | Pose | Used on | Fallback | Status |
|---|---|---|---|---|
| `rimau_idle.png`  | idle (calm stand)        | narrative cards, quiz (default/wrong), home modal | 🐯 | ✅ |
| `rimau_happy.png` | happy (arms up)          | home hero, map greeting, quiz (correct answer)    | 🐯 | ✅ |
| `rimau_cheer.png` | cheer (fist-pump + flag) | reward corner, quiz pass screen, map (all West done) | 🐯 | ✅ |
| `wak-mascot.png`  | — (legacy, unused)       | none — superseded by Rimau-only mascot            | 🦜 | ⚠️ removable |

## Costumes — `assets/costumes/`  (avatar shop)

| File | Costume | Fallback | Suggested size | Status |
|---|---|---|---|---|
| `baju-melayu.png` | Baju Melayu (Malay) | 👔 | 256×256 | ✅ |
| `cheongsam.png` | Cheongsam (Chinese) | 👗 | 256×256 | ✅ |
| `kadazan-dress.png` | Kadazan Dress (Sabah) | 👘 | 256×256 | ✅ |
| `sari.png` | Sari (Indian) | 🥻 | 256×256 | ✅ |
| `iban-warrior.png` | Iban Warrior (Sarawak) | 🪶 | 256×256 | ✅ |
| `sarawak-dress.png` | Sarawak Dress | 🌺 | 256×256 | ✅ |

## Cultural card illustrations — `assets/images/cards/<stateId>/<cardId>.png`

The narrative postcards auto-load these and fall back to the card's `icon` emoji.
One folder per state; one PNG per card (ids from `js/data/states.js`, e.g.
`assets/images/cards/penang/penang-1.png`). Suggested 600×400. ✅ wired

## Stamp art — `assets/images/stamps/<stateId>.png`

The reward screen auto-loads this over the state flag (✅ wired). The stamp book
currently shows the flag image; tell me to add the dedicated-stamp slot there too.

## State flags — `assets/flags/`  (already `<img>` via `js/data/states.js`)

Present: `penang-flag.png`, `melaka-flag.png`, `selangor-flag.png`, `johor-flag.png`,
`kelantan-flag.png`, `sabah-flag.png`, `sarawak-flag.png` (+ kedah/perak/perlis). ✅

## Backgrounds — `assets/images/ui/`

| File | Screen | Status |
|---|---|---|
| `home-backgrounds.png` | home stage background | ✅ (present) |
| `map-background.png` | map screen | ✅ (present) |
| `setting_background.png` | settings screen | ✅ (present) |

---

## Intentionally kept as emoji (not image slots)

- **Drag-&-Match chips** (`js/data/states.js` `dragPairs`) — small inline chips that mix
  food/landmark/festival as a combined `"🍜 Char Kway Teow"` label, not illustration
  slots. Left as emoji labels by design.
- **UI affordances** — nav icons, ⭐ points, ⚙️ settings, etc. stay as emoji/icons.

## 🔜 Optional, not yet wired (say the word)

- **Dedicated stamp art in the stamp book** (reward screen already wired) →
  `assets/images/stamps/<stateId>.png` over the flag image.
