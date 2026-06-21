import React, { useEffect, useMemo, useState } from "react";
import { formatDisplayDate } from "../../lib/dates.js";
import { useDailyLog } from "../../hooks/useDailyLog.js";
import { useAppData } from "../../hooks/useAppData.js";
import { playSound } from "../../lib/sounds.js";
import { getStats } from "../../lib/statsService.js";

const STREAK_MILESTONES = [
  {
    days: 7,
    key: "science_streak_7",
    title: "HABIT FORMING.",
    subtitle: "Lally's research shows you're on track. Habits start forming in as few as 18 days.",
    detail: "🔥 7-Day Streak · Science says keep going."
  },
  {
    days: 21,
    key: "science_streak_21",
    title: "PAST THE MYTH.",
    subtitle: "You've outlasted the 21-day myth. Research shows the real average is 66 days. You're building something real.",
    detail: "🔥 21-Day Streak · The 21-day myth is dead."
  },
  {
    days: 66,
    key: "science_streak_66",
    title: "YOU HIT THE AVERAGE.",
    subtitle: "Lally's research found 66 days as the average habit formation point. You're there. This is now identity.",
    detail: "🔥 66-Day Streak · Identity confirmed."
  }
];

const EMBER_COLORS = ["#00F0FF", "#D11EFF", "#FF3EDB", "#7B2CFF"];

export default function MissionHero() {
  const { streaks } = useDailyLog();
  const { celebrate, settings, userId } = useAppData();
  const [dbStats, setDbStats] = useState(null);

  const streakCount = dbStats?.streak_days ?? streaks.current;

  const embers = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        left: 12 + Math.random() * 76,
        color: EMBER_COLORS[i % EMBER_COLORS.length],
        delay: Math.random() * 6,
        duration: 5 + Math.random() * 4,
      })),
    []
  );

  useEffect(() => {
    if (userId) getStats(userId).then(({ data }) => { if (data) setDbStats(data); });
  }, [userId]);

  useEffect(() => {
    const current = streakCount;
    for (const milestone of STREAK_MILESTONES) {
      if (current === milestone.days && !sessionStorage.getItem(milestone.key)) {
        sessionStorage.setItem(milestone.key, "1");
        celebrate({ variant: "science_streak", title: milestone.title, subtitle: milestone.subtitle, detail: milestone.detail });
        playSound("insight", settings);
        break;
      }
    }
  }, [streakCount]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="mission-hero anim-slide-up">
      <p className="mission-hero__date">{formatDisplayDate()}</p>

      <div className="mission-hero__crest">
        <div className="mission-hero__aura" aria-hidden="true" />
        <img
          className="mission-hero__logo"
          src="/assets/brand/milestone-mapping-logo-v2.png"
          alt="Milestone Mapping — Our map. Your transformation."
        />
      </div>

      {embers.map((e, i) => (
        <span
          key={i}
          className="mission-hero__ember"
          aria-hidden="true"
          style={{
            left: `${e.left}%`,
            background: e.color,
            boxShadow: `0 0 8px ${e.color}`,
            animationDelay: `${e.delay}s`,
            animationDuration: `${e.duration}s`,
          }}
        />
      ))}
    </div>
  );
}
