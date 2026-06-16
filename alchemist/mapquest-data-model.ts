/**
 * MapQuest — Milestone Mapping / Alchemist Edition
 * Data model & type definitions (starting point for the build)
 *
 * This is the source-of-truth shape for the product. It is NOT framework-specific —
 * adapt to React state + Supabase tables as needed. Comments mark what powers the
 * key emotional beats so they don't get lost in implementation.
 */

// ============================================================
// CORE: THE PLAYER'S JOURNEY STATE
// ============================================================

export type PlayerState = {
  userId: string;

  // --- The goal (the bait) ---
  goal: string;                    // raw goal, e.g. "Sell 200 accounts"
  identityReframe: string;         // "become the person who closes daily" — captured Ch 1
  measure: string;                 // the measurable target, e.g. "200" / "by Dec 31"

  // --- THE REVEAL ENGINE (most important: do not skip) ---
  dayOneSnapshot: DayOneSnapshot;  // captured at Chapter 1
  lifePurpose?: string;            // the Chapter 18 output — the treasure
  // Ch 1 captures dayOneSnapshot. Ch 18 renders it beside the present self.
  // That side-by-side IS the "treasure was home" reveal. Build capture early.

  // --- Progress through the 19-chapter journey ---
  currentChapter: number;          // 1–19
  chaptersComplete: number[];      // unlocked/finished gate ids

  // --- The proof system ---
  milestones: Milestone[];         // staged gates; feeds the connection map
  dailyProof: ProofEntry[];        // streak fuel
  streak: number;

  // --- The transformation tracking ---
  shadowsEncountered: ShadowEncounter[];  // which shadows surfaced & when (replaces masksEncountered)
  essenceUnlocked: EssenceType[];         // which Essences the player has returned to
  shiftsCompleted: ShiftLog[];            // each time the 5-Shifts engine was run

  createdAt: string;
  updatedAt: string;
};

export type DayOneSnapshot = {
  whoIAmNow: string;       // free-text self-description at the start
  whatImChasing: string;   // why they think they want the goal
  biggestFear: string;     // the fear named on day one
  capturedAt: string;
};

// ============================================================
// THE JOURNEY: PROLOGUE + 19 CHAPTERS
// ============================================================

export type Chapter = {
  id: number;              // 0 = Prologue, 1–19 = chapters
  title: string;
  alchemistParallel: string;
  arcStage: HeroArcStage;
  exercise: ExerciseId;    // core exercise, cinematic, or epilogue flow that runs here
  shadow?: ShadowType;     // which shadow appears in this chapter (if any)
  isOrdeal?: boolean;      // chapters with heavier shadow encounters
  unlockRequires?: number; // chapter id that must be complete first
};

export type HeroArcStage =
  | "ordinary_world" | "call" | "threshold" | "trials"
  | "ally" | "approach" | "ordeal" | "reward" | "return";

// ============================================================
// MILESTONES & PROOF
// ============================================================

export type Milestone = {
  id: string;
  title: string;
  measurableResult: string;     // what must be true to clear the gate
  rewardTier: "small" | "medium" | "large";
  reward: string;
  weeklyActions: string[];
  complete: boolean;
  completedAt?: string;
  linkedTo: string[];           // other milestone ids — builds the connection map
};

export type ProofEntry = {
  id: string;
  date: string;
  proofCreated: string;         // "what proof did I create today"
  actionCompleted: string;
  avoided?: string;             // "what did I avoid"
  revealedAboutMe?: string;     // "what did today reveal about who I'm becoming"
  milestoneId?: string;
};

// ============================================================
// THE ENGINE: 5 SHIFTS
// ============================================================

export type ShiftType =
  | "integrity" | "alignment" | "identity" | "essence" | "coaching";

export type ShiftLog = {
  shift: ShiftType;
  chapterId: number;            // where in the journey it fired
  ranAt: string;
  output: Record<string, string>;  // the user's typed answers for that shift
};

