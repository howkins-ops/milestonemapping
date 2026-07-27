/* ════════════════════════════════════════════════════════════════════════
   SUPER KNOCK — THE OBJECTIONS. Five families, forty-two objections, thirty
   rebuttals. Data only.

   ── WHY FAMILIES AND NOT A LIST ──────────────────────────────────────────
   You pick THREE of the five cards and they lock the moment you knock. If a
   family lands that you didn't bring a card for, your only move is to EAT IT
   — reduced damage, no counter, no death spiral. That is what makes reading
   the yard before you knock a decision with teeth: a minivan and a hoop mean
   DEFERRAL is coming, a contractor van means EGO, a dog bowl means HOSTILE.

   Five families, three slots. You are always wrong about two of them, and
   which two is the whole pre-knock game.

   ── THE NAMING LAW ───────────────────────────────────────────────────────
   Every card name is a THREE-WORD INSTRUCTION. Not a label, not a diagnosis,
   and never a grade on the person. "BREAK THE PATTERN" tells you what to do
   with your mouth on a real porch; "Pattern Interruption" tells you nothing
   and sounds like a textbook. Jon killed a set of clever names on The
   Crucible for exactly this reason — if the words on the card aren't a
   sentence you could actually use, they are decoration.

   ── THE TELL LAW ─────────────────────────────────────────────────────────
   Every family has a distinct windup POSE (from door/Boxer.jsx's POSES) and a
   distinct audio cue. The patterns must be learnable WITH THE SOUND OFF, so
   the pose is the primary channel and the cue is reinforcement.

   And the tell floor is 440ms, not the stock 220ms. When the correct answer
   is a CARD YOU MUST READ rather than a direction you can flinch, 220ms is
   fatal — The Door's Officer Steele already carries a 420ms floor in
   production for precisely this, and there is no reason to rediscover it.
   ════════════════════════════════════════════════════════════════════════ */

/** The five rebuttal cards. Names are three-word instructions. Always. */
export const CARDS = {
  reflex: {
    key: "reflex",
    name: "BREAK THE PATTERN",
    hint: "Say something a salesman wouldn't.",
    teach: "\"Not interested\" is a reflex, not an answer. Interrupt the script and you get a real one.",
    accent: "#00F0FF",
  },
  deferral: {
    key: "deferral",
    name: "GET THEM BOTH",
    hint: "Don't sell to a messenger.",
    teach: "One person at the door cannot say yes. Get the decision-makers in the same doorway or come back when they are.",
    accent: "#FF3EDB",
  },
  incumbent: {
    key: "incumbent",
    name: "ASK WHO ELSE",
    hint: "Find the gap in the guy they already have.",
    teach: "\"We have a guy\" is information, not a no. Who is he, and what does he not do?",
    accent: "#00FFBF",
  },
  ego: {
    key: "ego",
    name: "AGREE THEN TURN",
    hint: "Concede the point, keep the frame.",
    teach: "Never argue with a man about his own competence. Agree completely, then move the conversation one inch sideways.",
    accent: "#FFB000",
  },
  hostile: {
    key: "hostile",
    name: "BOOK IT LATER",
    hint: "Take the exit, keep the appointment.",
    teach: "Anger is a bad time, not a bad lead. Apologise once, name a time, and walk before you're pushed.",
    accent: "#FF3B5C",
  },
};

export const FAMILY_KEYS = Object.keys(CARDS);

/** How each family winds up. Pose names must exist in door/Boxer.jsx POSES. */
export const TELLS = {
  reflex: { pose: "flick", cue: "sharp", tellMs: 720, strikeMs: 210, recoverMs: 340, dmg: 8, label: "THE BRUSH-OFF" },
  deferral: { pose: "lean", cue: "mid", tellMs: 880, strikeMs: 240, recoverMs: 380, dmg: 7, label: "THE PUNT" },
  incumbent: { pose: "wind", cue: "low", tellMs: 940, strikeMs: 260, recoverMs: 400, dmg: 9, label: "THE INCUMBENT" },
  ego: { pose: "hoist", cue: "heavy", tellMs: 860, strikeMs: 250, recoverMs: 420, dmg: 10, label: "THE EXPERT" },
  hostile: { pose: "chop", cue: "huge", tellMs: 780, strikeMs: 220, recoverMs: 300, dmg: 12, label: "THE DOOR SLAM" },
};

/* ── the objections ───────────────────────────────────────────────────────
   Eight or nine per family. These are the lines a real doorstep throws, kept
   short because they land in a 700ms tell and have to be readable at a
   glance. No profanity in this layer — the heat in this game lives in the
   throwing, not in the dialogue. */
