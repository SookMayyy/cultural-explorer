# Cultural Explorer — End-to-End Testing Checklist

> Branch: `testing/full-game-integration`
> Mode: **localStorage-first** (no MySQL required to play). The Express/MySQL
> backend exists but is not yet wired to the frontend (future work — CP3).
> Restore point if anything breaks: branch `feature/map-redesign` (commit `7b86582`).

## How to run

```powershell
npm install      # first time only
npm run dev      # http://localhost:3000  (live reload)
```

Open `http://localhost:3000` → it serves `src/views/home.html`.
To reset all test data: open Settings → Reset Progress, or run
`localStorage.clear()` in the browser console.

---

## 1. Functional Testing

| # | Test case | Steps | Expected result | Pass/Fail |
|---|---|---|---|---|
| F1 | Register new player | Home → Start Exploring → Register tab → fill nickname/username/password → submit | Avatar picker opens; account saved to localStorage | ☐ |
| F2 | Pick avatar persists | After F1, choose an avatar → confirm | Lands on map; chosen avatar shows in topbar **and** dashboard | ☐ |
| F3 | Login existing player | Logout → Start Exploring → Login tab → correct credentials | Enters game (or avatar picker if none chosen) | ☐ |
| F4 | Wrong password | Login with wrong password | Inline error "Wrong username or password"; no navigation | ☐ |
| F5 | Guest mode | Start Exploring → Play as Guest | Enters map as `Explorer####`; progress still saved locally | ☐ |
| F6 | Open a state | Map → click an unlocked state (map or list) | Popup shows name, tagline, **flag image** (not raw `<img>` text) | ☐ |
| F7 | Explore content | Popup → Explore → switch Story / Cards / Dialect tabs | Each tab renders; mascot typewriter animates | ☐ |
| F8 | Card navigation | Cards tab → next/prev arrows and swipe | Card index changes; counter + dots update | ☐ |
| F9 | Take quiz | Narrative → Start Quiz | 4 questions load; selecting an option locks it | ☐ |
| F10 | Correct answer scoring | Answer correctly | +10 pts, green highlight, explanation shown | ☐ |
| F11 | Wrong answer feedback | Answer incorrectly | Correct option highlighted; encouraging mascot line | ☐ |
| F12 | Quiz → reward | Finish quiz with ≥50% | Reward screen: score, confetti, **stamp earned**, points total | ☐ |
| F13 | Stamp recorded | After F12 → Stamps page | That state shows as earned (gold/checked) | ☐ |
| F14 | East-Malaysia gate | Complete all 5 West states' quizzes | Sabah & Sarawak become unlocked on the map | ☐ |
| F15 | Dashboard accuracy | Open Progress | States explored, stamps, points, per-state % all correct | ☐ |
| F16 | Logout | Dashboard → Logout → confirm | Returns to home; session cleared; progress retained | ☐ |

## 2. UI Testing

| # | Test case | Expected result | Pass/Fail |
|---|---|---|---|
| U1 | Mascot dialogue | Rimau & Wak type greetings on home; clicking shows new line | ☐ |
| U2 | Flag images render | Map popup, narrative hero, reward stamp show flag PNG, not text | ☐ |
| U3 | Avatar consistency | Same avatar emoji in topbar, dashboard hero, login preview | ☐ |
| U4 | Locked-state styling | Locked states appear greyed with 🔒 and are not clickable | ☐ |
| U5 | Progress bars | Quiz progress fill and dashboard per-state bars animate to correct % | ☐ |
| U6 | Confetti/stamp animation | Reward screen plays stamp + confetti on pass | ☐ |
| U7 | No broken layout | No overlapping text or off-screen elements on any screen | ☐ |

## 3. Navigation Testing

| # | Test case | Expected result | Pass/Fail |
|---|---|---|---|
| N1 | Bottom navbar | Map / Stamps / Progress switch pages, active tab highlighted | ☐ |
| N2 | Back buttons | Topbar `‹` returns to the correct previous screen | ☐ |
| N3 | Deep link guard | Visiting `map.html` while logged out redirects to home | ☐ |
| N4 | State param | `narrative.html?state=penang` loads Penang directly | ☐ |
| N5 | Invalid state | `narrative.html?state=xyz` shows "State not found" + map link | ☐ |
| N6 | Reward → next | "Next" recommends an unexplored unlocked state | ☐ |

## 4. Progress-Saving Testing

| # | Test case | Expected result | Pass/Fail |
|---|---|---|---|
| P1 | Persist across reload | Earn a stamp, refresh browser | Stamp/points still present | ☐ |
| P2 | Persist across session | Close tab, reopen `localhost:3000` | Logged-in player resumes; "Continue Exploring" shows | ☐ |
| P3 | Per-tab completion | Visit Story only, check dashboard | That state shows partial % (not 100%) | ☐ |
| P4 | Best score | Score high, then low on retake | Best score does not decrease | ☐ |
| P5 | Reset progress | Settings → Reset | All stamps/points/progress cleared after confirm | ☐ |

## 5. Error-Handling Testing

| # | Test case | Expected result | Pass/Fail |
|---|---|---|---|
| E1 | Empty register fields | Submit blank form | "Please fill in all fields" error, no crash | ☐ |
| E2 | Short password | Password < 4 chars | Validation error shown | ☐ |
| E3 | Duplicate username | Register same username twice | "Username already taken" error | ☐ |
| E4 | Missing images | Card/hero image not found | Falls back to emoji/placeholder, no broken-image icon flood | ☐ |
| E5 | Double-answer guard | Rapidly tap two quiz options | Only first answer counts | ☐ |

## 6. Responsive Testing

| # | Viewport | Expected result | Pass/Fail |
|---|---|---|---|
| R1 | Mobile (375px) | Single-column, tap targets ≥44px, no horizontal scroll | ☐ |
| R2 | Tablet (768px) | Comfortable spacing, stamp grid 3-col | ☐ |
| R3 | Desktop/projector (1280px+) | Centered app container, stamp grid 4-col | ☐ |
| R4 | Landscape phone | Modals and map remain usable | ☐ |

## 7. User Acceptance Testing (UAT)

> Run with the target audience (primary students 7–12) after ethics approval.
> Pass criterion: task completed without adult help unless noted.

| # | Scenario | Success criterion | Pass/Fail |
|---|---|---|---|
| A1 | "Start playing on your own" | Child reaches the map within 1 minute | ☐ |
| A2 | "Learn something about a state" | Child reads/listens to a card and recalls one fact | ☐ |
| A3 | "Answer the quiz" | Child completes a 4-question quiz | ☐ |
| A4 | "Show me your stamps" | Child navigates to the Stamp Book | ☐ |
| A5 | Engagement | Child voluntarily explores a 2nd state | ☐ |

---

## Known gaps (tracked for follow-up)

- **Settings page** — wired in Phase 2 (mute toggle, reset, prefs).
- **Guess the State** — built (`guess.html`) but being linked into the flow (Phase 2).
- **Drag-Match** — component exists; needs `dragPairs` data + wiring (Phase 3).
- **Teacher dashboard** — demo-only; backend route not wired (Phase 3).
- **Backend API + MySQL** — not connected to the frontend yet (Phase 4 / CP3).
