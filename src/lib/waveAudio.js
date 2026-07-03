// Ride the Wave soundscape — baked ElevenLabs ocean beds + guide voice, mixed
// live through the Web Audio API so the sea physically swells with the breath.
// Philosophy matches sounds.js/sfx.js: always fails silently, never crashes,
// and if a baked mp3 is missing it falls back to a synthesized ocean so the
// experience still works offline.
//
//   const sea = createWaveAudio(settings);
//   sea.start();              // call from a user gesture
//   sea.setBreath("inhale");  // ocean rises with the in-breath
//   sea.voice("v-ride");      // guide speaks, ambience ducks under her
//   sea.swell(); sea.chime(); sea.dawn();
//   sea.stop();               // tide goes out

const AUDIO_BASE = "/audio/wave";

const NO_AUDIO = {
  start() {}, resume() {}, setBreath() {}, voice() {}, swell() {}, chime() {}, dawn() {}, stop() {},
};

export function createWaveAudio(settings) {
  try {
    if (typeof window === "undefined") return NO_AUDIO;
    if (settings && settings.soundEnabled === false) return NO_AUDIO;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return NO_AUDIO;

    const ctx = new Ctx();
    const master = ctx.createGain();
    master.gain.value = 0.0001;
    master.connect(ctx.destination);

    // Ambient bus: shore waves on top, deep-water bed underneath.
    const ambient = ctx.createGain();
    ambient.gain.value = 1;
    ambient.connect(master);
    const oceanGain = ctx.createGain();
    oceanGain.gain.value = 0.55;
    oceanGain.connect(ambient);
    const deepGain = ctx.createGain();
    deepGain.gain.value = 0.28;
    deepGain.connect(ambient);

    const buffers = new Map();
    const liveNodes = [];
    let currentVoice = null;
    let stopped = false;

    const loadBuffer = async (id) => {
      if (buffers.has(id)) return buffers.get(id);
      const res = await fetch(`${AUDIO_BASE}/${id}.mp3`);
      if (!res.ok) throw new Error(String(res.status));
      const buf = await ctx.decodeAudioData(await res.arrayBuffer());
      buffers.set(id, buf);
      return buf;
    };

    const startLoop = async (id, gainNode) => {
      const buf = await loadBuffer(id);
      if (stopped) return;
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.loop = true;
      src.connect(gainNode);
      src.start();
      liveNodes.push(src);
    };

    // Synthesized surf for when the baked beds can't load: two slow LFOs
    // breathing volume into filtered noise reads convincingly as distant waves.
    const synthOcean = (gainNode, { lp, lfoHz, depth, base }) => {
      const noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      const src = ctx.createBufferSource();
      src.buffer = noiseBuf;
      src.loop = true;
      const f = ctx.createBiquadFilter();
      f.type = "lowpass";
      f.frequency.value = lp;
      const surf = ctx.createGain();
      surf.gain.value = base;
      const lfo = ctx.createOscillator();
      lfo.frequency.value = lfoHz;
      const lfoAmp = ctx.createGain();
      lfoAmp.gain.value = depth;
      lfo.connect(lfoAmp).connect(surf.gain);
      src.connect(f).connect(surf).connect(gainNode);
      src.start();
      lfo.start();
      liveNodes.push(src, lfo);
    };

    const playOnce = async (id, volume = 0.5) => {
      try {
        const buf = await loadBuffer(id);
        if (stopped) return;
        const src = ctx.createBufferSource();
        src.buffer = buf;
        const g = ctx.createGain();
        g.gain.value = volume;
        src.connect(g).connect(master);
        src.start();
        liveNodes.push(src);
      } catch { /* one-shots are decoration — stay silent */ }
    };

    const duck = (level, tc = 0.4) => {
      try {
        ambient.gain.cancelScheduledValues(ctx.currentTime);
        ambient.gain.setTargetAtTime(level, ctx.currentTime, tc);
      } catch { /* silent */ }
    };

    return {
      start() {
        try {
          if (ctx.state === "suspended") ctx.resume().catch(() => {});
          master.gain.setTargetAtTime(0.9, ctx.currentTime, 1.6);
          startLoop("ocean-loop", oceanGain).catch(() =>
            synthOcean(oceanGain, { lp: 900, lfoHz: 0.07, depth: 0.28, base: 0.4 }));
          startLoop("deep-loop", deepGain).catch(() =>
            synthOcean(deepGain, { lp: 240, lfoHz: 0.045, depth: 0.1, base: 0.5 }));
        } catch { /* silent */ }
      },

      // Browsers may suspend the context until a user gesture; call this from
      // any pointer/key event to unlock the already-scheduled loops.
      resume() {
        try {
          if (ctx.state === "suspended") ctx.resume().catch(() => {});
        } catch { /* silent */ }
      },

      // The tide breathes with the user: shore waves swell on the inhale and
      // release slowly on the exhale while the deep bed does the opposite.
      setBreath(phase) {
        try {
          const t = ctx.currentTime;
          oceanGain.gain.cancelScheduledValues(t);
          deepGain.gain.cancelScheduledValues(t);
          if (phase === "inhale") {
            oceanGain.gain.setTargetAtTime(0.85, t, 1.4);
            deepGain.gain.setTargetAtTime(0.2, t, 1.4);
          } else {
            oceanGain.gain.setTargetAtTime(0.42, t, 2.2);
            deepGain.gain.setTargetAtTime(0.34, t, 2.2);
          }
        } catch { /* silent */ }
      },

      // Baked guide line; the sea leans back while she speaks.
      voice(id, volume = 1) {
        try {
          if (typeof Audio === "undefined") return;
          if (currentVoice) {
            try { currentVoice.pause(); } catch { /* silent */ }
          }
          const a = new Audio(`${AUDIO_BASE}/${id}.mp3`);
          a.volume = Math.max(0, Math.min(1, volume));
          duck(0.4);
          const restore = () => duck(1, 0.9);
          a.onended = restore;
          a.onerror = restore;
          currentVoice = a;
          a.play().catch(restore);
        } catch { /* silent */ }
      },

      swell() { playOnce("swell", 0.5); },
      chime() { playOnce("shimmer", 0.6); },

      // The wave has passed: the deep recedes, the shore settles into morning.
      dawn() {
        try {
          const t = ctx.currentTime;
          deepGain.gain.setTargetAtTime(0.08, t, 3);
          oceanGain.gain.setTargetAtTime(0.5, t, 3);
        } catch { /* silent */ }
      },

      stop() {
        if (stopped) return;
        stopped = true;
        try {
          if (currentVoice) { currentVoice.pause(); currentVoice = null; }
          master.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.5);
          setTimeout(() => {
            try {
              liveNodes.forEach((n) => n.stop && n.stop());
              ctx.close().catch(() => {});
            } catch { /* silent */ }
          }, 1800);
        } catch { /* silent */ }
      },
    };
  } catch {
    return NO_AUDIO;
  }
}
