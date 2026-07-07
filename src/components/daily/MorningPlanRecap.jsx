import React from "react";
import { useDailyLog } from "../../hooks/useDailyLog.js";

export default function MorningPlanRecap() {
  const { todayLog } = useDailyLog();
  const hasCommit = !!todayLog.dailyCommit;
  const hasStand  = !!todayLog.dailyStand;

  // Note: this overview sits at the top of the morning flow; the stand itself is
  // shown in full (with checklist + intention) by MorningStandPanel below — don't repeat it here.
  if (!hasCommit && !hasStand) {
    return (
      <div className="morning-activation anim-fade-in">
        <div className="morning-activation__glow" />

        <div className="morning-activation__content">
          <h2 className="morning-activation__headline">
            Win the morning.<br />Own the day.
          </h2>
          <p className="morning-activation__sub">
            Your goals don't close themselves. <strong>Every move you make below gets you closer.</strong> Three steps. Five minutes. Today is yours.
          </p>
        </div>

        <div className="morning-activation__steps">
          <div className="morning-activation__step">
            <span className="morning-activation__step-num">01</span>
            <span><strong className="morning-activation__step-key">Take your stand</strong> — decide who you are before the day decides for you</span>
          </div>
          <div className="morning-activation__step">
            <span className="morning-activation__step-num">02</span>
            <span><strong className="morning-activation__step-key">Gratitude</strong> — drops anxiety <strong className="morning-activation__step-hot">23%</strong>, sharpens your focus for the whole day</span>
          </div>
          <div className="morning-activation__step">
            <span className="morning-activation__step-num">03</span>
            <span><strong className="morning-activation__step-key">Your Top 5</strong> — the exact moves that push your biggest projects forward today</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="morning-recap-section anim-fade-in">
      {/* Execute banner */}
      <div className="morning-execute-banner">
        <div className="morning-execute-banner-glow" />
        <span className="morning-execute-eyebrow">YOU LOADED THIS LAST NIGHT</span>
        <h2 className="morning-execute-title">Time to Execute.</h2>
        <p className="morning-execute-sub">You planned it. You said it. Now go prove it.</p>
      </div>

      {hasCommit && (
        <div className="morning-recap-card morning-recap-commit">
          <span className="morning-recap-label">TODAY I COMMIT TO</span>
          <p className="morning-recap-text">"{todayLog.dailyCommit}"</p>
        </div>
      )}
    </div>
  );
}
