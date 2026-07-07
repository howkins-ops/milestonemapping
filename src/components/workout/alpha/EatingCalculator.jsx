import React, { useState } from "react";
import { PHASES, PHASE_ORDER } from "./data/phases.js";
import { leanBodyMass, maintenanceMultiplier, maintenanceCalories, dayMacros } from "./engine/eatingEngine.js";
import { sfxCoin } from "../../../lib/sfx.js";

/* ═══════════════════════════════════════════════════════════════
   THE EATING EQUATION — the food calculator.
   Turn the dials (weight, body fat, phase, week) and watch both
   sides of the equation: training day vs rest day. Save the dials
   back to your character sheet when the scale moves.
   ═══════════════════════════════════════════════════════════════ */

function CalcStepper({ label, value, step, min, max, onChange, suffix = "" }) {
  const clamp = (n) => Math.min(max, Math.max(min, Math.round(n * 10) / 10));
  return (
    <div className="iw-stepper iw-stepper-wide">
      <span className="iw-eyebrow">{label}</span>
      <div className="iw-stepper-row">
        <button className="iw-step-btn" onClick={() => onChange(clamp(value - step))}>−</button>
        <span className="iw-step-val">{value}{suffix}</span>
        <button className="iw-step-btn" onClick={() => onChange(clamp(value + step))}>＋</button>
      </div>
    </div>
  );
}

function MacroPanel({ title, macros, accent, tag }) {
  return (
    <div className="iw-al-calc-panel" style={{ "--iw-al-accent": accent }}>
      <div className="iw-al-calc-panel-head">
        <span className="iw-al-calc-dot" aria-hidden="true" />
        <span className="iw-al-calc-panel-title">{title}</span>
      </div>
      <div className="iw-al-calc-cals">
        {macros.calories.toLocaleString()}
        <span className="iw-al-calc-cals-unit">cal</span>
      </div>
      <div className="iw-al-calc-rows">
        <div className="iw-al-calc-row"><span>protein</span><strong>{macros.protein}g</strong></div>
        <div className="iw-al-calc-row"><span>carbs</span><strong>{macros.carbs}g</strong></div>
        <div className="iw-al-calc-row"><span>fat</span><strong>{macros.fat}g</strong></div>
      </div>
      {tag && <div className="iw-al-calc-tag">{tag}</div>}
    </div>
  );
}

export default function EatingCalculator({ alpha, addXP, settings, onBack }) {
  const { state } = alpha;
  const [weight, setWeight] = useState(state.bodyWeight || 200);
  const [bf, setBf] = useState(state.bodyFat ?? 20);
  const [phaseId, setPhaseId] = useState(state.phase || "prime");
  const [week, setWeek] = useState(state.week || 1);

  const phase = PHASES[phaseId];
  const lbm = Math.round(leanBodyMass(weight, bf));
  const mult = maintenanceMultiplier(bf);
  const maint = maintenanceCalories(weight, bf);
  const train = dayMacros({ weightLb: weight, bodyFatPct: bf, phaseId, week, isWorkoutDay: true });
  const rest = dayMacros({ weightLb: weight, bodyFatPct: bf, phaseId, week, isWorkoutDay: false });

  const dirty = weight !== state.bodyWeight || bf !== state.bodyFat;
  const saveNumbers = () => {
    sfxCoin(settings);
    alpha.patchState({ bodyWeight: weight, bodyFat: bf });
    alpha.logEvent("measurement", { weightLb: weight, bodyFatPct: bf });
    addXP(5, "The scale is a witness — numbers updated");
  };

  return (
    <div className="iw-al-calc">
      {onBack && <button className="iw-back" onClick={onBack}>❮ back</button>}
      <div className="iw-eyebrow">turn the dials</div>
      <h2 className="iw-display iw-page-title">The Eating Equation</h2>

      <div className="iw-al-forge-steppers">
        <CalcStepper label="body weight (lbs)" value={weight} step={5} min={80} max={500} onChange={setWeight} />
        <CalcStepper label="body fat %" value={bf} step={1} min={4} max={60} onChange={setBf} suffix="%" />
      </div>

      <div className="iw-al-calc-phases">
        <span className="iw-eyebrow">phase</span>
        <div className="iw-al-fc-hours">
          {PHASE_ORDER.map((p) => (
            <button key={p} className={`iw-chip-btn ${phaseId === p ? "iw-chip-on" : ""}`}
              style={phaseId === p ? { borderColor: PHASES[p].accent, color: PHASES[p].accent } : undefined}
              onClick={() => setPhaseId(p)}>
              {PHASES[p].name}
            </button>
          ))}
        </div>
        {phaseId === "prime" && (
          <div className="iw-al-fc-hours" style={{ marginTop: 6 }}>
            {[1, 2, 3, 4].map((w) => (
              <button key={w} className={`iw-chip-btn ${week === w ? "iw-chip-on" : ""}`} onClick={() => setWeek(w)}>
                wk {w}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* LBM → maintenance strip */}
      <div className="iw-al-forge-preview">
        <div className="iw-al-forge-stat">
          <span className="iw-al-forge-num">{lbm}</span>
          <span className="iw-al-forge-label">lean body mass</span>
        </div>
        <div className="iw-al-forge-x" aria-hidden="true">×{mult}</div>
        <div className="iw-al-forge-stat">
          <span className="iw-al-forge-num">{maint.toLocaleString()}</span>
          <span className="iw-al-forge-label">maintenance cal</span>
        </div>
      </div>

      <div className="iw-al-calc-panels">
        <MacroPanel title="training day" macros={train} accent={phase.accent}
          tag={train.calories > maint ? `+${train.calories - maint} over the line — builder's plate` : `${maint - train.calories} under the line`} />
        <MacroPanel title="rest day" macros={rest} accent="#8a94a2"
          tag={`${maint - rest.calories} under the line — recovery runs the deficit`} />
      </div>

      {phaseId === "prime" && (
        <div className="iw-al-fastline">
          PRIME carbs are fixed tiers, not ratios — {PHASES.prime.eating.carbNotes[week - 1]}.
        </div>
      )}

      {dirty && (
        <button className="iw-btn-ember iw-btn-wide" onClick={saveNumbers}>
          ⚖ make these my numbers — update the sheet
        </button>
      )}

      <p className="iw-al-disclaimer">
        Game math from your campaign settings — a stat calculator,
        not medical or nutrition advice.
      </p>
    </div>
  );
}
