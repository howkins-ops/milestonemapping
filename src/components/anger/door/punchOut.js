/* ════════════════════════════════════════════════════════════════════════
   PUNCH-OUT — the bout rules and the four bosses.

   Data + pure helpers only. DoorLevel owns the timers (it already has a
   schedule()/clearTimers() harness that works); Boxer.jsx owns the drawing.

   THE LOOP, straight from Super Punch-Out!!:

     idle → TELL → strike → recover → idle
                ↑                  ↑
         dodge window        counter window

   · Every attack has a UNIQUE, READABLE tell plus its own audio cue. You are
     meant to learn the tells, not react to the strike.
   · Tell length compresses as the boss loses HP — the pressure rubber-bands
     up, which is what makes the last 20% of a bout feel like a fight.
   · A perfect dodge (inside PERFECT_MS of the strike) buys slow-motion and a
     STAR. Stars buy the haymaker. That economy IS the game.
   · Whiffing leaves the boss open for RECOVER_MS — countering there is 3×.
   ════════════════════════════════════════════════════════════════════════ */

/* ── global rules ─────────────────────────────────────────────────────── */
export const RULES = {
  DODGE_LEAD_MS: 180,     // dodge window opens this long before the strike
  DODGE_GRACE_MS: 60,     // ...and stays open this long after it starts
  PERFECT_MS: 90,         // inside this = perfect dodge → slow-mo + a star
  COUNTER_MS: 400,        // post-whiff window where your punch is a counter
  COUNTER_MULT: 3,        // counter damage multiplier
  BLOCK_REDUCTION: 0.7,   // block eats this fraction of the damage
  PUNCH_COOLDOWN_MS: 200,
  STUN_THRESHOLD: 26,     // damage inside one open window that staggers him
  STUN_MS: 1500,
  MAX_STARS: 3,
  STAR_DAMAGE: 25,
  KNOCKDOWNS_TO_TKO: 3,
  COUNT_TO: 10,
  COUNT_TICK_MS: 800,     // one referee number per this
  RISE_MASHES: 8,         // taps needed to beat the count
  COMEBACK_MULT: 1.3,     // rising on 9 buys you this, briefly
  COMEBACK_MS: 8000,
  SLOWMO_SCALE: 0.35,
  SLOWMO_MS: 300,
};

/* Tell length shrinks as he takes damage. This single curve is most of the
   difficulty ramp — at full HP you have half a second to read him, at death's
   door you have a fifth of one. */
export function tellDuration(base, hpPct) {
  const floor = 220;
  return Math.max(floor, Math.round(base - (1 - hpPct) * (base - floor)));
}

/* Did this input land in the dodge window for a strike arriving at `strikeAt`? */
export function dodgeVerdict(now, strikeAt, moved, needed) {
  if (moved !== needed) return "wrong";
  const delta = strikeAt - now;
  if (delta > RULES.DODGE_LEAD_MS) return "early";
  if (delta < -RULES.DODGE_GRACE_MS) return "late";
  return Math.abs(delta) <= RULES.PERFECT_MS ? "perfect" : "clean";
}

/* ── the roster ───────────────────────────────────────────────────────────
   `dodge` is what beats the attack: "duck" | "left" | "right".
   `weak` names the body part that takes bonus damage during that tell.     */
