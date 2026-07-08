// Big game SFX via the Web Audio API — impacts, storms, fire, water, voices.
// Same philosophy as sounds.js: zero asset files, always fails silently.
// Everything routes through a shared compressor bus so stacked BAMs stay loud
// without clipping. Voice lines are baked mp3s under /audio/anger/ and /audio/cup/.
import { CUP_VOICE_LINES } from "../data/cupVoiceLines.js";

let ctx = null;
let bus = null;
let enabled = true;

// Persisted mute — the Arena's own sound toggle. Survives reloads via
// localStorage; independent of the per-game settings.soundEnabled mirror.
const MUTE_KEY = "zone_sfx_muted";
const muteListeners = new Set();
try {
  if (typeof localStorage !== "undefined" && localStorage.getItem(MUTE_KEY) === "1") {
    enabled = false;
  }
} catch { /* storage blocked → default on */ }

// Global kill-switch mirrored from settings.soundEnabled (games call setSfxEnabled
// once from their hub; individual calls can also pass settings like sounds.js).
export function setSfxEnabled(v) {
  enabled = v !== false;
}

// ---- persisted mute toggle (Arena sound control) ----
export function isSfxMuted() {
  return !enabled;
}
export function setSfxMuted(muted) {
  enabled = !muted;
  try {
    if (typeof localStorage !== "undefined") localStorage.setItem(MUTE_KEY, muted ? "1" : "0");
  } catch { /* silent */ }
  muteListeners.forEach((fn) => { try { fn(!enabled); } catch { /* silent */ } });
}
// Flip mute; returns the new muted state. Also nudges the AudioContext awake so
// the first post-unmute sound isn't swallowed by the autoplay policy.
export function toggleSfxMute() {
  const nextMuted = enabled; // currently on → we're about to mute
  setSfxMuted(nextMuted);
  if (!nextMuted) getCtx();
  return nextMuted;
}
// Subscribe to mute changes (for a toggle button's live state). Returns an
// unsubscribe fn.
export function onSfxMuteChange(fn) {
  muteListeners.add(fn);
  return () => muteListeners.delete(fn);
}

function getCtx() {
  if (typeof window === "undefined") return null;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  if (!ctx) {
    try {
      ctx = new Ctx();
      bus = ctx.createDynamicsCompressor();
      bus.threshold.value = -18;
      bus.knee.value = 12;
      bus.ratio.value = 6;
      bus.attack.value = 0.002;
      bus.release.value = 0.18;
      bus.connect(ctx.destination);
    } catch {
      return null;
    }
  }
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  return ctx;
}

function ok(settings) {
  if (!enabled) return null;
  if (settings && settings.soundEnabled === false) return null;
  return getCtx();
}

// ---------- building blocks ----------

let noiseBuf = null;
function noise(c) {
  if (!noiseBuf || noiseBuf.sampleRate !== c.sampleRate) {
    noiseBuf = c.createBuffer(1, c.sampleRate * 2, c.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const src = c.createBufferSource();
  src.buffer = noiseBuf;
  src.loop = true;
  return src;
}

function env(c, { gain = 0.2, attack = 0.005, duration = 0.2, start = 0 }) {
  const g = c.createGain();
  const t = c.currentTime + start;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain), t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + duration);
  return g;
}

// Sub-bass "punch you in the chest" drop: sine pitch-falls into the floor.
function subDrop(c, { from = 130, to = 38, duration = 0.3, gain = 0.5, start = 0 }) {
  const o = c.createOscillator();
  const t = c.currentTime + start;
  o.type = "sine";
  o.frequency.setValueAtTime(from, t);
  o.frequency.exponentialRampToValueAtTime(to, t + duration);
  const g = env(c, { gain, attack: 0.004, duration, start });
  o.connect(g).connect(bus);
  o.start(t);
  o.stop(t + duration + 0.05);
}

// Filtered noise burst — the "crack" layer of every hit.
function crack(c, { hp = 300, lp = 6000, duration = 0.12, gain = 0.3, start = 0 }) {
  const src = noise(c);
  const hpF = c.createBiquadFilter();
  hpF.type = "highpass";
  hpF.frequency.value = hp;
  const lpF = c.createBiquadFilter();
  lpF.type = "lowpass";
  lpF.frequency.value = lp;
  const g = env(c, { gain, attack: 0.002, duration, start });
  src.connect(hpF).connect(lpF).connect(g).connect(bus);
  const t = c.currentTime + start;
  src.start(t);
  src.stop(t + duration + 0.05);
}

function blip(c, { from = 300, to = 600, duration = 0.1, type = "sine", gain = 0.1, start = 0 }) {
  const o = c.createOscillator();
  const t = c.currentTime + start;
  o.type = type;
  o.frequency.setValueAtTime(from, t);
  o.frequency.exponentialRampToValueAtTime(Math.max(20, to), t + duration);
  const g = env(c, { gain, duration, start });
  o.connect(g).connect(bus);
  o.start(t);
  o.stop(t + duration + 0.05);
}

// ---------- one-shots ----------

// Door knock. level 1–8 scales from polite tap to fist-through-wood.
export function sfxKnock(level = 1, settings) {
  try {
    const c = ok(settings);
    if (!c) return;
    const n = Math.max(1, Math.min(8, level));
    const g = 0.16 + n * 0.09;
    subDrop(c, { from: 110 + n * 8, to: 45, duration: 0.14 + n * 0.015, gain: g });
    crack(c, { hp: 500, lp: 3200 + n * 500, duration: 0.05 + n * 0.01, gain: g * 0.7 });
  } catch { /* silent */ }
}

// The BAM. level 1–8: progressively louder, deeper, nastier. 7–8 are the
// midnight WHAMs — the compressor bus is what keeps them from clipping.
export function sfxImpact(level = 1, settings) {
  try {
    const c = ok(settings);
    if (!c) return;
    const n = Math.max(1, Math.min(8, level));
    const g = 0.25 + n * 0.12;
    subDrop(c, { from: 150, to: 34, duration: 0.26 + n * 0.04, gain: g });
    crack(c, { hp: 200, lp: 7000, duration: 0.1 + n * 0.02, gain: g * 0.8 });
    if (n >= 3) crack(c, { hp: 80, lp: 900, duration: 0.3, gain: g * 0.5, start: 0.02 });
    if (n >= 4) subDrop(c, { from: 90, to: 28, duration: 0.5, gain: g * 0.6, start: 0.04 });
    if (n >= 5) blip(c, { from: 2400, to: 300, duration: 0.09, type: "sawtooth", gain: 0.1 });
    if (n >= 7) {
      // the whole doorframe resonates
      subDrop(c, { from: 60, to: 22, duration: 0.7, gain: g * 0.7, start: 0.06 });
      crack(c, { hp: 50, lp: 400, duration: 0.55, gain: g * 0.55, start: 0.05 });
    }
  } catch { /* silent */ }
}

// Doorbell: two-tone ding-dong. rushed=true clips it short for angry spam.
export function sfxDoorbell(rushed = false, settings) {
  try {
    const c = ok(settings);
    if (!c) return;
    const d1 = rushed ? 0.16 : 0.34;
    const d2 = rushed ? 0.2 : 0.5;
    blip(c, { from: 659.25, to: 659.25, duration: d1, type: "triangle", gain: 0.22 });
    blip(c, { from: 659.25 * 2, to: 659.25 * 2, duration: d1 * 0.7, type: "sine", gain: 0.06 });
    blip(c, { from: 523.25, to: 523.25, duration: d2, type: "triangle", gain: 0.2, start: rushed ? 0.09 : 0.22 });
    blip(c, { from: 523.25 * 2, to: 523.25 * 2, duration: d2 * 0.7, type: "sine", gain: 0.05, start: rushed ? 0.09 : 0.22 });
  } catch { /* silent */ }
}

// Boxing round bell — DING DING DING.
export function sfxRoundBell(settings) {
  try {
    const c = ok(settings);
    if (!c) return;
    for (let i = 0; i < 3; i++) {
      blip(c, { from: 1975, to: 1975, duration: 0.28, type: "square", gain: 0.09, start: i * 0.22 });
      blip(c, { from: 2960, to: 2960, duration: 0.2, type: "sine", gain: 0.05, start: i * 0.22 });
    }
  } catch { /* silent */ }
}

// A landed punch — meaty smack + sub thump. level 1–3 (chip / clean / haymaker).
export function sfxPunch(level = 2, settings) {
  try {
    const c = ok(settings);
    if (!c) return;
    const n = Math.max(1, Math.min(3, level));
    crack(c, { hp: 300, lp: 2200 + n * 1400, duration: 0.06 + n * 0.02, gain: 0.2 + n * 0.14 });
    subDrop(c, { from: 120 + n * 20, to: 40, duration: 0.12 + n * 0.05, gain: 0.18 + n * 0.14 });
    if (n >= 3) crack(c, { hp: 90, lp: 700, duration: 0.24, gain: 0.3, start: 0.02 });
  } catch { /* silent */ }
}

