// AI studio voice-over via Pollinations.ai (openai-audio model).
// Browser-compatible, no API key required — same provider as our FLUX image gen.
// Always degrades gracefully: if the network/endpoint fails it falls back to the
// device's built-in speech engine so a guided meditation still narrates aloud.

import { hasAiConsent } from "./aiConsent.js";

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

// Real ElevenLabs voice, streamed at runtime through our own serverless proxy
// (netlify/functions/tts) so the API key never touches the client. Used for
// DYNAMIC lines that can't be pre-baked (e.g. Full Court's announcer reading the
// live box score). Returns a same-origin URL — 404s harmlessly in local dev
// unless `netlify dev` is running, in which case the chain falls through below.
export function buildElevenUrl(text, voiceId) {
  return `/.netlify/functions/tts?voice=${encodeURIComponent(voiceId)}&text=${encodeURIComponent(text)}`;
}

// Preload an <audio> element for a guided line so it's ready the moment its
// scene begins. Sources are tried in order until one plays; the device speech
// engine is the final offline fallback:
//   localSrc (baked mp3) → ElevenLabs proxy (opts.elevenVoiceId) → Pollinations
// Pass opts.elevenVoiceId to stream a real ElevenLabs voice for dynamic copy.
// Returns null in non-browser environments.
export function createLineAudio(text, voice = "onyx", localSrc = null, opts = {}) {
  if (typeof Audio === "undefined") return null;
  try {
    const sources = [];
    if (localSrc) sources.push(localSrc);
    if (opts.elevenVoiceId) sources.push(buildElevenUrl(text, opts.elevenVoiceId));
    // Pollinations is the last remote fallback — and it only gets used with
    // consent. This path is not always scripted copy: CLEARDAY's Incantation
    // speaks the user's OWN identity claim and devotion line, and there is no
    // baked mp3 for a sentence they wrote themselves, so without this guard
    // their recovery statement would leave the device unasked (5.1.2).
    // Declining costs nothing audible: the on-device speech engine below is
    // still the final fallback, so every guided line still narrates.
    if (hasAiConsent("pollinations")) sources.push(buildVoiceUrl(text, voice));
    if (!sources.length) return null; // nothing to preload; caller falls through to synth
    const a = new Audio(sources[0]);
    a.preload = "auto";
    a._fallbackSrcs = sources.slice(1); // ordered remaining remotes; synth is the final fallback
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

  // A source failed → advance to the next remote in the ordered chain
  // (ElevenLabs proxy → Pollinations). When the chain is exhausted, drop to the
  // device speech engine. Returns true if another remote was kicked off.
  const fallbackRemote = () => {
    const list = audio._fallbackSrcs;
    if (!list || !list.length) return false;
    const next = list.shift();
    try {
      audio.src = next;
      audio.load();
      const p = audio.play();
      if (p && typeof p.catch === "function") {
        p.catch(() => {
          if (!fallbackRemote()) speakWithSynth(text, settings);
        });
      }
      return true;
    } catch {
      return fallbackRemote();
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
