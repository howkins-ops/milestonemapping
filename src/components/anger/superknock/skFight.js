/* ════════════════════════════════════════════════════════════════════════
   SUPER KNOCK — PHASE 3, THE FIGHT. Pure sim, driven by the caller's clock.

   `punchOut.js` is data and pure helpers; the actual tell → strike → recover
   → counter RUNNER lives un-extracted inside DoorLevel.jsx and is welded to
   its own setTimeout scheduler. So this is a rewrite, not a wrapper — but it
   imports the RULES and the two decision functions that were already proven
   in production, because re-deriving `dodgeVerdict`'s early/late/perfect
   thresholds from scratch would be vandalism.

   ── COMPOSURE IS THE HEALTH BAR, AND THERE IS NO HEALTH BAR ──────────────
   The player has exactly one meter and it is never drawn as a meter. It
   drains from hits, from wrong cards, from mashing, and from his sheer
   volume; and because it also scales YOUR damage, losing it is a slide, not
   a cliff. It is shown in the player's posture and in a PALETTE SWAP on the
   whole scene (see skHomeowners.COMPOSURE_PALETTE) — never a filter, because
   the boxer's idle bob is an infinite animation and a filter on an ancestor
   re-rasterises it every frame.

   ── ITS OWN HP TABLE ─────────────────────────────────────────────────────
   Deliberately NOT `BOSSES[x].hp`. Those are 100, which at 9–13 damage per
   open window is a forty-second fight, and there are up to twenty of them in
   a week. 45 base lands at 25–30 seconds.

   ── THE DECK ─────────────────────────────────────────────────────────────
   Three cards from five families, LOCKED THE MOMENT YOU KNOCK. When a family
   lands that you didn't bring, EAT IT is always available: reduced damage, no
   counter, never fatal. There is no unwinnable hand — only expensive ones.
   ════════════════════════════════════════════════════════════════════════ */
import { RULES, tellDuration, dodgeVerdict } from "../door/punchOut.js";
import { FIGHT, LEAD } from "./skTuning.js";
import { CARDS, TELLS, attacksFor, rebuttalFor } from "./skObjections.js";
import { homeownerFor, composureTier } from "./skHomeowners.js";

export const PHASE = {
  intro: "intro", idle: "idle", tell: "tell", strike: "strike",
  recover: "recover", stagger: "stagger", close: "close",
  won: "won", lost: "lost",
};

export const RESULT = { sale: "sale", callback: "callback", hostile: "hostile", walkaway: "walkaway" };

/* ── creation ─────────────────────────────────────────────────────────────*/

export function createFight({ house, lead = "warm", deck = [], aggro = 1, seed = 1, grace = false }) {
  const owner = homeownerFor(house.idx);
  const L = LEAD[lead] || LEAD.warm;
  const maxHp = Math.max(
    FIGHT.hpFloor,
    Math.round(FIGHT.baseHp * L.hpMul * (owner.hpMul || 1) * (owner.temper > 1.2 ? 1.1 : 1))
  );

  return {
    house,
    owner,
    lead,
    maxHp,
    hp: maxHp,
    /* Their damage is scaled by the lead state AND by how you knocked. A
       hostile door hits twice as hard; a door you hammered on hits 20% harder
       for the whole fight, which is the point of the knock meter having a
       bad end rather than just a good one. */
    dmgMul: L.dmgMul * aggro,
    composure: 100,
    deck: deck.slice(0, FIGHT.deckSize),
    attacks: attacksFor(house, 12),
    atkIdx: 0,
    atk: null,

    phase: PHASE.intro,
    phaseLeft: grace ? 2.0 : 1.0,
    /* A HOT lead opens with his guard down and two seconds of no-attack
       grace. That is the reward for a hook, and it has to be felt, not read
       off a stat screen. */
    grace,

    strikeAt: 0, // ms from fight start; dodgeVerdict compares against this
    t: 0,

    streak: 0,
    closeReady: false,
    stars: 0,
    counters: 0,
    whiffs: 0,
    eaten: 0,
    seed,
    log: [],
    result: null,
    lastLine: null,
    lastCard: null,
    flash: 0,
    pose: "guard",
  };
}

/* ── helpers ──────────────────────────────────────────────────────────────*/

const hpPct = (f) => f.hp / f.maxHp;
const say = (f, who, text, kind) => {
  f.lastLine = { who, text, kind, id: f.t };
  f.log.push(f.lastLine);
  if (f.log.length > 24) f.log.shift();
};

/** Composure scales your damage. Rattled is not dead — it is expensive. */
export function playerPower(f) {
  return 0.55 + (f.composure / 100) * 0.45;
}

export const tierOf = (f) => composureTier(f.composure);

function drainComposure(f, n) {
  f.composure = Math.max(0, f.composure - n);
  if (f.composure <= 0) end(f, RESULT.walkaway);
}

function damageBoss(f, n) {
  f.hp = Math.max(0, f.hp - n);
  f.flash = 0.18;
  if (f.hp <= 0) end(f, RESULT.sale);
}

