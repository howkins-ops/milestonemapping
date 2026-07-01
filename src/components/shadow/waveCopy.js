// ─────────────────────────────────────────────────────────────────────────
// Anxiety Wave Rider — "Ride the Wave" copy constants.
// Calming, non-clinical, non-shaming. No medical claims, no "calm down",
// no "you failed", no "breathing detected", no "cures panic".
// The win is *returning* to the rhythm, never perfection.
// ─────────────────────────────────────────────────────────────────────────

// Default paced-breathing pattern — ~6 breaths/min (HRV-style). No breath holds
// in SOS mode; holds can feel uncomfortable when you're already activated.
export const BREATH_PATTERN = { inhaleSeconds: 4, exhaleSeconds: 6 };

// How many breath cycles make up the "ride" (≈ 4–5 × 10s ≈ 45s).
export const RIDE_CYCLES = 5;

// Gentle nudges shown when the held/released state drifts from the cue.
// Chosen at random-ish (by cycle index) so it never feels like the same scold.
export const NUDGES = [
  "Come back on the next breath.",
  "You're still here.",
  "No need to be perfect.",
  "Ride the next breath.",
];

// ── Safety ────────────────────────────────────────────────────────────────
export const SAFETY = {
  title: "Before we ride",
  body:
    "This tool is for anxiety regulation and emotional grounding. It is not medical care or a diagnosis. If you have new, severe, or unusual chest pain, fainting, severe shortness of breath, or symptoms that feel medically dangerous, seek emergency help.",
  crisis:
    "If you are in immediate danger or may hurt yourself, contact emergency services or a crisis line now.",
  accept: "I understand — begin",
};

// ── Phase content ───────────────────────────────────────────────────────────
export const GROUND = {
  eyebrow: "The wave is rising",
  heading: "Feet down. Thumb on screen. You are here.",
  lead:
    "Press your feet into the floor and rest your thumb on the circle. Nothing to fix yet — we're just arriving. The wave can rise and pass. You can ride it.",
  science:
    "Naming where you are and feeling your body's contact with the ground signals safety to the nervous system — an anchor before the breath work begins.",
  cta: "I'm here →",
};

export const RIDE = {
  eyebrow: "Ride the wave",
  heading: "Release to inhale. Hold to exhale.",
  lead:
    "Let the button go as you breathe in. Press and hold as you breathe out, long and slow. You're not fighting the wave — you're surfing it.",
  science:
    "A longer exhale nudges the vagus nerve and eases physiological arousal. Around six breaths a minute is a common paced-breathing rhythm — the win is simply staying with it.",
  inhaleLabel: "Release",
  inhaleSub: "inhale gently",
  exhaleLabel: "Hold",
  exhaleSub: "exhale slowly",
  aria: {
    inhale: "Release the button and inhale gently.",
    exhale: "Press and hold the button while exhaling slowly.",
  },
  cta: "The wave is passing →",
};

// Reality scan — a shortened 5-4-3-2-1 that works while activated (tap-only).
export const SCAN = {
  eyebrow: "Find reality",
  heading: "Tap what is here.",
  lead: "Look around slowly. Tap each one as you actually notice it — no rush.",
  cards: [
    { sense: "see", label: "Something I can see" },
    { sense: "see", label: "Something I can see" },
    { sense: "see", label: "Something I can see" },
    { sense: "feel", label: "Something I can feel" },
    { sense: "feel", label: "Something I can feel" },
    { sense: "hear", label: "A sound I can hear" },
  ],
  cta: "I'm back in the room →",
};

export const RELEASE = {
  eyebrow: "Release the armor",
  heading: "Unclench one thing.",
  lead: "Pick one place holding tension, then let it soften for a few breaths.",
  options: [
    "Drop my shoulders",
    "Unclench my jaw",
    "Open my hands",
    "Relax my stomach",
    "Let my feet press the floor",
  ],
  holdSeconds: 3,
  holding: "Softening…",
  cta: "Done →",
};

export const PROOF = {
  eyebrow: "Choose your proof",
  heading: "One tiny brave action.",
  lead:
    "You can feel this and still choose. Pick one small thing to do next — that's your Courage Proof.",
  options: [
    "Drink some water",
    "Sit for 30 more seconds",
    "Step outside",
    "Text someone",
    "Continue the mission",
    "Rest",
    "Pray",
    "Breathe again",
    "Journal one line",
  ],
  cta: "Log my proof →",
};

export const COMPLETE = {
  eyebrow: "Wave ridden",
  title: "The wave moved through.",
  lead: "You stayed with yourself. That counts.",
  again: "Ride another wave",
  done: "Return",
};

// Optional before/after check-in (always skippable — never forced in panic).
export const INTENSITY = {
  before: "How big is the wave right now?",
  after: "Where is the wave now?",
  skip: "Skip",
  low: "barely there",
  high: "overwhelming",
};
