# Cultural Explorer — Developer & Testing Guide

> Practical reference for running, seeding, and testing the project.
> For the **authoritative spec** (features, schema rationale, security rules) see
> [`docs/CLAUDE.md`](./CLAUDE.md). This guide is the *how-to-operate-it* companion.

Last verified (2026-06-21): **105/105 tests passing** across 9 suites (8 hit Supabase;
the FR3 mini-games suite is pure data):
- `tests/fr1-states.test.js` (FR1 map/states, 7) — incl. the 4-vs-5 East-unlock boundary
- `tests/fr2-content.test.js` (FR2 cultural content, 14) — incl. all-7-state coverage
- `tests/fr3-quiz.test.js` (FR3 MCQ delivery + scoring, 11) — incl. the guest scoring path
- `tests/fr3-minigames.test.js` (FR3 mini-game content contract, 10) — MCQ bank, Drag-Match, Guess-the-State
- `tests/fr4-mascot.test.js` (FR4 mascot selection + dialogue set, 8)
- `tests/fr5-rewards.test.js` (FR5 stamps + points, 5)
- `tests/fr6-costumes.test.js` (FR6 costume catalogue/unlock/equip, 9)
- `tests/fr7-auth.test.js` (FR7 login, auto-password, recovery, session, teacher, 14)
- `tests/backend.test.js` (FR1–FR6 smoke, 18)

Rate limiters are disabled under `NODE_ENV=test` so the auth suite's many calls don't trip
the 10/min · 20/hr windows (see `middleware/rateLimiter.js`).

---

## 1. Quick start

```powershell
# 1. Install dependencies
npm install

# 2. Configure environment (one-time)
copy .env.example .env       # then edit .env with your real values

# 3. Set up the database (one-time, in Supabase SQL Editor)
#    Paste db/schema.postgres.sql → Run

# 4. Seed content (states, cards, dialogue, quiz questions)
npm run seed

# 5. Run the app
npm run dev                  # http://localhost:3000  (auto-reload)

# 6. Run the backend tests
npm test
```

---

## 2. Commands

| Command | What it does |
|---|---|
| `npm run dev` | Start Express with **nodemon** (auto-restart on file change) → http://localhost:3000 |
| `npm start` | Start Express with plain `node` (production-style) |
| `npm run seed` | Run `scripts/seed-content.mjs` — ports the frontend `js/data/` content into the DB (states, cultural cards, dialogue, quiz). **Idempotent**; safe to re-run. Never touches user data. |
| `npm test` | Run the Jest + Supertest suite in `tests/` (`--runInBand`, serial). Hits the **live** Supabase DB with a throwaway user that is cleaned up afterward. |
| `node scripts/<file>` | Run a one-off script directly. |

> **GitHub CLI** is installed at `C:\Program Files\GitHub CLI\gh.exe` and must be
> called with its full path in PowerShell (or refresh PATH first).

### Environment variables (`.env`)

| Key | Purpose |
|---|---|
| `DATABASE_URL` | Supabase **Session pooler** Postgres URI. Required. |
| `PORT` | Express port (default `3000`). |
| `NODE_ENV` | `development` / `production`. Jest sets it to `test` automatically — this skips the port bind in `server.js`. |
| `SESSION_SECRET` | Long random string for `express-session`. |

`.env` is git-ignored. `.env.example` is the committed template.

---

## 3. Folder & file map

