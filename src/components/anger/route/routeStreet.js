/* ════════════════════════════════════════════════════════════════════════
   THE ROUTE — ONE STREET, shared by the flyer run and the door work.

   The Door and the flyer run were built as two games and are now one. This
   module is the seam: a single street, in a single coordinate system, on
   which five of the twenty houses are the named Door levels and the other
   fifteen are anonymous.

   ── WHY FIVE OF TWENTY ───────────────────────────────────────────────────
   That is Paperboy's own subscriber / non-subscriber split, and it is what
   makes the flyer run a game rather than a chore. Fifteen fillers are worth
   points, heat and breakage; five are worth a door you will actually have to
   knock down. You throw at all twenty and only five of them remember.

   ── WHY METRES, AND WHY THERE IS NO CONVERSION ───────────────────────────
   The Door's old street used `WORLD_W = 2480` with `WALK_SPEED = 300`, which
   would put a 1.4 m/s walker across the whole block in eight seconds. Those
   were always PIXELS. So the five houses are not converted — they are
   RE-AUTHORED onto the generated street by slot index, at the slots that
   preserve their original proportional spacing:

       first    260/2480 = .105  →  slot 2
       steele   660/2480 = .266  →  slot 5
       persist 1060/2480 = .427  →  slot 8
       steel   1700/2480 = .685  →  slot 13
       callback 2180/2480 = .879 →  slot 17

   So the block still *feels* like the block, and every threshold in the game
   is authored in metres exactly once.

   ── WHY A FIXED SEED ─────────────────────────────────────────────────────
   This is ONE street and you are supposed to learn it. A reseeded street
   would make the whole point of a route — knowing which house has the boat,
   which lawn you cut across on Monday — impossible.
   ════════════════════════════════════════════════════════════════════════ */
import { buildStreet } from "./skStreet.js";
import { DOOR_LADDER, getDoorLevel } from "../doorLevels.js";

/** The street never changes. Learn it. */
export const ROUTE_SEED = 20260726;

/** slot index → Door level slug. The only binding between the two halves. */
export const DOOR_SLOTS = Object.freeze({
  2: "first",
  5: "steele",
  8: "persist",
  13: "steel",
  17: "callback",
});

/** slug → slot index. Built from the above so they can never disagree. */
export const SLOT_OF = Object.freeze(
  Object.fromEntries(Object.entries(DOOR_SLOTS).map(([i, slug]) => [slug, Number(i)]))
);

/** The gated community sits just before the gated house. */
export const GATED_SLUG = "steel";
export const GATE_LEAD_M = 30; // metres of warning before the boom

let _street = null;

/**
 * The route. Built once per session and cached — `buildStreet` is
 * deterministic, so this is a pure memo, not hidden state.
 */
export function routeStreet() {
  if (_street) return _street;
  const s = buildStreet({ street: 1, seed: ROUTE_SEED });

  /* Stamp the five Door levels onto their slots. `kind` is what everything
     downstream branches on — the ride scores both, but only a "door" house
     can be pulled up to, and only a "door" house remembers anything. */
  s.houses.forEach((h) => {
    const slug = DOOR_SLOTS[h.idx] || null;
    h.slug = slug;
    h.kind = slug ? "door" : "filler";
    if (slug) {
      const lv = getDoorLevel(slug);
      h.title = lv ? lv.title : slug;
      h.when = lv ? lv.when : "";
      h.accent = lv ? lv.accent : "#FF3B5C";
      h.number = lv ? doorNumberFor(slug) : h.number;
    }
  });

  s.gateY = (s.houses.find((h) => h.slug === GATED_SLUG)?.y ?? 0) - GATE_LEAD_M;
  s.doors = s.houses.filter((h) => h.kind === "door");
  _street = s;
  return s;
}

/* The house numbers The Door has always used on its plates. Kept verbatim so
   a returning player recognises #12 and #7 rather than being handed new ones. */
const DOOR_NUMBERS = { first: "12", steele: "9", persist: "7", steel: "7", callback: "3" };
const doorNumberFor = (slug) => DOOR_NUMBERS[slug] || "0";

/** Test hook: drop the memo so determinism can actually be asserted. */
export function _resetRouteStreetForTest() { _street = null; }

/** The house carrying a given Door level, or null. */
export function houseForSlug(slug) {
  return routeStreet().houses.find((h) => h.slug === slug) || null;
}

/**
 * Translate a ride's per-INDEX lead table into a per-SLUG one.
 *
 * The ride knows nothing about Door levels — it resolves throws against house
 * indices, which is correct and keeps `skThrow.js` free of any campaign
 * coupling. This is the only place the two vocabularies meet, and fillers are
 * dropped here: their leads were only ever worth points.
 */
export function leadsBySlug(rideLeads = {}) {
  const out = {};
  Object.entries(rideLeads).forEach(([idx, lead]) => {
    const slug = DOOR_SLOTS[Number(idx)];
    if (slug) out[slug] = lead;
  });
  return out;
}

/** How many of the five doors the flyer run actually reached. */
export function doorsCovered(rideLeads = {}) {
  return Object.keys(leadsBySlug(rideLeads)).length;
}

/** The ladder, in order, annotated with its house. For boards and the HUD. */
export function routeLadder() {
  const s = routeStreet();
  return DOOR_LADDER.map((lv) => ({
    level: lv,
    house: s.houses.find((h) => h.slug === lv.id) || null,
  }));
}

export default routeStreet;
