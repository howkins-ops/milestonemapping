/* ════════════════════════════════════════════════════════════════════════
   SUPER KNOCK — PHASE 1, THE RIDE. The brain.

   Pure. One mutable sim object, no React, no DOM, no rAF of its own, and
   never `Date.now()` — the caller ticks it and passes `dt` in. Same shape as
   `chase/chaseSim.js`, for the same reason: it is far cheaper to prove that
   the HOA cart can be outrun with a loop and a console than with a phone.

   ── THE FOUR RULES THAT CANNOT BREAK ─────────────────────────────────────
   1. ONE PASS. `y` only ever increases. There is no turning around, so
      missing a house means missing it for the day. A free retry is what
      killed the 3D version in 1999.
   2. THE SEGWAY NEVER STOPS. Full brake reaches `minSpeed`, never zero.
      Constant motion is the entire game feel.
   3. THROWING NEVER BLOCKS STEERING. If a throw eats an input frame, the
      game is dead. `step()` reads both every tick, always.
   4. ACCURACY SETS DIFFICULTY. Everything this file produces is consumed by
      the knock run — `s.leads` IS phase 3's difficulty table.
   ════════════════════════════════════════════════════════════════════════ */
import {
  SEGWAY, CART, HANGER, BANDS, RIDE_X_MIN, RIDE_X_MAX, SURFACE, HAZARDS,
  CRASH, AIR, LIVES_PER_DAY, STREET_LENGTH_M, LANE_TOTAL_M, HEAT, GRUDGE_GAIN,
} from "./skTuning.js";
import { rng, houseAt } from "./skStreet.js";
import { launch, stepHanger, hangerAt, predictLanding } from "./skThrow.js";

/* ── the world's furniture, seeded ────────────────────────────────────────*/

function scatter(r, kind, cfg, lengthM, from = 90) {
  const out = [];
  let y = from + r() * cfg.everyM[0];
  while (y < lengthM - 40) {
    const spec = { kind, y, w: cfg.w, l: cfg.l, id: out.length, dead: false };
    if (cfg.lanes) {
      spec.x = cfg.lanes[Math.floor(r() * cfg.lanes.length) % cfg.lanes.length];
      spec.v = cfg.speed[0] + r() * (cfg.speed[1] - cfg.speed[0]);
    } else if (Array.isArray(cfg.atX)) {
      spec.x = cfg.atX[Math.floor(r() * cfg.atX.length) % cfg.atX.length];
      if (cfg.speed) spec.v = cfg.speed[0] + r() * (cfg.speed[1] - cfg.speed[0]);
    }
    spec.x += (r() - 0.5) * 0.6;
    out.push(spec);
    y += cfg.everyM[0] + r() * (cfg.everyM[1] - cfg.everyM[0]);
  }
  return out;
}

export function buildProps(street, seed, trafficMul = 1) {
  const r = rng(seed * 31337 + 7);
  const props = [
    ...scatter(r, "car", HAZARDS.car, street.lengthM),
    ...scatter(r, "parked", HAZARDS.parked, street.lengthM),
    ...scatter(r, "can", HAZARDS.can, street.lengthM),
    ...scatter(r, "walker", HAZARDS.walker, street.lengthM),
    ...scatter(r, "ramp", HAZARDS.ramp, street.lengthM),
    ...scatter(r, "bundle", HAZARDS.bundle, street.lengthM),
  ];
  /* Traffic density is the street-1/2/3 difficulty dial. Thinning by dropping
     cars (rather than by re-seeding) keeps the same street recognisable. */
  if (trafficMul < 1) {
    let n = 0;
    for (const p of props) if (p.kind === "car" && ++n % Math.max(2, Math.round(1 / trafficMul)) !== 0) p.dead = true;
  }
  return props.sort((a, b) => a.y - b.y);
}

/* ── surfaces ─────────────────────────────────────────────────────────────*/

export function bandAt(x) {
  for (const b of BANDS) if (x >= b.from && x < b.to) return b;
  return BANDS[BANDS.length - 1];
}

