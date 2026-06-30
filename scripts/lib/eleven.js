// Shared ElevenLabs helpers for build-time audio generation (Node, not the browser).
// Reads ELEVENLABS_API_KEY from .env. Used by scripts/tts.js and scripts/bake-*.js.
import { readFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');

// Minimal .env loader so we don't need a dotenv dependency.
export function loadEnv() {
  const p = resolve(ROOT, '.env');
  if (!existsSync(p)) return;
  for (const line of readFileSync(p, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}

// Named voice registry for this project. Pass a name (or a raw voice_id) to the tools.
export const VOICES = {
  clara:  'R8MYc5Q5y0TurlOQoX88', // British, breathy & meditative (LIBRARY voice — needs a PAID plan for API use)
  lily:   'pFZP5JQG7iQjIQuC4Bku', // British, velvety actress (PREMADE — works on the free tier)
  alice:  'Xb7hH8MSUJpSbSDYk0k2', // British, clear educator (PREMADE — free tier)
  george: 'JBFqnCBsd6RMkjVDRZzb', // Warm storyteller
  brian:  'nPczCjzI2devNBz1zQrb', // Deep, resonant
  river:  'SAz9YHcvj6GT2YYXdXww', // Calm neutral
  callum: 'N2lVS1w4EtoT3dr4eOWO', // Husky trickster
  harry:  'SOYHLrjzK2X1ezoPC6cr', // Fierce warrior
  sarah:  'EXAVITQu4vr4xnSDxMaL', // Reassuring female
};

// Generate speech and return an mp3 Buffer. Throws on API error.
export async function generateSpeech({
  text,
  voiceId,
  model = 'eleven_multilingual_v2',
  format = 'mp3_44100_128',
  apiKey,
}) {
  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=${format}`,
    {
      method: 'POST',
      headers: { 'xi-api-key': apiKey, 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
      body: JSON.stringify({
        text,
        model_id: model,
        voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0, use_speaker_boost: true },
      }),
    },
  );
  if (!res.ok) throw new Error(`ElevenLabs ${res.status}: ${await res.text()}`);
  return Buffer.from(await res.arrayBuffer());
}
