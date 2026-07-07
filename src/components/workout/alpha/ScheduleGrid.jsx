import React from "react";
import { PHASES } from "./data/phases.js";
import { weekGrid } from "./engine/scheduler.js";

/* ALPHA MODE — the 4-week rotation calendar for a zone.
   Rows = program weeks, cells = the rotation. Done-marks come from
   session meta; nutrition dots mark cheat (ember) and full-fast (chalk). */

const DAYS = ["M", "T", "W", "T", "F", "S", "S"];

export default function ScheduleGrid({ phaseId, week, sessions }) {
  const phase = PHASES[phaseId];
  if (!phase) return null;

  const doneSet = new Set(
    (sessions || [])
      .filter((s) => s.meta?.alpha?.phaseId === phaseId)
      .map((s) => `${s.meta.alpha.week}:${s.meta.alpha.workoutId}`)
  );

  return (
    <div className="iw-al-card">
      <div className="iw-eyebrow iw-al-card-title">the month · rotation {phase.rotationFill ? "(rotates fresh every week)" : ""}</div>
      <div className="iw-al-grid">
        <div className="iw-al-grid-row iw-al-grid-head">
          <span className="iw-al-grid-wk" />
          {DAYS.map((d, i) => <span key={i} className="iw-al-grid-day">{d}</span>)}
        </div>
        {[1, 2, 3, 4].map((w) => {
          const grid = weekGrid(phaseId, w);
          return (
            <div key={w} className={`iw-al-grid-row ${w === week ? "iw-al-grid-now" : ""} ${w < week ? "iw-al-grid-past" : ""}`}>
              <span className="iw-al-grid-wk">W{w}</span>
              {grid.map((slot, d) => {
                const done = slot.workoutId && doneSet.has(`${w}:${slot.workoutId}`);
                return (
                  <span key={d} className={`iw-al-grid-cell ${slot.kind === "workout" ? "iw-al-cell-work" : ""} ${done ? "iw-al-cell-done" : ""}`}>
                    <span className="iw-al-cell-label">
                      {done ? "✓" : slot.kind === "workout" ? `W${slot.workout?.n ?? ""}` : slot.kind === "cardio" ? "cd" : "·"}
                    </span>
                    <span className="iw-al-cell-dots" aria-hidden="true">
                      {slot.nutrition.cheat && <span className="iw-al-dot-cheat" title="cheat day" />}
                      {slot.nutrition.fullFast && <span className="iw-al-dot-fast" title="full fast" />}
                    </span>
                  </span>
                );
              })}
            </div>
          );
        })}
      </div>
      <div className="iw-al-grid-legend">
        <span><span className="iw-al-dot-cheat" /> cheat day</span>
        <span><span className="iw-al-dot-fast" /> full fast</span>
        <span>cd — cardio</span>
      </div>
    </div>
  );
}
