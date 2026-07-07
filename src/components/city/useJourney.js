import { useEffect, useMemo, useRef, useState } from "react";
import { STORY_ORDER } from "./cityWorld.js";
import { loadCityState } from "./cityStore.js";
import {
  hasJourney,
  loadJourney,
  runMigrationOnce,
  unlockDistrict,
  recordLitProgress,
  maybeUnlockSpire,
  hasLegacyCity,
  isSpireOpen,
  spireLitCount,
  TUTORIAL_DISTRICT_IDS,
  setWorld as storeSetWorld,
} from "./journeyStore.js";

// ════════════════════════════════════════════════════════════════════════
// MAPQUEST JOURNEY — derived unlocks + the LIT tutorial engine (ACT 1)
// Computed beside useCityProgress every render, from the same decorated
// districts array.
//
// LIT = the district's Guide lesson heard + one real action inside the
// feature (progress/streak > 0). The unlock chain runs on LIT:
//   · the first training district is always open once you're in the city
//   · a district opens when the PREVIOUS one is lit — or when it has real
//     progress of its own (never lock anyone out of a training they use)
//   · the Alchemist Spire opens only at GATE 2 (all 15 lit) — legacy users
//     bypass every gate
// Fresh unlocks/lits are written through (idempotent) so POWERS ON and
// DISTRICT LIT moments fire exactly once, ever, per district.
// ════════════════════════════════════════════════════════════════════════

function detectExistingUser(districts) {
  if (loadCityState().firstVisitAt) return true;
  for (const d of districts || []) {
    const p = d && d.progress;
    if (p && (Number(p.value) > 0 || Number(p.streak) > 0)) return true;
  }
  return false;
}

function hasOwnProgress(district) {
  const p = district && district.progress;
  return Boolean(p && (Number(p.value) > 0 || Number(p.streak) > 0));
}

export default function useJourney(districts, { onPowerOn, onLit, onSpireOpen } = {}) {
  // Migration runs once, synchronously, before the first paint — a new user
  // must never flash the city before the hometown takes over.
  const [journey, setJourney] = useState(() => {
    if (hasJourney()) return loadJourney();
    return runMigrationOnce({
      existingUser: detectExistingUser(districts),
      districtIds: (districts || []).map((d) => d.id),
    });
  });

  const byId = useMemo(
    () => new Map((districts || []).map((d) => [d.id, d])),
    [districts]
  );

  const legacy = hasLegacyCity(journey) || journey.hometown.skipped;
  const spireOpen = isSpireOpen(journey);

  // Derive unlock + lit state along the story order.
  const { unlockedSet, nextLockedId, nextStopId, freshUnlocks, litUpdates } = useMemo(() => {
    const stored = journey.city.unlocked || {};
    const litStore = journey.city.lit || {};
    const lessons = loadCityState().mentorLessons || {};
    const unlocked = new Set(Object.keys(stored));
    const fresh = [];
    const lits = [];

    const isLit = (id) => Boolean(litStore[id]?.litAt);

    for (let i = 0; i < TUTORIAL_DISTRICT_IDS.length; i += 1) {
      const id = TUTORIAL_DISTRICT_IDS[i];
      const district = byId.get(id);
      const prevId = i > 0 ? TUTORIAL_DISTRICT_IDS[i - 1] : null;

      if (!unlocked.has(id)) {
        const open =
          i === 0 ||
          hasOwnProgress(district) ||
          (prevId && isLit(prevId)) ||
          // pre-LIT saves opened doors on lessons alone — honor that forever
          (prevId && lessons[prevId] != null);
        if (open) {
          unlocked.add(id);
          fresh.push({ id, via: hasOwnProgress(district) ? "progress" : "story", index: i });
        }
      }

      // LIT observation (new citizens only — legacy users are past training)
      if (!legacy && unlocked.has(id) && !isLit(id)) {
        const lesson = lessons[id] != null;
        const action = hasOwnProgress(district);
        if ((lesson && !litStore[id]?.lessonAt) || (action && !litStore[id]?.actionAt) || (lesson && action)) {
          lits.push({ id, lesson, action });
        }
      }
    }

    // GATE 2 — the Spire is its own gate, not part of the walking chain.
    if (spireOpen) unlocked.add("alchemist-spire");
    else unlocked.delete("alchemist-spire");

    const nextIdx = TUTORIAL_DISTRICT_IDS.findIndex((id) => !unlocked.has(id));
    const next = nextIdx >= 0 ? TUTORIAL_DISTRICT_IDS[nextIdx] : null;
    // the frontier — the first open training district still working toward LIT
    const stop =
      TUTORIAL_DISTRICT_IDS.find((id) => unlocked.has(id) && !isLit(id)) || null;

    return {
      unlockedSet: unlocked,
      nextLockedId: next,
      nextStopId: stop,
      freshUnlocks: fresh,
      litUpdates: lits,
    };
  }, [journey, byId, legacy, spireOpen]);

  // Write fresh unlocks + lit halves through to the store; celebrate first-evers.
  const onPowerOnRef = useRef(onPowerOn);
  const onLitRef = useRef(onLit);
  const onSpireOpenRef = useRef(onSpireOpen);
  onPowerOnRef.current = onPowerOn;
  onLitRef.current = onLit;
  onSpireOpenRef.current = onSpireOpen;

  useEffect(() => {
    if (journey.world !== "city") return;
    let changed = false;

    for (const f of freshUnlocks) {
      const { firstEver } = unlockDistrict(f.id, f.via);
      if (firstEver) {
        changed = true;
        if (f.index > 0 && onPowerOnRef.current) onPowerOnRef.current(f.id);
      }
    }

    for (const l of litUpdates) {
      const { firstLit } = recordLitProgress(l.id, { lesson: l.lesson, action: l.action });
      if (firstLit) {
        changed = true;
        if (onLitRef.current) onLitRef.current(l.id);
      }
    }

    if (!legacy) {
      const { firstEver, open } = maybeUnlockSpire();
      if (open && firstEver) {
        changed = true;
        if (onSpireOpenRef.current) onSpireOpenRef.current();
      }
    }

    if (changed) setJourney(loadJourney());
  }, [freshUnlocks, litUpdates, legacy, journey.world]);

  const setWorld = (world) => setJourney(storeSetWorld(world));
  const refresh = () => setJourney(loadJourney());

  return {
    journey,
    world: journey.world,
    hometown: journey.hometown,
    legacy,
    spireOpen,
    litCount: spireLitCount(journey),
    litTotal: TUTORIAL_DISTRICT_IDS.length,
    isUnlocked: (id) => journey.world !== "city" || unlockedSet.has(id),
    isLit: (id) => Boolean(journey.city.lit?.[id]?.litAt),
    nextLockedId,
    nextStopId,
    setWorld,
    refresh,
  };
}
