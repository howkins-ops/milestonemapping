/* ════════════════════════════════════════════════════════════════════════
   SUPER KNOCK — THE WEEK. Pure rules, no React, no storage, no clock.

   One street, seven days. What makes it a game rather than seven runs is
   that Wednesday is YOUR Monday coming back.

   ── THE KEYSTONE ─────────────────────────────────────────────────────────
   On Wednesday, a NO SOLICITING sign appears on every house you angered on
   Monday or Tuesday. If that does not read as a consequence of the player's
   own choices, the entire persistence layer is decoration — so the two
   things that anger a house are the two things the player most wants to do:
   put a hanger through the window (1000 points, ×3 payout) and cut across
   the lawn (the shortest line to the door, and the only lane that reaches a
   window at all).

   Every reward in phase 1 is a debt in phase 2. That is the whole week.

   ── FAILURE ──────────────────────────────────────────────────────────────
   Missing quota costs a STRIKE and the day, never the week. FIRED happens at
   three strikes. A variance-heavy Sunday that deletes an hour of play is how
   a game gets uninstalled, and "restart the week" on a missed final-day
   quota is exactly that.

     lives   — per DAY, spent on crashes during the ride
     strikes — per WEEK, spent on missed quotas. Three and you're out.
   ════════════════════════════════════════════════════════════════════════ */
import {
  QUOTA, DAYS, GRUDGE, GRUDGE_GAIN, LIVES_PER_DAY, SURPLUS_BANK_CAP,
  HOUSE_COUNT, LEAD, HEAT, STREETS, CLOCK_COST, DAY_REAL_S,
  TRAVEL_BASE_S, TRAVEL_PER_HOUSE_S, TRAVEL_MAX_S, STANCE, WINDOWS,
} from "./skTuning.js";

export const STRIKES_TO_FIRED = 3;
export const WEDNESDAY = 2;
export const SUNDAY = 6;
/** The house at the end of the street. Locked until Sunday. */
export const FINAL_HOUSE = HOUSE_COUNT - 1;

/* ── house records ────────────────────────────────────────────────────────*/

export const emptyHouse = () => ({
  grudge: 0,
  sold: false,
  plywood: false,
  noSolicit: false,
  tracked: false,
  dead: false, // a hanger in his bushes. Gone for the WEEK (see reviveOk).
  mailed: false,
  revived: false,
});

export function createWeek({ street = 1, seed = 1 } = {}) {
  const houses = [];
  for (let i = 0; i < HOUSE_COUNT; i++) houses.push(emptyHouse());
  return {
    v: 1,
    street,
    seed,
    day: 0,
    houses,
    strikes: 0,
    banked: 0,
    cash: 0,
    score: 0,
    weekHeat: 0,
    quotaMet: [false, false, false, false, false, false, false],
    salesByDay: [0, 0, 0, 0, 0, 0, 0],
    fired: false,
    won: false,
  };
}

/* ── grudge ───────────────────────────────────────────────────────────────*/

export function grudgeTier(n) {
  let t = GRUDGE[0];
  for (const g of GRUDGE) if (n >= g.at) t = g;
  return t;
}

export function addGrudge(week, idx, n) {
  const h = week.houses[idx];
  if (!h) return;
  h.grudge = Math.min(20, h.grudge + n);
}

/* ── the derived state of one house, on one day ───────────────────────────
   Everything the ride, the block strip, the porch and the fight read comes
   through HERE. One function, so the three renderers cannot disagree about
   whether a door has plywood on it. */
export function houseState(week, idx, day = week.day, baseNoSolicit = false) {
  const h = week.houses[idx] || emptyHouse();
  const tier = grudgeTier(h.grudge);
  const cfg = DAYS[Math.max(0, Math.min(6, day))];

  /* THE KEYSTONE. From Wednesday on, anger becomes architecture. */
  const signed = baseNoSolicit || h.noSolicit || (day >= WEDNESDAY && h.grudge >= GRUDGE[1].at);

  /* A neighbour's yard sign is the best advertising you have. */
  const warmedByNeighbour = [idx - 1, idx + 1].some(
    (n) => n >= 0 && n < HOUSE_COUNT && week.houses[n] && week.houses[n].sold
  );

  const locked = idx === FINAL_HOUSE && day < SUNDAY;

  let openMul = tier.openMul;
  if (signed) openMul *= 0.6;
  if (warmedByNeighbour) openMul *= 1.35;
  if (cfg.openMul) openMul *= cfg.openMul;

  return {
    ...h,
    tier: tier.key,
    tierLabel: tier.label,
    noSolicit: signed,
    warmedByNeighbour,
    locked,
    openMul: Math.max(0, Math.min(2, openMul)),
    /* A house you already closed is not a house you knock on again. */
    workable: !locked && !h.sold && !h.dead && openMul > 0,
  };
}

