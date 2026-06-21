import React, { useState } from "react";

export default function JourneyStatusPanel({ completedCount, total, currentProgress }) {
  const [open, setOpen] = useState(true);
  const momentum =
    currentProgress >= 70 ? "High" : currentProgress >= 30 ? "Building" : "Starting";

  return (
    <aside
      className={`trail-world__panel trail-world__panel--right ${open ? "" : "is-collapsed"}`}
      aria-label="Journey status"
    >
      <div className="trail-world__panel-head">
        <span className="trail-world__panel-title">JOURNEY STATUS</span>
        <button
          type="button"
          className="trail-world__panel-toggle"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? "Collapse journey status" : "Expand journey status"}
        >
          {open ? "−" : "+"}
        </button>
      </div>

      {open && (
        <>
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
        </>
      )}
    </aside>
  );
}
