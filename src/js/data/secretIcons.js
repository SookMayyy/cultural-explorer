// js/data/secretIcons.js — the 12 "secret icons" used for account recovery.
//
// A child picks 2 of these in order at sign-up; the same 2 in the same order
// recover the account. Index+1 maps to the backend icon_key values 1–12
// (users.icon_key_1 / icon_key_2). This is the SINGLE source of truth — the
// sign-up (signup.js) and recovery (recover.js) screens both import it, so the
// grids can never drift out of sync (they used to be hand-copied per file).
export const SECRET_ICONS = ['🌺', '🦋', '⭐', '🌙', '🐘', '🦜', '🍃', '🎈', '🐠', '🌈', '🦁', '🌻'];
