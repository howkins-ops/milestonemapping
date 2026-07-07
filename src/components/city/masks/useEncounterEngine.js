import { useRef, useState } from "react";
import { WILD_CRITICS } from "./wildCritics.js";

// ════════════════════════════════════════════════════════════════════════
// MASK ENCOUNTERS — the Pokémon brain
// Rides the walk engine's onStride hook (fires only while actually
// walking — zero cost when idle) and rolls wild ambushes inside fog banks
// under the §3 rules: distance-based rolls, hard cooldowns, a session cap,
// pity after two clean banks, night ×1.5, and a rare relapse slot for
// already-integrated masks. Boss fights are never rolled here — they are
// CHOSEN at the chapter's end arch.
//
// Dev fast-path: ?maskrate=1 forces every roll to hit and drops cooldowns.
// ════════════════════════════════════════════════════════════════════════

export const ENCOUNTER_TUNING = {
  rollPx: 300, // roll once per this many px walked inside fog
  chance: 0.18, // base hit chance per roll
  nightMult: 1.5, // critics are louder at night — canon
  cooldownMs: 90_000, // min time between wild ambushes
  cooldownPx: 1400, // AND min px walked between them
  maxPerSession: 3, // wild ambushes per browser session
  pityBanks: 2, // walked this many full banks with none → guarantee one
  spawnSafePx: 800, // no ambush near spawn until the very first one ever
  relapseChance: 0.05, // integrated masks resurface, rarely
};

const SESSION_COUNT_KEY = "mask_session_ambushes";

function readSessionCount() {
  try {
    const n = parseInt(sessionStorage.getItem(SESSION_COUNT_KEY) || "0", 10);
    return Number.isFinite(n) && n > 0 ? n : 0;
  } catch {
    return 0;
  }
}

function bumpSessionCount() {
  try {
    sessionStorage.setItem(SESSION_COUNT_KEY, String(readSessionCount() + 1));
  } catch {
    /* counter just won't persist */
  }
}

function devTuning() {
  try {
    const q = new URLSearchParams(window.location.search);
    if (q.get("maskrate") === "1") {
      return { chance: 1, cooldownMs: 0, cooldownPx: 0, maxPerSession: 99, spawnSafePx: 0, rollPx: 120 };
    }
  } catch {
    /* no-op */
  }
  return null;
}

export default function useEncounterEngine({
  maskDens = [],
  spawnX = 0,
  enabled = true,
  isNight = false,
  hasEverAmbushed = false,
  relapsePool = [],
  onEncounter,
}) {
  const [pending, setPending] = useState(null);

  // everything the stride hook touches lives in refs — it runs per frame
  const cfg = useRef({});
  cfg.current = { maskDens, spawnX, enabled, isNight, hasEverAmbushed, relapsePool, onEncounter, pending };

  const sim = useRef({
    distInFog: 0,
    distSinceLast: Infinity, // no ambush yet this mount — only the clock gates
    lastAt: 0,
    bankIdx: null, // which fog bank we're inside (null = open street)
    ambushedInBank: false,
    banksClean: 0, // full banks traversed with no ambush → pity
  });

  const tuning = { ...ENCOUNTER_TUNING, ...(devTuning() || {}) };

  const fire = (x) => {
    const c = cfg.current;
    const s = sim.current;
    s.lastAt = Date.now();
    s.distSinceLast = 0;
    s.distInFog = 0;
    s.ambushedInBank = true;
    s.banksClean = 0;
    bumpSessionCount();
    // rare relapse slot: an integrated mask resurfaces (≥3 days later)
    let encounter;
    if (c.relapsePool.length && Math.random() < tuning.relapseChance) {
      encounter = { type: "relapse", id: c.relapsePool[Math.floor(Math.random() * c.relapsePool.length)] };
    } else {
      const critic = WILD_CRITICS[Math.floor(Math.random() * WILD_CRITICS.length)];
      encounter = { type: "wild", id: critic.id };
    }
    encounter.x = Math.round(x);
    setPending(encounter);
    if (c.onEncounter) c.onEncounter(encounter);
  };

  // (dxAbs, x) — called by WorldScene from the engine's walk branch
  const onStride = (dxAbs, x) => {
    const c = cfg.current;
    const s = sim.current;
    if (!c.enabled || c.pending) return;

    s.distSinceLast += dxAbs;

    // which bank are we in?
    let idx = null;
    for (let i = 0; i < c.maskDens.length; i++) {
      const d = c.maskDens[i];
      if (x >= d.x && x <= d.x + d.w) {
        idx = i;
        break;
      }
    }
    if (idx !== s.bankIdx) {
      // left a bank without an ambush → one step closer to pity
      if (s.bankIdx != null && !s.ambushedInBank) s.banksClean += 1;
      s.bankIdx = idx;
      s.ambushedInBank = false;
      s.distInFog = 0;
    }
    if (idx == null) return; // open street — critics live in the fog

    s.distInFog += dxAbs;
    if (s.distInFog < tuning.rollPx) return;
    s.distInFog = 0;

    // hard gates
    if (readSessionCount() >= tuning.maxPerSession) return;
    if (Date.now() - s.lastAt < tuning.cooldownMs && s.lastAt !== 0) return;
    if (s.distSinceLast < tuning.cooldownPx) return;
    if (!c.hasEverAmbushed && Math.abs(x - c.spawnX) < tuning.spawnSafePx) return;

    const pity = s.banksClean >= tuning.pityBanks;
    const chance = pity ? 1 : tuning.chance * (c.isNight ? tuning.nightMult : 1);
    if (Math.random() < chance) fire(x);
  };

  return {
    onStride,
    pendingEncounter: pending,
    clearEncounter: () => setPending(null),
  };
}
