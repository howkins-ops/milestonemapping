import React, { useEffect, useState } from "react";
import StatCard from "../ui/StatCard.jsx";
import { useAppData } from "../../hooks/useAppData.js";
import { useDailyLog } from "../../hooks/useDailyLog.js";
import { useGamification } from "../../hooks/useGamification.js";
import {
  getOverallProgress,
  getCompletedActionsCount,
  getTotalActionsCount,
  getRewardsFromMilestones
} from "../../lib/progress.js";
import { getStats } from "../../lib/statsService.js";

export default function StatsGrid() {
  const { projects, milestones, weeklyReviews, userId } = useAppData();
  const { todayLog, doneCount, streaks } = useDailyLog();
  const { xp, rank } = useGamification();
  const [dbStats, setDbStats] = useState(null);

  useEffect(() => {
    if (userId) getStats(userId).then(({ data }) => { if (data) setDbStats(data); });
  }, [userId]);

  const rewards = getRewardsFromMilestones(milestones);
  const rewardsUnlocked = rewards.filter((r) => r.status !== "locked").length;
  const rewardsClaimed = rewards.filter((r) => r.status === "claimed").length;

  // Prefer DB stats where available, fall back to computed
  const streak = dbStats?.streak_days ?? streaks.current;
  const longestStreak = dbStats?.longest_streak ?? streaks.longest;
  const totalXP = dbStats?.total_xp ?? xp;
  const gratitudeCount = dbStats?.gratitude_count ?? 0;
  const proofCount = dbStats?.daily_proof_count ?? 0;
  const reviewsCompleted = dbStats?.weekly_reviews_completed ?? weeklyReviews.length;

  return (
    <div className="grid-stats stagger">
      <StatCard label="Total Projects" value={projects.length} tone="cyan" icon="🏝" />
      <StatCard
        label="Projects Conquered"
        value={dbStats?.projects_completed ?? projects.filter((p) => p.status === "completed").length}
        tone="gold"
        icon="🏆"
      />
      <StatCard label="Total Milestones" value={milestones.length} tone="cyan" icon="🗺" />
      <StatCard
        label="Active Milestones"
        value={milestones.filter((m) => m.status === "active").length}
        tone="cyan"
        icon="📡"
      />
      <StatCard
        label="Completed Milestones"
        value={dbStats?.milestones_completed ?? milestones.filter((m) => m.status === "completed").length}
        tone="green"
        icon="✓"
      />
      <StatCard label="Total Actions" value={getTotalActionsCount(milestones)} icon="🧱" />
      <StatCard
        label="Completed Actions"
        value={getCompletedActionsCount(milestones)}
        tone="green"
        icon="⚒"
      />
      <StatCard
        label="Overall Progress"
        value={`${getOverallProgress(milestones)}%`}
        tone="cyan"
        icon="🧭"
      />
      <StatCard
        label="Top 5 Today"
        value={`${doneCount}/${(todayLog.topFive || []).length || 5}`}
        tone="purple"
        icon="⚡"
      />
      <StatCard label="Gratitude Entries" value={gratitudeCount} tone="green" icon="🌅" />
      <StatCard label="Daily Proof Logged" value={proofCount} tone="cyan" icon="📸" />
      <StatCard label="Weekly Reviews" value={reviewsCompleted} tone="purple" icon="📜" />
      <StatCard
        label="Current Streak"
        value={`${streak}d`}
        hint="Days active"
        tone="pink"
        icon="🔥"
      />
      <StatCard label="Longest Streak" value={`${longestStreak}d`} tone="pink" icon="🏔" />
      <StatCard label="Total XP" value={totalXP.toLocaleString()} tone="purple" icon="✦" />
      <StatCard label="Current Rank" value={rank.name} tone="gold" icon="🛡" />
      <StatCard
        label="Rewards Unlocked"
        value={dbStats?.rewards_unlocked ?? rewardsUnlocked}
        tone="gold"
        icon="🔓"
      />
      <StatCard label="Rewards Claimed" value={rewardsClaimed} tone="gold" icon="🎁" />
    </div>
  );
}
