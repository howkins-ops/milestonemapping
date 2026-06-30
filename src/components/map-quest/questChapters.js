// The Inner Alchemist — the canonical 20-chapter spine (single source of truth).
// Drives BOTH the Quest Book map (MapQuestMap) and the chapter router (RPGWorldPage).
// Content source: alchemist/07_CHAPTER_DOSSIER.md. World/look: alchemist/06_WORLD_BIBLE.md.
//
// `component` = the registered chapter component id (see CHAPTER_COMPONENTS in RPGWorldPage),
// or null until that chapter is built. `available` gates entry on the map.
// The 3 already-built chapters keep their original keys (chapter-anchor/shadow/alchemy) so
// existing navigation (SeekerCity, App, legacy saves) keeps working; Phase B reworks them.

export const QUEST_CHAPTERS = [
  // ── ARC 1 · THE CALL (Ch 1–5) ─────────────────────────────────────────────
  {
    key: "chapter-anchor", number: 1, title: "The Send-Off",
    subtitle: "Find your why before the road gets loud.",
    world: "A mentor's last transmission before you jack in.",
    exercise: "Create Your Why", shadow: null, essence: null, consent: "Testimony",
    reward: "Your Why", type: "Story + coaching",
    cardImage: "/assets/map-quest/chapter-anchor-card.png",
    component: "ChapterAnchor", available: true,
    saveKey: "milestone-quest:anchor-v1",
  },
  {
    key: "ch02-the-signal", number: 2, title: "The Signal",
    subtitle: "A glitch-dream of a vault that won't leave you.",
    world: "A recurring signal points past the 9-to-5 grid.",
    exercise: "Name Your Treasure", shadow: null, essence: null, consent: "Testimony",
    reward: "Your Treasure", type: "Story + exercise",
    component: "ChapterSignal", available: true, requires: "chapter-anchor",
    saveKey: "milestone-quest:ch02-v1",
  },
  {
    key: "ch03-the-fixer", number: 3, title: "The Fixer",
    subtitle: "Meet the Anchor who names the path.",
    world: "A back-alley data-den; the Anchor mentor.",
    exercise: "Futurability Check", shadow: null, essence: null, consent: "Testimony",
    reward: "Anchor mentor", type: "Story + coaching",
    component: "ChapterFixer", available: true, requires: "ch02-the-signal",
    saveKey: "milestone-quest:ch03-v1",
  },
  {
    key: "ch04-the-holo-map", number: 4, title: "The Holo-Map",
    subtitle: "See how the money actually moves.",
    world: "The Business mentor lights up the future money-map.",
    exercise: "Future Vision Journal", shadow: null, essence: null, consent: "Testimony",
    reward: "The money-map", type: "Story + exercise",
    component: "ChapterHoloMap", available: true, requires: "ch03-the-fixer",
    saveKey: "milestone-quest:ch04-v1",
  },
  {
    key: "ch05-the-gate", number: 5, title: "The Gate",
    subtitle: "It opens only on a spoken declaration.",
    world: "Burn the ships; the gate dissolves.",
    exercise: "Essence Declaration", shadow: null, essence: null, consent: "Testimony",
    reward: "Your Declaration", type: "Story + exercise",
    component: "ChapterGate", available: true, requires: "ch04-the-holo-map",
    saveKey: "milestone-quest:ch05-v1",
  },

  // ── ARC 2 · FIRST SHADOWS & THE TRADE (Ch 6–10) ──────────────────────────
  {
    key: "chapter-shadow", number: 6, title: "The Undercity of Lack",
    subtitle: "Meet the Broke King — the first mask walking beside you.",
    world: "The ruined treasury beneath the city.",
    exercise: "Money Mirror", shadow: "broke_king", essence: "Power", consent: "Testimony",
    reward: "Shadow journal", type: "Story + exercise",
    cardImage: "/assets/map-quest/chapter-shadow-card.png",
    component: "ChapterShadow", available: true, requires: "chapter-anchor",
    saveKey: "milestone-quest:shadow-v3",
  },
  {
    key: "ch07-the-challenger", number: 7, title: "The Challenger",
    subtitle: "A fixer who won't let you blame.",
    world: "The Challenger mentor; victim → at-cause.",
    exercise: "At Cause Reset", shadow: null, essence: null, consent: "Testimony",
    reward: "Challenger mentor", type: "Story + coaching",
    component: "ChapterChallenger", available: true, requires: "chapter-shadow",
    saveKey: "milestone-quest:ch07-v1",
  },
  {
    key: "ch08-the-forge", number: 8, title: "The Forge",
    subtitle: "Tools that run on kept promises.",
    world: "The grit forge; door-to-door fire.",
    exercise: "Promise Forge", shadow: null, essence: null, consent: "Testimony",
    reward: "Proof of follow-through", type: "Story + exercise",
    component: "ChapterForgeCh", available: true, requires: "ch07-the-challenger",
    saveKey: "milestone-quest:ch08-v1",
  },
  {
    key: "ch09-the-neon-chapel", number: 9, title: "The Neon Chapel",
    subtitle: "Meet the Addict Saint who numbs the ache.",
    world: "A chapel of beautiful escapes.",
    exercise: "Compassionate Interruption", shadow: "addict_saint", essence: "Love", consent: "Transmuted",
    reward: "Essence: Love", type: "Story + exercise",
    component: "ChapterNeonChapel", available: true, requires: "ch08-the-forge",
    saveKey: "milestone-quest:ch09-v1",
  },
  {
    key: "ch10-the-desert", number: 10, title: "The Dead-Server Desert",
    subtitle: "Broken clocks; patience is the crossing.",
    world: "A desert of dead servers and broken time.",
    exercise: "Time Integrity Reset", shadow: null, essence: null, consent: "Testimony",
    reward: "Patience", type: "Story + exercise",
    component: "ChapterDesert", available: true, requires: "ch09-the-neon-chapel",
    saveKey: "milestone-quest:ch10-v1",
  },

  // ── ARC 3 · DEEPER SHADOWS & BEING (Ch 11–16) ────────────────────────────
  {
    key: "ch11-the-data-spire", number: 11, title: "The Data-Spire",
    subtitle: "Meet the Silent Prophet; find your voice.",
    world: "A spire of unsent messages and muted mics.",
    exercise: "Voice Gate", shadow: "silent_prophet", essence: "Radiance", consent: "Testimony",
    reward: "Essence: Radiance", type: "Story + exercise",
    component: "ChapterDataSpire", available: true, requires: "ch10-the-desert",
    saveKey: "milestone-quest:ch11-v1",
  },
  {
    key: "ch12-the-recursion", number: 12, title: "The Recursion",
    subtitle: "Break the loop you keep repeating.",
    world: "A looping chamber; the Alchemist first appears.",
    exercise: "Loop Breaker", shadow: null, essence: null, consent: "Transmuted",
    reward: "The Alchemist (glimpsed)", type: "Story + exercise",
    component: "ChapterRecursion", available: true, requires: "ch11-the-data-spire",
    saveKey: "milestone-quest:ch12-v1",
  },
  {
    key: "ch13-the-diagnostic", number: 13, title: "The Diagnostic",
    subtitle: "Name the piece that's actually missing.",
    world: "A compass of what's missing; sales-as-science.",
    exercise: "Missing-Piece Diagnostic", shadow: null, essence: null, consent: "Testimony",
    reward: "The missing piece", type: "Story + exercise",
    component: "ChapterDiagnostic", available: true, requires: "ch12-the-recursion",
    saveKey: "milestone-quest:ch13-v1",
  },
  {
    key: "ch14-the-ruins", number: 14, title: "The Ruins District",
    subtitle: "Meet the Raging Victim; choose your story.",
    world: "The ruins of what happened.",
    exercise: "Throne of Responsibility", shadow: "raging_victim", essence: "Majesty", consent: "Transmuted",
    reward: "Essence: Majesty", type: "Story + exercise",
    component: "ChapterRuins", available: true, requires: "ch13-the-diagnostic",
    saveKey: "milestone-quest:ch14-v1",
  },
  {
    key: "ch15-the-garden", number: 15, title: "The Garden Server",
    subtitle: "Forgive yourself; learn to be.",
    world: "A hidden green node in the grid; the Heartkeeper.",
    exercise: "Being Mirror", shadow: null, essence: null, consent: "Testimony",
    reward: "Being over doing", type: "Story + exercise",
    component: "ChapterGarden", available: true, requires: "ch14-the-ruins",
    saveKey: "milestone-quest:ch15-v1",
  },
  {
    key: "ch16-the-black-market", number: 16, title: "The Black Market",
    subtitle: "Meet the Naive Warrior; move clean.",
    world: "False upgrades, shortcuts, borrowed family.",
    exercise: "Clean Movement Check", shadow: "naive_warrior", essence: "Joy", consent: "Testimony",
    reward: "Essence: Joy", type: "Story + exercise",
    component: "ChapterBlackMarket", available: true, requires: "ch15-the-garden",
    saveKey: "milestone-quest:ch16-v1",
  },

  // ── ARC 4 · CLIMAX & RETURN (Ch 17–20) ───────────────────────────────────
  {
    key: "ch17-the-citadel", number: 17, title: "The Citadel",
    subtitle: "All five shadows converge. Name them.",
    world: "The citadel where every shadow meets at once.",
    exercise: "Shadow Naming Ceremony", shadow: "all", essence: null, consent: "Transmuted",
    reward: "All shadows named", type: "Story + ceremony",
    component: "ChapterCitadel", available: true, requires: "ch16-the-black-market",
    saveKey: "milestone-quest:ch17-v1",
  },
  {
    key: "ch18-becoming-the-signal", number: 18, title: "Becoming the Signal",
    subtitle: "Jack into the wind. Surrender.",
    world: "The storm; you become the signal.",
    exercise: "Essence Stand", shadow: null, essence: "all", consent: "Testimony",
    reward: "Your Stand", type: "Story + exercise",
    component: "ChapterBecomingSignal", available: true, requires: "ch17-the-citadel",
    saveKey: "milestone-quest:ch18-v1",
  },
  {
    key: "ch19-the-vault", number: 19, title: "The Vault",
    subtitle: "It opens onto a mirror. The treasure was you.",
    world: "The vault opens onto a mirror — Day-One beside now.",
    exercise: "Life Purpose Reveal", shadow: null, essence: null, consent: "Testimony",
    reward: "Your Life Purpose", type: "Climax",
    component: "ChapterVault", available: true, requires: "ch18-becoming-the-signal",
    saveKey: "milestone-quest:ch19-v1",
  },
  {
    key: "ch20-the-return", number: 20, title: "The Return",
    subtitle: "The city, now legible. Carry the elixir home.",
    world: "Home — now legible; the Phoenix rises.",
    exercise: "Return & Next Quest", shadow: null, essence: null, consent: "Testimony",
    reward: "Quest complete", type: "Return",
    component: "ChapterReturn", available: true, requires: "ch19-the-vault",
    saveKey: "milestone-quest:ch20-v1",
  },
];

export function getChapterByKey(key) {
  return QUEST_CHAPTERS.find((chapter) => chapter.key === key);
}

// Gap-aware prerequisite: a chapter unlocks when the nearest PREVIOUS available
// chapter is complete (so locked/unbuilt chapters in between don't permanently
// block later available ones during the staged build).
export function prevAvailableKey(key) {
  const i = QUEST_CHAPTERS.findIndex((c) => c.key === key);
  for (let j = i - 1; j >= 0; j--) {
    if (QUEST_CHAPTERS[j].available) return QUEST_CHAPTERS[j].key;
  }
  return null;
}
