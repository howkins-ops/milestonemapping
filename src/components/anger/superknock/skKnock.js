/* ════════════════════════════════════════════════════════════════════════
   SUPER KNOCK — PHASE 2, THE KNOCK. Pure.

   Three decisions at every door, and the clock is running through all of them:

     STANCE   where you stopped walking. Back and angled reads as a human;
              jammed against the door reads as a threat.
     THE KNOCK  a sweeping meter, one tap. Too soft is unheard. Too hard and
              they open angry and stay angry for the whole fight.
     THE WAIT  do you stand here for eight more seconds, or walk?

   ── THE SUNDAY FIX ───────────────────────────────────────────────────────
   The bible's Sunday numbers (1.8× sweep, 11% band) produce a 73ms window.
   Android WebView touch latency alone is 30–60ms, so that is a coin flip at
   the end of a seven-minute clock — and the bible ALSO made a soft knock a
   hard fail. These numbers land Sunday at 131ms, and the too-soft retry is
   guaranteed rather than "one retry". Brutal is fine. A coin flip is not.

   And the accepted band is offset EARLY by one latency-width, because
   otherwise every player on Earth is systematically late and concludes they
   are bad at it.
   ════════════════════════════════════════════════════════════════════════ */
import { KNOCK, LEAD, STANCE, WAIT_S, knockWindow } from "./skTuning.js";

export const VERDICT = { soft: "soft", sweet: "sweet", hard: "hard" };

/** Where the sweet band sits, as a 0..1 fraction of the sweep. */
export function sweetBand(day) {
  const { widthPct } = knockWindow(day);
  const half = widthPct / 2;
  return { from: Math.max(0, KNOCK.sweetCenter - half), to: Math.min(1, KNOCK.sweetCenter + half) };
}

/**
 * Judge a stopped meter.
 * `pos` is 0..1 across the sweep. The latency offset is applied to the READ,
 * not to the band, so what the player sees and what they get agree — the bar
 * is where their thumb was ~40ms ago, and this is the correction for that.
 */
export function meterVerdict(pos, day) {
  const { sweepS } = knockWindow(day);
  const corrected = pos + KNOCK.latencyOffsetS / sweepS;
  const band = sweetBand(day);
  if (corrected < band.from) return VERDICT.soft;
  if (corrected > band.to) return VERDICT.hard;
  return VERDICT.sweet;
}

/* ── will it open, and when ───────────────────────────────────────────────*/

const BASE_OPEN = { hot: 0.95, warm: 0.8, lukewarm: 0.62, hostile: 1.0, dead: 0, none: 0.12 };

/**
 * Two separate questions, deliberately.
 *
 *   `chance` — will anyone come at all? Lead state, grudge, signs, stance and
 *              the time of day all multiply into this.
 *   `openS`  — how long they take. Lead state alone, so a HOT door is always
 *              the fast one and the player can feel their morning paying off.
 *
 * Rolling one number for both would make a slow open indistinguishable from
 * an empty house, and the fifteen-second wait is only a decision if those two
 * feel different.
 */
export function knockOutcome({ lead = "none", houseOpenMul = 1, stance = "square", windowMul = 1, verdict = VERDICT.sweet, roll = Math.random() }) {
  const L = LEAD[lead] || LEAD.none;
  const st = STANCE[stance] || STANCE.square;

  if (lead === "dead" || houseOpenMul <= 0) {
    return { opens: false, openS: Infinity, reason: "dead", aggro: 1 };
  }

  let chance = (BASE_OPEN[lead] ?? 0.4) * houseOpenMul * st.openMul * windowMul;
  if (verdict === VERDICT.soft) chance *= 0.5; // they genuinely did not hear you
  chance = Math.max(0, Math.min(0.99, chance));

  const aggro = st.aggro * (verdict === VERDICT.hard ? KNOCK.hardAggroMul : 1);

  if (roll > chance) return { opens: false, openS: Infinity, reason: "noanswer", chance, aggro };
  return { opens: true, openS: Math.min(WAIT_S, L.openS), reason: "opens", chance, aggro };
}

/* ── the sweep, as a live thing ───────────────────────────────────────────*/

export function createKnockMeter(day) {
  const { sweepS } = knockWindow(day);
  return { day, sweepS, t: 0, pos: 0, dir: 1, stopped: false, verdict: null, attempts: 0 };
}

/** Ping-pong, not saw-tooth: a bar that teleports back to zero gives a free
    reset every cycle, and the tension of the return sweep is half the feel. */
export function stepKnockMeter(m, dt) {
  if (m.stopped) return m;
  m.t += dt * m.dir;
  if (m.t >= m.sweepS) { m.t = m.sweepS; m.dir = -1; }
  if (m.t <= 0) { m.t = 0; m.dir = 1; }
  m.pos = m.t / m.sweepS;
  return m;
}

export function stopKnockMeter(m) {
  if (m.stopped) return m;
  m.stopped = true;
  m.attempts += 1;
  m.verdict = meterVerdict(m.pos, m.day);
  return m;
}

/** Only a too-soft knock may be retried, and it always may be. */
export function canRetry(m) {
  return KNOCK.softRetry && m.verdict === VERDICT.soft && m.attempts < 3;
}

export function resetKnockMeter(m) {
  m.stopped = false;
  m.verdict = null;
  m.t = 0;
  m.dir = 1;
  m.pos = 0;
  return m;
}

/* ── the wait ─────────────────────────────────────────────────────────────*/

export function createWait(outcome) {
  return { left: WAIT_S, openAt: outcome.opens ? outcome.openS : Infinity, opened: false, expired: false };
}

export function stepWait(w, dt) {
  if (w.opened || w.expired) return w;
  w.left -= dt;
  if (WAIT_S - w.left >= w.openAt) { w.opened = true; return w; }
  if (w.left <= 0) { w.left = 0; w.expired = true; }
  return w;
}

/** Peeking through the window buys one more objection family, for 3s of clock.
    It is what turns the eight-second stare at an unopened door — 13% of the
    entire day — into the game's best small decision, without breaking the
    "your deck locks when you knock" commitment. */
export const PEEK = { costS: 3, gives: 1 };

export default { meterVerdict, knockOutcome, createKnockMeter, stepKnockMeter, stopKnockMeter, createWait, stepWait };
