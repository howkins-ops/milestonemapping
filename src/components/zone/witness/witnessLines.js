// The Witness — the check-in that never flakes, never nags, never judges.
//
// EVERY line of state-driven Zone copy lives here so tone can be audited in
// one place. Hard rules (from the research this feature is built on):
//   1. Did it → celebration. Didn't → "what's the plan for today?" ONLY.
//   2. NEVER ask "why didn't you". NEVER name a miss as failure.
//   3. A lapse is ash, and ash has exactly one door: "Rise Again."
//   4. Warmth first. Presence over pressure.

// Deterministic per-day pick so the Witness doesn't reroll on re-render.
export function pickLine(lines, seedStr) {
  if (!lines || !lines.length) return "";
  let h = 0;
  const s = String(seedStr || "");
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return lines[h % lines.length];
}

export function fillTokens(line, tokens = {}) {
  return line.replace(/\{(\w+)\}/g, (_, k) => (tokens[k] != null ? String(tokens[k]) : ""));
}

export const WITNESS = {
  // First ever visit, right after onboarding.
  firstVisit: [
    "I'm your Witness. I show up every day — that part is handled. You bring one true mission.",
    "This is the Zone. One declared mission, one proof, every day I'll be here to see it.",
    "No judges here. Just a fire, a mission, and someone who always shows up: me.",
  ],

  // No mission declared yet today.
  declarePrompt: [
    "New day, {name}. What's the one mission that would make today count?",
    "The fire's ready. What are you feeding it today?",
    "One mission. Small is fine — real is what matters. What is it?",
    "What would the {identity} version of you do today? Declare it.",
    "Today's a blank page. Name the one thing.",
  ],

  // Mission declared, proof not posted yet.
  provePrompt: [
    "Mission's on the board: “{mission}”. I'll be right here when it's done.",
    "You declared “{mission}”. No rush — just come back and show me.",
    "“{mission}” is lit on the board. Proof turns it into fire.",
  ],

  // Proof posted today — celebration tiers by streak.
  proofCelebration: {
    day1: [
      "SEEN. Day one is the heaviest lift there is — and you just did it. 🔥",
      "Witnessed. Every legend has a day one. This was yours.",
      "That's proof. The fire is officially lit.",
    ],
    building: [
      "Witnessed. {streak} days of showing up. That's not luck — that's you.",
      "Day {streak}. The fire's getting used to you being here. 🔥",
      "{streak} in a row. High five — see you tomorrow.",
      "Proof in. Streak at {streak}. You're becoming hard to stop.",
    ],
    strong: [
      "{streak} DAYS. You're not building a habit anymore — you're building an identity.",
      "Day {streak}. At this point the fire knows your name. 🔥🔥",
      "{streak} straight days witnessed. Quietly legendary.",
    ],
    legendary: [
      "{streak} days. I've witnessed every single one. You are the proof.",
      "Day {streak}. There are people who talk, and there's you. 👑",
    ],
  },

  // Yesterday had no proof, today still open. NO interrogation — plan only.
  planPrompt: [
    "Good to see you, {name}. What's the plan for today?",
    "Fresh day. What's the one mission for it?",
    "You're here — that's the part that matters. What are we doing today?",
    "The fire kept your place. What's today's move?",
  ],

  // Ash state (streak lapsed). One door out. Never a why.
  ashState: [
    "The fire went to ash. That's not the end of the story — it never is for a phoenix.",
    "Ash isn't failure. Ash is what fire leaves behind so something new can rise.",
    "The {fallen}-day fire turned to ash. The phoenix part comes next.",
  ],
  riseButton: ["Rise Again"],
  riseCelebration: [
    "THE PHOENIX RISES. New fire, same you — and I never stopped watching for you. 🔥",
    "Risen. The ash remembers nothing; the wings remember everything.",
    "Back in the fire. Day one, round two — the comeback is the story.",
  ],

  // Squad flavor.
  squadEruption: [
    "🌋 {squad} ERUPTED — enough of you showed up today to light the whole meter.",
    "The {squad} fire meter just blew its top. Collective proof. 🌋",
  ],
  squadQuietDay: [
    "Quiet day in {squad}. Your proof might be the spark someone else needs.",
  ],

  // Partner tools — encouragement-framed templates ONLY.
  partnerNudgeTemplates: [
    "Thinking of you today — the fire's warmer with you in it. 🔥",
    "No pressure, just presence: I'm in the Zone if you are.",
    "Your streak misses you. So does the squad. Come light something.",
  ],
  partnerCelebrateTemplates: [
    "SEEN YOU. That proof was 🔥 — proud to be your partner.",
    "Witnessed your win today. You're pulling me up with you. 💪",
    "That's back-to-back showing up. Iron sharpens iron.",
  ],
  partnerRequestProofTemplates: [
    "When you get your mission done today, I'd love to see it. 👀",
    "Show me the win when it lands — I'll be first to celebrate it.",
  ],

  // Weekly report framing (numbers are shown separately; this is the voice).
  weeklyReport: [
    "A week, witnessed. Here's what your showing-up looked like.",
    "Seven days of evidence. This is who you're becoming.",
  ],

  // Squad Arena — the games layer. Same Witness voice: warmth first, presence
  // over pressure. Detonations / misses / relegations are NEUTRAL and instantly
  // recoverable — ash, never shame. All copy token-driven (see fillTokens).
  arena: {
    // A vow is declared. Someone is now watching for it.
    vow_created: [
      "Vow set: “{title}”. {name}, I've got it on the board — and {witness} is watching for it. 🔥",
      "“{title}” is live. No judge, just a witness. You said it — now it's real.",
      "You made the call: “{title}”. The fuse is lit and I'm right here for it.",
    ],
    // Vow proven / defused before the deadline.
    vow_defused: [
      "Defused. “{title}” — done and witnessed. That's exactly how you keep your word. 🔥",
      "SEEN. You said you'd do “{title}”, and you did. Nothing louder than that.",
      "Vow kept. {name} said it, {name} did it. See you at the next one.",
    ],
    // Deadline passed. NEUTRAL — one-tap re-vow, no shame.
    vow_detonated: [
      "The fuse on “{title}” ran out. No shame in it — just re-vow and it's live again.",
      "“{title}” timed out. That's not a mark against you — it's an open door. Set it again?",
      "Time's up on this one. Vows are cheap to re-light — one tap and you're back in.",
    ],
    // Re-declaring a detonated vow. Comeback framing.
    vow_revow: [
      "Re-vowed. New fuse, same word — this is where it turns around. 🔥",
      "Back on the board. The re-vow always counts more than the first one.",
      "You lit it again, {name}. That's the whole move right there.",
    ],
    // Boss took damage from a squad check-in.
    boss_hit: [
      "{name} landed a hit on the boss. The whole {squad} felt that one. 🔥",
      "Damage in. Every proof chips it down — {squad} is closing in.",
      "That's a strike on the boss. Keep them coming, {squad}.",
    ],
    // Boss defeated by the squad.
    boss_slain: [
      "🌋 BOSS DOWN. {squad} took it together — nobody carried this one alone.",
      "Slain. That's what {squad} does when everybody shows up. 🔥",
      "The boss is finished. Collective proof, collective win. Well done, {squad}.",
    ],
    // The squad chain advanced (everyone checked in).
    chain_extended: [
      "Chain at {streak}. Every active member showed up — {squad} held the line. 🔥",
      "Link added. {streak} days unbroken. That's {squad} moving as one.",
      "{streak} in the chain. You each kept your end — see you tomorrow.",
    ],
    // Chain broke. NEUTRAL — chains rebuild fast.
    chain_broken: [
      "The chain reset. No blame in {squad} — chains are built to be rebuilt. Start the new one today?",
      "Chain's back to zero. That's just ash — {squad} rises from those all the time.",
      "Link dropped. It happens to every squad. One check-in starts the next chain.",
    ],
    // A freeze was spent to protect the chain.
    chain_frozen: [
      "Chain frozen. {squad} bought itself a day — the link holds. 🧊",
      "Freeze used. Smart play — the chain stays alive at {streak}.",
      "{name} froze the chain for {squad}. The streak sleeps safe tonight.",
    ],
    // A duel was started.
    duel_started: [
      "Duel on: {name} vs {partner}, seven days. Iron sharpens iron. 🔥",
      "It's live — {name} and {partner}, one week, may the most consistent win.",
      "{partner} accepted the challenge. Seven days of showing up. Go.",
    ],
    // Duel won.
    duel_won: [
      "{name} takes the duel. That's a week of proof stacked higher than {partner}'s. 🔥",
      "Duel won — and {partner} pushed you to it. Good iron on both sides.",
      "You edged it, {name}. Rematch whenever {partner}'s ready.",
    ],
    // Duel lost. NEUTRAL — the reps still counted.
    duel_lost: [
      "{partner} took this one — but every rep you logged is still yours. Run it back?",
      "Close duel. {partner} edged it this week; the streak you built is the real prize.",
      "Lost the duel, kept the work. That trade always favors you. Rematch?",
    ],
    // First proof of the day — beat the squad to it.
    dawn_first: [
      "First strike. {name} got there before anyone in {squad} today. 🌅",
      "Dawn belongs to you, {name}. First proof on the board.",
      "Beat the sunrise crowd — {name} lit {squad}'s fire first today.",
    ],
    // Didn't get the first strike. NEUTRAL — still early, still counts.
    dawn_missed: [
      "Someone beat you to dawn today — no loss, the day's still wide open. Light yours.",
      "First strike went to another in {squad}. Yours counts just as much whenever it lands.",
      "Missed the sunrise slot. That's fine — showing up beats showing up early.",
    ],
    // A stake was set on a vow or challenge.
    stake_set: [
      "Stake set: {name} put {amount} on the line, {witness} refereeing. Now it's serious. 🔥",
      "You backed your word with a stake. {witness} is watching — no ducking it now.",
      "Stake locked in. Skin in the game changes everything, {name}.",
    ],
    // Stake kept — the vow was honored.
    stake_kept: [
      "Stake kept. {name} put it on the line and delivered. That's the good kind of proof. 🔥",
      "Called and kept. {witness} confirmed it — {name} is good for their word.",
      "You backed it and you paid it forward. Stake honored.",
    ],
    // Stake forfeit. NEUTRAL — the stake was fire/cups/ego, never money; recoverable.
    stake_forfeit: [
      "Stake forfeit — no drama. {name} pays it and the slate's clean. Set the next one?",
      "This one went the other way. You staked, you settle, you move on. That's integrity too.",
      "Forfeit settled. No shame in it — honoring a lost stake is its own kind of showing up.",
    ],
    // Promoted a division / tier.
    league_promoted: [
      "🔥 {squad} moved up a division. Enough showing up, together, to climb.",
      "Promotion. {squad} earned the next tier the only way that counts — proof.",
      "Up you go, {squad}. New division, same fire.",
    ],
    // Relegated a division. NEUTRAL — one strong week climbs back.
    league_relegated: [
      "{squad} slipped a division — no story ends there. One strong week climbs right back.",
      "Dropped a tier. That's just the ladder breathing; {squad} has climbed before.",
      "Relegation's temporary. Rally the squad and the promotion's already in reach.",
    ],
    // Squad grinding together in real time.
    grind_together: [
      "{squad} is in the fire together right now. This is the part nobody does alone. 🔥",
      "Heads down, {squad}. Everyone grinding at once — that's the whole point.",
      "The squad's all here, all working. Feed the fire.",
    ],
  },

  // Empty states across the Zone (used by ZoneEmpty).
  empty: {
    feed: "Nothing here yet — declare a mission or post a proof and light the first fire.",
    friends: "Your circle starts with one exact @name. Ask your people what theirs is.",
    squad: "No squad yet. Forge one, or enter a code from someone who saved you a seat.",
    messages: "No conversations yet. Friends and squads unlock the fire-side chat.",
    inbox: "All quiet. When your people move, you'll see it here.",
    challenges: "No challenges running. Start one and bring your people into the fire.",
    gallery: "Every proof you post lives here forever — your documentary starts with one.",
  },
};

