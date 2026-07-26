/* ════════════════════════════════════════════════════════════════════════
   HEAT · THE CHASE · THE SEGWAY — one file, every dial.

   Jon's design doc flags Heat as "the balance dial for the whole game": too
   soft and players just shoot every house and never learn to sell; too harsh
   and nobody touches the fun mechanic. So it lives in one file, as numbers,
   and nothing else in the feature is allowed to hardcode a threshold.
   ════════════════════════════════════════════════════════════════════════ */

export const HEAT = {
  max: 8,

  /* The four states of the street. `doorOpenBias: -1` at HUNTED IS the design
     doc's "no door opens for you" — expressed as a dial rather than an if. */
  tiers: [
    { at: 0, key: "clean", label: "CLEAN", stars: 0, doorOpenBias: 0.15, greet: "wave" },
    { at: 2, key: "noticed", label: "NOTICED", stars: 1, doorOpenBias: 0.00, greet: "peek" },
    { at: 4, key: "wanted", label: "WANTED", stars: 2, doorOpenBias: -0.20, greet: "curtain" },
    { at: 6, key: "hunted", label: "HUNTED", stars: 3, doorOpenBias: -1.00, greet: "none" },
  ],

  gain: {
    rockThrown: 0.6, windowBroken: 1.2, doorDamaged: 0.8, chainsaw: 2.0,
    eggFired: 0.15, spottedByCam: 0.4, spottedByNeighbor: 0.7,
    caughtInChase: 1.5,        // getting caught RAISES heat. The spiral is the point.
  },

  cool: {
    cleanClose: 1.0,           // closed a sale and broke nothing
    perfectDay: 2.0,           // a whole local day with zero vandalism
    ditchPolo: 1.5,            // once per day
    evadedChase: 1.0,
    switchHoodMul: 0.5,        // a MULTIPLIER — you don't get clean by moving
  },

  /* Passive cooling is anchor-derived, never decremented — same law as every
     other clock in this codebase. Reads stay pure; writes re-anchor. */
  coolPeriodMs: 6 * 3600_000,
  coolPerPeriod: 0.5,

  chaseAtTier: "wanted",
  chaseChance: { wanted: 0.45, hunted: 0.85 },
  chaseCooldownMs: 4 * 60_000,
};

export function heatTier(heat) {
  let t = HEAT.tiers[0];
  for (const x of HEAT.tiers) if (heat >= x.at) t = x;
  return t;
}

/* ════════════════════════════════════════════════════════════════════════
   THE CHASE — GTA V's model, not GTA IV's.

   Solid stars = SPOTTED. Flashing = SEARCHING, and the FLASH RATE is the
   progress bar (slower flash = closer to free) — that's the whole UI, no
   timer number. Re-spotted resets the clock to FULL, not partially.

   Per-unit FOV is lifted verbatim from V's rule: officers on foot have a
   narrow cone, ground vehicles moderate, aircraft widest.

   Capped at 4 stars on purpose. V's own 5-star is the frustration case,
   because the counterplay vocabulary stops growing while the threat count
   keeps going — escalate the number of things you must RESPECT, not the
   number of things that shoot you.
   ════════════════════════════════════════════════════════════════════════ */
export const CHASE = {
  maxStars: 4,
  startStarsByTier: { wanted: 1, hunted: 2 },

  tiers: [
    { star: 1, foot: 1, cruiser: 0, drone: 0, closeSpeed: 210 },
    { star: 2, foot: 2, cruiser: 1, drone: 0, closeSpeed: 250 },
    { star: 3, foot: 2, cruiser: 2, drone: 0, closeSpeed: 290 },
    { star: 4, foot: 3, cruiser: 2, drone: 1, closeSpeed: 320 },
  ],

  coneDeg: { foot: 16, cruiser: 30, drone: 52 },      // half-angles
  coneRange: { foot: 240, cruiser: 380, drone: 620 },

  /* GTA's own ladder is 30/45/60/75s. Halved: this street is ~2.5k px of
     one-dimensional world and a phone rage-comedy session is 60-90 seconds.
     A deliberate deviation, not an oversight. */
  evadeMs: { 1: 12_000, 2: 18_000, 3: 26_000, 4: 34_000 },

  spotDwellMs: 260,          // sit in a cone this long to be SPOTTED
  lostSightGraceMs: 900,     // break LOS, then stars start flashing
  flashHz: [1.6, 0.9],       // at t=0 → at t=evadeMs. Slower = nearly free.
  reSpotResetsTimer: true,   // the single most important line in this system

  searchShrinkPxPerS: 0.55,  // cone REACH shrinks toward last-seen…
  lastSeenDriftPx: 40,       // …and their guess wanders, so hiding 1px away isn't safe

  ditchPolo: { stars: -1, oncePerChase: true, requiresHidden: true, holdMs: 700 },

  caughtAfterSpottedMs: { 1: 6000, 2: 5000, 3: 4000, 4: 3000 },
  fineByStar: { 1: 40, 2: 120, 3: 300, 4: 750 },

  maxChaseMs: 75_000,        // hard cap; longer is a chore on a phone
};

/* ════════════════════════════════════════════════════════════════════════
   THE SEGWAY — deliberately terrible, and the numbers say why.

   THE LOAD-BEARING NUMBER: maxSpeed 430 > cruiser closeSpeed 320.
   A cruiser can NEVER catch you in a straight line. You can only lose by
   being SPOTTED, never by being outrun. That converts the chase from a
   reflex test into a hiding-and-routing puzzle — the only kind that works
   with three buttons on a phone.

   The pressure comes entirely from decel (you overshoot every hide spot) and
   brake (you can't turn around). The comedy model is Octodad, not Crazy Taxi:
   tight intent layer, chaotic body layer, and invisible assist so awkwardness
   never becomes failure.
   ════════════════════════════════════════════════════════════════════════ */
export const SEGWAY = {
  maxSpeed: 430,
  accel: 620,             // ~0.7s to top speed. Sluggish on purpose.
  brake: 300,             // reverse while rolling = coast through zero over ~1.4s
  decel: 210,             // release and you roll a LONG way. You WILL overshoot.
  reverseSpeedMul: 0.55,
  leanMaxDeg: 17,
  wobbleHz: 2.4,
  tipOverAt: 0.94,        // slam reverse at top speed and it goes out from under you
  tipStunMs: 1200,
};

/* Hiding. `magnetPxPerS` is the Octodad helper-volume trick and is NOT
   optional on a phone: the wobble is the comedy, the SUCCESS is assisted. */
export const HIDES = {
  magnetPxPerS: 140,
  magnetRangePx: 90,
  kinds: {
    hedge: { coverMs: Infinity, exitMs: 0, partial: false, label: "HEDGE" },
    garage: { coverMs: 8000, exitMs: 0, partial: false, label: "OPEN GARAGE" },
    // partial cover breaks ground LOS but NOT the drone's — GTA's bush-vs-
    // helicopter rule, earned rather than asserted
    mailbox: { coverMs: Infinity, exitMs: 0, partial: true, label: "COMMUNITY MAILBOX" },
    potty: { coverMs: Infinity, exitMs: 900, partial: false, label: "PORTA-POTTY" },
  },
};
