import React from "react";
import { useZoneCtx } from "../../../hooks/useZone.js";
import { getTodayKey } from "../../../lib/dates.js";
import { ZONE_ICONS } from "../../../lib/zoneFire.js";
import ZoneIcon from "../shared/ZoneIcon.jsx";

// Team momentum. Counts whoever shows up — never punishes who doesn't.
export default function SquadFireMeter({ go }) {
  const { squads } = useZoneCtx();
  const today = getTodayKey();

  if (!squads.length) {
    return (
      <div className="zn-card">
        <p className="zn-eyebrow">Squad fire</p>
        <p style={{ fontSize: 13.5, color: "var(--text-soft)", margin: "0 0 12px", lineHeight: 1.55 }}>
          Fires burn hotter together. Forge a squad or join one with a code.
        </p>
        <button type="button" className="zn-btn zn-btn--ghost" onClick={() => go("squad")}>
          <ZoneIcon src={ZONE_ICONS.shield} className="zn-btn__icon" />
          Find your squad
        </button>
      </div>
    );
  }

  return (
    <div className="zn-card">
      <p className="zn-eyebrow">Squad fire</p>
      {squads.map((s) => {
        const erupted = (s.last_eruption_at || "").slice(0, 10) === today;
        return (
          <button
            key={s.id}
            type="button"
            className={`zn-row${erupted ? " zn-erupting zn-row--accent" : ""}`}
            onClick={() => go("squad", s.id)}
            style={{ marginBottom: 8 }}
          >
            <div className="zn-row__thumb zn-row__thumb--art" aria-hidden="true">
              {s.emblem ? s.emblem : <ZoneIcon src={ZONE_ICONS.fire} />}
            </div>
            <div className="zn-row__body">
              <div className="zn-row__title">{s.name}</div>
              <div className="zn-meter" style={{ marginTop: 6 }}>
                <div className="zn-meter__fill" style={{ width: `${Math.min(100, s.fire_pct || 0)}%` }} />
              </div>
              <div className="zn-row__meta" style={{ marginTop: 4 }}>
                {erupted ? "Erupted today!" : `${s.proved_today || 0}/${s.member_count} proved today · ${s.fire_pct || 0}% fire this week`}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
