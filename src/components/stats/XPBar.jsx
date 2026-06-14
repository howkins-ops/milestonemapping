import React, { useEffect, useState } from "react";
import Card from "../ui/Card.jsx";
import ProgressBar from "../ui/ProgressBar.jsx";
import RankBadge from "./RankBadge.jsx";
import { useGamification } from "../../hooks/useGamification.js";
import { useAppData } from "../../hooks/useAppData.js";
import { getStats } from "../../lib/statsService.js";
import { getXPProgressToNextRank } from "../../lib/gamification.js";

export default function XPBar() {
  const { xp, progress } = useGamification();
  const { userId } = useAppData();
  const [dbStats, setDbStats] = useState(null);

  useEffect(() => {
    if (userId) getStats(userId).then(({ data }) => { if (data) setDbStats(data); });
  }, [userId]);

  const displayXP = dbStats?.total_xp ?? xp;
  const displayProgress = dbStats
    ? getXPProgressToNextRank(dbStats.total_xp)
    : progress;

  return (
    <Card variant="neon">
      <div className="row row--between row--wrap" style={{ marginBottom: 16 }}>
        <RankBadge />
        <span className="mono" style={{ fontSize: 20, fontWeight: 700, color: "var(--brand-purple)" }}>
          ✦ {displayXP.toLocaleString()} XP
        </span>
      </div>
      <ProgressBar
        value={displayProgress.percent}
        max={100}
        variant="pink"
        label={
          displayProgress.next
            ? `${displayProgress.needed.toLocaleString()} XP to ${displayProgress.next.name}`
            : "Maximum rank achieved — Legend status"
        }
      />
    </Card>
  );
}
