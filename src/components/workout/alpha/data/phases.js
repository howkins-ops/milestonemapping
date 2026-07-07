/* ALPHA MODE — phase definitions.
   Every number in this file comes from the Alpha Mode content bible:
   eating-equation multipliers, the maintenance chart, 4-week rotation
   tables, and all 16 workout definitions. Entries the bible left blank
   are pattern-consistent fills flagged `fill: true` so Jon can swap them.
   Exercise `reps` strings are display targets; timers/rounds drive play. */

/* maintenance calories = LBM × multiplier, keyed by body-fat % */
export const MAINTENANCE_CHART = [
  { maxBF: 12, mult: 17 },
  { maxBF: 15, mult: 16 },
  { maxBF: 19, mult: 15 },
  { maxBF: 22, mult: 14 },
  { maxBF: 100, mult: 13 },
];

export const ZONE_ACCENTS = {
  prime: "#5FB8C9",
  adapt: "#FF6A2B",
  surge: "#9B6BFF",
  complete: "#E9C46A",
};

/* day slots: Mon..Sun (index 0..6) */
const OFF = null;

export const PHASES = {
  /* ─────────────────────────── PHASE I ─────────────────────────── */
  prime: {
    id: "prime",
    n: 1,
    name: "PRIME",
    subtitle: "the insulin reset",
    accent: ZONE_ACCENTS.prime,
    stage: 5,
    bossStat: "insulin",
    trainingStyle: "mrt",
    fasting: { fastHours: 16, eatHours: 8 },
    /* eating: calorie delta from maintenance + per-LBM protein;
       carbs are absolute gram tiers that unlock by week (the carb ramp) */
    eating: {
      workout: { calDelta: -300, proteinPerLBM: 0.8 },
      rest: { calDelta: -500, proteinPerLBM: 0.7 },
      carbs: { type: "grams", workout: [30, 30, 75, 100], rest: [0, 0, 0, 50] },
      carbNotes: [
        "post-workout shake only",
        "post-workout shake only",
        "within 3 hrs post-workout — shake + sweet potato",
        "shake + a second carb source unlocked",
      ],
    },
    nutritionDays: { cheat: null, fullFast: null },
    rotation: [
      ["w1", "w2", OFF, "w3", "w4", OFF, OFF],
      ["w3", "w1", OFF, "w4", "w2", OFF, OFF],
      ["w4", "w3", OFF, "w2", "w1", OFF, OFF],
      ["w2", "w4", OFF, "w1", "w3", OFF, OFF],
    ],
  },

  /* ─────────────────────────── PHASE II ─────────────────────────── */
  adapt: {
    id: "adapt",
    n: 2,
    name: "ADAPT",
    subtitle: "density · the drive engine",
    accent: ZONE_ACCENTS.adapt,
    stage: 6,
    bossStat: "testosterone",
    trainingStyle: "density",
    fasting: { fastHours: 16, eatHours: 8 },
    eating: {
      workout: { calDelta: -200, proteinPerLBM: 1.0 },
      rest: { calDelta: -600, proteinPerLBM: 0.8 },
      carbs: { type: "perLBM", workout: 0.75, rest: 0.3 },
    },
    /* cheat Sunday unlocks here; full-fast Monday from week 2 (day idx 0=Mon) */
    nutritionDays: { cheat: 6, fullFast: 0, cheatFromWeek: 1, fastFromWeek: 2, noCheatFinalWeek: true },
    rotation: [
      ["w1", "w2", OFF, "w3", OFF, OFF, "w4"],
      ["cardio", "w2", "w4", OFF, "w1", OFF, "w3"],
      ["cardio", "w4", OFF, "w3", "w1", OFF, "w2"],
      ["cardio", "w4", "w1", OFF, "w3", "w2", OFF],
    ],
  },

  /* ─────────────────────────── PHASE III ─────────────────────────── */
  surge: {
    id: "surge",
    n: 3,
    name: "SURGE",
    subtitle: "the growth burn",
    accent: ZONE_ACCENTS.surge,
    stage: 7,
    bossStat: "gh",
    trainingStyle: "tempo",
    fasting: { fastHours: 16, eatHours: 8 },
    eating: {
      workout: { calDelta: +400, proteinPerLBM: 1.5 },
      rest: { calDelta: -200, proteinPerLBM: 1.25 },
      carbs: { type: "perLBM", workout: 1.0, rest: 0.5 },
    },
    nutritionDays: { cheat: 6, fullFast: null, cheatFromWeek: 1 },
    rotation: [
      ["w1", "w2", OFF, "w3", OFF, "w4", OFF],
      ["w3", "w1", OFF, "w4", OFF, "w2", OFF],
      ["w4", "w3", OFF, "w2", OFF, "w1", OFF],
      ["w2", "w4", OFF, "w1", OFF, "w3", OFF],
    ],
  },

  /* ─────────────────────────── PHASE IV ─────────────────────────── */
  complete: {
    id: "complete",
    n: 4,
    name: "COMPLETE",
    subtitle: "all systems, one week",
    accent: ZONE_ACCENTS.complete,
    stage: 9,
    bossStat: "all",
    trainingStyle: "rotation",
    fasting: { fastHours: 16, eatHours: 8 },
    eating: {
      workout: { calDelta: +300, proteinPerLBM: 1.5 },
      rest: { calDelta: -400, proteinPerLBM: 1.0 },
      carbs: { type: "perLBM", workout: 1.0, rest: 0.25 },
    },
    nutritionDays: { cheat: 6, fullFast: null, cheatFromWeek: 1, epicCheat: true },
    /* 3 lifts a week, Mon/Wed/Fri — the book's Phase IV rotation table */
    rotation: [
      ["w1", OFF, "w2", OFF, "w3", OFF, OFF],
      ["w4", OFF, "w1", OFF, "w2", OFF, OFF],
      ["w3", OFF, "w4", OFF, "w2", OFF, OFF],
      ["w1", OFF, "w4", OFF, "w3", OFF, OFF],
    ],
  },
};

