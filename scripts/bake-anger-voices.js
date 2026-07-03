// Bake every Anger Gym voice line to public/audio/anger/<id>.mp3 via ElevenLabs.
//
// Usage:
//   node scripts/bake-anger-voices.js            # bake everything missing
//   node scripts/bake-anger-voices.js --force    # re-bake even if the mp3 exists
//   node scripts/bake-anger-voices.js --only door-t5-0,slam-rep-6
//
// Voices + delivery settings live in src/data/angerVoiceLines.js.
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadEnv, VOICES, generateSpeech } from './lib/eleven.js';
import { ALL_VOICE_LINES } from '../src/data/angerVoiceLines.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = resolve(ROOT, 'public', 'audio', 'anger');

loadEnv();
const apiKey = process.env.ELEVENLABS_API_KEY;
if (!apiKey) {
  console.error('ELEVENLABS_API_KEY missing from .env');
  process.exit(1);
}

const force = process.argv.includes('--force');
const onlyIdx = process.argv.indexOf('--only');
const only = onlyIdx > -1 ? new Set(process.argv[onlyIdx + 1].split(',')) : null;

mkdirSync(OUT_DIR, { recursive: true });

let baked = 0;
let skipped = 0;
let failed = 0;
let chars = 0;

for (const line of ALL_VOICE_LINES) {
  if (only && !only.has(line.id)) continue;
  const outPath = resolve(OUT_DIR, `${line.id}.mp3`);
  if (!force && existsSync(outPath)) {
    skipped++;
    continue;
  }
  const voiceId = VOICES[line.voice] || line.voice;
  try {
    const buf = await generateSpeech({
      text: line.text,
      voiceId,
      apiKey,
      voiceSettings: line.delivery,
    });
    writeFileSync(outPath, buf);
    chars += line.text.length;
    baked++;
    console.log(`✓ ${line.id} [${line.voice}] ${(buf.length / 1024).toFixed(0)}KB — "${line.text}"`);
  } catch (err) {
    failed++;
    console.error(`✗ ${line.id}: ${err.message}`);
  }
}

console.log(`\nDone. baked=${baked} skipped=${skipped} failed=${failed} chars=${chars}`);
if (failed > 0) process.exit(1);
