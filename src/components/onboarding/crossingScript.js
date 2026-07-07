// ════════════════════════════════════════════════════════════════════════
// THE CROSSING — the complete script
// EVERY line of Crossing copy lives here (witnessLines law) so tone can be
// audited in one place. Copy laws: never shame, plain human voice, identity
// over goals, "receipts" for proof, "reps" for repeated action.
// ════════════════════════════════════════════════════════════════════════

// ── Phase 1 · IGNITION — brand & belief ─────────────────────────────────
export const IGNITION_SHOTS = [
  {
    id: "ignite-1",
    kicker: "THE CROSSING",
    lines: [
      "Most apps hand you a stack of tools and wish you luck.",
      "This isn't that.",
    ],
    cta: "Keep walking →",
  },
  {
    id: "ignite-2",
    kicker: "THE OTHER SIDE",
    lines: [
      "This is a crossing. You walk through it once, on your way to somewhere.",
      "On the other side is a version of you that keeps promises.",
      "Not a better mood. Not a new hack. A different person, built one receipt at a time.",
    ],
    cta: "Keep walking →",
  },
  {
    id: "ignite-3",
    kicker: "FROM THE ASHES · RISES THE BUILDER",
    phoenix: true,
    lines: [
      "Around here there's a saying: the goal is the bait. The transformation is the catch.",
      "Everything burns eventually. What matters is what rises.",
      "Five minutes. That's the crossing. Ready?",
    ],
    cta: "Begin →",
  },
];

// ── Phase 2 · MIRROR — what are you building toward? ────────────────────
export const MIRROR = {
  kicker: "THE MIRROR",
  title: "What are you building toward?",
  sub: "Pick everything that's true. This shapes your map.",
  min: 1,
  cta: "That's me →",
};

export const GOAL_CHIPS = [
  { id: "escape", label: "Escape the 9-5", icon: "🚪" },
  { id: "business", label: "Build my business", icon: "🚀" },
  { id: "sales", label: "Master sales", icon: "🎯" },
  { id: "mind", label: "Master my mind", icon: "🧠" },
  { id: "body", label: "Build my body", icon: "🏋️" },
  { id: "discipline", label: "Discipline & habits", icon: "⚡" },
  { id: "purpose", label: "Find my purpose", icon: "🧭" },
];

// ── Phase 3 · THE WALL — what's burned it down before? ──────────────────
// On select, the screen answers immediately with the specific counter-weapon.
export const WALL = {
  kicker: "THE WALL",
  title: "What's burned it down before?",
  sub: "Everyone hits a wall. Naming yours is how we aim the map at it.",
  cta: "That's the wall →",
};

export const WALL_CHOICES = [
  {
    id: "vanish",
    label: "I start strong, then vanish.",
    counterKicker: "THE COUNTER: THE WITNESS",
    counter:
      "Then meet the Witness — it shows up every single day, and that part is handled now. Streaks here can burn to ash, but ash has exactly one door: Rise Again. Vanishing stops being the end of the story.",
    echo: "I start strong, then vanish",
  },
  {
    id: "alone",
    label: "Nobody holds me to it.",
    counterKicker: "THE COUNTER: THE ZONE",
    counter:
      "The Zone will. One declared mission a day, one receipt to prove it — seen by people running the same road. It's very hard to quietly quit when the fire is public.",
    echo: "Nobody holds me to it",
  },
  {
    id: "head",
    label: "My head gets in the way.",
    counterKicker: "THE COUNTER: THE INNER GYM",
    counter:
      "There's a whole wing for that. The Anger Gym for the fire, Ride the Wave for the spiral, the Shadow for what's underneath. Your head stops being the boss of the map.",
    echo: "My head gets in the way",
  },
  {
    id: "unclear",
    label: "I don't actually know what I want.",
    counterKicker: "THE COUNTER: THE ALCHEMIST",
    counter:
      "The Alchemist quest digs it out, chapter by chapter, until the real want has a name and coordinates. You don't need clarity to start — starting is how clarity shows up.",
    echo: "I don't actually know what I want",
  },
  {
    id: "everything",
    label: "I've tried everything.",
    counterKicker: "THE COUNTER: WITNESSED REPS",
    counter:
      "You've tried it alone, unwitnessed, with nothing at stake. You haven't tried it here. That's not the same experiment.",
    echo: "I've tried everything",
  },
];

export function getWallChoice(id) {
  return WALL_CHOICES.find((w) => w.id === id) || null;
}

// ── Phase 4 · THE COST — the private 12-month line ──────────────────────
export const COST = {
  kicker: "THE PRIVATE PAGE",
  title: "12 months from now, if nothing changes — what does that look like?",
  sub: "Nobody sees this but you. And the you that comes back to read it.",
  placeholder: "Write it plain. One line is enough…",
  minChars: 3,
  cta: "It's written →",
};

