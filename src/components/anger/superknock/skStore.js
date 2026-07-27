/* ════════════════════════════════════════════════════════════════════════
   SUPER KNOCK — PERSISTENCE. Two keys, on purpose.

   ┌──────────────────┬────────────┬───────────────┬────────────────────────┐
   │ key              │ registered │ written       │ holds                  │
   ├──────────────────┼────────────┼───────────────┼────────────────────────┤
   │ super_knock_v1   │ YES, both  │ day-end and   │ the week. Packed.      │
   │                  │ lists      │ on `hidden`   │ Target < 400 bytes.    │
   │ sk_active_v1     │ NO         │ every house   │ mid-day resume.        │
   └──────────────────┴────────────┴───────────────┴────────────────────────┘

   ── WHY THE SPLIT ────────────────────────────────────────────────────────
   `useAppData` polls every registered key every 20 seconds, and ANY change
   to that signature fires a debounced upsert of the ENTIRE user_data blob —
   projects, milestones, every journal, the lot. Writing the week after every
   house would mean roughly two hundred whole-account uploads per week, on
   cellular, with a permanent "Saving…" indicator. One upload per in-game day
   is correct.

   And resuming a half-finished Tuesday on a DIFFERENT PHONE is not a feature
   anyone has ever wanted. The mid-day snapshot is deliberately device-local.
   Hoops already draws this exact line (`hoops_records` registered, its active
   game not).

   ── THE FILL-IF-MISSING TRAP ─────────────────────────────────────────────
   `restoreFeatureStores` only writes a key that is ABSENT locally. So if this
   module created `super_knock_v1` on mount, a player opening the game on a
   second device before the cloud pull landed would have an empty week win —
   permanently discarding the real one. Hence `save()` refuses to write an
   untouched week: the key does not exist until there is something to lose.
   `heatStore` has the identical hazard today and has not been bitten yet.
   ════════════════════════════════════════════════════════════════════════ */
import { createWeek, packHouses, unpackHouses, STRIKES_TO_FIRED } from "./skWeek.js";
import { HOUSE_COUNT } from "./skTuning.js";

export const SK_KEY = "super_knock_v1";
export const SK_ACTIVE_KEY = "sk_active_v1";

const read = (k) => {
  try { return JSON.parse(localStorage.getItem(k) || "null"); } catch { return null; }
};
const write = (k, v) => {
  try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* private mode */ }
};
const drop = (k) => {
  try { localStorage.removeItem(k); } catch { /* private mode */ }
};

/* ── the week ─────────────────────────────────────────────────────────────*/

/** Load the saved week, or a fresh one. Never writes. */
export function loadWeek() {
  const raw = read(SK_KEY);
  if (!raw || raw.v !== 1) return createWeek({ street: 1, seed: freshSeed() });
  const w = createWeek({ street: raw.street || 1, seed: raw.seed || 1 });
  w.day = Math.max(0, Math.min(6, raw.day | 0));
  w.strikes = raw.strikes | 0;
  w.banked = raw.banked | 0;
  w.cash = raw.cash | 0;
  w.score = raw.score | 0;
  w.weekHeat = Number(raw.weekHeat) || 0;
  w.fired = !!raw.fired;
  w.won = !!raw.won;
  w.houses = unpackHouses(raw.h);
  w.quotaMet = unpackBits(raw.q, 7);
  w.salesByDay = Array.isArray(raw.s) ? raw.s.slice(0, 7) : [0, 0, 0, 0, 0, 0, 0];
  while (w.salesByDay.length < 7) w.salesByDay.push(0);
  w.ruts = Array.isArray(raw.r) ? raw.r : [];
  w.best = raw.best || null;
  return w;
}

/** A week nobody has played yet must not create the key. See the header. */
function untouched(week) {
  return week.day === 0
    && week.score === 0
    && week.strikes === 0
    && !week.salesByDay.some(Boolean)
    && !week.houses.some((h) => h.grudge || h.sold || h.dead || h.plywood || h.tracked);
}

export function saveWeek(week) {
  if (untouched(week)) return week;
  write(SK_KEY, {
    v: 1,
    street: week.street,
    seed: week.seed,
    day: week.day,
    strikes: week.strikes,
    banked: week.banked,
    cash: week.cash,
    score: week.score,
    weekHeat: Math.round(week.weekHeat * 10) / 10,
    fired: week.fired,
    won: week.won,
    h: packHouses(week.houses),
    q: packBits(week.quotaMet),
    s: week.salesByDay,
    r: (week.ruts || []).slice(0, HOUSE_COUNT),
    best: week.best || undefined,
  });
  return week;
}

/** Start over. Keeps the best-ever record and the street you unlocked. */
export function resetWeek(week) {
  const fresh = createWeek({ street: (week && week.street) || 1, seed: freshSeed() });
  fresh.best = (week && week.best) || null;
  saveWeek(fresh);
  clearActive();
  return fresh;
}

export function nextStreet(week) {
  const fresh = createWeek({ street: Math.min(3, (week.street || 1) + 1), seed: freshSeed() });
  fresh.best = week.best || null;
  saveWeek(fresh);
  clearActive();
  return fresh;
}

/* ── the mid-day snapshot ─────────────────────────────────────────────────
   RESUME LAW, and it is three different answers for three different phases:

     RIDE   — ATOMIC. Never resumed. Restoring position, velocity, camera,
              hangers in flight and the cart is ten times the work of just
              replaying it, so interrupting a ride VOIDS it: replay free, no
              life lost, no clock burned. Largest complexity saving in the
              whole build, and it costs the player nothing.
     BLOCK  — resumed. Snapshot after every house resolves.
     FIGHT  — resumed, and this is the one that matters. Losing a forty-second
              fight to a text message is how you lose a player, and the
              clock's own banks-and-pauses rule already commits us to it.
              It is five numbers. */
export function loadActive() {
  const a = read(SK_ACTIVE_KEY);
  if (!a || a.v !== 1) return null;
  if (a.phase === "ride") return null; // atomic — always replayed
  return a;
}

export function saveActive(snap) {
  if (!snap || snap.phase === "ride") { clearActive(); return; }
  write(SK_ACTIVE_KEY, { v: 1, ...snap });
}

export function clearActive() { drop(SK_ACTIVE_KEY); }

/* ── helpers ──────────────────────────────────────────────────────────────*/

export function freshSeed() {
  try { return (Date.now() % 100000) + Math.floor(Math.random() * 997); } catch { return 1234; }
}

function packBits(arr) {
  let n = 0;
  (arr || []).forEach((b, i) => { if (b) n |= 1 << i; });
  return n;
}
function unpackBits(n, len) {
  const out = [];
  for (let i = 0; i < len; i++) out.push((((n | 0) >> i) & 1) === 1);
  return out;
}

/** Size of the saved blob, for the self-test's budget assertion. */
export function saveSize(week) {
  return JSON.stringify({
    v: 1, street: week.street, seed: week.seed, day: week.day, strikes: week.strikes,
    banked: week.banked, cash: week.cash, score: week.score, weekHeat: week.weekHeat,
    fired: week.fired, won: week.won, h: packHouses(week.houses),
    q: packBits(week.quotaMet), s: week.salesByDay, r: (week.ruts || []).slice(0, HOUSE_COUNT),
  }).length;
}

export { STRIKES_TO_FIRED };
export default { loadWeek, saveWeek, resetWeek, loadActive, saveActive, clearActive };
