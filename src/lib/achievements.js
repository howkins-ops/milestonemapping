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
    id: "day_one_vow",
    title: "The Vow",
    description: "Crossed over. Sealed it in flame.",
    icon: "🔥"
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
  },
  {
    id: "first_burn",
    title: "The First Burn",
    description: "You walked the full BUFCA and burned the old story. From the ashes, a commitment.",
    icon: "🔥"
  },
  {
    id: "wave_first",
    title: "First Wave Ridden",
    description: "You rode your first anxiety wave and stayed with yourself.",
    icon: "🌊"
  },
  {
    id: "wave_returned",
    title: "Returned Under Pressure",
    description: "You came back to ride the wave when it counted.",
    icon: "🏄"
  },
  {
    id: "hometown_departure",
    title: "The Road Out",
    description: "You took the send-off, packed your word, and walked out of the hometown toward the glow.",
    icon: "🛣️"
  },
  {
    id: "city_arrival",
    title: "Citizen of the City",
    description: "You stepped into MapQuest City for the first time. Every path now has an address.",
    icon: "🌆"
  },
  {
    id: "city_all_districts",
    title: "Every Street Known",
    description: "You visited every district in the city. The whole map is yours.",
    icon: "🧭"
  },
  {
    id: "hall_of_champions",
    title: "Hall of Champions",
    description: "You stood in the Hall and saw where you rank among your people.",
    icon: "🏛️"
  },
  {
    id: "first_lesson",
    title: "The Student Appears",
    description: "You heard your first lesson from a city mentor. The city teaches whoever listens.",
    icon: "🏮"
  },
  {
    id: "city_scholar",
    title: "City Scholar",
    description: "Eight mentors have taught you their lesson. The city speaks to you by name now.",
    icon: "📜"
  },
  {
    id: "spire_open",
    title: "The Tower Answers",
    description: "Fifteen districts lit — the sealed Spire woke floor by floor. Someone is waiting at the top.",
    icon: "◈"
  },
  {
    id: "crossing_begun",
    title: "The Solo Crossing",
    description: "Past the Spire, the road runs alone. Five cities wait, and something walks behind you.",
    icon: "🏜️"
  },
  {
    id: "city_flip",
    title: "Correctly Named",
    description: "You caught the flicker, spoke the true name, and a city's mask fell off the shadow.",
    icon: "🎭"
  },
  {
    id: "shadow_thanked",
    title: "The Thanking",
    description: "On the quiet road you thanked the old guard dog — and it fell in step beside you.",
    icon: "🕯️"
  },
  {
    id: "oasis_reached",
    title: "The Oasis",
    description: "Five voices, one shape, all named. Fatima waits past the fifth city — and the treasure waits at home.",
    icon: "🌴"
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
