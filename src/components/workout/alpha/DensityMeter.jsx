import React from "react";

/* ALPHA MODE — the live density meter (ADAPT).
   Volume climbing against the ghost of your last run. Beat it and
   the bar burns past the ghost line. */

export default function DensityMeter({ volume, ghostVolume, capacity, run }) {
  const max = Math.max(volume, ghostVolume || 0, 1) * 1.15;
  const pct = Math.min(100, (volume / max) * 100);
  const ghostPct = ghostVolume ? Math.min(100, (ghostVolume / max) * 100) : null;
  const beating = ghostVolume && volume > ghostVolume;
  return (
    <div className={`iw-al-density ${beating ? "iw-al-density-beating" : ""}`}>
      <div className="iw-al-card-head">
        <span className="iw-eyebrow">work capacity · run {run}</span>
        <span className="iw-al-density-num">{Math.round(volume).toLocaleString()} <span className="iw-al-density-unit">lbs</span></span>
      </div>
      <div className="iw-al-density-track">
        <div className="iw-al-density-fill" style={{ width: `${pct}%` }} />
        {ghostPct !== null && (
          <div className="iw-al-density-ghost" style={{ left: `${ghostPct}%` }}>
            <span className="iw-al-density-ghostlabel">run 1</span>
          </div>
        )}
      </div>
      <div className="iw-al-fastline">
        {capacity > 0 && `${capacity} lbs/min`}
        {beating && " · you're past your own ghost — keep going"}
      </div>
    </div>
  );
}