```
cultural-explorer/
├── server.js              # Express entry. Mounts /api routes, static files,
│                          #   session, error handler. Does NOT bind a port under test.
├── package.json           # scripts + deps + Jest config
├── .env / .env.example    # secrets (DATABASE_URL, SESSION_SECRET, …)
│
├── routes/                # API route handlers (one file per domain)
│   ├── auth.js            #   /api/auth/*   register, login, recover, teacher, logout, me
│   ├── states.js          #   /api/states   list + single state (cards + dialogue)
│   ├── quiz.js            #   /api/quiz     fetch questions + validate answer
│   └── progress.js        #   /api/progress progress, completion, AND costume shop
│
├── middleware/
│   ├── auth.js            # requireLogin, requireTeacher (session guards)
│   └── rateLimiter.js     # loginLimiter (10/min), registerLimiter (20/hr)
│
├── db/
│   ├── connection.js      # pg Pool + mysql2-compatible execute() ('?' → '$n', returns [rows])
│   ├── schema.postgres.sql# ACTIVE schema for Supabase/Postgres (run this one)
│   └── schema.sql         # legacy MySQL schema (kept for history; not used)
│
├── scripts/
│   └── seed-content.mjs   # Ports public/js/data/* into the DB content tables
│   └── .gen/              # (git-ignored) temp ESM twins the seed creates — auto-managed
│
├── tests/
│   ├── fr1-states.test.js # FR1 — map/states + unlock logic (standalone, thorough)
│   ├── fr2-content.test.js# FR2 — cultural content cards + story + dialogue (standalone)
│   ├── fr3-quiz.test.js   # FR3 — MCQ quiz delivery + answer validation/scoring (API)
│   ├── fr3-minigames.test.js# FR3 — mini-game content contract: MCQ bank + Drag-Match +
│   │                        #        Guess-the-State (pure data, no DB)
│   ├── fr4-mascot.test.js  # FR4 — mascot selection by region + per-state dialogue set
│   ├── fr5-rewards.test.js # FR5 — stamps + points (quiz +10, completion +20)
│   ├── fr6-costumes.test.js# FR6 — costume catalogue, unlock (spend), equip/preview
│   ├── fr7-auth.test.js    # FR7 — login, auto-password lifecycle, icon recovery, session
│   └── backend.test.js    # FR1–FR6 integration smoke tests (Jest + Supertest)
│
├── public/                # Frontend — served statically by Express (MPA, no bundler)
│   ├── views/             #   one .html per screen (home, map, quiz, …)
│   ├── js/
│   │   ├── <screen>.js    #   page logic, one ES module per view
│   │   ├── ui.js          #   shared topbar/navbar/auth/toast helpers
│   │   ├── data/          #   ★ frontend content SOURCE OF TRUTH (states, quizzes,
│   │   │                  #     guessRounds, avatars). The seed reads from here.
│   │   ├── components/    #   DragMatch, QuizWidget, mascot, typewriter
│   │   └── utils/storage.js#  localStorage wrapper (guest/offline mode)
│   ├── css/               #   one stylesheet per screen + global style.css
│   └── assets/            #   images/audio (mostly empty — exported from Figma later)
│
└── docs/
    ├── CLAUDE.md          # authoritative spec (read first each session)
    └── DEVELOPER_GUIDE.md # this file
```

### The data-flow you must understand

- The **frontend renders from `public/js/data/`** ES modules directly (offline-capable).
- The **backend serves the same content from the DB**, but those tables are **empty
  until `npm run seed` runs**. The seed copies `js/data/` → DB so both layers agree.
- ⇒ **If you edit content in `js/data/`, re-run `npm run seed`** to keep the DB in sync.
- State IDs: frontend uses string ids (`penang`), DB uses integers. The seed maps them:
  `1 Penang · 2 Melaka · 3 Selangor · 4 Johor · 5 Kelantan · 6 Sabah · 7 Sarawak`.

---

## 4. Database

- **Engine:** PostgreSQL on Supabase (the project migrated off MySQL; `mysql2` is still
  a dependency only because `connection.js` mimics its `execute()` signature).
- **Apply schema:** Supabase dashboard → SQL Editor → paste `db/schema.postgres.sql` → Run.
  It creates all tables and seeds `states` + `costumes`.
- **Seed content:** `npm run seed` fills `cultural_content`, `state_dialogue`,
  `quiz_questions` (the schema does **not** seed these).
- **Prepared statements only** — every query uses `?` placeholders via `pool.execute`.
  Never string-concatenate SQL.

### Tables at a glance

| Table | Holds | Seeded by |
|---|---|---|
| `users` | all account types + points + equipped costume | app (registration) |
| `states` | 7 states, region, mascot, flag, **story**, unlock rules | `schema.postgres.sql` (+ `story` filled by `npm run seed`) |
| `cultural_content` | content cards (food/landmark/tradition/dialect/costume) | `npm run seed` |
| `state_dialogue` | mascot lines per state | `npm run seed` |
| `quiz_questions` | MCQ bank per state | `npm run seed` |
| `user_progress` | per-user per-state completion + stamp + score | app (gameplay) |
| `costumes` | costume catalogue + point cost | `schema.postgres.sql` |
| `user_costumes` | which costumes a user unlocked | app (shop) |
| `classes` / `class_members` | teacher dashboard grouping (not wired yet) | — |

---

## 5. API reference (ACTUAL implemented paths)

> ⚠️ Some paths differ from `docs/CLAUDE.md §6`. These are the **real** ones the
> frontend must call.