// A blocked punch — dull knock on a guard.
export function sfxBlock(settings) {
  try {
    const c = ok(settings);
    if (!c) return;
    crack(c, { hp: 150, lp: 900, duration: 0.07, gain: 0.22 });
    blip(c, { from: 220, to: 120, duration: 0.08, type: "square", gain: 0.06 });
  } catch { /* silent */ }
}

// Wood splintering — layered resonant snaps.
export function sfxWoodCrack(settings) {
  try {
    const c = ok(settings);
    if (!c) return;
    crack(c, { hp: 900, lp: 5000, duration: 0.08, gain: 0.4 });
    crack(c, { hp: 600, lp: 3000, duration: 0.12, gain: 0.35, start: 0.05 });
    crack(c, { hp: 1400, lp: 7000, duration: 0.06, gain: 0.3, start: 0.11 });
    blip(c, { from: 800, to: 180, duration: 0.1, type: "square", gain: 0.07, start: 0.03 });
  } catch { /* silent */ }
}

// Door breaks off its hinges: everything at once + echo tail.
export function sfxDoorBreak(settings) {
  try {
    const c = ok(settings);
    if (!c) return;
    sfxImpact(6, settings);
    sfxWoodCrack(settings);
    crack(c, { hp: 60, lp: 500, duration: 0.9, gain: 0.35, start: 0.1 });
    subDrop(c, { from: 70, to: 26, duration: 0.8, gain: 0.4, start: 0.12 });
  } catch { /* silent */ }
}

export function sfxWhoosh(settings) {
  try {
    const c = ok(settings);
    if (!c) return;
    const src = noise(c);
    const f = c.createBiquadFilter();
    f.type = "bandpass";
    f.Q.value = 1.2;
    const t = c.currentTime;
    f.frequency.setValueAtTime(320, t);
    f.frequency.exponentialRampToValueAtTime(3200, t + 0.22);
    const g = env(c, { gain: 0.25, attack: 0.04, duration: 0.26 });
    src.connect(f).connect(g).connect(bus);
    src.start(t);
    src.stop(t + 0.3);
  } catch { /* silent */ }
}

// Glass-ish shatter for smashed objections.
export function sfxShatter(settings) {
  try {
    const c = ok(settings);
    if (!c) return;
    crack(c, { hp: 2500, lp: 9000, duration: 0.16, gain: 0.3 });
    for (let i = 0; i < 7; i++) {
      blip(c, {
        from: 2200 + ((i * 977) % 3800),
        to: 1400 + ((i * 613) % 2600),
        duration: 0.05 + (i % 3) * 0.03,
        type: "triangle",
        gain: 0.05,
        start: 0.01 + i * 0.024,
      });
    }
  } catch { /* silent */ }
}

// Thunder. intensity 1–5.
export function sfxThunder(intensity = 3, settings) {
  try {
    const c = ok(settings);
    if (!c) return;
    const n = Math.max(1, Math.min(5, intensity));
    const g = 0.2 + n * 0.1;
    crack(c, { hp: 800, lp: 6000, duration: 0.1, gain: g * 0.7 });
    crack(c, { hp: 40, lp: 160 + n * 60, duration: 1.2 + n * 0.35, gain: g });
    subDrop(c, { from: 80, to: 24, duration: 1.0 + n * 0.3, gain: g * 0.7, start: 0.05 });
  } catch { /* silent */ }
}

export function sfxZap(settings) {
  try {
    const c = ok(settings);
    if (!c) return;
    blip(c, { from: 3200, to: 160, duration: 0.09, type: "sawtooth", gain: 0.14 });
    crack(c, { hp: 1800, lp: 9000, duration: 0.05, gain: 0.2 });
  } catch { /* silent */ }
}

// Foghorn roar — the ship yelling back at the storm. power 0–1.
export function sfxHorn(power = 1, settings) {
  try {
    const c = ok(settings);
    if (!c) return;
    const p = Math.max(0.2, Math.min(1, power));
    const dur = 0.5 + p * 0.7;
    [110, 165].forEach((f, i) => {
      const o = c.createOscillator();
      o.type = "sawtooth";
      o.frequency.value = f;
      const lp = c.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 600 + p * 900;
      const g = env(c, { gain: (0.22 + p * 0.2) / (i + 1), attack: 0.06, duration: dur });
      o.connect(lp).connect(g).connect(bus);
      o.start(c.currentTime);
      o.stop(c.currentTime + dur + 0.05);
    });
    subDrop(c, { from: 70, to: 40, duration: dur, gain: 0.3 * p });
  } catch { /* silent */ }
}

// Match strike for the burn ritual.
export function sfxMatchStrike(settings) {
  try {
    const c = ok(settings);
    if (!c) return;
    crack(c, { hp: 1200, lp: 8000, duration: 0.14, gain: 0.22 });
    crack(c, { hp: 600, lp: 4000, duration: 0.4, gain: 0.12, start: 0.1 });
  } catch { /* silent */ }
}

// Fire catches: airy whoomp.
export function sfxIgnite(settings) {
  try {
    const c = ok(settings);
    if (!c) return;
    const src = noise(c);
    const f = c.createBiquadFilter();
    f.type = "lowpass";
    const t = c.currentTime;
    f.frequency.setValueAtTime(220, t);
    f.frequency.exponentialRampToValueAtTime(2400, t + 0.28);
    const g = env(c, { gain: 0.4, attack: 0.09, duration: 0.55 });
    src.connect(f).connect(g).connect(bus);
    src.start(t);
    src.stop(t + 0.6);
    subDrop(c, { from: 120, to: 50, duration: 0.4, gain: 0.2, start: 0.05 });
  } catch { /* silent */ }
}

// Wet splat — an emotion hitting the swamp.
export function sfxSplat(settings) {
  try {
    const c = ok(settings);
    if (!c) return;
    crack(c, { hp: 100, lp: 1200, duration: 0.12, gain: 0.35 });
    blip(c, { from: 420, to: 90, duration: 0.16, type: "sine", gain: 0.16, start: 0.01 });
    for (let i = 0; i < 4; i++) {
      blip(c, { from: 500 + i * 180, to: 900 + i * 220, duration: 0.05, gain: 0.04, start: 0.09 + i * 0.05 });
    }
  } catch { /* silent */ }
}

export function sfxBubble(settings) {
  try {
    const c = ok(settings);
    if (!c) return;
    blip(c, { from: 180 + Math.floor(Math.random() * 120), to: 700, duration: 0.09, gain: 0.07 });
  } catch { /* silent */ }
}

// Rainbow reveal: shimmering pentatonic cascade.
export function sfxRainbow(settings) {
  try {
    const c = ok(settings);
    if (!c) return;
    const notes = [523.25, 659.25, 783.99, 880, 1046.5, 1318.5, 1568];
    notes.forEach((f, i) => {
      blip(c, { from: f, to: f * 1.002, duration: 0.5, type: "sine", gain: 0.09, start: i * 0.09 });
      blip(c, { from: f * 2, to: f * 2, duration: 0.35, type: "triangle", gain: 0.03, start: i * 0.09 + 0.02 });
    });
    crack(c, { hp: 5000, lp: 12000, duration: 0.9, gain: 0.05, start: 0.1 });
  } catch { /* silent */ }
}

// ═══════════ FILL YOUR CUP (well-being) ═══════════

// Water pouring into the cup on every habit checked — a soft liquid rush plus
// a run of glugs whose pitch CLIMBS with the fill level, exactly like water
// filling a real glass (the air column above the water shortens, so its
// resonance rises). pct = the new fill % after this pour (0..100).
export function sfxCupPour(pct = 0, settings) {
  try {
    const c = ok(settings);
    if (!c) return;
    const t = c.currentTime;
    const p = Math.max(0, Math.min(100, pct)) / 100;
    // liquid rush — bandpassed noise stream, brightens as the cup fills
    const src = noise(c);
    const bp = c.createBiquadFilter();
    bp.type = "bandpass";
    bp.Q.value = 0.7;
    const f0 = 600 + p * 900;
    bp.frequency.setValueAtTime(f0, t);
    bp.frequency.exponentialRampToValueAtTime(f0 * 1.5, t + 0.34);
    const g = env(c, { gain: 0.13, attack: 0.03, duration: 0.4 });
    src.connect(bp).connect(g).connect(bus);
    src.start(t);
    src.stop(t + 0.46);
    // filling glugs — a few sine "bloops" rising in pitch with the water level
    const glugBase = 260 + p * 520;
    for (let i = 0; i < 3; i += 1) {
      const st = t + 0.02 + i * 0.09;
      const gf = glugBase * (1 + i * 0.12);
      const o = c.createOscillator();
      o.type = "sine";
      o.frequency.setValueAtTime(gf * 0.7, st);
      o.frequency.exponentialRampToValueAtTime(gf, st + 0.08);
      const og = c.createGain();
      og.gain.setValueAtTime(0.0001, st);
      og.gain.exponentialRampToValueAtTime(0.09, st + 0.02);
      og.gain.exponentialRampToValueAtTime(0.0001, st + 0.12);
      o.connect(og).connect(bus);
      o.start(st);
      o.stop(st + 0.16);
    }
    // tiny top-off droplet
    blip(c, { from: 900 + p * 700, to: 1600 + p * 700, duration: 0.06, type: "sine", gain: 0.05, start: 0.3 });
  } catch { /* silent */ }
}

