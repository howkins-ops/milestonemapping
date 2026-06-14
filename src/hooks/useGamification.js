import { useMemo } from "react";
import { useAppData } from "./useAppData.js";
import { getRankFromXP, getNextRank, getXPProgressToNextRank } from "../lib/gamification.js";

export function useGamification() {
  const { xp, addXP } = useAppData();

  return useMemo(
    () => ({
      xp,
      addXP,
      rank: getRankFromXP(xp),
      nextRank: getNextRank(xp),
      progress: getXPProgressToNextRank(xp)
    }),
    [xp, addXP]
  );
}
