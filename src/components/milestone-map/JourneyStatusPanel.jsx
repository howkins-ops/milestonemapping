import React from "react";

export default function JourneyStatusPanel({ completedCount, total, currentProgress }) {
  const momentum =
    currentProgress >= 70 ? "High" : currentProgress >= 30 ? "Building" : "Starting";

  return (
    <aside className="trail-world__panel trail-world__panel--left" aria-label="Journey status">
      <span className="trail-world__panel-title">JOURNEY STATUS</span>
      <div className="trail-world__level">
        <span>LEVEL</span>
        <strong>{Math.max(1, completedCount + 1)}</strong>
      </div>
      <div className="trail-world__stat">
        <span>Milestones</span>
        <strong>{completedCount}/{total}</strong>
      </div>
      <div className="trail-world__meter">
        <span style={{ width: `${currentProgress}%` }} />
      </div>
      <div className="trail-world__stat">
        <span>Momentum</span>
        <strong>{momentum}</strong>
      </div>
      <p>Every step reveals more of your destiny.</p>
    </aside>
  );
}
