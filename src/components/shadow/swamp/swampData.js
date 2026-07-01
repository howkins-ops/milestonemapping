/* ════════════════════════════════════════════════════════════════════════
   SWAMP VALVE — content module.

   All the words the game speaks live here, isolated from the game logic so
   they're trivial to expand. The comedy is on the surface (Boggo, swamp food,
   fart-clouds); the spine underneath is real anger regulation:
     · Pressure is information — bottling raises it, blowing up makes a mess,
       the valve releases it clean.
     · Name the real feeling under the anger (affect labelling).
     · Speak a clean truth: feeling + fact + need + request.
     · Choose one clean action.

   To grow any list, just add strings — nothing else references the length.
   ════════════════════════════════════════════════════════════════════════ */

/* ── Trigger categories (Arrive step) ───────────────────────────────────── */
export const CATEGORIES = [
  { id: "work", label: "Work", emoji: "💼", triggers: [
    "My boss called me out in front of everyone",
    "I got blamed for something that wasn't mine",
    "Micromanaged all day",
    "A coworker coasted while I carried it",
    "The plan changed at the last minute",
    "I got interrupted every time I spoke",
    "Unclear expectations, then criticised for guessing wrong",
    "A rude customer took it out on me",
  ]},
  { id: "sales", label: "Sales", emoji: "📞", triggers: [
    "\"Not interested\" — again",
    "They said it's too expensive",
    "The lead ghosted me",
    "A deal cancelled last minute",
    "Nobody's answering",
    "I missed target and I can feel it",
    "Got a door slammed in my face",
    "Team pressure to hit a number",
  ]},
  { id: "money", label: "Money", emoji: "💸", triggers: [
    "A bill is due and it's tight",
    "The bank balance made my stomach drop",
    "A client still hasn't paid",
    "An unexpected cost blew up the week",
    "I feel behind everyone my age",
    "Comparing my money to theirs",
    "Debt that won't quit",
    "Income feels unstable",
  ]},
  { id: "relationship", label: "Relationship", emoji: "❤️", triggers: [
    "They left my text on read",
    "My partner went cold on me",
    "We argued and nothing got solved",
    "I feel unimportant to them",
    "I got dismissed when I opened up",
    "Jealousy crept in",
    "I don't feel heard",
    "I felt disrespected",
  ]},
  { id: "family", label: "Family", emoji: "🏠", triggers: [
    "A family member criticised me",
    "Old family patterns flared up",
    "I got compared to a sibling",
    "My boundaries got steamrolled",
    "Nobody listened at dinner",
    "I felt like the family scapegoat",
    "A parent's comment stung",
    "Holiday-level tension",
  ]},
  { id: "self", label: "Self", emoji: "🪞", triggers: [
    "I wasted the whole day",
    "I procrastinated again",
    "I slipped on a habit I care about",
    "I embarrassed myself",
    "I keep replaying a regret",
    "I feel like I'm not enough",
    "I'm frustrated with my body",
    "I said something I wish I hadn't",
  ]},
  { id: "traffic", label: "Traffic / Life", emoji: "🚦", triggers: [
    "Someone cut me off",
    "Stuck in traffic, already late",
    "Endless waiting on hold",
    "Tech broke right when I needed it",
    "Noise I couldn't escape",
    "Plans changed on me",
    "Crowds and no space",
    "Bad sleep, short fuse",
  ]},
  { id: "other", label: "Something else", emoji: "🌫️", triggers: [
    "Something annoyed me today",
    "A slow-burn resentment",
    "I can't even name it yet",
  ]},
];

/* ── Body signal check ──────────────────────────────────────────────────── */
export const BODY_CUES = [
  { id: "chest", label: "Tight chest", emoji: "🫁" },
  { id: "jaw", label: "Clenched jaw", emoji: "😬" },
  { id: "head", label: "Hot / racing head", emoji: "🥵" },
  { id: "stomach", label: "Stomach knot", emoji: "🌀" },
  { id: "shoulders", label: "Tense shoulders", emoji: "🧱" },
  { id: "hands", label: "Shaky / clenched hands", emoji: "✊" },
  { id: "throat", label: "Tight throat", emoji: "🗣️" },
  { id: "whole", label: "Whole body", emoji: "⚡" },
];

