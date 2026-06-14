import React, { useState } from "react";

const ALL_VALUES = [
  "Honesty", "Discipline", "Freedom", "Family",
  "Growth", "Health", "Integrity", "Excellence",
  "Creativity", "Service", "Courage", "Faith",
  "Loyalty", "Purpose", "Impact", "Wisdom",
  "Wealth", "Respect", "Balance", "Love"
];

const MAX_SELECT = 3;

export default function ValuesGame({ module, onComplete }) {
  const [selected, setSelected] = useState([]);

  const toggle = (v) => {
    setSelected(prev => {
      if (prev.includes(v)) return prev.filter(x => x !== v);
      if (prev.length >= MAX_SELECT) return prev;
      return [...prev, v];
    });
  };

  const handleSubmit = () => {
    onComplete({ values: selected });
  };

  return (
    <div className="game-overlay">
      <div className="game-inner">
        <div className="game-header">
          <div className="game-title-block">
            <div className="game-kicker" style={{ color: module.color }}>
              {module.label} · Values Builder
            </div>
            <h2 className="game-title">Build Your Foundation</h2>
          </div>
        </div>

        <div className="game-body">
          <p className="game-subtitle">
            Choose exactly 3 core values. These are your non-negotiables — the pillars everything else is built on.
          </p>

          {/* Counter */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 20
          }}>
            {[0, 1, 2].map(i => (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: 4,
                  borderRadius: 2,
                  background: i < selected.length ? module.color : "rgba(255,255,255,0.1)",
                  transition: "background 0.3s",
                  boxShadow: i < selected.length ? `0 0 8px ${module.color}80` : "none"
                }}
              />
            ))}
            <span style={{
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              color: "rgba(234,251,255,0.5)",
              whiteSpace: "nowrap"
            }}>
              {selected.length} / {MAX_SELECT}
            </span>
          </div>

          <div className="choice-grid">
            {ALL_VALUES.map(v => {
              const isSelected = selected.includes(v);
              const isDisabled = !isSelected && selected.length >= MAX_SELECT;
              return (
                <button
                  key={v}
                  className={`choice-chip${isSelected ? " selected" : ""}`}
                  style={{
                    ...(isSelected ? { color: module.color, borderColor: module.color, background: `${module.color}18` } : {}),
                    ...(isDisabled ? { opacity: 0.3, cursor: "default" } : {})
                  }}
                  onClick={() => !isDisabled && toggle(v)}
                >
                  {v}
                </button>
              );
            })}
          </div>

          {/* Selected preview */}
          {selected.length === MAX_SELECT && (
            <div style={{
              marginTop: 28,
              padding: "18px 20px",
              borderRadius: 14,
              background: `${module.color}0c`,
              border: `1px solid ${module.color}33`,
              animation: "scale-pop 0.4s cubic-bezier(0.16,1,0.3,1) both"
            }}>
              <div style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: module.color,
                marginBottom: 10
              }}>
                Your Foundation
              </div>
              <div style={{ display: "flex", gap: 12, alignItems: "center", justifyContent: "center" }}>
                {selected.map((v, i) => (
                  <React.Fragment key={v}>
                    {i > 0 && <span style={{ color: "rgba(234,251,255,0.2)", fontSize: 18 }}>·</span>}
                    <span style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 800,
                      fontSize: 16,
                      color: "#eafbff",
                      textShadow: `0 0 20px ${module.color}60`
                    }}>
                      {v}
                    </span>
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}
        </div>

        <button
          className="game-cta"
          disabled={selected.length < MAX_SELECT}
          onClick={handleSubmit}
          style={{
            background: selected.length === MAX_SELECT ? module.color : "rgba(255,255,255,0.06)",
            color: selected.length === MAX_SELECT ? "#000" : "rgba(234,251,255,0.3)"
          }}
        >
          Set My Foundation →
        </button>
      </div>
    </div>
  );
}