/** Surface multiplier at a lateral position, including dirt ramps. */
export function surfaceMul(x, onDirt) {
  if (onDirt) return SURFACE.dirt;
  const b = bandAt(x);
  return b.key === "road" ? SURFACE.street : b.key === "walk" ? SURFACE.walk : SURFACE.grass;
}

/* ── creation ─────────────────────────────────────────────────────────────*/

export function createRide({ street, seed = 1, day = 0, trafficMul = 1, lives = LIVES_PER_DAY, ammo = HANGER.ammo, speedMul = 1 } = {}) {
  return {
    street,
    seed,
    day,
    speedMul,

    /* rider */
    x: LANE_TOTAL_M / 2,
    y: 0,
    v: SEGWAY.cruise,
    vLat: 0,
    lean: 0,
    leanV: 0,
    airLeft: 0,
    invulnLeft: 0,
    recoverLeft: 0,

    /* economy */
    ammo,
    lives,
    score: 0,
    heat: 0,
    combo: 0,
    bestCombo: 0,
    throwCooldown: 0,

    /* results — this object IS phase 2's input */
    leads: {}, // houseIdx → "hot"|"warm"|"lukewarm"|"hostile"|"dead"
    grudge: {}, // houseIdx → points added this run
    ruts: [], // {houseIdx, y0, y1} — drawn tomorrow, remembered all week
    hits: [], // one row per throw, for the results screen

    /* world */
    props: buildProps(street, seed, trafficMul),
    hangers: [],
    events: [], // drained by the scene each frame for sfx/particles

    /* the HOA cart */
    idleLeft: CART.triggerHoldS,
    cart: null,

    finished: false,
    outcome: null,
    _rutOpen: null,
  };
}

/* ── helpers ──────────────────────────────────────────────────────────────*/

const overlap = (ax, aw, bx, bw) => Math.abs(ax - bx) < (aw + bw) / 2;
const emit = (s, type, data) => { s.events.push({ type, ...data }); };

function addLead(s, houseIdx, lead) {
  if (houseIdx == null || !lead) return;
  const prev = s.leads[houseIdx];
  /* A house's state can be IMPROVED by a second hanger but never quietly
     downgraded — you can rescue a bad throw, you cannot un-anger a man whose
     window you just put a door hanger through. */
  const rank = { dead: 0, lukewarm: 1, warm: 2, hot: 3 };
  if (lead === "hostile") { s.leads[houseIdx] = "hostile"; return; }
  if (prev === "hostile") return;
  if (prev == null || (rank[lead] ?? 0) > (rank[prev] ?? 0)) s.leads[houseIdx] = lead;
}

function addGrudge(s, houseIdx, n) {
  if (houseIdx == null) return;
  s.grudge[houseIdx] = (s.grudge[houseIdx] || 0) + n;
}

/* ── the throw ────────────────────────────────────────────────────────────*/

export function throwHanger(s, side) {
  if (s.throwCooldown > 0 || s.ammo <= 0 || s.finished || s.recoverLeft > 0) return null;
  s.ammo -= 1;
  s.throwCooldown = HANGER.cooldownS;

  /* A throw off a ramp launches from higher, which shifts the whole arc up a
     band — the one place in the game where the lane rule can be cheated, and
     it costs a committed run onto the grass to set up. Earned, not free. */
  const h = launch({
    street: s.street,
    x0: s.x,
    y0: s.y + (s.airLeft > 0 ? AIR.zBonus * 2 : 0),
    vF: s.v,
    side,
    spinSeed: (s.y * 0.37) % 1,
  });
  s.hangers.push(h);
  emit(s, "throw", { side, x: s.x, y: s.y, airborne: s.airLeft > 0 });
  return h;
}