/* ── The real feeling under the anger (Name-It valve) ───────────────────── */
export const HIDDEN_EMOTIONS = [
  "Hurt", "Fear", "Embarrassment", "Powerlessness", "Rejection",
  "Disrespect", "Shame", "Jealousy", "Grief", "Exhaustion",
  "Overwhelm", "Loneliness", "Insecurity", "Feeling unseen",
];

/* ── Truth-sentence builder pieces (Truth + Boundary valve) ─────────────── */
// Clean pieces build "feeling + fact + need + request". Toxic pieces are the
// swamp-texts — Boggo blocks them instead of letting them into the sentence.
export const TRUTH_PIECES = {
  clean: [
    "I felt…", "when…", "because…", "I need…",
    "I'd prefer…", "next time…", "can we…", "I'm going to…",
    "let's clarify…", "I need a minute…",
  ],
  toxic: [
    "you always", "you never", "you made me", "you're useless",
    "whatever", "I'm done", "everyone's against me", "forget it",
  ],
};

// Ready-made clean sentences, keyed loosely to hidden emotions, offered as
// "steal this one" starters.
export const TRUTH_TEMPLATES = [
  "I felt embarrassed being corrected in front of everyone. I'd prefer private feedback next time.",
  "I'm frustrated the plan changed last minute. I need clearer expectations up front.",
  "I felt hurt when I didn't hear back. I need direct communication.",
  "I'm angry about the cancellation. I'm going to reset and follow up cleanly tomorrow.",
  "I felt disrespected in that exchange. Can we talk about it directly?",
  "I'm overwhelmed right now. I need to break this into one next step.",
  "I felt dismissed when I opened up. I need to know it matters to you.",
  "I'm carrying more than my share. I need us to split this fairly.",
];

/* ── Clean action library (end of a release) ────────────────────────────── */
export const CLEAN_ACTIONS = [
  "Take 3 slow breaths",
  "Drink a glass of water",
  "Walk for 2 minutes",
  "Write the message — but don't send it yet",
  "Ask one clarifying question",
  "Set one clear boundary",
  "Make one calm follow-up",
  "Own your part and say so",
  "Clarify what's actually expected",
  "Take a 10-minute timeout",
  "Pray / meditate for a minute",
  "Stretch the shoulders and jaw",
  "Eat something real",
  "Sleep on it instead of spiralling",
  "Tidy one small space",
  "Write down just the facts",
  "Stop the doom-scroll",
  "Text a friend for support",
  "Reschedule the hard conversation",
  "Let it go for tonight",
  "Do one task for 10 minutes",
  "Say the one true thing, calmly",
  "Move your body safely",
  "Choose not to react right now",
];

/* ── Boggo — the swamp coach. Comedy on top, wisdom underneath. ─────────── */
export const BOGGO_LINES = {
  greet: [
    "Welcome to the swamp. Something's bubbling — let's not let it blow.",
    "Pressure's a message, friend. Let's open it before it opens you.",
    "You're not calm. You're pressurised. Big difference. Come on.",
  ],
  pressure: [
    "Ooh. That's a lot of swamp gas. Good thing you came here first.",
    "I can hear the pipes creaking from here.",
    "Whatever you're holding — I felt it in my belly. Let's vent it clean.",
  ],
  bottle: [
    "That looked calm. It wasn't. That's bottled swamp gas — it always leaks sideways.",
    "Suppression isn't peace. The pressure just went somewhere quieter and meaner.",
    "You swallowed it. Now I'm bloated. Try a valve.",
  ],
  blowup: [
    "Loud release. Big mess. NPCs are running. Try a valve.",
    "That felt powerful for one second and cost you ten. Let's clean it up.",
    "Explosion is not expression. Same trigger's already crawling back, stronger.",
  ],
  correction: [
    "That released pressure, but it made a mess. No shame — try a clean valve.",
    "Hey, we've all rage-texted the swamp. Let's aim it better.",
    "Nice instinct, wrong pipe. Pick a safe one.",
  ],
  win: [
    "Clean release. No swamp damage. That's grown-swamp-creature behaviour.",
    "Pressure dropped. Wisdom unlocked. Look at you.",
    "That fart was funny. The boundary was the real win.",
    "You were about to send a swamp-text. Good save.",
    "Named it. Drained it. The river's running clear.",
  ],
  breath: [
    "Long exhale, friend. You can't think your way calm while you're flooded.",
    "Slow it down. The swamp settles when you do.",
  ],
  name: [
    "Under every red gas cloud is a softer thing. Name it and it loosens.",
    "Anger's just the bodyguard. Who's it guarding?",
  ],
};

