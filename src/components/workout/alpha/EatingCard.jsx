import React from "react";
import { dayMacros } from "./engine/eatingEngine.js";
import { PHASES } from "./data/phases.js";

/* ALPHA MODE — today's eating equation, phase/week/day aware. */

export default function EatingCard({ state, slot, dayLabel, onOpenCalculator, onOpenFridge }) {
  const phase = PHASES[state.phase];
  if (!phase || !state.bodyWeight) return null;

  if (slot?.nutrition.cheat) {
    return (
      <div className="iw-al-card iw-al-cheatline">
        <div className="iw-al-card-head">
          <span className="iw-eyebrow">today · {dayLabel} · your food</span>
          <span className="iw-chip iw-chip-ember">cheat day</span>
        </div>
        <div className="iw-al-offledger">OFF THE LEDGER</div>
        <div className="iw-al-fastline">
          No counting today. Three rules only: don't eat to sickness ·
          same-day food only · zero guilt. The furnace is fed on purpose.
        </div>
      </div>
    );
  }

  const isWorkoutDay = Boolean(slot?.nutrition.isWorkoutDay);
  const m = dayMacros({
    weightLb: state.bodyWeight, bodyFatPct: state.bodyFat,
    phaseId: state.phase, week: state.week, isWorkoutDay,
  });
  if (!m) return null;

  const surplus = m.calories > m.maintenance;

  return (
    <div className="iw-al-card">
      <div className="iw-al-card-head">
        <span className="iw-eyebrow">today · {dayLabel} · the eating equation</span>
        <span className={`iw-chip ${isWorkoutDay ? "iw-chip-ember" : ""}`}>
          {isWorkoutDay ? "training day" : "rest day"}
        </span>
      </div>
      <div className="iw-al-macros">
        <div className="iw-al-macro"><span className="iw-al-macro-num">{m.calories.toLocaleString()}</span><span className="iw-al-macro-label">calories</span></div>
        <div className="iw-al-macro"><span className="iw-al-macro-num">{m.protein}g</span><span className="iw-al-macro-label">protein</span></div>
        <div className="iw-al-macro"><span className="iw-al-macro-num">{m.carbs}g</span><span className="iw-al-macro-label">carbs</span></div>
        <div className="iw-al-macro"><span className="iw-al-macro-num">{m.fat}g</span><span className="iw-al-macro-label">fat</span></div>
      </div>
      <div className="iw-al-fastline">
        {surplus
          ? `today you eat like a builder — ${m.calories - m.maintenance} above the line, earned under the bar`
          : slot?.nutrition.fullFast
            ? "full-fast day — and the 400-cal dinner fallback ALWAYS counts if you need it"
            : `${m.maintenance - m.calories} under the line · carbs land late — post-workout, toward the night`}
      </div>
      {onOpenFridge && (
        <button className="iw-al-calclink" onClick={onOpenFridge}>
          🍽 see today&apos;s plate — meal by meal, in the Fridge
        </button>
      )}
      {onOpenCalculator && (
        <button className="iw-al-calclink" onClick={onOpenCalculator}>
          ⚖ open the food calculator — turn the dials
        </button>
      )}
    </div>
  );
}
