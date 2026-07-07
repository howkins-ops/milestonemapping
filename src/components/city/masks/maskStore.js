// ════════════════════════════════════════════════════════════════════════
// MASK ENCOUNTERS — the Mask Court store
// Pure localStorage (journeyStore pattern): guarded reads/writes, normalize
// on load, everything idempotent so XP/achievement triggers can never
// double-fire — plus a tiny subscribe set so the codex/HUD re-render live.
// Local-first: no Supabase in v1.
// ════════════════════════════════════════════════════════════════════════

import { MASK_BOSSES } from "./maskBosses.js";
import { WILD_CRITICS } from "./wildCritics.js";

export const MASK_STORE_KEY = "mask_court_v1";

// "NOT NOW" at the first framing = no ambushes for the rest of the session.
const SESSION_SNOOZE_KEY = "mask_session_snooze";

const DEFAULT_STATE = {
  version: 1,
  // { [bossId]: { at: ISO, essence, proof, fears: [] } } — the evolutions
  integrated: {},
  // { [criticId]: { count, lastAt: ISO, fears: [] } }
  wildWins: {},
  // codex journal, newest last:
  // { kind: "wild"|"boss"|"relapse", id, fear?, fears?, essence?, proof?, at: ISO }
  entries: [],
  // { [bossId]: { count, lastAt: ISO } } — integrated masks resurfacing
  relapse: {},
  // { [bossId]: ISO } — the boss stage appeared at its chapter's end arch
  materialized: {},
  encountersOff: false,
  firstFramingSeen: false,
  courtAt: null, // stamped once when the fifth mask evolves
  stats: { ambushes: 0, walkaways: 0 },
};

const listeners = new Set();