export const OBJECTIONS = {
  reflex: [
    "Not interested.",
    "We're all set, thanks.",
    "Now's not a good time.",
    "No thank you.",
    "We don't do door-to-door.",
    "I was just heading out.",
    "Whatever it is, no.",
    "Nope. Sorry.",
    "I don't answer for solicitors.",
  ],
  deferral: [
    "I'd have to ask my wife.",
    "My husband handles all that.",
    "Let me talk it over with her.",
    "It's not my call, honestly.",
    "Can you leave something and we'll discuss it?",
    "She's not home right now.",
    "We decide things together.",
    "I'd need to run it past the family.",
  ],
  incumbent: [
    "We already have a guy.",
    "We're under contract.",
    "Someone does that for us.",
    "We've used the same company for years.",
    "Our neighbour's cousin does it.",
    "We just had it done.",
    "We're happy with who we've got.",
    "Already covered, thanks.",
  ],
  ego: [
    "I do that myself.",
    "I used to be in the trade.",
    "I know exactly what that costs.",
    "I've been doing this thirty years.",
    "You're not telling me anything new.",
    "I built this house.",
    "I don't need it explained to me.",
    "I can handle my own place.",
  ],
  hostile: [
    "Get off my property.",
    "Can you read the sign?",
    "I've told your lot before.",
    "You're on private land.",
    "I'm calling somebody.",
    "Don't come back here.",
    "You people are unbelievable.",
    "I'm shutting this door.",
  ],
};

/* ── the rebuttals ────────────────────────────────────────────────────────
   Six per family. Rotated so a long fight never repeats itself, which
   matters more than it sounds: a repeated line is the moment the player stops
   reading the words and starts pattern-matching colours. */
export const REBUTTALS = {
  reflex: [
    "Fair enough — I'm not here to sell you anything today.",
    "Totally. Can I ask you one thing and then go?",
    "You're the fourth person to say that, and the other three were right.",
    "Good. I'd rather talk to someone who says no fast.",
    "I'll take thirty seconds and then leave you alone.",
    "Understood. One question and I'm gone.",
  ],
  deferral: [
    "Perfect — is she about? I'd rather say it once, to both of you.",
    "That's the right answer. When are you both around?",
    "I'd be wasting your time making you repeat me. Let's get her out here.",
    "Then let's not decide anything. Let's just book five minutes.",
    "Smart. What evening works for the two of you?",
    "I'll come back when you're both in. What day?",
  ],
  incumbent: [
    "Good. Who is it? I probably know them.",
    "Nice — what do they not cover?",
    "Then I'll be quick: what would they have to get wrong for you to look?",
    "Happy to hear it. When's the contract up?",
    "That's better than most of this street. What's the one thing they miss?",
    "Then you already know what this costs. Is theirs cheaper?",
  ],
  ego: [
    "Then you'll spot in ten seconds whether this is worth anything.",
    "You'd know better than me. Tell me if I've got it wrong.",
    "Thirty years — then you've seen this go badly. What happened?",
    "I'd rather explain it to you than to someone who nods.",
    "Completely agree. So I'll skip the pitch and show you the number.",
    "You're right, and that's exactly why I knocked here.",
  ],
  hostile: [
    "My mistake — I'll go. Is Thursday better?",
    "Understood, I'm off your step. One card, and I'll leave.",
    "That's fair. I won't knock again — what number should I use?",
    "Sorry, genuinely. Leaving now.",
    "Right you are. Thursday evening, and I'll call first.",
    "Apologies. I'll take the sign seriously from here.",
  ],
};

/* ── selection ────────────────────────────────────────────────────────────*/

/** Deterministic pick, so a fight can be replayed exactly from a seed. */
export function objectionFor(family, n = 0) {
  const list = OBJECTIONS[family] || OBJECTIONS.reflex;
  return list[Math.abs(n) % list.length];
}
export function rebuttalFor(family, n = 0) {
  const list = REBUTTALS[family] || REBUTTALS.reflex;
  return list[Math.abs(n) % list.length];
}

/**
 * The attack list for one homeowner, weighted by what's in their yard.
 * The heavier a family, the more often it shows up — so the props ARE the
 * difficulty read, not a cosmetic hint next to one.
 */
export function attacksFor(house, count = 9) {
  const order = house.families || FAMILY_KEYS;
  const weights = house.weights || {};
  const bag = [];
  order.forEach((f) => {
    const n = Math.max(1, Math.round((weights[f] || 1) / 1.5));
    for (let i = 0; i < n; i++) bag.push(f);
  });
  const out = [];
  for (let i = 0; i < count; i++) {
    const f = bag[(i * 7 + house.seedOffset) % bag.length];
    out.push({
      id: `${f}-${i}`,
      family: f,
      dodge: f, // dodgeVerdict only string-compares, so a family key IS a "direction"
      text: objectionFor(f, i + house.seedOffset),
      ...TELLS[f],
    });
  }
  return out;
}

/** What the yard is telling you, in words, before you knock. */
export function tellsFor(house, PROPS) {
  return (house.props || []).map((p) => ({
    prop: p,
    label: PROPS[p] ? PROPS[p].label : p,
    family: PROPS[p] ? PROPS[p].family : "reflex",
    card: CARDS[PROPS[p] ? PROPS[p].family : "reflex"],
  }));
}

export default { CARDS, OBJECTIONS, REBUTTALS, TELLS, attacksFor };
