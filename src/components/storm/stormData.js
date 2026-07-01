// ============================================================
//  STORM CAPTAIN — game data
//  "You are not the storm. You are the captain."
//  Anger / overwhelm regulation, dressed as sea survival.
// ============================================================

// ── Storm sources ───────────────────────────────────────────
// Each storm is a real-life pressure translated into weather.
// `enemy` = the symbolic sea-form of the trigger (no real people).
// `leaks` = the labelled holes that flood the ship in this storm.
// `type`  = the leak category most of this storm's leaks belong to.
export const STORMS = [
  {
    id: "work",
    label: "Work / Boss",
    emoji: "🏢",
    color: "#00F0FF",
    enemy: "Workload Waves",
    tag: "Deadlines, meetings, a boss who keeps changing the plan.",
    leaks: ["Boss pressure", "Too much to do", "Unclear expectations", "Customer cancelled"],
    type: "clarity",
  },
  {
    id: "sales",
    label: "Sales / Rejection",
    emoji: "📉",
    color: "#FF3EDB",
    enemy: "Rejection Reef",
    tag: "A no. Ignored again. Pressure to prove yourself.",
    leaks: ["Rejected again", "Need to prove myself", "Feeling ignored", "Comparison"],
    type: "meaning",
  },
  {
    id: "money",
    label: "Money",
    emoji: "💸",
    color: "#FACC15",
    enemy: "Money Maelstrom",
    tag: "Bills, scarcity, the number that won't stop shrinking.",
    leaks: ["Money panic", "Feeling behind", "Too much to do", "Regret"],
    type: "task",
  },
  {
    id: "relationship",
    label: "Relationship",
    emoji: "💔",
    color: "#FF3B5C",
    enemy: "Storm Serpent",
    tag: "An argument, silence, jealousy, feeling unseen.",
    leaks: ["Argument", "Feeling ignored", "Disrespect", "Need to prove myself"],
    type: "boundary",
  },
  {
    id: "family",
    label: "Family",
    emoji: "🏠",
    color: "#7B2CFF",
    enemy: "Family Storm Cloud",
    tag: "Criticism, old buttons, guilt, expectation.",
    leaks: ["Family criticism", "Disrespect", "Regret", "Feeling ignored"],
    type: "boundary",
  },
  {
    id: "self",
    label: "Anger at Myself",
    emoji: "🪞",
    color: "#00FFBF",
    enemy: "Shame Fog Leviathan",
    tag: "Regret, self-attack, 'I should have known better'.",
    leaks: ["Shame", "Regret", "Embarrassment", "Need to prove myself"],
    type: "repair",
  },
  {
    id: "disrespect",
    label: "Disrespect",
    emoji: "😤",
    color: "#FF3B5C",
    enemy: "Disrespect Kraken",
    tag: "Talked down to. Dismissed. Controlled. Embarrassed.",
    leaks: ["Disrespect", "Need to prove myself", "Embarrassment", "Argument"],
    type: "boundary",
  },
  {
    id: "overwhelm",
    label: "Overwhelm",
    emoji: "🌊",
    color: "#00F0FF",
    enemy: "The Overload Wave",
    tag: "Everything at once. Too many tabs. Drowning in tasks.",
    leaks: ["Too much to do", "Bad sleep", "Money panic", "Feeling behind"],
    type: "task",
  },
  {
    id: "traffic",
    label: "Traffic / Small stuff",
    emoji: "🚗",
    color: "#FFB000",
    enemy: "Irritation Bay",
    tag: "Slow drivers, spilled coffee, one thing after another.",
    leaks: ["Traffic", "Feeling behind", "Disrespect", "Too much to do"],
    type: "body",
  },
  {
    id: "health",
    label: "Body / Health",
    emoji: "🫀",
    color: "#00FFBF",
    enemy: "The Undertow",
    tag: "Tired, wired, hungry, in pain, running on empty.",
    leaks: ["Bad sleep", "Too much to do", "Regret", "Money panic"],
    type: "rest",
  },
];

