import React, { useState } from "react";
import { useDailyLog } from "../../hooks/useDailyLog.js";
import DailyCommitPanel from "./DailyCommitPanel.jsx";
import MakeAStandPanel from "./MakeAStandPanel.jsx";
import NightTopFivePanel from "./NightTopFivePanel.jsx";

const STEPS = [
  { label: "Commit", color: "#00F0FF", tip: "One bold commitment gives tomorrow direction." },
  { label: "Stand",  color: "#FF3EDB", tip: "Your identity declaration programs your actions." },
  { label: "Top 5",  color: "#D11EFF", tip: "Five targets. Execute them tomorrow morning." },
];

function getInitialStep(log) {
  if (!log.dailyCommit) return 0;
  if (!log.dailyStand)  return 1;
  return 2;
}

export default function NightWizard() {
  const { tomorrowLog } = useDailyLog();

  const isAllLoaded =
    !!tomorrowLog.dailyCommit &&
    !!tomorrowLog.dailyStand &&
    (tomorrowLog.topFive || []).length >= 5;

  const [step, setStep] = useState(() => getInitialStep(tomorrowLog));
  const [done, setDone] = useState(isAllLoaded);

  const advance = () => {
    if (step < 2) setStep((s) => s + 1);
    else setDone(true);
  };

  if (done) {
    return (
      <div className="night-wizard-done anim-fade-in">
        <div className="night-wizard-done-glow" />
        <div className="night-wizard-done-icon">⚡</div>
        <h3 className="night-wizard-done-title">Locked &amp; Loaded.</h3>
        <p className="night-wizard-done-sub">
          Tomorrow has a target. Go to sleep — you execute in the morning.
        </p>
        <div className="night-wizard-done-pills">
          <div className="night-wizard-done-pill night-wizard-done-pill--cyan">
            <span className="night-wizard-done-pill-check">✓</span>
            <span>Commitment set</span>
          </div>
          <div className="night-wizard-done-pill night-wizard-done-pill--pink">
            <span className="night-wizard-done-pill-check">✓</span>
            <span>Stand declared</span>
          </div>
          <div className="night-wizard-done-pill night-wizard-done-pill--purple">
            <span className="night-wizard-done-pill-check">✓</span>
            <span>Top 5 loaded</span>
          </div>
        </div>
        <button
          className="night-wizard-done-edit"
          onClick={() => { setStep(0); setDone(false); }}
        >
          Edit plan
        </button>
      </div>
    );
  }

  const activeStep = STEPS[step];

  return (
    <div className="night-wizard anim-fade-in">
      {/* Step indicator */}
      <div className="night-wizard-steps">
        <div className="night-wizard-track">
          <div
            className="night-wizard-track-fill"
            style={{ width: `${(step / (STEPS.length - 1)) * 100}%` }}
          />
        </div>
        {STEPS.map((s, i) => (
          <button
            key={s.label}
            type="button"
            className={`night-wizard-dot ${i === step ? "is-current" : i < step ? "is-done" : "is-future"}`}
            style={i <= step ? { "--dot-color": s.color } : {}}
            onClick={() => i < step && setStep(i)}
            aria-label={`Step ${i + 1}: ${s.label}`}
          >
            <span className="night-wizard-dot-inner">
              {i < step ? "✓" : i + 1}
            </span>
            <span className="night-wizard-dot-label">{s.label}</span>
          </button>
        ))}
      </div>

      {/* Step tip */}
      <p className="night-wizard-tip">{activeStep.tip}</p>

      {/* Active panel */}
      <div className="night-wizard-panel">
        {step === 0 && <DailyCommitPanel onLocked={advance} />}
        {step === 1 && <MakeAStandPanel  onLocked={advance} />}
        {step === 2 && <NightTopFivePanel onLocked={advance} />}
      </div>
    </div>
  );
}