// --- Shift 1: Integrity (the bullshit call-out) ---
export type IntegrityWork = {
  lies: { lie: string; truth: string }[];  // the story vs the raw truth
  cost: string;
  declaration: string;          // "I am ___"
  recommit: string;             // "I recommit to ___"
};

// --- Shift 2: Alignment (the values gap + triangle) ---
export type AlignmentWork = {
  shadowedValues: string[];     // "if someone filmed you all day, what would they say you value"
  thinkIValue: string[];        // what you believe you value
  goals: string[];              // your actual goals
  // gap = shadowedValues vs goals. Mismatch = why goals die.
  priorityTriangle: string[];   // [peak, ...supporting] — the rebuilt hierarchy
};

// --- Shift 3: Identity (the climb) ---
export type IdentityWork = {
  outcomes: string[];           // what you've been chasing
  identityStatements: string[]; // "I am a closer who signs deals daily"
  // The identity triangle (bottom→top): Survival → Awareness → Higher Self → Essence
};

// --- Shift 4: Survival → Essence (name the shadow) ---
export type EssenceWork = {
  freeMoment: string;           // a moment of being fully yourself
  freeQuality: EssenceType;     // the Essence that showed up
  stuckMoment: string;
  shadowSelected: ShadowType;   // renamed from maskSelected
  nameItChoice: string;         // "that was my ___; next time I choose ___"
};

// --- The core move inside the engine ---
export type BreakdownBreakthrough = {
  lie: string;                  // step 1: face the lie
  cost: string;                 // step 2: feel the cost
  breakdownNote?: string;       // step 3: the emotion (optional capture)
  declaration: string;          // step 4a: who you are
  proof: string;                // step 4b: what you do today
  completedAt: string;
};

// ============================================================
// SHADOWS & ESSENCE
// ============================================================

// ShadowType — the canonical story shadow names used in the UI and DB.
// These replace the original sales-context "MaskType" names.
// The sales-layer equivalents are preserved below as SalesMaskType
// for 5 Shifts workshop content where the sales framing is appropriate.
export type ShadowType =
  | "broke_king"       // was: champion_quitter  → Essence: power
  | "addict_saint"     // was: crybaby_closer    → Essence: love
  | "silent_prophet"   // was: zombie_knocker    → Essence: radiance
  | "raging_victim"    // was: excuse_king       → Essence: majesty
  | "naive_warrior";   // was: rebel_no_results  → Essence: joy

// SalesMaskType — kept for the 5 Shifts workshop context (sales teams).
// Do NOT use in the Diamond Path quest UI.
export type SalesMaskType =
  | "crybaby_closer" | "excuse_king" | "rebel_no_results"
  | "zombie_knocker" | "champion_quitter";

export type EssenceType =
  | "love" | "majesty" | "joy" | "radiance" | "power";

export type Shadow = {
  type: ShadowType;
  name: string;                  // display name: "The Broke King"
  encounterLocation: string;     // world zone where first encountered
  firstImpression: string;       // what the Seeker thinks they are
  trueNature: string;            // what they actually are
  voiceLines: string[];          // exactly 6 injected thoughts (italicised in UI)
  controlSymptoms: string[];     // list of behaviors when shadow has control
  essenceReturn: EssenceType;
  chapterEncounter: number;      // chapter id where shadow first appears
  shadowColor: string;           // hex — used for map glow + mirror tint
  salesEquivalent: SalesMaskType; // bridge to 5 Shifts workshop layer
};

export type ShadowEncounter = {
  shadow: ShadowType;
  chapterId: number;
  phase: "appeared" | "attached" | "controlling" | "noticed" | "named" | "resolved";
  voiceLinesHeard: string[];
  essenceChosen?: EssenceType;
  exerciseCompleted?: ExerciseId;
  proofAction?: string;
  named: boolean;
  encounteredAt: string;
  resolvedAt?: string;
};