// Drinking it down — three satisfying gulps descending, then a soft "ahh" sigh
// of air. Pairs with the spoken affirmation (speakRefreshed) after the gulps.
export function sfxCupDrink(settings) {
  try {
    const c = ok(settings);
    if (!c) return;
    const t = c.currentTime;
    // gulp · gulp · gulp — descending sine drops with a wet body tap
    for (let i = 0; i < 3; i += 1) {
      const st = t + i * 0.22;
      const f = 300 - i * 55;
      const o = c.createOscillator();
      o.type = "sine";
      o.frequency.setValueAtTime(f + 180, st);
      o.frequency.exponentialRampToValueAtTime(f, st + 0.1);
      const og = c.createGain();
      og.gain.setValueAtTime(0.0001, st);
      og.gain.exponentialRampToValueAtTime(0.16, st + 0.02);
      og.gain.exponentialRampToValueAtTime(0.0001, st + 0.16);
      o.connect(og).connect(bus);
      o.start(st);
      o.stop(st + 0.2);
      crack(c, { hp: 200, lp: 1400, duration: 0.05, gain: 0.06, start: i * 0.22 });
    }
    // contented "ahh" breath after the last gulp
    const st = t + 0.72;
    const src = noise(c);
    const f = c.createBiquadFilter();
    f.type = "bandpass";
    f.Q.value = 1.4;
    f.frequency.setValueAtTime(900, st);
    f.frequency.exponentialRampToValueAtTime(1400, st + 0.5);
    const g = env(c, { gain: 0.06, attack: 0.12, duration: 0.6, start: 0.72 });
    src.connect(f).connect(g).connect(bus);
    src.start(st);
    src.stop(st + 0.7);
  } catch { /* silent */ }
}

// Spoken affirmation after drinking the cup — a fun, warm woman's voice baked
// with ElevenLabs (public/audio/cup/<id>.mp3). Picks a random line; if the mp3
// is missing (not baked yet) it falls back to the device's built-in voice with
// the same text so it's never silent.
export function speakRefreshed(settings) {
  try {
    if (!enabled) return;
    if (settings && settings.soundEnabled === false) return;
    if (typeof window === "undefined" || typeof Audio === "undefined") return;
    const line = CUP_VOICE_LINES[Math.floor(Math.random() * CUP_VOICE_LINES.length)];
    const a = new Audio(`/audio/cup/${line.id}.mp3`);
    a.volume = 1;
    a.onerror = () => speakRefreshedSynth(line.text);
    const p = a.play();
    if (p && typeof p.catch === "function") p.catch(() => speakRefreshedSynth(line.text));
  } catch { /* silent */ }
}

function speakRefreshedSynth(text) {
  try {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.98;
    u.pitch = 1.15; // nudge brighter/higher for a woman's tone on the fallback
    u.volume = 1;
    const voices = window.speechSynthesis.getVoices() || [];
    const pick =
      voices.find((v) => /samantha|victoria|zira|female|woman/i.test(v.name)) ||
      voices.find((v) => v.lang && v.lang.toLowerCase().startsWith("en"));
    if (pick) u.voice = pick;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  } catch { /* silent */ }
}

// ═══════════ FULL COURT — real baked crowd samples ═══════════
// The cheers + hype chants are real ElevenLabs sound-effect mp3s under
// /audio/fullcourt/crowd/. They play through a single shared "big track"
// channel so a new one always replaces the last (a landed SALE erupts the
// crowd; the GET LOUD button fires a hype chant). Stingers (air horn, whistle)
// are transient one-shots on their own element so they never cut the channel.
// Everything respects the Arena mute + per-game soundEnabled, and falls back to
// the synth crowd roar if an mp3 is missing — so it is never silent.
let crowdEl = null;

export function stopCrowd() {
  try {
    if (crowdEl) {
      crowdEl.pause();
      crowdEl.currentTime = 0;
    }
  } catch { /* silent */ }
  crowdEl = null;
}

// Internal: play one mp3, returning a { stop } handle. `shared` routes through
// the crowd channel (replaces whatever's playing); one-shots pass shared:false.
function playSample(src, { volume = 0.9, settings, fallback, shared = true } = {}) {
  const fall = () => {
    try {
      if (fallback) fallback(settings);
    } catch { /* silent */ }
  };
  try {
    if (!enabled) return null;
    if (settings && settings.soundEnabled === false) return null;
    if (typeof Audio === "undefined") return null;
    getCtx(); // nudge the autoplay policy awake so the first sample isn't swallowed
    if (shared) stopCrowd();
    const a = new Audio(src);
    a.volume = Math.max(0, Math.min(1, volume));
    if (shared) crowdEl = a;
    let fell = false;
    const guard = () => {
      if (fell) return;
      fell = true;
      fall();
    };
    a.onerror = guard;
    const p = a.play();
    if (p && typeof p.catch === "function") p.catch(guard);
    return {
      stop() {
        try { a.pause(); } catch { /* silent */ }
        if (crowdEl === a) crowdEl = null;
      },
    };
  } catch {
    fall();
    return null;
  }
}

// A 15s crowd eruption / hype chant on the shared channel. Pass the mp3 path
// (from fullCourtCrowd.crowdAudioPath) and a fallback (usually sfxCrowdRoar).
export function playCrowdSample(src, opts = {}) {
  return playSample(src, { volume: 0.92, shared: true, ...opts });
}

// A short real-game stinger (air horn, ref whistle) — transient, never touches
// the crowd channel, so it can punctuate a roar without cutting it.
export function playArenaStinger(src, opts = {}) {
  return playSample(src, { volume: 0.85, shared: false, ...opts });
}

// ---------- arena one-shots ----------

// The game buzzer — end-of-quarter / end-of-game horn. Harsh dissonant
// sawtooth pair with a fast amplitude buzz, capped by the compressor bus.
export function sfxBuzzer(settings) {
  try {
    const c = ok(settings);
    if (!c) return;
    const dur = 0.72;
    const t = c.currentTime;
    [196, 233].forEach((f, i) => {
      const o = c.createOscillator();
      o.type = "sawtooth";
      o.frequency.value = f;
      const lp = c.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 1500;
      const g = c.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.24 / (i + 1), t + 0.02);
      g.gain.setValueAtTime(0.24 / (i + 1), t + dur - 0.05);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      // fast square LFO on the gain = the "bzzzt" grit
      const lfo = c.createOscillator();
      lfo.type = "square";
      lfo.frequency.value = 24;
      const lfoGain = c.createGain();
      lfoGain.gain.value = 0.09 / (i + 1);
      lfo.connect(lfoGain).connect(g.gain);
      o.connect(lp).connect(g).connect(bus);
      o.start(t);
      o.stop(t + dur + 0.05);
      lfo.start(t);
      lfo.stop(t + dur + 0.05);
    });
    subDrop(c, { from: 92, to: 70, duration: dur, gain: 0.2 });
  } catch { /* silent */ }
}

// Arcade coin / point-scored — bright two-note square blip.
export function sfxCoin(settings) {
  try {
    const c = ok(settings);
    if (!c) return;
    blip(c, { from: 987.77, to: 987.77, duration: 0.07, type: "square", gain: 0.1 });
    blip(c, { from: 1318.51, to: 1318.51, duration: 0.17, type: "square", gain: 0.1, start: 0.07 });
  } catch { /* silent */ }
}

// Short bright tap pop — pairs with a spark burst on press.
export function sfxPop(settings) {
  try {
    const c = ok(settings);
    if (!c) return;
    blip(c, { from: 620, to: 1180, duration: 0.09, type: "triangle", gain: 0.09 });
    crack(c, { hp: 2400, lp: 8000, duration: 0.045, gain: 0.1 });
  } catch { /* silent */ }
}

// Optional micro-tick for hover/focus affordances (kept very quiet).
export function sfxHover(settings) {
  try {
    const c = ok(settings);
    if (!c) return;
    blip(c, { from: 880, to: 1240, duration: 0.04, type: "sine", gain: 0.028 });
  } catch { /* silent */ }
}

