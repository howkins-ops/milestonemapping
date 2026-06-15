import { useState, useCallback } from "react";
import { useAppData } from "./useAppData.js";

/**
 * Handles the "complete milestone" flow: 820ms collecting animation → call
 * completeMilestone → fire onComplete callback.
 *
 * @param {string}   milestoneId
 * @param {Function} onComplete  - called after the animation + data update
 * @returns {{ collecting, handleComplete }}
 */
export function useMilestoneCompletion(milestoneId, onComplete) {
  const { completeMilestone } = useAppData();
  const [collecting, setCollecting] = useState(false);

  const handleComplete = useCallback(() => {
    if (collecting) return;
    setCollecting(true);
    setTimeout(() => {
      completeMilestone(milestoneId);
      setCollecting(false);
      onComplete?.();
    }, 820);
  }, [collecting, milestoneId, completeMilestone, onComplete]);

  return { collecting, handleComplete };
}