// ── Leak types (problem-solving categories) ─────────────────
// The "patch kit". A leak is only truly sealed by the right patch.
export const LEAK_TYPES = {
  boundary: {
    id: "boundary",
    label: "Boundary Leak",
    emoji: "🚧",
    patch: "Set a boundary",
    hint: "Someone keeps crossing a line. Draw it, calmly.",
  },
  clarity: {
    id: "clarity",
    label: "Clarity Leak",
    emoji: "❓",
    patch: "Ask a clarifying question",
    hint: "Expectations are fuzzy. Get the facts before you react.",
  },
  task: {
    id: "task",
    label: "Task Leak",
    emoji: "✅",
    patch: "Choose one next action",
    hint: "Something needs doing. Pick the single next step.",
  },
  repair: {
    id: "repair",
    label: "Repair Leak",
    emoji: "🩹",
    patch: "Own it / make repair",
    hint: "You slipped. Repair one thing instead of shaming yourself.",
  },
  support: {
    id: "support",
    label: "Support Leak",
    emoji: "📻",
    patch: "Ask for help",
    hint: "You don't have to captain alone. Radio for support.",
  },
  rest: {
    id: "rest",
    label: "Rest Leak",
    emoji: "😴",
    patch: "Recover / sleep",
    hint: "You're running on empty. Recovery is a repair, not a reward.",
  },
  body: {
    id: "body",
    label: "Body Leak",
    emoji: "💧",
    patch: "Reset the body",
    hint: "Hungry, tense, over-caffeinated. Fix the machine first.",
  },
  meaning: {
    id: "meaning",
    label: "Meaning Leak",
    emoji: "🧭",
    patch: "Reconnect to why",
    hint: "You've drifted from purpose. Aim at what matters.",
  },
};

// Which leak label maps to which patch category.
export const LEAK_PATCH_MAP = {
  "Boss pressure": "clarity",
  "Too much to do": "task",
  "Unclear expectations": "clarity",
  "Customer cancelled": "meaning",
  "Rejected again": "meaning",
  "Need to prove myself": "meaning",
  "Feeling ignored": "boundary",
  "Comparison": "meaning",
  "Money panic": "task",
  "Feeling behind": "task",
  "Regret": "repair",
  "Argument": "boundary",
  "Disrespect": "boundary",
  "Family criticism": "boundary",
  "Shame": "repair",
  "Embarrassment": "repair",
  "Bad sleep": "rest",
  "Traffic": "body",
};

export function patchTypeForLeak(label, fallback = "task") {
  return LEAK_PATCH_MAP[label] || fallback;
}

// ── Body signals ────────────────────────────────────────────
export const BODY_SIGNALS = [
  { id: "chest", label: "Chest", emoji: "🫁" },
  { id: "jaw", label: "Jaw", emoji: "😬" },
  { id: "head", label: "Head", emoji: "🧠" },
  { id: "stomach", label: "Stomach", emoji: "🌀" },
  { id: "shoulders", label: "Shoulders", emoji: "🧍" },
  { id: "hands", label: "Hands", emoji: "✊" },
  { id: "throat", label: "Throat", emoji: "🗣️" },
  { id: "whole", label: "Whole body", emoji: "⚡" },
];

// ── Feelings (the naming bell) ──────────────────────────────
export const FEELINGS = [
  { id: "anger", label: "Anger", emoji: "🔥" },
  { id: "hurt", label: "Hurt", emoji: "💔" },
  { id: "fear", label: "Fear", emoji: "😨" },
  { id: "shame", label: "Shame", emoji: "🫥" },
  { id: "frustration", label: "Frustration", emoji: "😤" },
  { id: "powerless", label: "Powerlessness", emoji: "🪫" },
  { id: "embarrassment", label: "Embarrassment", emoji: "😳" },
  { id: "resentment", label: "Resentment", emoji: "🧨" },
  { id: "anxiety", label: "Anxiety", emoji: "🌀" },
  { id: "sadness", label: "Sadness", emoji: "🌧️" },
  { id: "overwhelm", label: "Overwhelm", emoji: "🌊" },
  { id: "disrespected", label: "Disrespected", emoji: "😠" },
];

