// ════════════════════════════════════════════════════════════════════════
// THE CRUCIBLE — battle copy for the five masks of the Shadow Alchemist.
//
// LAW OF NO REPEATS: every line here is NEW. The City's Mask Encounters
// (src/components/city/masks/maskBosses.js) is a voice-locked 1:1 port of
// the name-the-critic concept — its attack lines, fear chips and essence
// grid belong to the street and must never appear here. The Crucible speaks
// in the alchemist's register instead: the mask argues like a lawyer, not a
// bully, because by this point in the flow the player has already named it.
//
// STRUCTURE — the Magnum Opus, the four stages Jung mapped onto
// individuation (Psychology and Alchemy, 1944):
//   NIGREDO     blackening — the lead speaks; you catch its lines
//   ALBEDO      washing    — your OWN victim story comes back at you
//   CITRINITAS  yellowing  — the mask asks its real question
//   RUBEDO      reddening  — the metal runs
//
// Each nigredo plate carries a `hot` word: the load-bearing lie. Inside THE
// SPACE (the dilated window) hitting that exact word is the clean break.
// The `hot` string MUST appear verbatim in `line` or the highlighter falls
// back to a whole-line tap (still a valid, weaker strike — never a fail).
// ════════════════════════════════════════════════════════════════════════

export const STAGES = ["nigredo", "albedo", "citrinitas", "rubedo"];

export const STAGE_META = {
  nigredo: {
    name: "NIGREDO",
    en: "The Blackening",
    note: "The lead speaks. Catch it in the space before it lands.",
    tint: "#8d93a6",
  },
  albedo: {
    name: "ALBEDO",
    en: "The Washing",
    note: "The plates are off. What's left is in your own handwriting.",
    tint: "#dfe6f2",
  },
  citrinitas: {
    name: "CITRINITAS",
    en: "The Yellowing",
    note: "It stops attacking and finally asks what it wanted to ask.",
    tint: "#ffd84d",
  },
  rubedo: {
    name: "RUBEDO",
    en: "The Reddening",
    note: "Melting point. Pour it.",
    tint: "#ff7a3d",
  },
};

// Purity — the ONE meter in this fight. Not his health, not yours: the
// state of the metal you are both made of. Starts cold, ends molten.
// Balanced so a run actually spreads. Ceiling before Rubedo is 99 (see
// PURITY_CEIL) — hitting exactly 100 is the melting-point event, never
// something you grind to. Reachable range at melting point is ~40–98:
//   flawless   12 + 4×12 + 3×8 + 14 = 98
//   competent  12 + 4×5  + 3×8 + 14 = 70
//   scrappy    ~40 after several misses, a swing and a dodge
export const PURITY_START = 12;
export const PURITY_FLOOR = 8;
export const PURITY_CEIL = 99;
export const PURITY_CLEAN = 12; // clean break — hot word struck inside the space
export const PURITY_BREAK = 5; // ordinary break — struck the space, missed the word
export const PURITY_LAND = -7; // the line landed on you
export const PURITY_WITNESS = 8; // let your own words pass through
export const PURITY_SWING = -10; // swung at your own words
export const PURITY_TRUE = 14; // answered the question honestly
export const PURITY_DODGE = -12; // took the flattering answer

// Timing — the catch window. `ring` is how long the ring takes to close;
// `band` is the half-width of the perfect zone in ms either side of the
// seam. Assist widens both after repeated misses (nobody gets stuck).
export const RING_MS = 1250;
export const RING_BAND = 150;
export const ASSIST_RING_STEP = 260; // slower ring per assist level
export const ASSIST_BAND_STEP = 70; // wider perfect zone per assist level
export const MAX_ASSIST = 3;
export const SPACE_MS = 1900; // how long the dilated window stays open
export const WITNESS_MS = 3400; // how long one of your own lines takes to pass