/* ── folding a ride into the week ─────────────────────────────────────────*/

/**
 * Everything phase 1 did to the street, applied. Returns the per-house lead
 * table phase 2 will actually work from — which is separate from the week
 * record because leads are for TODAY and grudges are for the week.
 */
export function applyRide(week, result, day = week.day) {
  const leads = {};
  const cfg = STREETS[Math.max(0, Math.min(2, week.street - 1))];

  Object.entries(result.grudge || {}).forEach(([idx, n]) => addGrudge(week, Number(idx), n));
  (result.ruts || []).forEach((r) => { const h = week.houses[r.h]; if (h) h.tracked = true; });

  Object.entries(result.leads || {}).forEach(([k, lead]) => {
    const idx = Number(k);
    const h = week.houses[idx];
    if (!h) return;

    if (lead === "dead") {
      h.dead = true;
      return;
    }
    if (lead === "hostile") {
      h.plywood = true;
      /* Boarded glass cannot be broken twice — the 1000-point play is a
         once-per-house decision, not a farm. */
    }
    /* THE MERCY RESET, and street 1 only. A hook on a house you killed
       earlier in the week brings it back exactly once. It turns a Monday
       mistake into a Thursday goal instead of a dead slot you stare at for
       six days. Streets 2 and 3 keep the bible's harder rule: dead is dead. */
    if (h.dead) {
      if (cfg.mercy && lead === "hot" && !h.revived) { h.dead = false; h.revived = true; }
      else return;
    }
    leads[idx] = lead;
  });

  week.score += result.score || 0;
  week.weekHeat = Math.min(HEAT.max, week.weekHeat + (result.heat || 0));
  return leads;
}

/* ── working a door ───────────────────────────────────────────────────────*/

export const CLOSE = { sale: "sale", callback: "callback", hostile: "hostile", dead: "dead", walkaway: "walkaway" };

export function applyDoor(week, idx, outcome, day = week.day) {
  const h = week.houses[idx];
  if (!h) return week;
  if (outcome === CLOSE.sale) {
    h.sold = true;
    week.salesByDay[day] += 1;
    /* A clean close is the intended way DOWN on heat. It is the only one. */
    week.weekHeat = Math.max(0, week.weekHeat - HEAT.coolPerCleanDay * 0.5);
  } else if (outcome === CLOSE.hostile) {
    addGrudge(week, idx, GRUDGE_GAIN.crowd);
  } else if (outcome === CLOSE.dead) {
    h.dead = true;
  }
  return week;
}

/* ── travel ───────────────────────────────────────────────────────────────
   Working a near cluster is cheaper than criss-crossing the street. This is
   the routing decision the strip map exists to preserve — without it, THE
   BLOCK would just be a menu. */
export function travelCost(fromIdx, toIdx) {
  if (fromIdx == null) return TRAVEL_BASE_S;
  const gap = Math.abs(toIdx - fromIdx);
  return Math.min(TRAVEL_MAX_S, TRAVEL_BASE_S + gap * TRAVEL_PER_HOUSE_S);
}

export const doorClockCost = (outcome) => CLOCK_COST[outcome] ?? CLOCK_COST.walkaway;

/* ── ending a day ─────────────────────────────────────────────────────────*/

export function quotaFor(day) {
  return QUOTA[Math.max(0, Math.min(6, day))];
}

/**
 * Close the day out. Pure in spirit — mutates `week` and returns a report the
 * results screen renders directly.
 */
