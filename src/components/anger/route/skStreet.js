/* ════════════════════════════════════════════════════════════════════════
   THE ROUTE — THE STREET. Generated, never authored.

   Twenty houses, alternating sides, 40m apart, plus a kerbside mailbox each.
   Everything about a house — its paint, its props, which objections its owner
   throws — is DERIVED FROM ONE SEED. Nothing about a house is ever persisted:
   the save file carries `{street, seed}` and twenty packed bytes of what the
   player DID, and this file rebuilds the rest.

   ── THE ONE RULE THAT HOLDS THE GAME TOGETHER ────────────────────────────
   `targetBoxes(house)` is exported from HERE and from nowhere else.

   The ride canvas, the block strip and the SVG porch all draw the same house
   at three different scales on three different days. The game's best idea —
   "the hanger you threw on Monday IS the lead state you read on Tuesday" —
   dies the instant those three disagree about where the handle is. One
   function, three consumers, asserted identical in the self-test.

   ── AND THE ONE THAT KEEPS IT DEBUGGABLE ─────────────────────────────────
   The facade is NOT mirrored on the right-hand side. Both sides lay the door,
   window and mat out in the same along-street order; only the DRAWING flips
   to face the road. Mirroring the geometry would mean the collision boxes and
   the art could drift apart on exactly one side of the street, which is the
   kind of bug that survives three play sessions before anyone believes it.
   ════════════════════════════════════════════════════════════════════════ */
import {
  FACADE, MAILBOX, HOUSE_COUNT, HOUSE_SPACING_M, STREET_START_M,
  STREET_LENGTH_M, FACADE_L_X, FACADE_R_X,
} from "./skTuning.js";

/* ── the PRNG ─────────────────────────────────────────────────────────────
   Same LCG as chaseSim.js. Deterministic on purpose: a bug you cannot
   reproduce on a fixed seed is a bug you cannot fix. */
export function rng(seed) {
  let s = (seed | 0) || 1;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}
const pick = (r, arr) => arr[Math.floor(r() * arr.length) % arr.length];
const int = (r, lo, hi) => lo + Math.floor(r() * (hi - lo + 1));

/* ── identity ─────────────────────────────────────────────────────────────
   People recognise the red door and the boat. They do not recognise trim.
   6 door colours × 12 props uniquely names twenty houses at a glance, at any
   scale, in any renderer — which is the cheap hedge against the three of them
   ever drifting apart. */
export const DOOR_COLORS = [
  { key: "red", hex: "#C6362F", name: "the red door" },
  { key: "teal", hex: "#2E7D77", name: "the teal door" },
  { key: "mustard", hex: "#C9922B", name: "the yellow door" },
  { key: "navy", hex: "#2B4570", name: "the navy door" },
  { key: "green", hex: "#3E6B3A", name: "the green door" },
  { key: "plum", hex: "#6A3D5B", name: "the purple door" },
];

export const SIDINGS = ["#8E8377", "#A89880", "#6F7A78", "#9A7F6E", "#7E8896", "#8A7A86"];
export const ROOFS = ["gable", "hip", "flat", "gambrel"];

/* ── props ────────────────────────────────────────────────────────────────
   A prop is never decoration. Every one of them is a TELL: it is how you know
   what he is going to throw at you before you knock, which is the only thing
   that makes locking your deck at the knock a decision instead of a dice roll.

   Multiple props mapping to one family is deliberate — a good reader gets the
   card from whichever they spot first. Redundancy is the difficulty dial. */
