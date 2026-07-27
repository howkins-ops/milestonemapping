/* ════════════════════════════════════════════════════════════════════════
   THE ROUTE — THE THROW. The whole flyer run is in this file.

   Pure. No React, no DOM, no rAF, no Date.now(). Every function here takes
   plain numbers and returns plain objects, which is why the entire feel of
   phase 1 can be tuned by reading a table in a terminal instead of by
   thrashing a phone. See scripts/route-selftest.mjs.

   ── CLOSED FORM, NOT INTEGRATED ──────────────────────────────────────────
   The hanger's path is evaluated analytically at any age t:

       x(t) = x0 + dir·vLat·t
       y(t) = y0 + vF·t                     (forward velocity inherited once)
       z(t) = z0 + vz0·t − ½·G·t²

   DoorFX integrates its projectiles with semi-implicit Euler at a fixed
   1/60s, and the continuous solution disagrees with that recurrence by
   exactly ½·g·T·h every shot — a bias that cost this project real debugging
   time on The Door's night gallery. The fix there was to invert the discrete
   recurrence. The fix HERE is simpler: the hanger never goes through DoorFX
   at all, so there is exactly one formula, it is used for drawing, for
   collision AND for the aim ghost, and they cannot drift.

   ── RESOLUTION ORDER ─────────────────────────────────────────────────────
   1. too close to throw          → PLACED on the mat
   2. crosses the mailbox plane   → MAILBOX (only if it's low enough to fit)
   3. hits the dirt first         → falls short: lawn / hedge / dropped
   4. reaches the facade plane    → the box tests, in value order
   ════════════════════════════════════════════════════════════════════════ */
import {
  HANGER, MAILBOX, OUTCOMES, FACADE_L_X, FACADE_R_X, BANDS,
  arrivalZ, flightTime,
} from "./skTuning.js";
import { houseAt, targetBoxes, mailboxBox } from "./skStreet.js";

/** How far past the facade a miss still counts as "on his lawn" (and kills
    the lead). Beyond this it is IN THE HEDGE — wasted, but harmless. A wild
    miss should not silently delete a house you were never near. */
export const LAWN_PAD_M = 6.0;

/* ── the path ─────────────────────────────────────────────────────────────*/

export const dirOf = (side) => (side === "L" ? -1 : 1);
export const facadeXOf = (side) => (side === "L" ? FACADE_L_X : FACADE_R_X);
export const mailboxXOf = (side) => (side === "L" ? MAILBOX.offsetX : FACADE_R_X - MAILBOX.offsetX);

/** Height at age t. The one formula. */
export const zAt = (t) => HANGER.z0 + HANGER.vz0 * t - 0.5 * HANGER.G * t * t;

/** Age at which the hanger hits the dirt. */
export const groundTime = (() => {
  const a = 0.5 * HANGER.G, b = -HANGER.vz0, c = -HANGER.z0;
  return (-b + Math.sqrt(b * b - 4 * a * c)) / (2 * a);
})();

/** Position of a hanger at age t. Pure — this is what skDraw calls per frame. */
export function hangerAt(h, t) {
  const tt = Math.min(t, h.tEnd);
  return {
    x: h.x0 + h.dir * HANGER.vLat * tt,
    y: h.y0 + h.vF * tt,
    z: Math.max(0, zAt(tt)),
    spin: (h.spin * tt) % 360,
    done: t >= h.tEnd,
  };
}

/* ── box tests ────────────────────────────────────────────────────────────*/

const inBox = (y, z, b) => y >= b.y0 && y <= b.y1 && z >= b.z0 && z <= b.z1;

/**
 * Snap in Y only, and only for catch targets, and only when the shot is
 * ALREADY at the right height. That last condition is what stops this from
 * being an autohit: it can rescue a mistimed throw, it can never convert a
 * window-height throw into a handle hook.
 */
function inBoxSnapped(y, z, b) {
  if (z < b.z0 || z > b.z1) return false;
  return y >= b.y0 - HANGER.snapM && y <= b.y1 + HANGER.snapM;
}

/* ── the surface a short throw lands on ───────────────────────────────────*/
function bandAt(x) {
  for (const b of BANDS) if (x >= b.from && x < b.to) return b;
  return BANDS[BANDS.length - 1];
}