export function boggoLine(pool, seed = 0) {
  const list = BOGGO_LINES[pool] || [];
  if (!list.length) return "";
  return list[Math.abs(seed) % list.length];
}

/* ── Belly Boiler — emotional meals → colored gas ───────────────────────── */
export const GAS_TYPES = {
  red:    { label: "anger",      color: "#FF3B5C" },
  yellow: { label: "anxiety",    color: "#FACC15" },
  purple: { label: "shame",      color: "#D11EFF" },
  green:  { label: "jealousy",   color: "#00FFBF" },
  gray:   { label: "exhaustion", color: "#9aa0b5" },
  black:  { label: "resentment", color: "#7B2CFF" },
  blue:   { label: "sadness",    color: "#3AA0FF" },
};

export const MEALS = [
  { name: "Boss Burrito",            emoji: "🌯", gas: "red" },
  { name: "Rejection Stew",          emoji: "🍲", gas: "blue" },
  { name: "Deadline Dumplings",      emoji: "🥟", gas: "yellow" },
  { name: "Shame Sandwich",          emoji: "🥪", gas: "purple" },
  { name: "Comparison Cabbage",      emoji: "🥬", gas: "green" },
  { name: "Resentment Onions",       emoji: "🧅", gas: "black" },
  { name: "Traffic Chili",           emoji: "🌶️", gas: "red" },
  { name: "Overthinking Oatmeal",    emoji: "🥣", gas: "gray" },
  { name: "Money Beans",             emoji: "🫘", gas: "yellow" },
  { name: "Family Drama Gumbo",      emoji: "🍛", gas: "black" },
  { name: "Jealousy Pickles",        emoji: "🥒", gas: "green" },
  { name: "Cancellation Curry",      emoji: "🍜", gas: "blue" },
];

// Every safe method vents a cloud; each gas has a "best" match for bonus.
export const RELEASE_METHODS = [
  { id: "breath",   label: "Breath burp",   emoji: "🌬️", safe: true, best: ["red", "yellow"] },
  { id: "truth",    label: "Truth burp",    emoji: "🗣️", safe: true, best: ["purple", "blue"] },
  { id: "boundary", label: "Boundary toot", emoji: "🚧", safe: true, best: ["black", "green"] },
  { id: "laugh",    label: "Laugh reframe", emoji: "😂", safe: true, best: ["gray", "purple"] },
  { id: "move",     label: "Move it out",   emoji: "🏃", safe: true, best: ["red", "gray"] },
  { id: "action",   label: "Clean action",  emoji: "✅", safe: true, best: ["yellow", "blue"] },
];

export const UNSAFE_METHODS = [
  { id: "rant",  label: "Rage rant",  emoji: "🤬", safe: false },
  { id: "text",  label: "Mean text",  emoji: "📱", safe: false },
  { id: "slam",  label: "Door slam",  emoji: "🚪", safe: false },
];

export const FIREFLY_REWARDS = ["✨", "🌸", "🦋", "🍄", "⭐", "🫧"];

/* ── Rumination Bog — the loops, and the ladder out ─────────────────────── */
export const RUMINATION_THOUGHTS = [
  "They disrespected me",
  "I should have said something",
  "I can't believe that happened",
  "I'm such an idiot",
  "They always do this",
  "I'll never win",
  "I need to prove them wrong",
  "Everyone saw me fail",
  "It's all falling apart",
  "I can't let this go",
];

// The five rungs out of the bog (order matters).
export const BOG_LADDER = [
  { id: "fact",     tool: "Fact Stick",         emoji: "🪵", prompt: "Just the facts — what actually happened? (No adjectives.)", ph: "What a camera would have seen…" },
  { id: "story",    tool: "Distance Mirror",    emoji: "🪞", prompt: "What story am I adding on top of the facts?", ph: "The story I'm telling myself is…" },
  { id: "feeling",  tool: "Name-It Lantern",    emoji: "🏮", prompt: "What feeling is actually here, under the loop?", ph: "Underneath, I feel…" },
  { id: "reframe",  tool: "Reframe Rope",       emoji: "🪢", prompt: "Say it truer — the fair, non-catastrophic version.", ph: "A truer way to say it is…" },
  { id: "action",   tool: "Clean Action Bridge", emoji: "🌉", prompt: "One small action that moves me out of the loop.", ph: "The one thing I'll do is…" },
];
