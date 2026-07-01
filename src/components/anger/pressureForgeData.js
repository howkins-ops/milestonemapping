/* ════════════════════════════════════════════════════════════════════════
   PRESSURE FORGE — data & content

   The 4th game in the Anger Gym. Where the other three arcades bleed off
   raw heat, Pressure Forge trains you to *forge* it: sort the pressure,
   cool the danger, reframe the challenge, load a resource, and walk out
   with one clean action.

   Research spine (kept honest, no toxic hustle):
     · Stress can help or harm — resources vs. demands decide which. (NIMH; JD-R)
     · Challenge stressors build you; hindrance stressors burn you.
     · Stress-arousal reappraisal gives a small-but-real performance edge.
     · Rumination is wasted energy — name it, filter fact from story, act.
     · Burnout is recovery debt, not weakness. Maintenance protects the mission.
     · The win is always ONE clean action.
   ════════════════════════════════════════════════════════════════════════ */

// ─── The sorting bins — the heart of the Forge Floor ─────────────────────────
// Every raw stressor is one of these. Sorting right is the skill.
export const SORT_BINS = [
  {
    id: "challenge",
    label: "Challenge Fuel",
    icon: "🔥",
    accent: "#FFB000",
    blurb: "Hard but meaningful. You have — or can get — what it takes. Burn it.",
  },
  {
    id: "hindrance",
    label: "Hindrance Friction",
    icon: "⛓️",
    accent: "#FF3B5C",
    blurb: "Unclear, unfair, or blocking. Needs a boundary, a fix, or clarity — not more force.",
  },
  {
    id: "recovery",
    label: "Recovery Debt",
    icon: "🛌",
    accent: "#00F0FF",
    blurb: "Your tank is empty. This is a rest problem, not a push problem.",
  },
  {
    id: "smoke",
    label: "Rumination Smoke",
    icon: "💨",
    accent: "#7B2CFF",
    blurb: "The same thought on a loop, no new action. Clear it before it blinds you.",
  },
  {
    id: "problem",
    label: "Real Problem",
    icon: "🧩",
    accent: "#00FFBF",
    blurb: "An actual thing that needs a decision or a plan. Face the facts, then move.",
  },
];

export const BIN_BY_ID = Object.fromEntries(SORT_BINS.map((b) => [b.id, b]));

