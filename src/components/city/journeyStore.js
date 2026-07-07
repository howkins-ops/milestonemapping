// ════════════════════════════════════════════════════════════════════════
// MAPQUEST JOURNEY — world + story-unlock store (v2 — THE GOLDEN ROAD)
// Pure localStorage (cityStore pattern): guarded reads/writes, no hooks,
// everything idempotent so XP/celebration triggers can never double-fire.
//
// The journey is the story spine across the whole game:
//   ACT 0 · hometown (4 stations)        → GATE 1: all stations → city
//   ACT 1 · city (districts LIT in order)→ GATE 2: 15 lit → the Spire
//   ACT 2 · the Spire (24 chapters)      → Ch24 complete → the Crossing
//   ACT 3 · the Crossing (five cities → the Thanking → the Oasis)
// Gating only ever touches story doors — every feature stays reachable
// through the app's own navigation (the One Law: real life first), and
// legacy users (via:"legacy" migration) bypass every gate.
// ════════════════════════════════════════════════════════════════════════

import { STORY_ORDER } from "./cityWorld.js";

export const JOURNEY_KEY = "mapquest_journey_v1"; // key stays; content is versioned

export const HOMETOWN_STATIONS = ["why", "letter", "quit", "sendoff"];

// The five crossing cities, west → east (five-cities-oasis canon).
export const CROSSING_CITIES = ["silent-spire", "the-feed", "the-tribunal", "the-ledger", "the-carnival"];

const QUEST_STATE_KEY = "milestone-quest:mode-v1"; // useMapQuestState storage
const FINAL_CHAPTER_KEY = "ch20-the-return"; // Ch24 — completing it opens the Crossing

const DEFAULT_STATE = {
  version: 2,
  world: "city", // "hometown" | "city"
  hometown: {
    started: false,
    nextBeat: 0, // legacy v1 pointer (kept for old saves; stations drive v2)
    beatsDone: {}, // v1: { [beatId]: ISO }
    stations: {}, // v2: { [stationId]: { at: ISO } }
    outputs: {}, // v2: { whyILeft, whoIAmNow, biggestFear, antiQuitLetter, ... }
    completedAt: null,
    skipped: false, // existing users skip the hometown (revisitable later)
  },
  city: {
    unlocked: {}, // { [districtId]: { at: ISO, via: "story"|"legacy"|"progress" } }
    lit: {}, // { [districtId]: { lessonAt, actionAt, litAt } }
  },
  spire: {
    unlockedAt: null, // GATE 2 stamp (legacy users bypass without a stamp)
    ignitionSeenAt: null, // the Spire-ignition cinematic played
  },
  crossing: {
    unlockedAt: null,
    cities: {}, // { [cityId]: { arrivedAt, flippedAt } }
    unveiledAt: null, // the Shadow Unveiled / the Thanking
    oasisAt: null, // reached Fatima's oasis — crossing complete
  },
  migratedAt: null,
};

function normalizeStations(raw) {
  const out = {};
  if (raw && typeof raw === "object") {
    for (const id of HOMETOWN_STATIONS) {
      const s = raw[id];
      if (s && typeof s === "object" && s.at) out[id] = { at: String(s.at) };
    }
  }
  return out;
}