export const PROPS = {
  minivan: { label: "MINIVAN", family: "deferral", size: [2.2, 1.4], big: true },
  hoop: { label: "BASKETBALL HOOP", family: "deferral", size: [1.2, 1.2] },
  toys: { label: "TOYS ON THE LAWN", family: "deferral", size: [1.0, 0.6] },
  dogbowl: { label: "DOG BOWL", family: "hostile", size: [0.5, 0.4] },
  chain: { label: "CHAIN ON A STAKE", family: "hostile", size: [0.6, 0.5] },
  boat: { label: "BOAT ON A TRAILER", family: "ego", size: [3.0, 1.2], big: true },
  flag: { label: "FLAGPOLE", family: "ego", size: [0.4, 2.6] },
  workvan: { label: "CONTRACTOR VAN", family: "ego", size: [2.4, 1.5], big: true },
  solar: { label: "SOLAR PANELS", family: "incumbent", size: [2.0, 0.3] },
  seczign: { label: "SECURITY SIGN", family: "incumbent", size: [0.4, 0.5] },
  weeds: { label: "OVERGROWN LAWN", family: "reflex", size: [3.0, 0.4] },
  boxes: { label: "MOVING BOXES", family: "reflex", size: [1.2, 0.9] },
};
export const PROP_KEYS = Object.keys(PROPS);
export const FAMILIES = ["reflex", "deferral", "incumbent", "ego", "hostile"];

/* ── the facade schema ────────────────────────────────────────────────────
   Fifteen numbers and four colours, in facade-local metres. This object is
   the contract between skDraw (canvas, two scales) and skArt (SVG, full
   fidelity). Neither is allowed to invent geometry. */
export function facadeSchema(r) {
  const door = pick(r, DOOR_COLORS);
  return {
    doorColor: door.hex,
    doorKey: door.key,
    doorName: door.name,
    siding: pick(r, SIDINGS),
    trim: r() < 0.5 ? "#E8E2D6" : "#3A3630",
    roof: pick(r, ROOFS),
    roofHue: 0.06 + r() * 0.08,
    porchLight: r() < 0.7,
    steps: int(r, 1, 3),
    frontageM: FACADE.frontageM,
    /* Geometry is IDENTICAL on every house, deliberately. The skill you learn
       on house 1 has to transfer to house 20, and a door that wanders 40cm
       per house would make every hard-won hook feel arbitrary. Houses differ
       by paint and by props, never by where the handle is. */
    boxes: FACADE.boxes,
  };
}

/* ── target boxes, in WORLD space ─────────────────────────────────────────
   THE single source of truth. Returns boxes with `y0..y1` along the street
   and `z0..z1` up from the ground, plus the facade plane's x.

   Order matters: first match wins, so the small high-value boxes are listed
   before the big forgiving ones that contain them. */
export function targetBoxes(house) {
  const b = house.facade.boxes;
  const fx = house.side === "L" ? FACADE_L_X : FACADE_R_X;
  const mk = (key, box) => ({
    key,
    y0: house.y + box.y,
    y1: house.y + box.y + box.w,
    z0: box.z,
    z1: box.z + box.h,
    pts: box.pts,
    lead: box.lead,
    catch: !!box.catch,
    smash: !!box.smash,
    maxD: box.maxD ?? Infinity, // the window's "you have to be on his grass" rule
    facadeX: fx,
    houseIdx: house.idx,
  });
  return [mk("handle", b.handle), mk("window", b.window), mk("door", b.door), mk("mat", b.mat)];
}

/** The kerbside mailbox as a world-space box, on the same contract.
    Sits at the house's LEADING edge — several metres up-street of the door
    column — so a throw timed for the handle is never accidentally in its
    y-window on the way past. Height does the rest (see MAILBOX in skTuning). */
export function mailboxBox(house) {
  const x = house.side === "L" ? MAILBOX.offsetX : FACADE_R_X - MAILBOX.offsetX;
  return {
    key: "mailbox",
    y0: house.y + MAILBOX.offsetY,
    y1: house.y + MAILBOX.offsetY + MAILBOX.w,
    z0: MAILBOX.z,
    z1: MAILBOX.z + MAILBOX.h,
    pts: MAILBOX.pts,
    lead: null,
    facadeX: x,
    houseIdx: house.idx,
  };
}

/* ── generation ───────────────────────────────────────────────────────────*/

