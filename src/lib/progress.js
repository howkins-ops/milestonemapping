import { getRewardTier } from "./rewards.js";

export function getMilestoneProgress(milestone) {
  if (!milestone) return 0;
  if (milestone.status === "completed") return 100;
  // Counter mode: a numeric target drives progress (overrides action-based %).
  if (milestone.targetValue > 0) {
    const cur = Number(milestone.currentValue) || 0;
    return Math.max(0, Math.min(100, Math.round((cur / milestone.targetValue) * 100)));
  }
  const actions = milestone.actions || [];
  if (actions.length === 0) return 0;
  const done = actions.filter((a) => a.done).length;
  return Math.round((done / actions.length) * 100);
}

// True when a counter-mode milestone has hit (or passed) its numeric target.
export function isGoalReached(milestone) {
  return Boolean(
    milestone?.targetValue > 0 &&
      (Number(milestone.currentValue) || 0) >= milestone.targetValue
  );
}

export function getOverallProgress(milestones) {
  const list = milestones || [];
  if (list.length === 0) return 0;
  const total = list.reduce((sum, m) => sum + getMilestoneProgress(m), 0);
  return Math.round(total / list.length);
}

export function getCompletedActionsCount(milestones) {
  return (milestones || []).reduce(
    (sum, m) => sum + (m.actions || []).filter((a) => a.done).length,
    0
  );
}

export function getTotalActionsCount(milestones) {
  return (milestones || []).reduce((sum, m) => sum + (m.actions || []).length, 0);
}

export function getNextIncompleteAction(milestone) {
  if (!milestone) return null;
  const actions = [...(milestone.actions || [])].sort(
    (a, b) => (a.weekNumber || 0) - (b.weekNumber || 0)
  );
  return actions.find((a) => !a.done) || null;
}

/* ---------------- project helpers ---------------- */

export function getProjectMilestones(milestones, projectId) {
  return (milestones || []).filter((m) => m.projectId === projectId);
}

// Average progress across a project's milestones (0 if it has none).
export function getProjectProgress(project, milestones) {
  const list = getProjectMilestones(milestones, project && project.id);
  if (list.length === 0) return project && project.status === "completed" ? 100 : 0;
  const total = list.reduce((sum, m) => sum + getMilestoneProgress(m), 0);
  return Math.round(total / list.length);
}

export function isProjectComplete(project, milestones) {
  const list = getProjectMilestones(milestones, project && project.id);
  return list.length > 0 && list.every((m) => m.status === "completed");
}

// First non-completed milestone of a project (the "current node" on the trail).
export function getNextMilestone(project, milestones) {
  const list = getProjectMilestones(milestones, project && project.id);
  return list.find((m) => m.status !== "completed") || null;
}

export function getRewardStatus(milestone) {
  return getRewardTier(getMilestoneProgress(milestone));
}

export function getRewardsFromMilestones(milestones) {
  const tiers = [
    { tier: "small", label: "Small Reward", threshold: 33, field: "rewardSmall" },
    { tier: "medium", label: "Medium Reward", threshold: 66, field: "rewardMedium" },
    { tier: "large", label: "Large Reward", threshold: 100, field: "rewardLarge" }
  ];

  const rewards = [];
  for (const m of milestones || []) {
    const progress = getMilestoneProgress(m);
    for (const t of tiers) {
      const text = (m[t.field] || "").trim();
      if (!text) continue;
      const claimed = Boolean(m.rewardsClaimed && m.rewardsClaimed[t.tier]);
      const unlocked = progress >= t.threshold;
      const imageField = `${t.field}Image`;
      rewards.push({
        id: `${m.id}_${t.tier}`,
        milestoneId: m.id,
        milestoneTitle: m.title,
        tier: t.tier,
        label: t.label,
        text,
        threshold: t.threshold,
        progress,
        imageUrl: m[imageField] || null,
        status: claimed
          ? "claimed"
          : unlocked
            ? t.tier === "large"
              ? "fully_unlocked"
              : "preview_unlocked"
            : "locked"
      });
    }
  }
  return rewards;
}
