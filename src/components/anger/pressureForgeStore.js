/* ════════════════════════════════════════════════════════════════════════
   Pressure Forge — local persistence (streak, lifetime forges, trail).
   Mirrors the streak model used by Fill Your Cup so the two feel consistent.
   ════════════════════════════════════════════════════════════════════════ */
import { getLevel } from "./pressureForgeData.js";

const KEY = "pressure_forge";
const TODAY = () => new Date().toISOString().split("T")[0];

function read() {
  try { return JSON.parse(localStorage.getItem(KEY) || "null"); } catch { return null; }
}
function write(val) {
  try { localStorage.setItem(KEY, JSON.stringify(val)); } catch {}
}

const EMPTY = { totalForged: 0, streak: 0, bestStreak: 0, lastDate: null, history: [] };

/** Load state, rolling the streak forward/back based on the calendar. */
export function loadForgeState() {
  const saved = read() || {};
  const s = { ...EMPTY, ...saved, history: Array.isArray(saved.history) ? saved.history : [] };
  if (!s.lastDate) { s.streak = 0; return s; }
  const diff = Math.round((new Date(TODAY()) - new Date(s.lastDate)) / 86400000);
  if (diff >= 2) s.streak = 0; // missed a day → streak lapses (best is preserved)
  return s;
}

/**
 * Record a completed forge. Bumps lifetime count, advances the daily streak
 * (once per calendar day), prepends to the trail, and reports level-ups.
 */
export function recordForge(entry) {
  const prev = loadForgeState();
  const today = TODAY();
  const firstToday = prev.lastDate !== today;

  let streak = prev.streak;
  if (firstToday) {
    const diff = prev.lastDate ? Math.round((new Date(today) - new Date(prev.lastDate)) / 86400000) : null;
    streak = diff === 1 ? prev.streak + 1 : 1; // consecutive day → +1, otherwise (re)start at 1
  }
  const bestStreak = Math.max(prev.bestStreak || 0, streak);
  const totalForged = (prev.totalForged || 0) + 1;

  const beforeLevel = getLevel(prev.totalForged || 0);
  const afterLevel = getLevel(totalForged);

  const history = [{ at: Date.now(), date: today, ...entry }, ...prev.history].slice(0, 30);

  const next = { totalForged, streak, bestStreak, lastDate: today, history };
  write(next);

  return {
    state: next,
    leveledUp: afterLevel.name !== beforeLevel.name,
    level: afterLevel,
    firstToday,
  };
}

export function clearForgeTrail() {
  const prev = loadForgeState();
  write({ ...prev, history: [] });
}
