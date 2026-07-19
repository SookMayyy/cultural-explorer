// scripts/gen-voiceover.mjs
// Generates the app's voice-over MP3 clips with ElevenLabs (free tier friendly).
// ─────────────────────────────────────────────────────────────────────────────
// The narration ids the app plays at runtime come from src/js/mission.js:
//   voCat = { chef:'food', dancer:'costume', tourist:'tour', festival:'festival' }
//   spotlight intro       → `${state}_${voCat}_intro`        (text = spotlight.intro)
//   spotlight hotspot     → hs.vo  (e.g. penang_food_1)      (text = hs.text)
//   spotlight transition  → `${state}_${voCat}_transition`   (text = spotlight.transition)
//   festival learn card   → c.vo || `${state}_festival_${n}` (text = c.text)
//   tour card (tourist)   → `${state}_tour_${n}`             (text = card.text)
// We DERIVE the id→text map straight from the data files (same source of truth the
// UI reads), so the spoken audio always matches the on-screen caption — then TTS
// each line to `src/assets/audio/vo/<id>.mp3`. voice.js plays the MP3 when present
// and otherwise falls back to the browser's Web Speech API, so partial runs are safe.
//
// Idempotent: an id whose .mp3 already exists is SKIPPED (never re-spends credits).
//
// Env (.env):
//   ELEVENLABS_API_KEY      required (except --dry-run)
//   ELEVENLABS_VOICE_ID     voice to use (default: Rachel — pick your own from your
//                           ElevenLabs Voice Library and set this)
//   ELEVENLABS_MODEL_ID     default eleven_turbo_v2_5 (0.5 credits/char)
//   ELEVENLABS_OUTPUT_FORMAT default mp3_44100_128
//
// Run:
//   npm run voiceover:dry                 # preview id/text/char totals, NO API calls
//   node scripts/gen-voiceover.mjs --state=penang     # pilot one state
//   node scripts/gen-voiceover.mjs --only=penang_food # pilot by id prefix
//   npm run voiceover                     # generate everything still missing

import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
const execFileP = promisify(execFile);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root      = path.join(__dirname, '..');
const dataDir   = path.join(root, 'src', 'js', 'data');
const tmpDir    = path.join(__dirname, '.gen');
const voDir     = path.join(root, 'src', 'assets', 'audio', 'vo');
const manifest  = path.join(dataDir, 'voClips.js');

// ── CLI flags ───────────────────────────────────────────────────────────────
const args    = process.argv.slice(2);
const dryRun  = args.includes('--dry-run');
const stateFilter = (args.find(a => a.startsWith('--state=')) || '').split('=')[1] || null;
const onlyFilter  = (args.find(a => a.startsWith('--only='))  || '').split('=')[1] || null;

// Order matters only for tidy output.
const STATES = ['penang', 'selangor', 'kelantan', 'kedah', 'sabah', 'sarawak'];

// ── Load the frontend data modules as ESM (copy → .mjs twin, like seed-content) ──
fs.mkdirSync(tmpDir, { recursive: true });
async function loadData(file) {
  const twin = path.join(tmpDir, file.replace(/\.js$/, '.mjs'));
  fs.copyFileSync(path.join(dataDir, file), twin);
  return import(pathToFileURL(twin).href);
}
const { FOOD_MISSIONS }     = await loadData('foodMissions.js');
const { COSTUME_MISSIONS }  = await loadData('costumeMissions.js');
const { FESTIVAL_MISSIONS } = await loadData('festivalMissions.js');
const { LANDMARK_MISSIONS } = await loadData('landmarkMissions.js');

// ── Build the id → text map, replicating mission.js's key rules ─────────────────
const clips = new Map();   // preserves insertion order, de-dupes ids

function addSpotlight(state, voCat, mission) {
  const sp = mission?.spotlight;
  if (!sp) return;
  if (sp.intro) clips.set(`${state}_${voCat}_intro`, sp.intro);
  (sp.hotspots || []).forEach((hs, i) => {
    if (hs.text) clips.set(hs.vo || `${state}_${voCat}_${i + 1}`, hs.text);
  });
  (sp.cards || []).forEach((c, i) => {
    if (c.text) clips.set(c.vo || `${state}_${voCat}_${i + 1}`, c.text);
  });
  if (sp.transition) clips.set(`${state}_${voCat}_transition`, sp.transition);
}

