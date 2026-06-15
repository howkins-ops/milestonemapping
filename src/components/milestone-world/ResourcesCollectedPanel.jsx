import React from "react";
import { getMilestoneProgress } from "../../lib/progress.js";

// Shows XP earned and action completion stats for this milestone.
// TODO Phase 2: Wire into the right-side column of MilestoneWorld.
export default function ResourcesCollectedPanel({ milestone }) {
  const actions = milestone.actions || [];
  const done = actions.filter((a) => a.done).length;
  const progress = getMilestoneProgress(milestone);
  const xp = done * 50;

  return (
    <div className="rpg-card" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <p style={{
        fontSize: 10, fontFamily: "var(--font-mono)", letterSpacing: "0.1em",
        textTransform: "uppercase", color: "rgba(0,240,255,0.6)",
      }}>
        RESOURCES COLLECTED
      </p>

      <div style={{ display: "flex", gap: 12 }}>
        <div style={{ flex: 1, textAlign: "center" }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#00F0FF", fontFamily: "var(--font-mono)" }}>
            {xp}
          </div>
          <div style={{ fontSize: 10, color: "rgba(234,251,255,0.4)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            XP Earned
          </div>
        </div>
        <div style={{ flex: 1, textAlign: "center" }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#7B2CFF", fontFamily: "var(--font-mono)" }}>
            {done}/{actions.length}
          </div>
          <div style={{ fontSize: 10, color: "rgba(234,251,255,0.4)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Steps Done
          </div>
        </div>
        <div style={{ flex: 1, textAlign: "center" }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#D11EFF", fontFamily: "var(--font-mono)" }}>
            {progress}%
          </div>
          <div style={{ fontSize: 10, color: "rgba(234,251,255,0.4)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Progress
          </div>
        </div>
      </div>
    </div>
  );
}
