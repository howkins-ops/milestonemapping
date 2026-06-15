import { useMemo } from "react";
import { getMilestoneProgress } from "../lib/progress.js";

/**
 * Derives all progress metrics for a list of milestones belonging to one project.
 * Pure computation — no side effects.
 */
export function useProjectProgress(milestones) {
  return useMemo(() => {
    const count = milestones.length;
    if (count === 0) {
      return { doneCount: 0, allDone: false, averageProgress: 0, fillPct: 0, level: 1, xp: 0 };
    }

    const doneCount = milestones.filter((m) => m.status === "completed").length;
    const allDone = doneCount === count;

    const averageProgress = Math.round(
      milestones.reduce((sum, m) => sum + getMilestoneProgress(m), 0) / count
    );

    const fillPct = Math.round((doneCount / count) * 100);
    const level = Math.max(1, doneCount + 1);
    const xp = doneCount * 1000 + averageProgress * 10;

    return { doneCount, allDone, averageProgress, fillPct, level, xp };
  }, [milestones]);
}
