import React from "react";
import { useDailyLog } from "../../hooks/useDailyLog.js";

export default function MorningPlanRecap() {
  const { todayLog } = useDailyLog();
  const hasCommit = !!todayLog.dailyCommit;
  const hasStand  = !!todayLog.dailyStand;

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
            <span>Gratitude below — drops anxiety 23%, sharpens your focus for the whole day</span>
          </div>
          <div className="morning-activation__step">
            <span className="morning-activation__step-num">02</span>
            <span>Your Top 5 — the exact moves that push your biggest projects forward today</span>
          </div>
          <div className="morning-activation__step">
            <span className="morning-activation__step-num">03</span>
            <span>One battle — one decisive win that makes today a victory worth building on</span>
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

      {hasStand && (
        <div className="morning-recap-card morning-recap-stand">
          <span className="morning-recap-label">MY STAND</span>
          <p className="morning-recap-text">"{todayLog.dailyStand}"</p>
        </div>
      )}
    </div>
  );
}