// ── Phase 5 · THE PATH — four archetypes ────────────────────────────────
export const PATH = {
  kicker: "CHOOSE YOUR PATH",
  title: "Four ways across. One is yours.",
  sub: "This tunes your first seven days. Every arena stays open to you either way.",
  cta: "Walk this path →",
};

export const ARCHETYPES = [
  {
    id: "builder",
    name: "THE BUILDER",
    emblem: "🏗️",
    accent: "#00F0FF",
    accentSoft: "#7B2CFF",
    tagline: "This path trains execution.",
    trains: "Milestone maps · the daily Top-5 · the Rewards Vault",
    opens: "Your first trail opens on the world map, day one.",
    vowPrefill: "I am the kind of person who finishes what I start.",
    firstArena: { label: "Map your first milestone trail", nav: "milestones" },
  },
  {
    id: "closer",
    name: "THE CLOSER",
    emblem: "🏀",
    accent: "#FFD166",
    accentSoft: "#FF7A1A",
    tagline: "This path trains the close.",
    trains: "Full Court game days · the Crystal Shop arc · the Zone",
    opens: "The court opens first — your numbers become a game you can win.",
    vowPrefill: "Every no sharpens me. I am the one who asks again.",
    firstArena: { label: "Step onto the Full Court", nav: "zone" },
  },
  {
    id: "phoenix",
    name: "THE PHOENIX",
    emblem: "🔥",
    accent: "#FF7A1A",
    accentSoft: "#FF3EDB",
    tagline: "This path trains the rise.",
    trains: "The Descent · the Anger Gym · Ride the Wave",
    opens: "The inner gym opens first — the fire starts working for you.",
    vowPrefill: "I've burned before. This time I rise.",
    firstArena: { label: "First round in the Anger Gym", nav: "anger" },
  },
  {
    id: "seeker",
    name: "THE SEEKER",
    emblem: "🧭",
    accent: "#7B2CFF",
    accentSoft: "#D11EFF",
    tagline: "This path trains purpose.",
    trains: "The Alchemist quest · Identity · Vision",
    opens: "The quest opens first — the real want gets a name.",
    vowPrefill: "I stop wandering. I start walking toward something with a name.",
    firstArena: { label: "Open Chapter One of the Alchemist quest", nav: "city" },
  },
];

export function getArchetype(id) {
  return ARCHETYPES.find((a) => a.id === id) || ARCHETYPES[0];
}

// ── Phase 6 · THE MAP — the personalized 7-day reveal ───────────────────
export const MAP_REVEAL = {
  kicker: "YOUR FIRST 7 DAYS",
  title: "The map is built.",
  echoLead: "You said:",
  echoTail: "Here's the counter.",
  sub: "Concrete days. Concrete reps. No vague promises.",
  cta: "I can do seven days →",
};

// Secondary beat per goal — used for day 5 when the body isn't in the plan.
const GOAL_SECOND_BEATS = {
  escape: { label: "One hour on the escape plan — mapped as milestone actions", icon: "🚪" },
  business: { label: "Knock out three milestone actions on your mission", icon: "🚀" },
  sales: { label: "Run your numbers on the Full Court — reps become a game", icon: "🏀" },
  mind: { label: "Ride the Wave once — 90 seconds, no failing possible", icon: "🌊" },
  discipline: { label: "A perfect Top-5 day — five votes for the future you", icon: "⚡" },
  purpose: { label: "Pin your first three images to the Vision board", icon: "🔭" },
  body: { label: "Second session in THE IRON — the plan gets heavier", icon: "🏋️" },
};

// The plan composer — f(goals, wall, path), not four hardcoded blobs.
export function buildPlan({ goals = [], wallId = null, path = "builder" } = {}) {
  const arch = getArchetype(path);
  const wantsBody = goals.includes("body");
  const days = [];

  days.push({
    day: 1,
    label: "First win — declare your first real mission",
    detail: "You'll do it in about sixty seconds, before you ever see the dashboard.",
    icon: "🏁",
  });

  days.push({
    day: 2,
    label: arch.firstArena.label,
    detail: arch.opens,
    icon: arch.emblem,
  });

  days.push({
    day: 3,
    label: "The morning ritual — stand, gratitude, Top-5",
    detail: "Ten minutes that aim the whole day.",
    icon: "🌅",
  });

  days.push({
    day: 4,
    label: "Enter the Zone — declare, then post your first receipt",
    detail: "One mission, one proof, witnessed.",
    icon: "🔥",
  });

  if (wantsBody) {
    days.push({
      day: 5,
      label: "Forge your training plan in THE IRON — rack your first session",
      detail: "Pick PUSH, PULL, LEGS or FULL BODY. The plate is in the top bar.",
      icon: "🏋️",
    });
  } else {
    const secondGoal = goals.find((g) => GOAL_SECOND_BEATS[g] && g !== "body");
    const beat = GOAL_SECOND_BEATS[secondGoal] || GOAL_SECOND_BEATS.discipline;
    days.push({ day: 5, ...beat });
  }

  days.push({
    day: 6,
    label: "Streak checkpoint — three receipts on the board by tonight",
    detail: "Small is fine. Real is what matters.",
    icon: "📈",
  });

  days.push({
    day: 7,
    label: "The Sunday Review — look back, reload the mission",
    detail: "Receipts logged. Next week gets coordinates.",
    icon: "🧭",
  });

  const wall = getWallChoice(wallId);
  return {
    title: MAP_REVEAL.kicker,
    echo: wall ? wall.echo : "",
    counterKicker: wall ? wall.counterKicker : "",
    days,
  };
}

