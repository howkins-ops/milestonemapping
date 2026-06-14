import React, { useEffect, useState } from "react";
import ProgressBar from "../ui/ProgressBar.jsx";
import ProgressRing from "../ui/ProgressRing.jsx";
import PhoenixSVG from "../ui/PhoenixSVG.jsx";
import { formatDisplayDate } from "../../lib/dates.js";
import { useGamification } from "../../hooks/useGamification.js";
import { useDailyLog } from "../../hooks/useDailyLog.js";
import { useMilestones } from "../../hooks/useMilestones.js";
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

export default function MissionHero() {
  const { rank, xp, progress } = useGamification();
  const { streaks } = useDailyLog();
  const { overallProgress } = useMilestones();
  const { projects, celebrate, settings, profile, userId } = useAppData();
  const activeCount = projects.filter((p) => p.status !== "completed").length;
  const conqueredCount = projects.filter((p) => p.status === "completed").length;
  const [dbStats, setDbStats] = useState(null);

  const displayName = profile?.display_name || profile?.full_name || null;
  const streakCount = dbStats?.streak_days ?? streaks.current;

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
      {/* phoenix watermark */}
      <PhoenixSVG
        width={260}
        style={{ position: "absolute", right: -52, bottom: -32, opacity: 0.14, pointerEvents: "none" }}
      />

      <p className="kicker" style={{ marginBottom: 6 }}>{formatDisplayDate()}</p>
      <h1 className="mission-hero__title">
        {displayName ? `Welcome back, ${displayName}.` : "Our map."}<br />
        <span className="mission-hero__grad">your transformation.</span>
      </h1>
      <p className="muted" style={{ fontSize: 14, lineHeight: 1.5, marginBottom: 16 }}>
        Every milestone is a diamond. Collect them all.
      </p>

      <div className="mission-hero__body">
        <ProgressRing value={overallProgress} size={96} label="Charted" />

        <div style={{ flex: 1, minWidth: 170 }}>
          <div className="mission-hero__stats">
            <div className="mission-hero__stat mission-hero__stat--streak">
              <span className="mission-hero__stat-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M12 2C12 2 7 8 7 13a5 5 0 0010 0c0-3.5-2-7-5-11z" fill="#FF3EDB" opacity="0.25"/>
                  <path d="M12 2C12 2 7 8 7 13a5 5 0 0010 0c0-3.5-2-7-5-11z" stroke="#FF3EDB" strokeWidth="1.5" strokeLinejoin="round"/>
                  <path d="M12 14c0 0-2-2-1-4 0 0 1 2 3 2s2-2 2-2c0 2-1 4-4 4z" fill="#FF3EDB"/>
                </svg>
              </span>
              <span className="mission-hero__stat-n">{streakCount}</span>
              <span className="mission-hero__stat-l">Streak</span>
            </div>
            <div className="mission-hero__stat mission-hero__stat--maps">
              <span className="mission-hero__stat-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M9 4L3 7v13l6-3 6 3 6-3V4l-6 3-6-3z" stroke="#D11EFF" strokeWidth="1.5" strokeLinejoin="round"/>
                  <line x1="9" y1="4" x2="9" y2="17" stroke="#D11EFF" strokeWidth="1.5"/>
                  <line x1="15" y1="7" x2="15" y2="20" stroke="#D11EFF" strokeWidth="1.5"/>
                </svg>
              </span>
              <span className="mission-hero__stat-n">{activeCount}</span>
              <span className="mission-hero__stat-l">Maps</span>
            </div>
            <div className="mission-hero__stat mission-hero__stat--diamonds">
              <span className="mission-hero__stat-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M12 3L3 9l9 12 9-12-9-6z" stroke="#FF3EDB" strokeWidth="1.5" strokeLinejoin="round"/>
                  <path d="M3 9h18M8 9L12 3l4 6" stroke="#FF3EDB" strokeWidth="1.5" strokeLinejoin="round"/>
                </svg>
              </span>
              <span className="mission-hero__stat-n">{conqueredCount}</span>
              <span className="mission-hero__stat-l">Diamonds</span>
            </div>
          </div>
          <div style={{ marginTop: 10 }}>
            <ProgressBar
              value={progress.percent}
              max={100}
              variant="pink"
            />
            <div
              className="mono soft"
              style={{ display: "flex", justifyContent: "space-between", fontSize: 10, marginTop: 6, letterSpacing: "0.1em" }}
            >
              <span>{rank.name}</span>
              <span>
                {progress.next
                  ? `${xp.toLocaleString()} / ${progress.next.min.toLocaleString()} XP`
                  : "MAX RANK"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
