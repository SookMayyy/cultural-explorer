# Archive

Files moved here during Phase A cleanup (2026-07-10). They are **not loaded
by the app** — kept for reference and easy restore from git history.

| File | Original path | Why archived |
|------|---------------|--------------|
| `css/login.css` | `src/css/login.css` | Superseded by `src/css/auth.css`. No HTML linked `login.css`; login and signup use `auth.css`. |
| `js/components/quizWidget.js` | `src/js/components/quizWidget.js` | Zero imports. MCQ logic lives inline in `src/js/quiz.js`. Restore if you refactor quiz to use the component again. |
| `js/components/mascot.js` | `src/js/components/mascot.js` | Zero imports. Screens call `renderMascot()` / `setMascotPose()` from `src/js/data/mascots.js` directly. |

To restore a file, copy it back to its original path under `src/`.