### Auth — `routes/auth.js`
| Method | Path | Notes |
|---|---|---|
| POST | `/api/auth/register` | Grade account. Returns `auto_password` for Grade 1–2. Opens session. |
| POST | `/api/auth/login` | Grade login. Grade 1–2 first-login hashes pw + clears `auto_password`. |
| POST | `/api/auth/moe-login` | **501 — deferred to CP3.** |
| POST | `/api/auth/recover` | Icon verify → Grade 1–2 reveals pw, Grade 3+ sets new pw. |
| POST | `/api/auth/teacher-login` | bcrypt verify. |
| POST | `/api/auth/logout` | Destroys session. |
| GET | `/api/auth/me` | Current session user (401 if none). |

### States — `routes/states.js`
| Method | Path | Notes |
|---|---|---|
| GET | `/api/states` | All states + `is_completed`/`is_locked` for current user (guest = only first unlocked). |
| GET | `/api/states/:id` | One state (incl. `story`) + `cultural_content[]` + `state_dialogue`. 404 if unknown. |

### Quiz — `routes/quiz.js`
| Method | Path | Notes |
|---|---|---|
| GET | `/api/quiz/state/:id` | Up to 4 random questions for a state. *(spec wrongly says `/api/states/:id/quiz`)* |
| POST | `/api/quiz/validate` | `{ questionId, selectedOption }` → `{ correct, explanation, pointsAwarded }`. +10 on correct (logged-in). |

### Progress & rewards — `routes/progress.js`
| Method | Path | Notes |
|---|---|---|
| GET | `/api/progress` | All progress rows (login required). |
| POST | `/api/progress/:stateId/complete` | `{ quizScore }` → marks complete, stamp, +20 bonus. |
| GET | `/api/progress/costumes` | Catalogue + `is_unlocked`/`is_equipped`. *(spec says `/api/costumes`)* |
| POST | `/api/progress/costumes/:id/unlock` | Spend points. 400 if too poor / already owned, 404 if unknown. |
| POST | `/api/progress/costumes/:id/equip` | Equip owned costume (id 1 always allowed), else 403. |

---

## 6. Testing guide

### How the test harness works
- **Jest + Supertest**, config lives in `package.json` (`testMatch: tests/**/*.test.js`,
  30s timeout, `node` environment).
- Tests **import the Express `app`** from `server.js`. Because Jest sets
  `NODE_ENV=test`, `server.js` does **not** bind the port — Supertest drives the app
  handle directly, so you can test while `npm run dev` is also running.
- Tests run against the **live Supabase DB**. A `request.agent(app)` keeps the session
  cookie across requests so login state persists between assertions.
- A **dedicated throwaway user** (random letters-only name) is created in `beforeAll`
  and **fully deleted in `afterAll`** (`user_costumes` → `user_progress` → `users`).
  Assertions use **point deltas** (before/after) rather than absolute totals, so a
  re-run never goes stale.

### Run them
```powershell
npm test                              # whole suite
npx jest tests/backend.test.js -t "costume"   # filter by test name
```
Expected: **20 passed**. If `cultural_content`/`quiz_questions` are empty, run
`npm run seed` first.

### Add a new test
1. Put it in `tests/<name>.test.js`.
2. `const app = require('../server'); const pool = require('../db/connection');`
3. Use `request.agent(app)` and register/login to get a session.
4. **Always clean up** any rows you create in `afterAll`, and call `pool.pool.end()`.

---

## 7. What to test (FR checklist)

Use this as a regression checklist whenever the backend changes.

### FR1 — Map / states
- [ ] `GET /api/states` returns 7 states.
- [ ] Fresh user: 5 west states unlocked, Sabah + Sarawak **locked**.
- [ ] After completing all 5 west states, Sabah + Sarawak **unlock**.
- [ ] Guest (no session): only the first state is unlocked.
- [ ] `is_completed` flips to true after completion.

### FR2 — Cultural content  (`tests/fr2-content.test.js`)
- [ ] `GET /api/states/:id` returns the state record with `name`, `flag_file`, and a
      non-empty `story` (story is a `states` column, seeded from the frontend).
- [ ] `cultural_content` has ≥4 cards covering `food`, `landmark`, `tradition`, `dialect`.
- [ ] Every card uses an allowed `card_type` and has a non-empty `title` + `body_text`.
- [ ] At least one card carries a `fun_fact`; the `dialect` card encodes the word + meaning.
- [ ] `state_dialogue` is present with non-empty `entry_first`.
- [ ] All 7 states have a story, ≥4 cards (incl. a dialect card), and dialogue.
- [ ] Unknown state id → 404.
- [ ] **Traditional costume** is served via the costume catalogue
      (`GET /api/progress/costumes`), not a per-state card — see the costume note in §8.

