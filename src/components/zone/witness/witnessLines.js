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
  return { mood: "warm", line: t(WITNESS.declarePrompt) };
}