// ── Per-mask battle content ──────────────────────────────────────────────
// Keyed by maskCards id (src/data/maskCards.js).
export const CRUCIBLE = {
  "broke-king": {
    effigy: "king",
    lead: "#FFD84D",
    molten: "#ffb02e",
    crucible: "#3a2c05",
    epithet: "CAST IN POTENTIAL",
    seize: "It has been wearing your face at every table you sat down at.",
    nigredo: [
      { line: "Potential is the same thing as proof.", hot: "proof" },
      { line: "You'll start when the conditions are right.", hot: "conditions" },
      { line: "Wanting it this badly has to count for something.", hot: "count" },
      { line: "Stay a king in your head. It's safer up there.", hot: "safer" },
    ],
    albedo: [
      "They never gave me a real shot.",
      "Nobody handed me what they handed him.",
      "If I'd started where they started, I'd already be there.",
    ],
    citrinitas: {
      ask: "Where am I acting smaller than who I know I am?",
      answers: [
        { text: "I've been spending the gift on the story of the gift.", truth: true },
        { text: "I'm being patient. The right season hasn't arrived yet.", truth: false, sting: "That's the same sentence you said last year. It's a season with no end." },
        { text: "I'm protecting the vision from a world that isn't ready for it.", truth: false, sting: "The world isn't guarding it. You are. From daylight." },
      ],
    },
    rubedo: "The crown was never the problem. The empty hands were.",
  },

  "addict-saint": {
    effigy: "saint",
    lead: "#FF3EDB",
    molten: "#ff6ad5",
    crucible: "#3a0a2c",
    epithet: "CAST IN RELIEF",
    seize: "It has been kneeling for you and reaching behind its back the whole time.",
    nigredo: [
      { line: "You can be holy tomorrow. Tonight you're tired.", hot: "tomorrow" },
      { line: "This is medicine, not a habit.", hot: "medicine" },
      { line: "God understands. He's the one who made you like this.", hot: "understands" },
      { line: "Go on then — feel all of it sober and see what's left.", hot: "sober" },
    ],
    albedo: [
      "Nobody knows how heavy this has been to carry.",
      "If they had stayed, I wouldn't need it.",
      "It's the only thing that never walked out on me.",
    ],
    citrinitas: {
      ask: "What am I reaching for instead of feeling?",
      answers: [
        { text: "I reach for it at the exact second the feeling gets real.", truth: true },
        { text: "I use it to stay functional for the people who depend on me.", truth: false, sting: "They don't need you functional. They need you here." },
        { text: "It's the last thing standing between me and something much worse.", truth: false, sting: "It isn't the wall. It's the thing that keeps you from ever meeting the wall." },
      ],
    },
    rubedo: "It was never the escape you loved. It was the quiet on the other side of it.",
  },

  "wasted-genius": {
    effigy: "genius",
    lead: "#00F0FF",
    molten: "#5ce1ff",
    crucible: "#062e33",
    epithet: "CAST IN DRAFT",
    seize: "It has been holding the pen and refusing to sign anything.",
    nigredo: [
      { line: "It isn't ready. You know it isn't ready.", hot: "ready" },
      { line: "One more draft and it'll be undeniable.", hot: "undeniable" },
      { line: "Unshipped, it's still a masterpiece.", hot: "Unshipped" },
      { line: "And if they see it and just shrug — what was any of it for?", hot: "shrug" },
    ],
    albedo: [
      "Nobody ever took my work seriously.",
      "They didn't have to start from where I started.",
      "I'd have finished it if one person had believed me.",
    ],
    citrinitas: {
      ask: "What gift am I hiding by not executing?",
      answers: [
        { text: "Unfinished, it can never be judged — and that is the entire point.", truth: true },
        { text: "I have standards. Shipping something weak would cost me more than silence.", truth: false, sting: "Standards finish things. What you have is a locked drawer with a nice name." },
        { text: "The idea deserves to be built properly, not built fast.", truth: false, sting: "It's been built properly eleven times. None of them left the room." },
      ],
    },
    rubedo: "A draft is a hiding place with very good lighting.",
  },

  "raging-victim": {
    effigy: "victim",
    lead: "#ff5b3d",
    molten: "#ff8a4d",
    crucible: "#3a0e08",
    epithet: "CAST IN OLD PAIN",
    seize: "It has been holding the receipt for something that happened years ago.",
    nigredo: [
      { line: "You earned this anger. Every single hour of it.", hot: "earned" },
      { line: "Put it down and they get away with it.", hot: "away" },
      { line: "Being fair to them is a betrayal of you.", hot: "betrayal" },
      { line: "This armor is the only reason you're still standing.", hot: "armor" },
    ],
    albedo: [
      "After what they did, I have every right to be this way.",
      "They broke something and never once looked back.",
      "Nobody came for me when it actually counted.",
    ],
    citrinitas: {
      ask: "What pain am I using as permission to stay stuck?",
      answers: [
        { text: "The debt they owe me is the reason I never have to move.", truth: true },
        { text: "I'm honouring what happened by refusing to minimise it.", truth: false, sting: "Honouring it would be grieving it. This is invoicing it." },
        { text: "Letting go would mean it never really mattered.", truth: false, sting: "It mattered. That's why it deserves better than being used as a fence." },
      ],
    },
    rubedo: "It was never the anger. It was the part of you nobody ever guarded.",
  },

  "naive-warrior": {
    effigy: "warrior",
    lead: "#00a6ff",
    molten: "#4dc9ff",
    crucible: "#082238",
    epithet: "CAST IN PURE FORCE",
    seize: "It has been charging for you since before you could name the hill.",
    nigredo: [
      { line: "Harder. Harder has always worked before.", hot: "Harder" },
      { line: "Planning is what frightened people call waiting.", hot: "waiting" },
      { line: "Asking for help is borrowing someone else's respect.", hot: "borrowing" },
      { line: "And if you stop moving, you'll have to feel it.", hot: "stop" },
    ],
    albedo: [
      "I've been doing this on my own since the beginning.",
      "Everyone who said they'd help disappeared.",
      "If I don't carry it, nobody is going to.",
    ],
    citrinitas: {
      ask: "Where do I need wisdom, not just effort?",
      answers: [
        { text: "I run at things so I never have to sit still with them.", truth: true },
        { text: "Momentum is my edge — thinking would only slow the whole thing down.", truth: false, sting: "You've been at full speed for years. Point at the ground you took." },
        { text: "I move first because somebody has to, and it's always been me.", truth: false, sting: "Nobody appointed you. You volunteered so you'd never have to be carried." },
      ],
    },
    rubedo: "The blade was never the problem. Swinging it at everything was.",
  },
};