function end(f, result) {
  if (f.result) return;
  f.result = result;
  f.phase = result === RESULT.sale ? PHASE.won : PHASE.lost;
  f.phaseLeft = 1.6;
  f.pose = result === RESULT.sale ? "ko" : "guard";
  f.closeReady = false;
}

/* ── the attack cycle ─────────────────────────────────────────────────────*/

function nextAttack(f) {
  const a = f.attacks[f.atkIdx % f.attacks.length];
  f.atkIdx += 1;
  f.atk = a;

  /* The tell shrinks as he loses ground — most of the difficulty ramp lives
     in this one curve. The FLOOR is 440ms, not the stock 220ms: when the
     answer is a card you have to READ rather than a direction you can flinch,
     220ms is not a reaction test, it is a guess. */
  const tellMs = tellDuration(a.tellMs, hpPct(f), FIGHT.tellFloorMs);
  f.phase = PHASE.tell;
  f.phaseLeft = tellMs / 1000;
  f.strikeAt = f.t * 1000 + tellMs;
  f.pose = a.pose;
  say(f, "them", a.text, a.family);
}

/**
 * @param f   fight state
 * @param dt  seconds
 */
export function stepFight(f, dt) {
  if (f.result && f.phaseLeft <= 0) return f;
  f.t += dt;
  f.flash = Math.max(0, f.flash - dt * 3);
  f.phaseLeft -= dt;

  /* His sheer volume wears you down even when he misses. It is small, and it
     is why standing there doing nothing is never a strategy. */
  if (f.phase === PHASE.tell || f.phase === PHASE.strike) {
    drainComposure(f, FIGHT.composureDrain.volume * dt);
  }
  if (f.phaseLeft > 0) return f;

  switch (f.phase) {
    case PHASE.intro:
      f.phase = PHASE.idle;
      f.phaseLeft = 0.35;
      f.pose = f.grace ? "open" : "guard";
      break;

    case PHASE.idle:
      nextAttack(f);
      break;

    case PHASE.tell:
      /* The window closed with no card played. This is the "NO INPUT" branch:
         full damage, streak broken. */
      f.phase = PHASE.strike;
      f.phaseLeft = f.atk.strikeMs / 1000;
      f.pose = "strike";
      drainComposure(f, f.atk.dmg * f.dmgMul);
      f.streak = 0;
      f.closeReady = false;
      say(f, "you", "…", "miss");
      break;

    case PHASE.strike:
      f.phase = PHASE.recover;
      f.phaseLeft = f.atk.recoverMs / 1000;
      f.pose = "guard";
      break;

    case PHASE.stagger:
    case PHASE.recover:
      f.phase = PHASE.idle;
      f.phaseLeft = 0.28;
      f.pose = "guard";
      break;

    case PHASE.close:
      /* THE CLOSE window lapsed unused. You keep the streak — a missed
         finisher should not also be a punishment. */
      f.phase = PHASE.idle;
      f.phaseLeft = 0.3;
      break;

    case PHASE.won:
    case PHASE.lost:
      f.phaseLeft = 0;
      break;

    default:
      break;
  }
  return f;
}

/* ── the player's inputs ──────────────────────────────────────────────────*/

/**
 * Play a rebuttal card. Returns the verdict so the scene can pick its juice.
 *
 * `dodgeVerdict` only ever string-compares `moved === needed`, which is why a
 * family key works as a "direction" with zero changes — the same trick that
 * put rebuttal cards into Officer Steele's bout in production.
 */
