// ─────────────────────────────────────────────────────────────────────────
// Ride the Wave — baked audio manifest.
// Voice lines follow the waveCopy law: calming, non-clinical, non-shaming.
// No "calm down", no medical claims, no urgency. The guide whispers beside
// you; she never instructs from above. Baked by scripts/bake-wave-audio.js
// to public/audio/wave/<id>.mp3.
// ─────────────────────────────────────────────────────────────────────────

// Breathy, meditative delivery — low stability lets the voice sway.
const SOFT = { stability: 0.38, similarity_boost: 0.7, style: 0.3, use_speaker_boost: true };
const SOFTER = { stability: 0.32, similarity_boost: 0.65, style: 0.35, use_speaker_boost: true };

export const WAVE_VOICE_LINES = [
  // Phase intros — one per screen, plays as the screen arrives.
  { id: "v-welcome", voice: "lily", delivery: SOFT,
    text: "Welcome. You found your way here — that's the first brave thing. Ninety seconds… let's ride this one out together." },
  { id: "v-ground", voice: "lily", delivery: SOFT,
    text: "Press your feet into the floor… rest your thumb on the circle. You are here. Nothing to fix yet… we're just arriving." },
  { id: "v-ride", voice: "lily", delivery: SOFT,
    text: "Now we ride. Let the button go as you breathe in… press and hold as you breathe out, long and slow. You're not fighting the wave… you're surfing it." },
  { id: "v-scan", voice: "lily", delivery: SOFT,
    text: "The wave is passing. Look around, slowly… and come back to the room." },
  { id: "v-release", voice: "lily", delivery: SOFT,
    text: "Somewhere, your body is still holding on. Find one place… and let it soften." },
  { id: "v-proof", voice: "lily", delivery: SOFT,
    text: "You can feel this… and still choose. Pick one small, brave thing." },
  { id: "v-complete", voice: "lily", delivery: SOFT,
    text: "The wave moved through… and you stayed. Look — the light is coming back." },

  // Breath cues — rotated variants so the guide never sounds like a metronome.
  // She rides the first waves with you, then steps back and lets the ocean lead.
  { id: "v-in-1", voice: "lily", delivery: SOFTER, text: "Breathe in… let it rise…" },
  { id: "v-in-2", voice: "lily", delivery: SOFTER, text: "In… nice and easy…" },
  { id: "v-in-3", voice: "lily", delivery: SOFTER, text: "Let the air come to you…" },
  { id: "v-out-1", voice: "lily", delivery: SOFTER, text: "And slowly… all the way out…" },
  { id: "v-out-2", voice: "lily", delivery: SOFTER, text: "Long… slow… let it go…" },
  { id: "v-out-3", voice: "lily", delivery: SOFTER, text: "Out with the tide…" },

  // Gentle return lines — replace the silent NUDGES when the rhythm drifts.
  { id: "v-back-1", voice: "lily", delivery: SOFTER, text: "Come back on the next breath… no need to be perfect." },
  { id: "v-back-2", voice: "lily", delivery: SOFTER, text: "You're still here… ride the next one." },
];

// Ambient beds + one-shots via the ElevenLabs sound-effects API.
// `seconds` is the requested length; `loop` asks for a seamless loop.
export const WAVE_AMBIENCE = [
  { id: "ocean-loop", seconds: 30, loop: true,
    text: "Gentle ocean waves rolling softly onto a calm shore at night, slow rhythmic wash of foam, distant deep water, peaceful, warm, meditative, seamless loop, no music" },
  { id: "deep-loop", seconds: 30, loop: true,
    text: "Soft underwater ambience, deep calm sea, slow muffled water movement, low warm hum of the deep ocean, soothing, meditative drone, seamless loop, no music" },
  { id: "swell", seconds: 8, loop: false,
    text: "A single gentle ocean wave slowly rising, cresting softly and washing out onto sand, calm and soothing, no music" },
  { id: "shimmer", seconds: 6, loop: false,
    text: "Soft ethereal shimmer resolving over calm water at dawn, gentle warm glassy chime wash, peaceful resolution, fading to quiet" },
];
