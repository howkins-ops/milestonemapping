/* ════════════════════════════════════════════════════════════════════════
   THE CHASE — the brain. Pure functions and one mutable sim object, no React,
   no DOM, no rAF of its own. The caller ticks it.

   Written headless on purpose: the entire GTA feel lives in this state machine,
   and it is far cheaper to prove SPOTTED → SEARCHING → re-spot → EVADED with a
   loop and a console than with a phone and a thumb.

   THE MODEL (GTA V, not GTA IV):
     SPOTTED    solid stars. They path at you. last-seen tracks you every tick.
     SEARCHING  flashing stars. The FLASH RATE is the progress bar — slower
                flash means closer to free. Cones sweep, and their REACH
                shrinks toward the last place they saw you.
     CLEAR      gone.
   Re-spotted resets the evade clock to FULL. Not partially. That one rule is
   what makes hiding tense rather than a formality.

   Getting caught is never contact damage: a cop "catches" you by keeping you
   SPOTTED for caughtAfterSpottedMs. A dropped frame can therefore never end a
   run, which matters enormously on a mid-range phone.
   ════════════════════════════════════════════════════════════════════════ */
import { CHASE, SEGWAY, HIDES } from "../heat/heatTuning.js";

const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);
const tierFor = (stars) => CHASE.tiers[clamp(stars, 1, CHASE.maxStars) - 1];

/** Build the pursuer roster for a star level. Deterministic given a seed. */
export function spawnPursuers(stars, worldW, playerX, seed = 1) {
  const t = tierFor(stars);
  const out = [];
  let n = 0;
  const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
  const push = (kind, count) => {
    for (let i = 0; i < count; i++) {
      // spawn behind and ahead so the street reads as closing in, never as a
      // conga line you can simply outrun
      const side = i % 2 ? 1 : -1;
      const dist = 420 + rnd() * 380;
      out.push({
        id: `${kind}${n++}`, kind,
        x: clamp(playerX + side * dist, 40, worldW - 40),
        facing: side > 0 ? -1 : 1,
        coneLen: CHASE.coneRange[kind],
        alert: 0,
      });
    }
  };
  push("foot", t.foot); push("cruiser", t.cruiser); push("drone", t.drone);
  return out;
}

export function createChase({ stars = 1, worldW = 2480, playerX = 200, seed = 1, now = 0 }) {
  return {
    stars: clamp(stars, 1, CHASE.maxStars),
    mode: "spotted",              // "spotted" | "searching" | "clear" | "caught"
    pursuers: spawnPursuers(stars, worldW, playerX, seed),
    worldW,
    lastSeenX: playerX,
    evadeLeftMs: CHASE.evadeMs[clamp(stars, 1, CHASE.maxStars)],
    spottedSinceMs: now,          // when the CURRENT spotted run began
    dwellMs: 0,                   // time continuously inside a cone
    startedAt: now,
    poloDitched: false,
    outcome: null,                // "evaded" | "caught" | "timeout"
    seed,
  };
}

/* Standing close enough to touch beats any cone. Without this a pursuer that
   has walked onto your position flickers in and out of "seeing" you, because
   its facing flips every frame it steps past you — which reads as a cop
   looking straight through your face. */
const NOTICE_PX = 70;
const DRONE_ALT = 260;

/** Is the player visible to this pursuer right now? */
export function sees(p, playerX, playerY, hidden, hidePartial) {
  // Ground cover breaks ground line-of-sight but never the drone's — GTA's
  // bush-versus-helicopter rule. Partial cover (the mailbox) is exactly that.
  if (hidden && !(hidePartial && p.kind === "drone")) return false;
  const dx = playerX - p.x;
  const dist = Math.abs(dx);
  if (dist > p.coneLen) return false;

  if (p.kind === "drone") {
    /* The drone looks DOWN, so its cone opens from the VERTICAL, not along the
       street. Measuring it horizontally like a foot cop makes it blind to
       anything directly beneath it, which is the opposite of a helicopter. */
    const alt = Math.max(1, DRONE_ALT - (playerY || 0));
    const ang = Math.atan2(dist, alt) * 180 / Math.PI;
    return ang <= CHASE.coneDeg.drone;
  }

  if (dist <= NOTICE_PX) return true;                          // right there
  if (Math.sign(dx) !== p.facing && dx !== 0) return false;    // behind them
  return true;
}

/**
 * Advance the chase by dt seconds.
 * `input` = { playerX, playerY, hidden, hidePartial }
 * Returns the sim (mutated) — the caller reads `mode`, `stars`, `outcome`.
 */
