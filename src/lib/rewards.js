// Reward tier logic.
// 0–32%: locked | 33–65%: small preview | 66–99%: medium preview | 100%: large unlocked

export const REWARD_TIERS = [
  { tier: "small", label: "Small Reward", threshold: 33 },
  { tier: "medium", label: "Medium Reward", threshold: 66 },
  { tier: "large", label: "Large Reward", threshold: 100 }
];

export function getRewardTier(progress) {
  const p = Math.max(0, Math.min(100, Number(progress) || 0));
  if (p >= 100) return { stage: "large_unlocked", label: "Large reward unlocked", tier: "large" };
  if (p >= 66) return { stage: "medium_preview", label: "Medium preview unlocked", tier: "medium" };
  if (p >= 33) return { stage: "small_preview", label: "Small preview unlocked", tier: "small" };
  return { stage: "locked", label: "Rewards locked", tier: null };
}

export function getNextRewardThreshold(progress) {
  const p = Math.max(0, Math.min(100, Number(progress) || 0));
  const next = REWARD_TIERS.find((t) => p < t.threshold);
  return next || null;
}

export const REWARD_STATUS_LABELS = {
  locked: "Locked",
  preview_unlocked: "Preview Unlocked",
  fully_unlocked: "Fully Unlocked",
  claimed: "Claimed"
};