function addTour(state, mission) {
  (mission?.tour || []).forEach((c, i) => {
    if (c.text) clips.set(`${state}_tour_${i + 1}`, c.text);
  });
}

for (const state of STATES) {
  addSpotlight(state, 'food',     FOOD_MISSIONS[state]);
  addSpotlight(state, 'costume',  COSTUME_MISSIONS[state]);
  addSpotlight(state, 'festival', FESTIVAL_MISSIONS[state]);
  addTour(state, LANDMARK_MISSIONS[state]);
}

// Apply optional pilot filters.
let entries = [...clips.entries()];
if (stateFilter) entries = entries.filter(([id]) => id.startsWith(stateFilter + '_'));
if (onlyFilter)  entries = entries.filter(([id]) => id.startsWith(onlyFilter));

// ── Manifest writer: list every .mp3 actually present in the vo folder ──────────
function writeManifest() {
  const files = fs.existsSync(voDir)
    ? fs.readdirSync(voDir).filter(f => f.endsWith('.mp3')).sort()
    : [];
  const lines = files.map(f => {
    const id = f.replace(/\.mp3$/, '');
    return `  ${/^[A-Za-z_$][\w$]*$/.test(id) ? id : JSON.stringify(id)}: '../assets/audio/vo/${f}',`;
  });
  const body =
`// src/js/data/voClips.js — AUTO-GENERATED by scripts/gen-voiceover.mjs. Do not edit by hand.
// Maps a narration clip id → its recorded MP3 (relative to src/views/). voice.js
// imports this as its CLIPS map; any id NOT listed here falls back to Web Speech.
export const VO_CLIPS = {
${lines.join('\n')}
};
`;
  fs.writeFileSync(manifest, body);
  return files.length;
}

// ── Dry run: preview only, no network ───────────────────────────────────────────
const totalChars = entries.reduce((n, [, t]) => n + t.length, 0);
const modelId = process.env.ELEVENLABS_MODEL_ID || 'eleven_turbo_v2_5';
const creditsPerChar = /turbo|flash/.test(modelId) ? 0.5 : 1;

if (dryRun) {
  console.log(`\nVoice-over DRY RUN — ${entries.length} clips derived from src/js/data/\n`);
  for (const [id, text] of entries) {
    console.log(`  ${id.padEnd(28)} ${String(text.length).padStart(3)}c  ${text}`);
  }
  console.log(`\n  Total: ${entries.length} clips, ${totalChars} characters`);
  console.log(`  Model: ${modelId} (~${Math.round(totalChars * creditsPerChar)} credits of the 10,000/mo free budget)`);
  console.log('\n  No API calls made. Set ELEVENLABS_API_KEY in .env and re-run without --dry-run.\n');
  process.exit(0);
}