/* ── resolution ───────────────────────────────────────────────────────────*/

function out(key, extra) {
  return { ...OUTCOMES[key], key, ...extra };
}

/**
 * Resolve a throw completely, without simulating it.
 *
 * Used for the real throw AND for the predicted-landing ghost, which is the
 * point: the ghost cannot lie, because it is the same function.
 *
 * @returns {{key,pts,lead,label,houseIdx,y,z,t,x,tEnd}}
 */
export function resolveThrow({ street, x0, y0, vF, side }) {
  const dir = dirOf(side);
  const facadeX = facadeXOf(side);
  const d = Math.abs(facadeX - x0);

  /* 1 · PLACED — you are close enough to lean over and set it down. Not a
        punishment: a real low-risk play, and the thing that makes point-blank
        window smashes (a free 1000 at ×3 payout) impossible. */
  if (d < HANGER.minThrowM) {
    const h = houseAt(street, y0, side);
    if (!h) return out("dropped", { houseIdx: null, y: y0, z: 0, t: 0, x: x0, tEnd: 0 });
    return out("placed", { houseIdx: h.idx, y: y0, z: 0, t: 0, x: x0, tEnd: 0.25, placed: true });
  }

  const tFacade = flightTime(d);
  const tGround = groundTime;

  /* 2 · THE MAILBOX PLANE. Only if it lies between the rider and the facade,
        and only if the hanger is low enough by then to drop into the slot.
        From the middle of the road it sails clean over — which is exactly
        what makes the handle a road-centre shot and the mailbox a far-lane
        shot. See the MAILBOX note in skTuning. */
  const mx = mailboxXOf(side);
  const mailboxAhead = side === "L" ? x0 > mx : x0 < mx;
  if (mailboxAhead) {
    const tm = Math.abs(mx - x0) / HANGER.vLat;
    if (tm < tFacade && tm < tGround) {
      const ym = y0 + vF * tm;
      const zm = zAt(tm);
      const h = houseAt(street, ym, side, LAWN_PAD_M);
      if (h) {
        const mb = mailboxBox(h);
        if (inBoxSnapped(ym, zm, mb)) {
          return out("mailbox", { houseIdx: h.idx, y: ym, z: zm, t: tm, x: mx, tEnd: tm, boxKey: "mailbox" });
        }
      }
    }
  }

  /* 3 · IT HITS THE DIRT FIRST. Anything thrown further than MAX_REACH falls
        short — which is what makes a lazy throw across the whole street a bad
        idea rather than a free option. */
  if (tGround < tFacade) {
    const xl = x0 + dir * HANGER.vLat * tGround;
    const yl = y0 + vF * tGround;
    const band = bandAt(xl);
    if (band.key === "lawn") {
      const h = houseAt(street, yl, side, LAWN_PAD_M);
      if (h) return out("lawn", { houseIdx: h.idx, y: yl, z: 0, t: tGround, x: xl, tEnd: tGround });
      return out("hedge", { houseIdx: null, y: yl, z: 0, t: tGround, x: xl, tEnd: tGround });
    }
    /* Landed on tarmac or the sidewalk. Wasted a hanger, changed nothing. */
    return out("dropped", { houseIdx: null, y: yl, z: 0, t: tGround, x: xl, tEnd: tGround });
  }

  /* 4 · IT REACHES THE FACADE. */
  const yA = y0 + vF * tFacade;
  const zA = zAt(tFacade);
  const house = houseAt(street, yA, side, LAWN_PAD_M);
  const base = { y: yA, z: zA, t: tFacade, x: facadeX, tEnd: tFacade };

  if (!house) return out("hedge", { houseIdx: null, ...base });

  const onFacade = yA >= house.y && yA <= house.y + house.facade.frontageM;
  if (!onFacade) return out("lawn", { houseIdx: house.idx, ...base, z: 0 });

  const boxes = targetBoxes(house);

  /* Value order. The handle sits INSIDE the door rect, so it must be tested
     first or it can never be hit. */
  for (const b of boxes) {
    /* A hanger thrown from across the road arrives lobbing and spent — it
       does not break glass. Only a close, flat throw does, and the only lane
       that close is his lawn. See FACADE.boxes.window in skTuning. */
    if (d > b.maxD) continue;
    const hit = b.catch ? inBoxSnapped(yA, zA, b) : inBox(yA, zA, b);
    if (!hit) continue;

    if (b.catch) {
      /* THE NEAR-MISS TEASE. The hook contacts the handle but doesn't hold —
         it spins off and drops to the mat. Still 150, still LUKEWARM, but the
         player FELT the catch, and that is what makes them slow down at the
         next house. Deterministic, never a dice roll: trust matters more than
         variety on the mechanic the whole game rests on. */
      const bandH = b.z1 - b.z0;
      const inner = bandH * 0.075;
      const held = zA >= b.z0 + inner && zA <= b.z1 - inner;
      if (!held) {
        return out("nearmiss", { houseIdx: house.idx, ...base, boxKey: "handle", nearmiss: true });
      }
      return out("hooked", { houseIdx: house.idx, ...base, boxKey: "handle" });
    }

    const key = b.key === "window" ? "window" : b.key === "door" ? "door" : "mat";
    return out(key, { houseIdx: house.idx, ...base, boxKey: b.key });
  }

  /* On the building, but not on anything that counts — siding, basically. */
  return out("lawn", { houseIdx: house.idx, ...base, z: 0 });
}

