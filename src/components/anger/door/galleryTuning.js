/* ════════════════════════════════════════════════════════════════════════
   THE DEMONSTRATION — tuning. One file, every dial.

   The night gallery: you are across the street in the bushes at 11:47 PM and
   the objection he beat you with at the door is a meter on his house. Empty it.

   Everything here was measured, not guessed — see the notes on GRAVITY and
   FLIGHT_S, which are locked to how DoorFX actually integrates.
   ════════════════════════════════════════════════════════════════════════ */

/* ── the lob ──────────────────────────────────────────────────────────────
   DoorFX steps at a FIXED 1/60s (DoorFX.js:458) using semi-implicit Euler:
       vy += g*h   THEN   y += vy*h                      (DoorFX.js:515-519)
   So after n steps of size h, with T = n*h:
       y(T) = y0 + vy0*T + 0.5*g*T*(T + h)
   Inverting THAT — rather than the continuous 0.5*g*T² — is what makes a tap
   land where you tapped. The continuous form is low by 0.5*g*T*h every single
   shot; at these numbers that is 4.7px, which is half a flamingo.        */
export const STEP_S = 1 / 60;
export const GRAVITY = 1400;        // matches DoorFX's default so the arc reads true
export const FLIGHT_S = 0.40;       // long enough to fire "as the headlights turn"
export const EGG_R = 9;

/** Launch velocity that puts the parabola through (tx,ty) in FLIGHT_S. Exact. */
export function solveLob(x0, y0, tx, ty) {
  return {
    vx: (tx - x0) / FLIGHT_S,
    vy: (ty - y0) / FLIGHT_S - 0.5 * GRAVITY * (FLIGHT_S + STEP_S),
  };
}

/* ── touch ────────────────────────────────────────────────────────────────
   A flamingo is ~15px of drawn art. Nobody hits 15px with a thumb, so the
   hitbox and the art are deliberately decoupled: art stays its real size,
   the collision rect inflates to at least MIN_HIT. SNAP_PX then pulls a near
   miss onto the nearest target centre — the single biggest feel lever here. */
export const MIN_HIT = 34;
export const SNAP_PX = 26;

/* ── the round ─────────────────────────────────────────────────────────── */
export const ROUND_S = 90;
export const COMBO_STEPS = [3, 6, 10];      // chained hits …
export const COMBO_MULTS = [2, 4, 8];       // … and what they multiply damage by
export const RELOAD_MS = 260;               // rate limit, also the "stand up" window

/* ── stealth ──────────────────────────────────────────────────────────────
   INVERTED from the design bible, deliberately. The bible says "duck or get
   spotted", but hold-to-crouch plus tap-to-fire is two simultaneous thumbs on
   a phone in portrait. So: you are crouched by default and FIRING stands you
   up. One input. The stealth layer becomes a rhythm problem — fire between the
   sweeps — instead of a dexterity problem, and the combo becomes legible.  */
export const EXPOSED_MS = 400;              // how long a shot leaves you up
export const SPOT_DWELL_MS = 260;           // exposed inside a threat this long = seen
export const BUST_HEAT = 3;

/* Threat windows. `warn` is the tell, `danger` is when being up costs you. */
export const THREATS = {
  headlights: { every: [9000, 14000], warn: 900, danger: 900 },
  porchlight: { every: [12000, 20000], warn: 500, danger: 3000 },
  ringcam: { sweepMs: 5200, halfDeg: 13 },   // same numbers as the gate sweep
  dogwalker: { atRemaining: 15000, warn: 2500, danger: 6000 },
};
