// "Fill Your Cup" spoken affirmations — a fun, warm woman's voice cheering you
// on the moment you drink your full cup. Single source of truth: the runtime
// (src/lib/sfx.js → speakRefreshed) plays public/audio/cup/<id>.mp3 and falls
// back to the device voice using the same text if the mp3 is missing.
// Bake with:  node scripts/bake-cup-voices.js   (--force to re-bake).

// Voice: jessica — young, warm, expressive female (premade, free-tier safe).
// Delivery: loose + playful so the "ahh" lands with real personality.
const FUN = { stability: 0.35, similarity_boost: 0.8, style: 0.6, use_speaker_boost: true };

export const CUP_VOICE = "jessica";

export const CUP_VOICE_LINES = [
  { id: "cup-refreshed-0", text: "Ahhh! I'm refreshed. I feel full.", delivery: FUN },
  { id: "cup-refreshed-1", text: "Mmm, that hit the spot. I feel so good!", delivery: FUN },
  { id: "cup-refreshed-2", text: "Ahh, my cup is full — and so am I!", delivery: FUN },
  { id: "cup-refreshed-3", text: "Refreshed, recharged, and ready to go!", delivery: FUN },
  { id: "cup-refreshed-4", text: "Ohh yes. That is exactly what I needed.", delivery: FUN },
  { id: "cup-refreshed-5", text: "Ahhh. I took care of me today, and it feels amazing.", delivery: FUN },
];
