import React from "react";
import Card from "../ui/Card.jsx";
import { getScorecardLabel } from "../../lib/constants.js";

const SLIDERS = [
  { key: "executionScore", label: "Execution" },
  { key: "energyScore", label: "Energy" },
  { key: "focusScore", label: "Focus" },
  { key: "disciplineScore", label: "Discipline" },
  { key: "mindsetScore", label: "Faith / Mindset" }
];

export default function WeeklyScorecard({ scores, onChange }) {
  const total = SLIDERS.reduce((sum, s) => sum + (Number(scores[s.key]) || 0), 0);
  const label = getScorecardLabel(total);

  return (
    <Card variant="neon">
      <div className="row row--between row--wrap" style={{ marginBottom: 18 }}>
        <h3 style={{ fontSize: 17 }}>Weekly Scorecard</h3>
        <div className="row">
          <span className="mono" style={{ fontSize: 22, fontWeight: 700, color: "var(--brand-cyan)" }}>
            {total}/50
          </span>
          <span className="badge badge--gold">{label}</span>
        </div>
      </div>
      <div className="stack" style={{ gap: 14 }}>
        {SLIDERS.map((s) => (
          <div key={s.key} className="field">
            <div className="row row--between">
              <label className="field__label" htmlFor={`slider-${s.key}`}>
                {s.label}
              </label>
              <span className="mono" style={{ fontSize: 13, color: "var(--brand-green)" }}>
                {scores[s.key]}/10
              </span>
            </div>
            <input
              id={`slider-${s.key}`}
              className="range"
              type="range"
              min="1"
              max="10"
              value={scores[s.key]}
              onChange={(e) => onChange(s.key, Number(e.target.value))}
            />
          </div>
        ))}
      </div>
    </Card>
  );
}
