// Reward tier definitions and helpers.
// REWARD_TIERS is the canonical list — import from here in all components.
export { REWARD_TIERS, chestAssets } from "./assetRegistry.js";

/**
 * Returns the chest display state for a given tier.
 * @param {number} progress - 0-100
 * @param {object} claimed - milestone.rewardsClaimed
 * @param {string} claimKey - e.g. "small" | "medium" | "large"
 */
export function getChestState(progress, claimed, claimKey, threshold) {
  if (claimed?.[claimKey]) return "open";
  if (progress >= threshold) return "opening";
  return "closed";
}

/**
 * Returns which tiers are currently claimable (unlocked but not yet claimed).
 */
export function getClaimableTiers(progress, claimed, tiers) {
  return tiers.filter(
    (t) => progress >= t.threshold && !claimed?.[t.claimKey]
  );
}
