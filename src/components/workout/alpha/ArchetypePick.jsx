import React from "react";
import { ARCHETYPES } from "./data/journey.js";
import { sfxChalkPoof } from "../../../lib/sfx.js";

/* ALPHA MODE — choose your adventure (Crossing step).
   Three ways men arrive at the Iron. Flavor + Mentor tone, stored
   on alpha_state. No wrong door. */

export default function ArchetypePick({ onPick, settings }) {
  return (
    <div className="iw-al-arch">
      <div className="iw-eyebrow">choose your adventure</div>
      <h2 className="iw-display iw-page-title">Which one walked in?</h2>
      <p className="iw-body iw-al-forge-sub">
        There's no wrong door — the campaign is the same iron. The Mentor
        just needs to know how to talk to you.
      </p>
      <div className="iw-stack">
        {ARCHETYPES.map((a, i) => (
          <button key={a.id} className="iw-al-arch-card iw-drop-in"
            style={{ animationDelay: `${i * 140}ms` }}
            onClick={() => { sfxChalkPoof(settings); onPick(a.id); }}>
            <span className="iw-al-arch-name">{a.name}</span>
            <span className="iw-al-arch-line">{a.line}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
