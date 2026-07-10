import React from "react";
import { PHASES } from "./data/phases.js";
import { weekGrid, dayIdxFromDate } from "./engine/scheduler.js";

/* ALPHA MODE — this week's schedule on the Today card.
   Plain day-by-day list (Monday → Sunday) with the real workout name
   on each day, today highlighted, finished days checked. No "W1/W2"
   codes, no month grid — just "what am I doing this week." */

const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function ScheduleGrid({ phaseId, week, sessions }) {
  const phase = PHASES[phaseId];
  if (!phase) return null;

  const todayIdx = dayIdxFromDate();
  const days = weekGrid(phaseId, week);
  const doneSet = new Set(
    (sessions || [])
      .filter((s) => s.meta?.alpha?.phaseId === phaseId)
      .map((s) => `${s.meta.alpha.week}:${s.meta.alpha.workoutId}`)
  );

  return (
    <div className="iw-al-card iw-al-zone-card iw-al-schedule-card">
      <div className="iw-eyebrow iw-al-card-title">this week · week {week} of 4</div>
      <div className="iw-al-weeklist">
        {days.map((s, di) => {
          const isToday = di === todayIdx;
          const done = s.workout && doneSet.has(`${week}:${s.workout.id}`);
          const label =
            s.kind === "workout" ? s.workout?.name
            : s.kind === "cardio" ? "Cardio — the long road"
            : "Rest day";
          return (
            <div key={di}
              className={`iw-al-wl-day ${s.kind === "workout" ? "iw-al-wl-work" : ""} ${s.kind === "rest" ? "iw-al-wl-rest" : ""} ${isToday ? "iw-al-wl-today" : ""} ${done ? "iw-al-wl-done" : ""}`}>
              <span className="iw-al-wl-name">{DAY_NAMES[di]}</span>
              <span className="iw-al-wl-lift">
                {label}
                {s.nutrition.cheat && <span className="iw-al-wl-tag iw-al-wl-tag-cheat"> · 🔥 cheat day</span>}
                {s.nutrition.fullFast && <span className="iw-al-wl-tag"> · ⏳ full fast</span>}
              </span>
              <span className="iw-al-wl-state">
                {done ? <span className="iw-al-wl-check">✓</span>
                  : isToday ? <span className="iw-al-wl-now">▶ today</span>
                  : null}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
