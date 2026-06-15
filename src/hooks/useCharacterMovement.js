import { useMemo, useState, useEffect } from "react";

/**
 * Tracks avatar position and the "just unlocked" walk animation.
 *
 * @param {Array}   milestones      - project milestone list (sorted)
 * @param {boolean} justUnlocked    - pulsed true by RPGWorldPage after a milestone completes
 * @returns {{ currentIndex, newlyUnlockedIndex }}
 */
export function useCharacterMovement(milestones, justUnlocked) {
  const currentIndex = useMemo(() => {
    const idx = milestones.findIndex(
      (m) => m.status === "active" || m.status === "in_progress"
    );
    return idx === -1 ? Math.max(0, milestones.length - 1) : idx;
  }, [milestones]);

  const [newlyUnlockedIndex, setNewlyUnlockedIndex] = useState(null);

  useEffect(() => {
    if (!justUnlocked) return;
    const idx = milestones.findIndex((m) => m.status === "active");
    if (idx < 0) return;
    setNewlyUnlockedIndex(idx);
    const t = window.setTimeout(() => setNewlyUnlockedIndex(null), 2200);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [justUnlocked]);

  return { currentIndex, newlyUnlockedIndex };
}