function resolveLanding(s, h) {
  const o = h.outcome;
  const mult = 1 + Math.min(4, s.combo) * 0.1;
  const pts = Math.round(o.pts * mult);
  s.score += pts;

  if (o.pts > 0) { s.combo += 1; s.bestCombo = Math.max(s.bestCombo, s.combo); }
  else s.combo = 0;

  addLead(s, o.houseIdx, o.lead);

  if (o.key === "window") {
    const house = s.street.houses.find((hh) => hh.idx === o.houseIdx);
    const heat = house && house.noSolicit ? HEAT.gain.noSolicitWindow : HEAT.gain.window;
    s.heat += heat;
    addGrudge(s, o.houseIdx, GRUDGE_GAIN.window);
    emit(s, "smash", { x: o.x, y: o.y, z: o.z, houseIdx: o.houseIdx, chase: !!(house && house.noSolicit) });
  } else if (o.key === "hooked") {
    emit(s, "hook", { x: o.x, y: o.y, z: o.z, houseIdx: o.houseIdx });
  } else if (o.key === "nearmiss") {
    emit(s, "nearmiss", { x: o.x, y: o.y, z: o.z, houseIdx: o.houseIdx });
  } else if (o.key === "mailbox") {
    emit(s, "mailbox", { x: o.x, y: o.y, z: o.z, houseIdx: o.houseIdx });
  } else {
    emit(s, "land", { x: o.x, y: o.y, z: o.z, key: o.key, houseIdx: o.houseIdx });
  }

  s.hits.push({ key: o.key, pts, houseIdx: o.houseIdx, lead: o.lead, label: o.label, at: s.y });
  emit(s, "score", { pts, key: o.key, label: o.label, x: o.x, y: o.y, combo: s.combo });
}

/* ── tyre ruts ────────────────────────────────────────────────────────────
   Stored as SEGMENTS, never rasterised. A world-space decal buffer for an
   850m street would be ~84MB at DPR 2 and would be evicted mid-run on any
   mid-range Android; a screen-space one (which is all DoorFX has) would smear
   static marks across a scrolling street. Forty stroked segments a frame is
   free, scrolls correctly for nothing, and serialises into the save file in
   about a hundred bytes. */
function trackRuts(s) {
  const b = bandAt(s.x);
  const onGrass = b.key === "lawn" && s.airLeft <= 0;
  const house = onGrass ? houseAt(s.street, s.y, b.side, 8) : null;

  if (!house) { s._rutOpen = null; return; }

  /* ONE RECORD PER HOUSE, extended rather than re-opened. Two things depend
     on this. The save file carries these all week and has a ~400 byte budget,
     so a rider who weaves on and off a lawn cannot be allowed to mint a new
     record every time. And the grudge must be charged exactly once per house
     per run, or weaving across one lawn would out-anger vandalising twenty.

     A lawn ridden twice is just a more chewed-up lawn. */
  let rec = s._rutOpen && s._rutOpen.houseIdx === house.idx ? s._rutOpen : s.ruts.find((r) => r.houseIdx === house.idx);
  if (!rec) {
    rec = { houseIdx: house.idx, side: b.side, x: s.x, y0: s.y, y1: s.y };
    s.ruts.push(rec);
    /* Ride all twenty lawns on Monday and Tuesday, and Wednesday's NO
       SOLICITING signs are in your own handwriting. That is the whole reason
       the keystone day reads as a consequence instead of as a difficulty
       spike the game chose for you. */
    addGrudge(s, house.idx, GRUDGE_GAIN.tracks);
    emit(s, "ruts", { houseIdx: house.idx });
  }
  rec.y0 = Math.min(rec.y0, s.y);
  rec.y1 = Math.max(rec.y1, s.y);
  s._rutOpen = rec;
}

/* ── crashing ─────────────────────────────────────────────────────────────*/

function crash(s, what) {
  if (s.invulnLeft > 0 || s.recoverLeft > 0) return;
  s.lives -= 1;
  s.combo = 0;
  s.v = CRASH.speedAfter;
  s.vLat = 0;
  s.airLeft = 0;
  s.invulnLeft = CRASH.invulnS;
  s.recoverLeft = CRASH.recoverS;
  emit(s, "crash", { what, x: s.x, y: s.y, livesLeft: s.lives });
  if (s.lives <= 0) finish(s, "wiped");
}

function finish(s, outcome) {
  if (s.finished) return;
  s.finished = true;
  s.outcome = outcome;
  /* Everything still in the air is void. A run does not keep scoring after
     it is over — that is how you get a result screen that disagrees with
     what the player just watched. */
  s.hangers.length = 0;
  emit(s, "finish", { outcome, score: s.score });
}

