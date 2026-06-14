import React, { useState } from "react";

const CHALLENGES = [
  "Can't stay consistent",
  "Know what to do, don't do it",
  "Start strong, fade out",
  "All-or-nothing thinking",
  "Self-doubt blocks action",
  "Overthinking, underdelivering",
  "Living below my potential",
  "Old patterns keep returning"
];

export default function IntroGame({ module, onComplete }) {
  const [selected, setSelected] = useState(new Set());

  const toggle = (c) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(c)) next.delete(c);
      else next.add(c);
      return next;
    });
  };

  const handleSubmit = () => {
    onComplete({ challenges: Array.from(selected) });
  };

  return (
    <div className="game-overlay">
      <div className="game-inner">
        <div className="game-header">
          <div className="game-title-block">
            <div className="game-kicker" style={{ color: module.color }}>
              {module.label} · Challenge Scan
            </div>
            <h2 className="game-title">Identify Your Shifts</h2>
          </div>
        </div>

        <div className="game-body">
          <p className="game-subtitle">
            Tap everything that sounds like you. Be honest — this is just for you.
          </p>

          <div className="choice-grid">
            {CHALLENGES.map(c => (
              <button
                key={c}
                className={`choice-chip${selected.has(c) ? " selected" : ""}`}
                style={selected.has(c) ? { color: module.color, borderColor: module.color, background: `${module.color}18` } : {}}
                onClick={() => toggle(c)}
              >
                {selected.has(c) ? "✓ " : ""}{c}
              </button>
            ))}
          </div>

          {selected.size > 0 && (
            <div style={{
              marginTop: 28,
              padding: "14px 16px",
              borderRadius: 12,
              background: `${module.color}0f`,
              border: `1px solid ${module.color}33`,
              animation: "slide-up 0.4s cubic-bezier(0.16,1,0.3,1) both"
            }}>
              <p style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: 14,
                color: module.color,
                margin: 0
              }}>
                {selected.size} pattern{selected.size > 1 ? "s" : ""} identified.
              </p>
              <p style={{ fontSize: 13, color: "rgba(234,251,255,0.55)", margin: "4px 0 0", lineHeight: 1.5 }}>
                You're about to shift all of them.
              </p>
            </div>
          )}
        </div>

        <button
          className="game-cta"
          disabled={selected.size === 0}
          onClick={handleSubmit}
          style={{
            background: selected.size > 0 ? module.color : "rgba(255,255,255,0.06)",
            color: selected.size > 0 ? "#000" : "rgba(234,251,255,0.3)"
          }}
        >
          These Are My Shifts →
        </button>
      </div>
    </div>
  );
}