// Rebirth flourish — rising airy whoosh + a major shimmer that climbs. Used
// for phoenix/level-up/defeat-the-boss moments.
export function sfxPhoenix(settings) {
  try {
    const c = ok(settings);
    if (!c) return;
    const t = c.currentTime;
    // upward-sweeping airy whoosh
    const src = noise(c);
    const f = c.createBiquadFilter();
    f.type = "bandpass";
    f.Q.value = 0.9;
    f.frequency.setValueAtTime(320, t);
    f.frequency.exponentialRampToValueAtTime(5200, t + 0.95);
    const g = env(c, { gain: 0.26, attack: 0.16, duration: 1.15 });
    src.connect(f).connect(g).connect(bus);
    src.start(t);
    src.stop(t + 1.25);
    // rising major-chord shimmer
    [523.25, 659.25, 783.99, 1046.5].forEach((fr, i) => {
      blip(c, { from: fr * 0.72, to: fr, duration: 0.9, type: "sine", gain: 0.075, start: 0.1 + i * 0.08 });
      blip(c, { from: fr * 1.44, to: fr * 2, duration: 0.6, type: "triangle", gain: 0.025, start: 0.14 + i * 0.08 });
    });
    subDrop(c, { from: 55, to: 130, duration: 0.7, gain: 0.16, start: 0.04 });
  } catch { /* silent */ }
}

// ---------- Field Journal (leather, parchment, gold, grace) ----------

// A page turning — soft paper swish, airy and quick.
export function sfxPageTurn(settings) {
  try {
    const c = ok(settings);
    if (!c) return;
    const t = c.currentTime;
    const src = noise(c);
    const f = c.createBiquadFilter();
    f.type = "bandpass";
    f.Q.value = 1.4;
    f.frequency.setValueAtTime(900, t);
    f.frequency.exponentialRampToValueAtTime(3400, t + 0.16);
    f.frequency.exponentialRampToValueAtTime(1200, t + 0.3);
    const g = env(c, { gain: 0.11, attack: 0.03, duration: 0.32 });
    src.connect(f).connect(g).connect(bus);
    src.start(t);
    src.stop(t + 0.4);
  } catch { /* silent */ }
}

// A heavy leather cover closing — muffled thump with a paper settle.
export function sfxBookThump(settings) {
  try {
    const c = ok(settings);
    if (!c) return;
    subDrop(c, { from: 105, to: 42, duration: 0.22, gain: 0.34 });
    crack(c, { hp: 90, lp: 750, duration: 0.14, gain: 0.2 });
    crack(c, { hp: 900, lp: 2600, duration: 0.2, gain: 0.05, start: 0.08 });
  } catch { /* silent */ }
}

// Wax seal — soft molten press, a low squash, then a settling sizzle.
export function sfxWaxSeal(settings) {
  try {
    const c = ok(settings);
    if (!c) return;
    subDrop(c, { from: 160, to: 55, duration: 0.3, gain: 0.24 });
    crack(c, { hp: 120, lp: 620, duration: 0.16, gain: 0.14 });
    // sizzle as the wax settles
    const t = c.currentTime;
    const src = noise(c);
    const f = c.createBiquadFilter();
    f.type = "highpass";
    f.frequency.value = 3800;
    const g = env(c, { gain: 0.05, attack: 0.05, duration: 0.55, start: 0.1 });
    src.connect(f).connect(g).connect(bus);
    src.start(t + 0.1);
    src.stop(t + 0.8);
    blip(c, { from: 660, to: 520, duration: 0.3, type: "sine", gain: 0.045, start: 0.16 });
  } catch { /* silent */ }
}

// Quill on parchment — one short dry scratch. Throttle at the call site.
export function sfxQuillScratch(settings) {
  try {
    const c = ok(settings);
    if (!c) return;
    const t = c.currentTime;
    const src = noise(c);
    const f = c.createBiquadFilter();
    f.type = "bandpass";
    f.Q.value = 3.5;
    f.frequency.setValueAtTime(2600, t);
    f.frequency.exponentialRampToValueAtTime(4200, t + 0.09);
    const g = env(c, { gain: 0.035, attack: 0.01, duration: 0.12 });
    src.connect(f).connect(g).connect(bus);
    src.start(t);
    src.stop(t + 0.18);
  } catch { /* silent */ }
}

// Lifting a prayer — one soft, warm chapel bell with a long tail.
export function sfxPrayerBell(settings) {
  try {
    const c = ok(settings);
    if (!c) return;
    blip(c, { from: 523.25, to: 523.25, duration: 1.3, type: "triangle", gain: 0.14 });
    blip(c, { from: 1046.5, to: 1046.5, duration: 0.9, type: "sine", gain: 0.05 });
    blip(c, { from: 1568, to: 1568, duration: 0.5, type: "sine", gain: 0.02, start: 0.03 });
  } catch { /* silent */ }
}

// An answered prayer — the halo. Slow angelic bloom: stacked detuned major
// chord swelling in, a high sparkle cascade, and warm sub light underneath.
export function sfxHalo(settings) {
  try {
    const c = ok(settings);
    if (!c) return;
    const t = c.currentTime;
    // choir-like swell: C major with gentle detune pairs
    [261.63, 329.63, 392.0, 523.25].forEach((fr, i) => {
      [0.997, 1.003].forEach((d) => {
        const o = c.createOscillator();
        o.type = "sine";
        o.frequency.value = fr * d;
        const g = env(c, { gain: 0.06, attack: 0.5, duration: 2.3, start: i * 0.09 });
        o.connect(g).connect(bus);
        o.start(t + i * 0.09);
        o.stop(t + i * 0.09 + 2.5);
      });
    });
    // sparkle cascade descending from on high
    [2093, 1760, 1568, 1318.5, 1046.5].forEach((fr, i) => {
      blip(c, { from: fr, to: fr, duration: 0.5, type: "sine", gain: 0.035, start: 0.55 + i * 0.14 });
    });
    // warm light under it all
    subDrop(c, { from: 65, to: 130, duration: 1.6, gain: 0.1, start: 0.15 });
    // breath of air rising
    const src = noise(c);
    const f = c.createBiquadFilter();
    f.type = "bandpass";
    f.Q.value = 0.8;
    f.frequency.setValueAtTime(600, t);
    f.frequency.exponentialRampToValueAtTime(6800, t + 1.8);
    const g = env(c, { gain: 0.06, attack: 0.6, duration: 2.1 });
    src.connect(f).connect(g).connect(bus);
    src.start(t);
    src.stop(t + 2.3);
  } catch { /* silent */ }
}

// Iron plate racking — deep slam plus a bright metallic ring that decays.
export function sfxPlateClank(settings) {
  try {
    const c = ok(settings);
    if (!c) return;
    subDrop(c, { from: 140, to: 36, duration: 0.26, gain: 0.42 });
    crack(c, { hp: 150, lp: 1400, duration: 0.1, gain: 0.26 });
    crack(c, { hp: 2400, lp: 8000, duration: 0.07, gain: 0.14 });
    // inharmonic partials — the ring of struck steel
    [412, 1046, 1737, 2513].forEach((fr, i) => {
      blip(c, { from: fr, to: fr * 0.995, duration: 0.55 - i * 0.09, type: "triangle", gain: 0.05 - i * 0.009, start: 0.015 });
    });
  } catch { /* silent */ }
}

// Chalk clap — a soft dry puff of dust. The Iron's page turn.
export function sfxChalkPoof(settings) {
  try {
    const c = ok(settings);
    if (!c) return;
    const t = c.currentTime;
    const src = noise(c);
    const f = c.createBiquadFilter();
    f.type = "bandpass";
    f.Q.value = 0.9;
    f.frequency.setValueAtTime(1600, t);
    f.frequency.exponentialRampToValueAtTime(500, t + 0.22);
    const g = env(c, { gain: 0.1, attack: 0.008, duration: 0.26 });
    src.connect(f).connect(g).connect(bus);
    src.start(t);
    src.stop(t + 0.34);
    crack(c, { hp: 240, lp: 900, duration: 0.06, gain: 0.09 });
  } catch { /* silent */ }
}

// ═══════════ ALPHA MODE one-shots ═══════════

// Anvil strike — the Character Forge seals two honest numbers.
export function sfxForgeStrike(settings) {
  try {
    const c = ok(settings);
    if (!c) return;
    subDrop(c, { from: 180, to: 40, duration: 0.3, gain: 0.5 });
    crack(c, { hp: 200, lp: 2000, duration: 0.09, gain: 0.3 });
    crack(c, { hp: 3000, lp: 9000, duration: 0.06, gain: 0.16 });
    // long anvil ring
    [523, 1244, 2093].forEach((fr, i) => {
      blip(c, { from: fr, to: fr * 0.99, duration: 0.9 - i * 0.2, type: "triangle", gain: 0.05 - i * 0.012, start: 0.02 });
    });
  } catch { /* silent */ }
}

// Myth boss takes a hit — stone cracking under the truth.
export function sfxBossHit(settings) {
  try {
    const c = ok(settings);
    if (!c) return;
    subDrop(c, { from: 120, to: 45, duration: 0.18, gain: 0.3 });
    crack(c, { hp: 400, lp: 3200, duration: 0.12, gain: 0.24 });
    crack(c, { hp: 1500, lp: 5000, duration: 0.08, gain: 0.12, start: 0.05 });
  } catch { /* silent */ }
}