export function playCard(f, key) {
  if (f.result) return null;
  /* "You didn't bring that card" is checked BEFORE timing, deliberately: it
     is a fact about your hand, not about your reflexes, and telling a player
     they were early when the real answer is that they never held the card is
     how you teach them the wrong lesson. */
  if (!f.deck.includes(key)) return { verdict: "notheld" };
  if (f.phase !== PHASE.tell && f.phase !== PHASE.strike) return { verdict: "early" };

  const nowMs = f.t * 1000;
  const verdict = dodgeVerdict(nowMs, f.strikeAt, key, f.atk.family);
  f.lastCard = { key, verdict, id: f.t };

  if (verdict === "wrong") {
    /* Wrong card: you whiffed AND he lands clean. 1.5× — the price of
       guessing rather than reading the yard. */
    drainComposure(f, f.atk.dmg * f.dmgMul * 1.5 + FIGHT.composureDrain.wrongCard);
    f.whiffs += 1;
    f.streak = 0;
    f.closeReady = false;
    f.phase = PHASE.strike;
    f.phaseLeft = f.atk.strikeMs / 1000;
    f.pose = "strike";
    say(f, "you", rebuttalFor(key, f.whiffs), "whiff");
    return { verdict: "wrong" };
  }

  if (verdict === "early" || verdict === "late") {
    /* Right idea, wrong moment. Clipped, not clobbered. */
    drainComposure(f, f.atk.dmg * f.dmgMul * 0.5);
    f.streak = 0;
    f.closeReady = false;
    say(f, "you", rebuttalFor(key, f.counters), verdict);
    return { verdict };
  }

  /* CLEAN or PERFECT — the counter lands.

     6.5, and the number is load-bearing. At 11.3 a HOT lead (31hp) died on
     the third clean counter, which meant THE CLOSE — the signature move, the
     whole reward for a streak — literally never appeared on the easiest
     doors. At 6.5 the intended rhythm falls out on its own: three counters
     open his guard, the finisher shuts it. A hostile door needs two rounds
     of that, and a player who never manages three in a row can still grind
     the sale out on counters alone, so no hand is ever locked. */
  const perfect = verdict === "perfect";
  const base = 9 * RULES.COUNTER_MULT * 0.24; // ≈6.5
  const dmg = base * playerPower(f) * (perfect ? 1.35 : 1);
  damageBoss(f, dmg);
  f.counters += 1;
  f.streak += 1;
  if (perfect) f.stars = Math.min(RULES.MAX_STARS, f.stars + 1);
  say(f, "you", rebuttalFor(key, f.counters), perfect ? "perfect" : "clean");

  if (f.result) return { verdict, dmg, perfect, finished: true };

  if (f.streak >= FIGHT.closeStreak) {
    /* THE CLOSE. Three clean counters in a row and his guard drops. */
    f.closeReady = true;
    f.phase = PHASE.close;
    f.phaseLeft = FIGHT.closeMs / 1000;
    f.pose = "open";
    return { verdict, dmg, perfect, close: true };
  }

  f.phase = PHASE.stagger;
  f.phaseLeft = 0.42;
  f.pose = "hurt";
  return { verdict, dmg, perfect };
}

/** EAT IT — always available, always survivable. The answer to a family you
    didn't bring a card for, and the reason no hand is ever unwinnable. */
export function eatIt(f) {
  if (f.result) return null;
  if (f.phase !== PHASE.tell && f.phase !== PHASE.strike) return { verdict: "early" };
  drainComposure(f, f.atk.dmg * f.dmgMul * FIGHT.eatItReduction);
  f.eaten += 1;
  f.streak = 0;
  f.closeReady = false;
  f.phase = PHASE.strike;
  f.phaseLeft = f.atk.strikeMs / 1000;
  f.pose = "block";
  say(f, "you", "…let him finish.", "eat");
  return { verdict: "eat" };
}

/** Land the finisher. Only live during the CLOSE window. */
export function closeIt(f) {
  if (f.result || !f.closeReady || f.phase !== PHASE.close) return null;
  f.closeReady = false;
  const dmg = f.maxHp * 0.45 * playerPower(f) + 6;
  damageBoss(f, dmg);
  f.streak = 0;
  say(f, "you", "So — do you want it on the Tuesday or the Thursday?", "close");
  if (!f.result) {
    f.phase = PHASE.stagger;
    f.phaseLeft = 0.6;
    f.pose = "stun";
  }
  return { verdict: "close", dmg, finished: !!f.result };
}

/** Walk away. Always allowed, and on a bad door it is the correct play —
    the clock is the real opponent, not the man in the doorway. */
export function walkAway(f) {
  if (f.result) return f;
  /* You still learned something if you were winning. A door left at under a
     third of his bar books a callback rather than dying outright. */
  end(f, hpPct(f) < 0.34 ? RESULT.callback : RESULT.walkaway);
  return f;
}

/* ── mashing ──────────────────────────────────────────────────────────────
   Panic-tapping outside a window costs composure. Small, uncapped, and it is
   the only thing standing between this and a button-masher. */
export function mash(f) {
  if (f.result) return;
  drainComposure(f, FIGHT.composureDrain.mash);
}

/* ── resume ───────────────────────────────────────────────────────────────
   Five numbers. Losing a forty-second fight to a text message is how a game
   gets deleted, and the clock's own banks-and-pauses rule already commits us
   to protecting the player from their own phone. */
export const packFight = (f) => f && !f.result
  ? { houseIdx: f.house.idx, hp: Math.round(f.hp), composure: Math.round(f.composure), deck: f.deck, lead: f.lead, atkIdx: f.atkIdx, dmgMul: f.dmgMul }
  : null;

export function unpackFight(snap, house) {
  if (!snap || !house) return null;
  const f = createFight({ house, lead: snap.lead, deck: snap.deck, aggro: 1 });
  f.hp = Math.min(f.maxHp, snap.hp);
  f.composure = snap.composure;
  f.atkIdx = snap.atkIdx | 0;
  f.dmgMul = snap.dmgMul || f.dmgMul;
  /* Always resume at the TOP of a fresh tell. Restoring mid-strike would
     resume the player into damage they never saw coming. */
  f.phase = PHASE.intro;
  f.phaseLeft = 1.1;
  return f;
}

export { CARDS, TELLS };
export default { createFight, stepFight, playCard, eatIt, closeIt, walkAway, mash };
