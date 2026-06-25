// scripts/seed-content.mjs
// Seeds the DB tables that the backend reads but the schema never populated:
//   states (re-aligned to the frontend), cultural_content, state_dialogue, quiz_questions.
//
// Source of truth = the frontend ES modules in src/js/data/. Those files use
// `export const`, so we copy them to temporary `.mjs` twins (forcing ESM parsing)
// and dynamic-import them — no content is duplicated by hand.
//
// Idempotent: re-running replaces all seed content. Only touches the four content
// tables above; never touches users / user_progress / costumes.
//
// Run:  node scripts/seed-content.mjs

import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root      = path.join(__dirname, '..');
const dataDir   = path.join(root, 'src', 'js', 'data');
const tmpDir    = path.join(__dirname, '.gen');

// ── Load the frontend data modules as ESM ──────────────────────────────────────
fs.mkdirSync(tmpDir, { recursive: true });
async function loadData(file) {
  const twin = path.join(tmpDir, file.replace(/\.js$/, '.mjs'));
  fs.copyFileSync(path.join(dataDir, file), twin);
  return import(pathToFileURL(twin).href);
}
const { STATES_DATA }   = await loadData('states.js');
const { QUIZ_QUESTIONS } = await loadData('quizzes.js');

// ── DB connection (mysql2-compatible CJS module) ───────────────────────────────
const { default: pool } = await import(pathToFileURL(path.join(root, 'db', 'connection.js')).href);

// ── Mappings ───────────────────────────────────────────────────────────────────
// Frontend string id → DB integer id (and the canonical state catalogue).
const STATE_ID = { penang: 1, melaka: 2, selangor: 3, johor: 4, kelantan: 5, sabah: 6, sarawak: 7 };

// Frontend card category → DB card_type enum (food|landmark|tradition|dialect|costume).
const TYPE_MAP = { Food: 'food', Landmark: 'landmark' };
const cardType = (cat) => TYPE_MAP[cat] || 'tradition';

// Frontend quiz answer index → DB correct_opt letter.
const LETTER = ['a', 'b', 'c', 'd'];

const mascotName = (m) => (m === 'wak' ? 'Wak the Hornbill' : 'Rimau the Tiger');

async function run() {
  console.log('Seeding content from frontend data → Supabase…\n');

  // 0) Make sure already-deployed DBs have the columns this seed writes (idempotent).
  await pool.execute('ALTER TABLE states ADD COLUMN IF NOT EXISTS story TEXT');

  // 1) States — upsert the 7 canonical states (overwrites any stale rows like Kedah/Pahang).
  for (const s of STATES_DATA) {
    const id     = STATE_ID[s.id];
    const region = s.region;                         // 'west' | 'east'
    const mascot = region === 'east' ? 'wak' : 'rimau';
    const flag   = (s.emoji.match(/flags\/([\w-]+\.png)/) || [])[1] || null;
    const locked = region === 'east';
    await pool.execute(
      `INSERT INTO states (id, name, region, mascot, color_hex, flag_file, story, is_locked_default, unlock_after, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name, region = EXCLUDED.region, mascot = EXCLUDED.mascot,
         color_hex = EXCLUDED.color_hex, flag_file = EXCLUDED.flag_file, story = EXCLUDED.story,
         is_locked_default = EXCLUDED.is_locked_default, unlock_after = EXCLUDED.unlock_after,
         sort_order = EXCLUDED.sort_order`,
      [id, s.name, region, mascot, s.color, flag, s.story || null, locked, locked ? 5 : 0, id]
    );
  }
  console.log(`✔ states: ${STATES_DATA.length} upserted`);

  // 2) Wipe + reseed the content tables (seed-only, safe to clear).
  await pool.execute('DELETE FROM cultural_content');
  await pool.execute('DELETE FROM state_dialogue');
  await pool.execute('DELETE FROM quiz_questions');

  // 3) Cultural content cards — 3 mapped cards + 1 dialect card per state.
  let cardCount = 0;
  for (const s of STATES_DATA) {
    const sid = STATE_ID[s.id];
    let sort = 1;
    for (const c of s.cards) {
      await pool.execute(
        `INSERT INTO cultural_content (state_id, card_type, title, body_text, fun_fact, mascot_line, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [sid, cardType(c.category), c.title, c.desc, c.funFact || null, c.mascotLine || null, sort++]
      );
      cardCount++;
    }
    // Dialect card derived from dialectWord (satisfies FR2's dialect card type).
    const d = s.dialectWord;
    if (d) {
      await pool.execute(
        `INSERT INTO cultural_content (state_id, card_type, title, body_text, fun_fact, mascot_line, sort_order)
         VALUES (?, 'dialect', ?, ?, ?, ?, ?)`,
        [sid, d.word, `"${d.word}" means ${d.meaning}. (Say it: ${d.pronunciation})`,
         null, `In ${s.name}, we love the word "${d.word}"!`, sort++]
      );
      cardCount++;
    }
  }
  console.log(`✔ cultural_content: ${cardCount} cards`);

  // 4) State dialogue — synthesised mascot lines (FR4 hook→bridge→CTA shape).
  for (const s of STATES_DATA) {
    const sid = STATE_ID[s.id];
    const m   = mascotName(s.region === 'east' ? 'wak' : 'rimau');
    await pool.execute(
      `INSERT INTO state_dialogue
         (state_id, entry_first, entry_return, entry_locked, challenge_frame, feedback_correct, feedback_wrong, reward_outro)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        sid,
        `Hi! I'm ${m}. Welcome to ${s.name} — ${s.tagline}! Shall we explore together?`,
        `Welcome back to ${s.name}! There is always more to discover here. Let's go!`,
        `${s.name} is still locked. Finish a few more states and I'll be waiting for you!`,
        `Ready for a challenge about ${s.name}? Let's see what you've learned!`,
        `Yes! That's right! You really know ${s.name}!`,
        `Not quite — but don't worry, let's try again together!`,
        `Hooray! You've earned your ${s.name} stamp! I'm so proud of you!`,
      ]
    );
  }
  console.log(`✔ state_dialogue: ${STATES_DATA.length} rows`);

  // 5) Quiz questions — the standalone bank PLUS each state's inline quizQuestion.
  let qCount = 0;
  async function insertQuestion(sid, difficulty, q, opts, ans, explain) {
    await pool.execute(
      `INSERT INTO quiz_questions
         (state_id, difficulty, question_text, opt_a, opt_b, opt_c, opt_d, correct_opt, explanation)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [sid, difficulty, q, opts[0], opts[1], opts[2], opts[3], LETTER[ans], explain]
    );
    qCount++;
  }
  for (const q of QUIZ_QUESTIONS) {
    const sid = STATE_ID[q.stateId];
    if (!sid) continue;
    await insertQuestion(sid, q.difficulty || 'easy', q.q, q.opts, q.ans, q.explain);
  }
  for (const s of STATES_DATA) {
    const qq = s.quizQuestion;
    if (!qq) continue;
    await insertQuestion(STATE_ID[s.id], 'easy', qq.q, qq.opts, qq.ans, qq.explain);
  }
  console.log(`✔ quiz_questions: ${qCount} questions`);

  console.log('\nDone. Content seeded successfully.');
  await pool.pool.end();
}

run().catch(async (err) => {
  console.error('Seed failed:', err);
  try { await pool.pool.end(); } catch {}
  process.exit(1);
});
