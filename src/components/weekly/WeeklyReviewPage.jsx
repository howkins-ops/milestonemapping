import React, { useState, useMemo } from "react";
import MilestoneReviewCards from "./MilestoneReviewCards.jsx";
import ReviewHistory from "./ReviewHistory.jsx";
import SundayReviewWizard from "./SundayReviewWizard.jsx";
import { useAppData } from "../../hooks/useAppData.js";
import { computeReviewStreak } from "../../lib/utils.js";

export default function WeeklyReviewPage() {
  const [active, setActive] = useState(false);
  const { weeklyReviews } = useAppData();

  const reviewStreak = useMemo(() => computeReviewStreak(weeklyReviews), [weeklyReviews]);
  const pending = weeklyReviews.length > 0 ? (weeklyReviews[0].commitments || []).length : 0;

  if (active) {
    return <SundayReviewWizard onClose={() => setActive(false)} />;
  }

  return (
    <div className="anim-fade-in">
      <header className="page-header">
        <div className="page-header__kicker">STRATEGY ROOM</div>
        <h1 className="page-header__title">
          Sunday Review: Update the map before the next mission begins.
        </h1>
        <p className="page-header__sub">The week is not over until the lesson is captured.</p>
      </header>

      {/* ── Cinematic launch hero ── */}
      <button type="button" className="swiz-launch" onClick={() => setActive(true)}>
        <span className="swiz-launch__grid" aria-hidden="true" />
        <span className="swiz-launch__glow" aria-hidden="true" />
        <span className="swiz-launch__body">
          <span className="swiz-launch__icon" aria-hidden="true">🧭</span>
          <span className="swiz-launch__title">Begin the Sunday Review</span>
          <span className="swiz-launch__sub">
            A 7-screen cinematic debrief — receipts, reflection, scorecard, next week's orders.
          </span>
          <span className="swiz-launch__meta">
            <span>🔥 {reviewStreak > 0 ? `${reviewStreak}-wk streak` : "Start your streak"}</span>
            <span>⚡ {pending > 0 ? `${pending} receipt${pending > 1 ? "s" : ""} to settle` : "Fresh slate"}</span>
            <span>+150 XP</span>
          </span>
          <span className="swiz-launch__cta">Enter the Strategy Room →</span>
        </span>
      </button>

      <div style={{ marginTop: 28 }}>
        <MilestoneReviewCards />
      </div>

      <div style={{ marginTop: 8 }}>
        <ReviewHistory />
      </div>
    </div>
  );
}
