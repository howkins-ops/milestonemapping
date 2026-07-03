// Bake all Ride the Wave audio to public/audio/wave/<id>.mp3 via ElevenLabs.
// Voice lines use text-to-speech; ambient beds use the sound-effects API.
//
// Usage:
//   node scripts/bake-wave-audio.js            # bake everything missing
//   node scripts/bake-wave-audio.js --force    # re-bake even if the mp3 exists
//   node scripts/bake-wave-audio.js --only ocean-loop,v-ride
//
// Lines + prompts live in src/data/waveAudioManifest.js.
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadEnv, VOICES, generateSpeech } from './lib/eleven.js';
import { WAVE_VOICE_LINES, WAVE_AMBIENCE } from '../src/data/waveAudioManifest.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = resolve(ROOT, 'public', 'audio', 'wave');

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

// Sound-effects endpoint. Try the v2 model first (30s + seamless loops);
// older plans reject it, so fall back to v1 limits (≤22s, no loop flag).
async function generateSoundEffect({ text, seconds, loop }) {
  const attempt = async (body) => {
    const res = await fetch('https://api.elevenlabs.io/v1/sound-generation?output_format=mp3_44100_128', {
      method: 'POST',
      headers: { 'xi-api-key': apiKey, 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`ElevenLabs ${res.status}: ${await res.text()}`);
    return Buffer.from(await res.arrayBuffer());
  };
  try {
    return await attempt({
      text,
      model_id: 'eleven_text_to_sound_v2',
      duration_seconds: seconds,
      loop: !!loop,
      prompt_influence: 0.4,
    });
  } catch (err) {
    console.warn(`  … v2 sound model failed (${err.message.slice(0, 120)}), retrying with v1 limits`);
    return attempt({
      text,
      duration_seconds: Math.min(22, seconds),
      prompt_influence: 0.4,
    });
  }
}

let baked = 0;
let skipped = 0;
let failed = 0;

const jobs = [
  ...WAVE_AMBIENCE.map((a) => ({ ...a, kind: 'sfx' })),
  ...WAVE_VOICE_LINES.map((l) => ({ ...l, kind: 'voice' })),
];

for (const job of jobs) {
  if (only && !only.has(job.id)) continue;
  const outPath = resolve(OUT_DIR, `${job.id}.mp3`);
  if (!force && existsSync(outPath)) {
    skipped++;
    continue;
  }
  try {
    const buf = job.kind === 'sfx'
      ? await generateSoundEffect(job)
      : await generateSpeech({
          text: job.text,
          voiceId: VOICES[job.voice] || job.voice,
          apiKey,
          voiceSettings: job.delivery,
        });
    writeFileSync(outPath, buf);
    baked++;
    console.log(`✓ ${job.id} [${job.kind}] ${(buf.length / 1024).toFixed(0)}KB`);
  } catch (err) {
    failed++;
    console.error(`✗ ${job.id}: ${err.message}`);
  }
}

console.log(`\nDone. baked=${baked} skipped=${skipped} failed=${failed}`);
if (failed > 0) process.exit(1);
