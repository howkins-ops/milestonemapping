import { useMemo } from "react";
import { useAppData } from "./useAppData.js";
import { ACHIEVEMENTS, isAchievementUnlocked } from "../lib/achievements.js";

export function useAchievements() {
  const { achievements, unlockAchievement } = useAppData();

  const list = useMemo(
    () =>
      ACHIEVEMENTS.map((def) => ({
        ...def,
        unlocked: isAchievementUnlocked(achievements, def.id),
        unlockedAt: (achievements.find((a) => a.id === def.id) || {}).unlockedAt || null
      })),
    [achievements]
  );

  return {
    achievements,
    list,
    unlockedCount: list.filter((a) => a.unlocked).length,
    unlockAchievement
  };
}