### FR3 — Mini-games

**MCQ — API (`tests/fr3-quiz.test.js`)**
- [ ] `GET /api/quiz/state/:id` returns 1–4 questions, each with four non-empty options,
      a valid `correct_opt` (a–d), a `difficulty`, and an `explanation`.
- [ ] Unknown state id → empty set (200, not an error); every seeded state (1–7) has ≥1 question.
- [ ] Correct answer → `correct:true`, `pointsAwarded:10`, user points +10.
- [ ] Wrong answer → `correct:false`, `pointsAwarded:0`, points unchanged.
- [ ] Missing fields → 422; unknown question id → 404.
- [ ] Guest (no session) can validate (200) but is not credited points server-side.

**Mini-game content contract — data (`tests/fr3-minigames.test.js`)**
- [ ] MCQ bank: every question has a valid state, 4 non-empty options, in-range answer,
      explanation; the bank carries >1 difficulty (so "adaptive" can step up); every state
      has ≥1 MCQ.
- [ ] **Drag-Match** (`states.js` `dragPairs`): every state ships 3–4 pairs with non-empty
      chip + drop-zone labels; drop-zone labels within a state are distinct.
- [ ] **Guess-the-State** (`guessRounds.js`): one round per state; each answers a real
      state; clues are progressive with strictly **descending** point values (early correct
      = more points); options include the answer and only valid states (id/name/icon).

> **Two of the three mini-games have no backend.** Drag-Match and Guess-the-State (plus
> adaptive difficulty and spaced-repetition resurfacing) run entirely client-side from
> `public/js/data/`. They're verified as a **content contract** against the source
> modules — the same data the screens render from — not via the API.
>
> ⚠️ **Guess-the-State spec drift:** `docs/CLAUDE.md` §3 says *"4 progressive clues,
> +20/15/10/5"*, but the shipped `GUESS_ROUNDS` data has **3 hints with `pointValues`
> [30,20,10]**. The data suite asserts the *actual* contract (descending values, one per
> clue) and flags the drift; reconcile spec vs. data later. See §8.

### FR4 — Mascot system  (`tests/fr4-mascot.test.js`)
- [ ] Every state's `mascot` matches its region (west → `rimau`, east → `wak`); both appear.
- [ ] Each state ships a complete, non-empty dialogue set (`entry_first`, `entry_return`,
      `entry_locked`, `challenge_frame`, `feedback_correct`, `feedback_wrong`, `reward_outro`).
- [ ] `entry_first` follows the 3-sentence Hook→Bridge→CTA formula and names the right mascot.
- [ ] First-visit and return-visit lines are both present and distinct; gated states (Sabah,
      Sarawak) carry an `entry_locked` line.

> ⚠️ **Backend doesn't track visits yet.** First-vs-return branching is enabled by the data
> (both lines exist) but `user_progress.visits` / `first_visited` are never written — the
> branch is frontend-only for now. See §8.

### FR5 — Progress, stamps, points  (`tests/fr5-rewards.test.js`)
- [ ] Progress empty before any completion.
- [ ] Completion sets `is_completed` + `stamp_earned` + `last_quiz_score` + `completed_at`
      and awards +20.
- [ ] Quiz (+10) and completion (+20) both accrue to `users.points`.
- [ ] Stamp count equals the number of completed states.
- [ ] Re-completing a state updates the same row in place (no duplicate stamp). ⚠️ the +20
      bonus is **not** idempotent on re-completion — see §8.

### FR6 — Costume shop  (`tests/fr6-costumes.test.js`)
- [ ] Catalogue exposes the full 6-costume culturally-themed set with correct costs,
      sorted by ascending cost (free default first).
- [ ] Costume list shows default (id 1) equipped, others locked.
- [ ] Unlock deducts the exact `points_cost` and marks it owned.
- [ ] Re-unlock same costume → 400; unknown costume → 404; too few points → 400 (not charged).
- [ ] Equip owned → 200 and `avatar_costume_id` updates (preview); equip unowned → 403;
      free default always equippable.

### FR7 — Login & session  (`tests/fr7-auth.test.js`)
- [ ] Grade 3+ register opens a session; the session user carries no password hash.
- [ ] Grade 1-2 register returns a memorable auto-password; first login clears it + sets a hash.
- [ ] Wrong password / unknown user → 401; missing fields → 422.
- [ ] Registration validation: letters-only ≤20 name, valid grade, icons 1–12 & distinct,
      Grade 3+ password ≥6 — all → 422.