export const BOSSES = {
  /* ── L1 — the tutorial. Slow, huge, forgiving. ──────────────────────── */
  homeowner: {
    id: "homeowner",
    name: "THE FIRST DOOR",
    subtitle: "he just wanted his evening",
    hp: 100,
    look: { skin: "#e0ae90", cloth: "#7c2b3e", trim: "#c8a24a", hair: "#5a4636", build: "soft" },
    prop: "newspaper",
    intro: "He answered in a robe. He is not happy about it.",
    coach: "Watch the newspaper. When it goes up, duck.",
    attacks: [
      { id: "paper", label: "PAPER SWAT", tell: "raise", tellMs: 620, strikeMs: 240, recoverMs: 460, dmg: 12, dodge: "duck", cue: "low", weak: "belly" },
      { id: "shove", label: "DOOR SHOVE", tell: "lean", tellMs: 560, strikeMs: 220, recoverMs: 420, dmg: 10, dodge: "left", cue: "mid" },
    ],
    // every 3rd swing he over-commits and shows his belly
    gimmick: { kind: "overcommit", every: 3, openMs: 900, note: "HE'S WIDE OPEN — BODY SHOT" },
    fakeChance: 0.12,
  },

  /* ── L2 — huge lunges, no footwork, pants around his ankles. ─────────── */
  marcus: {
    id: "marcus",
    name: "MARCUS",
    subtitle: "THE THRONE — interrupted",
    hp: 115,
    look: { skin: "#8a5a3c", cloth: "#2f3b57", trim: "#d8dde6", hair: "#1c1712", build: "heavy" },
    prop: "plunger",
    intro: "He came to the door mid-business. He brought the plunger.",
    coach: "He can't move his feet. Duck the lunge, hit him while he hitches his pants.",
    attacks: [
      { id: "plunge", label: "PLUNGER LUNGE", tell: "wind", tellMs: 560, strikeMs: 260, recoverMs: 520, dmg: 17, dodge: "right", cue: "wet", weak: "arm" },
      { id: "paperjab", label: "PAPER JAB", tell: "flick", tellMs: 420, strikeMs: 180, recoverMs: 340, dmg: 9, dodge: "left", cue: "mid" },
      { id: "sitdown", label: "THE SIT-DOWN", tell: "squat", tellMs: 700, strikeMs: 300, recoverMs: 600, dmg: 21, dodge: "duck", cue: "low", weak: "head" },
    ],
    // he keeps having to hitch his pants — a free window, on a timer
    gimmick: { kind: "hitch", everyMs: 7600, openMs: 1200, note: "PANTS! HIT HIM NOW" },
    fakeChance: 0.18,
  },

  /* ── L3 — fast, technical, bows before every combo. ─────────────────── */
  harold: {
    id: "harold",
    name: "HAROLD",
    subtitle: "karate, 1987",
    hp: 130,
    look: { skin: "#d9a582", cloth: "#eae4d6", trim: "#1b1b1b", hair: "#3a3128", build: "lean" },
    prop: "gi",
    intro: "He did karate in 1987. He has not stopped mentioning it.",
    coach: "He BOWS before every combo. The bow is your cue — and the back of his knee is open on the spin.",
    attacks: [
      { id: "chop", label: "KARATE CHOP", tell: "chop", tellMs: 460, strikeMs: 190, recoverMs: 330, dmg: 13, dodge: "left", cue: "sharp" },
      { id: "frontkick", label: "FRONT KICK", tell: "knee", tellMs: 500, strikeMs: 220, recoverMs: 400, dmg: 16, dodge: "duck", cue: "mid" },
      { id: "spin", label: "SPINNING BACK KICK", tell: "coil", tellMs: 720, strikeMs: 320, recoverMs: 640, dmg: 26, dodge: "right", cue: "heavy", weak: "knee" },
    ],
    // the bow telegraphs a 3-hit combo. Read it and you eat none of it.
    gimmick: { kind: "bow", beforeCombo: true, comboLen: 3, note: "HE BOWED — COMBO INCOMING" },
    fakeChance: 0.28,                             // the fake-out the old brawl had, now readable
  },

  /* ── L4 — the final. No guard, all offence, and a rage phase. ───────── */
  buddy: {
    id: "buddy",
    name: "BUDDY",
    subtitle: "3 AM — the reckoning",
    hp: 150,
    look: { skin: "#c98f6e", cloth: "#d8d2c6", trim: "#8b1a2b", hair: "#241c16", build: "rangy" },
    prop: "none",
    intro: "No door left. No sleep left. No patience left.",
    coach: "He throws in threes and he does not block. Under 40% he stops telegraphing — save a star for it.",
    attacks: [
      { id: "hook", label: "HOOK", tell: "cock", tellMs: 440, strikeMs: 180, recoverMs: 300, dmg: 14, dodge: "left", cue: "sharp" },
      { id: "cross", label: "OVERHAND", tell: "rear", tellMs: 480, strikeMs: 200, recoverMs: 340, dmg: 18, dodge: "right", cue: "mid", weak: "ribs" },
      { id: "headbutt", label: "HEADBUTT", tell: "tuck", tellMs: 560, strikeMs: 240, recoverMs: 520, dmg: 22, dodge: "duck", cue: "heavy", weak: "head" },
      { id: "doorthrow", label: "HE THREW THE DOOR", tell: "hoist", tellMs: 820, strikeMs: 360, recoverMs: 760, dmg: 30, dodge: "duck", cue: "huge", rageOnly: true },
    ],
    combo: [2, 3, 4, 5],                          // he strings this many together
    gimmick: { kind: "rage", atPct: 0.4, tellMs: 200, note: "HE'S GONE. NO MORE TELLS." },
    fakeChance: 0.22,
  },
};

