import { useEffect, useMemo, useRef, useState } from "react";
import {
  hasDescent,
  loadDescent,
  runMigrationOnce,
  unlockDepth,
  storageAvailable,
} from "./descentStore.js";

// ════════════════════════════════════════════════════════════════════════
// SHADOW DESCENT — derived unlocks
// Computed every render from a decorated `depths` array
//   [{ id, toolNames: [...display names], questKeys: [...chapter keys] }]
// A depth is unlocked iff any of:
//   · it's Depth I (always open)
//   · it's already stored as unlocked
//   · BOTH chambers of the depth above are completed  (completions[name] >= 1)
//   · a mapped Map-Quest chapter is complete           (the hybrid fast-unlock)
// Fresh unlocks are written through (idempotent) so the "a new depth opens"
// moment fires exactly once, ever, per depth. Legacy-migrated depths are
// already stored → they never appear as fresh → existing users get no spam.
//
// Note: `completions` (from useShadowWork) is keyed by the tool's DISPLAY
// NAME, not its id — so `toolNames` carries the names to look up.
// ════════════════════════════════════════════════════════════════════════

function detectExistingShadowUser({ completions, essences, takeaways }) {
  if (Array.isArray(essences) && essences.length) return true;
  if (Array.isArray(takeaways) && takeaways.length) return true;
  if (completions && Object.keys(completions).length) return true;
  return false;
}

export default function useDescent(
  depths,
  { completions, essences, takeaways, isChapterComplete, onReveal } = {}
) {
  // Migration runs once, synchronously, before the first paint. useShadowWork()
  // loads its state synchronously earlier in the hub render, so completions/
  // essences/takeaways are already populated here — existing users never flash
  // locked and new users never flash unlocked.
  const [descent, setDescent] = useState(() => {
    if (hasDescent()) return loadDescent();
    return runMigrationOnce({
      existingUser: detectExistingShadowUser({ completions, essences, takeaways }),
      depthIds: (depths || []).map((d) => d.id),
    });
  });

  const { unlockedSet, nextLockedDepthId, freshUnlocks } = useMemo(() => {
    const stored = descent.unlocked || {};
    const unlocked = new Set(Object.keys(stored));
    const fresh = [];
    const comp = completions || {};
    const bothDone = (d) => d.toolNames.every((n) => (comp[n] || 0) >= 1);
    const questDone = (d) => d.questKeys.some((k) => isChapterComplete?.(k));

    for (let i = 0; i < depths.length; i += 1) {
      const d = depths[i];
      if (unlocked.has(d.id)) continue;
      const prev = i > 0 ? depths[i - 1] : null;
      const open =
        i === 0 || // Depth I is always open
        (prev && bothDone(prev)) || // both chambers of the depth above completed
        questDone(d); // a mapped quest chapter fast-unlocks THIS depth
      if (open) {
        unlocked.add(d.id);
        fresh.push({ id: d.id, via: questDone(d) ? "quest" : "progress", index: i });
      }
    }

    const nextIdx = depths.findIndex((d) => !unlocked.has(d.id));
    return {
      unlockedSet: unlocked,
      nextLockedDepthId: nextIdx >= 0 ? depths[nextIdx].id : null,
      freshUnlocks: fresh,
    };
  }, [descent, depths, completions, isChapterComplete]);

  // Write fresh unlocks through to the store; celebrate first-evers.
  const onRevealRef = useRef(onReveal);
  onRevealRef.current = onReveal;
  useEffect(() => {
    if (!freshUnlocks.length) return;
    let changed = false;
    for (const f of freshUnlocks) {
      const { firstEver } = unlockDepth(f.id, f.via);
      if (firstEver) {
        changed = true;
        // Depth I opens with the descent itself — arrival is its own reward.
        if (f.index > 0 && onRevealRef.current) onRevealRef.current(f.id, f.via);
      }
    }
    if (changed) setDescent(loadDescent());
  }, [freshUnlocks]);

  const ok = storageAvailable();
  return {
    descent,
    // storage-less env → never hard-lock; render everything unlocked
    isDepthUnlocked: (id) => !ok || unlockedSet.has(id),
    nextLockedDepthId,
    refresh: () => setDescent(loadDescent()),
  };
}
