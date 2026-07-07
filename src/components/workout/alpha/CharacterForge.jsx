import React, { useState } from "react";
import { leanBodyMass, maintenanceCalories, maintenanceMultiplier } from "./engine/eatingEngine.js";
import { sfxImpact, sfxPlateClank } from "../../../lib/sfx.js";

/* ALPHA MODE — the Character Forge.
   Two honest numbers in, a character sheet out: lean body mass and
   the maintenance line every phase's eating equation is built on.
   The strike is the ritual — the scale is a witness, not a judge. */

function ForgeStepper({ label, value, step, min, max, onChange, suffix }) {
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

export default function CharacterForge({ onForge, settings }) {
  const [weight, setWeight] = useState(200);
  const [bf, setBf] = useState(20);
  const [striking, setStriking] = useState(false);

  const lbm = Math.round(leanBodyMass(weight, bf));
  const maint = maintenanceCalories(weight, bf);
  const mult = maintenanceMultiplier(bf);

  const strike = () => {
    if (striking) return;
    setStriking(true);
    sfxImpact(3, settings);
    try { if (navigator.vibrate) navigator.vibrate([30, 50, 30]); } catch { /* silent */ }
    setTimeout(() => {
      sfxPlateClank(settings);
      onForge({ bodyWeight: weight, bodyFat: bf });
    }, 950);
  };

  return (
    <div className={`iw-al-forge ${striking ? "iw-al-striking" : ""}`}>
      <div className="iw-eyebrow">the character forge</div>
      <h2 className="iw-display iw-page-title">Two honest numbers.</h2>
      <p className="iw-body iw-al-forge-sub">
        The scale is not a judge — it is a witness. Every equation in the
        campaign is built from these two dials. Estimate body fat if you
        must; honest-ish beats perfect.
      </p>

      <div className="iw-al-forge-steppers">
        <ForgeStepper label="body weight (lbs)" value={weight} step={5} min={80} max={500} onChange={setWeight} />
        <ForgeStepper label="body fat %" value={bf} step={1} min={4} max={60} onChange={setBf} suffix="%" />
      </div>

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

      <button className="iw-btn-ember iw-btn-wide" onClick={strike} disabled={striking}>
        🔨 strike the forge
      </button>

      {striking && <div className="iw-al-forge-flash" aria-hidden="true" />}
    </div>
  );
}