// Reference table — all five shadows
export const SHADOWS: Record<ShadowType, Shadow> = {
  broke_king: {
    type: "broke_king",
    name: "The Broke King",
    encounterLocation: "The Forest of Lack",
    firstImpression: "A fallen ruler who lost everything and needs help",
    trueNature: "The Seeker's survival mechanism around money, scarcity, and shame",
    voiceLines: [
      "*You are behind.*",
      "*You lost too much.*",
      "*You cannot afford to fail.*",
      "*You should already be further.*",
      "*You are not safe yet.*",
      "*You need money before you can be powerful.*",
    ],
    controlSymptoms: [
      "Scarcity thinking", "Shame around money", "Panic at financial decisions",
      "Comparison to others", "Fear of investing", "Obsession with outcome",
      "Feeling powerless around money",
    ],
    essenceReturn: "power",
    chapterEncounter: 5,
    shadowColor: "#B8860B",
    salesEquivalent: "champion_quitter",
  },
  addict_saint: {
    type: "addict_saint",
    name: "The Addict Saint",
    encounterLocation: "The Neon Chapel",
    firstImpression: "A kind, understanding holy figure who offers rest and relief",
    trueNature: "The part that escapes, numbs, delays, and makes comfort holy",
    voiceLines: [
      "*You have worked hard.*",
      "*You deserve relief.*",
      "*You can face it tomorrow.*",
      "*You are not avoiding — you are recovering.*",
      "*You need comfort before you can continue.*",
      "*Escape is compassion.*",
    ],
    controlSymptoms: [
      "Numbing", "Escaping", "Dopamine-seeking", "Delaying action",
      "Calling avoidance 'healing'", "Shame cycle", "Starting tomorrow",
    ],
    essenceReturn: "love",
    chapterEncounter: 8,
    shadowColor: "#FF6EB4",
    salesEquivalent: "crybaby_closer",
  },
  silent_prophet: {
    type: "silent_prophet",
    name: "The Silent Prophet",
    encounterLocation: "The Tower of Unspoken Words",
    firstImpression: "A wise teacher full of wisdom he never shares",
    trueNature: "The part that hides the Seeker's voice behind perfectionism and fear of judgment",
    voiceLines: [
      "*Not yet.*",
      "*It is not ready.*",
      "*You need more proof first.*",
      "*What if they judge you?*",
      "*What if nobody listens?*",
      "*Silence is safer.*",
    ],
    controlSymptoms: [
      "Hiding", "Perfectionism", "Delayed posting", "Not publishing",
      "Fear of visibility", "Fear of judgment", "Waiting until ready",
    ],
    essenceReturn: "radiance",
    chapterEncounter: 10,
    shadowColor: "#4B0082",
    salesEquivalent: "zombie_knocker",
  },
  raging_victim: {
    type: "raging_victim",
    name: "The Raging Victim",
    encounterLocation: "The Ruins of What Happened",
    firstImpression: "A wounded person who deserves validation for their pain",
    trueNature: "The part that uses pain as a throne and blame as a shield",
    voiceLines: [
      "*Look what happened to you.*",
      "*You should be further ahead.*",
      "*They took from you.*",
      "*You lost your chance.*",
      "*You are allowed to stay stuck.*",
      "*You are the way you are because of what happened.*",
    ],
    controlSymptoms: [
      "Blame", "Resentment", "Drama", "Storytelling for agreement",
      "Waiting for rescue", "Using pain as proof action is impossible",
      "Anger replacing ownership",
    ],
    essenceReturn: "majesty",
    chapterEncounter: 13,
    shadowColor: "#8B0000",
    salesEquivalent: "excuse_king",
  },
  naive_warrior: {
    type: "naive_warrior",
    name: "The Naive Warrior",
    encounterLocation: "The False Gold Market",
    firstImpression: "A bold, exciting figure who embodies courage and momentum",
    trueNature: "The part that rushes, overtrusts, and mistakes urgency for courage",
    voiceLines: [
      "*Move now.*",
      "*This is the one.*",
      "*Trust them.*",
      "*You are behind, so go faster.*",
      "*You do not have time to think.*",
      "*Courage means leap before you look.*",
    ],
    controlSymptoms: [
      "Rushing", "Overtrusting", "Chasing shiny objects", "Ignoring intuition",
      "Confusing urgency with courage", "Making choices without owning consequences",
      "Skipping structure",
    ],
    essenceReturn: "joy",
    chapterEncounter: 15,
    shadowColor: "#FFD700",
    salesEquivalent: "rebel_no_results",
  },
};

