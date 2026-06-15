import React from "react";

// Shows milestone context, why it matters, and the parent project goal.
// Extracted from MindMapPanel in BottomActionBar — Phase 3: replace it there.
export default function CurrentObjectivePanel({ milestone, project }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <p style={{
        fontSize: 10, fontFamily: "var(--font-mono)", letterSpacing: "0.1em",
        textTransform: "uppercase", color: "rgba(0,240,255,0.6)", marginBottom: 4,
      }}>
        MILESTONE CONTEXT
      </p>
      <p style={{ fontSize: 13.5, color: "rgba(234,251,255,0.85)", lineHeight: 1.6 }}>
        {milestone.description || milestone.title}
      </p>

      {milestone.whyItMatters && (
        <div style={{
          padding: "10px 14px", borderRadius: 10,
          background: "rgba(250,204,21,0.06)", border: "1px solid rgba(250,204,21,0.18)",
        }}>
          <p style={{
            fontSize: 10, fontFamily: "var(--font-mono)", letterSpacing: "0.1em",
            textTransform: "uppercase", color: "rgba(250,204,21,0.6)", marginBottom: 4,
          }}>
            WHY IT MATTERS
          </p>
          <p style={{ fontSize: 13, color: "rgba(234,251,255,0.75)", lineHeight: 1.5 }}>
            {milestone.whyItMatters}
          </p>
        </div>
      )}

      {project && (
        <div style={{
          padding: "10px 14px", borderRadius: 10,
          background: "rgba(0,240,255,0.04)", border: "1px solid rgba(0,240,255,0.12)",
        }}>
          <p style={{
            fontSize: 10, fontFamily: "var(--font-mono)", letterSpacing: "0.1em",
            textTransform: "uppercase", color: "rgba(0,240,255,0.5)", marginBottom: 4,
          }}>
            PROJECT GOAL
          </p>
          <p style={{ fontSize: 13, color: "rgba(234,251,255,0.7)", lineHeight: 1.5 }}>
            {project.futureVision || project.title}
          </p>
        </div>
      )}
    </div>
  );
}