function normalize(parsed) {
  const p = parsed && typeof parsed === "object" ? parsed : {};
  const hometown = p.hometown && typeof p.hometown === "object" ? p.hometown : {};
  const city = p.city && typeof p.city === "object" ? p.city : {};
  const spire = p.spire && typeof p.spire === "object" ? p.spire : {};
  const crossing = p.crossing && typeof p.crossing === "object" ? p.crossing : {};

  const state = {
    ...DEFAULT_STATE,
    ...p,
    version: 2,
    world: p.world === "hometown" ? "hometown" : "city",
    hometown: {
      ...DEFAULT_STATE.hometown,
      ...hometown,
      beatsDone:
        hometown.beatsDone && typeof hometown.beatsDone === "object"
          ? { ...hometown.beatsDone }
          : {},
      stations: normalizeStations(hometown.stations),
      outputs:
        hometown.outputs && typeof hometown.outputs === "object"
          ? { ...hometown.outputs }
          : {},
    },
    city: {
      unlocked:
        city.unlocked && typeof city.unlocked === "object" ? { ...city.unlocked } : {},
      lit: city.lit && typeof city.lit === "object" ? { ...city.lit } : {},
    },
    spire: { ...DEFAULT_STATE.spire, ...spire },
    crossing: {
      ...DEFAULT_STATE.crossing,
      ...crossing,
      cities:
        crossing.cities && typeof crossing.cities === "object"
          ? { ...crossing.cities }
          : {},
    },
  };

  // v1 → v2: a hometown finished under the old 5-beat flow counts as all four
  // stations done — nobody replays their own onboarding because we shipped v2.
  if (state.hometown.completedAt) {
    for (const id of HOMETOWN_STATIONS) {
      if (!state.hometown.stations[id]) {
        state.hometown.stations[id] = { at: state.hometown.completedAt };
      }
    }
  }

  return state;
}

export function hasJourney() {
  try {
    if (typeof window === "undefined" || !window.localStorage) return true;
    return window.localStorage.getItem(JOURNEY_KEY) != null;
  } catch {
    return true; // storage unavailable — behave like an existing user, lock nothing
  }
}

export function loadJourney() {
  try {
    if (typeof window === "undefined" || !window.localStorage) return normalize(null);
    const raw = window.localStorage.getItem(JOURNEY_KEY);
    if (!raw) return normalize(null);
    return normalize(JSON.parse(raw));
  } catch {
    return normalize(null);
  }
}

function save(state) {
  try {
    if (typeof window === "undefined" || !window.localStorage) return;
    window.localStorage.setItem(JOURNEY_KEY, JSON.stringify(state));
  } catch {
    // storage unavailable — the world still renders, progress just won't persist
  }
}

// One-time first-load classification. Existing users keep their whole city;
// gating is a new-citizen onboarding mechanic only.
export function runMigrationOnce({ existingUser, districtIds = [] }, now = new Date()) {
  if (hasJourney()) return loadJourney();
  const state = normalize(null);
  state.migratedAt = new Date(now).toISOString();
  if (existingUser) {
    state.world = "city";
    state.hometown.skipped = true;
    const at = state.migratedAt;
    for (const id of districtIds) {
      if (typeof id === "string" && id) state.city.unlocked[id] = { at, via: "legacy" };
    }
  } else {
    state.world = "hometown";
  }
  save(state);
  return state;
}

export function setWorld(world) {
  const state = loadJourney();
  const next = world === "hometown" ? "hometown" : "city";
  if (state.world !== next) {
    state.world = next;
    save(state);
  }
  return state;
}

/* ── ACT 0 · the four stations ────────────────────────────────────────────
   why      — Your House: write the WHY (whyILeft/whoIAmNow/biggestFear)
   letter   — The Letter: the anti-quit message (replayed in SOS)
   quit     — The Old Workshop: the quit-your-job mini-game
   sendoff  — The Father's Porch: the warning + the pendant
──────────────────────────────────────────────────────────────────────────── */

// Record a station done (idempotent) and merge any captured outputs.
export function recordHometownStation(stationId, outputs = {}, now = new Date()) {
  const state = loadJourney();
  const known = HOMETOWN_STATIONS.includes(stationId);
  const firstTime = known && !state.hometown.stations[stationId];
  state.hometown.started = true;
  if (firstTime) {
    state.hometown.stations = {
      ...state.hometown.stations,
      [stationId]: { at: new Date(now).toISOString() },
    };
  }
  if (outputs && typeof outputs === "object" && Object.keys(outputs).length) {
    state.hometown.outputs = { ...state.hometown.outputs, ...outputs };
  }
  save(state);
  return { firstTime, state };
}