/* ── launching ────────────────────────────────────────────────────────────*/

let nextId = 1;

/**
 * Create a live hanger. The outcome is decided AT LAUNCH and carried on the
 * object; the flight is presentation. This is deliberate — it is the same
 * lesson The Door's night gallery learned the hard way, where a projectile
 * that re-tested every rect every step kept getting eaten by whatever
 * happened to be in front of the thing the player was actually aiming at.
 */
export function launch({ street, x0, y0, vF, side, spinSeed = 0 }) {
  const res = resolveThrow({ street, x0, y0, vF, side });
  const spinRange = HANGER.spinDegPerS;
  return {
    id: nextId++,
    x0, y0, vF,
    side,
    dir: dirOf(side),
    spin: spinRange[0] + (spinSeed % 1) * (spinRange[1] - spinRange[0]),
    age: 0,
    tEnd: res.tEnd,
    outcome: res,
    resolved: false,
  };
}

/** Advance a hanger. Returns true on the frame it lands. */
export function stepHanger(h, dt) {
  if (h.resolved) return false;
  h.age += dt;
  if (h.age >= h.tEnd) {
    h.age = h.tEnd;
    h.resolved = true;
    return true;
  }
  return false;
}

/* ── the aim ghost ────────────────────────────────────────────────────────
   Fifteen lines that decide whether the throw is learnable inside a 90-second
   run. Without it "guess the lead" is opaque and the player blames the game;
   with it, the throw becomes aimable and the ghost itself is the difficulty
   dial — on for street 1, off for street 3. */
export function predictLanding({ street, x0, y0, vF, side }) {
  const r = resolveThrow({ street, x0, y0, vF, side });
  return {
    key: r.key,
    label: r.label,
    pts: r.pts,
    lead: r.lead,
    y: r.y,
    z: r.z,
    x: r.x,
    t: r.t,
    houseIdx: r.houseIdx,
    good: r.pts > 0,
    kills: r.lead === "dead",
  };
}

/* ── analysis helpers ─────────────────────────────────────────────────────
   The lateral zone a given distance puts you in. This is the function that
   tells the HUD which lane you are currently shooting from, and it is the
   same arithmetic the self-test prints as a table. */
export function zoneFor(d) {
  if (d < HANGER.minThrowM) return "placed";
  const z = arrivalZ(d);
  if (d > MAX_REACH) return "short";
  if (z >= 1.3) return "window";
  if (z >= 0.725 && z <= 1.175) return "handle";
  if (z >= 0.28) return "door";
  return "mat";
}
const MAX_REACH = groundTime * HANGER.vLat;
export { MAX_REACH };

/** Release-timing window in ms for a box `w` metres wide at forward speed vF. */
export const windowMs = (w, vF) => (w / Math.max(0.001, vF)) * 1000;

export default { launch, stepHanger, hangerAt, resolveThrow, predictLanding, zoneFor };