// ── Real generation ─────────────────────────────────────────────────────────────
// Strip stray whitespace, quotes, and the <...> placeholder brackets people often
// copy in from .env.example, so a value like `<wSq...>` still works.
const clean = (v) => (v || '').trim().replace(/^["'<]+|["'>]+$/g, '').trim();

const apiKey = clean(process.env.ELEVENLABS_API_KEY);
if (!apiKey) {
  console.error('ERROR: ELEVENLABS_API_KEY is not set. Add it to .env (see .env.example).');
  process.exit(1);
}

const { ElevenLabsClient } = await import('@elevenlabs/elevenlabs-js');
const client  = new ElevenLabsClient({ apiKey });
const voiceId = clean(process.env.ELEVENLABS_VOICE_ID) || '21m00Tcm4TlvDq8ikWAM'; // Rachel (overridable)
const outputFormat = clean(process.env.ELEVENLABS_OUTPUT_FORMAT) || 'mp3_44100_128';

// Optional pitch shift (VO_PITCH, e.g. 1.20 = +20%). ElevenLabs has no pitch
// control, so we raise pitch AND formants with ffmpeg (asetrate → sounds like a
// younger/smaller speaker) and restore the original duration with atempo. Uses
// the bundled ffmpeg-static binary — no system ffmpeg needed.
const pitch = parseFloat(clean(process.env.VO_PITCH) || '1') || 1;
const sampleRate = (outputFormat.match(/mp3_(\d+)_/) || [])[1] || '44100';
let ffmpegPath = null;
if (pitch !== 1) {
  ({ default: ffmpegPath } = await import('ffmpeg-static'));
  if (!ffmpegPath) { console.error('ERROR: VO_PITCH set but ffmpeg-static not found. Run: npm i -D ffmpeg-static'); process.exit(1); }
}

// Write one clip, applying the pitch shift when VO_PITCH != 1.
async function writeClip(outFile, buf) {
  if (pitch === 1) { fs.writeFileSync(outFile, buf); return; }
  const raw = outFile.replace(/\.mp3$/, '.raw.mp3');
  fs.writeFileSync(raw, buf);
  try {
    await execFileP(ffmpegPath, ['-y', '-loglevel', 'error', '-i', raw,
      '-af', `asetrate=${sampleRate}*${pitch},aresample=${sampleRate},atempo=1/${pitch}`, outFile]);
    fs.unlinkSync(raw);
  } catch (e) {
    fs.renameSync(raw, outFile);   // ffmpeg failed → keep the un-pitched clip rather than lose it
    throw e;
  }
}

fs.mkdirSync(voDir, { recursive: true });

// Normalise whatever convert() returns (web ReadableStream / Node Readable /
// Uint8Array) into a single Buffer.
async function toBuffer(audio) {
  if (!audio) return Buffer.alloc(0);
  if (Buffer.isBuffer(audio)) return audio;
  if (audio instanceof Uint8Array) return Buffer.from(audio);
  if (typeof audio.getReader === 'function') {           // web ReadableStream
    const reader = audio.getReader();
    const chunks = [];
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(Buffer.from(value));
    }
    return Buffer.concat(chunks);
  }
  if (typeof audio[Symbol.asyncIterator] === 'function') { // Node Readable / async iterable
    const chunks = [];
    for await (const chunk of audio) chunks.push(Buffer.from(chunk));
    return Buffer.concat(chunks);
  }
  return Buffer.from(audio);
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

let written = 0, skipped = 0, spentChars = 0;
console.log(`\nGenerating voice-over → ${path.relative(root, voDir)}`);
console.log(`  voice=${voiceId}  model=${modelId}  format=${outputFormat}${pitch !== 1 ? `  pitch=+${Math.round((pitch - 1) * 100)}%` : ''}`);
console.log(`  ${entries.length} clips in scope, ${totalChars} chars (~${Math.round(totalChars * creditsPerChar)} credits)\n`);

for (const [id, text] of entries) {
  const outFile = path.join(voDir, `${id}.mp3`);
  if (fs.existsSync(outFile)) { skipped++; continue; }
  try {
    const audio = await client.textToSpeech.convert(voiceId, { text, modelId, outputFormat });
    const buf = await toBuffer(audio);
    if (!buf.length) throw new Error('empty audio');
    await writeClip(outFile, buf);
    written++; spentChars += text.length;
    console.log(`  ✓ ${id.padEnd(28)} ${String(text.length).padStart(3)}c  (${buf.length} bytes)`);
    await sleep(350);   // be gentle with the API
  } catch (err) {
    const code = err?.statusCode || err?.status || '';
    let detail = err?.body ?? err?.message ?? String(err);
    if (detail && typeof detail === 'object') detail = JSON.stringify(detail);
    const msg = `${code} ${detail}`.trim();
    console.error(`  ✗ ${id} — ${msg}`);
    if (/429|quota|limit|credit/i.test(String(msg))) {
      console.error('\n  Stopping: looks like the ElevenLabs quota/rate limit was hit.');
      console.error(`  Wrote ${written} new clip(s) this run before stopping.`);
      break;
    }
  }
}

const total = writeManifest();
console.log(`\nDone. Wrote ${written} new clip(s), skipped ${skipped} existing, ${spentChars} chars spent this run.`);
console.log(`Manifest src/js/data/voClips.js now lists ${total} clip(s).\n`);
