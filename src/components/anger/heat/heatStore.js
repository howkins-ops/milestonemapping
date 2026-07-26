/* ════════════════════════════════════════════════════════════════════════
   HEAT — the campaign-wide wanted meter. Persists, and is CLOUD-SYNCED.

   `door_heat_v1` is registered in FEATURE_STORE_KEYS (src/hooks/useAppData.js),
   which is the only thing in this app that makes a localStorage key survive a
   reinstall. Two Door keys shipped without that registration and were silently
   device-only for their whole lives; do not add a third.

   Passive cooling is DERIVED from a wall-clock anchor, never decremented by a
   timer. A decremented meter is wrong the moment the phone sleeps, and a
   player who closes the app at 5 heat should not come back to 5 heat a week
   later — nor to 0 because a setInterval ran 40,000 times.
   ════════════════════════════════════════════════════════════════════════ */
import { HEAT, heatTier } from "./heatTuning.js";

export const HEAT_STORE_KEY = "door_heat_v1";

const EMPTY = {
  v: 1,
  heat: 0,
  peak: 0,
  polo: true,            // still wearing the branded polo
  day: null,             // local day key
  dayVandal: 0,
  dayClean: 0,
  coolAnchorMs: 0,
  lastChaseAt: null,
  fines: 0,
  chasesEvaded: 0,
  chasesCaught: 0,
};

/* Derived from the passed clock, not from Date.now() directly: a function that
   takes a `now` and then ignores it for half its logic is a function nobody can
   test and nobody can reason about at a day boundary. */
const todayKey = (now) => new Date(now).toISOString().slice(0, 10);

function read() {
  try { return JSON.parse(localStorage.getItem(HEAT_STORE_KEY) || "null"); } catch { return null; }
}
function write(s) {
  try { localStorage.setItem(HEAT_STORE_KEY, JSON.stringify(s)); } catch { /* private mode */ }
}

const clampHeat = (n) => Math.max(0, Math.min(HEAT.max, Math.round(n * 100) / 100));

/** Heat after passive cooling, given an anchor. Pure — safe to call on read. */
function cooled(raw, anchorMs, now) {
  if (!anchorMs) return raw;
  const periods = Math.floor((now - anchorMs) / HEAT.coolPeriodMs);
  if (periods <= 0) return raw;
  return clampHeat(raw - periods * HEAT.coolPerPeriod);
}

/** Load, applying passive cooling and rolling the day over. */
export function loadHeat(now = Date.now()) {
  const s = { ...EMPTY, ...(read() || {}) };
  s.heat = cooled(s.heat, s.coolAnchorMs, now);

  const day = todayKey(now);
  if (s.day !== day) {
    // a full day with nothing broken is the cheapest way back to clean
    if (s.day && s.dayVandal === 0) s.heat = clampHeat(s.heat - HEAT.cool.perfectDay);
    s.day = day;
    s.dayVandal = 0;
    s.dayClean = 0;
    s.polo = true;                 // you show up in a clean one
  }
  return s;
}

function commit(s, now = Date.now()) {
  s.heat = clampHeat(s.heat);
  s.peak = Math.max(s.peak || 0, s.heat);
  s.coolAnchorMs = now;            // re-anchor on every write
  write(s);
  return s;
}

export function addHeat(n, _reason, now = Date.now()) {
  const s = loadHeat(now);
  s.heat += n;
  return commit(s, now);
}

export function coolHeat(n, _reason, now = Date.now()) {
  const s = loadHeat(now);
  s.heat -= n;
  return commit(s, now);
}

/** Broke something. `kind` keys into HEAT.gain. */
export function recordVandalism(kind, now = Date.now()) {
  const s = loadHeat(now);
  s.heat += HEAT.gain[kind] || 0;
  s.dayVandal += 1;
  return commit(s, now);
}

/** Closed a sale without breaking anything — the intended way down. */
export function recordCleanClose(now = Date.now()) {
  const s = loadHeat(now);
  s.dayClean += 1;
  s.heat -= HEAT.cool.cleanClose;
  return commit(s, now);
}

/** The GTA Online appearance-change steal: lose the branded polo, lose heat. */
export function ditchPolo(now = Date.now()) {
  const s = loadHeat(now);
  if (!s.polo) return s;
  s.polo = false;
  s.heat -= HEAT.cool.ditchPolo;
  return commit(s, now);
}

export function recordChase({ evaded, fine = 0 }, now = Date.now()) {
  const s = loadHeat(now);
  if (evaded) { s.chasesEvaded += 1; s.heat -= HEAT.cool.evadedChase; }
  else { s.chasesCaught += 1; s.heat += HEAT.gain.caughtInChase; s.fines += fine; }
  s.lastChaseAt = now;
  return commit(s, now);
}

/** Should a chase fire right now? Respects the tier gate and the cooldown. */
export function shouldChase(state, now = Date.now(), roll = Math.random()) {
  const t = heatTier(state.heat);
  const chance = HEAT.chaseChance[t.key];
  if (!chance) return false;
  if (state.lastChaseAt && now - state.lastChaseAt < HEAT.chaseCooldownMs) return false;
  return roll < chance;
}

export { heatTier };