// Myth boss shatters — the lie comes down.
export function sfxBossDown(settings) {
  try {
    const c = ok(settings);
    if (!c) return;
    subDrop(c, { from: 150, to: 30, duration: 0.4, gain: 0.5 });
    crack(c, { hp: 300, lp: 4500, duration: 0.3, gain: 0.28 });
    // debris scatter
    for (let i = 0; i < 5; i++) {
      crack(c, { hp: 1200 + i * 700, lp: 6500, duration: 0.07, gain: 0.08, start: 0.12 + i * 0.06 });
    }
    blip(c, { from: 220, to: 55, duration: 0.5, type: "square", gain: 0.05, start: 0.05 });
  } catch { /* silent */ }
}

// Wisdom scroll unfurls — dry paper sweep with a gold shimmer.
export function sfxScrollUnfurl(settings) {
  try {
    const c = ok(settings);
    if (!c) return;
    const t = c.currentTime;
    const src = noise(c);
    const f = c.createBiquadFilter();
    f.type = "bandpass";
    f.Q.value = 1.2;
    f.frequency.setValueAtTime(900, t);
    f.frequency.exponentialRampToValueAtTime(3200, t + 0.35);
    const g = env(c, { gain: 0.09, attack: 0.04, duration: 0.42 });
    src.connect(f).connect(g).connect(bus);
    src.start(t);
    src.stop(t + 0.5);
    blip(c, { from: 1568, to: 2093, duration: 0.4, type: "sine", gain: 0.04, start: 0.22 });
  } catch { /* silent */ }
}

// Tempo tick — two pitches: low on the descent count, high on the drive.
export function sfxTempoTick(up = false, settings) {
  try {
    const c = ok(settings);
    if (!c) return;
    blip(c, { from: up ? 880 : 330, to: up ? 780 : 300, duration: 0.05, type: "triangle", gain: up ? 0.09 : 0.06 });
  } catch { /* silent */ }
}

// Benchmark rung up — two rising notes and a clank accent.
export function sfxRungUp(settings) {
  try {
    const c = ok(settings);
    if (!c) return;
    blip(c, { from: 523, to: 523, duration: 0.16, type: "triangle", gain: 0.1 });
    blip(c, { from: 784, to: 784, duration: 0.3, type: "triangle", gain: 0.11, start: 0.14 });
    crack(c, { hp: 2000, lp: 7000, duration: 0.05, gain: 0.1, start: 0.14 });
    subDrop(c, { from: 110, to: 60, duration: 0.16, gain: 0.2, start: 0.12 });
  } catch { /* silent */ }
}

// Fridge doors slam — the week locks in.
export function sfxFridgeSlam(settings) {
  try {
    const c = ok(settings);
    if (!c) return;
    subDrop(c, { from: 95, to: 34, duration: 0.24, gain: 0.42 });
    crack(c, { hp: 120, lp: 900, duration: 0.13, gain: 0.24 });
    crack(c, { hp: 800, lp: 2600, duration: 0.07, gain: 0.1, start: 0.03 });
    // rubber-seal squish
    blip(c, { from: 200, to: 90, duration: 0.12, type: "sine", gain: 0.06, start: 0.05 });
  } catch { /* silent */ }
}

// Magnet clack — a photo pinned to the door.
export function sfxMagnetClack(settings) {
  try {
    const c = ok(settings);
    if (!c) return;
    crack(c, { hp: 2500, lp: 8500, duration: 0.045, gain: 0.16 });
    blip(c, { from: 1100, to: 900, duration: 0.07, type: "triangle", gain: 0.05 });
  } catch { /* silent */ }
}

// ---------- Mask Court (inner-critic battles) ----------

// Fog surge → the critic slams in: dark riser into a chest thud.
export function sfxMaskAmbush(settings) {
  try {
    const c = ok(settings);
    if (!c) return;
    const t = c.currentTime;
    const o = c.createOscillator();
    o.type = "sawtooth";
    o.frequency.setValueAtTime(65, t);
    o.frequency.exponentialRampToValueAtTime(210, t + 0.5);
    const g = env(c, { gain: 0.1, attack: 0.06, duration: 0.55 });
    o.connect(g).connect(bus);
    o.start(t);
    o.stop(t + 0.6);
    crack(c, { hp: 180, lp: 2200, duration: 0.28, gain: 0.2, start: 0.48 });
    subDrop(c, { from: 150, to: 38, duration: 0.34, gain: 0.5, start: 0.5 });
  } catch { /* silent */ }
}

// Naming Strike — the truth beam: bright zap + landing crack.
export function sfxNamingStrike(settings) {
  try {
    const c = ok(settings);
    if (!c) return;
    blip(c, { from: 500, to: 1600, duration: 0.16, type: "square", gain: 0.08 });
    blip(c, { from: 900, to: 2600, duration: 0.12, type: "sine", gain: 0.07, start: 0.04 });
    crack(c, { hp: 900, lp: 6500, duration: 0.14, gain: 0.24, start: 0.2 });
    subDrop(c, { from: 110, to: 44, duration: 0.2, gain: 0.32, start: 0.2 });
  } catch { /* silent */ }
}

// CRITICAL naming — same strike, doubled and heavier.
export function sfxCritStrike(settings) {
  try {
    const c = ok(settings);
    if (!c) return;
    blip(c, { from: 400, to: 2200, duration: 0.2, type: "square", gain: 0.11 });
    blip(c, { from: 800, to: 3200, duration: 0.16, type: "sine", gain: 0.09, start: 0.05 });
    crack(c, { hp: 700, lp: 8000, duration: 0.2, gain: 0.3, start: 0.2 });
    subDrop(c, { from: 140, to: 34, duration: 0.32, gain: 0.55, start: 0.2 });
    crack(c, { hp: 300, lp: 3000, duration: 0.3, gain: 0.14, start: 0.34 });
  } catch { /* silent */ }
}

// The mask kneels — a slow, low settle. Not a defeat sound: a landing.
export function sfxBossKneel(settings) {
  try {
    const c = ok(settings);
    if (!c) return;
    subDrop(c, { from: 90, to: 30, duration: 0.7, gain: 0.4 });
    crack(c, { hp: 90, lp: 700, duration: 0.5, gain: 0.14, start: 0.15 });
    blip(c, { from: 320, to: 140, duration: 0.6, type: "sine", gain: 0.05, start: 0.1 });
  } catch { /* silent */ }
}

// Soft breath cue — gentle sine swell; inhale rises, exhale falls.
export function sfxBreathTone(inhale = true, settings) {
  try {
    const c = ok(settings);
    if (!c) return;
    const t = c.currentTime;
    const o = c.createOscillator();
    o.type = "sine";
    if (inhale) {
      o.frequency.setValueAtTime(220, t);
      o.frequency.linearRampToValueAtTime(330, t + 3.6);
    } else {
      o.frequency.setValueAtTime(330, t);
      o.frequency.linearRampToValueAtTime(196, t + 4.6);
    }
    const g = c.createGain();
    const dur = inhale ? 3.8 : 4.8;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.035, t + 0.8);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(bus);
    o.start(t);
    o.stop(t + dur + 0.05);
  } catch { /* silent */ }
}

// Evolution strobe — rising sweep that keeps climbing until the reveal.
export function sfxEvolveSweep(settings) {
  try {
    const c = ok(settings);
    if (!c) return;
    const t = c.currentTime;
    const o = c.createOscillator();
    o.type = "sawtooth";
    o.frequency.setValueAtTime(110, t);
    o.frequency.exponentialRampToValueAtTime(880, t + 2.4);
    const lp = c.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.setValueAtTime(600, t);
    lp.frequency.exponentialRampToValueAtTime(5200, t + 2.4);
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.09, t + 0.4);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 2.6);
    o.connect(lp).connect(g).connect(bus);
    o.start(t);
    o.stop(t + 2.7);
  } catch { /* silent */ }
}

// Evolution reveal — the big hit + shimmer when the evolved form lands.
export function sfxEvolveReveal(settings) {
  try {
    const c = ok(settings);
    if (!c) return;
    subDrop(c, { from: 180, to: 36, duration: 0.4, gain: 0.6 });
    crack(c, { hp: 500, lp: 9000, duration: 0.25, gain: 0.3 });
    // shimmer — a little major arpeggio riding the impact
    [523, 659, 784, 1047].forEach((f, i) => {
      blip(c, { from: f, to: f * 1.01, duration: 0.5, type: "sine", gain: 0.05, start: 0.12 + i * 0.09 });
    });
  } catch { /* silent */ }
}

// ---------- loops (return a handle: { stop(), setLevel(0..1) }) ----------

const NO_LOOP = { stop() {}, setLevel() {} };

