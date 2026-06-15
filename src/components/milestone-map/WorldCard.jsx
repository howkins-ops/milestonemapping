import React from "react";
import { getMilestoneProgress } from "../../lib/progress.js";

// TODO Phase 2: Render this list on the right side of ProjectMap for quick access.

const STATUS_COLORS = {
  locked:      "rgba(234,251,255,0.25)",
  active:      "#00F0FF",
  in_progress: "#FFA500",
  completed:   "#00FFBF",
};

const STATUS_LABELS = {
  locked:      "Locked",
  active:      "Available",
  in_progress: "In Progress",
  completed:   "Completed",
};

export default function WorldCard({ milestone, index, onEnter }) {
  const status = milestone.status || "locked";
  const progress = getMilestoneProgress(milestone);
  const color = STATUS_COLORS[status] ?? STATUS_COLORS.locked;
  const canEnter = status !== "locked";

  return (
    <div
      className={`world-card world-card--${status}`}
      style={{
        background: "rgba(8,5,20,0.75)",
        border: `1px solid ${color}22`,
        borderRadius: 12,
        padding: "12px 14px",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        opacity: status === "locked" ? 0.55 : 1,
        transition: "opacity 0.3s ease",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", letterSpacing: "0.1em", textTransform: "uppercase", color }}>
          Milestone {index + 1} · {STATUS_LABELS[status]}
        </span>
        <span style={{ fontSize: 11, color: "rgba(234,251,255,0.4)", fontFamily: "var(--font-mono)" }}>
          {progress}%
        </span>
      </div>

      <p style={{ fontSize: 13, fontWeight: 600, color: "#fff", lineHeight: 1.4, margin: 0 }}>
        {milestone.title}
      </p>

      <div style={{ height: 3, borderRadius: 2, background: "rgba(234,251,255,0.1)", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${progress}%`, background: color, borderRadius: 2, transition: "width 0.4s ease" }} />
      </div>

      {canEnter && (
        <button
          type="button"
          onClick={() => onEnter(milestone.id)}
          style={{
            padding: "6px 12px", borderRadius: 8, fontSize: 11, fontWeight: 700,
            border: `1px solid ${color}44`, background: `${color}11`,
            color, cursor: "pointer", letterSpacing: "0.06em",
            fontFamily: "var(--font-mono)", textTransform: "uppercase",
          }}
        >
          Enter →
        </button>
      )}
    </div>
  );
}
