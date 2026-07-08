// ════════════════════════════════════════════════════════════════════════
// MAPQUEST STREET — the walk's own memory (Living City · Phases 7 + 9)
// localStorage, journeyStore shape: versioned key, guarded reads/writes,
// everything idempotent. Holds: the odometer, today's sparks, best stomp
// chain, street secrets, zone title cards seen, Guide whispers heard, and
// the street audio settings. sessionStorage carries the transient combo.
// ════════════════════════════════════════════════════════════════════════

import { todayKey } from "./world/daySeed.js";

export const STREET_KEY = "mq_street_v1";

// px → m: 160px ≈ 1m (REWARD.mPerPx); milestones in meters.
export const ODOMETER_MILESTONES = [
  { key: "street_1k", m: 1000, label: "1 KM WALKED" },
  { key: "street_5k", m: 5000, label: "5 KM WALKED" },
  { key: "street_25k", m: 25000, label: "25 KM — BOOTS EARNED" },
  { key: "street_100k", m: 100000, label: "100 KM — STREET LEGEND" },
];

const DEFAULT_STATE = {
  version: 1,
  odometerPx: 0,
  milestones: {}, // { [key]: ISO }
  sparks: { day: null, collected: [], sweepDone: false }, // today's motes
  comboBest: 0,
  secrets: {}, // { [id]: ISO }
  zonesSeen: {}, // { [zoneLabel]: ISO } — title cards fire once, ever
  whispersSeen: {}, // { [idx]: ISO } — Guide mile-markers, once each
  audio: { muted: false, volume: 0.8 },
};

function normalize(p) {
  const s = p && typeof p === "object" ? p : {};
  return {
    ...DEFAULT_STATE,
    ...s,
    version: 1,
    odometerPx: Number.isFinite(Number(s.odometerPx)) ? Math.max(0, Number(s.odometerPx)) : 0,
    milestones: s.milestones && typeof s.milestones === "object" ? { ...s.milestones } : {},
    sparks:
      s.sparks && typeof s.sparks === "object"
        ? {
            day: s.sparks.day || null,
            collected: Array.isArray(s.sparks.collected) ? [...s.sparks.collected] : [],
            sweepDone: Boolean(s.sparks.sweepDone),
          }
        : { ...DEFAULT_STATE.sparks },
    comboBest: Number.isFinite(Number(s.comboBest)) ? Math.max(0, Number(s.comboBest)) : 0,
    secrets: s.secrets && typeof s.secrets === "object" ? { ...s.secrets } : {},
    zonesSeen: s.zonesSeen && typeof s.zonesSeen === "object" ? { ...s.zonesSeen } : {},
    whispersSeen:
      s.whispersSeen && typeof s.whispersSeen === "object" ? { ...s.whispersSeen } : {},
    audio:
      s.audio && typeof s.audio === "object"
        ? { muted: Boolean(s.audio.muted), volume: clamp01(s.audio.volume, 0.8) }
        : { ...DEFAULT_STATE.audio },
  };
}

function clamp01(v, fallback) {
  const n = Number(v);
  return Number.isFinite(n) ? Math.max(0, Math.min(1, n)) : fallback;
}

export function loadStreet() {
  try {
    if (typeof window === "undefined" || !window.localStorage) return normalize(null);
    const raw = window.localStorage.getItem(STREET_KEY);
    return normalize(raw ? JSON.parse(raw) : null);
  } catch {
    return normalize(null);
  }
}

function save(state) {
  try {
    if (typeof window === "undefined" || !window.localStorage) return;
    window.localStorage.setItem(STREET_KEY, JSON.stringify(state));
  } catch {
    /* storage unavailable — the street just forgets */
  }
}

/* ── Odometer ─────────────────────────────────────────────────────────── */

// Add walked px (call from a write-behind buffer, not per frame).
// Returns the new total and any milestones crossed for the first time.
export function addOdometer(px, now = new Date()) {
  const n = Number(px);
  if (!Number.isFinite(n) || n <= 0) return { totalPx: loadStreet().odometerPx, fresh: [] };
  const state = loadStreet();
  state.odometerPx += n;
  const meters = state.odometerPx / 160;
  const fresh = [];
  for (const m of ODOMETER_MILESTONES) {
    if (meters >= m.m && !state.milestones[m.key]) {
      state.milestones[m.key] = new Date(now).toISOString();
      fresh.push(m);
    }
  }
  save(state);
  return { totalPx: state.odometerPx, fresh };
}

export function odometerMeters(state = loadStreet()) {
  return Math.floor(state.odometerPx / 160);
}

export function hasMilestone(key, state = loadStreet()) {
  return Boolean(state.milestones[key]);
}

/* ── Sparks (daily collectibles) ──────────────────────────────────────── */

// Collect spark #i for `day`. Rolls the day over automatically.
export function collectSpark(i, total, day = todayKey()) {
  const state = loadStreet();
  if (state.sparks.day !== day) {
    state.sparks = { day, collected: [], sweepDone: false };
  }
  if (state.sparks.collected.includes(i)) {
    return { firstTime: false, count: state.sparks.collected.length, sweep: false };
  }
  state.sparks.collected.push(i);
  const count = state.sparks.collected.length;
  let sweep = false;
  if (count >= total && !state.sparks.sweepDone) {
    state.sparks.sweepDone = true;
    sweep = true;
  }
  save(state);
  return { firstTime: true, count, sweep };
}

export function sparksCollectedToday(day = todayKey(), state = loadStreet()) {
  return state.sparks.day === day ? [...state.sparks.collected] : [];
}

/* ── Stomp combo best ─────────────────────────────────────────────────── */

export function recordComboBest(chain) {
  const n = Math.round(Number(chain) || 0);
  const state = loadStreet();
  if (n > state.comboBest) {
    state.comboBest = n;
    save(state);
    return { newBest: true, best: n };
  }
  return { newBest: false, best: state.comboBest };
}

/* ── Street finds (3 secrets, ever) ───────────────────────────────────── */

export function markSecret(id, now = new Date()) {
  const state = loadStreet();
  if (state.secrets[id]) return { firstTime: false };
  state.secrets[id] = new Date(now).toISOString();
  save(state);
  return { firstTime: true };
}

/* ── One-time story beats ─────────────────────────────────────────────── */

export function markZoneSeen(label, now = new Date()) {
  const state = loadStreet();
  if (state.zonesSeen[label]) return { firstTime: false };
  state.zonesSeen[label] = new Date(now).toISOString();
  save(state);
  return { firstTime: true };
}

export function markWhisperSeen(idx, now = new Date()) {
  const state = loadStreet();
  if (state.whispersSeen[idx]) return { firstTime: false };
  state.whispersSeen[idx] = new Date(now).toISOString();
  save(state);
  return { firstTime: true };
}

/* ── Street audio (Phase 8) ───────────────────────────────────────────── */

export function getStreetAudio() {
  return loadStreet().audio;
}

export function setStreetAudio(patch) {
  const state = loadStreet();
  state.audio = {
    muted: patch.muted != null ? Boolean(patch.muted) : state.audio.muted,
    volume: patch.volume != null ? clamp01(patch.volume, state.audio.volume) : state.audio.volume,
  };
  save(state);
  return state.audio;
}
