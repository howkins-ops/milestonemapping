// ════════════════════════════════════════════════════════════════════════
// MAPQUEST JOURNEY — world + story-unlock store
// Pure localStorage (cityStore pattern): guarded reads/writes, no hooks,
// everything idempotent so XP/celebration triggers can never double-fire.
//
// The journey is the story spine across worlds:
//   hometown (the send-off) → city (districts power on in STORY_ORDER)
// Gating only ever touches city doors — every feature stays reachable
// through the app's own navigation (the One Law: real life first).
// ════════════════════════════════════════════════════════════════════════

export const JOURNEY_KEY = "mapquest_journey_v1";

const DEFAULT_STATE = {
  version: 1,
  world: "city", // "hometown" | "city"
  hometown: {
    started: false,
    nextBeat: 0,
    beatsDone: {}, // { [beatId]: ISO timestamp }
    completedAt: null,
    skipped: false, // existing users skip the hometown (revisitable later)
  },
  city: {
    unlocked: {}, // { [districtId]: { at: ISO, via: "story"|"legacy"|"progress" } }
  },
  migratedAt: null,
};

function normalize(parsed) {
  const p = parsed && typeof parsed === "object" ? parsed : {};
  const hometown = p.hometown && typeof p.hometown === "object" ? p.hometown : {};
  const city = p.city && typeof p.city === "object" ? p.city : {};
  return {
    ...DEFAULT_STATE,
    ...p,
    world: p.world === "hometown" ? "hometown" : "city",
    hometown: {
      ...DEFAULT_STATE.hometown,
      ...hometown,
      beatsDone:
        hometown.beatsDone && typeof hometown.beatsDone === "object"
          ? { ...hometown.beatsDone }
          : {},
    },
    city: {
      unlocked:
        city.unlocked && typeof city.unlocked === "object" ? { ...city.unlocked } : {},
    },
  };
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

// Record a hometown story beat. Idempotent; advances the linear pointer.
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
// it later by walking the road home and playing the beats).
export function completeHometown(now = new Date()) {
  const state = loadJourney();
  const firstEver = !state.hometown.completedAt;
  if (firstEver) state.hometown.completedAt = new Date(now).toISOString();
  state.world = "city";
  save(state);
  return { firstEver, state };
}

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
