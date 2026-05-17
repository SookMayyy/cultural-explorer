# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running the app

```powershell
npm run dev      # live-server on http://localhost:3000 with auto-reload
npm start        # static serve on http://localhost:3000 (no auto-reload)
```

No build step, no bundler, no transpilation — the app runs directly from source files in the browser.

## Architecture

This is a **vanilla JS SPA** (no frameworks, no modules system). All scripts are loaded globally; every JS file exposes a single `const` in the global scope.

### Screen system

`Router` (`js/router.js`) is the central controller. It maps screen IDs to view objects and calls `view.render(screenEl, params)` when navigating. Navigation is triggered by `data-nav` attributes on buttons — the router wires these automatically after each render.

Screens are `<div id="screen-{id}" class="screen">` elements in the main HTML. The active screen gets class `active`; all others are hidden via CSS.

Current screens: `home`, `map`, `narrative`, `quiz`, `guess`, `stampbook`, `reward`, `dashboard`.

### Data layer

All game content lives in three global arrays in `js/data/`:

- `STATES_DATA` — one object per state with `id`, `cards[]`, `dragPairs[]`, `quizQuestion`, `story`, dialect words, and ethnic info. This is the single source of truth for all state content.
- `QUIZ_QUESTIONS` — standalone MCQ array used by the full Quiz screen (12 questions across all 7 states).
- `GUESS_ROUNDS` — clue sets for the "Guess My State" game (3 hints + answer + 3 options per round).

### Components

Reusable UI pieces in `js/components/` follow a two-step pattern:

1. `.render(...)` — returns an HTML string to inject into the DOM
2. `.init(containerEl, ...)` — attaches event listeners after the string is in the DOM

Key components: `QuizWidget` (MCQ with retry), `DragMatch` (tap-to-match food game), `Navbar`, `Topbar`, `ProgressBar`, `BatikCorner`.

### Persistence

`Storage` (`js/utils/storage.js`) wraps `localStorage` with typed accessors. Keys are prefixed `ce_`. Tracks: earned stamps per state, total points, per-state tab completion (`story/culture/activity/quiz`), player name, and best quiz score.

### Utilities

`Helpers` (`js/utils/helpers.js`) provides: `render(selector, html)`, event delegation via `on()`, `shuffle()`, `getState(id)` (looks up `STATES_DATA`), `unlockedUpTo()` (sequential unlock logic), `pop()` (CSS animation trigger), and `confetti()`.

### Script load order

Because there is no module system, `index.html` must load scripts in dependency order:
1. Data files (`states.js`, `quizzes.js`, `guessRounds.js`)
2. Utils (`storage.js`, `helpers.js`)
3. Components (`navbar.js`, `topbar.js`, etc.)
4. `router.js`
5. `app.js` (bootstraps the app)

### CSS

Each screen has a dedicated stylesheet in `css/` (e.g. `quiz.css`, `map.css`). Shared base styles are in `css/style.css`. There is no CSS preprocessor.

## Git & GitHub

Repository: https://github.com/SookMayyy/cultural-explorer  
Branch: `master`

Commit after every meaningful change with a descriptive message. The `gh` CLI is installed at `C:\Program Files\GitHub CLI\gh.exe` and must be called with its full path in PowerShell (or PATH must be refreshed first).

## Prototype scope

Currently implements 7 of Malaysia's 13 states (Penang, Melaka, Selangor, Johor, Kelantan, Sabah, Sarawak). The `assets/images/states/` folder is reserved for state-specific images (currently empty).
