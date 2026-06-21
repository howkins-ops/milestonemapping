// Single source of truth for every image path in the app.
// All components should import from here — no raw strings anywhere else.

// ── Re-export existing asset collections ─────────────────────────────────────
export {
  milestoneWorldAssets,
  crystalFrontierAssets,
  appAssets,
  getMapBackground,
  getMilestoneBackground,
} from "../lib/milestoneWorldAssets.js";

// ── Milestone node markers ────────────────────────────────────────────────────
const NODES = "/assets/nodes";

export const nodeAssets = {
  locked:      `${NODES}/milestone-node-locked.png`,
  active:      `${NODES}/milestone-node-active.png`,
  in_progress: `${NODES}/milestone-node-inprogress.png`,
  completed:   `${NODES}/milestone-node-completed.png`,
  opening:     `${NODES}/milestone-node-opening.png`,
  finalLocked: `${NODES}/milestone-node-final-locked.png`,
  finalActive: `${NODES}/milestone-node-final-active.png`,
};

export function getNodeAsset(status, isFinalGoal = false) {
  if (isFinalGoal) {
    return status === "locked" ? nodeAssets.finalLocked : nodeAssets.finalActive;
  }
  return nodeAssets[status] ?? nodeAssets.locked;
}

// ── Reward chests ─────────────────────────────────────────────────────────────
const CHEST = "/assets/treasure-system";

export const chestAssets = {
  src: (tier, state) => `${CHEST}/${tier}-chest-${state}.png`,
  xpBurst:       `${CHEST}/xp-burst.png`,
  diamondReward: `${CHEST}/diamond-reward.png`,
  epicClosed:    `${CHEST}/epic-chest-closed.png`,
};

export const REWARD_TIERS = [
  { key: "small",  threshold: 33,  label: "Small Reward",  field: "rewardSmall",  imageField: "rewardSmallImage",  claimKey: "small",  chestTier: "small"     },
  { key: "medium", threshold: 66,  label: "Medium Reward", field: "rewardMedium", imageField: "rewardMediumImage", claimKey: "medium", chestTier: "medium"    },
  { key: "large",  threshold: 100, label: "Final Reward",  field: "rewardLarge",  imageField: "rewardLargeImage",  claimKey: "large",  chestTier: "legendary" },
];

// ── Phoenix shrine ────────────────────────────────────────────────────────────
export const shrineAssets = {
  rebirthSwirl: "/assets/phoenix-shrine/rebirth-swirl.png",
};