- [ ] Icon recovery: correct icons reset (Grade 3+) / reveal (Grade 1-2); wrong or
      **swapped-order** icons → 401; unknown account → 404.
- [ ] Session cookie is `HttpOnly` + `SameSite=Strict`; protected routes → 401 without a
      session; logout destroys it.
- [ ] MOE login → 501 (deferred); teacher login: bad email → 422, unknown → 401, valid → 200.

> **Not yet implemented (don't expect these to pass):** MOE login (501),
> teacher dashboard / class routes, `visits`/`first_visited` tracking for
> first-visit vs return mascot dialogue, audio/voiceover (FR9).

---

## 8. Known gaps & discrepancies

- **West-Malaysia unlock is NOT sequential (review after frontend+backend are done).**
  The spec (`docs/CLAUDE.md`, root `CLAUDE.md`) says *"West-Malaysia states unlock
  sequentially,"* but the backend opens **all 5 west states from the start**
  (`is_locked_default = false` for west; only the East gate at 5/5 west-complete is
  enforced) — and the frontend `unlockedStates()` matches that. So "sequential west
  unlock" is documented but not implemented. **Left as-is for now by decision; revisit
  once the frontend and backend are both feature-complete** to either (a) implement true
  sequential unlock or (b) update the spec to "all west open." Tracked in
  `tests/fr1-states.test.js` (current behaviour is asserted, incl. the 4-vs-5 boundary).
- **State-completion bonus is not idempotent (FR5).** `POST /api/progress/:stateId/complete`
  upserts the progress row (so there's never a duplicate stamp), but it adds the **+20 bonus
  every time it's called** — re-completing an already-completed state pays the bonus again.
  `tests/fr5-rewards.test.js` captures this so a fix (award the bonus only on first
  completion) is a deliberate change rather than a silent regression.
- **Mascot first-vs-return branching is frontend-only (FR4).** The data ships both
  `entry_first` and `entry_return`, but nothing writes `user_progress.visits` /
  `first_visited`, so the backend can't tell first visit from return — the screen decides.
  Wire visit tracking when the mascot flow is finalised. Tracked in `tests/fr4-mascot.test.js`.
- **Rate limiters are skipped under `NODE_ENV=test`.** `middleware/rateLimiter.js` short-
  circuits the login (10/min) and register (20/hr) limiters during tests, because the whole
  Jest suite runs in one process (`--runInBand`) and the in-memory windows would otherwise
  accumulate across suites and throw flaky 429s. Limiters stay fully active in dev/prod;
  verify them manually if needed.
- **Guess-the-State: 3 clues in data vs. 4 in the spec.** `docs/CLAUDE.md` §3 describes
  *"4 progressive clues. Early correct = more points (+20/15/10/5)."* The shipped
  `public/js/data/guessRounds.js` ships **3 hints per round with `pointValues` [30,20,10]**.
  `tests/fr3-minigames.test.js` locks in the *actual* contract (descending values, one per
  clue) rather than the spec numbers, and the drift is tracked here for later reconciliation
  (either add a 4th clue per round or update the spec to 3 clues).
- **Traditional costume is not a per-state content card.** FR2 lists "traditional
  costume" as part of a state's culture, but there is no `costume`-type row in
  `cultural_content` (the frontend has no such card data). The culturally-themed
  traditional costumes (Baju Melayu, Cheongsam, Saree, Kadazan-Dusun, Iban) live in the
  shared `costumes` catalogue served by `GET /api/progress/costumes` (the avatar shop /
  FR6). The `cultural_content.card_type` enum *does* allow `'costume'`, so per-state
  costume cards can be added later if desired.
- **Spec vs. code paths:** quiz is `/api/quiz/state/:id` and costumes are under
  `/api/progress/costumes/...` (not `/api/states/:id/quiz` and `/api/costumes/...` as in
  `docs/CLAUDE.md §6`). Frontend `fetch()` must use the actual paths above.
- **Answer leak:** `GET /api/quiz/state/:id` currently returns `correct_opt` to the
  client. Consider stripping it before shipping (rely on `/api/quiz/validate`).
- **Content lives in two places:** `public/js/data/` (frontend) and the DB (backend).
  The seed keeps them in sync — re-run `npm run seed` after editing `js/data/`.
- **Assets are placeholders:** `public/assets/` images/audio are mostly empty; UI falls
  back to emoji until Figma exports land.
- **MySQL → Postgres:** older docs and `db/schema.sql` mention MySQL/XAMPP; the live
  backend is Supabase Postgres. `db/schema.postgres.sql` is the one to run.
