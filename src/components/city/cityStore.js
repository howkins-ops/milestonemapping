// ════════════════════════════════════════════════════════════════════════
// MAPQUEST CITY — visit + lesson store
// Pure localStorage (pressureForgeStore pattern): guards every read/write,
// no hooks, no side effects beyond the one key. Everything is idempotent so
// XP/achievement triggers built on top can never double-fire.
// ════════════════════════════════════════════════════════════════════════

export const CITY_STORE_KEY = "mapquest_city_v1";

const DEFAULT_STATE = {
  firstVisitAt: null, // ISO timestamp of the very first city visit
  lastVisitDay: null, // local YYYY-MM-DD of the latest visit
  visitedDistricts: [], // district ids whose sheet has been opened
  mentorLessons: {}, // { [districtId]: lastDayKey a lesson was finished }
};

function localDayKey(date = new Date()) {
  const d = date instanceof Date && !isNaN(date) ? date : new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export function loadCityState() {
  try {
    if (typeof window === "undefined" || !window.localStorage) return { ...DEFAULT_STATE };
    const raw = window.localStorage.getItem(CITY_STORE_KEY);
    if (!raw) return { ...DEFAULT_STATE };
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_STATE,
      ...(parsed && typeof parsed === "object" ? parsed : {}),
      visitedDistricts: Array.isArray(parsed && parsed.visitedDistricts)
        ? parsed.visitedDistricts.filter((id) => typeof id === "string" && id)
        : [],
      mentorLessons:
        parsed && parsed.mentorLessons && typeof parsed.mentorLessons === "object"
          ? { ...parsed.mentorLessons }
          : {},
    };
  } catch {
    return { ...DEFAULT_STATE };
  }
}

function save(state) {
  try {
    if (typeof window === "undefined" || !window.localStorage) return;
    window.localStorage.setItem(CITY_STORE_KEY, JSON.stringify(state));
  } catch {
    // storage unavailable — the city still renders, rewards just won't persist
  }
}

// Record a city visit. Returns { firstVisit, newDay } — both false on repeat
// visits within the same local day, so callers can award XP safely.
export function recordVisit(now = new Date()) {
  const state = loadCityState();
  const today = localDayKey(now);
  const firstVisit = !state.firstVisitAt;
  const newDay = !firstVisit && state.lastVisitDay !== today;
  if (firstVisit) state.firstVisitAt = new Date(now).toISOString();
  if (state.lastVisitDay !== today) state.lastVisitDay = today;
  save(state);
  return { firstVisit, newDay };
}

// Mark a district sheet as opened. Returns the updated visited list.
export function recordDistrictVisit(id) {
  const state = loadCityState();
  if (typeof id === "string" && id && !state.visitedDistricts.includes(id)) {
    state.visitedDistricts = [...state.visitedDistricts, id];
    save(state);
  }
  return state.visitedDistricts;
}

export function hasVisitedAll(ids) {
  if (!Array.isArray(ids) || !ids.length) return false;
  const { visitedDistricts } = loadCityState();
  return ids.every((id) => visitedDistricts.includes(id));
}

// Record a finished mentor lesson. Returns:
//   firstEver  — first lesson from ANY mentor (achievement trigger)
//   firstToday — first lesson from THIS mentor today (XP gate)
//   heardCount — number of distinct mentors ever heard
export function recordMentorLesson(id, now = new Date()) {
  const state = loadCityState();
  const today = localDayKey(now);
  const firstEver = Object.keys(state.mentorLessons).length === 0;
  const firstToday = state.mentorLessons[id] !== today;
  if (typeof id === "string" && id && firstToday) {
    state.mentorLessons = { ...state.mentorLessons, [id]: today };
    save(state);
  }
  return {
    firstEver: firstEver && firstToday,
    firstToday,
    heardCount: Object.keys(loadCityState().mentorLessons).length,
  };
}