function makeLoop(c, buildChain) {
  // buildChain(c) -> { inputGain, nodes:[...], tick? } ; we fade out on stop.
  const master = c.createGain();
  master.gain.value = 0.0001;
  master.connect(bus);
  const parts = buildChain(c, master);
  let interval = parts.tick ? setInterval(parts.tick, parts.tickMs || 220) : null;
  let stopped = false;
  return {
    setLevel(v) {
      if (stopped) return;
      try {
        master.gain.cancelScheduledValues(c.currentTime);
        master.gain.setTargetAtTime(Math.max(0.0001, v), c.currentTime, 0.15);
      } catch { /* silent */ }
    },
    stop() {
      if (stopped) return;
      stopped = true;
      try {
        if (interval) clearInterval(interval);
        master.gain.setTargetAtTime(0.0001, c.currentTime, 0.25);
        setTimeout(() => {
          try {
            parts.nodes.forEach((n) => n.stop && n.stop());
            master.disconnect();
          } catch { /* silent */ }
        }, 700);
      } catch { /* silent */ }
    },
  };
}

// Rain: hissy filtered noise. setLevel drives volume (0–1 → gentle–downpour).
export function sfxRainLoop(settings) {
  try {
    const c = ok(settings);
    if (!c) return NO_LOOP;
    const h = makeLoop(c, (cc, master) => {
      const src = noise(cc);
      const hp = cc.createBiquadFilter();
      hp.type = "highpass";
      hp.frequency.value = 900;
      const lp = cc.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 6500;
      src.connect(hp).connect(lp).connect(master);
      src.start();
      return { nodes: [src] };
    });
    h.setLevel(0.12);
    return h;
  } catch {
    return NO_LOOP;
  }
}

// Wind: slow LFO sweeping a bandpass over noise.
export function sfxWindLoop(settings) {
  try {
    const c = ok(settings);
    if (!c) return NO_LOOP;
    const h = makeLoop(c, (cc, master) => {
      const src = noise(cc);
      const bp = cc.createBiquadFilter();
      bp.type = "bandpass";
      bp.frequency.value = 400;
      bp.Q.value = 0.8;
      const lfo = cc.createOscillator();
      lfo.frequency.value = 0.16;
      const lfoGain = cc.createGain();
      lfoGain.gain.value = 260;
      lfo.connect(lfoGain).connect(bp.frequency);
      src.connect(bp).connect(master);
      src.start();
      lfo.start();
      return { nodes: [src, lfo] };
    });
    h.setLevel(0.14);
    return h;
  } catch {
    return NO_LOOP;
  }
}

// Fire: low roar + random crackle pops.
export function sfxFireLoop(settings) {
  try {
    const c = ok(settings);
    if (!c) return NO_LOOP;
    const h = makeLoop(c, (cc, master) => {
      const src = noise(cc);
      const lp = cc.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 480;
      src.connect(lp).connect(master);
      src.start();
      const tick = () => {
        if (Math.random() < 0.75) {
          const g = cc.createGain();
          const t = cc.currentTime;
          g.gain.setValueAtTime(0.0001, t);
          g.gain.exponentialRampToValueAtTime(0.5 + Math.random() * 0.6, t + 0.004);
          g.gain.exponentialRampToValueAtTime(0.0001, t + 0.03 + Math.random() * 0.05);
          const pop = noise(cc);
          const hp = cc.createBiquadFilter();
          hp.type = "highpass";
          hp.frequency.value = 1400 + Math.random() * 3000;
          pop.connect(hp).connect(g).connect(master);
          pop.start(t);
          pop.stop(t + 0.1);
        }
      };
      return { nodes: [src], tick, tickMs: 90 };
    });
    h.setLevel(0.2);
    return h;
  } catch {
    return NO_LOOP;
  }
}

// Draining water: descending glugs over a soft rush. setLevel = drain vigor.
export function sfxDrainLoop(settings) {
  try {
    const c = ok(settings);
    if (!c) return NO_LOOP;
    const h = makeLoop(c, (cc, master) => {
      const src = noise(cc);
      const bp = cc.createBiquadFilter();
      bp.type = "bandpass";
      bp.frequency.value = 700;
      bp.Q.value = 0.6;
      src.connect(bp).connect(master);
      src.start();
      const tick = () => {
        if (Math.random() < 0.6) {
          const o = cc.createOscillator();
          o.type = "sine";
          const f0 = 160 + Math.random() * 260;
          const t = cc.currentTime;
          o.frequency.setValueAtTime(f0 + 220, t);
          o.frequency.exponentialRampToValueAtTime(f0, t + 0.12);
          const g = cc.createGain();
          g.gain.setValueAtTime(0.0001, t);
          g.gain.exponentialRampToValueAtTime(0.35, t + 0.02);
          g.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);
          o.connect(g).connect(master);
          o.start(t);
          o.stop(t + 0.2);
        }
      };
      return { nodes: [src], tick, tickMs: 200 };
    });
    h.setLevel(0.18);
    return h;
  } catch {
    return NO_LOOP;
  }
}

// Stadium crowd roar — the quarter-buzzer celebration. A big noise swell that
// blooms and slowly settles, with a couple of shrill whistle blips on top.
export function sfxCrowdRoar(settings) {
  try {
    const c = ok(settings);
    if (!c) return;
    const t = c.currentTime;
    const src = noise(c);
    const bp = c.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.setValueAtTime(700, t);
    bp.frequency.exponentialRampToValueAtTime(1400, t + 0.4); // roar brightens as it blooms
    bp.Q.value = 0.5;
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.5, t + 0.25);
    g.gain.exponentialRampToValueAtTime(0.18, t + 1.4);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 3.2);
    src.connect(bp).connect(g).connect(bus);
    src.start(t);
    src.stop(t + 3.4);
    // ref whistles cutting through the roar
    blip(c, { from: 2800, to: 2400, duration: 0.28, type: "square", gain: 0.05, start: 0.5 });
    blip(c, { from: 2800, to: 2500, duration: 0.2, type: "square", gain: 0.04, start: 0.82 });
  } catch { /* silent */ }
}

// Calm ambient pad — the RESET locker-room bed. Warm detuned oscillators under
// a slow lowpass swell (~55bpm breathing pace). Sits far below the voice.
export function sfxCalmPadLoop(settings) {
  try {
    const c = ok(settings);
    if (!c) return NO_LOOP;
    const h = makeLoop(c, (cc, master) => {
      const lp = cc.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 640;
      lp.connect(master);
      // A2 + E3 + A3, each a hair detuned so the chord shimmers instead of beats.
      const oscs = [110, 110.4, 164.8, 220, 220.7].map((f, i) => {
        const o = cc.createOscillator();
        o.type = i < 2 ? "sine" : "triangle";
        o.frequency.value = f;
        const og = cc.createGain();
        og.gain.value = i < 2 ? 0.4 : 0.16;
        o.connect(og).connect(lp);
        o.start();
        return o;
      });
      // Slow swell on the filter — one rise-and-fall ≈ a relaxed breath cycle.
      const lfo = cc.createOscillator();
      lfo.frequency.value = 0.09;
      const lfoGain = cc.createGain();
      lfoGain.gain.value = 220;
      lfo.connect(lfoGain).connect(lp.frequency);
      lfo.start();
      // Soft "air" so the pad doesn't feel synthetic-dry.
      const air = noise(cc);
      const airBp = cc.createBiquadFilter();
      airBp.type = "bandpass";
      airBp.frequency.value = 3200;
      airBp.Q.value = 0.4;
      const airG = cc.createGain();
      airG.gain.value = 0.015;
      air.connect(airBp).connect(airG).connect(master);
      air.start();
      return { nodes: [...oscs, lfo, air] };
    });
    h.setLevel(0.08);
    return h;
  } catch {
    return NO_LOOP;
  }
}

// Stadium murmur + heartbeat pulse — the HYPE locker-room bed. Low crowd wash
// with a slow sub-thump, like the arena breathing on the other side of the wall.
export function sfxCrowdLoop(settings) {
  try {
    const c = ok(settings);
    if (!c) return NO_LOOP;
    const h = makeLoop(c, (cc, master) => {
      const src = noise(cc);
      const bp = cc.createBiquadFilter();
      bp.type = "bandpass";
      bp.frequency.value = 500;
      bp.Q.value = 0.4;
      const lfo = cc.createOscillator(); // crowd wash slowly rises and falls
      lfo.frequency.value = 0.13;
      const lfoGain = cc.createGain();
      lfoGain.gain.value = 180;
      lfo.connect(lfoGain).connect(bp.frequency);
      src.connect(bp).connect(master);
      src.start();
      lfo.start();
      let beat = 0;
      const tick = () => {
        // lub-dub: strong thump, then a softer one close behind
        const t = cc.currentTime;
        const strong = beat % 2 === 0;
        beat += 1;
        const o = cc.createOscillator();
        o.type = "sine";
        o.frequency.setValueAtTime(strong ? 62 : 54, t);
        o.frequency.exponentialRampToValueAtTime(40, t + 0.12);
        const g = cc.createGain();
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(strong ? 0.5 : 0.28, t + 0.012);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
        o.connect(g).connect(master);
        o.start(t);
        o.stop(t + 0.3);
      };
      return { nodes: [src, lfo], tick, tickMs: 430 };
    });
    h.setLevel(0.1);
    return h;
  } catch {
    return NO_LOOP;
  }
}

// ---------- Full Court shot sounds (every door log = a basketball shot) ----------

