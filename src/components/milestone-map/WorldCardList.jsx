import React from "react";
import WorldCard from "./WorldCard.jsx";

// TODO Phase 2: Drop this into ProjectMap as a right-side milestone quick-select panel.

export default function WorldCardList({ milestones, onEnter }) {
  if (!milestones || milestones.length === 0) return null;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {milestones.map((milestone, index) => (
        <WorldCard key={milestone.id} milestone={milestone} index={index} onEnter={onEnter} />
      ))}
    </div>
  );
}
