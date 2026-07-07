import React from "react";
import { JOURNEY } from "./data/journey.js";
import { PHASES } from "./data/phases.js";

/* ALPHA MODE — the World Map.
   Eleven Hero's Journey stages on a serpentine spine. Zone stages
   carry their phase accent and open the ZoneGate (or the zone hub
   once entered). Node states derive purely from alpha_state. */

export default function WorldMap({ alpha, onOpenGate, onOpenZone }) {
  const { state } = alpha;
  const zoneEntered = state.flags.zoneEntered || {};

  const nodeState = (s) => {
    if (s.n < state.stage) return "done";
    if (s.n === state.stage) return "here";
    return "locked";
  };

  const tapStage = (s) => {
    if (!s.zone) return;
    if (s.n > state.stage) return; // sealed
    if (zoneEntered[s.zone]) onOpenZone(s.zone);
    else onOpenGate(s.zone);
  };

  return (
    <div className="iw-al-map">
      <div className="iw-al-map-spine" aria-hidden="true" />
      {JOURNEY.map((s, i) => {
        const st = nodeState(s);
        const phase = s.zone ? PHASES[s.zone] : null;
        const side = i % 2 === 0 ? "left" : "right";
        const tappable = Boolean(s.zone) && s.n <= state.stage;
        return (
          <button key={s.n}
            className={`iw-al-mapnode iw-al-mapnode-${side} iw-al-mapnode-${st} ${tappable ? "iw-al-mapnode-tap" : ""}`}
            style={phase ? { "--iw-al-accent": phase.accent } : undefined}
            onClick={() => tapStage(s)}
            disabled={!tappable}
            aria-label={`Stage ${s.n}: ${s.title}`}>
            <span className="iw-al-mapnode-dot">
              {st === "done" ? "✓" : st === "locked" ? "" : s.n}
              {st === "locked" && <span className="iw-al-mapnode-bolt" aria-hidden="true" />}
            </span>
            <span className="iw-al-mapnode-text">
              <span className="iw-al-mapnode-title">{s.title}</span>
              {phase && (
                <span className="iw-al-mapnode-zone">
                  {phase.name}
                  {zoneEntered[s.zone] ? " · open" : s.n <= state.stage ? " · at the gate" : " · sealed"}
                </span>
              )}
              {st === "here" && <span className="iw-al-mapnode-blurb">{s.blurb}</span>}
            </span>
          </button>
        );
      })}
    </div>
  );
}