// ============================================================
// EXERCISE LIBRARY — 18 core exercises + prologue + return-home epilogue
// ============================================================

export type ExerciseId =
  // Prologue (cinematic only — no exercise)
  | "prologue_cinematic"
  // Chapters 1–18 are the core coaching exercises.
  | "anchor_why_session"        // Ch 1:  Anchor Mentor helps name the deeper why
  | "futurability_check"        // Ch 2:  Futurability for Objectives
  | "future_vision_journal"     // Ch 3:  Merlin Exercise / Project Design From Future
  | "essence_declaration"       // Ch 4:  Declaration as a Tool
  | "money_mirror"              // Ch 5:  Income-Savings Thermometer + Consequences of Choice
  | "at_cause_reset"            // Ch 6:  Responsibility-At Cause
  | "promise_forge"             // Ch 7:  Power of Promise
  | "compassionate_interruption"// Ch 8:  Overwhelm Cycle + Self-Sabotage and Integrity
  | "time_integrity_reset"      // Ch 9:  Notes about Coaching and Time
  | "voice_gate"                // Ch 10: Declaration as Tool + Life Purpose + Powerful Stands
  | "loop_breaker"              // Ch 11: Overwhelm Cycle-Coach Instructions
  | "missing_piece_diagnostic"  // Ch 12: Managing Complex Change
  | "throne_of_responsibility"  // Ch 13: Victim-At Effect + Responsibility-At Cause
  | "being_mirror"              // Ch 14: Coaching from Being + Coaching from Judgment vs Being
  | "clean_movement_check"      // Ch 15: Consequences of Choice + Futurability + Managing Complex Change
  | "shadow_naming_ceremony"    // Ch 16: Self-Sabotage + Present Context + Re-Invention + Powerful Stands
  | "essence_stand"             // Ch 17: Powerful Stands
  | "life_purpose_reveal"       // Ch 18: Life Purpose - Coach's Instructions
  // Chapter 19 is the return-home integration, not the final core exercise.
  | "return_home_epilogue";      // Ch 19: Return Home + optional next quest seed

export type Exercise = {
  id: ExerciseId;
  name: string;
  chapterId: number;            // 0 = Prologue, 1–19 = chapters
  coachingDocs: string[];       // exact filenames from COACHING_DOCS_INDEX
  prompts: string[];
};

// ============================================================
// THE 20-CHAPTER MAP — Prologue (Ch 0) + Chapters 1–19
// ============================================================

