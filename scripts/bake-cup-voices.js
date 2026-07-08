// Bake the "Fill Your Cup" refreshed affirmations to public/audio/cup/<id>.mp3
// via ElevenLabs (fun warm woman's voice).
//
// Usage:
//   node scripts/bake-cup-voices.js            # bake everything missing
//   node scripts/bake-cup-voices.js --force    # re-bake even if the mp3 exists
//   node scripts/bake-cup-voices.js --audition # only bake the first line, to sample the voice
//
// Voice + lines live in src/data/cupVoiceLines.js.
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadEnv, VOICES, generateSpeech } from './lib/eleven.js';
import { CUP_VOICE, CUP_VOICE_LINES } from '../src/data/cupVoiceLines.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = resolve(ROOT, 'public', 'audio', 'cup');

loadEnv();
const apiKey = process.env.ELEVENLABS_API_KEY;
if (!apiKey) {
  console.error('ELEVENLABS_API_KEY missing from .env');
  process.exit(1);
}

const force = process.argv.includes('--force');
const audition = process.argv.includes('--audition');
const lines = audition ? CUP_VOICE_LINES.slice(0, 1) : CUP_VOICE_LINES;

mkdirSync(OUT_DIR, { recursive: true });

const voiceId = VOICES[CUP_VOICE] || CUP_VOICE;
let baked = 0;
let skipped = 0;
let failed = 0;

for (const line of lines) {
  const outPath = resolve(OUT_DIR, `${line.id}.mp3`);
  if (!force && !audition && existsSync(outPath)) {
    skipped++;
    continue;
  }
  try {
    const buf = await generateSpeech({
      text: line.text,
      voiceId,
      apiKey,
      voiceSettings: line.delivery,
    });
    writeFileSync(outPath, buf);
    baked++;
    console.log(`✓ ${line.id} [${CUP_VOICE}] ${(buf.length / 1024).toFixed(0)}KB — "${line.text}"`);
  } catch (err) {
    failed++;
    console.error(`✗ ${line.id}: ${err.message}`);
  }
}

console.log(`\nDone. baked=${baked} skipped=${skipped} failed=${failed}`);
if (failed > 0) process.exit(1);
