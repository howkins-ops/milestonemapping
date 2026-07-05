// Big game SFX via the Web Audio API — impacts, storms, fire, water, voices.
// Same philosophy as sounds.js: zero asset files, always fails silently.
// Everything routes through a shared compressor bus so stacked BAMs stay loud
// without clipping. Voice lines are baked mp3s under /audio/anger/.

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
