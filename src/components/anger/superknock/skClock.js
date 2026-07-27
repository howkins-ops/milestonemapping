/* ════════════════════════════════════════════════════════════════════════
   SUPER KNOCK — THE DAY CLOCK.

   ANCHORED, NEVER DECREMENTED. The clock is `{atMs, leftS, rate}` and every
   read is a fresh subtraction from `Date.now()`. A decremented clock is wrong
   the instant the phone sleeps, and iOS suspends a backgrounded tab without
   warning. This is the same law Hoops runs its quarters on
   (`Hoops.jsx:1069-1137`) and it is not negotiable.

   ── ONE DELIBERATE DEVIATION FROM HOOPS ──────────────────────────────────
   Hoops SNAPS FORWARD on return: real time passed, so the quarter burned.
   That is right for a basketball game and wrong here. This clock BANKS AND
   PAUSES on `hidden`. A phone call at 09:20 must not cost you the day.

   And pause on `hidden`, never on `blur` — an iOS notification banner fires
   blur without hidden, and pausing for it reads as a stutter.

   ── THE WINDOWS ──────────────────────────────────────────────────────────
   Twelve game-hours over seven real minutes, dilated per window. A flat rate
   would make MIDDAY several real minutes of nobody answering the door, which
   is the single largest fun risk in the whole design. Dilation keeps the
   lesson ("9-to-5 knocking fails") while GOLDEN gets the most real playtime.
   ════════════════════════════════════════════════════════════════════════ */
import { DAY_REAL_S, WINDOWS } from "./skTuning.js";

export function createClock(now = Date.now(), leftS = DAY_REAL_S) {
  return { atMs: now, leftS, rate: 1, paused: false, ended: false };
}

/** Seconds remaining right now. Pure — safe to call from a render. */
export function remaining(c, now = Date.now()) {
  if (!c) return 0;
  if (c.paused || c.ended) return Math.max(0, c.leftS);
  const spent = ((now - c.atMs) / 1000) * c.rate;
  return Math.max(0, c.leftS - spent);
}

/** Fold elapsed time into `leftS` and re-anchor. Every mutation goes through
    this, so the anchor can never disagree with the value it anchors. */
export function reanchor(c, now = Date.now()) {
  c.leftS = remaining(c, now);
  c.atMs = now;
  return c;
}

export function pauseClock(c, now = Date.now()) {
  if (c.paused) return c;
  reanchor(c, now);
  c.paused = true;
  return c;
}

export function resumeClock(c, now = Date.now()) {
  if (!c.paused) return c;
  c.atMs = now; // banked time resumes exactly where it stopped
  c.paused = false;
  return c;
}

/**
 * Spend clock. A door outcome costs a FLAT amount, never its real duration:
 * charging a fight by how long it took would couple the two systems and make
 * a hard-won sale feel like a fine.
 *
 * Subtracts from `leftS` AND re-anchors — subtracting from a displayed value
 * would be silently undone by the next read.
 */
export function charge(c, seconds, now = Date.now()) {
  reanchor(c, now);
  c.leftS = Math.max(0, c.leftS - seconds);
  return c;
}

/** True exactly once, the first time the clock hits zero. The caller still
    needs its own fired-once guard for the day-end side effects; this only
    reports the state. */
export function isOut(c, now = Date.now()) {
  return remaining(c, now) <= 0;
}

/* ── the game-world time of day ───────────────────────────────────────────*/

const TOTAL = WINDOWS.reduce((a, w) => a + w.realS, 0);

/** Which window are we in, and what does the clock on the wall say? */
export function timeOfDay(c, now = Date.now()) {
  const left = remaining(c, now);
  let spent = TOTAL - left;
  for (const w of WINDOWS) {
    if (spent < w.realS || w === WINDOWS[WINDOWS.length - 1]) {
      const f = Math.max(0, Math.min(1, spent / w.realS));
      const h = w.fromH + (w.toH - w.fromH) * f;
      const hh = Math.floor(h);
      const mm = Math.floor((h - hh) * 60);
      return {
        window: w.key,
        label: w.label,
        openMul: w.openMul,
        hour: hh,
        minute: mm,
        text: `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`,
        frac: f,
        left,
      };
    }
    spent -= w.realS;
  }
  return { window: "golden", label: "GOLDEN HOURS", openMul: 1.25, hour: 20, minute: 0, text: "20:00", frac: 1, left: 0 };
}

/** Serialise for the device-only resume snapshot. */
export const packClock = (c, now = Date.now()) => ({ leftS: Math.round(remaining(c, now) * 10) / 10, paused: true });
export const unpackClock = (o, now = Date.now()) =>
  ({ atMs: now, leftS: o && typeof o.leftS === "number" ? o.leftS : DAY_REAL_S, rate: 1, paused: false, ended: false });

export default { createClock, remaining, charge, pauseClock, resumeClock, timeOfDay, isOut };