// The launch: one dribble thump off the hardwood + a rising throw whoosh.
export function sfxBallThrow(settings) {
  try {
    const c = ok(settings);
    if (!c) return;
    // dribble bounce
    subDrop(c, { from: 190, to: 70, duration: 0.09, gain: 0.28 });
    crack(c, { hp: 500, lp: 2400, duration: 0.045, gain: 0.1 });
    // throw whoosh rising away
    const t = c.currentTime;
    const src = noise(c);
    const f = c.createBiquadFilter();
    f.type = "bandpass";
    f.Q.value = 1.1;
    f.frequency.setValueAtTime(500, t + 0.05);
    f.frequency.exponentialRampToValueAtTime(2600, t + 0.32);
    const g = env(c, { gain: 0.08, attack: 0.06, duration: 0.3, start: 0.05 });
    src.connect(f).connect(g).connect(bus);
    src.start(t + 0.05);
    src.stop(t + 0.45);
  } catch { /* silent */ }
}

// Nothing-but-net SWISH — airy nylon whip, falling away.
export function sfxSwish(settings) {
  try {
    const c = ok(settings);
    if (!c) return;
    const t = c.currentTime;
    const src = noise(c);
    const f = c.createBiquadFilter();
    f.type = "bandpass";
    f.Q.value = 1.6;
    f.frequency.setValueAtTime(4200, t);
    f.frequency.exponentialRampToValueAtTime(900, t + 0.22);
    const g = env(c, { gain: 0.22, attack: 0.012, duration: 0.26 });
    src.connect(f).connect(g).connect(bus);
    src.start(t);
    src.stop(t + 0.32);
    // nylon threads settling
    crack(c, { hp: 2600, lp: 7000, duration: 0.09, gain: 0.05, start: 0.16 });
  } catch { /* silent */ }
}

// Bank shot — a thock off the glass, then the ball drops in with a soft swish.
export function sfxBank(settings) {
  try {
    const c = ok(settings);
    if (!c) return;
    // backboard thock
    crack(c, { hp: 300, lp: 1500, duration: 0.06, gain: 0.24 });
    blip(c, { from: 340, to: 210, duration: 0.09, type: "triangle", gain: 0.12 });
    // in off the glass
    const t = c.currentTime;
    const src = noise(c);
    const f = c.createBiquadFilter();
    f.type = "bandpass";
    f.Q.value = 1.5;
    f.frequency.setValueAtTime(3200, t + 0.12);
    f.frequency.exponentialRampToValueAtTime(800, t + 0.3);
    const g = env(c, { gain: 0.12, attack: 0.015, duration: 0.2, start: 0.12 });
    src.connect(f).connect(g).connect(bus);
    src.start(t + 0.12);
    src.stop(t + 0.4);
  } catch { /* silent */ }
}

// THE DUNK — rim slam, steel ring-out, glass rattle. Caller stacks the horn/roar.
export function sfxDunk(settings) {
  try {
    const c = ok(settings);
    if (!c) return;
    // two-hand slam
    subDrop(c, { from: 150, to: 34, duration: 0.3, gain: 0.6 });
    crack(c, { hp: 200, lp: 3200, duration: 0.1, gain: 0.3 });
    // steel rim ringing out (detuned pair, fast decay)
    const t = c.currentTime;
    [523, 782].forEach((hz, i) => {
      const o = c.createOscillator();
      o.type = "square";
      o.frequency.setValueAtTime(hz, t + 0.02);
      const g = c.createGain();
      g.gain.setValueAtTime(0.0001, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.09 - i * 0.03, t + 0.03);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
      const f = c.createBiquadFilter();
      f.type = "bandpass";
      f.frequency.value = hz * 2;
      f.Q.value = 8;
      o.connect(f).connect(g).connect(bus);
      o.start(t + 0.02);
      o.stop(t + 0.55);
    });
    // backboard glass rattling
    crack(c, { hp: 1800, lp: 6500, duration: 0.16, gain: 0.08, start: 0.06 });
    crack(c, { hp: 1400, lp: 5200, duration: 0.12, gain: 0.05, start: 0.2 });
  } catch { /* silent */ }
}

// ---------- baked voice lines ----------

let currentVoice = null;

// Play a baked mp3 line from /audio/anger/<id>.mp3. Cuts off the previous line.
// volume escalates with tiers (0–1); rate lets late tiers feel more frantic.
export function playVoiceLine(id, { volume = 1, rate = 1, settings } = {}) {
  try {
    if (!enabled) return;
    if (settings && settings.soundEnabled === false) return;
    if (typeof window === "undefined" || typeof Audio === "undefined") return;
    if (currentVoice) {
      try {
        currentVoice.pause();
        currentVoice.currentTime = 0;
      } catch { /* silent */ }
    }
    const a = new Audio(`/audio/anger/${id}.mp3`);
    a.volume = Math.max(0, Math.min(1, volume));
    a.playbackRate = rate;
    a.onerror = () => {}; // file missing → stay silent, never crash
    currentVoice = a;
    a.play().catch(() => {});
  } catch { /* silent */ }
}

export function stopVoiceLine() {
  try {
    if (currentVoice) {
      currentVoice.pause();
      currentVoice.currentTime = 0;
      currentVoice = null;
    }
  } catch { /* silent */ }
}

// ═══════════ MAPQUEST STREET (Living City · Phase 8) ═══════════
// The sound of the city — everything synthesized, nothing recorded, all
// gesture-gated by the shared context resume. One-shots ride the main
// compressor bus; the ambient beds ride a duckable street bus so dialogs
// can pull the city back −8dB (sfxDuck) without touching the verbs.

let streetBus = null; // duckable bed bus
let streetDucked = false;
let streetLevel = 1; // player volume (street audio chip)

function getStreetBus(c) {
  if (!streetBus) {
    streetBus = c.createGain();
    streetBus.gain.value = streetLevel;
    streetBus.connect(bus);
  }
  return streetBus;
}

function applyStreetGain(c) {
  if (!streetBus || !c) return;
  const v = Math.max(0.0001, streetLevel * (streetDucked ? 0.4 : 1)); // −8dB duck
  try {
    streetBus.gain.setTargetAtTime(v, c.currentTime, 0.12);
  } catch { /* silent */ }
}

// Duck the ambient beds while any dialog/battle overlay is open. (The Mask
// Court's overlays are welcome to call this too.)
export function sfxDuck(on) {
  try {
    streetDucked = Boolean(on);
    if (ctx) applyStreetGain(ctx);
  } catch { /* silent */ }
}

// Street volume chip (0..1, persisted by streetStore at the call site).
export function sfxStreetLevel(v) {
  try {
    const n = Number(v);
    streetLevel = Number.isFinite(n) ? Math.max(0, Math.min(1, n)) : streetLevel;
    if (ctx) applyStreetGain(ctx);
  } catch { /* silent */ }
}

// ---------- street verb one-shots ----------

// Footstep — filtered noise tick, two pitches alternating with the feet.
export function sfxFootstep(foot = false, run = false, settings) {
  try {
    const c = ok(settings);
    if (!c) return;
    crack(c, {
      hp: foot ? 900 : 700,
      lp: foot ? 2600 : 2100,
      duration: 0.035,
      gain: run ? 0.07 : 0.045,
    });
  } catch { /* silent */ }
}

// Jump — a soft noise sweep up.
export function sfxJumpWhoosh(settings) {
  try {
    const c = ok(settings);
    if (!c) return;
    const src = noise(c);
    const f = c.createBiquadFilter();
    f.type = "bandpass";
    f.Q.value = 1.1;
    const t = c.currentTime;
    f.frequency.setValueAtTime(400, t);
    f.frequency.exponentialRampToValueAtTime(2200, t + 0.16);
    const g = env(c, { gain: 0.09, attack: 0.02, duration: 0.18 });
    src.connect(f).connect(g).connect(bus);
    src.start(t);
    src.stop(t + 0.24);
  } catch { /* silent */ }
}

// Landing — sine drop + noise tap; weight scales with fall speed (0..1).
export function sfxLandThud(weight = 0.4, settings) {
  try {
    const c = ok(settings);
    if (!c) return;
    const w = Math.max(0.1, Math.min(1, weight));
    subDrop(c, { from: 110 + w * 50, to: 42, duration: 0.1 + w * 0.08, gain: 0.1 + w * 0.22 });
    crack(c, { hp: 300, lp: 1600, duration: 0.04 + w * 0.03, gain: 0.06 + w * 0.1 });
  } catch { /* silent */ }
}

// Chain pop — pitch climbs with each stomp chain link.
export function sfxChainPop(chain = 1, settings) {
  try {
    const c = ok(settings);
    if (!c) return;
    const n = Math.min(8, Math.max(1, chain));
    const f0 = 520 * Math.pow(1.122, n - 1); // up a step per link
    blip(c, { from: f0, to: f0 * 1.4, duration: 0.09, type: "triangle", gain: 0.1 });
  } catch { /* silent */ }
}

