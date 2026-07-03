import React from "react";
import { useZoneCtx } from "../../../hooks/useZone.js";
import SquadHome from "./SquadHome.jsx";
import SquadCreateJoin from "./SquadCreateJoin.jsx";
import ZoneEmpty from "../shared/ZoneEmpty.jsx";

// Squad hub: list my squads (→ SquadHome), forge a new one, or join by code.
export default function SquadPanel({ go, squadId }) {
  const { squads } = useZoneCtx();

  if (squadId) {
    return (
      <div>
        <button type="button" className="zn-back" onClick={() => go("squad", null)}>
          ← All squads
        </button>
        <SquadHome squadId={squadId} go={go} />
      </div>
    );
  }

  return (
    <div className="zn-stagger">
      {squads.length === 0 ? (
        <ZoneEmpty which="squad" icon="🛡️" />
      ) : (
        <div className="zn-card">
          <p className="zn-eyebrow">Your squads</p>
          {squads.map((s) => (
            <button key={s.id} type="button" className="zn-row" onClick={() => go("squad", s.id)}>
              <div className="zn-row__thumb" aria-hidden="true">{s.emblem || "🔥"}</div>
              <div className="zn-row__body">
                <div className="zn-row__title">{s.name}</div>
                <div className="zn-meter" style={{ marginTop: 6 }}>
                  <div
                    className="zn-meter__fill"
                    style={{ width: `${Math.min(100, s.fire_pct || 0)}%` }}
                  />
                </div>
                <div className="zn-row__meta" style={{ marginTop: 4 }}>
                  {s.member_count} member{s.member_count === 1 ? "" : "s"} · {s.fire_pct || 0}% fire this week
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
      <SquadCreateJoin />
    </div>
  );
}
