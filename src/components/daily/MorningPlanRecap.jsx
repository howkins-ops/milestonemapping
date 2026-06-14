import React from "react";
import { useDailyLog } from "../../hooks/useDailyLog.js";

export default function MorningPlanRecap() {
  const { todayLog } = useDailyLog();
  const hasCommit = !!todayLog.dailyCommit;
  const hasStand  = !!todayLog.dailyStand;

  if (!hasCommit && !hasStand) {
    return (
      <div className="morning-recap-empty">
        <span className="morning-recap-empty-icon">🌙</span>
        <p className="morning-recap-empty-text">No night plan found.</p>
        <p className="morning-recap-empty-sub">
          Switch to <strong>Night Mode</strong> tonight to pre-load your commit, stand, and top 5 — so tomorrow you wake up with a target.
        </p>
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