// ── Phase 7 · THE VOW — the seal ─────────────────────────────────────────
export const VOW = {
  kicker: "THE VOW",
  title: "Say who you are now.",
  lines: [
    "Goals change what you chase. Identity changes what you keep.",
    "Edit it until it's yours. Then hold the flame until it takes.",
  ],
  holdHint: "Press and hold to seal it",
  holdMs: 2000,
  sealedStamp: "SEALED",
  releaseLine: "The flame waits.",
  cta: "Carry it forward →",
};

// ── Phase 8 · FIRST WIN — a real mission, in-flow ────────────────────────
export const FIRST_WIN = {
  kicker: "FIRST WIN",
  title: "Name your first mission.",
  sub: "Declarations are wind. Missions have coordinates. Make it real, small, and yours.",
  missionLabel: "The mission",
  missionPlaceholder: "e.g. Land my first client",
  milestoneLabel: "What's the first receipt?",
  milestonePlaceholder: "e.g. 30 doors knocked this week",
  cta: "Put it on the map →",
};

// Path-tuned suggestion chips (body chips join in when the goal is picked).
export const FIRST_WIN_CHIPS = {
  builder: ["Ship the side project", "Clear the backlog week", "Launch the thing"],
  closer: ["30 doors this week", "Book 10 appointments", "Close one deal"],
  phoenix: ["Seven calm mornings", "One gym round a day", "A week without the blow-up"],
  seeker: ["Write my why", "Finish Chapter One", "One honest hour a day"],
  body: ["Rack 3 sessions this week", "First PR on the wall"],
};

export function getFirstWinChips(path, goals = []) {
  const base = FIRST_WIN_CHIPS[path] || FIRST_WIN_CHIPS.builder;
  return goals.includes("body") ? [...base.slice(0, 2), ...FIRST_WIN_CHIPS.body] : base;
}

// ── Phase 9 · THE TORCH — celebration + the first 24 hours ──────────────
export const TORCH = {
  kicker: "YOU CROSSED",
  title: "The other side.",
  lines: [
    "The vow is sealed. The mission is on the map.",
    "From here, everything is reps and receipts.",
  ],
  checklistTitle: "THE FIRST 24 HOURS",
  cta: "ENTER THE MAP →",
};

// The checklist persists as a dashboard card until done or 7 days pass.
export function buildTorchItems({ goals = [] } = {}) {
  const items = [
    {
      id: "zone",
      label: "Enter the Zone & claim your @name",
      hint: "One mission, one receipt, witnessed.",
      nav: "zone",
      icon: "🔥",
    },
    {
      id: "city",
      label: "Meet your mentor in the City",
      hint: "Every district has a teacher.",
      nav: "city",
      icon: "🌆",
    },
    {
      id: "ritual",
      label: "Tomorrow morning: the ritual",
      hint: "Stand. Gratitude. Top-5. Ten minutes.",
      nav: "daily",
      icon: "🌅",
    },
  ];
  if (goals.includes("body")) {
    items.push({
      id: "iron",
      label: "Forge your training plan in THE IRON",
      hint: "The 45 plate in the top bar. Pick a plan, rack a session.",
      nav: null, // opens the workout mode overlay
      icon: "🏋️",
    });
  }
  items.push({
    id: "pwa",
    label: "Put the map on your home screen",
    hint: "Share → Add to Home Screen. Dismiss if it's already there.",
    nav: null,
    icon: "📱",
  });
  return items;
}

export const FIRST_HOURS_CARD = {
  kicker: "THE FIRST 24 HOURS",
  doneLine: "All lit. The crossing is behind you — the map is yours.",
};

// ── Skip — possible, but it feels like leaving a story mid-scene ─────────
export const SKIP = {
  link: "skip the crossing",
  confirmTitle: "Cross later?",
  confirmBody: "The map will wait. The other side won't come to you, though.",
  confirmCta: "Cross later",
  cancelCta: "Keep walking",
};

export const PROGRESS_PHASES = [
  "ignition",
  "mirror",
  "wall",
  "cost",
  "path",
  "map",
  "vow",
  "firstWin",
  "torch",
];