export function subscribeMasks(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function notify() {
  listeners.forEach((fn) => {
    try {
      fn();
    } catch {
      /* a broken listener never blocks the rest */
    }
  });
}

function normalize(parsed) {
  const p = parsed && typeof parsed === "object" ? parsed : {};
  const obj = (v) => (v && typeof v === "object" ? { ...v } : {});
  return {
    ...DEFAULT_STATE,
    ...p,
    version: 1,
    integrated: obj(p.integrated),
    wildWins: obj(p.wildWins),
    entries: Array.isArray(p.entries) ? p.entries.filter((e) => e && typeof e === "object") : [],
    relapse: obj(p.relapse),
    materialized: obj(p.materialized),
    encountersOff: Boolean(p.encountersOff),
    firstFramingSeen: Boolean(p.firstFramingSeen),
    courtAt: typeof p.courtAt === "string" ? p.courtAt : null,
    stats: { ...DEFAULT_STATE.stats, ...obj(p.stats) },
  };
}

export function loadMasks() {
  try {
    if (typeof window === "undefined" || !window.localStorage) return normalize(null);
    const raw = window.localStorage.getItem(MASK_STORE_KEY);
    if (!raw) return normalize(null);
    return normalize(JSON.parse(raw));
  } catch {
    return normalize(null);
  }
}

function save(state) {
  try {
    if (typeof window === "undefined" || !window.localStorage) return;
    window.localStorage.setItem(MASK_STORE_KEY, JSON.stringify(state));
  } catch {
    // storage unavailable — the street still walks, wins just won't persist
  }
  notify();
}

/* ── Encounters on/off + the one-time framing ─────────────────────────── */

export function setEncountersOff(off) {
  const state = loadMasks();
  const next = Boolean(off);
  if (state.encountersOff !== next) {
    state.encountersOff = next;
    save(state);
  }
  return state;
}

export function markFramingSeen() {
  const state = loadMasks();
  const firstTime = !state.firstFramingSeen;
  if (firstTime) {
    state.firstFramingSeen = true;
    save(state);
  }
  return { firstTime, state };
}

// "NOT NOW" — free walk-away from the framing; quiet for this session only.
export function snoozeSession() {
  try {
    sessionStorage.setItem(SESSION_SNOOZE_KEY, "1");
  } catch {
    /* no-op */
  }
}

export function isSessionSnoozed() {
  try {
    return sessionStorage.getItem(SESSION_SNOOZE_KEY) === "1";
  } catch {
    return false;
  }
}

/* ── Encounter stats (ambushes rolled, walk-aways — never punished) ────── */

export function recordAmbush() {
  const state = loadMasks();
  state.stats = { ...state.stats, ambushes: (state.stats.ambushes || 0) + 1 };
  save(state);
  return state;
}

export function recordWalkAway() {
  const state = loadMasks();
  state.stats = { ...state.stats, walkaways: (state.stats.walkaways || 0) + 1 };
  save(state);
  return state;
}

/* ── Wins ──────────────────────────────────────────────────────────────── */

// Wild critic named. Returns { firstEver, count } — firstEver gates the
// codex "NAMED" flip; every win is a journal entry.
export function recordWildWin(criticId, fear, now = new Date()) {
  const state = loadMasks();
  const at = new Date(now).toISOString();
  const prev = state.wildWins[criticId] || { count: 0, fears: [] };
  const firstEver = prev.count === 0;
  const fears = typeof fear === "string" && fear ? [...(prev.fears || []), fear] : prev.fears || [];
  state.wildWins = {
    ...state.wildWins,
    [criticId]: { count: prev.count + 1, lastAt: at, fears },
  };
  state.entries = [...state.entries, { kind: "wild", id: criticId, fear: fear || "", at }];
  save(state);
  return { firstEver, count: prev.count + 1, state };
}

// Boss integrated → EVOLVED. Idempotent: firstEver is true exactly once per
// boss; allFive flips true on the win that completes the court.
export function recordIntegration(bossId, { essence, proof, fears = [] } = {}, now = new Date()) {
  const state = loadMasks();
  const at = new Date(now).toISOString();
  const firstEver = !state.integrated[bossId];
  if (firstEver) {
    state.integrated = {
      ...state.integrated,
      [bossId]: { at, essence: essence || null, proof: proof || "", fears: [...fears] },
    };
    state.entries = [
      ...state.entries,
      { kind: "boss", id: bossId, fears: [...fears], essence: essence || null, proof: proof || "", at },
    ];
  }
  const allFive = MASK_BOSSES.every((b) => Boolean(state.integrated[b.id]));
  let firstCourt = false;
  if (allFive && !state.courtAt) {
    state.courtAt = at;
    firstCourt = true;
  }
  if (firstEver || firstCourt) save(state);
  return { firstEver, allFive, firstCourt, state };
}

// Relapse refresher won — the old voice re-named. Honest bookkeeping only.
export function recordRelapseWin(bossId, fear, now = new Date()) {
  const state = loadMasks();
  const at = new Date(now).toISOString();
  const prev = state.relapse[bossId] || { count: 0 };
  state.relapse = { ...state.relapse, [bossId]: { count: prev.count + 1, lastAt: at } };
  state.entries = [...state.entries, { kind: "relapse", id: bossId, fear: fear || "", at }];
  save(state);
  return { count: prev.count + 1, state };
}

// The boss stage appears at its chapter's end arch — stamped once, so the
// "You leveled up. That's when it gets loud." toast can never re-fire.
export function maybeMaterialize(bossId, now = new Date()) {
  const state = loadMasks();
  const firstTime = !state.materialized[bossId];
  if (firstTime) {
    state.materialized = { ...state.materialized, [bossId]: new Date(now).toISOString() };
    save(state);
  }
  return { firstTime, state };
}

/* ── Derived reads ─────────────────────────────────────────────────────── */

export function isIntegrated(bossId, state = loadMasks()) {
  return Boolean(state.integrated[bossId]);
}

export function integratedCount(state = loadMasks()) {
  return MASK_BOSSES.filter((b) => state.integrated[b.id]).length;
}

export function courtClaimed(state = loadMasks()) {
  return Boolean(state.courtAt);
}

export function wildWinCount(state = loadMasks()) {
  return Object.values(state.wildWins).reduce((n, w) => n + (w?.count || 0), 0);
}

export function namedCriticCount(state = loadMasks()) {
  return WILD_CRITICS.filter((c) => state.wildWins[c.id]?.count > 0).length;
}

// Integrated masks eligible to resurface as a rare wild-slot refresher
// (≥3 days after integration — integration isn't one-and-done).
export function relapseEligibleBossIds(state = loadMasks(), now = new Date()) {
  const cutoff = new Date(now).getTime() - 3 * 24 * 60 * 60 * 1000;
  return MASK_BOSSES.filter((b) => {
    const it = state.integrated[b.id];
    return it && new Date(it.at).getTime() <= cutoff;
  }).map((b) => b.id);
}
