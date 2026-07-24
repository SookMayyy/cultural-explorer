# Cultural Explorer

A browser-based educational game that helps primary-school children explore Malaysia's
cultures through mini-games, quizzes, interactive maps, and cultural stories. Built for a
Final Year Project (FYP) as a mobile-first, responsive web app.

The prototype covers **6 states** — Penang, Selangor, Kelantan, Kedah, Sabah, and Sarawak.
All states are open from the start; missions *within* a state unlock in sequence.

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | Vanilla JS (ES2022), native ES modules, HTML5, CSS3 — no framework, no bundler (multi-page app) |
| Runtime | Node.js 20.x (npm 10) |
| Backend | Express.js 4 (`server.js` + `routes/` + `middleware/`) |
| Database | PostgreSQL, hosted on Supabase (`pg` driver pool in `db/connection.js`) |
| Auth & security | `express-session`, `bcrypt`, `express-validator`, `express-rate-limit` |
| Tests | Jest + Supertest (backend), Jest + `puppeteer-core` (UI) |

## Getting started

```bash
npm install
cp .env.example .env          # then set DATABASE_URL (Supabase pooler URI)
npm run seed                  # populate content tables (run once after schema is applied)
npm run dev                   # start with live reload at http://localhost:3000
```

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Express + live reload (nodemon) at http://localhost:3000 |
| `npm start` | Production static serve |
| `npm run seed` | Seed states, cards, dialogue, and quiz content |
| `npm test` | Backend tests (Jest + Supertest, FR1–FR7) against Supabase |
| `npm run test:ui` | UI tests — drives the real pages in Chrome (needs Chrome; set `CHROME_PATH` to override) |
| `npm run voiceover` | Generate narration MP3s via ElevenLabs |
| `npm run repitch <0-40>` | Re-tune voice pitch offline |

`npm test` covers the backend only. `npm run test:ui` protects the frontend — it starts
the server itself and drives real pages, so a broken import or wrong nav target fails there.

## Project structure

```
cultural-explorer/
├─ server.js                 # Express entry point
├─ db/                       # connection.js (pg pool) + schema.postgres.sql
├─ routes/                   # auth, progress, quiz, states
├─ middleware/               # auth, rateLimiter
├─ scripts/                  # seed + voiceover tooling
├─ src/
│  ├─ index.html
│  ├─ views/                 # one .html per screen (MPA, no client-side router)
│  ├─ css/                   # one .css per screen + style.css (shared tokens)
│  ├─ js/                    # one .js per screen + ui.js (shared)
│  │  ├─ data/               # content modules (states, quizzes, missions, …)
│  │  ├─ components/         # dragMatch, typewriter, popup, howToPlay, difficultyChip
│  │  └─ utils/              # storage, dom, shuffle, voice, sound, confetti, pointerDrag, …
│  └─ assets/                # content/<State>/, characters/, flags/, images/ui/, audio/
├─ tests/                    # backend (fr1–fr7) + ui/ (puppeteer)
└─ docs/                     # full spec, guides, and FYP documents
```

Each screen is a standalone HTML file in `src/views/`, paired with an ES module of the
same name in `src/js/`. Navigation is plain `<a href="…">` links, with a `?state=` query
param carrying context.

## Desktop up-scale

The UI is mobile-first inside a ~1227px frame. On desktop-class monitors
(`screen.width >= 1500`, checked once in `src/js/ui.js`) an `html.big-ui` class is added
and the `--app-zoom` token in `src/css/style.css` zooms the whole frame 30% so fonts,
images, and the bottom nav grow together; laptops and smaller screens keep the base size.
`screen.width` is used rather than a viewport media query so window resizing and browser
page-zoom never trigger it.

