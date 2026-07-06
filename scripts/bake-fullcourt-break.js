// Bake the Full Court locker-room break tracks into public/audio/fullcourt/.
// Run ONCE per approved voice; the mp3s are committed and reused free forever.
// Re-run only if you edit src/data/fullCourtBreakScript.js.
//
//   node scripts/bake-fullcourt-break.js --audition        # short sample per candidate voice — Jon picks
//   node scripts/bake-fullcourt-break.js                   # full 12-track bake (reset=sarah, coach=harry)
//   node scripts/bake-fullcourt-break.js --voice rachel --coach brian
//   node scripts/bake-fullcourt-break.js --music           # try Eleven Music for the two ambient beds
//
// Reset tracks bake slow + steady (meditation settings); hype tracks bake
// looser + hotter (coach settings). Both on eleven_multilingual_v2 — it
// honors <break time="Xs"/> tags, which the scripts rely on.
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadEnv, VOICES, generateSpeech } from './lib/eleven.js';
import { BREAK_TRACKS } from '../src/data/fullCourtBreakScript.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
loadEnv();
const apiKey = process.env.ELEVENLABS_API_KEY;
if (!apiKey) {
  console.error('✗ Missing ELEVENLABS_API_KEY in .env');
  process.exit(1);
}

const outDir = resolve(ROOT, 'public', 'audio', 'fullcourt');
mkdirSync(outDir, { recursive: true });

const args = process.argv.slice(2);
const flag = (name) => args.includes(`--${name}`);
const opt = (name, dflt) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] ? args[i + 1].toLowerCase() : dflt;
};

// Per-flavor generation settings (research 2026-07-06): meditation wants a
// locked, even read; the coach wants heat and swing.
const SETTINGS = {
  reset: { stability: 0.7, similarity_boost: 0.8, style: 0.1, use_speaker_boost: true, speed: 0.88 },
  hype: { stability: 0.4, similarity_boost: 0.8, style: 0.35, use_speaker_boost: true, speed: 1.02 },
};

const resetVoice = opt('voice', 'sarah');
const coachVoice = opt('coach', 'harry');
const voiceId = (key) => VOICES[key] || key; // registry name or raw voice_id

// Some accounts predate the voice_settings.speed knob — retry without it.
async function speak({ text, voice, flavor }) {
  const base = { text, voiceId: voiceId(voice), apiKey };
  try {
    return await generateSpeech({ ...base, voiceSettings: SETTINGS[flavor] });
  } catch (err) {
    if (!String(err).includes('speed')) throw err;
    const { speed, ...noSpeed } = SETTINGS[flavor];
    return generateSpeech({ ...base, voiceSettings: noSpeed });
  }
}

async function bakeFile(name, buf) {
  writeFileSync(resolve(outDir, name), buf);
  console.log(`✓ ${name} — ${(buf.length / 1024).toFixed(1)} KB`);
}

/* ---------------- audition mode ---------------- */

const AUDITION = {
  reset: {
    candidates: ['sarah', 'lily', 'rachel', 'matilda', 'jessica', 'alice'],
    line:
      'Quarter won. Feel that. Let your eyes rest… and see the next door. ' +
      'It is already opening. You are a closer — this day is yours. Next door. Go.',
  },
  hype: {
    candidates: ['harry', 'brian', 'george'],
    line:
      "THAT is what I'm talking about! You took that quarter and you OWNED it. " +
      "Momentum is a full tank — don't you dare park the car. Now get up. Let's GO!",
  },
};

async function runAudition() {
  let baked = 0;
  for (const flavor of ['reset', 'hype']) {
    const { candidates, line } = AUDITION[flavor];
    for (const v of candidates) {
      process.stdout.write(`Audition ${flavor} · ${v}… `);
      try {
        await bakeFile(`audition-${flavor}-${v}.mp3`, await speak({ text: line, voice: v, flavor }));
        baked += 1;
      } catch (err) {
        console.log(`✗ ${String(err).slice(0, 120)}`);
      }
    }
  }
  console.log(`\n✓ ${baked} auditions in public/audio/fullcourt/ — listen, pick one per flavor,`);
  console.log('  then run:  node scripts/bake-fullcourt-break.js --voice <name> --coach <name>');
}

/* ---------------- music beds (Eleven Music — paid plans) ---------------- */

const BEDS = [
  {
    name: 'bed-calm.mp3',
    prompt:
      'Warm ambient meditation pad, 55 bpm, soft evolving synth strings, no drums, ' +
      'no melody hooks, gentle and spacious, instrumental only',
  },
  {
    name: 'bed-hype.mp3',
    prompt:
      'Low cinematic locker room tension bed, distant stadium crowd ambience, slow heartbeat ' +
      'pulse around 60 bpm, dark warm synth drone, building quiet intensity, no melody, instrumental only',
  },
];

async function runMusic() {
  for (const bed of BEDS) {
    process.stdout.write(`Eleven Music · ${bed.name}… `);
    try {
      const res = await fetch('https://api.elevenlabs.io/v1/music?output_format=mp3_44100_128', {
        method: 'POST',
        headers: { 'xi-api-key': apiKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: bed.prompt, music_length_ms: 120000 }),
      });
      if (!res.ok) throw new Error(`ElevenLabs ${res.status}: ${(await res.text()).slice(0, 160)}`);
      await bakeFile(bed.name, Buffer.from(await res.arrayBuffer()));
    } catch (err) {
      console.log(`✗ ${String(err).slice(0, 160)}`);
      console.log('  (No bed baked — the game falls back to its WebAudio pad, which ships anyway.)');
    }
  }
}

/* ---------------- full bake ---------------- */

async function runFull() {
  console.log(`Reset voice : ${resetVoice} (${voiceId(resetVoice)})`);
  console.log(`Coach voice : ${coachVoice} (${voiceId(coachVoice)})\n`);
  let chars = 0;
  for (const track of BREAK_TRACKS) {
    const voice = track.flavor === 'hype' ? coachVoice : resetVoice;
    process.stdout.write(`Baking ${track.id} (${track.voiceText.length} chars)… `);
    await bakeFile(`${track.id}.mp3`, await speak({ text: track.voiceText, voice, flavor: track.flavor }));
    chars += track.voiceText.length;
  }
  console.log(`\n✓ Baked ${BREAK_TRACKS.length} tracks — ${chars} characters (~${chars} credits used).`);
}

if (flag('audition')) await runAudition();
else if (flag('music')) await runMusic();
else await runFull();