// ── Values (the compass) ────────────────────────────────────
export const VALUES = [
  { id: "respect", label: "Respect", emoji: "🤝" },
  { id: "courage", label: "Courage", emoji: "🦁" },
  { id: "peace", label: "Peace", emoji: "🕊️" },
  { id: "truth", label: "Truth", emoji: "💎" },
  { id: "leadership", label: "Leadership", emoji: "⚓" },
  { id: "health", label: "Health", emoji: "🫀" },
  { id: "family", label: "Family", emoji: "🏠" },
  { id: "faith", label: "Faith", emoji: "🙏" },
  { id: "growth", label: "Growth", emoji: "🌱" },
  { id: "discipline", label: "Discipline", emoji: "🧱" },
  { id: "love", label: "Love", emoji: "❤️" },
  { id: "freedom", label: "Freedom", emoji: "🕯️" },
  { id: "integrity", label: "Integrity", emoji: "🧭" },
  { id: "focus", label: "Focus", emoji: "🎯" },
];

// ── Clean actions ───────────────────────────────────────────
// Pooled by leak-type so the "sail direction" always fits the storm.
// The game offers 3: the fitting one plus two decoys (panic / deny).
export const CLEAN_ACTIONS = {
  boundary: [
    "Wait until calm, then say one clear boundary sentence.",
    "Write the message, then sit on it for 20 minutes before sending.",
    "Name what's okay and what isn't — out loud, without attacking.",
    "Ask for what you need in one sentence, then stop talking.",
  ],
  clarity: [
    "Ask: 'Can we clarify the priority and the deadline?'",
    "Get one fact before deciding anything.",
    "Ask one question instead of assuming the worst.",
    "Separate what they said from the story you added to it.",
  ],
  task: [
    "Pick the single next action and do only that.",
    "Write down what's first, what's next, what can wait.",
    "Do the smallest 10-minute version right now.",
    "Check the real numbers, then choose one step.",
  ],
  repair: [
    "Repair one thing instead of replaying the whole thing.",
    "Own your part in one honest sentence.",
    "Say what you'd do differently — to yourself, kindly.",
    "Forgive the past you. Fix the next 10 minutes.",
  ],
  support: [
    "Text one trusted person: 'Rough day — got a minute?'",
    "Ask for the help you've been too proud to ask for.",
    "Say it out loud to someone safe before you act.",
    "Let one person share the weight.",
  ],
  rest: [
    "Stop, hydrate, and give the body 10 real minutes.",
    "Decide the rest can wait until you've slept.",
    "Walk for five minutes before you answer anything.",
    "Eat something. Then reassess the storm.",
  ],
  body: [
    "Slow the breath, unclench the jaw, drop the shoulders.",
    "Splash cold water and reset before you respond.",
    "Move the body for two minutes to burn the charge.",
    "Put down the phone until your hands stop buzzing.",
  ],
  meaning: [
    "Make one more attempt and improve one thing about it.",
    "Let this one 'no' pass without making it about your worth.",
    "Aim at what matters instead of who's watching.",
    "Do the next right thing your future self will respect.",
  ],
};

// Decoy "wrong" sail directions (panic / deny / vent) shown as tempting options.
export const DECOY_ACTIONS = [
  "Fire back right now — they need to hear it.",
  "Send the whole paragraph before you lose your nerve.",
  "Just ignore it and hope it goes away.",
  "Try to fix absolutely everything at once.",
  "Replay it again until you figure out what they meant.",
  "Say nothing and let it build under the deck.",
  "Quit / walk out and deal with it never.",
  "Prove them wrong, whatever it takes.",
];

