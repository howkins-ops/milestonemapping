import React, { useEffect, useState } from "react";
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

function IconCrystal() {
  return (
    <svg viewBox="0 0 32 32" width="28" height="28" aria-hidden="true"
      style={{ filter: "drop-shadow(0 0 8px rgba(0,240,255,0.7)) drop-shadow(0 0 16px rgba(0,240,255,0.35))" }}>
      <polygon points="16,2 28,11 28,21 16,30 4,21 4,11" fill="rgba(0,240,255,0.12)" stroke="#00F0FF" strokeWidth="1.5" />
      <polygon points="16,8 24,14 24,18 16,24 8,18 8,14" fill="rgba(0,240,255,0.22)" stroke="#00F0FF" strokeWidth="1" />
      <circle cx="16" cy="16" r="3" fill="#00F0FF" fillOpacity="0.6" />
    </svg>
  );
}

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
      <img
        className="mission-hero__art"
        src="/assets/dashboard/command-center-hero.png"
        alt=""
        aria-hidden="true"
      />
      {/* Subtle radial glow background — no PNG needed */}
      <div
        aria-hidden="true"
        className="mission-hero__wash"
        style={{
          background: "radial-gradient(ellipse at 70% 40%, rgba(209,30,255,0.18), transparent 60%), radial-gradient(ellipse at 20% 60%, rgba(0,240,255,0.12), transparent 50%)",
        }}
      />

      {/* Phoenix watermark (SVG component — no PNG) */}
      <PhoenixSVG
        width={195}
        style={{ position: "absolute", right: -40, bottom: -24, opacity: 0.14, pointerEvents: "none" }}
      />

      {/* Brand mark — inline SVG crystal */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}>
        <IconCrystal />
      </div>

      <p className="kicker" style={{ marginBottom: 6 }}>{formatDisplayDate()}</p>
      {displayName && <p className="mission-hero__welcome">Welcome back, {displayName}.</p>}
      <h1 className="mission-hero__title">Milestone Mapping</h1>
      <p className="mission-hero__slogan">
        Our map. <span className="mission-hero__grad">your transformation.</span>
      </p>
      <p className="muted" style={{ fontSize: 12, lineHeight: 1.5, marginBottom: 12 }}>
        Every milestone is a diamond. Collect them all.
      </p>

      <div className="mission-hero__body">
        <div className="mission-hero__charted">
          <ProgressRing value={overallProgress} size={72} label="Charted" />
        </div>

        <div style={{ flex: 1, minWidth: 170 }} />
      </div>

      {/* Stat cards — full-width row below the hero body */}
      <div className="mission-hero__stats">
        <div className="mission-hero__stat mission-hero__stat--streak">
          <div className="mission-hero__stat-icon">
            <img src="/assets/milestone-world/main-card-streak-neon-icon.png" alt="" aria-hidden="true" />
          </div>
          <span className="mission-hero__stat-n">{streakCount}</span>
          <span className="mission-hero__stat-l">Streak</span>
        </div>
        <div className="mission-hero__stat mission-hero__stat--maps">
          <div className="mission-hero__stat-icon">
            <img src="/assets/milestone-world/main-card-maps-neon-v2-icon.png" alt="" aria-hidden="true" />
          </div>
          <span className="mission-hero__stat-n">{activeCount}</span>
          <span className="mission-hero__stat-l">Maps</span>
        </div>
        <div className="mission-hero__stat mission-hero__stat--diamonds">
          <div className="mission-hero__stat-icon">
            <img src="/assets/milestone-world/main-card-diamonds-neon-v2-icon.png" alt="" aria-hidden="true" />
          </div>
          <span className="mission-hero__stat-n">{conqueredCount}</span>
          <span className="mission-hero__stat-l">Diamonds</span>
        </div>
      </div>
    </div>
  );
}
