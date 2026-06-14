import React from "react";
import WeeklyReviewForm from "./WeeklyReviewForm.jsx";
import MilestoneReviewCards from "./MilestoneReviewCards.jsx";
import ReviewHistory from "./ReviewHistory.jsx";
export default function WeeklyReviewPage() {
  return (
    <div className="anim-fade-in">
      <header className="page-header">
        <div className="page-header__kicker">STRATEGY ROOM</div>
        <h1 className="page-header__title">
          Sunday Review: Update the map before the next mission begins.
        </h1>
        <p className="page-header__sub">The week is not over until the lesson is captured.</p>
      </header>

      <MilestoneReviewCards />

      <div style={{ marginTop: 24 }}>
        <WeeklyReviewForm />
      </div>

      <div style={{ marginTop: 8 }}>
        <ReviewHistory />
      </div>
    </div>
  );
}
