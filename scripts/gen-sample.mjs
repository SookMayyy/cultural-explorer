// scripts/gen-sample.mjs — audition ElevenLabs voices cheaply.
// Generates ONE short line in each named voice into pitch-previews/ so you can
// compare them (e.g. against a reference clip) before committing the whole batch.
//
//   node scripts/gen-sample.mjs josh:TxGEqnHWrfWFTfGW9XjX liam:TX3LPaxmHKxFdv7VOQHJ
//
// Uses your ELEVENLABS_API_KEY from .env. Each line is ~80 chars ≈ 40 credits.
import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, '..', 'pitch-previews');
fs.mkdirSync(outDir, { recursive: true });

const TEXT = process.env.SAMPLE_TEXT
  || "I need your help cooking Char Kway Teow! Tap the glowing spots to learn about it.";
const model = (process.env.ELEVENLABS_MODEL_ID || 'eleven_turbo_v2_5').trim();
const fmt   = (process.env.ELEVENLABS_OUTPUT_FORMAT || 'mp3_44100_128').trim();
const key   = (process.env.ELEVENLABS_API_KEY || '').replace(/^["'<]+|["'>]+$/g, '').trim();

const pairs = process.argv.slice(2).map(a => a.split(':'));
if (!key)          { console.error('Set ELEVENLABS_API_KEY in .env'); process.exit(1); }
if (!pairs.length) { console.error('Pass voices as name:voiceId ...'); process.exit(1); }

const { ElevenLabsClient } = await import('@elevenlabs/elevenlabs-js');
const client = new ElevenLabsClient({ apiKey: key });

async function toBuffer(audio) {
  if (typeof audio?.getReader === 'function') {
    const reader = audio.getReader(); const chunks = [];
    for (;;) { const { done, value } = await reader.read(); if (done) break; chunks.push(Buffer.from(value)); }
    return Buffer.concat(chunks);
  }
  const chunks = [];
  for await (const c of audio) chunks.push(Buffer.from(c));
  return Buffer.concat(chunks);
}

for (const [name, voiceId] of pairs) {
  try {
    const audio = await client.textToSpeech.convert(voiceId, { text: TEXT, modelId: model, outputFormat: fmt });
    const buf = await toBuffer(audio);
    const file = path.join(outDir, `voice_${name}.mp3`);
    fs.writeFileSync(file, buf);
    console.log(`✓ voice_${name}.mp3  (${buf.length} bytes)`);
  } catch (e) {
    console.error(`✗ ${name} — ${e?.statusCode || ''} ${e?.body || e?.message || e}`);
  }
}
