# Cultural Explorer — End-to-End Testing Checklist

> **Mode: backend-wired.** Auth, progress, points, stamps and costumes are now
> persisted by the **Express + Supabase (PostgreSQL)** backend, with localStorage
> as a per-account cache for offline/guest play. Cross-device restore works for
> registered accounts. Guests play locally only.

## How to run

```powershell
npm install      # first time only
# Copy .env.example → .env and set DATABASE_URL (Supabase pooler URI)
npm run seed     # once, to populate states/cards/quiz/costumes
npm run dev      # http://localhost:3000  (live reload)
npm test         # Jest + Supertest backend suites (needs DATABASE_URL)
```

Open `http://localhost:3000` → `index.html` routes you: a saved session goes to
the **authenticated Home** (`dashboard.html`), otherwise to the **landing**
(`home.html`).

**Reset test data:** there is no in-app reset button yet. In the browser console
run `localStorage.clear()` (clears the local cache for all accounts on this
machine). `Storage.reset()` exists in code but is not wired to any UI.

---

## Architecture under test (read first)

- **Entry:** `index.html` → session-aware redirect (Home if logged in, else landing).
- **Landing (public):** `home.html` — brand, mascots, **START GAME** → `login.html`.
- **Auth screens:** `login.html` (grade-based login + teacher + guest), `signup.html`
  (grade → name → password/auto → 2 secret icons → avatar), `recover.html`
  (name + grade + 2 icons → reveal/reset password).
- **Authenticated Home:** `dashboard.html` — mascot greeting, avatar, summary,
  big **Continue Adventure** button.
- **Per-account storage:** localStorage game data is namespaced per account, so a
  different student on a shared machine never sees the previous child's progress.
- **Backend sync:** on login, progress/points/stamps/costumes hydrate from the
  server; completing a state and earning points/costumes push back to the server.
- **Errors:** surfaced as friendly **popups** (not inline red text or blank pages).

---

## 1. Authentication & Session

| # | Test case | Steps | Expected | P/F |
|---|---|---|---|---|
| A1 | Sign up (Grade 3+) | Landing → START GAME → Create Account → grade 3–4 → name → password → pick 2 icons → submit | Success step → pick avatar → enters Home | ☐ |
| A2 | Sign up (Grade 1–2 auto-password) | Same, choose grade 1–2 (no password field) | Success step shows the **auto-generated password** to write down | ☐ |
| A3 | Name validation | Use digits/symbols in name | Popup: "Name must be letters only (max 20)" | ☐ |
| A4 | Icon rule | Pick same icon twice / only one | Blocked with popup; order badges (1,2) show on picks | ☐ |
| A5 | Login (correct) | Landing → Login → name + grade + password | Enters Home; progress restored | ☐ |
| A6 | Login (wrong) | Wrong password | **Popup** error; no navigation | ☐ |
| A7 | Recover (Grade 1–2) | Recover → name + grade + 2 icons (right order) | Password revealed on screen | ☐ |
| A8 | Recover (Grade 3+) | name + grade + 2 icons + new password | "Password updated" → back to login | ☐ |
| A9 | Wrong icons | Recover with wrong icons | Popup "Those icons don't match" | ☐ |
| A10 | Guest mode | Login → Play as Guest | Enters Home as `Explorer####`; local-only progress | ☐ |
| A11 | Teacher login | Login → Teacher Login → email + password | Enters `teacher.html` (or popup on bad creds) | ☐ |
| A12 | Logout | Settings → Log Out → confirm popup | Session cleared; returns to landing | ☐ |

## 2. Session Persistence & Per-Account Isolation

| # | Test case | Expected | P/F |
|---|---|---|---|
| S1 | Reload while logged in | Stays logged in; lands on Home | ☐ |
| S2 | Reopen tab | `index.html` routes returning user to Home | ☐ |
| S3 | **Same-browser restore** | Logout → log back in as same account → stamps/points/best restored | ☐ |
| S4 | **No cross-account leak** | Logout A → log in as B on the same machine → B sees their own (empty/own) data, NOT A's | ☐ |
| S5 | **Cross-device restore** | Earn a stamp + points on device 1 → log in on device 2 → stamp + points present | ☐ |
| S6 | Deep-link guard | Visit `map.html` while logged out → redirected to landing | ☐ |

## 3. Navigation

| # | Test case | Expected | P/F |
|---|---|---|---|
| N1 | Bottom navbar | Home / Map / Stamps / Quiz / Me switch pages | ☐ |
| N2 | **"Home" tab** | Goes to the authenticated Home (`dashboard.html`), NOT the public landing | ☐ |
| N3 | Continue Adventure | Home button resumes at recommended next state (or map) | ☐ |
| N4 | Back buttons | Topbar `‹` returns to the correct previous screen | ☐ |
| N5 | State param | `narrative.html?state=penang` loads Penang | ☐ |
| N6 | Invalid state | `quiz.html?state=xyz` → **popup** "State not found" → back to map | ☐ |

## 4. Gameplay flow (per state)

