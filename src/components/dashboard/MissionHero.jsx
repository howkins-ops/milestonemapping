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

const HERO_ICONS = {
  brandMark: "/assets/icons/icon-crystal.png",
  charted:   "/assets/icons/icon-compass.png",
  streak:    "/assets/icons/icon-flame.png",
  maps:      "/assets/icons/icon-portal.png",
  diamonds:  "/assets/icons/icon-diamond.png",
};

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
      {/* background art */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0, borderRadius: "inherit",
          backgroundImage: "url(/assets/dashboard/hero-banner-bg.png)",
          backgroundSize: "cover", backgroundPosition: "center", opacity: 0.22,
        }}
      />

      {/* phoenix watermark */}
      <PhoenixSVG
        width={195}
        style={{ position: "absolute", right: -40, bottom: -24, opacity: 0.14, pointerEvents: "none" }}
      />

      {/* Brand mark */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}>
        <img
          src={HERO_ICONS.brandMark}
          alt=""
          aria-hidden="true"
          onError={(e) => { e.currentTarget.style.display = "none"; }}
          style={{
            width: 28,
            height: 28,
            objectFit: "contain",
            filter: "drop-shadow(0 0 8px rgba(0, 240, 255, 0.7)) drop-shadow(0 0 16px rgba(0, 240, 255, 0.35))",
          }}
        />
      </div>

      <p className="kicker" style={{ marginBottom: 6 }}>{formatDisplayDate()}</p>
      <h1 className="mission-hero__title">
        {displayName ? `Welcome back, ${displayName}.` : "Our map."}<br />
        <span className="mission-hero__grad">your transformation.</span>
      </h1>
      <p className="muted" style={{ fontSize: 12, lineHeight: 1.5, marginBottom: 12 }}>
        Every milestone is a diamond. Collect them all.
      </p>

      <div className="mission-hero__body">
        <div className="mission-hero__charted">
          <img src={HERO_ICONS.charted} alt="" aria-hidden="true" />
          <ProgressRing value={overallProgress} size={72} label="Charted" />
        </div>

        <div style={{ flex: 1, minWidth: 170 }} />
      </div>

      {/* Stat cards — full-width row below the hero body */}
      <div className="mission-hero__stats">
        <div className="mission-hero__stat mission-hero__stat--streak">
          <div className="mission-hero__stat-icon">
            <img src={HERO_ICONS.streak} alt="" aria-hidden="true" />
          </div>
          <span className="mission-hero__stat-n">{streakCount}</span>
          <span className="mission-hero__stat-l">Streak</span>
        </div>
        <div className="mission-hero__stat mission-hero__stat--maps">
          <div className="mission-hero__stat-icon">
            <img src={HERO_ICONS.maps} alt="" aria-hidden="true" />
          </div>
          <span className="mission-hero__stat-n">{activeCount}</span>
          <span className="mission-hero__stat-l">Maps</span>
        </div>
        <div className="mission-hero__stat mission-hero__stat--diamonds">
          <div className="mission-hero__stat-icon">
            <img src={HERO_ICONS.diamonds} alt="" aria-hidden="true" />
          </div>
          <span className="mission-hero__stat-n">{conqueredCount}</span>
          <span className="mission-hero__stat-l">Diamonds</span>
        </div>
      </div>
    </div>
  );
}