// ─── Pressure sources — each drops raw materials onto the forge floor ────────
// `bin` is the correct classification; `note` is the coaching you get for it.
export const PRESSURE_SOURCES = [
  {
    id: "quota",
    label: "Sales / Quota",
    icon: "🎯",
    accent: "#FFB000",
    materials: [
      { label: "I'm behind on my numbers", bin: "challenge", note: "A hard target you can move with reps. That's fuel — if you don't burn it as panic." },
      { label: "Everyone else is ahead of me", bin: "smoke", note: "The leaderboard is data, not identity. Comparison burns heat and forges nothing." },
      { label: "That customer wasted my time", bin: "challenge", note: "It stings, but it's a rep. The lesson is a faster qualifying question next time." },
      { label: "Only got 3 hours of sleep", bin: "recovery", note: "No script fixes a dead battery. This one gets forged with rest, not effort." },
      { label: "Nobody explained the new commission plan", bin: "hindrance", note: "Unclear rules aren't your fault to out-hustle. Ask for clarity — remove the friction." },
    ],
  },
  {
    id: "founder",
    label: "Founder / Runway",
    icon: "🚀",
    accent: "#FF3EDB",
    materials: [
      { label: "Runway is getting low", bin: "problem", note: "Real and solvable. Panic makes no numbers — facts and one revenue action do." },
      { label: "The launch flopped, no one bought", bin: "challenge", note: "Brutal, but it's a debrief with data. What one thing do you change next?" },
      { label: "I feel like a total failure", bin: "smoke", note: "That's a story, not a metric. Your business needs numbers, not self-attack." },
      { label: "Co-founder isn't pulling their weight", bin: "hindrance", note: "This needs a direct conversation, not silent resentment. Fix the system." },
      { label: "Haven't slept properly in a week", bin: "recovery", note: "You're deciding the company's future on an empty tank. Refuel first." },
    ],
  },
  {
    id: "rejection",
    label: "Rejection Road",
    icon: "🚪",
    accent: "#FF3B5C",
    materials: [
      { label: "\"Not interested.\"", bin: "challenge", note: "One no. It's a rep, not a referendum. Convert it into a sharper opener." },
      { label: "Door slammed in my face", bin: "challenge", note: "Rude, but it's data on timing and approach — not proof about you." },
      { label: "I keep replaying the rejection", bin: "smoke", note: "Re-living it changes nothing. Name it, take the lesson, knock the next door." },
      { label: "Maybe I'm just bad at this", bin: "smoke", note: "That's the loop talking. Skill is trainable; identity isn't on the line." },
      { label: "No leads left in this territory", bin: "problem", note: "A real gap. That needs a plan — new list, new channel — not more self-blame." },
    ],
  },
  {
    id: "client",
    label: "Client Chaos",
    icon: "🌀",
    accent: "#00F0FF",
    materials: [
      { label: "Client wants a refund", bin: "problem", note: "A concrete thing to handle. Decide your policy, respond calmly, move on." },
      { label: "They're ghosting me", bin: "problem", note: "Annoying but workable — one clean follow-up and a close date, not obsessing." },
      { label: "Client was rude and disrespectful", bin: "hindrance", note: "That's friction, not fuel. A boundary protects your energy for real work." },
      { label: "I can't stop thinking about the bad review", bin: "smoke", note: "One review on loop. Extract the one useful note, then let the rest go." },
      { label: "Scope keeps changing on me", bin: "hindrance", note: "Undefined scope drains everyone. Clarify and write it down — remove the friction." },
    ],
  },
  {
    id: "money",
    label: "Cash Flow Canyon",
    icon: "💸",
    accent: "#00FFBF",
    materials: [
      { label: "Cash is tight this month", bin: "problem", note: "Real and facts-first. Look at the number, then take one revenue action." },
      { label: "I'm in a constant money-worry loop", bin: "smoke", note: "Worry isn't planning. Convert the loop into a single review + one move." },
      { label: "Comparing my income to people online", bin: "smoke", note: "Curated highlight reels vs. your real life. That's smoke — clear the screen." },
      { label: "A big bill is coming", bin: "problem", note: "Known and plannable. Put it on paper and choose the next step." },
      { label: "Haven't eaten a real meal today", bin: "recovery", note: "You can't out-think low blood sugar. Fuel the body first." },
    ],
  },
  {
    id: "boss",
    label: "Manager Pressure",
    icon: "🎩",
    accent: "#7B2CFF",
    materials: [
      { label: "Boss piles on pressure with zero coaching", bin: "hindrance", note: "Pressure without support is a hindrance. Ask for the resource you actually need." },
      { label: "Big presentation tomorrow", bin: "challenge", note: "High stakes, in your control. Prep is the hammer — this is fuel." },
      { label: "Vague expectations, don't know what 'good' is", bin: "hindrance", note: "You can't hit an unclear target. Get the definition — that's the fix." },
      { label: "Replaying what my boss said", bin: "smoke", note: "The loop won't change what happened. One takeaway, then drop it." },
      { label: "Too many late nights in a row", bin: "recovery", note: "Overdrive isn't commitment. The forge cracks without a cooling cycle." },
    ],
  },
  {
    id: "overwhelm",
    label: "Too Much At Once",
    icon: "🌊",
    accent: "#FFB000",
    materials: [
      { label: "Too many tasks, don't know where to start", bin: "problem", note: "Not a crisis — a prioritization problem. Pick the one that matters, start there." },
      { label: "I should be so much further by now", bin: "smoke", note: "'Should' is comparison in disguise. It burns heat and builds nothing." },
      { label: "Everything is on fire at once", bin: "problem", note: "Feels chaotic; it's a triage problem. What's the one fire that's actually urgent?" },
      { label: "Running on caffeine, no rest", bin: "recovery", note: "Stimulant on empty is a crack forming. Coolant before more coal." },
      { label: "Notifications never stop", bin: "hindrance", note: "Constant interruption is friction. Cut the input — that's a system fix." },
    ],
  },
  {
    id: "self",
    label: "Self-Doubt Mirror",
    icon: "🪞",
    accent: "#FF3EDB",
    materials: [
      { label: "I'm not good enough for this", bin: "smoke", note: "A story, not a fact. It repeats and forges nothing. Name it and set it down." },
      { label: "I keep spiraling on failing publicly", bin: "smoke", note: "Fear playing on loop. The antidote is one small, controllable rep." },
      { label: "I feel like I have to prove myself", bin: "smoke", note: "Proving-mode burns hot and fast. You don't owe the furnace a performance." },
      { label: "There's a real skill I'm missing", bin: "problem", note: "Honest and fixable. Name the gap, find the resource — that's a plan." },
      { label: "Been pushing for weeks with no break", bin: "recovery", note: "That's not grit anymore, it's debt. Maintenance keeps the mission alive." },
    ],
  },
];

