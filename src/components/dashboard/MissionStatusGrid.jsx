import React from "react";
import StatCard from "../ui/StatCard.jsx";
import { useDailyLog } from "../../hooks/useDailyLog.js";
import { useMilestones } from "../../hooks/useMilestones.js";
import { useGamification } from "../../hooks/useGamification.js";
import { useAppData } from "../../hooks/useAppData.js";
import { getRewardsFromMilestones } from "../../lib/progress.js";
import { isSunday, daysUntilSunday, getCurrentWeekNumber } from "../../lib/dates.js";

export default function MissionStatusGrid() {
  const { todayLog, doneCount } = useDailyLog();
  const { milestones } = useMilestones();
  const { xp, rank } = useGamification();
  const { weeklyReviews, projects } = useAppData();
  const activeProjects = projects.filter((p) => p.status === "active");

  const rewardsWaiting = getRewardsFromMilestones(milestones).filter(
    (r) => r.status === "preview_unlocked" || r.status === "fully_unlocked"
  ).length;

  const reviewedThisWeek = weeklyReviews.some(
    (r) => r.weekNumber === getCurrentWeekNumber()
  );

  return (
    <div className="grid-stats stagger" style={{ marginTop: 16 }}>
      <StatCard
        label="Top 5 Progress"
        value={`${doneCount}/${(todayLog.topFive || []).length || 5}`}
        hint={todayLog.completedTopFive ? "Day conquered" : "Execute the day"}
        tone="cyan"
        icon="⚡"
      />
      <StatCard
        label="Active Projects"
        value={activeProjects.length}
        hint={`${milestones.filter((m) => m.status === "active").length} milestones in motion`}
        tone="purple"
        icon="🏝"
      />
      <StatCard
        label="Rewards Waiting"
        value={rewardsWaiting}
        hint={rewardsWaiting > 0 ? "Claim what you earned" : "Keep stacking progress"}
        tone="gold"
        icon="🎁"
      />
      <StatCard
        label="Weekly Review"
        value={reviewedThisWeek ? "Done" : isSunday() ? "LIVE" : `${daysUntilSunday() || 7}d`}
        hint={reviewedThisWeek ? "Map updated" : "Next strategy session"}
        tone={isSunday() && !reviewedThisWeek ? "pink" : "green"}
        icon="🧭"
      />
      <StatCard label="XP Earned" value={xp.toLocaleString()} tone="pink" icon="✦" />
      <StatCard label="Current Rank" value={rank.name} tone="gold" icon="🛡" />
    </div>
  );
}