export const CHAPTERS: Chapter[] = [
  // ── PROLOGUE ──────────────────────────────────────────────
  { id: 0,  title: "The Father's Warning",              alchemistParallel: "Before the journey begins",        arcStage: "ordinary_world", exercise: "prologue_cinematic" },

  // ── ARC 1: The Dream → Declaration (Ch 1–4) ──────────────
  { id: 1,  title: "The Dream That Would Not Leave",    alchemistParallel: "The recurring dream",              arcStage: "ordinary_world", exercise: "anchor_why_session",         unlockRequires: 0 },
  { id: 2,  title: "The Anchor Mentor and the Why",     alchemistParallel: "Melchizedek names the path",       arcStage: "call",           exercise: "futurability_check",          unlockRequires: 1 },
  { id: 3,  title: "The Future Map",                    alchemistParallel: "The soul of the world",            arcStage: "call",           exercise: "future_vision_journal",       unlockRequires: 2 },
  { id: 4,  title: "The Declaration Gate",              alchemistParallel: "Selling the sheep",                arcStage: "threshold",      exercise: "essence_declaration",         unlockRequires: 3 },

  // ── ARC 2: First Shadows (Ch 5–10) ───────────────────────
  { id: 5,  title: "The Forest of Lack",                alchemistParallel: "The crystal shop (early struggle)",arcStage: "trials",         exercise: "money_mirror",                unlockRequires: 4,  shadow: "broke_king" },
  { id: 6,  title: "The Challenger Mentor",             alchemistParallel: "The Englishman meets resistance",  arcStage: "trials",         exercise: "at_cause_reset",              unlockRequires: 5 },
  { id: 7,  title: "The Proof Forge",                   alchemistParallel: "The crystal shop (kept promises)", arcStage: "trials",         exercise: "promise_forge",               unlockRequires: 6 },
  { id: 8,  title: "The Neon Chapel",                   alchemistParallel: "The comfort trap / oasis tempt",  arcStage: "trials",         exercise: "compassionate_interruption",  unlockRequires: 7,  shadow: "addict_saint" },
  { id: 9,  title: "The Clock Desert",                  alchemistParallel: "The desert caravan",               arcStage: "trials",         exercise: "time_integrity_reset",        unlockRequires: 8 },
  { id: 10, title: "The Tower of Unspoken Words",       alchemistParallel: "The horseman / war zone",          arcStage: "ordeal",         exercise: "voice_gate",                  unlockRequires: 9,  shadow: "silent_prophet", isOrdeal: true },

  // ── ARC 3: Deeper Shadows + Being (Ch 11–15) ─────────────
  { id: 11, title: "The Loop Chamber",                  alchemistParallel: "The alchemist's tests",            arcStage: "approach",       exercise: "loop_breaker",                unlockRequires: 10 },
  { id: 12, title: "The Change Compass",                alchemistParallel: "Turning into wind (prep)",         arcStage: "approach",       exercise: "missing_piece_diagnostic",    unlockRequires: 11 },
  { id: 13, title: "The Ruins of What Happened",        alchemistParallel: "Robbed in Tangier (deep layer)",   arcStage: "ordeal",         exercise: "throne_of_responsibility",    unlockRequires: 12, shadow: "raging_victim", isOrdeal: true },
  { id: 14, title: "The Oasis of Being",                alchemistParallel: "Fatima at the oasis",              arcStage: "ally",           exercise: "being_mirror",                unlockRequires: 13 },
  { id: 15, title: "The False Gold Market",             alchemistParallel: "The false treasure / shortcuts",   arcStage: "approach",       exercise: "clean_movement_check",        unlockRequires: 14, shadow: "naive_warrior" },

  // ── ARC 4: Climax (Ch 16–19) ─────────────────────────────
  { id: 16, title: "The Shadow Citadel",                alchemistParallel: "The soul of the world (crisis)",   arcStage: "ordeal",         exercise: "shadow_naming_ceremony",      unlockRequires: 15, isOrdeal: true },
  { id: 17, title: "The Final Stand",                   alchemistParallel: "Turning into wind",                arcStage: "ordeal",         exercise: "essence_stand",               unlockRequires: 16, isOrdeal: true },
  { id: 18, title: "The Treasure Mirror",               alchemistParallel: "The treasure, now recognizable",   arcStage: "reward",         exercise: "life_purpose_reveal",         unlockRequires: 17 },
  { id: 19, title: "The Return Home",                   alchemistParallel: "Home, now legible",                arcStage: "return",         exercise: "return_home_epilogue",        unlockRequires: 18 },
];

// ============================================================
// THE 5 SHIFTS (seed data)
// ============================================================

export const SHIFTS = [
  { type: "integrity", order: 1, law: "When you break your word, you break yourself.",        firesAt: [3, 5] },
  { type: "alignment", order: 2, law: "Show me your values and I'll predict your future.",     firesAt: [6, 7] },
  { type: "identity",  order: 3, law: "You don't rise to your goals — you fall to your identity.", firesAt: [1, 13] },
  { type: "essence",   order: 4, law: "Survival protects you, but it also imprisons you.",      firesAt: [9, 10, 11] },
  { type: "coaching",  order: 5, law: "A coach sees what you can't see.",                       firesAt: [2, 14] },
] as const;
