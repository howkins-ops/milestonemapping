// ════════════════════════════════════════════════════════════════════════
// THE CROSSING — onboarding store
// Pure localStorage (journeyStore pattern): guarded reads/writes, no hooks,
// everything idempotent so the vow XP/achievement can never double-fire.
//
// The Crossing runs exactly once, for genuinely new users only. Existing
// users are classified "legacy" and must never see a single frame of it.
// ════════════════════════════════════════════════════════════════════════

export const CROSSING_KEY = "crossing_v1";

// Any of these in localStorage = this device has app history = existing user.
const LEGACY_SIGNAL_KEYS = [
  "mapquest_journey_v1",
  "shadow_descent_v1",
  "shifts_state",
  "milestone-quest:mode-v1",
  "mapquest_city_v1",
  "iron_workout_cache_v1",
];

const DEFAULT_STATE = {
  version: 1,
  completed: false,
  completedAt: null,
  via: null, // "crossed" | "legacy" | "skipped"
  phase: "ignition",
  answers: {
    goals: [], // mirror-phase chip ids
    wall: null, // wall choice id
    wallText: "", // their wall choice text + the counter shown (for echo)
    cost: "", // the private 12-month line
    path: null, // "builder" | "closer" | "phoenix" | "seeker"
    vow: "",
    sealedAt: null,
  },
  torch: {}, // { [itemId]: ISO } — First 24 Hours checklist
  replay: false, // settings replay walk-through (no re-awards)
  migratedAt: null,
};

function normalize(parsed) {
  const p = parsed && typeof parsed === "object" ? parsed : {};
  const answers = p.answers && typeof p.answers === "object" ? p.answers : {};
  return {
    ...DEFAULT_STATE,
    ...p,
    answers: {
      ...DEFAULT_STATE.answers,
      ...answers,
      goals: Array.isArray(answers.goals) ? [...answers.goals] : [],
    },
    torch: p.torch && typeof p.torch === "object" ? { ...p.torch } : {},
  };
}

export function hasCrossing() {
  try {
    if (typeof window === "undefined" || !window.localStorage) return true;
    return window.localStorage.getItem(CROSSING_KEY) != null;
  } catch {
    return true; // storage unavailable — behave like an existing user
  }
}

export function loadCrossing() {
  try {
    if (typeof window === "undefined" || !window.localStorage) return normalize(null);
    const raw = window.localStorage.getItem(CROSSING_KEY);
    if (!raw) return normalize(null);
    return normalize(JSON.parse(raw));
  } catch {
    return normalize(null);
  }
}

function save(state) {
  try {
    if (typeof window === "undefined" || !window.localStorage) return;
    window.localStorage.setItem(CROSSING_KEY, JSON.stringify(state));
  } catch {
    // storage unavailable — the app still renders, the crossing just won't persist
  }
}

// Synchronous device-history check — safe to call inside useState(() => …).
export function hasLegacySignals() {
  try {
    if (typeof window === "undefined" || !window.localStorage) return true;
    const ls = window.localStorage;
    if (Number(ls.getItem("milestone_mapping_xp")) > 0) return true;
    const ach = ls.getItem("milestone_mapping_achievements");
    if (ach && ach !== "[]") return true;
    const projects = ls.getItem("milestone_mapping_projects");
    if (projects && projects !== "[]") return true;
    return LEGACY_SIGNAL_KEYS.some((k) => ls.getItem(k) != null);
  } catch {
    return true;
  }
}

// One-time classification. Existing users get a completed record and never
// see the flow; new users start at ignition.
export function runMigrationOnce({ existingUser }, now = new Date()) {
  if (hasCrossing()) return loadCrossing();
  const state = normalize(null);
  state.migratedAt = new Date(now).toISOString();
  if (existingUser) {
    state.completed = true;
    state.completedAt = state.migratedAt;
    state.via = "legacy";
  }
  save(state);
  return state;
}

export function recordPhase(phase) {
  const state = loadCrossing();
  if (state.phase !== phase) {
    state.phase = phase;
    save(state);
  }
  return state;
}

export function saveAnswers(patch = {}) {
  const state = loadCrossing();
  state.answers = { ...state.answers, ...patch };
  save(state);
  return state;
}

// Seal the vow. Idempotent — firstEver is true exactly once, ever, so the
// XP + achievement award can never double-fire (including on replay).
export function sealVow(vow, now = new Date()) {
  const state = loadCrossing();
  const firstEver = !state.answers.sealedAt;
  state.answers.vow = String(vow || "").trim();
  if (firstEver) state.answers.sealedAt = new Date(now).toISOString();
  save(state);
  return { firstEver, state };
}

export function markComplete(via = "crossed", now = new Date()) {
  const state = loadCrossing();
  const firstEver = !state.completed;
  state.completed = true;
  state.replay = false;
  if (firstEver) {
    state.completedAt = new Date(now).toISOString();
    state.via = via;
  }
  save(state);
  return { firstEver, state };
}

// First 24 Hours checklist. Idempotent per item.
export function recordTorchItem(itemId, now = new Date()) {
  if (typeof itemId !== "string" || !itemId) return { firstEver: false, state: loadCrossing() };
  const state = loadCrossing();
  const firstEver = !state.torch[itemId];
  if (firstEver) {
    state.torch = { ...state.torch, [itemId]: new Date(now).toISOString() };
    save(state);
  }
  return { firstEver, state };
}

// Settings → "Replay The Crossing": walk the story again. Answers and the
// sealed vow are kept; firstEver guards make every award a no-op.
export function beginReplay() {
  const state = loadCrossing();
  state.completed = false;
  state.phase = "ignition";
  state.replay = true;
  save(state);
  return state;
}

// Cloud snapshot restore — a legacy user's crossing record follows them to a
// new device through the user_data blob. Never overwrites local state.
export function importCrossing(remote) {
  if (!remote || typeof remote !== "object") return loadCrossing();
  if (hasCrossing()) return loadCrossing();
  const state = normalize(remote);
  save(state);
  return state;
}
