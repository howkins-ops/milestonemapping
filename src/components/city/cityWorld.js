import { QUARTER_META } from "./cityDistricts.js";
import { TIER_HEIGHT_PCT, layoutRow } from "./world/worldConfig.js";

// ════════════════════════════════════════════════════════════════════════
// MAPQUEST CITY — street geography + the story order (ACT 1 · the training)
// This file owns WHERE everything stands on the walkable street. The
// district registry (cityDistricts.js) stays the single source of truth
// for WHAT a district is; its old banner `position` field is simply
// unused by the walkable scene.
//
// The street runs west → east in STORY_ORDER, so a new citizen LIGHTS the
// city left to right and the walk itself is the tutorial progress bar:
//   Gates → Plaza (The Guide) → THE GRID → NEON HEIGHTS → THE ARCHIVE ROW
//   → THE UNDERGLOW → THE COMMONS → THE TERMINUS (Vault) → THE SPIRE
// GATE 2: the Alchemist Spire stands SEALED at the far east until every
// training district is lit (Guide lesson heard + one real action).
// ════════════════════════════════════════════════════════════════════════

// The journey through the city — doors light in this order; the Spire last.
export const STORY_ORDER = [
  "daily-nexus", // first real-life win: today's Top Five
  "war-rooms", // map the campaign
  "war-council", // close the weekly loop
  "identity-forge", // who is doing this
  "vision-tower", // where it's going
  "the-academy", // upgrade perception (5 Shifts)
  "formula-athenaeum", // the method, now that you've lived one loop
  "observatory", // the proof it's repeatable
  "pressure-forge", // the descent begins — anger into fuel
  "shadow-sanctum", // the deeper descent
  "cup-springs", // replenish after the dark
  "blaze-lab", // energy engineering capstone
  "guild-quarter", // take it public — witnessed fire
  "hall-of-champions", // your name on the wall
  "the-vault", // the terminus — collect what you earned
  "alchemist-spire", // GATE 2 — the sealed tower; the whole city trains you for it
];

/* ── Street constants (tune here) ─────────────────────────────────────── */

const BUILDING_W = 150;
const SPIRE_W = 210;
const GAP = 48;
const ARCH_W = 132;
const ARCH_GAP = 44;
const ZONE_GAP = 72;

const WIDTH_BY_ID = { "alchemist-spire": SPIRE_W };

// Street zones west → east. Building order inside each zone follows
// STORY_ORDER so the story walk never doubles back — and the sealed Spire
// towers at the very end of the road, past the Terminus.
const STREET_ZONES = [
  {
    label: "THE GRID",
    accent: QUARTER_META.execution.accent,
    ids: ["daily-nexus", "war-rooms", "war-council"],
  },
  {
    label: "NEON HEIGHTS",
    accent: QUARTER_META.core.accent,
    ids: ["identity-forge", "vision-tower", "the-academy"],
  },
  {
    label: "THE ARCHIVE ROW",
    accent: QUARTER_META.archive.accent,
    ids: ["formula-athenaeum", "observatory"],
  },
  {
    label: "THE UNDERGLOW",
    accent: QUARTER_META.inner.accent,
    ids: ["pressure-forge", "shadow-sanctum", "cup-springs", "blaze-lab"],
  },
  {
    label: "THE COMMONS",
    accent: QUARTER_META.commons.accent,
    ids: ["guild-quarter", "hall-of-champions"],
  },
  { label: "THE TERMINUS", accent: "#FACC15", ids: ["the-vault"], gapBefore: 150 },
  {
    label: "THE SPIRE",
    accent: QUARTER_META.quest.accent,
    ids: ["alchemist-spire"],
    gapBefore: 190,
  },
];

/* ── Backdrop silhouettes (deterministic, % of their parallax layer) ───── */

const FAR = [
  { x: 0, w: 42, h: 30 }, { x: 4, w: 30, h: 42 }, { x: 8, w: 36, h: 26 },
  { x: 12, w: 30, h: 48 }, { x: 16, w: 44, h: 34 }, { x: 21, w: 30, h: 54 },
  { x: 25, w: 38, h: 38 }, { x: 29, w: 30, h: 28 }, { x: 33, w: 36, h: 46 },
  { x: 38, w: 30, h: 34 }, { x: 42, w: 46, h: 58 }, { x: 47, w: 30, h: 40 },
  { x: 51, w: 38, h: 30 }, { x: 55, w: 30, h: 50 }, { x: 59, w: 44, h: 36 },
  { x: 64, w: 30, h: 44 }, { x: 68, w: 38, h: 28 }, { x: 72, w: 30, h: 52 },
  { x: 76, w: 44, h: 34 }, { x: 81, w: 30, h: 46 }, { x: 85, w: 38, h: 30 },
  { x: 89, w: 30, h: 42 }, { x: 93, w: 36, h: 26 }, { x: 96, w: 34, h: 38 },
];

const MID = [
  { x: 1, w: 66, h: 34, neon: false }, { x: 7, w: 58, h: 46, neon: true },
  { x: 13, w: 62, h: 30, neon: false }, { x: 19, w: 54, h: 54, neon: false },
  { x: 25, w: 68, h: 38, neon: true }, { x: 32, w: 58, h: 48, neon: false },
  { x: 38, w: 62, h: 32, neon: false }, { x: 45, w: 56, h: 42, neon: false },
  { x: 51, w: 64, h: 52, neon: true }, { x: 58, w: 58, h: 36, neon: false },
  { x: 64, w: 62, h: 46, neon: true }, { x: 71, w: 56, h: 32, neon: false },
  { x: 77, w: 64, h: 50, neon: false }, { x: 84, w: 58, h: 40, neon: true },
  { x: 90, w: 60, h: 34, neon: false }, { x: 95, w: 54, h: 44, neon: false },
];