export function getHometownOutputs() {
  return loadJourney().hometown.outputs || {};
}

export function hometownStationsDone(state = loadJourney()) {
  return HOMETOWN_STATIONS.every((id) => Boolean(state.hometown.stations[id]));
}

// GATE 1 — the road out / the city.
export function isCityOpen(state = loadJourney()) {
  return Boolean(
    state.hometown.skipped || state.hometown.completedAt || hometownStationsDone(state)
  );
}

// Legacy v1 beat recorder — the station flow calls recordHometownStation now,
// but old saves mid-journey still resolve their pointer through this.
export function recordHometownBeat(beatId, beatIndex = 0, now = new Date()) {
  const state = loadJourney();
  const firstTime = !state.hometown.beatsDone[beatId];
  state.hometown.started = true;
  if (firstTime) {
    state.hometown.beatsDone = {
      ...state.hometown.beatsDone,
      [beatId]: new Date(now).toISOString(),
    };
  }
  const advance = Math.max(state.hometown.nextBeat, Math.round(Number(beatIndex)) + 1);
  if (advance !== state.hometown.nextBeat) state.hometown.nextBeat = advance;
  save(state);
  return { firstTime, state };
}

// The road out — completes the hometown and moves the journey to the city.
// firstEver gates the one-time XP/achievement (skipped users can still earn
// it later by walking the road home and playing the stations).
export function completeHometown(now = new Date()) {
  const state = loadJourney();
  if (!isCityOpen(state)) return { firstEver: false, blocked: true, state };
  const firstEver = !state.hometown.completedAt;
  if (firstEver) state.hometown.completedAt = new Date(now).toISOString();
  state.world = "city";
  save(state);
  return { firstEver, blocked: false, state };
}

/* ── ACT 1 · districts power on, then get LIT ─────────────────────────────── */

// Power a district on. Idempotent — firstEver is true exactly once per id.
export function unlockDistrict(id, via = "story", now = new Date()) {
  if (typeof id !== "string" || !id) return { firstEver: false, state: loadJourney() };
  const state = loadJourney();
  const firstEver = !state.city.unlocked[id];
  if (firstEver) {
    state.city.unlocked = {
      ...state.city.unlocked,
      [id]: { at: new Date(now).toISOString(), via },
    };
    save(state);
  }
  return { firstEver, state };
}

// LIT = the district's Guide lesson heard + one real action in the feature.
// Callers report whichever half they observed; the store stamps litAt once
// both halves exist. firstLit is true exactly once, ever, per district.
export function recordLitProgress(id, { lesson = false, action = false } = {}, now = new Date()) {
  if (typeof id !== "string" || !id) return { firstLit: false, state: loadJourney() };
  const state = loadJourney();
  const prev = state.city.lit[id] || {};
  const at = new Date(now).toISOString();
  const next = { ...prev };
  if (lesson && !next.lessonAt) next.lessonAt = at;
  if (action && !next.actionAt) next.actionAt = at;
  let firstLit = false;
  if (!next.litAt && next.lessonAt && next.actionAt) {
    next.litAt = at;
    firstLit = true;
  }
  const changed =
    next.lessonAt !== prev.lessonAt || next.actionAt !== prev.actionAt || firstLit;
  if (changed) {
    state.city.lit = { ...state.city.lit, [id]: next };
    save(state);
  }
  return { firstLit, state };
}

export function litDistrictIds(state = loadJourney()) {
  return Object.keys(state.city.lit).filter((id) => state.city.lit[id]?.litAt);
}

// Legacy users bypass every gate — the migration marked their whole city.
export function hasLegacyCity(state = loadJourney()) {
  return Object.values(state.city.unlocked || {}).some((u) => u && u.via === "legacy");
}

