import React, { useState } from "react";

// Extracted from ResourcesPanel in BottomActionBar.
// Phase 3: Replace ResourcesPanel there with this component.
export default function NotesPanel({ milestone, onUpdateNotes }) {
  const [notes, setNotes] = useState(milestone.notes || "");
  const [saved, setSaved] = useState(true);

  const handleChange = (e) => {
    setNotes(e.target.value);
    setSaved(false);
  };

  const handleBlur = () => {
    onUpdateNotes(notes);
    setSaved(true);
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <p style={{
          fontSize: 10, fontFamily: "var(--font-mono)", letterSpacing: "0.1em",
          textTransform: "uppercase", color: "rgba(0,240,255,0.6)",
        }}>
          NOTES & RESOURCES
        </p>
        {!saved && <span style={{ fontSize: 10, color: "rgba(250,204,21,0.7)" }}>Unsaved…</span>}
        {saved && notes && <span style={{ fontSize: 10, color: "rgba(0,255,191,0.6)" }}>✓ Saved</span>}
      </div>
      <textarea
        value={notes}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="Add notes, links, resources, or reflections…"
        rows={4}
        style={{
          width: "100%", background: "rgba(0,240,255,0.04)",
          border: "1px solid rgba(0,240,255,0.18)", borderRadius: 10,
          padding: "10px 12px", fontSize: 13, color: "#fff",
          resize: "vertical", outline: "none", fontFamily: "inherit",
          lineHeight: 1.6, boxSizing: "border-box",
        }}
      />
    </div>
  );
}
