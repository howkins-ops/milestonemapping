// ════════════════════════════════════════════════════════════════════════
// THE FIVE PAIRS — canonical Essence ↔ Shadow table (single source of truth)
// Pairing follows the NEW canon (alchemist-codex-v8 / four-turns docs):
//   Radiance ↔ Silent Prophet · Love ↔ Addict Saint · Power ↔ Raging Victim
//   Majesty ↔ Broke King     · Joy ↔ Naive Warrior
// Used by the Pendant HUD, the Four Turns ritual, the shadow chapters, and
// the Crossing's five cities. Pure data — no React, no storage.
// ════════════════════════════════════════════════════════════════════════

export const ESSENCE_PAIRS = [
  {
    id: "radiance",
    essence: "Radiance",
    shadow: "Silent Prophet",
    shadowKey: "silent_prophet",
    color: "#00F0FF",
    chapterKey: "ch11-the-data-spire",
    crossingCity: "silent-spire",
    coreLie: "If you shine, they will find a way to dim you first — so dim yourself.",
    protects: "Your hope — a dream never spoken can never be laughed to death.",
    voice: "a stranger's kindness",
  },
  {
    id: "love",
    essence: "Love",
    shadow: "Addict Saint",
    shadowKey: "addict_saint",
    color: "#FF3EDB",
    chapterKey: "ch09-the-neon-chapel",
    crossingCity: "the-feed",
    coreLie: "Real people leave. This won't. Attach here instead, where it's safe.",
    protects: "The part of you that still, quietly, wants to be chosen.",
    voice: "a half-familiar friend",
  },
  {
    id: "power",
    essence: "Power",
    shadow: "Raging Victim",
    shadowKey: "raging_victim",
    color: "#C4451C",
    chapterKey: "ch14-the-ruins",
    crossingCity: "the-tribunal",
    coreLie: "If you can prove it wasn't your fault, you never have to feel how powerless you were.",
    protects: "Your dignity — blame became armor against a shame that was never yours.",
    voice: "an old bully",
  },
  {
    id: "majesty",
    essence: "Majesty",
    shadow: "Broke King",
    shadowKey: "broke_king",
    color: "#EFC03B",
    chapterKey: "chapter-shadow",
    crossingCity: "the-ledger",
    coreLie: "You are only as much as the number says you are.",
    protects: "A dignity so old it predates money — the un-earned worth of a child.",
    voice: "your father's tired voice",
  },
  {
    id: "joy",
    essence: "Joy",
    shadow: "Naive Warrior",
    shadowKey: "naive_warrior",
    color: "#8A6BD6",
    chapterKey: "ch16-the-black-market",
    crossingCity: "the-carnival",
    coreLie: "A boundary might close a door that wonder needs open. Say yes, always.",
    protects: "A heart that never went cynical despite everything.",
    voice: "your own voice, exactly",
  },
];

export const PAIR_BY_SHADOW_KEY = Object.fromEntries(
  ESSENCE_PAIRS.map((p) => [p.shadowKey, p])
);

export const PAIR_BY_CITY = Object.fromEntries(
  ESSENCE_PAIRS.map((p) => [p.crossingCity, p])
);

// The five words as the father engraves them on the pendant, in speaking order.
export const PENDANT_WORDS = ["Radiance", "Love", "Power", "Majesty", "Joy"];

// The Four Turns — the mechanism (four-turns doc), staged in the four
// alchemical colors. Shared by the ritual component and the crossing.
export const FOUR_TURNS = [
  {
    id: "naming",
    title: "Naming",
    latin: "Nigredo · the blackening",
    color: "#2A2622",
    accent: "#8B92A8",
    hint: "Look straight at the mask and say its exact name. Nothing changes yet — this turn only ends the hiding.",
  },
  {
    id: "separating",
    title: "Separating",
    latin: "Albedo · the whitening",
    color: "#9FC3D0",
    accent: "#C9E2EA",
    hint: "Draw the line: this is not who I am — this is what I built to survive.",
  },
  {
    id: "returning",
    title: "Returning",
    latin: "Citrinitas · the yellowing",
    color: "#D4A62A",
    accent: "#EFC03B",
    hint: "Speak the true name in its place. Not hoping it's true — remembering it was true before the mask existed.",
  },
  {
    id: "proving",
    title: "Proving",
    latin: "Rubedo · the reddening",
    color: "#B03418",
    accent: "#FF6A4D",
    hint: "One small, real action only the essence would take. The gold isn't real until it's spent.",
  },
];