/* ── Builder ───────────────────────────────────────────────────────────── */

// districts: the decorated array from useCityProgress (id, name, icon,
// color, glow, glowState, position). Optional per-district flags `locked`,
// `next` and `sealed` are passed straight through to the scene, and
// `mentors` ({ [districtId]: { name, color } }) places each district's
// Guide NPC beside its door — the tutorial teacher you talk to first.
export function buildCityWorld(
  districts,
  { guideName = "The Guide", guideColor = "#00F0FF", mentors = {} } = {}
) {
  const byId = new Map((districts || []).map((d) => [d.id, d]));

  const props = [
    { type: "gate", x: 40, label: "MAPQUEST CITY" },
    { type: "lamp", x: 300, color: "#7B2CFF" },
    { type: "fountain", x: 470 },
    { type: "lamp", x: 760, color: "#00F0FF" },
  ];

  const npcs = [{ id: "guide", name: guideName, x: 640, color: guideColor, sprite: "guide" }];

  const arches = [];
  const buildings = [];

  // Mask Encounters street layer (see masks/): fog banks = the tall grass,
  // maskZones = the chapters (district ids + where each chapter's final
  // boss looms once it materializes — beside the zone's end, never blocking).
  const maskDens = [];
  const maskZones = [];

  // Street clowns — HATERS and NAYSAYERS waddling the road, one per zone,
  // there to be jumped on. Alternating kinds, varied waddle speeds.
  const enemies = [];
  const addClown = (x, patrol = 80) => {
    const i = enemies.length;
    const kind = i % 2 === 0 ? "hater" : "naysayer";
    enemies.push({
      id: `${kind}-${i}`,
      kind,
      x: Math.round(x),
      patrol,
      dur: 4.2 + (i % 3) * 0.8,
    });
  };
  addClown(752, 56); // first heckler on the walk from the Plaza to THE GRID

  let cursor = 830;
  for (const zone of STREET_ZONES) {
    cursor += zone.gapBefore || 0;
    // a fog bank drifts on the approach to every chapter arch — the tall
    // grass where wild critics ambush (none guards the Spire's approach)
    if (zone.label !== "THE SPIRE") {
      maskDens.push({ x: cursor - 280, w: 260 });
    }
    arches.push({ x: cursor, w: ARCH_W, label: zone.label, accent: zone.accent });
    cursor += ARCH_W + ARCH_GAP;

    const entries = zone.ids
      .map((id) => byId.get(id))
      .filter(Boolean)
      .map((d) => ({ d, w: WIDTH_BY_ID[d.id] || BUILDING_W, gap: GAP }));

    const { placed, end } = layoutRow(cursor, entries);
    for (const p of placed) {
      const d = p.d;
      buildings.push({
        id: d.id,
        name: d.name,
        icon: d.icon,
        color: d.color,
        glow: d.glow,
        x: p.x,
        w: p.w,
        hPct: TIER_HEIGHT_PCT[(d.position && d.position.h) || 2] || TIER_HEIGHT_PCT[2],
        glowState: d.glowState || "dim",
        locked: Boolean(d.locked),
        next: Boolean(d.next),
        sealed: Boolean(d.sealed),
      });

      // The district's Guide stands just west of the door (not for the
      // sealed Spire — the Alchemist waits inside, not on the street).
      const m = mentors[d.id];
      if (m && !d.sealed) {
        npcs.push({
          id: `mentor:${d.id}`,
          name: m.name,
          x: p.x - 34,
          color: m.color,
          sprite: "guide",
          disabled: Boolean(d.locked),
        });
      }
    }

    // every zone gets a resident clown pacing its stretch of street —
    // single-building zones (Vault, Spire) get a gatekeeper heckling the
    // approach instead ("the last naysayer before the tower")
    if (placed.length > 1) {
      const last = placed[placed.length - 1];
      addClown((placed[0].x + last.x + last.w) / 2);
    } else if (placed.length === 1) {
      addClown(placed[0].x - 96, 56);
    }

    // the chapter record: its districts + where its final boss materializes
    // (just past the last door, beside the end of the chapter's stretch)
    if (placed.length) {
      maskZones.push({
        label: zone.label,
        ids: [...zone.ids],
        accent: zone.accent,
        lurkX: end - GAP + 36,
      });
      // THE ARCHIVE ROW has no boss — it's the wild-critic-densest stretch,
      // so a second bank drifts over the row itself
      if (zone.label === "THE ARCHIVE ROW") {
        maskDens.push({ x: placed[0].x + 30, w: 280 });
      }
    }

    cursor = end - GAP + ZONE_GAP;

    // a street lamp between zones, tinted by the zone it closes
    props.push({ type: "lamp", x: cursor - ZONE_GAP / 2, color: zone.accent });
  }

  const width = cursor + 240;

  return {
    id: "city",
    label: "MapQuest City — the walkable street",
    theme: "mqw-theme-city",
    width,
    spawnX: 560,
    edges: {
      left: { type: "exit", id: "road-home", label: "THE ROAD HOME" },
      right: { type: "wall" },
    },
    far: FAR,
    mid: MID,
    arches,
    props,
    buildings,
    npcs,
    enemies,
    maskDens,
    maskZones,
  };
}

// Door x for a district (fast travel / "Guide me there").
export function getDoorX(world, districtId) {
  const b = (world.buildings || []).find((x) => x.id === districtId);
  return b ? Math.round(b.x + b.w / 2) : null;
}