/* ═══════════════════ WORKOUT DEFINITIONS ═══════════════════
   block kinds:
   - circuit:   rounds × exercises, restBetweenEx / restBetweenRounds (s)
   - straight:  sets of one lift, restBetweenRounds
   - density:   fixed `minutes` block, alternate exercises 4–6 reps,
                repeat the block once w/ weightBumpPct, restAfter (s)
   - tempo:     rounds × exercises at `tempo` cadence [down,pause,up]
   - totalreps: accumulate `totalReps` in as many sets as needed
   AMRAP reps = "AMRAP". Weights come from the user (PR-prefilled). */

export const WORKOUTS = {
  /* ── PRIME · metabolic resistance circuits ── */
  "prime-w1": {
    id: "prime-w1", phase: "prime", n: 1, name: "Iron Circuit I", style: "mrt",
    blocks: [
      {
        key: "A", kind: "circuit", rounds: 4, restBetweenEx: 30, restBetweenRounds: 180,
        exercises: [
          { name: "Goblet Squat", reps: "10-12" },
          { name: "Incline DB Chest Press", reps: "8-10" },
          { name: "Single-Arm DB Row", reps: "8/arm" },
          { name: "KB Romanian Deadlift", reps: "12-15" },
          { name: "Plank", reps: "30s" },
        ],
      },
      {
        key: "B", kind: "circuit", rounds: 3, restBetweenEx: 20, restBetweenRounds: 90,
        exercises: [
          { name: "Chin-Up", reps: "AMRAP" },
          { name: "Glute Bridge", reps: "12" },
          { name: "Reverse Lunge", reps: "8/leg" },
          { name: "Lateral Raise", reps: "12" },
        ],
      },
    ],
  },
  "prime-w2": {
    id: "prime-w2", phase: "prime", n: 2, name: "Iron Circuit II", style: "mrt",
    blocks: [
      {
        key: "A", kind: "circuit", rounds: 5, restBetweenEx: 30, restBetweenRounds: 180,
        exercises: [
          { name: "DB Overhead Press", reps: "8" },
          { name: "Barbell Romanian Deadlift", reps: "6" },
          { name: "Barbell Bent-Over Row", reps: "8" },
          { name: "Hanging Knee Raise", reps: "10" },
          { name: "Bulgarian Split Squat", reps: "8/leg" },
        ],
      },
      {
        key: "B", kind: "straight", rounds: 3, restBetweenRounds: 120,
        exercises: [{ name: "Two-Arm KB Swing", reps: "30-45s" }],
      },
      {
        key: "C", kind: "circuit", rounds: 2, restBetweenEx: 15, restBetweenRounds: 30,
        exercises: [
          { name: "Push-Up", reps: "12-15" },
          { name: "Jump Squat", reps: "10" },
          { name: "Plank", reps: "30s" },
        ],
      },
    ],
  },
  "prime-w3": {
    id: "prime-w3", phase: "prime", n: 3, name: "The Pull Day", style: "mrt",
    blocks: [
      {
        key: "A", kind: "straight", rounds: 3, restBetweenRounds: 180, warmup: true,
        exercises: [{ name: "Barbell Deadlift", reps: "6-8" }],
      },
      {
        key: "B", kind: "circuit", rounds: 4, restBetweenEx: 30, restBetweenRounds: 90,
        exercises: [
          { name: "The Spearpoint", reps: "6-8", signature: true },
          { name: "Goblet Squat", reps: "10" },
          { name: "Inverted Row", reps: "6-10" },
          { name: "Single-Leg Hip Raise", reps: "10/leg" },
        ],
      },
      {
        key: "C", kind: "circuit", rounds: 1, restBetweenEx: 15, restBetweenRounds: 0,
        note: "One round, everything on the table: hold the plank as long as you can, jacks for the full 45, chin-ups to empty.",
        exercises: [
          { name: "Plank", reps: "max hold" },
          { name: "Jumping Jack", reps: "45s" },
          { name: "Chin-Up", reps: "AMRAP" },
        ],
      },
    ],
  },
  "prime-w4": {
    id: "prime-w4", phase: "prime", n: 4, name: "The Front Gate", style: "mrt",
    blocks: [
      {
        key: "A", kind: "circuit", rounds: 4, restBetweenEx: 30, restBetweenRounds: 90,
        exercises: [
          { name: "Barbell Front Squat", reps: "8" },
          { name: "Plank", reps: "30s" },
          { name: "The Spearpoint", reps: "10", signature: true },
          { name: "Plank", reps: "30s" },
        ],
      },
      {
        key: "B", kind: "circuit", rounds: 4, restBetweenEx: 30, restBetweenRounds: 90,
        exercises: [
          { name: "Barbell Glute Bridge", reps: "6-8" },
          { name: "Push-Up", reps: "AMRAP" },
          { name: "Mountain Climber", reps: "30s" },
        ],
      },
      {
        key: "C", kind: "totalreps", totalReps: 20, restBetweenRounds: 90,
        note: "10+ on the first set — add weight with a belt",
        exercises: [{ name: "Pull-Up", reps: "20 total" }],
      },
    ],
  },

  /* ── ADAPT · density blocks (A 5min / B 6min / C 4min, block repeats
        with a weight bump: A +5–10%, B +3–5%, C same weight) ── */
  "adapt-w1": {
    id: "adapt-w1", phase: "adapt", n: 1, name: "Density I", style: "density",
    blocks: [
      {
        key: "A", kind: "density", minutes: 5, repMax: "8-12RM", repsPerTurn: "4-6",
        restAfter: 240, weightBumpPct: [5, 10],
        exercises: [
          { name: "Back Squat", reps: "4-6" },
          { name: "Bent-Over Row", reps: "4-6" },
        ],
      },
      {
        key: "B", kind: "density", minutes: 6, repMax: "10-15RM", repsPerTurn: "4-6",
        restAfter: 240, weightBumpPct: [3, 5],
        exercises: [
          { name: "Reverse Lunge", reps: "4-6" },
          { name: "Upright Row", reps: "4-6" },
          { name: "Flat Chest Press", reps: "4-6" },
        ],
      },
      {
        key: "C", kind: "density", minutes: 4, repMax: "10-15RM", repsPerTurn: "4-6",
        restAfter: 120, weightBumpPct: [0, 0],
        exercises: [
          { name: "Biceps Curl", reps: "4-6" },
          { name: "Lateral Raise", reps: "4-6" },
        ],
      },
    ],
  },
  "adapt-w2": {
    id: "adapt-w2", phase: "adapt", n: 2, name: "The Crown Day", style: "density",
    blocks: [
      {
        key: "A", kind: "density", minutes: 5, repMax: "8-12RM", repsPerTurn: "4-6",
        restAfter: 240, weightBumpPct: [5, 10],
        exercises: [
          { name: "The Kingmaker", reps: "4-6", signature: true },
          { name: "The Crown Press", reps: "4-6", signature: true },
        ],
      },
      {
        key: "B", kind: "density", minutes: 6, repMax: "10-15RM", repsPerTurn: "4-6",
        restAfter: 240, weightBumpPct: [3, 5],
        exercises: [
          { name: "Pull-Up", reps: "4-6", alt: "Lat Pulldown" },
          { name: "Goblet Squat", reps: "4-6" },
          { name: "Push-Up", reps: "4-6" },
        ],
      },
      {
        key: "C", kind: "density", minutes: 4, repMax: "10-15RM", repsPerTurn: "4-6",
        restAfter: 120, weightBumpPct: [0, 0],
        exercises: [
          { name: "Calf Raise", reps: "4-6" },
          { name: "Dumbbell Fly", reps: "4-6" },
        ],
      },
    ],
  },
  "adapt-w3": {
    id: "adapt-w3", phase: "adapt", n: 3, name: "Density III", style: "density",
    blocks: [
      {
        key: "A", kind: "density", minutes: 5, repMax: "8-12RM", repsPerTurn: "4-6",
        restAfter: 240, weightBumpPct: [5, 10],
        exercises: [
          { name: "Trap Bar Deadlift", reps: "4-6" },
          { name: "Barbell High Pull", reps: "4-6" },
        ],
      },
      {
        key: "B", kind: "density", minutes: 6, repMax: "10-15RM", repsPerTurn: "4-6",
        restAfter: 240, weightBumpPct: [3, 5],
        exercises: [
          { name: "Flat DB Bench Press", reps: "4-6", fill: true },
          { name: "Barbell Push Press", reps: "4-6" },
          { name: "Seated Cable Row", reps: "4-6", fill: true },
        ],
      },
      {
        key: "C", kind: "density", minutes: 4, repMax: "10-15RM", repsPerTurn: "4-6",
        restAfter: 120, weightBumpPct: [0, 0],
        exercises: [
          { name: "Hammer Curl", reps: "4-6", fill: true },
          { name: "Rear Delt Fly", reps: "4-6", fill: true },
        ],
      },
    ],
  },
  "adapt-w4": {
    id: "adapt-w4", phase: "adapt", n: 4, name: "The King's Return", style: "density",
    blocks: [
      {
        key: "A", kind: "density", minutes: 5, repMax: "8-12RM", repsPerTurn: "4-6",
        restAfter: 240, weightBumpPct: [5, 10],
        exercises: [
          { name: "The Kingmaker", reps: "4-6", signature: true },
          { name: "The Crown Press", reps: "4-6", signature: true },
        ],
      },
      {
        key: "B", kind: "density", minutes: 6, repMax: "10-15RM", repsPerTurn: "4-6",
        restAfter: 240, weightBumpPct: [3, 5],
        exercises: [
          { name: "Inverted Row", reps: "4-6" },
          { name: "Goblet Squat", reps: "4-6", fill: true },
          { name: "Dumbbell Squeeze Press", reps: "4-6" },
        ],
      },
      {
        key: "C", kind: "density", minutes: 4, repMax: "10-15RM", repsPerTurn: "4-6",
        restAfter: 120, weightBumpPct: [0, 0],
        exercises: [
          { name: "Seated Calf Raise", reps: "4-6" },
          { name: "Dumbbell Shrug", reps: "4-6" },
        ],
      },
    ],
  },

  /* ── SURGE · lactic tempo (A: 20-rep bookend · B/C: tempo blocks ·
        D: 25-rep light closer at 20–30% of A's weight) ── */
  "surge-w1": {
    id: "surge-w1", phase: "surge", n: 1, name: "The Slow Fire I", style: "tempo",
    blocks: [
      {
        key: "A", kind: "straight", rounds: 1, restBetweenRounds: 150, bookend: true,
        exercises: [{ name: "Squat", reps: "20" }],
      },
      {
        key: "B", kind: "tempo", rounds: 3, tempo: [1, 0, 4], restBetweenEx: 20, restBetweenRounds: 90,
        exercises: [
          { name: "Flat Chest Press", reps: "10-12" },
          { name: "Bent-Over Row", reps: "10-12" },
          { name: "Plank", reps: "60s" },
        ],
      },
      {
        key: "C", kind: "tempo", rounds: 4, tempo: [4, 0, 1], restBetweenEx: 10, restBetweenRounds: 90,
        exercises: [
          { name: "Lateral Raise", reps: "8-12" },
          { name: "DB Romanian Deadlift", reps: "8-12" },
        ],
      },
      {
        key: "D", kind: "straight", rounds: 1, restBetweenRounds: 0, closer: true, lightPctOfA: [20, 30],
        exercises: [{ name: "Bodyweight Squat", reps: "25" }],
      },
    ],
  },
  "surge-w2": {
    id: "surge-w2", phase: "surge", n: 2, name: "The Slow Fire II", style: "tempo",
    blocks: [
      {
        key: "A", kind: "straight", rounds: 1, restBetweenRounds: 150, bookend: true,
        exercises: [{ name: "Trap Bar Deficit Deadlift", reps: "20" }],
      },
      {
        key: "B", kind: "tempo", rounds: 3, tempo: [1, 0, 4], restBetweenEx: 20, restBetweenRounds: 90,
        exercises: [
          { name: "Pull-Up", reps: "10" },
          { name: "The Crown Press", reps: "10", signature: true },
          { name: "Feet-Elevated Plank", reps: "45s" },
        ],
      },
      {
        key: "C", kind: "tempo", rounds: 5, tempo: [3, 0, 1], restBetweenEx: 10, restBetweenRounds: 90,
        exercises: [
          { name: "Push-Up", reps: "12-15" },
          { name: "Barbell Curl", reps: "12-15" },
        ],
      },
      {
        key: "D", kind: "straight", rounds: 1, restBetweenRounds: 0, closer: true, lightPctOfA: [20, 30],
        exercises: [{ name: "Trap Bar Deficit Deadlift", reps: "25 (light)" }],
      },
    ],
  },
  "surge-w3": {
    id: "surge-w3", phase: "surge", n: 3, name: "The Slow Fire III", style: "tempo",
    blocks: [
      {
        key: "A", kind: "straight", rounds: 1, restBetweenRounds: 150, bookend: true,
        exercises: [{ name: "Rack Pull from Knee", reps: "20" }],
      },
      {
        key: "B", kind: "tempo", rounds: 3, tempo: [1, 0, 4], restBetweenEx: 20, restBetweenRounds: 90,
        exercises: [
          { name: "Incline DB Press", reps: "10-12" },
          { name: "Seated Cable Row", reps: "10-12" },
          { name: "Plank", reps: "60s" },
        ],
      },
      {
        key: "C", kind: "tempo", rounds: 4, tempo: [4, 0, 1], restBetweenEx: 10, restBetweenRounds: 90,
        exercises: [
          { name: "Lateral Raise", reps: "8-12" },
          { name: "The Kingmaker", reps: "8-12", signature: true },
        ],
      },
      {
        key: "D", kind: "straight", rounds: 1, restBetweenRounds: 0, closer: true, lightPctOfA: [20, 30],
        exercises: [{ name: "Rack Pull from Knee", reps: "25 (light)" }],
      },
    ],
  },
  "surge-w4": {
    id: "surge-w4", phase: "surge", n: 4, name: "The Kingmaker's Fire", style: "tempo",
    blocks: [
      {
        key: "A", kind: "straight", rounds: 1, restBetweenRounds: 150, bookend: true,
        exercises: [{ name: "The Kingmaker", reps: "20", signature: true }],
      },
      {
        key: "B", kind: "circuit", rounds: 4, restBetweenEx: 20, restBetweenRounds: 60,
        note: "Steady tempo here — this block is volume, not lactic burn.",
        exercises: [
          { name: "Bent-Over Row", reps: "10" },
          { name: "Low-Incline DB Press", reps: "10" },
          { name: "Feet-Elevated Plank", reps: "45s" },
        ],
      },
      {
        key: "C", kind: "tempo", rounds: 5, tempo: [3, 0, 1], restBetweenEx: 10, restBetweenRounds: 90,
        exercises: [
          { name: "Rear Delt Fly", reps: "12-15" },
          { name: "Bodyweight Glute Bridge", reps: "12-15" },
        ],
      },
      {
        key: "D", kind: "straight", rounds: 1, restBetweenRounds: 0, closer: true, lightPctOfA: [20, 30],
        exercises: [{ name: "The Kingmaker", reps: "25 (light)", signature: true }],
      },
    ],
  },

  /* ── COMPLETE · one day each of the four systems, straight from the
        book's Phase IV: GH/lactic · circuits · AMRAP density · 5×5 ── */
  "complete-w1": {
    id: "complete-w1", phase: "complete", n: 1, name: "The Furnace", style: "tempo", styleLabel: "GH / lactic day",
    blocks: [
      {
        key: "A", kind: "straight", rounds: 1, restBetweenRounds: 150, bookend: true,
        exercises: [{ name: "Rack Pull from Knee", reps: "20" }],
      },
      {
        key: "B", kind: "tempo", rounds: 3, tempo: [4, 0, 1], restBetweenEx: 20, restBetweenRounds: 90,
        exercises: [
          { name: "Low-Incline DB Press", reps: "10-12" },
          { name: "Seated Row", reps: "10-12" },
          { name: "Plank", reps: "60s" },
        ],
      },
      {
        key: "C", kind: "tempo", rounds: 4, tempo: [4, 0, 1], restBetweenEx: 10, restBetweenRounds: 90,
        exercises: [
          { name: "Lateral Raise", reps: "8-12" },
          { name: "DB Romanian Deadlift", reps: "8-12" },
        ],
      },
      {
        key: "D", kind: "straight", rounds: 1, restBetweenRounds: 0, closer: true, lightPctOfA: [20, 30],
        exercises: [{ name: "Rack Pull from Knee", reps: "25 (light)" }],
      },
    ],
  },
  "complete-w2": {
    id: "complete-w2", phase: "complete", n: 2, name: "The Engine", style: "mrt", styleLabel: "circuit day",
    blocks: [
      {
        key: "A", kind: "circuit", rounds: 5, restBetweenEx: 30, restBetweenRounds: 180,
        exercises: [
          { name: "The Crown Press", reps: "8", signature: true },
          { name: "The Kingmaker", reps: "6", signature: true },
          { name: "Barbell Bent-Over Row", reps: "8" },
          { name: "Hanging Knee Raise", reps: "10" },
        ],
      },
      {
        key: "B", kind: "straight", rounds: 3, restBetweenRounds: 120,
        exercises: [{ name: "Two-Arm KB Swing", reps: "30-45s" }],
      },
      {
        key: "C", kind: "circuit", rounds: 2, restBetweenEx: 15, restBetweenRounds: 30,
        exercises: [
          { name: "Push-Up", reps: "12-15" },
          { name: "Jump Squat", reps: "10" },
          { name: "Plank", reps: "30s" },
        ],
      },
    ],
  },
  "complete-w3": {
    id: "complete-w3", phase: "complete", n: 3, name: "The Ledger", style: "density", styleLabel: "density day",
    blocks: [
      {
        key: "A", kind: "density", minutes: 5, repMax: "8-12RM", repsPerTurn: "6-8",
        restAfter: 240, weightBumpPct: [5, 10],
        exercises: [
          { name: "Trap Bar Deadlift", reps: "6-8" },
          { name: "High Pull", reps: "6-8" },
        ],
      },
      {
        key: "B", kind: "density", minutes: 6, repMax: "12-15RM", repsPerTurn: "6-8",
        restAfter: 240, weightBumpPct: [3, 5],
        exercises: [
          { name: "Reverse Lunge", reps: "6-8" },
          { name: "Face Pull", reps: "6-8" },
          { name: "Standing DB Overhead Press", reps: "6-8" },
        ],
      },
      {
        key: "C", kind: "density", minutes: 4, repMax: "8-12RM", repsPerTurn: "6-8",
        restAfter: 120, weightBumpPct: [0, 0],
        exercises: [
          { name: "Rear Delt Fly", reps: "6-8" },
          { name: "Reverse Curl", reps: "6-8" },
        ],
      },
    ],
  },
  "complete-w4": {
    id: "complete-w4", phase: "complete", n: 4, name: "The Summit", style: "strength", styleLabel: "strength day",
    blocks: [
      {
        key: "A", kind: "circuit", rounds: 5, restBetweenEx: 90, restBetweenRounds: 120, autoregulate: true,
        note: "Pick a weight you get 5 with on set 1 — you're NOT supposed to hit 5 on all five sets. Rest until ready; the ring is a guide, not a whip.",
        exercises: [
          { name: "Barbell Front Squat", reps: "5" },
          { name: "Weighted Chin-Up", reps: "5" },
        ],
      },
      {
        key: "B", kind: "circuit", rounds: 5, restBetweenEx: 90, restBetweenRounds: 120, autoregulate: true,
        note: "Same rule as A: alternate the pair for 5 sets each, fully recovered between lifts.",
        exercises: [
          { name: "Bench Press", reps: "5" },
          { name: "The Kingmaker", reps: "5", signature: true },
        ],
      },
    ],
  },
};

/* diet-stress debuff meters — reset simultaneously by a Cheat Day event */
export const DIET_DEBUFFS = [
  { id: "thyroid", label: "thyroid output", line: "T3/T4 throttles down under a long deficit" },
  { id: "bmr", label: "metabolic rate", line: "the furnace dims — starvation mode" },
  { id: "cortisol", label: "cortisol load", line: "stress hormone lingers, eats muscle" },
  { id: "leptin", label: "leptin signal", line: "fullness signal fades — the plateau" },
];

export const PHASE_ORDER = ["prime", "adapt", "surge", "complete"];