| # | Test case | Expected | P/F |
|---|---|---|---|
| G1 | Story → Discover | Narrative Story tab → cards carousel (swipe/arrows) | ☐ |
| G2 | Play the games | Cards → 🎮 Play → Word Scramble → Drag-Match → Guess My State → Quiz | ☐ |
| G3 | Word Scramble | Tap letters into slots; correct → +10, next word | ☐ |
| G4 | Quiz scoring | Correct → +10 + explanation; wrong → correct shown + gentle line | ☐ |
| G5 | Quiz → reward | ≥50% → reward screen with confetti + stamp earned | ☐ |
| G6 | East-Malaysia gate | Complete 5 West states → Sabah & Sarawak unlock | ☐ |

## 5. Rewards, Stamps & Costumes

| # | Test case | Expected | P/F |
|---|---|---|---|
| R1 | Stamp book (has stamps) | Real earned/locked stamps, correct count + progress bar | ☐ |
| R2 | **Stamp book (empty)** | No stamps → friendly empty card + **Explore the Map** button | ☐ |
| R3 | Locked stamp tap | Jumps into that state's story (never a dead end) | ☐ |
| R4 | Costume unlock | Avatar Shop → Unlock (enough points) → spends points, equips, toast | ☐ |
| R5 | Costume not affordable | Unlock without points → popup/toast "Need X pts" | ☐ |
| R6 | **Costume cross-device** | Unlock on device 1 → log in device 2 → costume owned + equipped, points correct | ☐ |
| R7 | Avatar overlay | Equipped costume shows on avatar in topbar + Home + settings | ☐ |

## 6. Error Handling & Empty States

| # | Test case | Expected | P/F |
|---|---|---|---|
| E1 | Server down on login | **Popup**: "Could not reach the server…" — app not stuck | ☐ |
| E2 | Invalid route/state | Popup + redirect to map (no blank/broken page) | ☐ |
| E3 | Empty stamp book | Helpful message + CTA (see R2) | ☐ |
| E4 | Home with no stamps | "My Stamps" shows a nudge to Continue, not a wall of grey | ☐ |
| E5 | Missing images | Emoji/placeholder fallback — no broken-image icons | ☐ |
| E6 | Double-answer guard | Rapidly tap two quiz options → only first counts | ☐ |

## 7. UI / Responsive

| # | Viewport / case | Expected | P/F |
|---|---|---|---|
| U1 | Mobile (375px) | Single column, tap targets ≥44px, no horizontal scroll | ☐ |
| U2 | Tablet (768px) | Comfortable spacing | ☐ |
| U3 | Desktop/projector (1280px+) | Centered container | ☐ |
| U4 | Real data in chrome | Topbars show real points + avatar everywhere (incl. Settings) | ☐ |
| U5 | Popups | Centered, dismiss on backdrop/Esc, child-sized buttons | ☐ |

## 8. Backend automated tests (Jest + Supertest)

`npm test` — requires `DATABASE_URL`. Suites live in **`tests/`** (not `src/tests/`):

| Suite | Covers |
|---|---|
| `fr1-states` | Map states + East-Malaysia gate |
| `fr2-content` | Cultural content cards + dialogue |
| `fr3-quiz`, `fr3-minigames` | MCQ delivery/scoring + mini-game data contract |
| `fr4-mascot` | Mascot/dialogue contract |
| `fr5-rewards` | Stamp + completion bonus (idempotent) |
| `fr6-costumes` | Costume catalogue, unlock/equip |
| `fr7-auth` | Register/login/recover, session, teacher login |
| `backend` | Smoke |

> **Not yet automated (manual for now):** the frontend flows in §1–§7 (session
> persistence, per-account isolation, cross-device restore, navigation, popups,
> empty states). These are vanilla-MPA UI paths with no DOM test harness.

## 9. User Acceptance Testing (UAT)

> Run with primary students (7–12) after ethics approval. Pass = task completed
> without adult help unless noted.

| # | Scenario | Success criterion | P/F |
|---|---|---|---|
| T1 | "Start playing on your own" | Reaches the map within ~1 minute | ☐ |
| T2 | "Learn about a state" | Reads/listens to a card, recalls one fact | ☐ |
| T3 | "Answer the quiz" | Completes a 4-question quiz | ☐ |
| T4 | "Show me your stamps" | Navigates to the Stamp Book | ☐ |
| T5 | Engagement | Voluntarily explores a 2nd state | ☐ |

---

## Known gaps (tracked)

- **Quiz +10 points** are awarded locally then mirrored to the server via
  `POST /api/progress/points`; the server's `/api/quiz/validate` (DB-question
  based) is not used by the local quiz.
- **Art assets** missing — emoji/placeholder fallbacks throughout (see `assets/ASSETS.md`).
- **Teacher dashboard** — login works; class roster routes not mounted yet.
- **MOE login** — deferred (returns 501).
- **Voiceover (FR9)** — pending.
- **In-app "Reset Progress"** button — not built; use `localStorage.clear()`.