/* ── the gate guard — a short mini-bout, not a level boss ─────────────────
   You only meet him if the flashlight catches you three times on the fence.
   Low HP, two moves, one very readable tell. Beat him and the barrier lifts. */
BOSSES.guard = {
  id: "guard",
  name: "SECURITY",
  subtitle: "unit 7 is not expecting anyone",
  hp: 62,
  look: { skin: "#b9805e", cloth: "#1e2733", trim: "#c8a24a", hair: "#221c16", build: "lean" },
  prop: "none",
  intro: "He got out of the cart. That's never good.",
  coach: "He swings the flashlight wide — duck it, then punish.",
  attacks: [
    { id: "torch", label: "FLASHLIGHT SWING", tell: "raise", tellMs: 560, strikeMs: 240, recoverMs: 500, dmg: 13, dodge: "duck", cue: "mid", weak: "arm" },
    { id: "taser", label: "TASER JAB", tell: "flick", tellMs: 460, strikeMs: 180, recoverMs: 360, dmg: 16, dodge: "right", cue: "sharp" },
  ],
  gimmick: { kind: "none" },
  fakeChance: 0.14,
};

export function getBoss(id) {
  return BOSSES[id] || BOSSES.homeowner;
}

/* Pick the next attack. Rage-only moves stay locked until he's raging, and we
   avoid repeating the same attack twice so the bout keeps teaching. */
export function nextAttack(boss, { raging = false, last = null } = {}) {
  const pool = boss.attacks.filter((a) => (a.rageOnly ? raging : true) && a.id !== last);
  const usable = pool.length ? pool : boss.attacks;
  return usable[(Math.random() * usable.length) | 0];
}

/* How many punches he strings together this time. */
export function comboLength(boss, raging) {
  if (!boss.combo) return 1;
  const n = boss.combo[(Math.random() * boss.combo.length) | 0];
  return raging ? n : Math.max(1, n - 1);
}

/* Damage for a landed player punch, given the boss's current state. */
export function punchDamage(state, { weakHit = false, comeback = 1 } = {}) {
  let base;
  if (state === "open" || state === "stun") base = 9 + Math.round(Math.random() * 4);
  else if (state === "tell" || state === "strike") base = 2;   // clipping him mid-swing
  else base = 1;                                                // he blocked it
  if (weakHit) base = Math.round(base * 1.6);
  return Math.max(1, Math.round(base * comeback));
}

/* Does he beat the count? Barely-alive bosses stay down. */
export function willRise(hpPct, knockdowns) {
  if (knockdowns >= RULES.KNOCKDOWNS_TO_TKO) return false;
  return Math.random() < 0.25 + hpPct * 0.6;
}

/* The referee's count, as displayed. */
export function countLabel(n) {
  return ["", "ONE", "TWO", "THREE", "FOUR", "FIVE", "SIX", "SEVEN", "EIGHT", "NINE", "TEN"][n] || String(n);
}

export default BOSSES;
