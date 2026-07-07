// ════════════════════════════════════════════════════════════════════════
// THE CROSSING — voice manifest
// Structured for a future ElevenLabs bake (awaits Jon's audition approval).
// Files land in /audio/onboarding/<id>.mp3. Until they exist, the loader
// silently no-ops — exactly like playVoiceLine in sfx.js.
// ════════════════════════════════════════════════════════════════════════

export const CROSSING_VOICE_LINES = [
  // Ignition
  { id: "cx-ignite-1", text: "Most apps hand you a stack of tools and wish you luck. This isn't that." },
  { id: "cx-ignite-2", text: "This is a crossing. On the other side is a version of you that keeps promises." },
  { id: "cx-ignite-3", text: "The goal is the bait. The transformation is the catch. Ready?" },
  // Wall counters
  { id: "cx-counter-vanish", text: "Then meet the Witness. It shows up every single day — that part is handled now." },
  { id: "cx-counter-alone", text: "The Zone will. One declared mission a day, one receipt to prove it — witnessed." },
  { id: "cx-counter-head", text: "There's a whole wing for that. Your head stops being the boss of the map." },
  { id: "cx-counter-unclear", text: "You don't need clarity to start. Starting is how clarity shows up." },
  { id: "cx-counter-everything", text: "You haven't tried it here. That's not the same experiment." },
  // The map reveal
  { id: "cx-map-reveal", text: "The map is built. Concrete days. Concrete reps. No vague promises." },
  // The vow
  { id: "cx-vow-intro", text: "Goals change what you chase. Identity changes what you keep. Say who you are now." },
  { id: "cx-vow-sealed", text: "Sealed. Carry it forward." },
  // The torch
  { id: "cx-torch", text: "You crossed. From here, everything is reps and receipts." },
];

let current = null;

// Silent no-op loader — missing files must never break the crossing.
export function playCrossingVoice(id, { volume = 1 } = {}) {
  try {
    const line = CROSSING_VOICE_LINES.find((l) => l.id === id);
    if (!line) return;
    if (typeof window === "undefined" || typeof Audio === "undefined") return;
    try {
      if (window.localStorage.getItem("zone_sfx_muted") === "1") return;
    } catch {
      // storage unavailable — play on
    }
    if (current) {
      try {
        current.pause();
      } catch {
        // already stopped
      }
    }
    const audio = new Audio(`/audio/onboarding/${id}.mp3`);
    audio.volume = Math.max(0, Math.min(1, volume));
    audio.onerror = () => {}; // file not baked yet — silence, never a crash
    const p = audio.play();
    if (p && typeof p.catch === "function") p.catch(() => {});
    current = audio;
  } catch {
    // never let audio take down the crossing
  }
}

export function stopCrossingVoice() {
  try {
    if (current) current.pause();
  } catch {
    // already stopped
  }
  current = null;
}