export const SOURCE_BY_ID = Object.fromEntries(PRESSURE_SOURCES.map((s) => [s.id, s]));

// ─── Reappraisal Reactor — hot thought → challenge fuel ──────────────────────
export const REFRAMES = [
  { from: "My heart is racing.", to: "My body is mobilizing energy for something that matters." },
  { from: "I feel so much pressure.", to: "This is loud because it matters to me — that's usable." },
  { from: "I got rejected.", to: "That's data and a rep, not a verdict on who I am." },
  { from: "I'm behind.", to: "So I prioritize the next controllable action and go." },
  { from: "I'm failing.", to: "My business needs numbers, not self-attack." },
  { from: "Everyone's ahead of me.", to: "The leaderboard is data, not my identity." },
  { from: "I can't stop.", to: "Maintenance protects the mission — rest is part of the build." },
  { from: "This is so unfair.", to: "Maybe it is — and I still choose the next move I control." },
  { from: "I'm scared.", to: "Fear means it counts. I need a resource and a next move." },
  { from: "I have to prove myself.", to: "I just have to forge one clean move. Not my whole life." },
];

// ─── Resource Loadout — same demand + strong resources = challenge, not threat ─
export const RESOURCE_GROUPS = [
  { id: "body", label: "Body", accent: "#00F0FF", items: ["Sleep", "Real food", "Water", "Breath", "Movement", "A real break"] },
  { id: "skill", label: "Skill", accent: "#FFB000", items: ["A tighter script", "Product knowledge", "An objection response", "Financial clarity", "Negotiation reps"] },
  { id: "system", label: "System", accent: "#00FFBF", items: ["CRM / pipeline", "Follow-up tracker", "A calendar block", "A checklist", "A budget view"] },
  { id: "support", label: "Support", accent: "#FF3EDB", items: ["A coach", "A mentor", "Peer group", "Team huddle", "A friend", "Faith / values"] },
  { id: "mind", label: "Mind", accent: "#7B2CFF", items: ["A reframe", "My values", "Self-efficacy", "One clear next action"] },
];

// ─── Forge the action — one clean move ends every round ──────────────────────
// A general pool; sources point at a tailored subset first.
export const CLEAN_ACTIONS = [
  "Make 3 focused sales attempts",
  "Send 1 calm follow-up",
  "Ask 1 better qualifying question",
  "Review cash position + send 3 revenue follow-ups",
  "Write one boundary and send it",
  "Take a 2-minute reset, then decide",
  "Sleep instead of spiraling",
  "Update the script once",
  "Clarify one unclear expectation",
  "Do one 15-minute focused sprint",
  "Ask for coaching on one specific thing",
  "Repair one mistake, cleanly",
  "Stop doom-scrolling for the night",
  "Drink water + eat a real meal",
  "Plan tomorrow's first move",
  "Delegate or delete one non-essential task",
];

export const SOURCE_ACTIONS = {
  quota: ["Make 3 focused sales attempts", "Ask 1 better qualifying question", "Update the script once", "Plan tomorrow's first move"],
  founder: ["Review cash position + send 3 revenue follow-ups", "Ask for coaching on one specific thing", "Delegate or delete one non-essential task", "Plan tomorrow's first move"],
  rejection: ["Make 3 focused sales attempts", "Ask 1 better qualifying question", "Update the script once", "Take a 2-minute reset, then decide"],
  client: ["Send 1 calm follow-up", "Write one boundary and send it", "Clarify one unclear expectation", "Repair one mistake, cleanly"],
  money: ["Review cash position + send 3 revenue follow-ups", "Drink water + eat a real meal", "Plan tomorrow's first move", "Delegate or delete one non-essential task"],
  boss: ["Clarify one unclear expectation", "Ask for coaching on one specific thing", "Write one boundary and send it", "Sleep instead of spiraling"],
  overwhelm: ["Do one 15-minute focused sprint", "Delegate or delete one non-essential task", "Plan tomorrow's first move", "Take a 2-minute reset, then decide"],
  self: ["Do one 15-minute focused sprint", "Ask for coaching on one specific thing", "Drink water + eat a real meal", "Take a 2-minute reset, then decide"],
};

