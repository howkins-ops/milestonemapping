// ════════════════════════════════════════════════════════════════════════
// SHADOW DESCENT — depth-unlock store
// Pure localStorage (mirrors the MapQuest journeyStore pattern): guarded
// reads/writes, no hooks, everything idempotent so the "a new depth opens"
// celebration can never double-fire.
//
// The descent is a guided journey: Depth I ("The Furnace") is always
// open; each deeper depth powers on when BOTH chambers of the depth above are
// completed — or when a mapped Map-Quest chapter is cleared (the hybrid path).
// Existing Shadow users are migrated with every depth unlocked (via:"legacy")
// so nobody who already used the feature ever gets re-locked.
// ════════════════════════════════════════════════════════════════════════

export const DESCENT_KEY = "shadow_descent_v1";

// The descent, top (the Furnace, always open) to bottom (the way out).
export const DEPTH_ORDER = ["furnace", "waters", "undertow", "stories", "moongate"];

// Which Map-Quest chapter keys ALSO fast-unlock each depth (any-of). Depth I
// ("furnace") is always open, so its keys below are inert — kept because the
// mapping is thematic (chapter ↔ chamber), not positional. Keys verified against
// map-quest/questChapters.js; `chapter-shadow` also lights up via the legacy
// bridge in useMapQuestState.isChapterComplete.
export const DEPTH_QUEST_KEYS = {
  undertow: ["ch07-the-challenger", "ch14-the-ruins"],
  stories: ["chapter-shadow", "ch11-the-data-spire"],
  furnace: ["ch12-the-recursion", "ch17-the-citadel"],
  moongate: ["ch19-the-vault", "ch20-the-return"],
};

const DEFAULT_STATE = {
  version: 1,
  unlocked: {}, // { [depthId]: { at: ISO, via: "progress"|"quest"|"legacy" } }
  migratedAt: null,
};

function normalize(parsed) {
  const p = parsed && typeof parsed === "object" ? parsed : {};
  return {
    ...DEFAULT_STATE,
    ...p,
    unlocked:
      p.unlocked && typeof p.unlocked === "object" ? { ...p.unlocked } : {},
  };
}

export function storageAvailable() {
  try {
    return typeof window !== "undefined" && !!window.localStorage;
  } catch {
    return false;
  }
}

export function hasDescent() {
  try {
    if (typeof window === "undefined" || !window.localStorage) return true;
    return window.localStorage.getItem(DESCENT_KEY) != null;
  } catch {
    return true; // storage unavailable — behave like an existing user, lock nothing
  }
}

export function loadDescent() {
  try {
    if (typeof window === "undefined" || !window.localStorage) return normalize(null);
    const raw = window.localStorage.getItem(DESCENT_KEY);
    if (!raw) return normalize(null);
    return normalize(JSON.parse(raw));
  } catch {
    return normalize(null);
  }
}

function save(state) {
  try {
    if (typeof window === "undefined" || !window.localStorage) return;
    window.localStorage.setItem(DESCENT_KEY, JSON.stringify(state));
  } catch {
    // storage unavailable — the descent still renders, progress just won't persist
  }
}

// One-time first-load classification. Existing Shadow users keep the whole
// descent; gating is a new-user onboarding mechanic only.
export function runMigrationOnce({ existingUser, depthIds = [] }, now = new Date()) {
  if (hasDescent()) return loadDescent();
  const state = normalize(null);
  state.migratedAt = new Date(now).toISOString();
  if (existingUser) {
    const at = state.migratedAt;
    for (const id of depthIds) {
      if (typeof id === "string" && id) state.unlocked[id] = { at, via: "legacy" };
    }
  }
  save(state);
  return state;
}

// Power a depth on. Idempotent — firstEver is true exactly once per id.
export function unlockDepth(id, via = "progress", now = new Date()) {
  if (typeof id !== "string" || !id) return { firstEver: false, state: loadDescent() };
  const state = loadDescent();
  const firstEver = !state.unlocked[id];
  if (firstEver) {
    state.unlocked = {
      ...state.unlocked,
      [id]: { at: new Date(now).toISOString(), via },
    };
    save(state);
  }
  return { firstEver, state };
}