// ── Captain Cal — 50 coach lines ────────────────────────────
export const COACH_LINES = [
  "You are in weather. You are not the weather.",
  "Do not fire cannons at the ocean.",
  "Bail first. Solve second.",
  "That leak needs a patch, not a panic.",
  "Drop anchor before your mouth takes the wheel.",
  "The wave is loud. It is not law.",
  "You don't have to solve the whole sea. Patch this leak.",
  "Hidden water still sinks ships.",
  "You stayed afloat. That counts.",
  "Storms pass. Captains practice.",
  "Your anger has wind in it. Set the sail.",
  "The ship is not doomed. It needs maintenance.",
  "Do not let one wave decide the whole voyage.",
  "Good captain move: pause before steering.",
  "That was a rumination whirlpool. Nice escape.",
  "Regulate first. Solve second. Every time.",
  "Overwhelm is water. Skill is the bucket.",
  "You cannot stop the storm. You can captain the ship.",
  "Do not make permanent decisions in temporary weather.",
  "The water is information, not an enemy.",
  "Name it and it loses half its size.",
  "Cannons feel like power for one second. Then you're patching sails.",
  "Ride the wave. Don't become it.",
  "You still have the wheel.",
  "One clean action beats ten angry ones.",
  "Breathe out longer than you breathe in. The pump works.",
  "The leak you ignore is the leak that floods you.",
  "Slow is smooth. Smooth stays afloat.",
  "That urge is a wave — rise, peak, crash, fade. Wait for fade.",
  "Anger is a wave. Don't feed it and it passes.",
  "You don't argue with the ocean. You steer.",
  "Feel the storm. Keep the wheel.",
  "A calm captain is worth ten fast ones.",
  "The compass points to who you want to be. Follow it.",
  "You're not sinking. You're learning to bail.",
  "Every storm you captain makes the hull stronger.",
  "The lighthouse is still there. You're allowed to call it.",
  "First the body, then the words.",
  "Whirlpools spin faster the more you tap the thought. Change direction.",
  "Fact first. Story later. Feeling always.",
  "Being flooded is a signal, not a failure.",
  "You met the storm and kept the ship. That's captaincy.",
  "The sea doesn't care how loud you yell. Save your breath for the pump.",
  "One boundary, said calm, does more than a hundred said hot.",
  "You reached harbor. Log it. Remember the route.",
  "Steady hands. The wheel is yours again.",
  "Don't bail forever — find the leak and patch it.",
  "Weather changes. Captains stay.",
  "You turned a flood into a voyage. Well sailed.",
  "The storm is not the enemy. The unpatched leak is.",
];

export function coachLine(seed = 0) {
  const i = ((seed % COACH_LINES.length) + COACH_LINES.length) % COACH_LINES.length;
  return COACH_LINES[i];
}

// ── Captain ranks (progression) ─────────────────────────────
export const LEVELS = [
  { rank: 1, name: "Deckhand", icon: "🧹", xp: 0, color: "#8b98a5" },
  { rank: 2, name: "Bucket Rookie", icon: "🪣", xp: 60, color: "#00F0FF" },
  { rank: 3, name: "Leak Spotter", icon: "🔍", xp: 150, color: "#00F0FF" },
  { rank: 4, name: "Anchor Dropper", icon: "⚓", xp: 300, color: "#00FFBF" },
  { rank: 5, name: "Wave Rider", icon: "🌊", xp: 520, color: "#00FFBF" },
  { rank: 6, name: "Patch Builder", icon: "🔧", xp: 800, color: "#FACC15" },
  { rank: 7, name: "Compass Reader", icon: "🧭", xp: 1150, color: "#FACC15" },
  { rank: 8, name: "Storm Navigator", icon: "🚢", xp: 1600, color: "#FF3EDB" },
  { rank: 9, name: "Harbor Finder", icon: "🏝️", xp: 2200, color: "#FF3EDB" },
  { rank: 10, name: "Fleet Leader", icon: "⛵", xp: 3000, color: "#D11EFF" },
  { rank: 11, name: "Red Zone Captain", icon: "🎖️", xp: 4000, color: "#D11EFF" },
  { rank: 12, name: "Storm Alchemist", icon: "🌩️", xp: 5500, color: "#7B2CFF" },
];

export function getLevel(xp) {
  let lvl = LEVELS[0];
  for (const l of LEVELS) if (xp >= l.xp) lvl = l;
  return lvl;
}
export function getNextLevel(xp) {
  return LEVELS.find((l) => l.xp > xp) || null;
}

