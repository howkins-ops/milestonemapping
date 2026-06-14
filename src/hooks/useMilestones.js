import { useMemo } from "react";
import { useAppData } from "./useAppData.js";
import { getMilestoneProgress, getOverallProgress } from "../lib/progress.js";

export function useMilestones() {
  const {
    milestones,
    createMilestone,
    updateMilestone,
    deleteMilestone,
    completeMilestone,
    addMilestoneAction,
    updateMilestoneAction,
    deleteMilestoneAction,
    toggleMilestoneAction
  } = useAppData();

  const derived = useMemo(() => {
    const active = milestones.filter((m) => m.status === "active");
    const completed = milestones.filter((m) => m.status === "completed");
    return {
      active,
      completed,
      overallProgress: getOverallProgress(milestones),
      progressOf: getMilestoneProgress
    };
  }, [milestones]);

  return {
    milestones,
    ...derived,
    createMilestone,
    updateMilestone,
    deleteMilestone,
    completeMilestone,
    addMilestoneAction,
    updateMilestoneAction,
    deleteMilestoneAction,
    toggleMilestoneAction
  };
}