function makeHouse(idx, r, cfg) {
  const side = idx % 2 === 0 ? "L" : "R";
  const y = STREET_START_M + idx * HOUSE_SPACING_M;
  const facade = facadeSchema(r);

  /* 2–3 props. The FIRST one is the identity prop — the big, silhouette-
     legible thing you name the house by ("the one with the boat"). */
  const bigs = PROP_KEYS.filter((k) => PROPS[k].big);
  const smalls = PROP_KEYS.filter((k) => !PROPS[k].big);
  const props = [];
  props.push(r() < 0.55 ? pick(r, bigs) : pick(r, smalls));
  const want = 1 + int(r, 1, 2); // 2 or 3, and we KEEP DRAWING until we have them
  let guard = 0;
  while (props.length < want && guard++ < 40) {
    const p = pick(r, smalls);
    if (!props.includes(p)) props.push(p);
  }

  /* The props ARE the objection weighting. Read the yard, know the fight. */
  const weights = {};
  FAMILIES.forEach((f) => { weights[f] = 1; });
  props.forEach((p) => { weights[PROPS[p].family] += 3; });
  const families = [...FAMILIES].sort((a, c) => weights[c] - weights[a]);

  /* Yard scatter: purely cosmetic clutter so 420px of lawn per house isn't
     empty. Positions are facade-local so they scroll with the house. */
  const scatter = [];
  const nScatter = int(r, 2, 4);
  for (let i = 0; i < nScatter; i++) {
    scatter.push({ y: 0.6 + r() * (FACADE.frontageM - 1.2), x: 0.9 + r() * 3.4, k: r() < 0.5 ? "bush" : "tree", s: 0.7 + r() * 0.7 });
  }

  return {
    idx,
    side,
    y,
    facade,
    props,
    families,
    weights,
    scatter,
    number: 100 + idx * 2 + (side === "R" ? 1 : 0),
    noSolicit: false, // assigned below, needs the whole street
    seedOffset: int(r, 0, 9999),
  };
}

/**
 * Build a street. Pure, deterministic, and the only thing the save file needs
 * to reproduce twenty houses is `{street, seed}`.
 */
export function buildStreet({ street = 1, seed = 1 } = {}) {
  /* Six of the twenty put up a NO SOLICITING sign. There is no longer a
     street-tier ladder to scale that with — this is ONE street, and it is
     the same one every time. */
  const cfg = { noSolicit: 6 };
  const r = rng(seed * 7919 + street * 104729);
  const houses = [];
  for (let i = 0; i < HOUSE_COUNT; i++) houses.push(makeHouse(i, r, cfg));

  /* NO SOLICITING signs. Street 1 has 6, street 3 has 14 — the non-subscriber
     count is the difficulty ladder, exactly as the original. Spread them so
     the player never gets a dead run of four in a row. */
  const order = houses.map((h) => h.idx).sort(() => r() - 0.5);
  order.slice(0, cfg.noSolicit).forEach((i) => { houses[i].noSolicit = true; });

  return { street, seed, cfg, houses, lengthM: STREET_LENGTH_M };
}

/* ── lookups ──────────────────────────────────────────────────────────────*/

/**
 * Which house does this point on this side belong to?
 *
 * `pad` widens the frontage into the house's front yard: a hanger that lands
 * within `pad` metres of the building is on HIS LAWN and kills that lead, and
 * anything further out is IN THE HEDGE — wasted, but harmless. Two different
 * failures deserve two different consequences: nailing a house's yard is your
 * fault, and a throw that lands forty metres down the block is not a reason
 * to silently delete a door you were never near.
 *
 * `null` = the hedge.
 */
export function houseAt(street, worldY, side, pad = 0) {
  for (let i = 0; i < street.houses.length; i++) {
    const h = street.houses[i];
    if (h.side !== side) continue;
    if (worldY >= h.y - pad && worldY <= h.y + h.facade.frontageM + pad) return h;
  }
  return null;
}

/** The next house ahead of `worldY` on either side — for the aim ghost and HUD. */
export function nextHouse(street, worldY) {
  let best = null;
  for (const h of street.houses) {
    if (h.y + h.facade.frontageM < worldY) continue;
    if (!best || h.y < best.y) best = h;
  }
  return best;
}

export function houseById(street, idx) {
  return street.houses.find((h) => h.idx === idx) || null;
}

/** Human name for a house — how the player actually refers to it. */
export function houseLabel(house) {
  const p = house.props[0];
  return `${house.number} · ${house.facade.doorName}`;
}

export default buildStreet;
