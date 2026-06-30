export const ACHIEVEMENTS = [
  {
    id: "first_brick",
    title: "First Brick",
    description: "You made the first move.",
    icon: "🧱"
  },
  {
    id: "day_conquered",
    title: "Day Conquered",
    description: "Five votes cast for the future version of you.",
    icon: "⚔️"
  },
  {
    id: "mission_mapped",
    title: "Mission Mapped",
    description: "The future has coordinates.",
    icon: "🗺️"
  },
  {
    id: "sunday_strategist",
    title: "Sunday Strategist",
    description: "You reviewed the week and reloaded the mission.",
    icon: "🧭"
  },
  {
    id: "reward_earned",
    title: "Reward Earned",
    description: "Discipline paid you back.",
    icon: "🏆"
  },
  {
    id: "identity_shift",
    title: "Identity Shift",
    description: "The new version has a name.",
    icon: "🧬"
  },
  {
    id: "science_believer",
    title: "Science Believer",
    description: "You looked behind the curtain. Every feature has receipts.",
    icon: "🔬"
  },
  {
    id: "why_written",
    title: "The Why Activated",
    description: "You know your reason. That changes everything.",
    icon: "🔑"
  },
  {
    id: "belief_builder",
    title: "Belief Builder",
    description: "3+ core beliefs locked in. Your foundation is solid.",
    icon: "🏛️"
  },
  {
    id: "trainer_chosen",
    title: "Coach Selected",
    description: "You chose your trainer. The mission gets personal.",
    icon: "🎯"
  },
  {
    id: "streak_3",
    title: "3-Day Warrior",
    description: "Three days of execution. Momentum is real.",
    icon: "🔥"
  },
  {
    id: "streak_7",
    title: "7-Day Legend",
    description: "A full week of showing up. Identity is forming.",
    icon: "👑"
  },
  {
    id: "vision_set",
    title: "Vision Locked",
    description: "The future has an image now. See it clearly.",
    icon: "🔭"
  },
  {
    id: "rule_master",
    title: "Rule Master",
    description: "Five identity rules. The new version has a code.",
    icon: "📜"
  },
  {
    id: "first_project",
    title: "Mission Created",
    description: "The first project launched. The map is alive.",
    icon: "🚀"
  },
  {
    id: "accountability_first_win",
    title: "First Receipt",
    description: "You kept at least one commitment you made to yourself.",
    icon: "✅"
  },
  {
    id: "accountability_perfect",
    title: "Locked In",
    description: "100% of your commitments kept in a single week.",
    icon: "🔒"
  },
  {
    id: "accountability_streak_3",
    title: "3-Week Commitment Streak",
    description: "Three consecutive weeks of 75%+ commitments kept.",
    icon: "⚡"
  },
  {
    id: "review_streak_4",
    title: "4-Week Reviewer",
    description: "Four straight weeks showing up for the Sunday Review.",
    icon: "🧭"
  },
  {
    id: "shadow_alchemist",
    title: "Shadow Alchemist",
    description: "You met a mask and transmuted it into its essence.",
    icon: "🜂"
  }
];

export function getAchievementById(id) {
  return ACHIEVEMENTS.find((a) => a.id === id) || null;
}

export function isAchievementUnlocked(achievements, id) {
  return Array.isArray(achievements) && achievements.some((a) => a.id === id);
}

export function unlockAchievement(achievements, id) {
  const list = Array.isArray(achievements) ? achievements : [];
  if (isAchievementUnlocked(list, id)) return list;
  const def = getAchievementById(id);
  if (!def) return list;
  return [...list, { id, unlockedAt: new Date().toISOString() }];
}
