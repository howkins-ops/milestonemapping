import React from "react";
import { PHASES } from "./data/phases.js";

/* ALPHA MODE — PRIME's carb ramp: a resource cap that levels up.
   30g → 75g → 100g training-day tiers unlocking by week. */

const TIERS = [
  { grams: 30, week: 1 },
  { grams: 75, week: 3 },
  { grams: 100, week: 4 },
];

export default function CarbRampMeter({ state }) {
  if (state.phase !== "prime") return null;
  const notes = PHASES.prime.eating.carbNotes || [];
  const note = notes[Math.min(state.week, 4) - 1];
  return (
    <div className="iw-al-card iw-al-zone-card iw-al-ramp-card">
      <div className="iw-eyebrow iw-al-card-title">the carb ramp · training days</div>
      <div className="iw-al-ramp">
        {TIERS.map((t) => {
          const open = state.week >= t.week;
          const current = open && (TIERS.filter((x) => state.week >= x.week).pop() === t);
          return (
            <div key={t.grams} className={`iw-al-ramp-tier ${open ? "iw-al-ramp-open" : ""} ${current ? "iw-al-ramp-now" : ""}`}>
              <span className="iw-al-ramp-num">{t.grams}g</span>
              <span className="iw-al-ramp-wk">{open ? (current ? "unlocked · active" : "unlocked") : `week ${t.week}`}</span>
              {!open && <span className="iw-al-ramp-lock" aria-hidden="true">🔒</span>}
            </div>
          );
        })}
      </div>
      <div className="iw-al-fastline">{note}</div>
    </div>
  );
}