// ── Badges ──────────────────────────────────────────────────
export const BADGES = [
  { id: "first_harbor", name: "First Harbor", icon: "🏁", desc: "Complete your first voyage." },
  { id: "anchor_master", name: "Anchor Master", icon: "⚓", desc: "Drop anchor before reacting 10 times." },
  { id: "deep_breather", name: "Deep Breather", icon: "🌬️", desc: "Complete 25 pump breaths." },
  { id: "leak_hunter", name: "Leak Hunter", icon: "🔧", desc: "Patch 20 leaks correctly." },
  { id: "no_cannons", name: "Cold Cannons", icon: "🧊", desc: "Finish a voyage without firing once." },
  { id: "whirlpool_escape", name: "Whirlpool Escape", icon: "🌀", desc: "Escape a rumination whirlpool." },
  { id: "urge_surfer", name: "Urge Surfer", icon: "🏄", desc: "Ride an urge wave to the fade." },
  { id: "big_drop", name: "Big Drop", icon: "📉", desc: "Drop intensity by 5+ in one voyage." },
  { id: "week_afloat", name: "Week Afloat", icon: "📆", desc: "Sail 7 days in a row." },
  { id: "compass_true", name: "True Compass", icon: "🧭", desc: "Choose a value in 15 voyages." },
  { id: "storm_navigator", name: "Storm Navigator", icon: "🚢", desc: "Reach rank Storm Navigator." },
  { id: "night_captain", name: "Night Captain", icon: "🌙", desc: "Calm a storm after 10pm." },
  { id: "clean_ten", name: "Clean Ten", icon: "✅", desc: "Log 10 clean actions." },
  { id: "repair_dock", name: "Repair Dock", icon: "🩹", desc: "Patch a repair leak on yourself." },
  { id: "boundary_keeper", name: "Boundary Keeper", icon: "🚧", desc: "Patch 10 boundary leaks." },
  { id: "calm_under_fire", name: "Calm Under Fire", icon: "🔥", desc: "Win a voyage that hit 90+ water." },
  { id: "lighthouse_caller", name: "Lighthouse Caller", icon: "🗼", desc: "Radio the lighthouse in a red storm." },
  { id: "fleet_leader", name: "Fleet Leader", icon: "⛵", desc: "Reach rank Fleet Leader." },
  { id: "dawn_patrol", name: "Dawn Patrol", icon: "🌅", desc: "Sail before 7am." },
  { id: "storm_alchemist", name: "Storm Alchemist", icon: "🌩️", desc: "Reach the final rank." },
  { id: "self_compassion", name: "Kind Captain", icon: "🫂", desc: "Calm 5 storms of anger at yourself." },
  { id: "money_calm", name: "Steady Ledger", icon: "💠", desc: "Calm 5 money storms." },
  { id: "perfect_combo", name: "Captain's Combo", icon: "🎬", desc: "Anchor → Name → Pump → Patch → Compass → Sail." },
  { id: "hundred_voyages", name: "Hundred Voyages", icon: "💯", desc: "Complete 100 voyages." },
  { id: "never_sank", name: "Unsinkable", icon: "🛟", desc: "10 voyages without an Emergency Harbor." },
];

// ── Daily challenges ────────────────────────────────────────
export const DAILY_CHALLENGES = [
  "Win a voyage using the pump breath at least twice.",
  "Patch a leak with the correct patch on the first try.",
  "Finish a storm without firing a single cannon.",
  "Drop anchor before doing anything else.",
  "Name the feeling before you bail any water.",
  "Escape a whirlpool without tapping the thought.",
  "Choose a value you don't usually pick.",
  "Log a clean action you'll actually do today.",
  "Ride one full urge wave to the fade.",
  "Calm a storm that started at 8+ intensity.",
  "Patch two leaks in one voyage.",
  "Use the lantern to reveal a hidden leak.",
  "Reach harbor with the hull above 70.",
  "Radio the lighthouse for one perspective.",
  "Finish a Daily Voyage in under 90 seconds.",
  "Bail below 30 water before patching anything.",
  "Choose Respect as your compass value.",
  "Complete the full Captain's Combo.",
  "Calm a self-anger storm with a repair patch.",
  "Set one real boundary in real life today.",
  "Do the smallest 10-minute version of a task.",
  "Ask one clarifying question instead of assuming.",
  "Get one fact before you react to anything today.",
  "Breathe out longer than you breathe in, five times.",
  "End the day by logging one thing you captained well.",
];

