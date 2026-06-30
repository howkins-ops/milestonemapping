// Pre-bake the Vision Meditation narration into public/audio/vision-med-<id>.mp3.
// Run ONCE; the mp3s are committed and reused free forever.
// Re-run only if you edit the lines in src/data/visionMeditationScript.js.
//
//   node scripts/bake-vision-meditation.js                 # default voice (lily, free tier)
//   node scripts/bake-vision-meditation.js --voice clara   # needs a PAID plan (library voice)
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadEnv, VOICES, generateSpeech } from './lib/eleven.js';
import { VISION_MEDITATION_LINES } from '../src/data/visionMeditationScript.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
loadEnv();
const apiKey = process.env.ELEVENLABS_API_KEY;
if (!apiKey) {
  console.error('✗ Missing ELEVENLABS_API_KEY in .env');
  process.exit(1);
}

// --voice lily (free, default) | clara (paid) | any registry name or raw voice_id
const vi = process.argv.indexOf('--voice');
const voiceKey = (vi >= 0 ? process.argv[vi + 1] : 'lily').toLowerCase();
const voiceId = VOICES[voiceKey] || (vi >= 0 ? process.argv[vi + 1] : VOICES.lily);
console.log(`Voice : ${voiceKey} (${voiceId})\n`);

const outDir = resolve(ROOT, 'public', 'audio');
mkdirSync(outDir, { recursive: true });

let chars = 0;
for (const line of VISION_MEDITATION_LINES) {
  process.stdout.write(`Baking vision-med-${line.id} (${line.text.length} chars)… `);
  const buf = await generateSpeech({ text: line.text, voiceId, apiKey });
  writeFileSync(resolve(outDir, `vision-med-${line.id}.mp3`), buf);
  chars += line.text.length;
  console.log(`✓ ${(buf.length / 1024).toFixed(1)} KB`);
}
console.log(`\n✓ Baked ${VISION_MEDITATION_LINES.length} lines — ${chars} characters (~${chars} credits used).`);
