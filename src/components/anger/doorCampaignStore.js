/* ════════════════════════════════════════════════════════════════════════
   THE DOOR — campaign progress, keyed by SLUG.

   Why this file exists at all:

   The old key stored `cleared: { 2: true }`, where 2 meant "the level sitting
   in position 2". That makes the ladder immovable — insert a level anywhere
   and every saved id silently starts pointing at a different level. Reordering
   the roster would have quietly told players they'd beaten fights they'd never
   seen.

   So identity moved off the position and onto a slug. `cleared: { steele: true }`
   survives any amount of reordering, because `order` is now just a number a
   designer types. Renumbering the whole campaign is a one-field edit, forever.

   MIGRATION LAW: this module READS `door_levels_state` and never writes it.
   The legacy key is left byte-identical on disk so a rollback is nothing more
   than deleting `door_campaign_v2`. Both keys are registered in
   FEATURE_STORE_KEYS (src/hooks/useAppData.js), so both ride to the cloud.
   ════════════════════════════════════════════════════════════════════════ */

import { nextAfter } from "./doorLevels.js";

const KEY = "door_campaign_v2";
const LEGACY_KEY = "door_levels_state";

/* The four levels that existed when progress was still ordinal. FROZEN — this
   table is the only thing that can read an old save, so it can never change
   even if the levels themselves are renamed, reordered, or retired. */
const LEGACY_SLUG = Object.freeze({ 1: "first", 2: "persist", 3: "steel", 4: "callback" });

const EMPTY = { v: 2, cleared: {}, maxOrder: 1 };

function read(key) {
  try { return JSON.parse(localStorage.getItem(key) || "null"); } catch { return null; }
}
function write(val) {
  try { localStorage.setItem(KEY, JSON.stringify(val)); } catch { /* private mode */ }
}

/**
 * Derive a v2 campaign from a legacy `{ maxUnlocked, cleared: {id:true} }`.
 * Pure — hand it the old blob, get the new one. Unknown ids are dropped
 * rather than guessed at.
 */
export function migrateLegacy(legacy) {
  if (!legacy || typeof legacy !== "object") return { ...EMPTY };
  const cleared = {};
  for (const [id, done] of Object.entries(legacy.cleared || {})) {
    const slug = LEGACY_SLUG[id];
    if (slug && done) cleared[slug] = true;
  }
  const maxOrder = Math.max(1, Number(legacy.maxUnlocked) || 1);
  return { v: 2, cleared, maxOrder };
}

/**
 * Load campaign progress, migrating a legacy save on first run.
 * Idempotent: once v2 exists, the legacy key is never consulted again.
 */
export function loadCampaign() {
  const saved = read(KEY);
  if (saved && saved.v === 2) {
    return {
      v: 2,
      cleared: saved.cleared && typeof saved.cleared === "object" ? saved.cleared : {},
      maxOrder: Math.max(1, Number(saved.maxOrder) || 1),
    };
  }
  const migrated = migrateLegacy(read(LEGACY_KEY));
  write(migrated);            // the legacy key is deliberately left untouched
  return migrated;
}

export function saveCampaign(state) {
  write({
    v: 2,
    cleared: state.cleared || {},
    maxOrder: Math.max(1, Number(state.maxOrder) || 1),
  });
}

/** Has this level been beaten? Takes a slug. */
export function isCleared(state, slug) {
  return !!(state && state.cleared && state.cleared[slug]);
}

/** Is this level reachable? Takes the level's `order`. */
export function isUnlocked(state, order) {
  return order <= (state ? state.maxOrder : 1);
}

/**
 * Record a win. Marks the slug cleared and opens whatever the roster says
 * comes next — read from the ladder rather than computed as `order + 1`, so
 * gaps in `order` (there are some, on purpose) can't lock a player out.
 */
export function recordClear(state, slug) {
  const next = nextAfter(slug);
  const merged = {
    v: 2,
    cleared: { ...(state.cleared || {}), [slug]: true },
    maxOrder: next ? Math.max(state.maxOrder || 1, next.order) : (state.maxOrder || 1),
  };
  saveCampaign(merged);
  return merged;
}