export function dailyChallenge(dayIndex = 0) {
  const i = ((dayIndex % DAILY_CHALLENGES.length) + DAILY_CHALLENGES.length) % DAILY_CHALLENGES.length;
  return DAILY_CHALLENGES[i];
}

// ── Custom storm creator (local symbolic mapper) ────────────
// Turns "I'm angry because my boss embarrassed me" into a storm.
// No AI backend required — keyword rules map text → symbolic weather.
const CUSTOM_RULES = [
  { keys: ["boss", "manager", "work", "job", "deadline", "meeting", "coworker"], storm: "work" },
  { keys: ["customer", "client", "sale", "rejected", "rejection", "no from", "ignored my", "left on read", "ghost"], storm: "sales" },
  { keys: ["money", "bill", "rent", "debt", "broke", "afford", "pay", "bank"], storm: "money" },
  { keys: ["partner", "wife", "husband", "girlfriend", "boyfriend", "ex", "relationship", "jealous", "cheat"], storm: "relationship" },
  { keys: ["mom", "dad", "mother", "father", "family", "parent", "sister", "brother", "kid", "child"], storm: "family" },
  { keys: ["myself", "i failed", "i messed", "i should have", "regret", "stupid of me", "my fault", "ashamed"], storm: "self" },
  { keys: ["disrespect", "talked down", "embarrassed", "dismissed", "humiliated", "controlled", "insulted"], storm: "disrespect" },
  { keys: ["everything", "too much", "overwhelm", "drowning", "behind", "so many", "can't keep up"], storm: "overwhelm" },
  { keys: ["traffic", "driving", "slow", "waiting", "line", "spilled"], storm: "traffic" },
  { keys: ["tired", "exhausted", "sleep", "sick", "pain", "hungry", "hangover", "burnt out", "burned out"], storm: "health" },
];

const FEELING_KEYS = [
  { keys: ["embarrass", "humiliat", "ashamed", "shame"], feeling: "shame + anger + powerlessness" },
  { keys: ["ignored", "unseen", "left on read", "ghost"], feeling: "hurt + rejection" },
  { keys: ["disrespect", "talked down", "dismissed", "insulted"], feeling: "anger + powerlessness" },
  { keys: ["scared", "afraid", "anxious", "panic", "worried"], feeling: "fear + anxiety" },
  { keys: ["sad", "hurt", "cry", "lonely"], feeling: "sadness + hurt" },
  { keys: ["failed", "behind", "not enough", "loser"], feeling: "shame + fear" },
];

const UNSAFE_URGES = [
  { keys: ["boss", "work", "coworker"], urge: "quit, snap in the meeting, replay it all night" },
  { keys: ["disrespect", "embarrass", "insult"], urge: "attack, send the paragraph, prove them wrong" },
  { keys: ["ex", "partner", "text", "call"], urge: "send the angry text, withdraw, keep arguing" },
  { keys: ["money", "bill"], urge: "avoid looking, panic-spend, spiral" },
  { keys: ["myself", "regret", "failed"], urge: "self-attack, give up, ruminate" },
];

function firstMatch(rules, text, fallback) {
  const lower = text.toLowerCase();
  for (const r of rules) {
    if (r.keys.some((k) => lower.includes(k))) return r;
  }
  return fallback;
}