// ─── Recovery / cooldown options ─────────────────────────────────────────────
export const RECOVERY_OPTIONS = [
  { label: "3 slow breaths", icon: "🌬️" },
  { label: "Drink water", icon: "💧" },
  { label: "Step outside for 2 min", icon: "🚶" },
  { label: "Eat something real", icon: "🍎" },
  { label: "Stretch it out", icon: "🧘" },
  { label: "Say one thing I'm grateful for", icon: "🙏" },
  { label: "Close the leaderboard", icon: "📵" },
  { label: "Plan a real stop time tonight", icon: "🌙" },
];

// ─── Coach Ember — direct, high-performance, no toxic positivity ─────────────
export const COACH = {
  intake: [
    "Something's running hot. Good — heat is raw material. Let's forge it.",
    "You showed up instead of exploding. That's already the blacksmith move.",
    "Bring the pressure to the anvil. We don't destroy it here — we shape it.",
  ],
  heatHigh: [
    "Your forge is too hot to make decisions. We cool it before we swing.",
    "That's a lot of heat. Enough to melt the system if we don't regulate first.",
    "High heat isn't the problem yet. Deciding while it's this hot would be.",
  ],
  heatMid: [
    "Hot enough to forge, not hot enough to burn you. That's the working range.",
    "Good working heat. Let's sort what's actually in the fire.",
  ],
  heatLow: [
    "Cooler than you thought. Sometimes naming it is half the cooling.",
    "Low heat — clean conditions. Let's see what's really here.",
  ],
  sortRight: [
    "Sorted clean. You just turned noise into something you can work.",
    "That's it. Right bin, less smoke.",
    "Correct. The pressure gets lighter the second you name what it is.",
  ],
  sortWrong: [
    "Not quite — that's a different kind of heat. Look again.",
    "Careful. Treat a hindrance like a challenge and you'll grind for nothing.",
    "Miss. Some of this is fuel, some of it's just smoke. Re-sort it.",
  ],
  reframe: [
    "There it is. Same arousal, better story. That's usable energy now.",
    "You just turned a threat into fuel. Small edge, real edge.",
  ],
  resource: [
    "Same demand, more resources — that's how a threat becomes a challenge.",
    "This was never a mindset problem. You needed a resource. Now you have one.",
  ],
  forge: [
    "One clean move. Not your whole life — just the next swing of the hammer.",
    "That's the steel. Small, controllable, done today.",
  ],
  sprint: [
    "Heat's on the metal now. Stay on the anvil — ignore the smoke.",
    "This is the rep. Comparison and rumination will try to pull you off it.",
  ],
  recover: [
    "Cool the forge. Maintenance isn't quitting — it's how the mission survives.",
    "Coolant in. A blacksmith who never rests just cracks the anvil.",
  ],
  seal: [
    "You turned pressure into steel. Now go swing.",
    "Pressure sorted, heat regulated, one move forged. That's the whole game.",
    "You're not the furnace. You're the blacksmith. Don't forget it.",
  ],
  // extra one-liners for flavour / weekly insights
  lines: [
    "Heat is here. Do not waste it.",
    "That is not failure. That is raw material.",
    "Sort the pressure before you swing the hammer.",
    "This is not a mindset problem. You need a resource.",
    "Rejection ore detected. Convert it into reps.",
    "You do not need more rage. You need a cleaner next move.",
    "Burnout is not proof of commitment.",
    "Rest is part of the build.",
    "Do not confuse pressure with purpose.",
    "Pressure without process becomes panic.",
    "Your next action is the hammer. Everything else is noise.",
    "Forge one move. Not your whole life.",
  ],
};

export function pick(arr, seed) {
  if (!arr || !arr.length) return "";
  const i = typeof seed === "number" ? Math.abs(seed) % arr.length : Math.floor(Math.random() * arr.length);
  return arr[i];
}