export function endDay(week, day = week.day) {
  const sales = week.salesByDay[day];
  const need = quotaFor(day);
  const effective = sales + week.banked;
  const met = effective >= need;

  week.quotaMet[day] = met;
  if (met) {
    /* Surplus banks, capped. A monster Friday should help Saturday a little
       and never trivialise it. */
    week.banked = Math.min(SURPLUS_BANK_CAP, effective - need);
  } else {
    week.banked = 0;
    week.strikes += 1;
    if (week.strikes >= STRIKES_TO_FIRED) week.fired = true;
  }

  /* A day with nothing broken is the cheapest way back to clean. */
  const brokeSomething = week.houses.some((h) => h.plywood || h.tracked);
  if (!brokeSomething) week.weekHeat = Math.max(0, week.weekHeat - HEAT.coolPerCleanDay);

  const last = day >= SUNDAY;
  if (last && !week.fired) week.won = week.quotaMet.filter(Boolean).length >= 5;

  const report = {
    day,
    sales,
    banked: week.banked,
    need,
    met,
    strikes: week.strikes,
    fired: week.fired,
    won: week.won,
    last,
    score: week.score,
    weekHeat: week.weekHeat,
    signsComingTomorrow: day === WEDNESDAY - 1
      ? week.houses.filter((h) => h.grudge >= GRUDGE[1].at && !h.noSolicit).length
      : 0,
  };

  if (!last && !week.fired) week.day = day + 1;
  return report;
}

/** Start-of-day housekeeping. Leads do NOT carry — you re-run the street. */
export function startDay(week, day = week.day) {
  const cfg = DAYS[Math.max(0, Math.min(6, day))];
  /* Wednesday's signs are STAMPED, not merely derived, so the player can see
     them on the block strip and in the results even after the grudge that
     caused them is paid down. Anger leaves paperwork. */
  if (day >= WEDNESDAY) {
    week.houses.forEach((h) => { if (h.grudge >= GRUDGE[1].at) h.noSolicit = true; });
  }
  return {
    day,
    cfg,
    lives: LIVES_PER_DAY,
    quota: quotaFor(day),
    banked: week.banked,
    cops: !!cfg.cops || (STREETS[week.street - 1] || {}).copsFromMonday === true,
    copPressure: cfg.cops ? week.weekHeat : 0,
  };
}

/* ── the gate the self-test asserts ───────────────────────────────────────
   If a headless model of a competent player cannot clear a quota, no real
   player will either. This exists so that stays true after every tuning
   change, not just today. */
export function expectedSales(day, { closeRate = 0.62, perHouseS = 46 } = {}) {
  const houses = DAY_REAL_S / perHouseS;
  const openable = houses * (WINDOWS.reduce((a, w) => a + w.openMul * w.realS, 0) / DAY_REAL_S);
  return openable * closeRate;
}

/* ── packing, for a save file under 400 bytes ─────────────────────────────
   `useAppData` stringifies every registered key every 20 seconds and any
   change fires a debounced upsert of the ENTIRE user_data blob — projects,
   milestones, journals, everything. Twenty house objects would be ~3.5KB of
   that; twenty packed pairs are forty characters. */
const A = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
const FLAG = { sold: 1, plywood: 2, noSolicit: 4, tracked: 8, dead: 16, mailed: 32, revived: 64 };

export function packHouses(houses) {
  let out = "";
  for (let i = 0; i < HOUSE_COUNT; i++) {
    const h = houses[i] || emptyHouse();
    let f = 0;
    for (const k in FLAG) if (h[k]) f |= FLAG[k];
    const val = Math.min(15, h.grudge | 0) * 128 + f;
    out += A[(val >> 6) & 63] + A[val & 63];
  }
  return out;
}

export function unpackHouses(str) {
  const houses = [];
  for (let i = 0; i < HOUSE_COUNT; i++) {
    const hi = A.indexOf(str ? str[i * 2] : "A");
    const lo = A.indexOf(str ? str[i * 2 + 1] : "A");
    const val = (hi < 0 ? 0 : hi) * 64 + (lo < 0 ? 0 : lo);
    const h = emptyHouse();
    h.grudge = (val / 128) | 0;
    const f = val % 128;
    for (const k in FLAG) h[k] = (f & FLAG[k]) !== 0;
    houses.push(h);
  }
  return houses;
}

export default { createWeek, houseState, applyRide, applyDoor, endDay, startDay, packHouses, unpackHouses };