// Door chime — every district gets a signature interval (hash of its id).
export function sfxDoorChime(districtId = "", settings) {
  try {
    const c = ok(settings);
    if (!c) return;
    let h = 0;
    const s = String(districtId);
    for (let i = 0; i < s.length; i += 1) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    const base = 392 + (h % 5) * 58; // G4-ish family
    const intervals = [1.25, 1.333, 1.5, 1.6, 1.2];
    const iv = intervals[h % intervals.length];
    blip(c, { from: base, to: base, duration: 0.22, type: "triangle", gain: 0.11 });
    blip(c, { from: base * iv, to: base * iv, duration: 0.34, type: "triangle", gain: 0.1, start: 0.13 });
  } catch { /* silent */ }
}

// Power-on — a rising swell as the building floods with light.
export function sfxPowerOnSwell(settings) {
  try {
    const c = ok(settings);
    if (!c) return;
    const t = c.currentTime;
    const src = noise(c);
    const f = c.createBiquadFilter();
    f.type = "lowpass";
    f.frequency.setValueAtTime(240, t);
    f.frequency.exponentialRampToValueAtTime(3600, t + 0.9);
    const g = env(c, { gain: 0.18, attack: 0.4, duration: 1.1 });
    src.connect(f).connect(g).connect(bus);
    src.start(t);
    src.stop(t + 1.2);
    [261.63, 329.63, 392.0].forEach((fr, i) => {
      blip(c, { from: fr, to: fr * 2, duration: 0.8, type: "sine", gain: 0.06, start: 0.2 + i * 0.12 });
    });
    subDrop(c, { from: 50, to: 110, duration: 0.8, gain: 0.14, start: 0.1 });
  } catch { /* silent */ }
}

// Spark pickup — glass ping walking up a pentatonic ladder with the combo.
export function sfxSparkPickup(comboIdx = 0, settings) {
  try {
    const c = ok(settings);
    if (!c) return;
    const penta = [523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.7, 1318.5];
    const f0 = penta[Math.min(penta.length - 1, Math.max(0, comboIdx))];
    blip(c, { from: f0, to: f0, duration: 0.16, type: "sine", gain: 0.12 });
    blip(c, { from: f0 * 2, to: f0 * 2, duration: 0.1, type: "triangle", gain: 0.04, start: 0.01 });
    crack(c, { hp: 5000, lp: 11000, duration: 0.05, gain: 0.05 });
  } catch { /* silent */ }
}

// Zone sting — the same 3-note motif, transposed per zone.
export function sfxZoneSting(zoneIdx = 0, settings) {
  try {
    const c = ok(settings);
    if (!c) return;
    const root = 220 * Math.pow(1.0595, (zoneIdx * 2) % 12);
    [1, 1.5, 2].forEach((m, i) => {
      blip(c, { from: root * m, to: root * m, duration: 0.32 - i * 0.06, type: "triangle", gain: 0.09, start: i * 0.13 });
    });
  } catch { /* silent */ }
}

// ---------- street ambient beds (duckable via sfxDuck) ----------

// The city bed: two detuned drones + a slow traffic wash + a sparse pluck
// on one shared clock. Night adds a distant siren swell (~90s, −24dB).
// theme "hometown" = warm pad + crickets instead. ≤ 6 oscillators total.
export function sfxStreetBedLoop(todKey = "night", theme = "city", settings) {
  try {
    const c = ok(settings);
    if (!c) return NO_LOOP;
    const street = getStreetBus(c);
    const isHome = theme === "hometown";
    const night = todKey === "night";
    const h = makeLoop(c, (cc, master) => {
      try {
        master.disconnect();
      } catch { /* not yet connected */ }
      master.connect(street); // beds ride the duckable street bus
      const lp = cc.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = isHome ? 520 : 420;
      lp.connect(master);
      const droneF = isHome ? [98, 98.5, 147] : night ? [55, 55.35, 110] : [73.4, 73.8, 110];
      const oscs = droneF.map((f, i) => {
        const o = cc.createOscillator();
        o.type = i < 2 ? "sine" : "triangle";
        o.frequency.value = f;
        const og = cc.createGain();
        og.gain.value = i < 2 ? 0.32 : 0.1;
        o.connect(og).connect(lp);
        o.start();
        return o;
      });
      // traffic wash / night air
      const wash = noise(cc);
      const washBp = cc.createBiquadFilter();
      washBp.type = "bandpass";
      washBp.frequency.value = isHome ? 2600 : 700;
      washBp.Q.value = 0.4;
      const washLfo = cc.createOscillator();
      washLfo.frequency.value = 0.07;
      const washLfoG = cc.createGain();
      washLfoG.gain.value = isHome ? 500 : 260;
      washLfo.connect(washLfoG).connect(washBp.frequency);
      const washG = cc.createGain();
      washG.gain.value = isHome ? 0.02 : 0.045;
      wash.connect(washBp).connect(washG).connect(master);
      wash.start();
      washLfo.start();
      // sparse pluck / crickets on one shared clock
      let beats = 0;
      const tick = () => {
        beats += 1;
        if (isHome) {
          // cricket: tiny high noise bursts, most ticks
          if (Math.random() < 0.65) {
            const t = cc.currentTime;
            const p = noise(cc);
            const hpF = cc.createBiquadFilter();
            hpF.type = "bandpass";
            hpF.frequency.value = 4300 + Math.random() * 800;
            hpF.Q.value = 6;
            const g = cc.createGain();
            g.gain.setValueAtTime(0.0001, t);
            g.gain.exponentialRampToValueAtTime(0.05, t + 0.01);
            g.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);
            p.connect(hpF).connect(g).connect(master);
            p.start(t);
            p.stop(t + 0.1);
          }
          return;
        }
        // sparse random-walk pluck — one note every few ticks
        if (Math.random() < 0.22) {
          const scale = [261.63, 311.13, 349.23, 392, 466.16];
          const f = scale[Math.floor(Math.random() * scale.length)] * (night ? 0.5 : 1);
          const t = cc.currentTime;
          const o = cc.createOscillator();
          o.type = "triangle";
          o.frequency.value = f;
          const g = cc.createGain();
          g.gain.setValueAtTime(0.0001, t);
          g.gain.exponentialRampToValueAtTime(0.045, t + 0.015);
          g.gain.exponentialRampToValueAtTime(0.0001, t + 1.1);
          o.connect(g).connect(master);
          o.start(t);
          o.stop(t + 1.2);
        }
        // distant siren swell every ~90s at night (−24dB territory)
        if (night && beats % 36 === 0) {
          const t = cc.currentTime;
          const o = cc.createOscillator();
          o.type = "sine";
          o.frequency.setValueAtTime(620, t);
          o.frequency.exponentialRampToValueAtTime(830, t + 1.4);
          o.frequency.exponentialRampToValueAtTime(600, t + 2.8);
          const g = cc.createGain();
          g.gain.setValueAtTime(0.0001, t);
          g.gain.exponentialRampToValueAtTime(0.012, t + 1.2);
          g.gain.exponentialRampToValueAtTime(0.0001, t + 3);
          o.connect(g).connect(master);
          o.start(t);
          o.stop(t + 3.1);
        }
      };
      return { nodes: [...oscs, wash, washLfo], tick, tickMs: 2500 };
    });
    h.setLevel(0.12);
    return h;
  } catch {
    return NO_LOOP;
  }
}

// Weather layer: rain rides the street bus so it ducks with the bed.
// Thunder NEVER (startle law — this is a safe world).
export function sfxStreetRainLoop(intensity = 0.12, settings) {
  try {
    const c = ok(settings);
    if (!c) return NO_LOOP;
    const street = getStreetBus(c);
    const h = makeLoop(c, (cc, master) => {
      try {
        master.disconnect();
      } catch { /* not yet connected */ }
      master.connect(street);
      const src = noise(cc);
      const hp = cc.createBiquadFilter();
      hp.type = "highpass";
      hp.frequency.value = 1100;
      const lp = cc.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 6000;
      src.connect(hp).connect(lp).connect(master);
      src.start();
      return { nodes: [src] };
    });
    h.setLevel(Math.max(0.02, Math.min(0.3, intensity)));
    return h;
  } catch {
    return NO_LOOP;
  }
}

// The sealed Spire's hum — low 55+82Hz drone, capped very quiet (≈ −20dB).
export function sfxSpireHumLoop(settings) {
  try {
    const c = ok(settings);
    if (!c) return NO_LOOP;
    const street = getStreetBus(c);
    const h = makeLoop(c, (cc, master) => {
      try {
        master.disconnect();
      } catch { /* not yet connected */ }
      master.connect(street);
      const oscs = [55, 82.4].map((f, i) => {
        const o = cc.createOscillator();
        o.type = "sine";
        o.frequency.value = f;
        const g = cc.createGain();
        g.gain.value = i === 0 ? 0.5 : 0.3;
        o.connect(g).connect(master);
        o.start();
        return o;
      });
      return { nodes: oscs };
    });
    h.setLevel(0.09);
    return h;
  } catch {
    return NO_LOOP;
  }
}