export function buildCustomStorm(inputRaw) {
  const input = (inputRaw || "").trim();
  const stormRule = firstMatch(CUSTOM_RULES, input, { storm: "overwhelm" });
  const storm = STORMS.find((s) => s.id === stormRule.storm) || STORMS[7];

  const feelingRule = firstMatch(FEELING_KEYS, input, { feeling: "anger + frustration" });
  const urgeRule = firstMatch(UNSAFE_URGES, input, { urge: "react now, say too much, decide in the storm" });

  const bodyGuess =
    /chest|heart|breath/.test(input.toLowerCase()) ? "tight chest" :
    /jaw|teeth|clench/.test(input.toLowerCase()) ? "clenched jaw" :
    /head|think|spin/.test(input.toLowerCase()) ? "racing head" :
    /stomach|sick|gut/.test(input.toLowerCase()) ? "knotted stomach" :
    "hot face, tight chest, tense shoulders";

  const patchType = storm.type;
  const value =
    storm.id === "self" ? "growth" :
    storm.id === "disrespect" || storm.id === "relationship" ? "respect" :
    storm.id === "money" ? "focus" :
    storm.id === "sales" ? "courage" : "leadership";

  const cleanPool = CLEAN_ACTIONS[patchType] || CLEAN_ACTIONS.task;
  const cleanAction = cleanPool[0];

  return {
    input,
    storm,
    stormType: storm.label,
    enemy: storm.enemy,
    mainLeak: storm.leaks[0],
    feeling: feelingRule.feeling,
    body: bodyGuess,
    urge: urgeRule.urge,
    tool: "Anchor + Pump + " + LEAK_TYPES[patchType].patch,
    value,
    reframe: reframeFor(storm.id),
    cleanAction,
    coach: coachLine(input.length + storm.label.length),
  };
}

function reframeFor(stormId) {
  switch (stormId) {
    case "work": return "This is a busy sea, not a sinking ship. One leak at a time.";
    case "sales": return "A 'no' is weather, not a verdict on your worth.";
    case "money": return "The number is scary, but panic never paid a bill. Facts do.";
    case "relationship": return "You can be hurt and still steer with respect.";
    case "family": return "Old buttons still work. New responses are learnable.";
    case "self": return "You're allowed to repair instead of punish.";
    case "disrespect": return "Their tone is their storm. Your response is your ship.";
    case "overwhelm": return "You don't have to bail the whole ocean — just this bucket.";
    case "traffic": return "Small waves. Don't hand them the wheel.";
    case "health": return "The ship is low on fuel. That's a repair, not a flaw.";
    default: return "There is a storm. Naming it is the first move.";
  }
}

// ── Emergency / safety keyword scan ─────────────────────────
// If the custom-storm text hints at danger, we route to Emergency Harbor.
const CRISIS_KEYS = [
  "kill", "suicide", "end it", "end my life", "hurt myself", "harm myself",
  "hurt them", "hurt him", "hurt her", "kill him", "kill her", "kill them",
  "gun", "knife", "weapon", "shoot", "stab",
  "hit them", "hit him", "hit her", "beat them", "revenge",
  "want to die", "not worth living", "no reason to live",
];
export function scanForCrisis(text) {
  const lower = (text || "").toLowerCase();
  return CRISIS_KEYS.some((k) => lower.includes(k));
}

// ── Voyage tuning ───────────────────────────────────────────
// One place to balance the arcade loop.
export const TUNE = {
  tickMs: 650,          // meter update interval
  leakRate: 3.2,        // water per tick per unpatched leak
  passiveBail: 0.6,     // natural water drain per tick
  bucketDrain: 7,       // water removed per bucket tap
  bucketStorm: 1.5,     // storm removed per bucket tap
  pumpDrain: 16,        // water removed per completed breath
  pumpStorm: 13,        // storm removed per completed breath
  anchorSeconds: 5,     // inflow freeze duration
  anchorStorm: 5,       // storm removed on anchor
  nameStorm: 15,        // storm removed on naming
  nameClarity: 16,      // clarity gained on naming
  patchClarity: 12,     // clarity gained on correct patch
  wrongPatchWater: 6,   // water added on wrong patch
  cannonStormDip: 6,    // brief storm relief from venting
  cannonRebound: 18,    // storm rebound after venting
  cannonHull: 15,       // hull damage from venting
  whirlpoolStorm: 7,    // storm added per whirlpool tap
  calmStorm: 34,        // storm threshold to unlock compass
  calmWater: 42,        // water threshold to unlock compass
};

// XP awards
export const XP = {
  bucket: 1,
  pump: 5,
  anchor: 4,
  name: 6,
  patch: 12,
  whirlpool: 10,
  compass: 8,
  cleanAction: 15,
  win: 25,
  noCannon: 10,
  bigDrop: 12,
};
