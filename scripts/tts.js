// ElevenLabs text-to-speech generator → writes public/audio/<name>.mp3
// Server/script use only. Reads ELEVENLABS_API_KEY from .env (never bundled into the browser).
//
// Usage:
//   node scripts/tts.js --voice clara  --out alchemist-intro --text "Welcome, seeker."
//   node scripts/tts.js --voice george --out ch1 --file scripts/lines/ch1.txt
//   node scripts/tts.js --voice R8MYc5Q5y0TurlOQoX88 --out raw --text "..."   (raw voice_id also works)
//
// Flags: --voice (name or id)  --out (filename, no ext)  --text "..."  --file path.txt
//        --model (default eleven_multilingual_v2)  --format (default mp3_44100_128)

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadEnv, VOICES, generateSpeech } from './lib/eleven.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
loadEnv();
const apiKey = process.env.ELEVENLABS_API_KEY;
if (!apiKey) {
  console.error('✗ Missing ELEVENLABS_API_KEY in .env');
  process.exit(1);
}

const arg = (name, def) => {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : def;
};

const voiceKey = (arg('voice', 'clara') || '').toLowerCase();
const voiceId = VOICES[voiceKey] || arg('voice'); // fall back to a raw voice_id
const model = arg('model', 'eleven_multilingual_v2');
const format = arg('format', 'mp3_44100_128');
const outName = arg('out', 'output');
const file = arg('file', null);
const text = (file ? readFileSync(resolve(ROOT, file), 'utf8') : arg('text', '')).trim();

if (!text) {
  console.error('✗ Provide --text "..." or --file path.txt');
  process.exit(1);
}

const outDir = resolve(ROOT, 'public', 'audio');
mkdirSync(outDir, { recursive: true });

console.log(`Voice : ${voiceKey} (${voiceId})`);
console.log(`Model : ${model}`);
console.log(`Chars : ${text.length}`);

try {
  const buf = await generateSpeech({ text, voiceId, model, format, apiKey });
  writeFileSync(resolve(outDir, `${outName}.mp3`), buf);
  console.log(`✓ Wrote public/audio/${outName}.mp3  (${(buf.length / 1024).toFixed(1)} KB)`);
} catch (e) {
  console.error(`✗ ${e.message}`);
  process.exit(1);
}
