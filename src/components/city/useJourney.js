import { useEffect, useMemo, useRef, useState } from "react";
import { STORY_ORDER } from "./cityWorld.js";
import { loadCityState } from "./cityStore.js";
import {
  hasJourney,
  loadJourney,
  runMigrationOnce,
  unlockDistrict,
  setWorld as storeSetWorld,
} from "./journeyStore.js";

// ════════════════════════════════════════════════════════════════════════
// MAPQUEST JOURNEY — derived unlocks
// Computed beside useCityProgress every render, from the same decorated
// districts array. A district in STORY_ORDER is unlocked iff any of:
//   · it's the first stop (the Spire is always open once you're in the city)
//   · it's already stored as unlocked
//   · it has REAL feature progress or a streak of its own   ← never lock
//     anyone out of a training they already use
//   · the previous story district's mentor lesson was heard, or the
//     previous district has real progress
// Fresh unlocks are written through (idempotent) so the POWERS ON moment
// fires exactly once, ever, per district.
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

export default function useJourney(districts, { onPowerOn } = {}) {
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

  // Derive unlock state along the story order.
  const { unlockedSet, nextLockedId, nextStopId, freshUnlocks } = useMemo(() => {
    const stored = journey.city.unlocked || {};
    const unlocked = new Set(Object.keys(stored));
    const fresh = [];
    const lessons = loadCityState().mentorLessons || {};

    for (let i = 0; i < STORY_ORDER.length; i += 1) {
      const id = STORY_ORDER[i];
      if (unlocked.has(id)) continue;
      const district = byId.get(id);
      const prevId = i > 0 ? STORY_ORDER[i - 1] : null;
      const prevDistrict = prevId ? byId.get(prevId) : null;
      const open =
        i === 0 ||
        hasOwnProgress(district) ||
        (prevId && lessons[prevId] != null) ||
        hasOwnProgress(prevDistrict);
      if (open) {
        unlocked.add(id);
        fresh.push({ id, via: hasOwnProgress(district) ? "progress" : "story", index: i });
      }
    }

    const nextIdx = STORY_ORDER.findIndex((id) => !unlocked.has(id));
    const next = nextIdx >= 0 ? STORY_ORDER[nextIdx] : null;
    // the frontier — the unlocked district whose lesson powers the next one
    const stop = nextIdx > 0 ? STORY_ORDER[nextIdx - 1] : null;
    return {
      unlockedSet: unlocked,
      nextLockedId: next,
      nextStopId: stop,
      freshUnlocks: fresh,
    };
  }, [journey, byId]);

  // Write fresh unlocks through to the store; celebrate first-evers.
  const onPowerOnRef = useRef(onPowerOn);
  onPowerOnRef.current = onPowerOn;
  useEffect(() => {
    if (!freshUnlocks.length || journey.world !== "city") return;
    let changed = false;
    for (const f of freshUnlocks) {
      const { firstEver } = unlockDistrict(f.id, f.via);
      if (firstEver) {
        changed = true;
        // the Spire opens with the city itself — arrival is its celebration
        if (f.index > 0 && onPowerOnRef.current) onPowerOnRef.current(f.id);
      }
    }
    if (changed) setJourney(loadJourney());
  }, [freshUnlocks, journey.world]);

  const setWorld = (world) => setJourney(storeSetWorld(world));
  const refresh = () => setJourney(loadJourney());

  return {
    journey,
    world: journey.world,
    hometown: journey.hometown,
    isUnlocked: (id) => journey.world !== "city" || unlockedSet.has(id),
    nextLockedId,
    nextStopId,
    setWorld,
    refresh,
  };
}