// Resolve today's witness context → { mood, line, sub } for <Witness/>.
export function witnessSay(state, tokens) {
  const seed = `${tokens.today}:${tokens.name || ""}`;
  const t = (lines) => fillTokens(pickLine(lines, seed), tokens);

  if (state === "first") return { mood: "spark", line: t(WITNESS.firstVisit) };
  if (state === "ash")
    return { mood: "ash", line: t(WITNESS.ashState), cta: WITNESS.riseButton[0] };
  if (state === "proved") {
    const s = tokens.streak || 1;
    const tier =
      s <= 1 ? "day1" : s < 7 ? "building" : s < 30 ? "strong" : "legendary";
    return { mood: "blaze", line: t(WITNESS.proofCelebration[tier]) };
  }
  if (state === "declared") return { mood: "lit", line: t(WITNESS.provePrompt) };
  if (state === "returning") return { mood: "warm", line: t(WITNESS.planPrompt) };
  // Squad Arena states — resolve against WITNESS.arena.<state>. Neutral moods
  // for misses/detonations/relegations so nothing renders as a shame wall.
  if (WITNESS.arena[state]) {
    const neutral = new Set([
      "vow_detonated", "chain_broken", "duel_lost",
      "dawn_missed", "stake_forfeit", "league_relegated",
    ]);
    const mood = neutral.has(state) ? "warm" : "blaze";
    return { mood, line: t(WITNESS.arena[state]) };
  }
  return { mood: "warm", line: t(WITNESS.declarePrompt) };
}
