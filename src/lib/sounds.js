// Tiny synth sounds via the Web Audio API — zero asset files, always fails silently.

let audioCtx = null;

function getCtx() {
  if (typeof window === "undefined") return null;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  if (!audioCtx) {
    try {
      audioCtx = new Ctx();
    } catch {
      return null;
    }
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

function tone(ctx, { freq = 440, start = 0, duration = 0.12, type = "sine", gain = 0.08 }) {
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
  g.gain.setValueAtTime(0.0001, ctx.currentTime + start);
  g.gain.exponentialRampToValueAtTime(gain, ctx.currentTime + start + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + duration);
  osc.connect(g).connect(ctx.destination);
  osc.start(ctx.currentTime + start);
  osc.stop(ctx.currentTime + start + duration + 0.05);
}

const SOUND_RECIPES = {
  pop: [{ freq: 660, duration: 0.08, type: "triangle", gain: 0.09 }],
  click: [{ freq: 320, duration: 0.05, type: "square", gain: 0.05 }],
  chime: [
    { freq: 880, duration: 0.18, type: "sine" },
    { freq: 1320, start: 0.08, duration: 0.2, type: "sine", gain: 0.06 }
  ],
  tada: [
    { freq: 523, duration: 0.12, type: "triangle" },
    { freq: 659, start: 0.1, duration: 0.12, type: "triangle" },
    { freq: 784, start: 0.2, duration: 0.25, type: "triangle", gain: 0.1 }
  ],
  reward: [
    { freq: 587, duration: 0.12, type: "sine" },
    { freq: 784, start: 0.1, duration: 0.12, type: "sine" },
    { freq: 988, start: 0.2, duration: 0.14, type: "sine" },
    { freq: 1175, start: 0.32, duration: 0.3, type: "sine", gain: 0.1 }
  ],
  levelup: [
    { freq: 392, duration: 0.1, type: "sawtooth", gain: 0.05 },
    { freq: 523, start: 0.1, duration: 0.1, type: "sawtooth", gain: 0.05 },
    { freq: 659, start: 0.2, duration: 0.1, type: "sawtooth", gain: 0.05 },
    { freq: 784, start: 0.3, duration: 0.35, type: "triangle", gain: 0.1 }
  ],
  insight: [
    { freq: 528, duration: 0.14, type: "sine", gain: 0.06 },
    { freq: 660, start: 0.12, duration: 0.22, type: "sine", gain: 0.07 }
  ]
};

export function playSound(name, settings) {
  try {
    if (settings && settings.soundEnabled === false) return;
    const recipe = SOUND_RECIPES[name];
    if (!recipe) return;
    const ctx = getCtx();
    if (!ctx) return;
    recipe.forEach((step) => tone(ctx, step));
  } catch {
    // fail silently — sound is never worth a crash
  }
}

// Counter-Strike-style escalating "kill streak" announcer sting.
// Higher `level` = higher pitch, more layers, and a deeper sub-bass boom.
export function playStreak(level = 1, settings) {
  try {
    if (settings && settings.soundEnabled === false) return;
    const ctx = getCtx();
    if (!ctx) return;
    const n = Math.max(1, Math.min(7, Math.round(level)));
    const base = 392 * Math.pow(1.0905, n - 1); // climbs ~a semitone per streak step
    const steps = [
      { freq: base,       duration: 0.07, type: "square",   gain: 0.05 },
      { freq: base * 1.5, start: 0.05, duration: 0.1,  type: "triangle", gain: 0.08 },
    ];
    if (n >= 3) steps.push({ freq: base * 2,   start: 0.11, duration: 0.13, type: "triangle", gain: 0.09 });
    if (n >= 4) steps.push({ freq: base * 2.5, start: 0.18, duration: 0.14, type: "sine",     gain: 0.09 });
    if (n >= 5) steps.push({ freq: base * 3,   start: 0.24, duration: 0.18, type: "sine",     gain: 0.10 });
    if (n >= 6) steps.push({ freq: 65,         start: 0.0,  duration: 0.45, type: "sawtooth", gain: 0.10 });
    if (n >= 7) {
      steps.push({ freq: base * 4, start: 0.30, duration: 0.32, type: "sine",     gain: 0.11 });
      steps.push({ freq: 49,       start: 0.0,  duration: 0.60, type: "sawtooth", gain: 0.12 });
    }
    steps.forEach((s) => tone(ctx, s));
  } catch {
    // fail silently
  }
}