// ─── Progression ─────────────────────────────────────────────────────────────
// Levels advance on lifetime forges (clean actions shipped).
export const LEVELS = [
  { min: 0, name: "Spark", icon: "✦", color: "#FF3B5C", tagline: "The heat just found the forge." },
  { min: 2, name: "Apprentice", icon: "🔨", color: "#FF6B3B", tagline: "Learning to hold the hammer." },
  { min: 5, name: "Heat Handler", icon: "🌡️", color: "#FFB000", tagline: "You regulate before you react." },
  { min: 9, name: "Pressure Sorter", icon: "⚖️", color: "#FACC15", tagline: "Fuel, friction, smoke — you know the difference." },
  { min: 14, name: "Rejection Forger", icon: "🚪", color: "#FF3EDB", tagline: "Every no becomes a rep." },
  { min: 20, name: "Resource Builder", icon: "🧰", color: "#00FFBF", tagline: "You meet demand with resources, not force." },
  { min: 28, name: "Focus Smith", icon: "🎯", color: "#00F0FF", tagline: "One clean action, every time." },
  { min: 38, name: "Burnout Breaker", icon: "🛡️", color: "#7B2CFF", tagline: "You forge without cracking the anvil." },
  { min: 50, name: "Challenge Master", icon: "⚔️", color: "#FFB000", tagline: "You turn threat into fuel on sight." },
  { min: 70, name: "Pressure Alchemist", icon: "👑", color: "#FACC15", tagline: "Stress becomes steel in your hands." },
];

export function getLevel(forges) {
  const n = Math.max(0, Number(forges) || 0);
  let lvl = LEVELS[0];
  for (const l of LEVELS) if (n >= l.min) lvl = l;
  return lvl;
}
export function getNextLevel(forges) {
  const n = Math.max(0, Number(forges) || 0);
  return LEVELS.find((l) => l.min > n) || null;
}

export const SPRINT_OPTIONS = [
  { mins: 2, label: "2 min", sub: "a reset sprint" },
  { mins: 5, label: "5 min", sub: "one small move" },
  { mins: 10, label: "10 min", sub: "a real dent" },
  { mins: 15, label: "15 min", sub: "full focus block" },
];

// ─── Custom pressure classifier — powers the "I'm stressed because…" creator ──
// Lightweight keyword heuristic. Returns a full Coach Ember-style read.
const KW = {
  recovery: ["sleep", "tired", "exhausted", "burn", "burnt", "burned out", "no break", "rest", "drained", "eat", "hungry", "sick", "caffeine", "no energy"],
  smoke: ["can't stop thinking", "keep thinking", "replay", "everyone else", "compare", "comparing", "not good enough", "failure", "should be", "prove myself", "what if", "obsess", "spiral"],
  hindrance: ["unclear", "unfair", "disrespect", "rude", "vague", "politics", "no support", "no coaching", "micromanage", "notifications", "interrupt", "scope", "chaos", "toxic"],
  problem: ["cash", "money", "runway", "bill", "rent", "debt", "refund", "deadline", "budget", "no leads", "quota", "target", "lost the deal", "revenue"],
};
const REFRAME_FOR = {
  recovery: "Panic won't refuel you. Rest is a resource, not a reward.",
  smoke: "This is a story on a loop, not a new fact. Name it and set it down.",
  hindrance: "You can't out-hustle a broken system. Fix the friction or set a boundary.",
  problem: "Panic makes no numbers. Look at the facts, then take one controllable action.",
  challenge: "This matters — that's why it's loud. Reframe the arousal as energy and use it.",
};
const ACTION_FOR = {
  recovery: "Schedule one recovery block and remove one non-essential task.",
  smoke: "Write the thought down once, then do one controllable action for 10 minutes.",
  hindrance: "Ask one clarifying question or set one clear boundary — in writing.",
  problem: "Face the facts on paper, then take one revenue- or progress-generating action.",
  challenge: "Make 3 focused, controllable attempts and track one improvement.",
};
const EMOTION_FOR = {
  recovery: "Fear + depletion",
  smoke: "Fear + embarrassment",
  hindrance: "Frustration + feeling disrespected",
  problem: "Fear + urgency",
  challenge: "Fear + drive",
};

export function classifyCustom(text) {
  const t = (text || "").toLowerCase();
  let type = "challenge";
  // priority: recovery > problem > hindrance > smoke > challenge fallback
  const order = ["recovery", "problem", "hindrance", "smoke"];
  for (const key of order) {
    if (KW[key].some((w) => t.includes(w))) { type = key; break; }
  }
  const bin = BIN_BY_ID[type] || BIN_BY_ID.challenge;
  return {
    type,
    bin,
    typeLabel: bin.label,
    emotion: EMOTION_FOR[type],
    reframe: REFRAME_FOR[type],
    action: ACTION_FOR[type],
    coach: pick(COACH.lines, t.length),
  };
}
