import React from "react";
import { useZoneCtx } from "../../../hooks/useZone.js";

// Radial: ring = fire (proof-days in trailing 7), center = current streak.
export default function FireDial() {
  const { member, fire, fireDays } = useZoneCtx();
  const pct = Math.min(1, fireDays / 7);
  const R = 62;
  const C = 2 * Math.PI * R;

  return (
    <div className="zn-dial" role="img" aria-label={`${member.zone_streak} day streak, fire level ${fire.label}`}>
      <svg width="148" height="148" viewBox="0 0 148 148">
        <circle cx="74" cy="74" r={R} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="9" />
        <circle
          cx="74"
          cy="74"
          r={R}
          fill="none"
          stroke="var(--zfire)"
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={C * (1 - pct)}
          transform="rotate(-90 74 74)"
          style={{ filter: "drop-shadow(0 0 6px var(--zfire-glow))", transition: "stroke-dashoffset 800ms var(--ease-out)" }}
        />
      </svg>
      <div className="zn-dial__center">
        <div className="zn-dial__num">{member.zone_streak}</div>
        <div className="zn-dial__label">day streak</div>
        <div style={{ fontSize: 11, color: "var(--text-soft)", marginTop: 2 }}>{fireDays}/7 fire days</div>
      </div>
    </div>
  );
}