// The 15 training districts a new citizen lights before the Spire opens.
export const TUTORIAL_DISTRICT_IDS = STORY_ORDER.filter((id) => id !== "alchemist-spire");

// GATE 2 — the Alchemist Spire (and the quest book, everywhere).
export function isSpireOpen(state = loadJourney()) {
  if (state.spire.unlockedAt) return true;
  if (hasLegacyCity(state)) return true;
  if (state.hometown.skipped) return true; // pre-journey accounts never gate
  const lit = state.city.lit || {};
  return TUTORIAL_DISTRICT_IDS.every((id) => lit[id]?.litAt);
}

export function spireLitCount(state = loadJourney()) {
  const lit = state.city.lit || {};
  return TUTORIAL_DISTRICT_IDS.filter((id) => lit[id]?.litAt).length;
}

// Stamp the gate the moment it first opens (drives the ignition cinematic).
export function maybeUnlockSpire(now = new Date()) {
  const state = loadJourney();
  if (state.spire.unlockedAt) return { firstEver: false, open: true, state };
  const open = isSpireOpen(state);
  if (!open) return { firstEver: false, open: false, state };
  state.spire.unlockedAt = new Date(now).toISOString();
  save(state);
  return { firstEver: !hasLegacyCity(state) && !state.hometown.skipped, open: true, state };
}

export function markIgnitionSeen(now = new Date()) {
  const state = loadJourney();
  const firstTime = !state.spire.ignitionSeenAt;
  if (firstTime) {
    state.spire.ignitionSeenAt = new Date(now).toISOString();
    save(state);
  }
  return { firstTime, state };
}

/* ── ACT 3 · the Crossing to the Oasis ────────────────────────────────────── */

// Read the quest save directly (pure) — Ch24 complete opens the Crossing.
export function isFinalChapterComplete() {
  try {
    if (typeof window === "undefined" || !window.localStorage) return false;
    const raw = window.localStorage.getItem(QUEST_STATE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    return Boolean(parsed?.chapters?.[FINAL_CHAPTER_KEY]?.complete);
  } catch {
    return false;
  }
}

export function isCrossingOpen(state = loadJourney()) {
  return Boolean(state.crossing.unlockedAt) || isFinalChapterComplete();
}

export function maybeUnlockCrossing(now = new Date()) {
  const state = loadJourney();
  if (state.crossing.unlockedAt) return { firstEver: false, open: true, state };
  if (!isFinalChapterComplete()) return { firstEver: false, open: false, state };
  state.crossing.unlockedAt = new Date(now).toISOString();
  save(state);
  return { firstEver: true, open: true, state };
}

// Record a crossing beat: arrival at a city, or its flip (the Four Turns).
export function recordCrossingCity(cityId, field, now = new Date()) {
  const state = loadJourney();
  if (!CROSSING_CITIES.includes(cityId) || !["arrivedAt", "flippedAt"].includes(field)) {
    return { firstTime: false, state };
  }
  const prev = state.crossing.cities[cityId] || {};
  const firstTime = !prev[field];
  if (firstTime) {
    state.crossing.cities = {
      ...state.crossing.cities,
      [cityId]: { ...prev, [field]: new Date(now).toISOString() },
    };
    save(state);
  }
  return { firstTime, state };
}

export function crossingFlippedCount(state = loadJourney()) {
  return CROSSING_CITIES.filter((id) => state.crossing.cities[id]?.flippedAt).length;
}

export function recordUnveiled(now = new Date()) {
  const state = loadJourney();
  const firstTime = !state.crossing.unveiledAt;
  if (firstTime) {
    state.crossing.unveiledAt = new Date(now).toISOString();
    save(state);
  }
  return { firstTime, state };
}

export function recordOasis(now = new Date()) {
  const state = loadJourney();
  const firstTime = !state.crossing.oasisAt;
  if (firstTime) {
    state.crossing.oasisAt = new Date(now).toISOString();
    save(state);
  }
  return { firstTime, state };
}
