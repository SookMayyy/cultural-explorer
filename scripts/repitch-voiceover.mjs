// scripts/repitch-voiceover.mjs — change the pitch of the existing voice-over
// clips WITHOUT calling ElevenLabs (free, offline, no credits).
// ─────────────────────────────────────────────────────────────────────────────
// Usage:
//   npm run repitch 13      → set the voice to +10%  (the current setting)
//   npm run repitch 0       → natural pitch (no shift)
//   npm run repitch 20      → +20% (youngest / most child-like)
//   npm run repitch 8       → +8%  … any whole number from 0 to 40
//
// How it works (so re-tuning many times never degrades quality):
//   • The FIRST run makes a one-time "master" copy of every clip at natural pitch
//     in src/assets/audio/vo_master/ (derived from the current +10% clips).
//   • Every run then rebuilds the app clips in src/assets/audio/vo/ FROM those
//     masters in a single step — so the result is always one hop from the master,
//     no matter how often you change the number.
//   • Pitch is done with ffmpeg (bundled ffmpeg-static): asetrate raises pitch AND
//     formants (sounds younger/smaller); atempo restores the original duration.
// ─────────────────────────────────────────────────────────────────────────────
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import ffmpeg from 'ffmpeg-static';

const execFileP = promisify(execFile);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root      = path.join(__dirname, '..');
const voDir     = path.join(root, 'src', 'assets', 'audio', 'vo');
const masterDir = path.join(root, 'src', 'assets', 'audio', 'vo_master');
// Lives next to the app clips (NOT inside vo_master/) so it survives even if the
// masters are deleted — that's what lets a rebuild know how to undo the current pitch.
const stateFile = path.join(voDir, '.applied_pitch');       // remembers the last % applied
const SR = 44100;                                            // clips are mp3_44100

// Fallback ONLY: the pitch the vo/ clips are at, used to build the masters the very
// first time IF no .applied_pitch has been recorded yet. Normally the recorded state
// is used instead, so you never need to touch this. Keep it equal to the real
// current pitch if you ever hand-apply one outside this script.
const SEED_APPLIED_PCT = 13;

// ── Parse the target percent (0–40) ──────────────────────────────────────────
const raw = (process.argv[2] || '').replace(/[+%\s]/g, '');
const pct = Number(raw);
if (raw === '' || Number.isNaN(pct) || pct < 0 || pct > 40) {
  console.error('Usage: npm run repitch <percent 0-40>   e.g.  npm run repitch 10');
  process.exit(1);
}

// Apply pitch factor F to `inFile` → `outFile` (F=1.10 means +10%). F=1 just copies.
async function pitchTo(inFile, outFile, F) {
  if (Math.abs(F - 1) < 1e-6) { fs.copyFileSync(inFile, outFile); return; }
  await execFileP(ffmpeg, ['-y', '-loglevel', 'error', '-i', inFile,
    '-af', `asetrate=${SR}*${F},aresample=${SR},atempo=${1 / F}`, outFile]);
}

// ── 1) Build the natural-pitch masters once (from the current clips) ──────────
if (!fs.existsSync(path.join(masterDir, 'penang_food_intro.mp3'))) {
  fs.mkdirSync(masterDir, { recursive: true });
  // Undo whatever pitch the current clips are at. Trust the recorded state; only
  // fall back to the seed constant if nothing has ever been recorded.
  const currentPct = fs.existsSync(stateFile)
    ? (Number(fs.readFileSync(stateFile, 'utf8').trim()) || 0)
    : SEED_APPLIED_PCT;
  const removeF = 1 / (1 + currentPct / 100);
  const files = fs.readdirSync(voDir).filter(f => f.endsWith('.mp3'));
  console.log(`Building ${files.length} natural masters from the current +${currentPct}% clips (one-time)…`);
  for (const f of files) await pitchTo(path.join(voDir, f), path.join(masterDir, f), removeF);
}

// ── 2) Rebuild every app clip from the masters at the requested pitch ─────────
const F = 1 + pct / 100;
const masters = fs.readdirSync(masterDir).filter(f => f.endsWith('.mp3'));
console.log(`Re-pitching ${masters.length} clips to +${pct}% …`);
let n = 0;
for (const f of masters) { await pitchTo(path.join(masterDir, f), path.join(voDir, f), F); n++; }
fs.writeFileSync(stateFile, String(pct));
console.log(`Done — ${n} clips are now at +${pct}%. Refresh the app to hear it (sound on).`);
