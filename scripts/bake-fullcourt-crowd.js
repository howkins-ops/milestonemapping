// Bake FULL COURT's real crowd audio into public/audio/fullcourt/crowd/.
// These are ElevenLabs SOUND EFFECTS (not speech): 5 × 15s cheers, 4 × 15s
// hype chants, and short stingers (air horn, ref whistle). Run ONCE — the mp3s
// commit and reuse free forever. Re-run only if you edit a prompt in
// src/data/fullCourtCrowd.js.
//
//   node scripts/bake-fullcourt-crowd.js --audition   # short 3s sample of each track — approve the vibe first
//   node scripts/bake-fullcourt-crowd.js              # full bake (cheers + hype + stingers)
//   node scripts/bake-fullcourt-crowd.js --only cheer   # just the 5 cheers   (also: hype | stingers)
//   node scripts/bake-fullcourt-crowd.js --force        # re-bake even files that already exist
//
// Needs ELEVENLABS_API_KEY in .env. Sound generation runs on the text-to-sound
// endpoint; each call costs credits, so --audition (cheap 3s) is the smart first
// pass before committing to the full 15s set.
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadEnv, generateSound } from './lib/eleven.js';
import { CHEERS, HYPE, STINGERS, REACTS, AMBIENT } from '../src/data/fullCourtCrowd.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
loadEnv();
const apiKey = process.env.ELEVENLABS_API_KEY;
if (!apiKey) {
  console.error('✗ Missing ELEVENLABS_API_KEY in .env');
  process.exit(1);
}

const outDir = resolve(ROOT, 'public', 'audio', 'fullcourt', 'crowd');
mkdirSync(outDir, { recursive: true });

const args = process.argv.slice(2);
const flag = (name) => args.includes(`--${name}`);
const opt = (name, dflt) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] ? args[i + 1].toLowerCase() : dflt;
};

const audition = flag('audition');
const force = flag('force');
const only = opt('only', null); // cheer | hype | stingers

// Build the work list from the manifest, honoring --only.
let tracks = [];
if (!only || only === 'cheer' || only === 'cheers') tracks = tracks.concat(CHEERS);
if (!only || only === 'hype') tracks = tracks.concat(HYPE);
if (!only || only === 'stingers' || only === 'stinger') tracks = tracks.concat(STINGERS);
if (!only || only === 'react' || only === 'reacts') tracks = tracks.concat(REACTS);
if (!only || only === 'ambient' || only === 'bed') tracks = tracks.concat([AMBIENT]);
if (!tracks.length) {
  console.error(`✗ Nothing to bake for --only ${only}. Use: cheer | hype | stingers | react | ambient`);
  process.exit(1);
}

function bakeFile(name, buf) {
  writeFileSync(resolve(outDir, name), buf);
  console.log(`✓ ${name} — ${(buf.length / 1024).toFixed(1)} KB`);
}

console.log(
  `\n🏀📣 ${audition ? 'Auditioning' : 'Baking'} ${tracks.length} FULL COURT crowd track(s) → public/audio/fullcourt/crowd/\n`,
);

(async () => {
  let ok = 0;
  let skipped = 0;
  for (const t of tracks) {
    const name = `${t.id}.mp3`;
    if (!audition && !force && existsSync(resolve(outDir, name))) {
      console.log(`• ${name} — already baked, skipping (use --force to redo)`);
      skipped += 1;
      continue;
    }
    try {
      const seconds = audition ? 3 : t.secs;
      const buf = await generateSound({
        prompt: t.prompt,
        seconds,
        influence: t.influence ?? 0.4,
        apiKey,
      });
      bakeFile(audition ? `_audition-${t.id}.mp3` : name, buf);
      ok += 1;
    } catch (e) {
      console.error(`✗ ${t.id}: ${String(e).slice(0, 160)}`);
    }
  }
  const total = tracks.length - skipped;
  console.log(
    `\nDone — ${ok}/${total} ${audition ? 'auditions' : 'tracks'} written${skipped ? `, ${skipped} already present` : ''}.` +
      (audition ? '\nListen to public/audio/fullcourt/crowd/_audition-*.mp3, then run without --audition.\n' : '\n'),
  );
})();
