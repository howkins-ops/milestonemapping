import React from "react";
import "../../styles/cityDistricts.css";

// ════════════════════════════════════════════════════════════════════════
// MAPQUEST CITY — District card
// Compact grid card: glyph medallion, name, live progress ring, streak
// flame. Glow state mirrors the building in the skyline above.
// ════════════════════════════════════════════════════════════════════════

const RING_R = 15.5;
const RING_C = 2 * Math.PI * RING_R;

export default function DistrictCard({ district, onOpen }) {
  const d = district || {};
  const progress = d.progress || { value: 0, label: "", detail: "", streak: 0 };
  const pct = Math.max(0, Math.min(1, Number(progress.value) || 0));
  const dash = `${(pct * RING_C).toFixed(1)} ${RING_C.toFixed(1)}`;

  return (
    <button
      type="button"
      className={`mqc-d-card is-${d.glowState || "dim"}${d.locked ? " is-locked" : ""}`}
      style={{ "--d-color": d.color, "--d-glow": d.glow }}
      onClick={() => onOpen && onOpen(d)}
      aria-label={`${d.name} — ${d.locked ? "powered down" : progress.label || "no progress yet"}`}
    >
      <span className="mqc-d-card__medal" aria-hidden="true">
        <svg className="mqc-d-card__ring" viewBox="0 0 36 36" width="42" height="42">
          <circle
            cx="18" cy="18" r={RING_R}
            fill="none"
            stroke="rgba(242,240,244,0.12)"
            strokeWidth="2"
          />
          <circle
            cx="18" cy="18" r={RING_R}
            fill="none"
            stroke={d.color}
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeDasharray={dash}
            transform="rotate(-90 18 18)"
          />
        </svg>
        <span className="mqc-d-card__glyph">{d.icon}</span>
      </span>

      <span className="mqc-d-card__txt">
        <span className="mqc-d-card__name">{d.name}</span>
        <span className="mqc-d-card__sub">{progress.label || d.sublabel}</span>
      </span>

      {d.locked ? (
        <span className="mqc-d-card__lock" aria-hidden="true">⏻</span>
      ) : progress.streak > 0 ? (
        <span className="mqc-d-card__streak" aria-label={`${progress.streak} streak`}>
          🔥{progress.streak}
        </span>
      ) : null}
    </button>
  );
}