/* ── the step ─────────────────────────────────────────────────────────────*/

/**
 * @param s      ride state
 * @param dt     seconds
 * @param input  { steer: -1..1, throttle: -1..1, throwL: bool, throwR: bool }
 */
export function stepRide(s, dt, input = {}) {
  if (s.finished) return s;
  const dtc = Math.min(dt, 1 / 20); // a backgrounded tab must not teleport the rider

  s.throwCooldown = Math.max(0, s.throwCooldown - dtc);
  s.invulnLeft = Math.max(0, s.invulnLeft - dtc);
  s.recoverLeft = Math.max(0, s.recoverLeft - dtc);
  s.airLeft = Math.max(0, s.airLeft - dtc);

  /* ── throttle ──────────────────────────────────────────────────────────
     RULE 2. The brake reaches minSpeed and stops there, always. */
  const throttle = s.recoverLeft > 0 ? 0.4 : (input.throttle || 0);
  const a = throttle >= 0 ? SEGWAY.accel * throttle : SEGWAY.brake * throttle;
  let vRaw = s.v + a * dtc;
  /* CLAMP THEN MULTIPLY. The other order floats the grass penalty away at
     exactly the speed a grass-camper rides at, which would make ×0.70 pure
     decoration. See SEGWAY.applyOrder. */
  vRaw = Math.max(SEGWAY.minSpeed, Math.min(SEGWAY.maxSpeed, vRaw));
  s.v = vRaw;
  const onRamp = s.airLeft > 0;
  const eff = s.v * (onRamp ? 1 : surfaceMul(s.x, false)) * s.speedMul;

  /* ── steering ──────────────────────────────────────────────────────────
     Snappy and arcade, with overshoot on the LEAN only. The body wobbles;
     the intent does not. That is Octodad's rule, not Crazy Taxi's — the
     comedy is in the lean, and the success is never taken away for it. */
  const want = (input.steer || 0) * SEGWAY.lateralSpeed;
  const dv = want - s.vLat;
  const step = SEGWAY.lateralAccel * dtc;
  s.vLat += Math.max(-step, Math.min(step, dv));
  s.x += s.vLat * dtc;
  if (s.x < RIDE_X_MIN) { s.x = RIDE_X_MIN; s.vLat = 0; }
  if (s.x > RIDE_X_MAX) { s.x = RIDE_X_MAX; s.vLat = 0; }

  const leanTarget = (s.vLat / SEGWAY.lateralSpeed) * SEGWAY.leanMaxDeg;
  s.leanV += (leanTarget - s.lean) * 26 * dtc;
  s.leanV *= 1 - Math.min(1, 7 * dtc);
  s.lean += s.leanV * dtc * (1 + SEGWAY.leanOvershoot);

  /* ── forward. RULE 1: y only ever increases. ────────────────────────── */
  s.y += eff * dtc;
  trackRuts(s);

  /* ── throws. RULE 3: read every tick, never gated by anything else. ─── */
  if (input.throwL) throwHanger(s, "L");
  if (input.throwR) throwHanger(s, "R");

  for (let i = s.hangers.length - 1; i >= 0; i--) {
    const h = s.hangers[i];
    if (stepHanger(h, dtc)) {
      resolveLanding(s, h);
      s.hangers.splice(i, 1);
    }
  }

  /* ── the world ─────────────────────────────────────────────────────────*/
  const HALF = SEGWAY.collideHalfM;
  for (const p of s.props) {
    if (p.dead) continue;
    if (p.y < s.y - 30) continue;
    if (p.y > s.y + 90) break;

    if (p.v) p.y -= p.v * dtc * (p.kind === "car" ? 1 : 0.35); // oncoming

    const dy = Math.abs(p.y - s.y);
    if (dy > (p.l + 1.2) / 2) continue;
    if (!overlap(s.x, HALF * 2, p.x, p.w)) continue;

    if (p.kind === "bundle") {
      p.dead = true;
      s.ammo = Math.min(HANGER.ammo, s.ammo + HAZARDS.bundle.gives);
      emit(s, "pickup", { x: p.x, y: p.y, gives: HAZARDS.bundle.gives });
      continue;
    }
    if (p.kind === "ramp") {
      if (s.airLeft <= 0) {
        s.airLeft = HAZARDS.ramp.airS;
        s.v = Math.min(SEGWAY.maxSpeed, s.v + HAZARDS.ramp.boost);
        emit(s, "ramp", { x: p.x, y: p.y });
      }
      continue;
    }
    /* Airborne clears everything. The ramp is the only pure upside on the
       street and it needs to feel like one. */
    if (s.airLeft > 0) continue;
    if (p.kind === "can") {
      p.dead = true;
      s.v = Math.max(SEGWAY.minSpeed, s.v - 2.2);
      emit(s, "clip", { x: p.x, y: p.y });
      continue;
    }
    crash(s, p.kind);
  }

  /* ── the HOA cart ──────────────────────────────────────────────────────
     Paperboy had bees. The trigger is 45% of max, not the bible's 20%: 20%
     of 15 is 3.0 m/s and minSpeed is 4.0, so on tarmac the punisher could
     never once have fired in the entire game. */
  const idling = s.v < SEGWAY.maxSpeed * CART.triggerPct;
  if (idling && !s.cart) {
    s.idleLeft -= dtc;
    if (s.idleLeft <= 0) {
      s.cart = { y: s.y - CART.spawnBehindM, x: s.x };
      emit(s, "cart", { spawned: true });
    }
  } else if (!idling) {
    s.idleLeft = CART.triggerHoldS;
  }
  if (s.cart) {
    const cv = CART.speedOf(eff);
    s.cart.y += cv * dtc;
    s.cart.x += (s.x - s.cart.x) * Math.min(1, 2.2 * dtc);
    const gap = s.y - s.cart.y;
    if (gap <= 0.9) {
      s.cart = null;
      s.idleLeft = CART.triggerHoldS;
      s.score = Math.max(0, s.score + CART.hitCash);
      s.heat += CART.hitHeat;
      crash(s, "cart");
      emit(s, "cart", { hit: true });
    } else if (gap > 26) {
      s.cart = null;
      s.idleLeft = CART.triggerHoldS;
      emit(s, "cart", { lost: true });
    }
  }

  if (s.y >= STREET_LENGTH_M) finish(s, "end");
  return s;
}

