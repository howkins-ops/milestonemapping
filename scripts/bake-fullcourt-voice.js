// Bake the Full Court TWO-VOICE cast into public/audio/fullcourt/voice/.
// Run ONCE per approved voice; the mp3s commit and reuse free forever. Re-run
// only if you edit the coach lines in src/data/fullCourtVoice.js.
//
//   node scripts/bake-fullcourt-voice.js --audition   # short sample from each voice — Jon approves first
//   node scripts/bake-fullcourt-voice.js              # full bake (coach=alex, announcer=andrew from the registry)
//   node scripts/bake-fullcourt-voice.js --coach brian --announcer george
//
// COACH  = Alex — Basketball Coach (motivation + affirmations). The static
//          coach pool bakes here; the runtime streams the same lines as a
//          fallback until these mp3s land, and streams them live regardless
//          when a baked file is missing.
// ANNOUNCER = Andrew Griffin — Commentator. His copy is DYNAMIC (real numbers),
//          so it is NOT baked — it always streams. This bake only samples his
//          voice in --audition so Jon can approve the pick.
//
// Before a real bake: paste the true ElevenLabs voice_id for `alex` and
// `andrew` into scripts/lib/eleven.js (they currently point at proven premade
// male fallbacks so this script always runs).
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadEnv, VOICES, generateSpeech } from './lib/eleven.js';
import { coachBakeManifest } from '../src/data/fullCourtVoice.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
loadEnv();
const apiKey = process.env.ELEVENLABS_API_KEY;
if (!apiKey) {
  console.error('✗ Missing ELEVENLABS_API_KEY in .env');
  process.exit(1);
}

const outDir = resolve(ROOT, 'public', 'audio', 'fullcourt', 'voice');
mkdirSync(outDir, { recursive: true });

const args = process.argv.slice(2);
const flag = (name) => args.includes(`--${name}`);
const opt = (name, dflt) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] ? args[i + 1].toLowerCase() : dflt;
};

// Coach = punchy, confident, a little swing. Announcer = broadcast energy.
const SETTINGS = {
  coach: { stability: 0.42, similarity_boost: 0.8, style: 0.4, use_speaker_boost: true, speed: 1.03 },
  announcer: { stability: 0.5, similarity_boost: 0.82, style: 0.5, use_speaker_boost: true, speed: 1.06 },
};

const coachVoice = opt('coach', 'alex');
const announcerVoice = opt('announcer', 'andrew');
const voiceId = (key) => VOICES[key] || key;

async function speak({ text, voice, kind }) {
  const base = { text, voiceId: voiceId(voice), apiKey };
  try {
    return await generateSpeech({ ...base, voiceSettings: SETTINGS[kind] });
  } catch (err) {
    if (!String(err).includes('speed')) throw err;
    const { speed, ...noSpeed } = SETTINGS[kind];
    return generateSpeech({ ...base, voiceSettings: noSpeed });
  }
}

async function bakeFile(name, buf) {
  writeFileSync(resolve(outDir, name), buf);
  console.log(`✓ ${name} — ${(buf.length / 1024).toFixed(1)} KB`);
}

/* ---------------- audition ---------------- */

if (flag('audition')) {
  const coachSample = "That door wasn't yours. The next one is. Keep knocking — the math owes you.";
  const announcerSample =
    "End of the third. Nineteen doors worked, two sales on the board. Running total: forty on the scoreboard.";
  const coachCandidates = ['alex', 'brian', 'marcus', 'george'];
  const announcerCandidates = ['andrew', 'george', 'brian'];
  console.log('\n🎧 Auditioning the two-voice cast…\n');
  (async () => {
    for (const v of coachCandidates) {
      try {
        await bakeFile(`_audition-coach-${v}.mp3`, await speak({ text: coachSample, voice: v, kind: 'coach' }));
      } catch (e) {
        console.error(`✗ coach ${v}: ${String(e).slice(0, 120)}`);
      }
    }
    for (const v of announcerCandidates) {
      try {
        await bakeFile(`_audition-announcer-${v}.mp3`, await speak({ text: announcerSample, voice: v, kind: 'announcer' }));
      } catch (e) {
        console.error(`✗ announcer ${v}: ${String(e).slice(0, 120)}`);
      }
    }
    console.log('\nListen in public/audio/fullcourt/voice/_audition-*.mp3, then set the winners in scripts/lib/eleven.js.\n');
  })();
} else {
  /* ---------------- full coach-pool bake ---------------- */
  const manifest = coachBakeManifest();
  console.log(`\n🏀 Baking ${manifest.length} coach lines — voice: ${coachVoice} (${voiceId(coachVoice)})`);
  console.log(`   (announcer "${announcerVoice}" streams live; nothing to bake there.)\n`);
  (async () => {
    let ok = 0;
    for (const line of manifest) {
      try {
        await bakeFile(`${line.id}.mp3`, await speak({ text: line.text, voice: coachVoice, kind: 'coach' }));
        ok += 1;
      } catch (e) {
        console.error(`✗ ${line.id}: ${String(e).slice(0, 120)}`);
      }
    }
    console.log(`\nDone — ${ok}/${manifest.length} coach clips in public/audio/fullcourt/voice/.\n`);
  })();
}
