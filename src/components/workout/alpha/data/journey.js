/* ALPHA MODE — the world spine: 11 Hero's Journey stages.
   Stages 1–4 are the onboarding story, 5–8 are the playable phase-zones,
   9–11 are the endgame. The map IS this list. */

export const JOURNEY = [
  {
    n: 1, key: "ordinary", kind: "onboarding", title: "The Ordinary World",
    blurb: "Familiar is not the same as comfortable. Look around honestly.",
  },
  {
    n: 2, key: "call", kind: "onboarding", title: "The Call",
    blurb: "Calls are quiet, random, easy to miss. Your job is to be awake when one lands.",
  },
  {
    n: 3, key: "refusal", kind: "onboarding", title: "The Refusal",
    blurb: "The 'this is bullshit' moment is expected. It's fear of inadequacy wearing a disguise.",
  },
  {
    n: 4, key: "mentor", kind: "onboarding", title: "The Mentor",
    blurb: "What can't be taught is the mental hurdle. That's resolved with trust, not information.",
  },
  {
    n: 5, key: "threshold", kind: "zone", zone: "prime", title: "Crossing the Threshold",
    blurb: "PRIME — the threshold guardian. Reset the gatekeeper hormone. Often the hardest part.",
  },
  {
    n: 6, key: "trials", kind: "zone", zone: "adapt", title: "The Road of Trials",
    blurb: "ADAPT — density training, the drive engine, and the first real Cheat Day.",
  },
  {
    n: 7, key: "approach", kind: "zone", zone: "surge", title: "The Approach",
    blurb: "SURGE — slow fire. Build without bloat. The growth hormone burn.",
  },
  {
    n: 8, key: "ordeal", kind: "zone", zone: "surge", title: "The Ordeal",
    blurb: "The all-in hand. Every system tested at once. The wall is the way.",
  },
  {
    n: 9, key: "reward", kind: "zone", zone: "complete", title: "The Reward",
    blurb: "COMPLETE — all four powers trained together, one week at a time.",
  },
  {
    n: 10, key: "roadback", kind: "zone", zone: "complete", title: "The Road Back",
    blurb: "The program becomes a life. Rotation, rhythm, and the long game.",
  },
  {
    n: 11, key: "elixir", kind: "finale", title: "Return with the Elixir",
    blurb: "If you can change this, you can change anything. Now hand the torch forward.",
  },
];

/* why answer the call — the six reward cards, each tied to a stat dial */
export const REWARD_BOARD = [
  { id: "abs", title: "See the Line", line: "The visible proof. Confidence you can point at.", stat: "insulin" },
  { id: "armor", title: "Build the Armor", line: "Muscle is protection — against disease, against doubt.", stat: "testosterone" },
  { id: "drive", title: "Reclaim the Drive", line: "Hormone-driven, lifestyle-fixable. No shots, no creams.", stat: "testosterone" },
  { id: "confidence", title: "Earn the Quiet", line: "An honest appraisal of what you can and can't do — yet.", stat: "gh" },
  { id: "sleep", title: "Win the Night", line: "Break the stress–insomnia loop. Sleep is the regen system.", stat: "cortisol" },
  { id: "skin", title: "Glow from Inside", line: "Growth hormone up, stress down — it shows on the surface.", stat: "gh" },
];

/* choose-your-adventure archetypes (flavor + mentor tone) */
export const ARCHETYPES = [
  {
    id: "doubter", name: "The Doubter",
    line: "You've trained before. You've heard it all. Prove-it mode: granted.",
    mentorTone: "evidence-first",
  },
  {
    id: "returner", name: "The Returner",
    line: "You had it once and life took it. The road back is shorter than you think.",
    mentorTone: "steady-hand",
  },
  {
    id: "rookie", name: "The Rookie",
    line: "Blank page. No bad habits to unlearn. The strongest place to start.",
    mentorTone: "first-principles",
  },
];

export const stageForPhase = (phaseId) =>
  JOURNEY.find((s) => s.zone === phaseId)?.n ?? 5;