export function stepChase(s, dt, input, now) {
  if (s.outcome) return s;
  const { playerX, playerY = 0, hidden = false, hidePartial = false } = input;

  // ── who can see us ─────────────────────────────────────────────────────
  let seen = false;
  for (const p of s.pursuers) {
    const v = sees(p, playerX, playerY, hidden, hidePartial);
    p.alert = v ? 1 : Math.max(0, p.alert - dt * 2);
    if (v) seen = true;
  }

  if (seen) s.dwellMs += dt * 1000;
  else s.dwellMs = 0;

  // ── the state machine ──────────────────────────────────────────────────
  if (s.mode === "searching" && s.dwellMs >= CHASE.spotDwellMs) {
    s.mode = "spotted";
    s.spottedSinceMs = now;
    s.spottedForMs = 0;
    // RE-SPOTTED RESETS THE CLOCK TO FULL. Not partially. This is the rule.
    if (CHASE.reSpotResetsTimer) s.evadeLeftMs = CHASE.evadeMs[s.stars];
    // and they get their reach back — a search that gave up once shouldn't
    // leave them permanently half-blind for the rest of the chase
    for (const p of s.pursuers) p.coneLen = CHASE.coneRange[p.kind];
  } else if (s.mode === "spotted" && !seen) {
    s.graceMs = (s.graceMs || 0) + dt * 1000;
    if (s.graceMs >= CHASE.lostSightGraceMs) {
      s.mode = "searching";
      s.graceMs = 0;
      s.evadeLeftMs = CHASE.evadeMs[s.stars];
    }
  } else if (s.mode === "spotted") {
    s.graceMs = 0;
  }

  // ── movement + the search ──────────────────────────────────────────────
  const t = tierFor(s.stars);
  if (s.mode === "spotted") {
    s.lastSeenX = playerX;
    s.spottedForMs = (s.spottedForMs || 0) + dt * 1000;
    for (const p of s.pursuers) {
      const dir = Math.sign(playerX - p.x) || 1;
      p.x = clamp(p.x + dir * t.closeSpeed * dt, 0, s.worldW);
      p.facing = dir;
    }
    // caught by being SEEN too long, never by being touched
    if (s.spottedForMs >= CHASE.caughtAfterSpottedMs[s.stars]) {
      s.mode = "caught"; s.outcome = "caught";
    }
  } else if (s.mode === "searching") {
    s.spottedForMs = 0;
    s.evadeLeftMs -= dt * 1000;
    // their guess wanders, so hiding one pixel outside the last-seen spot
    // is not a safe strategy
    s.lastSeenX += Math.sin(now / 700) * CHASE.lastSeenDriftPx * dt;
    for (const p of s.pursuers) {
      const dir = Math.sign(s.lastSeenX - p.x) || 1;
      p.x = clamp(p.x + dir * t.closeSpeed * 0.55 * dt, 0, s.worldW);
      p.facing = dir;
      // the beam visibly gets SHORTER as they give up — GTA IV's shrinking
      // search radius, translated into something legible in a side-scroller
      p.coneLen = Math.max(60, p.coneLen - CHASE.searchShrinkPxPerS * 60 * dt);
    }
    if (s.evadeLeftMs <= 0) { s.mode = "clear"; s.outcome = "evaded"; }
  }

  if (!s.outcome && now - s.startedAt > CHASE.maxChaseMs) {
    // a chase longer than the cap is a chore, not a thrill
    s.mode = "clear"; s.outcome = "evaded";
  }
  return s;
}

/** Ditch the branded polo: −1 star, only while hidden, once per chase. */
export function ditchPoloInChase(s, hidden, now) {
  const c = CHASE.ditchPolo;
  if (s.poloDitched && c.oncePerChase) return false;
  if (c.requiresHidden && !hidden) return false;
  if (s.stars <= 1) return false;
  s.poloDitched = true;
  s.stars = clamp(s.stars + c.stars, 1, CHASE.maxStars);
  s.pursuers = s.pursuers.slice(0, Math.max(1, s.pursuers.length - 1));
  s.evadeLeftMs = CHASE.evadeMs[s.stars];
  s.mode = "searching";
  return true;
}

/** Star flash rate in Hz. Solid (0) while spotted; slows as you get free. */
export function flashHz(s) {
  if (s.mode !== "searching") return 0;
  const p = clamp(1 - s.evadeLeftMs / CHASE.evadeMs[s.stars], 0, 1);
  return CHASE.flashHz[0] + (CHASE.flashHz[1] - CHASE.flashHz[0]) * p;
}

/* ── the segway ──────────────────────────────────────────────────────────
   Velocity integration, not position setting. Low accel and very low decel
   mean the machine smooths sloppy thumbs into a funny arc — the latency IS
   the feature, and it is why this works with three buttons. */
export function stepSegway(v, dir, dt) {
  const target = dir * SEGWAY.maxSpeed * (dir < 0 ? SEGWAY.reverseSpeedMul : 1);
  const opposing = v !== 0 && Math.sign(target) !== Math.sign(v) && target !== 0;
  const rate = dir === 0 ? SEGWAY.decel : opposing ? SEGWAY.brake : SEGWAY.accel;
  const step = rate * dt;
  if (Math.abs(target - v) <= step) return target;
  return v + Math.sign(target - v) * step;
}

/** Slam the opposite way at speed and it goes out from under you. */
export function willTipOver(v, dir) {
  return dir !== 0
    && Math.sign(dir) !== Math.sign(v)
    && Math.abs(v) / SEGWAY.maxSpeed > SEGWAY.tipOverAt;
}

/** Magnet assist toward a hide spot you're already moving at. */
export function hideMagnet(v, playerX, spotX, dt) {
  const d = spotX - playerX;
  if (Math.abs(d) > HIDES.magnetRangePx) return v;
  if (Math.sign(d) !== Math.sign(v) || v === 0) return v;
  return v + Math.sign(d) * HIDES.magnetPxPerS * dt;
}
