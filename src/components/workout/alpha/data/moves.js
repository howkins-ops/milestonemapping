/* ALPHA MODE — signature moves.
   Mastery-tier lifts with in-house lore names (no source-book branding).
   `genericName` keeps the recognizable movement for form reference. */

export const SIGNATURE_MOVES = [
  {
    id: "spearpoint",
    name: "The Spearpoint",
    genericName: "one-arm barbell overhead press",
    unlockPhase: "prime",
    cue: "Grip the bar mid-shaft, one hand. Free arm extended for balance. Press the spear to the sky — the wobble IS the work.",
  },
  {
    id: "crown-press",
    name: "The Crown Press",
    genericName: "shoulder-to-shoulder overhead press",
    unlockPhase: "adapt",
    cue: "Bar rests on one shoulder, hands together mid-bar. Press overhead, lower to the OTHER shoulder. You are knighting yourself. Alternate the lead hand each set.",
  },
  {
    id: "kingmaker",
    name: "The Kingmaker",
    genericName: "double-overhand two-thirds deadlift",
    unlockPhase: "adapt",
    cue: "Double-overhand grip. Sink two-thirds of the way down, drive the heels, pull the hips through to lockout. Crowns are earned from the floor up.",
  },
];

export const moveByName = (name) =>
  SIGNATURE_MOVES.find((m) => m.name === name || m.genericName === name) || null;
