export const XP_VALUES = {
  dailyTaskCompleted: 10,
  fullTopFiveCompleted: 100,
  milestoneActionCompleted: 25,
  weeklyReviewCompleted: 150,
  milestoneCompleted: 500,
  rewardClaimed: 50,
  visionBoardItemAdded: 20,
  identityRuleAdded: 20,
  milestoneCreated: 50,
  projectCreated: 75,
  projectCompleted: 1000,
  commitmentKept: 25,
  allCommitmentsKept: 100,
  reviewStreak4: 200
};

export const RANKS = [
  { name: "Starter", min: 0, max: 99 },
  { name: "Builder", min: 100, max: 299 },
  { name: "Operator", min: 300, max: 749 },
  { name: "Warrior", min: 750, max: 1499 },
  { name: "Architect", min: 1500, max: 2999 },
  { name: "Empire Builder", min: 3000, max: 5999 },
  { name: "Legend", min: 6000, max: Infinity }
];

export function getRankFromXP(xp) {
  const safe = Math.max(0, Number(xp) || 0);
  return RANKS.find((r) => safe >= r.min && safe <= r.max) || RANKS[0];
}

export function getNextRank(xp) {
  const current = getRankFromXP(xp);
  const idx = RANKS.indexOf(current);
  return idx < RANKS.length - 1 ? RANKS[idx + 1] : null;
}

export function getXPProgressToNextRank(xp) {
  const safe = Math.max(0, Number(xp) || 0);
  const current = getRankFromXP(safe);
  const next = getNextRank(safe);
  if (!next) return { percent: 100, earned: safe - current.min, needed: 0, next: null, current };
  const span = next.min - current.min;
  const earned = safe - current.min;
  return {
    percent: Math.min(100, Math.round((earned / span) * 100)),
    earned,
    needed: next.min - safe,
    next,
    current
  };
}
