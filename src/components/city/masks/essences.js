// ════════════════════════════════════════════════════════════════════════
// MASK ENCOUNTERS — the Essences (finisher currency)
// Ported verbatim from name-the-critic-2.html ESSENCES[]. Pure data.
// Each staggered boss is starving for one of these — returning the right
// one is the finisher; the wrong one deflects. The affirmation is spoken,
// the proofs seed the Proof Lock chips.
// ════════════════════════════════════════════════════════════════════════

export const ESSENCES = [
  {
    id: "radiance",
    name: "RADIANCE",
    emoji: "✨",
    color: "#FFD84D",
    beam: "#ffe9a0",
    aff: "I let my light be seen.",
    proofs: ["Record the content", "Write the post", "Share the message", "Let yourself be seen"],
  },
  {
    id: "love",
    name: "LOVE",
    emoji: "❤️",
    color: "#FF3EDB",
    beam: "#ff9ae8",
    aff: "I lead from an open heart, not defense.",
    proofs: ["Send the text", "Pray", "Forgive", "Tell the truth kindly"],
  },
  {
    id: "joy",
    name: "JOY",
    emoji: "😆",
    color: "#ffe44d",
    beam: "#fff2a0",
    aff: "I return to freedom, play, and aliveness.",
    proofs: ["Go for a walk", "Move your body", "Play music", "One fun thing, zero guilt"],
  },
  {
    id: "power",
    name: "POWER",
    emoji: "⚡",
    color: "#00F0FF",
    beam: "#9df4ff",
    aff: "I take responsibility and move with strength.",
    proofs: ["Make the call", "Do the workout", "Finish the task", "Do the thing you're avoiding"],
  },
  {
    id: "majesty",
    name: "MAJESTY",
    emoji: "👑",
    color: "#B06DFF",
    beam: "#d8b5ff",
    aff: "I walk with dignity, faith, and purpose.",
    proofs: ["Clean your environment", "Dress like your future self", "Raise the standard", "Lead the room"],
  },
];

export function getEssence(id) {
  return ESSENCES.find((e) => e.id === id) || null;
}
