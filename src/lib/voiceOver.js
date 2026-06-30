// AI studio voice-over via Pollinations.ai (openai-audio model).
// Browser-compatible, no API key required — same provider as our FLUX image gen.
// Always degrades gracefully: if the network/endpoint fails it falls back to the
// device's built-in speech engine so a guided meditation still narrates aloud.

const TTS_BASE = "https://text.pollinations.ai";

// The six studio voices Pollinations exposes. Ordered for meditation warmth first.
export const VOICES = [
  { key: "onyx", label: "Onyx", desc: "Warm · grounded" },
  { key: "shimmer", label: "Shimmer", desc: "Soft · calming" },
  { key: "nova", label: "Nova", desc: "Bright · friendly" },
  { key: "fable", label: "Fable", desc: "Storyteller" },
  { key: "echo", label: "Echo", desc: "Deep · resonant" },
  { key: "alloy", label: "Alloy", desc: "Neutral · clear" },
];

export function buildVoiceUrl(text, voice = "onyx") {
  return `${TTS_BASE}/${encodeURIComponent(text)}?model=openai-audio&voice=${voice}`;
}

// Preload an <audio> element for a guided line so it's ready the moment its
// scene begins. If `localSrc` is given (a pre-baked ElevenLabs mp3) it plays
// first, with the streamed Pollinations voice kept as an automatic fallback.
// Returns null in non-browser environments.
export function createLineAudio(text, voice = "onyx", localSrc = null) {
  if (typeof Audio === "undefined") return null;
  try {
    const remote = buildVoiceUrl(text, voice);
    const a = new Audio(localSrc || remote);
    a.preload = "auto";
    if (localSrc) a._fallbackSrc = remote; // local mp3 first; stream if it fails to load
    return a;
  } catch {
    return null;
  }
}

// Speak via the browser's built-in voice — the offline / failure fallback.
function speakWithSynth(text, settings) {
  try {
    if (settings && settings.soundEnabled === false) return;
    const synth = typeof window !== "undefined" && window.speechSynthesis;
    if (!synth) return;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.84; // slow, meditative cadence
    u.pitch = 0.96;
    const voices = synth.getVoices() || [];
    const pick =
      voices.find((v) => /samantha|serena|daniel|google uk english female|female/i.test(v.name)) ||
      voices.find((v) => v.lang && v.lang.toLowerCase().startsWith("en"));
    if (pick) u.voice = pick;
    synth.speak(u);
  } catch {
    // narration is never worth a crash
  }
}

// Play one guided line. Tries the AI studio voice first; on any failure
// (load error or blocked playback) it falls back to the device speech engine.
export function playLine(audio, text, settings) {
  if (settings && settings.soundEnabled === false) return;
  if (!audio) {
    speakWithSynth(text, settings);
    return;
  }

  // Pre-baked local file failed → swap to the streamed AI voice once; if that
  // can't play either, drop to the device speech engine. Returns true if a
  // remote fallback was kicked off.
  const fallbackRemote = () => {
    if (!audio._fallbackSrc) return false;
    const fb = audio._fallbackSrc;
    audio._fallbackSrc = null;
    try {
      audio.src = fb;
      audio.load();
      const p = audio.play();
      if (p && typeof p.catch === "function") p.catch(() => speakWithSynth(text, settings));
      return true;
    } catch {
      return false;
    }
  };

  audio.onerror = () => {
    if (!fallbackRemote()) speakWithSynth(text, settings);
  };

  // The local source may have already failed during preload, before this
  // handler was attached — handle that synchronously so we still reach the
  // streamed AI voice instead of jumping straight to synth.
  if (audio.error) {
    if (!fallbackRemote()) speakWithSynth(text, settings);
    return;
  }

  try {
    audio.currentTime = 0;
    const p = audio.play();
    if (p && typeof p.catch === "function") {
      p.catch(() => {
        if (!fallbackRemote()) speakWithSynth(text, settings);
      });
    }
  } catch {
    if (!fallbackRemote()) speakWithSynth(text, settings);
  }
}

// Stop everything — paused AI audio elements and any in-flight device speech.
export function stopNarration(audioList) {
  try {
    (audioList || []).forEach((a) => {
      if (!a) return;
      a.pause();
      try {
        a.currentTime = 0;
      } catch {
        // some browsers throw if not yet loaded — ignore
      }
    });
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  } catch {
    // ignore
  }
}