/* ── read-only queries for the HUD and the aim ghost ──────────────────────*/

/** Where would a throw land RIGHT NOW? The ghost calls the same resolver the
    real throw does, so it is incapable of lying. */
export function ghost(s, side) {
  if (s.ammo <= 0) return null;
  return predictLanding({ street: s.street, x0: s.x, y0: s.y, vF: s.v, side });
}

/** Live positions of everything in the air, for skDraw. */
export function hangersNow(s) {
  return s.hangers.map((h) => ({ ...hangerAt(h, h.age), id: h.id, side: h.side, key: h.outcome.key }));
}

/** Drain the event queue. The scene calls this once a frame for sfx/particles. */
export function drain(s) {
  const e = s.events;
  s.events = [];
  return e;
}

/** Everything phase 2 needs, and nothing it doesn't. */
export function rideResult(s) {
  const covered = Object.keys(s.leads).length;
  return {
    score: s.score,
    leads: { ...s.leads },
    grudge: { ...s.grudge },
    ruts: s.ruts.map((r) => ({ h: r.houseIdx, y0: Math.round(r.y0), y1: Math.round(r.y1) })),
    heat: s.heat,
    hits: s.hits,
    ammoLeft: s.ammo,
    livesLeft: s.lives,
    bestCombo: s.bestCombo,
    outcome: s.outcome,
    covered,
    hot: Object.values(s.leads).filter((l) => l === "hot").length,
    dead: Object.values(s.leads).filter((l) => l === "dead").length,
    hostile: Object.values(s.leads).filter((l) => l === "hostile").length,
    perfect: covered >= s.street.houses.length && !Object.values(s.leads).includes("dead"),
  };
}

export default { createRide, stepRide, throwHanger, ghost, hangersNow, drain, rideResult };