export function getCrucible(maskId) {
  return CRUCIBLE[maskId] || CRUCIBLE["broke-king"];
}

// The player's own victim story (step 2) becomes the Albedo ammunition —
// this is the whole point of the stage, and nothing else in the app fires
// the user's own words back at them. Split into up to 3 beats on sentence
// boundaries; fall back to the mask's stock lines if they skipped the step.
export function albedoLines(maskId, victimText) {
  const stock = getCrucible(maskId).albedo;
  const raw = String(victimText || "").trim();
  if (raw.length < 12) return stock.slice(0, 3);

  const parts = raw
    .split(/(?<=[.!?])\s+|\s+—\s+|\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 6)
    .slice(0, 3);

  if (!parts.length) return [raw.slice(0, 140), ...stock].slice(0, 3);
  // pad to three beats so the stage always has the same shape
  const out = [...parts];
  let i = 0;
  while (out.length < 3 && i < stock.length) {
    out.push(stock[i]);
    i += 1;
  }
  return out;
}

// The fear the player typed at step 3 becomes what the small light says
// when the mask finally cracks open.
export function innerVoice(afraidText) {
  const raw = String(afraidText || "").trim();
  if (raw.length < 4) return "I was afraid you'd find out you were ordinary.";
  const clean = raw.replace(/^(that|the fear underneath the mask is|i'm afraid)\s+/i, "").trim();
  return `I was afraid ${clean.replace(/[.]+$/, "")}.`;
}

// The moment they described at step 1 is engraved on the fourth plate —
// the mask's own words become their own words. Used as a plate override.
export function momentPlate(momentText) {
  const raw = String(momentText || "").trim();
  if (raw.length < 10) return null;
  const short = raw.length > 92 ? `${raw.slice(0, 90).trim()}…` : raw;
  return { line: short, hot: null, mine: true };
}

// Grade the run on the purity EARNED at melting point (not the forced 100).
// Flavour only — every rank still ends with gold in the mould.
export function gradePurity(p) {
  if (p >= 90) return { rank: "SOL", note: "Struck clean. Almost nothing was wasted." };
  if (p >= 72) return { rank: "LUNA", note: "Steady hands. The metal ran clear." };
  if (p >= 52) return { rank: "MERCURY", note: "It fought you. You stayed anyway." };
  return { rank: "SALT", note: "Rough pour — and still gold. That counts." };
}
